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