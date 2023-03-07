class FoodStone extends GameObject {
    constructor(config) {
        super(config);
        this.src = config.src;
        this.sprite = new Sprite ({
            gameObject: this,
            src: this.src,
            useShadow: false,
            currentAnimation: "idle-down",
        });
        this.storyFlag = config.storyFlag;
        this.food = config.food;
        this.foodLine = config.foodLine;
        this.inventoryUpdate = config.inventoryUpdate; // all possible other foods , I just want a way to indicate if the player is holding something
        this.talking = [
            {
                required: [this.inventoryUpdate], // [this.storyFlag] || 
                events: [
                    {type: "textMessage", text: "You already picked up something."}
                ]
            },
            {
                events:[
                    { type: "textMessage", text: "You "+`${this.foodLine}`+"..."},
                    { type: "addStoryFlag", flag: this.inventoryUpdate},
                    { type: "addStoryFlag", flag: this.storyFlag, food: this.food },
              //      { type: "disableStoryFlag", flag: this.storyFlag }, // disabling a flag
                ]
            }
        ]
    }

    update() {
        
    }
}