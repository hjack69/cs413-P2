/**
 * Created by jack on 5/19/16.
 */

const WIDTH = 1000;
const HEIGHT = 600;

// Main graphics variables
var gameport = document.getElementById("gameport");
var renderer = PIXI.autoDetectRenderer(WIDTH, HEIGHT, {backgroundColor: 0});
gameport.appendChild(renderer.view);
var stage = new PIXI.Container();

function update() {

}

function main() {

}

main();
