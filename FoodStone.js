class FoodStone extends GameObject {
    constructor(config) {
        super(config);
        this.sprite = new Sprite ({
            gameObject: this,
            src: "./images/cake.png",
            useShadow: false, // why is shadow still there
            currentAnimation: "idle-down",
        });
        this.storyFlag = config.storyFlag;
        console.log(config.storyFlag);
        this.talking = [
            {
                required: [this.storyFlag],
                events: [
                    {type: "textMessage", text: "You already picked up something."}
                ]
            },
            {
                events:[
                    { type: "textMessage", text: "You picked up a cake..."},
                    { type: "addStoryFlag", flag: this.storyFlag }
                ]
            }
        ]
    }

    update() {
        
    }
}