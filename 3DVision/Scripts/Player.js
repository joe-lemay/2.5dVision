import Ray from "./Ray.js"

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
        for(let curAngle = startAngle;curAngle<=endAngle; curAngle++){
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
