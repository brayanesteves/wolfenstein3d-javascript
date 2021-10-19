var canvas;
var ctx;
var FPS = 50;

/**
 * Canvas dimensions in pixel
 */
var canvasWidth  = 500;
var canvasHeight = 500;
var stage;
// Color constant
const wallColor  = '#000000';
const floorColor = '#666666';
// ----------------------------------------------- //
// LEVEL 0
var level0 = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 1, 0, 0, 1],
    [1, 0, 0, 1, 1, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];
// ----------------------------------------------- //
/**
 * Scenario class
 */

class Level {
    constructor(can, con, arr) {
        this.canvas = can;
        this.ctx    = con;
        this.matrix = arr;

        /**
         * Matrix dimensions
         */
        this.heightMatrix = this.matrix.length;
        this.widthMatrix  = this.matrix[0].length;
        
        /**
         * Actual canvas dimensions
         */
        this.heightCanvas = this.canvas.height;
        this.widthCanvas  = this.canvas.width;
        
        /**
         * Tile dimensions
         */
        this.heightTiles = parseInt(this.heightCanvas / this.heightMatrix);
        this.widthTiles  = parseInt(this.widthCanvas / this.widthMatrix);        
        
    }

    draw() {
        var color;
        for (var y = 0; y < this.heightMatrix; y++) {
            for (var x = 0; x < this.widthMatrix; x++) {
                if (this.matrix[y][x] == 1) {
                    color = wallColor;
                } else {
                    color = floorColor;
                }
                this.ctx.fillStyle = color;
                this.ctx.fillRect(x * this.widthTiles, y * this.heightTiles, this.widthTiles, this.heightTiles);
            }
        }
    }
}
// ----------------------------------------------- //

function init() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    /**
     * We modify the size of the canvas
     */
    canvas.width  = canvasWidth;
    canvas.height = canvasHeight;

    stage = new Level(canvas, ctx, level0);

    /**
     * We start the main game loop
     */
    setInterval(function () {
        main();
    }, 1000/FPS)

}

function removeCanvas() {
    canvas.width  = canvas.width;
    canvas.height = canvas.height;
}

function main() {
    removeCanvas();
    stage.draw();
}