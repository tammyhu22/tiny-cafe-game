class Sprite {
    constructor(config) {

        // set up the image
        this.image = new Image();
        this.image.src = config.src; // calling sprite, pass in config
        this.image.onload = () => {
            this.isLoaded = true;
        };

        // shadow
        this.shadow = new Image();
        if("useShadow" in config) {
            this.useShadow = config.useShadow;
        } else {
            this.useShadow = true;
        }

        if (this.useShadow) {
            this.shadow.src = "./images/shadow.png";
        }
        this.shadow.onload = () => {
            this.isShadowLoaded = true;
        };


        // configuring animation and initial state
        // add new animations here
        this.animations = config.animations || {
            "idle-down": [ [0,0] ],
            "idle-right" : [ [0,1] ],
            "idle-up" : [ [0,2] ],
            "idle-left" : [ [0,3] ],
            "walk-down": [ [1,0], [0,0], [3,0], [0,0] ],
            "walk-right": [ [1,1], [0,1], [3,1], [0,1] ],
            "walk-up": [ [1,2], [0,2], [3,2], [0,2] ],
            "walk-left": [ [1,3], [0,3], [3,3], [0,3] ]
        }
        this.currentAnimation = config.currentAnimation || "idle-left" //config.currentAnimation || "idle-down"; // which animation frame
        this.currentAnimationFrame = 0;

        this.animationFrameLimit = config.animationFrameLimit || 4 ; // how many game loop frames of one cut of sprite sheet (increased will slower), default 16
        this.animationFrameProgress = this.animationFrameLimit;

        // reference the game object
        this.gameObject = config.gameObject;
    }

    get frame () {
        return this.animations[this.currentAnimation][this.currentAnimationFrame];
    }

    setAnimation(key) {
        if (this.currentAnimation !== key) {
            this.currentAnimation = key;
            this.currentAnimationFrame = 0;
            this.animationFrameProgress = this.animationFrameLimit; // cadence counter
        }
    }

    updateAnimationProgress() {
        //Downtick frame progress
        if(this.animationFrameProgress > 0) {
            this.animationFrameProgress -= 1;
            return;
        }

        // reset the counter
        this.animationFrameProgress = this.animationFrameLimit;

        this.currentAnimationFrame += 1;

        if(this.frame === undefined) {
            this.currentAnimationFrame = 0;
        }
    }
 
    draw(ctx, cameraPerson) {
        const x = this.gameObject.x - 5 + utils.withGrid(10.5) - cameraPerson.x;
        const y = this.gameObject.y + 2 + utils.withGrid(6) - cameraPerson.y;

        // draw shadow before npc
        this.isShadowLoaded && ctx.drawImage(this.shadow, x, y);

        const[frameX, frameY] = this.frame;

        this.isLoaded && ctx.drawImage(this.image,
            frameX * 32,frameY * 32,
            32,32,
            x,y,
            32,32
        );

        this.updateAnimationProgress();
    }
}
