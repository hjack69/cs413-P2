/**
 * Created by jack on 5/19/16.
 */

const WIDTH = 1000;
const HEIGHT = 600;
const FPS = 60;
const BGCOLOR = 0x639bff;

function randint(min, max) {
    return Math.floor(Math.random() * max) + min;
}
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
        randomIndex = randint(0, currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

// Main graphics variables
var gameport = document.getElementById("gameport");
var renderer = PIXI.autoDetectRenderer(WIDTH, HEIGHT, {backgroundColor: BGCOLOR});
gameport.appendChild(renderer.view);

// main container
var stage = new PIXI.Container();
stage.backgroundColor = BGCOLOR;

// title screen container
var titleScreen = new PIXI.Container();
titleScreen.width = 1000;
titleScreen.height = 600;
//titleScreen.anchor(0, 0);
titleScreen.position.set(0, 0);
titleScreen.visible = true;
stage.addChild(titleScreen);
var titleSprite = null;
var titlePlayButton = null;

// credits screen container
var creditsScreen = new PIXI.Container();
creditsScreen.width = 1000;
creditsScreen.height = 600;
creditsScreen.visible = false;
creditsScreen.backgroundColor = BGCOLOR;
stage.addChild(creditsScreen);

// instructions screen container
var instructionsScreen = new PIXI.Container();
instructionsScreen.width = 1000;
instructionsScreen.height = 600;
instructionsScreen.visible = false;
instructionsScreen.backgroundColor = BGCOLOR;
stage.addChild(instructionsScreen);

// end screen container
var endScreen = new PIXI.Container();
endScreen.width = 1000;
endScreen.height = 600;
endScreen.visible = false;
endScreen.backgroundColor = BGCOLOR;
stage.addChild(endScreen);
var endText = new PIXI.Text("You Lost! Try again?");

// menu screen container
var menuScreen = new PIXI.Container();
menuScreen.width = 1000;
menuScreen.height = 600;
menuScreen.visible = false;
menuScreen.backgroundColor = BGCOLOR;
stage.addChild(menuScreen);

// game screen container
var gameScreen = new PIXI.Container();
gameScreen.visible = false;
gameScreen.width = 1000;
gameScreen.height = 600;
gameScreen.backgroundColor = BGCOLOR;
stage.addChild(gameScreen);

var timer = 120000; // one minute
var timerGoing = false;
var timerText = new PIXI.Text("Time left: "+ timer/1000+ " seconds");
timerText.anchor.set(0.5, 0.5);
timerText.position.set(WIDTH/2, 20);

PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;
PIXI.loader.add("assets.json").add("MatchFail.mp3").add("MatchSucceed.mp3").load(setup);

var yesSound = null;
var noSound = null;

function Card(master,  x, y, selectionCallback, pattern) {
    this.master = master;
    this.container = new PIXI.Container();
    this.master.addChild(this.container);
    this.selectionCallback = selectionCallback;
    this.pattern = pattern || randint(1, 6);
    this.position = new PIXI.Point(x, y);

    this.backMovie = new PIXI.extras.MovieClip.fromFrames(["cards5.png",
        "cards6.png", "cards7.png", "cards8.png"]);
    this.backMovie.visible = false;
    this.backMovie.anchor.set(0.5, 0.5);
    this.backMovie.position = this.position;
    this.container.addChild(this.backMovie);

    this.frontStill = new PIXI.Sprite(PIXI.Texture.fromFrame("cards"+(this.pattern+8)+".png"));
    this.frontStill.visible = false;
    this.frontStill.anchor.set(0.5, 0.5);
    this.frontStill.position = this.position;
    this.container.addChild(this.frontStill);

    this.backStill = new PIXI.Sprite(PIXI.Texture.fromFrame("cards1.png"));
    this.backStill.visible = true;
    this.backStill.interactive = true;
    this.backStill.anchor.set(0.5, 0.5);
    this.backStill.position = this.position;
    this.container.addChild(this.backStill);

    this.completedAnimation = function() {
        this.backMovie.visible = false;
        this.frontStill.visible = true;
        this.selectionCallback(this);
    };
    this.selected = function() {
        this.backStill.visible = false;
        this.backMovie.visible = true;
        this.frontStill.visible = false;

        this.backMovie.loop = false;
        this.backMovie.animationSpeed = 0.1;
        var self = this;
        this.backMovie.onComplete = function() {self.completedAnimation();};
        this.backMovie.play();
    };
    this.reset = function() {
        var self = this;
        setTimeout(function() {
            self.backStill.visible = true;
            self.backMovie.visible = false;
            self.backMovie.gotoAndStop(0);
            self.frontStill.visible = false;
        }, 1000);
    };
    this.destroy = function() {
        var self = this;
        setTimeout(function() {
            self.frontStill.interactive = false;
            self.master.removeChild(self.container);
        }, 1000);
    };
    var self = this;
    this.backStill.on("mousedown", function() {self.selected()});
}

var cards = [];

function setup() {
    yesSound = PIXI.audioManager.getAudio("MatchSucceed.mp3");
    noSound = PIXI.audioManager.getAudio("MatchFail.mp3");

    titleSprite = new PIXI.Sprite(PIXI.Texture.fromFrame("welcome.png"));
    titleScreen.addChild(titleSprite);
    titlePlayButton = new PIXI.Sprite(PIXI.Texture.fromFrame("buttons4.png"));
    titlePlayButton.anchor.set(0.5, 0.5);
    titlePlayButton.position.set(WIDTH/2, HEIGHT-50);
    titlePlayButton.interactive = true;
    titlePlayButton.on('mousedown', startGame);
    titleScreen.addChild(titlePlayButton);

    gameScreen.addChild(new PIXI.Sprite(PIXI.Texture.fromFrame("background.png")));
    var t = new PIXI.Text("MENU");
    t.anchor.set(0.5, 0.5);
    t.position.set(10+t.width/2, 50);
    t.interactive = true;
    t.on("mousedown", showMenu);
    gameScreen.addChild(t);
    gameScreen.addChild(timerText);

    creditsScreen.addChild(new PIXI.Sprite(PIXI.Texture.fromFrame("background.png")));
    var creditsTexts = [
        new PIXI.Text("This game is a work of fiction. Any resemblance to actual people\n"),
        new PIXI.Text("or shapes is purely coincidental.\n"),
        new PIXI.Text("Shape Coordinator: Bob Bobson"),
        new PIXI.Text("Shape Shaper: Fred Fredson"),
        new PIXI.Text("Shape Translator: Job Jobson"),
        new PIXI.Text("Shape Testers: Jake Jakeson, Jordan Jordanson"),
        new PIXI.Text("Shape Grippers: Frank Frankson, Sally Sallyson, Barb Barbson"),
        new PIXI.Text("Shape Shifters: Greg Gregson, Mary Maryson")
    ];
    for (var i = 0; i < creditsTexts.length; i++) {
        creditsTexts[i].anchor.set(0.5, 0.5);
        creditsTexts[i].position.set(WIDTH/2, 50+(30*i));
        creditsScreen.addChild(creditsTexts[i]);
    }
    var creditsBackButton = new PIXI.Sprite(PIXI.Texture.fromFrame("buttons5.png"));
    creditsBackButton.anchor.set(0.5, 0.5);
    creditsBackButton.position.set(WIDTH/2, HEIGHT-50);
    creditsBackButton.interactive = true;
    creditsBackButton.on("mousedown", showMenu);
    creditsScreen.addChild(creditsBackButton);

    menuScreen.addChild(new PIXI.Sprite(PIXI.Texture.fromFrame("background.png")));
    var instructionsButton = new PIXI.Sprite.fromFrame("buttons1.png");
    instructionsButton.anchor.set(0.5, 0.5);
    instructionsButton.position.set(WIDTH/2, 100);
    instructionsButton.interactive = true;
    instructionsButton.on("mousedown", showInstructions);
    menuScreen.addChild(instructionsButton);
    var creditsButton = new PIXI.Sprite.fromFrame("buttons2.png");
    creditsButton.anchor.set(0.5, 0.5);
    creditsButton.position.set(WIDTH/2, HEIGHT/2);
    creditsButton.interactive = true;
    creditsButton.on("mousedown", showCredits);
    menuScreen.addChild(creditsButton);
    var resumeButton = new PIXI.Sprite.fromFrame("buttons3.png");
    resumeButton.anchor.set(0.5, 0.5);
    resumeButton.position.set(WIDTH/2, HEIGHT-100);
    resumeButton.interactive = true;
    resumeButton.on("mousedown", resumeGame);
    menuScreen.addChild(resumeButton);
    menuScreen.interactive = false;

    endScreen.addChild(new PIXI.Sprite(PIXI.Texture.fromFrame("background.png")));
    var endPlayButton = new PIXI.Sprite(PIXI.Texture.fromFrame("buttons4.png"));
    endPlayButton.anchor.set(0.5, 0.5);
    endPlayButton.position.set(WIDTH/2, HEIGHT-50);
    endPlayButton.interactive = true;
    endPlayButton.on("mousedown", startGame);
    endScreen.addChild(endPlayButton);
    endText.anchor.set(0.5, 0.5);
    endText.position.set(WIDTH/2, HEIGHT/2);
    endScreen.addChild(endText);

    instructionsScreen.addChild(new PIXI.Sprite(PIXI.Texture.fromFrame("background.png")));
    var instructionsTexts = [
        new PIXI.Text("Click on a card to flip it over."),
        new PIXI.Text("Find it's match to delete both cards."),
        new PIXI.Text("To win, find all the matches within 2 minutes")
    ];
    for (i=0; i < instructionsTexts.length; i++) {
        instructionsTexts[i].anchor.set(0.5, 0.5);
        instructionsTexts[i].position.set(WIDTH/2, 100+(50*i));
        instructionsScreen.addChild(instructionsTexts[i]);
    }
    var instructionsBackButton = new PIXI.Sprite(PIXI.Texture.fromFrame("buttons5.png"));
    instructionsBackButton.anchor.set(0.5, 0.5);
    instructionsBackButton.position.set(WIDTH/2, HEIGHT-100);
    instructionsBackButton.interactive = true;
    instructionsBackButton.on("mousedown", showMenu);
    instructionsScreen.addChild(instructionsBackButton);
}

var selected = [];

function newSelection(card) {
    selected.push(card);
    if (selected.length == 2) {
        if (selected[0].pattern != selected[1].pattern) {
            selected[0].reset();
            selected[1].reset();
            noSound.play();
        }
        else {
            selected[0].destroy();
            selected[1].destroy();
            var ind1 = cards.indexOf(selected[0]);
            var ind2 = cards.indexOf(selected[1]);
            cards.splice(ind1, 1);
            cards.splice(ind2, 1);
            yesSound.play();
        }
        selected = [];
    }
    if (!timerGoing) {
        timerGoing = true;
        setTimeout(count, 1000);
    }
}

function count() {
    timer -= 1000;
    timerText.text = "Time left: " + timer / 1000 + " seconds";
    if (cards.length == 0) {
        lose();
    }
    else if ((timer <= 0 && cards.length > 0)) {
        lose();
    }
    if (timerGoing) {
        setTimeout(count, 1000);
    }
}

function startGame() {
    titleScreen.visible = false;
    titlePlayButton.interactive = false;
    creditsScreen.visible = false;
    instructionsScreen.visible = false;
    endScreen.visible = false;
    menuScreen.visible = false;
    gameScreen.visible = true;
    gameScreen.width = 1000;
    gameScreen.height = 600;
    gameScreen.position.set(1000, 0);
    cards = [];
    timer = 120000;
    timerText.text = "Time left: " + timer / 1000 + " seconds";
    newBoard();
    createjs.Tween.get(gameScreen.position).to({x: 0, y: 0}, 1000);
}

function lose() {
    if (cards.length == 0) {
        endText.text = "You win! Play again?";
    }
    else {
        endText.text = "You lose! Play again?";
    }
    timerGoing = false;
    titleScreen.visible = false;
    creditsScreen.visible = false;
    instructionsScreen.visible = false;
    endScreen.position.set(0, -600);
    endScreen.visible = true;
    menuScreen.visible = false;
    menuScreen.interactive = false;
    gameScreen.visible = false;
    gameScreen.interactive = false;
    createjs.Tween.get(endScreen.position).to({x: 0, y:0}, 1000, createjs.Ease.bounceOut());
}

function showMenu() {
    timerGoing = false;
    titleScreen.visible = false;
    creditsScreen.visible = false;
    instructionsScreen.visible = false;
    endScreen.visible = false;
    gameScreen.position.set(-1000, 0);
    menuScreen.visible = true;
    menuScreen.interactive = true;
    gameScreen.visible = false;
    gameScreen.interactive = false;
    createjs.Tween.get(endScreen.position).to({x:0, y:0}, 1000);
}

function showInstructions() {
    timerGoing = false;
    titleScreen.visible = false;
    creditsScreen.visible = false;
    instructionsScreen.visible = true;
    endScreen.visible = false;
    menuScreen.visible = false;
    menuScreen.interactive = false;
    gameScreen.visible = false;
    gameScreen.interactive = false;
}

function showCredits() {
    timerGoing = false;
    titleScreen.visible = false;
    creditsScreen.visible = true;
    instructionsScreen.visible = false;
    endScreen.visible = false;
    menuScreen.visible = false;
    menuScreen.interactive = false;
    gameScreen.visible = false;
    gameScreen.interactive = false;
}

function resumeGame() {
    timerGoing = false;
    titleScreen.visible = false;
    creditsScreen.visible = false;
    instructionsScreen.visible = false;
    endScreen.visible = false;
    menuScreen.visible = false;
    menuScreen.interactive = false;
    gameScreen.visible = true;
    gameScreen.interactive = true;
    timerGoing = true;
    count();
}

function newBoard() {
    var prev = [];
    for (var i=0; i<36; i++){
        if (i < 18) {
            if (i < 9) {
                var c = new Card(gameScreen, (60+(110*(i%9))), 190, newSelection);
                prev.push(c.pattern);
                cards.push(c);
            }
            else {
                var c = new Card(gameScreen, (60+(110*(i%9))), 300, newSelection);
                prev.push(c.pattern);
                cards.push(c);
            }
        }
        else {
            prev = shuffle(prev);
            var ind = randint(0, prev.length-1);
            var thisPatt = prev[ind];
            prev.splice(ind, 1);
            if (i < 27) {
                cards.push(new Card(gameScreen, (60+(110*(i%9))), 410, newSelection, thisPatt));
            }
            else {
                cards.push(new Card(gameScreen, (60+(110*(i%9))), 520, newSelection, thisPatt));
            }
        }
    }
}

function main() {
    setTimeout(function() {requestAnimationFrame(main);}, 1000/FPS);
    renderer.render(stage);
}

main();
