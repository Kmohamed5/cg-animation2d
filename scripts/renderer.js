import { Matrix } from "./matrix.js";
import * as CG from './transforms.js';

class Renderer {
    // canvas:              object ({id: __, width: __, height: __})
    // limit_fps_flag:      bool 
    // fps:                 int
    
    constructor(canvas, limit_fps_flag, fps) {
        this.canvas = document.getElementById(canvas.id);
        this.canvas.width = canvas.width;
        this.canvas.height = canvas.height;
        this.ctx = this.canvas.getContext('2d');
        this.slide_idx = 0;
        this.limit_fps = limit_fps_flag;
        this.fps = fps;
        this.start_time = null;
        this.prev_time = null;
        this.ball = {
            position: { x: canvas.width / 2, y: canvas.height / 2 },
            velocity: { x: 5, y: 2 },
            radius: 50
        };
        

        const numSides = 32;
        const circleRadius = 50;

        this.models = {
            slide0: [
                // example model (diamond) -> should be replaced with actual model
                {
                    vertices: [
                        CG.Vector3(400, 150, 1),
                        CG.Vector3(500, 300, 1),
                        CG.Vector3(400, 450, 1),
                        CG.Vector3(300, 300, 1)
                    ],
                    transform: CG.mat3x3Identity
                },
                
            ],
            slide1: [
                // First diamond
                {
                    vertices: [
                        CG.Vector3(200, 150, 1),
                        CG.Vector3(300, 300, 1),
                        CG.Vector3(200, 450, 1),
                        CG.Vector3(100, 300, 1)
                    ],
                    transform: new Matrix(3, 3)
                },
                // Second diamond
                {
                    vertices: [
                        CG.Vector3(600, 150, 1),
                        CG.Vector3(700, 300, 1),
                        CG.Vector3(600, 450, 1),
                        CG.Vector3(500, 300, 1)
                    ],
                    transform: new Matrix(3, 3)
                }
            ],
            slide2: [{vertices: [
                CG.Vector3(400, 150, 1),
                CG.Vector3(500, 300, 1),
                CG.Vector3(400, 450, 1),
                CG.Vector3(300, 300, 1)
                
            ],
                    transform:new Matrix(3, 3)}],
            slide3: [{vertices: [
                CG.Vector3(400, 150, 1),
                CG.Vector3(500, 300, 1),
                CG.Vector3(400, 450, 1),
                CG.Vector3(300, 300, 1)
            ],
                    transform:new Matrix(3, 3) }],
        };
    }

    // flag:  bool
    limitFps(flag) {
        this.limit_fps = flag;
    }

    // n:  int
    setFps(n) {
        this.fps = n;
    }

    // idx: int
    setSlideIndex(idx) {
        this.slide_idx = idx;
    }

    animate(timestamp) {
        // Get time and delta time for animation
        if (this.start_time === null) {
            this.start_time = timestamp;
            this.prev_time = timestamp;
        }
        let time = timestamp - this.start_time;
        let delta_time = timestamp - this.prev_time;
        //console.log('animate(): t = ' + time.toFixed(1) + ', dt = ' + delta_time.toFixed(1));

        // Update transforms for animation
        this.updateTransforms(time, delta_time);

        // Draw slide
        this.drawSlide();

        // Invoke call for next frame in animation
        if (this.limit_fps) {
            setTimeout(() => {
                window.requestAnimationFrame((ts) => {
                    this.animate(ts);
                });
            }, Math.floor(1000.0 / this.fps));
        }
        else {
            window.requestAnimationFrame((ts) => {
                this.animate(ts);
            });
        }

        // Update previous time to current one for next calculation of delta time
        this.prev_time = timestamp;
    }   

    

