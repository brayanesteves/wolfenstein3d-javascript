var canvas;
var ctx;
var FPS = 50;

/**
 * Canvas dimensions in pixel
 */
var canvasWidth  = 500;
var canvasHeight = 500;
var tamTile = 50;
// Objects
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

function rangeBetweenPoints(x1, x2, y1, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

function convertToRadians(angle) {
    angle = angle * (Math.PI / 180);
    return angle;
}
// ----------------------------------------------- //

class Lightning {
    constructor(con, stage, x, y, anglePlayer, angleIncrement, column) {
        this.ctx                = con;
        this.stage              = stage;
        this.x                  = x;
        this.y                  = y;
        this.angleIncrement     = angleIncrement;
        this.anglePlayer        = anglePlayer;
        this.angle              = anglePlayer + angleIncrement;
        
        this.column             = column;
        this.range              = 0;
        this.wallHitX           = 0;
        this.wallHitY           = 0;

        this.wallHitXHorizontal = 0;
        this.wallHitYHorizontal = 0;

        this.wallHitXVertical   = 0;
        this.wallHitYVertical   = 0;
        //console.log("Lightning create: " + this.anglePlayer);

        //this.cast();
    }

    setAngle(angle) {
        this.anglePlayer = angle;
        this.angle       = normalizeAngles(angle + this.angleIncrement);
    }

    cast() {
        this.xIntercept = 0;
        this.yIntercept = 0;

        // Step 'x'
        this.xStep = 0;
        // Step 'y'
        this.yStep = 0;
        /**
         * We find out the direction the lightning moves
         */
        this.down = false;
        this.left = false;
        if(this.angle < Math.PI) {
            this.down = false;
        }
        if(this.angle > Math.PI / 2 && this.angle < 3 * Math.PI / 2) {
            this.left = true;
        }

        // ========================================================== //
        /**
         * Horizontal collision
         */
        var crashHorizontal = false;

        /**
         * We search first for the intersection
         */
        this.yIntercept = Math.floor(this.y / tamTile) * tamTile;

        /**
         * If it points down, we increase one tile
         */
        if(this.down) {
            this.yIntercept += tamTile;
        }

        var adjacent    = (this.yIntercept - this.y) / Math.tan(this.angle);
        this.xIntercept = this.x + adjacent;

        /**
         * We calculate the distance of every step
         */
        this.yStep = tamTile;
        this.xStep = this.yStep / Math.tan(this.angle);

        /**
         * If we go up, we reverse the 'Y' step
         */
        if(!this.down) {
            this.yStep = -this.yStep;
        }

        /**
         * We check the step 'X' is coherent
         */
        if((this.left && this.xStep > 0) || (!this.left && this.xStep < 0)) {
            this.xStep = -this.xStep;
        }

        /**
         * For the different steps
         */
        var nextXHorizontal = this.xIntercept;
        var nextYHorizontal = this.yIntercept;

        /**
         * If you point up, I subtract one pixel to force the connection with the box.
         */
        if(!this.down) {
            nextYHorizontal--;
        }

        /**
         * Loop to find collision point
         */
        while(!crashHorizontal) {
            /**
             * We get the box (Rounding down)
             */
            var squareX = parseInt(nextXHorizontal / tamTile);
            var squareY = parseInt(nextYHorizontal / tamTile);

            /**
             * We check for a collision
             */
            if(this.stage.collision(squareX, squareY)) {
                crashHorizontal         = true;
                this.wallHitXHorizontal = nextXHorizontal;
                this.wallHitYHorizontal = nextYHorizontal;
            } else {
                nextXHorizontal += this.xStep;
                nextYHorizontal += this.yStep;
            }
        }

        // ========================================================== //
        /**
         * Vertical collision
         */
        var crashVertical = true;
        /**
         * We are looking for the first intersection
         */
        this.xIntercept   = Math.floor(this.x / tamTile) * tamTile;
        /**
         * If it points to the right, we increase 1 tile
         */
        if(!this.left) {
            this.xIntercept += tamTile;
        }
        /**
         * The opposite leg is added
         */
        var opposite      = (this.xIntercept - this.x) * Math.tan(this.angle);
        this.yIntercept   = this.y + opposite;
        // ========================================================== //
        /**
         * We calculate the distance of each step
         */
        this.xStep        = tamTile;
        /**
         * If you go left invert
         */
        if(this.left) {
            this.xStep = -this.xStep;
        }
        this.yStep = tamTile * Math.tan(this.angle);

        if((!this.down && this.yStep > 0) || (this.down && this.yStep < 0)) {
            this.yStep = -this.yStep;            
        }

        var nextXVertical = this.xIntercept;
        var nextYVertical = this.yIntercept;

        if(this.left) {
            nextXVertical--;
        }
        /**
         * Loop with jumps to detect collision
         */
        while(!crashVertical && (nextXVertical >= 0 && nextYVertical >= 0 && nextXVertical < canvasWidth && nextYVertical < canvasHeight)) {
            /**
             * We get the box rounded down
             */
            var squareX = parseInt(nextXVertical / tamTile);
            var squareY = parseInt(nextYVertical / tamTile);

            if(this.stage.collision(squareX, squareY)) {
                crashVertical         = true;
                this.wallHitXVertical = nextXVertical;
                this.wallHitYVertical = nextYVertical;
            } else {
                nextXVertical += this.xStep;
                nextYVertical += this.yStep;
            }
        }

        var rangeHorizontal = 9999;
        var rangeVertical   = 9999;

        if(crashHorizontal) {
            rangeHorizontal = rangeBetweenPoints(this.x, this.y, this.wallHitXHorizontal, this.wallHitYHorizontal);
        }

        if(crashVertical) {
            rangeVertical = rangeBetweenPoints(this.x, this.y, this.wallHitXVertical, this.wallHitYVertical);
        }

        if(rangeHorizontal < rangeVertical) {
            this.wallHitX = this.wallHitXHorizontal;
            this.wallHitY = this.wallHitYHorizontal;
            /**
             * Save range
             */
            this.range    = rangeHorizontal;
        } else {
            this.wallHitX = this.wallHitXVertical;
            this.wallHitY = this.wallHitYVertical;
            /**
             * Save range
             */
             this.range   = rangeVertical;
        }

        /**
         * Fisheye correction
         */
        this.range = this.range * Math.cos(this.anglePlayer - this.angle);

        //this.wallHitX     = this.wallHitXHorizontal;
        //this.wallHitY     = this.wallHitYHorizontal;
        //this.wallHitX     = this.wallHitXVertical;
        //this.wallHitY     = this.wallHitYVertical;
    }

    renderWall() {
        /**
         * Real pixels that will have the wall
         */
        var heightTile           = 500;
        /**
         * Distance from player to projection plane
         */
        var rangePlaneProjection = (canvasWidth / 2) / Math.tan(meansFOV);
        /**
         * Height real wall
         */
        var heightWall           = (heightTile / this.range) * rangePlaneProjection;
        /**
         * We calculate where the line starts and ends
         */
        var y0                   = parseInt(canvasHeight / 2) - parseInt(heightWall / 2);
        var y1                   = y0 + heightWall;
        var x                    = this.column;
        
        /**
         * Draw the column (Line)
         */
        this.ctx.beginPath();
        this.ctx.moveTo(x, y0);
        this.ctx.lineTo(x, y1);
        this.ctx.strokeStyle = '#666666';
        this.ctx.stroke();
    }

    draw() {
        this.cast();
        this.renderWall();
        /**
         * Show line 'Lightning'
         */
        //var xDestiny = this.wallHitX;
        //var yDestiny = this.wallHitY;

        //this.ctx.beginPath();
        //this.ctx.moveTo(this.x, this.y);
        //this.ctx.lineTo(xDestiny, yDestiny);
        //this.ctx.strokeStyle = 'red';
        //this.ctx.stroke();
    }
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

const FOV      = 60;
const meansFOV = FOV / 2;

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

                
        /**
         * Lightning
         */
        this.numLightning = canvasWidth;
        this.lightnings   = [];
        /**
         * Calculate the angle of each lightning
         */
        
        var incrementAngle  = convertToRadians(FOV / this.numLightning);
        var angleInit       = convertToRadians(this.angleRotation - meansFOV);
        var angleLightnings = angleInit;
        /**
         * We created the ray
         */
        for (let i = 0; i < this.numLightning; i++) {
            this.lightnings[i] = new Lightning(this.ctx, this.stage, this.x, this.y, this.angleRotation, angleLightnings, i);
            angleLightnings   += incrementAngle;
        }
        //this.lightning    = new Lightning(this.ctx, this.stage, this.x, this.y, this.angleRotation, 0);
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
        /**
         * We update the angle of the 'Lightning'
         */
        for (let i = 0; i < this.numLightning; i++) {
            this.lightnings[i].x = this.x;
            this.lightnings[i].y = this.y;
            this.lightnings[i].setAngle(this.angleRotation);
        }
        //this.lightning.setAngle(this.angleRotation);
        //this.lightning.x = this.x;
        //this.lightning.y = this.y;        
    }

    draw() {
        this.update();
        for(let i = 0; i < this.numLightning; i++) {
            this.lightnings[i].draw();
            //this.lightnings[i].renderWall();
        }
        //this.lightning.draw();
        // Frame
        //this.ctx.fillStyle = playerColor;
        //this.ctx.fillRect(this.x - 3, this.y - 3, 6, 6);

        // Address Line
        //var xDestiny = this.x + Math.cos(this.angleRotation) * 40;
        //var yDestiny = this.y + Math.sin(this.angleRotation) * 40;

        //this.ctx.beginPath();
        //this.ctx.moveTo(this.x, this.y);
        //this.ctx.lineTo(xDestiny, yDestiny);
        //this.ctx.strokeStyle = '#FFFFFF';
        //this.ctx.stroke();
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
    //stage.draw();
    player.draw();
}