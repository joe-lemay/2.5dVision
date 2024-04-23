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