import * as CG from './transforms.js';

class Renderer {
    // canvas:              object ({id: __, width: __, height: __})
    // limit_fps_flag:      bool 
    // fps:                 int
    generateCircleVertices(numSides, circleRadius) {
        const circleVertices = [];
        for (let i = 0; i < numSides; i++) {
            const angle = (i / numSides) * 2 * Math.PI;
            const x = 400 + circleRadius * Math.cos(angle);
            const y = 300 + circleRadius * Math.sin(angle);
            circleVertices.push(CG.Vector3(x, y, 1));
        }
        return circleVertices;
    }
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

        const numSides = 32;
        const circleRadius = 50;

        this.models = {
            slide0: [
                // example model (diamond) -> should be replaced with actual model
                {
                    vertices: this.generateCircleVertices(numSides, circleRadius),
                    transform: CG.mat3x3Identity
                }
            ],
            slide1: [{vertices: [
                CG.Vector3(400, 150, 1),
                CG.Vector3(500, 300, 1),
                CG.Vector3(400, 450, 1),
                CG.Vector3(300, 300, 1)
            ],
                    transform:CG.mat3x3Identity }],
            slide2: [{vertices: [
                CG.Vector3(400, 150, 1),
                CG.Vector3(450, 225, 1),
                CG.Vector3(500, 300, 1),
                CG.Vector3(450, 375, 1),
                CG.Vector3(400, 450, 1),
                CG.Vector3(350, 375, 1),
                CG.Vector3(350, 225, 1),
                CG.Vector3(300, 300, 1)
                
            ],
                    transform:CG.mat3x3Identity}],
            slide3: []
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
        const model = this.models[`slide${this.slide_idx}`][0];
        const transform = model.transform;
        
        if (transform) {
            // Apply the transformation to each vertex of the model
            for (let i = 0; i < model.vertices.length; i++) {
                model.vertices[i] = transform(model.vertices[i], time, delta_time);
            }
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
        // TODO: draw bouncing ball (circle that changes direction whenever it hits an edge)
        
        
        // Following lines are example of drawing a single polygon
        // (this should be removed/edited after you implement the slide)
        let teal = [0, 128, 128, 255];
        this.drawConvexPolygon(this.models.slide0[0].vertices, teal);
    }

    //
    drawSlide1() {
        // TODO: draw at least 3 polygons that spin about their own centers
        //   - have each polygon spin at a different speed / direction
        let teal = [0, 128, 128, 255];
        this.drawConvexPolygon(this.models.slide1[0].vertices, teal);
        
    }

    //
    drawSlide2() {
        // TODO: draw at least 2 polygons grow and shrink about their own centers
        //   - have each polygon grow / shrink different sizes
        //   - try at least 1 polygon that grows / shrinks non-uniformly in the x and y directions

        let teal = [0, 128, 128, 255];
        this.drawConvexPolygon(this.models.slide2[0].vertices, teal);

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
        this.ctx.fillStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + (color[3] / 255) + ')';
        this.ctx.beginPath();
        let x = vertex_list[0].values[0][0] / vertex_list[0].values[2][0];
        let y = vertex_list[0].values[1][0] / vertex_list[0].values[2][0];
        this.ctx.moveTo(x, y);
        for (let i = 1; i < vertex_list.length; i++) {
            x = vertex_list[i].values[0][0] / vertex_list[i].values[2][0];
            y = vertex_list[i].values[1][0] / vertex_list[i].values[2][0];
            this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
        this.ctx.fill();
    }
};

export { Renderer };

