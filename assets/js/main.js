var canvas;
var ctx;
var FPS = 50;

/**
 * Canvas dimensions in pixel
 */
var canvasWidth  = 500;
var canvasHeight = 500;
var stage;
var player;
// Color constant
const wallColor   = '#000000';
const floorColor  = '#666666';
const playerColor = '#FFFFFF';
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
// Keyboard
document.addEventListener('keydown', function(key) {
    switch(key.keyCode) {
        case 38:
            player.up();
            break;
        
        case 40:
            player.down();
            break;
        
        case 39:
            player.right();
            break;
        
        case 37:
            player.left();
            break;
    }
});

document.addEventListener('keyup', function(key) {
    switch(key.keyCode) {
        case 38:
            player.advanceLoose();
            break;
        
        case 40:
            player.advanceLoose();
            break;
        
        case 39:
            player.rotationLoose();
            break;
        
        case 37:
            player.rotationLoose();
            break;
    }
});
// ----------------------------------------------- //
// Normalize angles
function normalizeAngles(angle) {
    angle = angle % (2 * Math.PI);
    if (angle < 0) {
        angle = angle + (2 * Math.PI);
    }
    return angle;
}
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

    collision(x, y) {
        var crash = false;
        if(this.matrix[y][x] != 0) {
            crash = true;
        }
        return crash;
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

class Player {
    /**
     * 
     * @param {*} con 
     * @param {*} stage 
     * @param {*} x 
     * @param {*} y 
     */
    constructor(con, stage, x, y) {
        this.ctx   = con;
        this.stage = stage;

        this.x = x;
        this.y = y;

        this.advance = 0; // 0: Stop, 1: Advance, -1: Back
        this.turns   = 0; // -1: Left, 1: Right
        
        this.angleRotation = 0;

        this.speedMovement = 3; // Pixels
        /**
         * Convert radians
         */
        this.speedRotation = 3 * (Math.PI / 180); // Grades
    }

    // ----------------------------------------------- //
    // Keyboard
    up() {
        this.advance = 1;
    }
    down() {
        this.advance = -1;
    }

    left() {
        this.turns = 1;
    }

    right() {
        this.turns = -1;
    }

    advanceLoose() {
        this.advance = 0;
    }

    rotationLoose() {
        this.turns = 0;
    }
    // ----------------------------------------------- //

    collision(x, y) {
        var crash = false;
        /**
         * We find out in which square the player is
         */
        var squareX = parseInt(x / this.stage.widthTiles);
        var squareY = parseInt(y / this.stage.heightTiles);

        if(this.stage.collision(squareX, squareY)) {
            crash = true;
        }
        return crash;
    }

    update() {
        // Advance
        var newX = this.x + (this.advance * Math.cos(this.angleRotation) * this.speedMovement);
        var newY = this.y + (this.advance * Math.sin(this.angleRotation) * this.speedMovement);

        if(!this.collision(newX, newY)) {
            this.x = newX;
            this.y = newY;            
        }
        

        // Turns
        this.angleRotation += this.turns * this.speedRotation;
        this.angleRotation = normalizeAngles(this.angleRotation);
    }

    draw() {
        this.update();
        // Frame
        this.ctx.fillStyle = playerColor;
        this.ctx.fillRect(this.x - 3, this.y - 3, 6, 6);

        // Address Line
        var xDestiny = this.x + Math.cos(this.angleRotation) * 40;
        var yDestiny = this.y + Math.sin(this.angleRotation) * 40;

        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y);
        this.ctx.lineTo(xDestiny, yDestiny);
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.stroke();
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
    player = new Player(ctx, stage, 200, 100);
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
    player.draw();
}