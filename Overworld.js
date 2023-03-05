class Overworld {
 constructor(config) {
    this.element = config.element;
    this.canvas = this.element.querySelector(".game-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.map = null
 }   

 startGameLoop() {
    const step = () => {
        // clear canvas for every frame
        this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
        // establish camera person (can be changed to npc, or whoever; useful for cutscenes?)
        const cameraPerson = this.map.gameObjects.hero;

        // update all objects
        Object.values(this.map.gameObjects).forEach(object => {
            object.update({
                arrow: this.directionInput.direction,
                map: this.map,
            });
        })

        // draw lower layer
        this.map.drawLowerImage(this.ctx, cameraPerson);

        // draw game objects
        Object.values(this.map.gameObjects).sort((a,b) => {
            return a.y - b.y;
        }).forEach(object => {
            // state updates every frame
            object.sprite.draw(this.ctx, cameraPerson);
        })
        // draw upper layer
        this.map.drawUpperImage(this.ctx, cameraPerson);

        requestAnimationFrame(() => {
            step();
        })
    }
    step();
 }

 bindActionInput() {
    new KeyPressListener("Enter", () => {
        // is there a person here to talk to?
        this.map.checkForActionCutscene();
    })
 }

 bindHeroPositionCheck() {
    document.addEventListener("PersonWalkingComplete", e => {
        if (e.detail.whoId === "hero") {
            // hero's position has changed
            this.map.checkForFootstepCutscene()
        }
    })
 }

 init(){
    // show title screen
    // this.titleScreen = new TitleScreen({

    // })
    
    this.map = new OverworldMap(window.OverworldMaps.Cafe); // config data from cafe
    this.map.mountObjects();

    this.bindActionInput();
    this.bindHeroPositionCheck();

    this.directionInput = new DirectionInput();
    this.directionInput.init();

    // this.directionInput.direction; // "down"

    this.startGameLoop();

    this.map.startCutscene([
        { who: "hero", type: "walk", direction: "up" },
        { who: "hero", type: "walk", direction: "left" },
        { who: "npcC", type: "walk", direction: "up" },
        { who: "npcC", type: "walk", direction: "up" },
        { who: "npcC", type: "walk", direction: "right" },
        { who: "npcC", type: "stand", direction: "right", time: 200 },
        {type: "textMessage", text: "Manager: hey there!"},
        {type: "textMessage", text: "welcome to your first day on the job"},
        {type: "textMessage", text: "we're the greatest coffee place in town, so you're lucky to be here"},
        {type: "textMessage", text: "You: Thanks"},
        {type: "textMessage", text: "Manager: Did you know we were voted #2 in the cafe awards this year?"},
        {type: "textMessage", text: "Got snubbed by starbucks again"},
        {type: "textMessage", text: "You: Aren't there only 2 coffee places in town?"},
        {type: "textMessage", text: "Manager: ..."},
        {type: "textMessage", text: "Anyway, you should get to work. It's fairly easy, here are the current orders"},
        {type: "textMessage", text: "The manager hands you a bundle of receipts - with no names"},
        {type: "textMessage", text: "You: um...how do I know who ordered what?"},
        {type: "textMessage", text: "Manager: I don't know! Just talk to the customers."},
        { who: "npcC", type: "walk", direction: "left" },
        { who: "npcC", type: "walk", direction: "down" },
        { who: "npcC", type: "walk", direction: "down" },

    ])
    

//     // whenever init, we will create a new image, assign source, download it, and when the source is downloaded,
//     // copy pixels over to canvas which has context, which allows us to draw to canvas

 }

}