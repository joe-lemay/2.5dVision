const c = document.getElementById("canvas1");
const ctx = c.getContext("2d");

const c2 = document.getElementById("canvas2");
const ctx2 = c2.getContext("2d");

c.height = 450;
c.width = 1800;


c2.height = 450;
c2.width = 1800;

let resolutionScaler = 3;

let boundaries = [];

let isDrawing = false;
let isRunning = true;

let controllerPos = [];
let controllerHeading = [];

let playerFOV = 60;

window.addEventListener("keydown", function(event) {
    switch(event.code){
        
        case "KeyW": controllerPos.push([0,2])
        break;
        case "KeyS": controllerPos.push([0,-2])
        break;
        case "KeyA": controllerPos.push([2,0])
        break;
        case "KeyD": controllerPos.push([-2,0])
        break;
        case "KeyE": controllerHeading.push(2)
        break;
        case "KeyQ": controllerHeading.push(-2)
        break;
        default: console.log(event.key)
        break;
    }
});

class Wall{
    static allWalls = [];
    constructor(){
        this.startCoord = {x: 0, y: 0};
        this.endCoord = {x: 0, y: 0};
    }

    startBoundary(evt){
        isDrawing = true;
        let rect = c.getBoundingClientRect();
        this.startCoord.x = evt.clientX - rect.left;
        this.startCoord.y = evt.clientY - rect.top;
        this.endCoord.x = evt.clientX - rect.left;
        this.endCoord.y = evt.clientY - rect.top;
    }

    grabMouse(evt){
        let rect = c.getBoundingClientRect();
        this.endCoord.x = evt.clientX - rect.left;
        this.endCoord.y = evt.clientY - rect.top;
    }

    endBoundary(evt){
        isDrawing = false;
        let rect = c.getBoundingClientRect();
        this.endCoord.x = evt.clientX - rect.left;
        this.endCoord.y = evt.clientY - rect.top;
    }

    drawWall(){
        ctx.strokeStyle = "white";
        ctx.beginPath();
        ctx.moveTo(this.startCoord.x, this.startCoord.y);
        ctx.lineTo(this.endCoord.x, this.endCoord.y);
        ctx.stroke();
    }

    static drawWalls(){
        this.allWalls.forEach(thisWall =>{
            thisWall.drawWall()
            });
    }

    static realTimeWall(evt){
        if(isDrawing){
            let lastWall = this.allWalls.pop();
            lastWall.grabMouse(evt);
            this.allWalls.push(thisWall);
        }
    }

    static endWall(evt){
        let lastWall = this.allWalls.pop();
        lastWall.endBoundary(evt);
        this.allWalls.push(thisWall);
    }
};


class Ray{
    allRays = [];
    constructor(data){
        this.sx = data.sx;//Start x
        this.sy = data.sy;//Start y
        this.r = data.r;//Range of ray
        this.h = data.h//Heading angle in degrees
        this.ex = this.r * Math.cos(this.h*Math.PI/180) + this.sx;//End x
        this.ey = this.r * Math.sin(this.h*Math.PI/180) + this.sy;
        this.isColliding = false;//If its colliding with a wall.
        this.cDist = 0;
    }

    getDistance(){
        //Find length of line
        // let diffA = Math.abs(plyH-this.h)
        let diffX = this.sx - this.ex;
        let diffY = this.sy - this.ey;
        let dist = Math.sqrt(diffX*diffX+diffY*diffY);
        this.cDist = dist;
    }

    checkCollision(wallList){
        wallList.forEach(wall=>{
            //Establish two end points of line 1
            let x1 = this.sx;
            let y1 = this.sy;
            let x2 = this.ex;
            let y2 = this.ey;
            //Establish two end points of line 2
            let x3 = wall.startCoord.x;
            let y3 = wall.startCoord.y;
            let x4 = wall.endCoord.x;
            let y4 = wall.endCoord.y;
            
            //Get the denominator, if 0 then no collision
            const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
            if (!den){
                this.isColliding = false;
                return;
            }
            //If colliding, find point of intersection, update ex,ey
            const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
            const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
            if(t >= 0 && t <= 1 && u >= 0 && u <= 1){
                this.ex = x1 + t * (x2 - x1);
                this.ey = y1 + t * (y2 - y1);
                this.isColliding = true
            }
        });
    }