    //
    updateTransforms(time, delta_time) {
        if (this.slide_idx === 0) {
            let ball = this.ball;
            // Update position
            ball.position.x += ball.velocity.x;
            ball.position.y += ball.velocity.y;
    
            // Check for collisions with the canvas boundaries
            if ((ball.position.x + ball.radius > this.canvas.width) || (ball.position.x - ball.radius < 0)) {
                ball.velocity.x = -ball.velocity.x; // Reverse X velocity
            }
            if ((ball.position.y + ball.radius > this.canvas.height) || (ball.position.y - ball.radius < 0)) {
                ball.velocity.y = -ball.velocity.y; // Reverse Y velocity
            }

        }
        if (this.slide_idx === 1) {
            this.models.slide1.forEach((model, index) => {
                // Define angular velocity for rotation
                let angularVelocity = (index === 0) ? 0.0001 : 0.00001; // Adjust rotation speed as needed
    
                let theta = angularVelocity * time; // Calculate rotation angle
    
                // Calculate the center of the polygon for rotation around its own center
                let centerX = 0;
                let centerY = 0;
                model.vertices.forEach(vertex => {
                    centerX += vertex.values[0][0];
                    centerY += vertex.values[1][0];
                });
                centerX /= model.vertices.length;
                centerY /= model.vertices.length;
    
                // Apply rotation transformation
                model.vertices = model.vertices.map(vertex => {
                    let x = vertex.values[0][0] - centerX;
                    let y = vertex.values[1][0] - centerY;
    
                    // Apply rotation around the center
                    let rotatedX = x * Math.cos(theta) - y * Math.sin(theta);
                    let rotatedY = x * Math.sin(theta) + y * Math.cos(theta);
    
                    // Translate back
                    return CG.Vector3(rotatedX + centerX, rotatedY + centerY, 1);
                });
            });
        }
        if (this.slide_idx === 2) {
            // Define constants for scaling
            const scaleSpeed = 0.0005; // Control the rate of scale change per millisecond
            // Adjust maxScale to ensure the polygon does not grow too big
            const maxScale = 1.2; // Adjusted maximum scale factor to prevent exceeding screen size
            const minScale = 0.8; // Adjust if you also want to change the minimum size
        
            this.models.slide2.forEach((model, index) => {
                // Initialize isGrowing and currentScale if they don't exist
                if (model.isGrowing === undefined) {
                    model.isGrowing = true; // Default to growing
                    model.currentScale = (maxScale + minScale) / 2; // Starting scale is midway between min and max
                }
        
                // Adjust the scale factor based on the current scaling direction
                let scaleChange = scaleSpeed * delta_time;
                if (model.isGrowing) {
                    model.currentScale += scaleChange; // Grow
                } else {
                    model.currentScale -= scaleChange; // Shrink
                }
        
                // Check if we've reached the scaling bounds, and flip the scaling direction if so
                if (model.currentScale > maxScale) {
                    model.isGrowing = false;
                    model.currentScale = maxScale; // Ensure scale does not exceed maxScale
                } else if (model.currentScale < minScale) {
                    model.isGrowing = true;
                    model.currentScale = minScale; // Ensure scale does not fall below minScale
                }
        
                // Apply the current scale to the model
                // Assuming you have a center for scaling; calculate if not already done
                let centerX = 0;
                let centerY = 0;
                model.vertices.forEach(vertex => {
                    centerX += vertex.values[0][0];
                    centerY += vertex.values[1][0];
                });
                centerX /= model.vertices.length;
                centerY /= model.vertices.length;
        
                model.vertices = model.vertices.map(vertex => {
                    let x = vertex.values[0][0] - centerX;
                    let y = vertex.values[1][0] - centerY;
        
                    // Apply current scale
                    let scaledX = x * model.currentScale;
                    let scaledY = y * model.currentScale;
        
                    // Translate back to original position with scaled dimensions
                    return CG.Vector3(scaledX + centerX, scaledY + centerY, 1);
                });
            });
        }
    }
    
    //
    drawSlide() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        switch (this.slide_idx) {
            case 0:
                this.drawSlide0();
                break;
            case 1:
                this.drawSlide1();
                break;
            case 2:
                this.drawSlide2();
                break;
            case 3:
                this.drawSlide3();
                break;
        }
    }

    //
    drawSlide0() {
            // Draw the ball
        let ball = this.ball;
        this.ctx.fillStyle = 'rgba(0, 128, 128, 1)'; // Example color
        this.ctx.beginPath();
        this.ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    //
    drawSlide1() {
        // Set color
        let teal = [0, 128, 128, 255];

        // Draw the polygons
        this.models.slide1.forEach(model => {
            this.drawConvexPolygon(model.vertices, teal);
        });


    }

    //
    drawSlide2() {
        // Clear previous drawings
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Set color
    let teal = [0, 128, 128, 255]; 

    // Draw the polygons
    this.models.slide2.forEach(model => {
        this.drawConvexPolygon(model.vertices, teal);
    });

}
    

    //
    drawSlide3() {
        // TODO: get creative!
        //   - animation should involve all three basic transformation types
        //     (translation, scaling, and rotation)
        
        let teal = [0, 128, 128, 255];
        this.drawConvexPolygon(this.models.slide3[0].vertices, teal);
    }
    
    // vertex_list:  array of object [Matrix(3, 1), Matrix(3, 1), ..., Matrix(3, 1)]
    // color:        array of int [R, G, B, A]
    drawConvexPolygon(vertex_list, color) {
        if (!Array.isArray(vertex_list) || vertex_list.length === 0) {
            console.error('Invalid vertex_list:', vertex_list);
            return;
        }
    
        this.ctx.fillStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + (color[3] / 255) + ')';
        this.ctx.beginPath();
    
        for (let i = 0; i < vertex_list.length; i++) {
            if (!vertex_list[i] || !vertex_list[i].values || !vertex_list[i].values[0] || !vertex_list[i].values[1] || !vertex_list[i].values[2]) {
                console.error('Invalid vertex at index', i, 'in vertex_list:', vertex_list);
                continue;
            }
    
            let x = vertex_list[i].values[0][0] / vertex_list[i].values[2][0];
            let y = vertex_list[i].values[1][0] / vertex_list[i].values[2][0];
            this.ctx[i === 0 ? 'moveTo' : 'lineTo'](x, y);
        }
    
        this.ctx.closePath();
        this.ctx.fill();
    }
};

export { Renderer };