    updateRay(){
        this.checkCollision(Wall.allWalls);
        if(this.isColliding){
            this.getDistance();
        }
    }
}



class Player{
    constructor(data){
        this.xPos = data.xPos;
        this.yPos = data.yPos;
        this.FOV = data.FOV;
        this.range = data.range;
        this.xSpeed = data.xSpeed;
        this.ySpeed = data.ySpeed;
        this.headingAngle = data.headingAngle;
        this.rayList = [];
    }

    updatePlayer(){
        controllerPos.forEach(command=>{
            this.xPos -= command[0]*2
            this.yPos -= command[1]*2
        })
        controllerPos = [];
        controllerHeading.forEach(command=>{
            this.headingAngle += command
            console.log(this.headingAngle)
        })
        controllerHeading = [];
    }

    updateRays(){
        this.rayList.forEach(ray=>{
            ray.updateRay();
        });
    }

    genRays(){
        this.rayList = [];
        let startAngle = this.headingAngle - this.FOV/2;
        let endAngle = startAngle + this.FOV;
        for(let curAngle = startAngle;curAngle<=endAngle; curAngle+=(1/resolutionScaler)){
            let rayData = {
                sx: this.xPos,
                sy: this.yPos,
                r: this.range,
                h: curAngle
            }
            this.rayList.push(new Ray(rayData))
        }
    }

    drawPlayer(){
        ctx.strokeStyle = "green";
        ctx.beginPath();
        ctx.arc(this.xPos, this.yPos, 5, 0, 2 * Math.PI);
        ctx.stroke();
        this.rayList.forEach(ray=>{
            if(!ray.isColliding){
                ctx.strokeStyle = "white";
                ctx.beginPath();
                ctx.moveTo(ray.sx, ray.sy);
                ctx.lineTo(ray.ex, ray.ey);
                ctx.stroke();
            }else{
                ctx.strokeStyle = "red";
                ctx.beginPath();
                ctx.moveTo(ray.sx, ray.sy);
                ctx.lineTo(ray.ex, ray.ey);
                ctx.stroke();
            }
        });
    }
}

function createWall(evt){
    thisWall = new Wall()
    thisWall.startBoundary(evt);
    Wall.allWalls.push(thisWall);
};

function render3D(rayList){
    let sweepX = 0;
    let vertOrg = c2.height/2;
    ctx2.fillStyle="#018012";
    ctx2.fillRect(0, vertOrg, c2.width, c2.height/2);
    ctx2.fillStyle="#35c5e6";
    ctx2.fillRect(0, 0, c2.width, c2.height/2);
    rayList.forEach(ray=>{
        let size = (5/ray.cDist)*c2.height;
        if(ray.isColliding){
            ctx2.fillStyle = "#6e6d6d";
            ctx2.fillRect(sweepX, vertOrg, c2.width/playerFOV, -size)
            ctx2.fillRect(sweepX, vertOrg, c2.width/playerFOV, size);
            sweepX+=(c2.width/playerFOV)/resolutionScaler
        }
        else{
            ctx2.fillStyle = "#35c5e6";
            ctx2.fillRect(sweepX,0, c2.width/playerFOV, 100);
            sweepX+=(c2.width/playerFOV)/resolutionScaler
        }
    });
}

let thisData = {
    xPos: 300,
    yPos: 300,
    FOV: playerFOV,
    range: 500,
    xSpeed: 0,
    ySpeed: 0,
    headingAngle: 0
}

let player1 = new Player(thisData);
player1.genRays();
player1.drawPlayer();


function animate(running) {
    ctx.clearRect(0, 0, 1920, 1080);
    ctx2.clearRect(0, 0, 1920, 1080);
    Wall.drawWalls();
    player1.updatePlayer()
    player1.genRays()
    player1.updateRays();
    player1.drawPlayer();
    render3D(player1.rayList)
    if(running){
        window.requestAnimationFrame(animate);
    }
}
animate(isRunning);
