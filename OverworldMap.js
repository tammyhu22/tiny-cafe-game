class OverworldMap {
    constructor(config) {
        this.gameObjects = {}; // live objects are in here
        this.configObjects = config.configObjects; // configuration content
        
        this.cutsceneSpaces = config.cutsceneSpaces || {}; 
        this.walls = config.walls || {};

        this.lowerImage = new Image();
        this.lowerImage.src = config.lowerSrc;

        this.upperImage = new Image();
        this.upperImage.src = config.upperSrc; // things drawn above the character

        this.isCutscenePlaying = false;

    }

    drawLowerImage(ctx, cameraPerson) {
        ctx.drawImage(
            this.lowerImage,
            utils.withGrid(10.5) - cameraPerson.x,
            utils.withGrid(6) - cameraPerson.y
            )
    }

    drawUpperImage(ctx, cameraPerson) {
        ctx.drawImage(
            this.upperImage,
            utils.withGrid(10.5) - cameraPerson.x,
            utils.withGrid(6) - cameraPerson.y
            )
    }

    isSpaceTaken(currentX, currentY, direction) {
        const {x,y} = utils.nextPosition(currentX, currentY, direction);
        if( this.walls[`${x},${y}`] ) {
            return true;
        } 

        // check for game objects at this position
        return Object.values(this.gameObjects).find(obj => {
            if(obj.x === x && obj.y === y) { return true;}
            if (obj.intentPosition && obj.intentPosition[0] === x && obj.intentPosition[1] === y) {
                return true;
            }
            return false;
        })
    }

    mountObjects() {
        Object.keys(this.configObjects).forEach(key => {
            
            let object = this.configObjects[key];
            object.id = key; // like hero, or npc1

            let instance;
            if (object.type === "Person") {
                instance = new Person(object);
            }

            if (object.type === "FoodStone") {
                instance = new FoodStone(object);
            }

            this.gameObjects[key] = instance;
            this.gameObjects[key].id = key;
            instance.mount(this);
        })
    }

    async startCutscene(events) {
        this.isCutscenePlaying = true;
        
        // start a loop of async events
        // await each one
        for(let i = 0; i < events.length; i++) {
            const eventHandler = new OverworldEvent({
                event: events[i],
                map: this,
            })

            await eventHandler.init();
        }

        this.isCutscenePlaying = false;
        
        // reset NPCs to do idle behavior
        // CHANGE THIS LATER IN PART 17
       // Object.values(this.gameObjects.forEach(object => object.doBehaviorEvent(this)));
    }


    checkForActionCutscene() {
        const hero = this.gameObjects["hero"];
        const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
        const match = Object.values(this.gameObjects).find(object => {
            return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
        });
        if (!this.isCutscenePlaying && match && match.talking.length) {
            const relevantScenario = match.talking.find(scenario => {
                return (scenario.required || []).every(sf => {
                    return playerState.storyFlags[sf]
                })
            })
            relevantScenario && this.startCutscene(relevantScenario.events);
        }
    }

    checkForFootstepCutscene() {
        const hero = this.gameObjects["hero"];
        const match = this.cutsceneSpaces[ `${hero.x},${hero.y}` ];
        if (!this.isCutscenePlaying && match) {
            const relevantScenario = match.find(scenario => { // having trouble getting next cutscene
                return (scenario.required || []).every(sf => {
                    return playerState.storyFlags[sf]
                })
            })
            relevantScenario && this.startCutscene(relevantScenario.events);
        }
    }

}

window.OverworldMaps = {
    Cafe: {
        lowerSrc: "./images/mapLower.png",
        upperSrc:"./images/mapUpper.png",
        configObjects: {
            hero: {
                type: "Person",
                isPlayerControlled: true,
                x: utils.withGrid(5),
                y: utils.withGrid(6),
            },
            npcA: { // KELLY THE COFFEE GIRL
                type: "Person",
                x: utils.withGrid(10),
                y: utils.withGrid(8),
                src: "./images/npc1.png",
                behaviorLoop: [
                    { type: "stand", direction: "left", time: 800 }, //looking left
                    { type: "stand", direction: "up", time: 800 },
                    { type: "stand", direction: "right", time: 1200 },
                    { type: "stand", direction: "up", time: 300 }, // loops
                ],
                talking: [
                    {
                        required: ["USED_COFFEE"],
                        events: [
                            {type: "textMessage", text: "Kelly: Oh, finally.", faceHero: "npcA"},
                            {type: "textMessage", text: "I needed this."},
                            {type: "disableStoryFlag", flag: "USED_COFFEE"},
                            {type: "disableStoryFlag", flag: "INVENTORY_FULL"},
                            {type:"addStoryFlag", flag: "COFFEE_DONE"}
                        ]
                    },
                    {
                        required: ["CAKE_DONE"] && ["BREAD_DONE"] && ["DONUT_DONE"],
                        events: [
                            {type: "textMessage", text: "You: Would you mind reminding me what you ordered?", faceHero: "npcA"},
                            {type: "textMessage", text: "Kelly: I got a pumpkin spice latte."},
                        ]
                    },
                    {
                        required: ["INVENTORY_FULL"],
                        events: [
                            {type: "textMessage", text: "Kelly: That's not my order.", faceHero: "npcA"},
                        ]
                    },
                    {
                        required: ["COFFEE_DONE"],
                        events: [
                            {type: "textMessage", text: "Kelly: That coffee really helped, thanks.", faceHero: "npcA"},
                        ]
                    },
                    {
                        events: [
                            {type: "textMessage", text: "Kelly: Can I help you?", faceHero:"npcA"},
                            {type: "textMessage", text: "I'm on the phone right now, talk to me later."},
                            {who: "hero", type: "walk", direction: "up"},
                        ]
                    },
                ]
            },
            npcB: { // SAM THE CAKE GUY
                type: "Person",
                x: utils.withGrid(10),
                y: utils.withGrid(3),
                src: "./images/npc3.png",
                behaviorLoop: [ // idle behavior loop
                    { type: "walk", direction: "left" },
                    { type: "stand", direction: "up", time: 6000 },
                    { type: "walk", direction: "down" },
                    { type: "stand", direction: "down", time: 3000 },
                    { type: "walk", direction: "right" }, 
                    { type: "walk", direction: "up" },
                ],
                talking: [
                    {
                        required: ["USED_CAKE"],
                        events: [
                            {type: "textMessage", text: "Sam: Oh thanks!", faceHero: "npcB"},
                            {type: "textMessage", text: "You're new here right? Keep up the great work!"},
                            {type: "disableStoryFlag", flag: "USED_CAKE"},
                            {type: "disableStoryFlag", flag: "INVENTORY_FULL"},
                            {type:"addStoryFlag", flag: "CAKE_DONE"}
                        ]
                    },
                    {
                        required: ["INVENTORY_FULL"],
                        events: [
                            {type: "textMessage", text: "Sam: um this isn't what I wanted", faceHero: "npcB"},
                        ]
                    },
                    {
                        required: ["CAKE_DONE"],
                        events: [
                            {type: "textMessage", text: "Sam: This cake is great!", faceHero: "npcB"},
                        ]
                    },
                    {
                        events: [
                            {type: "textMessage", text: "You: Hey, sorry to bother you,", faceHero:"npcB"},
                            {type: "textMessage", text: "May I ask what you ordered?"},
                            {type: "textMessage", text: "Sam: Uh..just one of those strawberry lemon cakes I think."},
                            {type: "textMessage", text: "You: Ok thanks!"},
                        ]
                    },
                ]
            },
            npcC: { // MANAGER
                type: "Person",
                x: utils.withGrid(2),
                y: utils.withGrid(7),
                src: "./images/erio.png",
                behaviorLoop: [ // idle behavior loop
                    { type: "stand", direction: "left", time: 3000},
                    { type: "stand", direction: "right", time: 3000},
                ],
                talking: [
                    {
                        required: ["COFFEE_DONE"],
                        events: [
                            {type: "textMessage", text: "Manager: Hey! How was your first day?", faceHero: "npcC"},
                            {type: "textMessage", text: "You: Pretty interesting. I think it went well!"},
                            {type: "textMessage", text: "Manager: Ah, well congrats on your first day. I'll see you tomorrow at 7."},
                            {type: "textMessage", text: "You finished the game!"},
                        ]
                    },
                    {
                        required: ["CAKE_DONE"],
                        events: [
                            {type: "textMessage", text: "Manager: Half your shift's over! Chop, chop!", faceHero: "npcC"},
                            {type: "textMessage", text: "Come talk to me when you're done with service."},
                        ]
                    },
                    {
                        events: [
                            {type: "textMessage", text: "Manager: Still figuring out who ordered what?", faceHero:"npcC"},
                            {type: "textMessage", text: "everything you need is at the counter"},
                            {type: "textMessage", text: "just gotta ask each person about their order..."},
                            {who: "npcC", type: "stand", direction: "right"},
                            {type: "textMessage", text: "I would help, but I'm too busy wiping these tables, haha"},
                            {who: "hero", type: "walk", direction: "up"},
                            {who: "npcC", type: "stand", direction: "down"},
                        ]
                    },
                ]
            },
            npcD: { // bald man
                type: "Person",
                x: utils.withGrid(13),
                y: utils.withGrid(5),
                src: "./images/npc2.png",
                behaviorLoop: [ // idle behavior loop
                    { type: "walk", direction: "right" },
                    { type: "stand", direction: "down", time: 4000 },
                    { type: "walk", direction: "left" },
                    { type: "walk", direction: "left" }, 
                    { type: "stand", direction: "left", time: 2000 },
                    { type: "walk", direction: "left" }, 
                    { type: "stand", direction: "left", time: 3000},
                    { type: "walk", direction: "right" },
                    { type: "walk", direction: "right" },
                ],
                talking: [
                    {
                        required: ["USED_DONUT"],
                        events: [
                            {type: "textMessage", text: "Drew: DONUTTTTT!!!", faceHero: "npcD"},
                            {type: "textMessage", text: "THANKS MAN, this looks AMAZING!!!"},
                            {type: "disableStoryFlag", flag: "USED_DONUT"},
                            {type: "disableStoryFlag", flag: "INVENTORY_FULL"},
                            {type:"addStoryFlag", flag: "DONUT_DONE"}
                        ]
                    },
                    {
                        required: ["INVENTORY_FULL"],
                        events: [
                            {type: "textMessage", text: "Drew: hmm...this doesn't look like my order", faceHero: "npcD"},
                        ]
                    },
                    {
                        required: ["DONUT_DONE"],
                        events: [
                            {type: "textMessage", text: "Drew: nom nom nom nom DONUTS4LIFE", faceHero: "npcD"},
                        ]
                    },
                    {
                        events: [
                            {type: "textMessage", text: "You: Hi there.", faceHero:"npcD"},
                            {type: "textMessage", text: "Drew: Howdy!"},
                            {type: "textMessage", text: "Just wanted to uh, double check what you ordered"},
                            {type: "textMessage", text: "Drew: oh, just one of those round things with the HOLESSSS"},
                            {type: "textMessage", text: "You: Alright... comin' right up!"},
                        ]
                    },
                ]
            },
            npcE: {
                type: "Person",
                x: utils.withGrid(8),
                y: utils.withGrid(7),
                src: "./images/npc7.png",
                behaviorLoop: [ // idle behavior loop
                    { type: "walk", direction: "left" },
                    { type: "walk", direction: "left" },
                    { type: "walk", direction: "up" },
                    { type: "stand", direction: "up", time: 3000},
                    { type: "walk", direction: "right" },
                    { type: "walk", direction: "right" }, 
                    { type: "stand", direction: "right", time: 4000 }, 
                    { type: "walk", direction: "right" }, 
                    { type: "walk", direction: "down" }, 
                    { type: "stand", direction: "right", time: 6000},
                    { type: "walk", direction: "left" },
                ],
                talking: [
                    {
                        required: ["USED_BREAD"],
                        events: [
                            {type: "textMessage", text: "Jenny: Oh my, this bread smells great.", faceHero: "npcE"},
                            {type: "textMessage", text: "Thanks a lot!"},
                            {type: "disableStoryFlag", flag: "USED_BREAD"},
                            {type: "disableStoryFlag", flag: "INVENTORY_FULL"},
                            {type:"addStoryFlag", flag: "BREAD_DONE"}
                        ]
                    },
                    {
                        required: ["INVENTORY_FULL"],
                        events: [
                            {type: "textMessage", text: "Jenny: think you have the wrong person, kid", faceHero: "npcE"},
                        ]
                    },
                    {
                        required: ["BREAD_DONE"],
                        events: [
                            {type: "textMessage", text: "Jenny: mmm, I'm coming back tomorrow for this.", faceHero: "npcE"},
                        ]
                    },
                    {
                        events: [
                            {type: "textMessage", text: "You: Hello there, mind if I ask what your order was?", faceHero:"npcE"},
                            {type: "textMessage", text: "Jenny: um...honestly I forgot"},
                            {type: "textMessage", text: "Why don't you just surprise me with something toasty"},
                            {type: "textMessage", text: "You: Huh...yeah I got you."},
                        ]
                    },
                ]
            },
            Cake:{
                type: "FoodStone",
                src: "./images/cake.png",
                x: utils.withGrid(2),
                y: utils.withGrid(4),
                storyFlag: "USED_CAKE",
                foodLine: ["carefully pick up a slice of cake. Looks nice and fluffy"],
                food: "cake",
                inventoryUpdate: "INVENTORY_FULL"
            },
            Donut:{
                type: "FoodStone",
                src: "./images/donut.png",
                x: utils.withGrid(3),
                y: utils.withGrid(4),
                storyFlag: "USED_DONUT",
                foodLine: ["pick up a chocolate covered donut. You're tempted to take a bite"],
                food: "donut",
                inventoryUpdate: "INVENTORY_FULL"
            },
            Bread:{
                type: "FoodStone",
                src: "./images/bread.png",
                x: utils.withGrid(4),
                y: utils.withGrid(4),
                storyFlag: "USED_BREAD",
                foodLine: ["pick up a piece of bread. It's fresh out of the oven"],
                food: "bread",
                inventoryUpdate: "INVENTORY_FULL",
            },
            Coffee:{
                type: "FoodStone",
                src: "./images/coffee.png",
                x: utils.withGrid(5),
                y: utils.withGrid(1),
                storyFlag: "USED_COFFEE",
                foodLine: ["brew a pumpkin spice latte"],
                food: "cup of coffee",
                inventoryUpdate: "INVENTORY_FULL",
            }
        },
        walls: {
            // dynamic key -> evaluate to string
            [utils.asGridCoord(1,0)] : true,
            [utils.asGridCoord(1,1)] : true,
            [utils.asGridCoord(1,2)] : true,
            [utils.asGridCoord(1,3)] : true,
            [utils.asGridCoord(1,4)] : true,
            [utils.asGridCoord(2,0)] : true,
            [utils.asGridCoord(2,1)] : true,
            [utils.asGridCoord(3,1)] : true,
            [utils.asGridCoord(4,1)] : true,
            [utils.asGridCoord(5,1)] : true,
            [utils.asGridCoord(6,1)] : true,
            [utils.asGridCoord(7,1)] : true,
            [utils.asGridCoord(8,1)] : true,
            [utils.asGridCoord(9,1)] : true,
            [utils.asGridCoord(10,1)] : true,
            [utils.asGridCoord(11,1)] : true,
            [utils.asGridCoord(12,1)] : true,
            [utils.asGridCoord(13,1)] : true,
            [utils.asGridCoord(9,2)] : true,
            [utils.asGridCoord(10,2)] : true,
            [utils.asGridCoord(11,2)] : true,
            [utils.asGridCoord(12,2)] : true,
            [utils.asGridCoord(13,2)] : true,
            [utils.asGridCoord(14,2)] : true,
            [utils.asGridCoord(15,2)] : true,

            // top right corner
            [utils.asGridCoord(12,3)] : true,
            [utils.asGridCoord(13,3)] : true,
            [utils.asGridCoord(14,3)] : true,
            [utils.asGridCoord(12,4)] : true,
            [utils.asGridCoord(13,4)] : true,
            [utils.asGridCoord(14,4)] : true,

            // chairs/tables
            [utils.asGridCoord(12,6)] : true,
            [utils.asGridCoord(13,6)] : true,
            [utils.asGridCoord(14,6)] : true,

            [utils.asGridCoord(11,8)] : true,
            [utils.asGridCoord(12,8)] : true,
            [utils.asGridCoord(13,8)] : true,
            [utils.asGridCoord(14,8)] : true,


            [utils.asGridCoord(8,5)] : true,
            [utils.asGridCoord(9,5)] : true,
            [utils.asGridCoord(10,5)] : true,

            // cashier table
            [utils.asGridCoord(1,4)] : true,
            [utils.asGridCoord(2,4)] : true,
            [utils.asGridCoord(3,4)] : true,
            [utils.asGridCoord(4,4)] : true,
            [utils.asGridCoord(5,4)] : true,
            [utils.asGridCoord(6,4)] : true,
            
            // bottom left chairs and tables
            [utils.asGridCoord(1,6)] : true,
            [utils.asGridCoord(1,7)] : true,
            [utils.asGridCoord(1,8)] : true,

            [utils.asGridCoord(3,6)] : true,
            [utils.asGridCoord(3,7)] : true,
            [utils.asGridCoord(3,8)] : true,

            // napkins
            [utils.asGridCoord(5,8)] : true,
            [utils.asGridCoord(6,8)] : true,
            [utils.asGridCoord(7,8)] : true,
            [utils.asGridCoord(8,8)] : true,

            // lower wall
            [utils.asGridCoord(1,9)] : true,
            [utils.asGridCoord(2,9)] : true,
            [utils.asGridCoord(3,9)] : true,
            [utils.asGridCoord(4,9)] : true,
            [utils.asGridCoord(5,9)] : true,
            [utils.asGridCoord(6,9)] : true,
            [utils.asGridCoord(7,9)] : true,
            [utils.asGridCoord(8,9)] : true,
            [utils.asGridCoord(9,9)] : true,
            [utils.asGridCoord(10,9)] : true,
            [utils.asGridCoord(11,9)] : true,
            [utils.asGridCoord(12,9)] : true,
            [utils.asGridCoord(13,9)] : true,
            [utils.asGridCoord(14,9)] : true,
            
            // right wall
            [utils.asGridCoord(15,1)] : true,
            [utils.asGridCoord(15,2)] : true,
            [utils.asGridCoord(15,3)] : true,
            [utils.asGridCoord(15,4)] : true,
            [utils.asGridCoord(15,5)] : true,
            [utils.asGridCoord(15,6)] : true,
            [utils.asGridCoord(15,7)] : true,
            [utils.asGridCoord(15,8)] : true,
            [utils.asGridCoord(15,9)] : true,
            [utils.asGridCoord(15,10)] : true,

            // left wall
            [utils.asGridCoord(0,1)] : true,
            [utils.asGridCoord(0,2)] : true,
            [utils.asGridCoord(0,3)] : true,
            [utils.asGridCoord(0,4)] : true,
            //[utils.asGridCoord(0,5)] : true,
            [utils.asGridCoord(-1,5)] : true,
            [utils.asGridCoord(0,6)] : true,
            [utils.asGridCoord(0,7)] : true,
            [utils.asGridCoord(0,8)] : true,
            [utils.asGridCoord(0,9)] : true,
            [utils.asGridCoord(0,10)] : true,
        },
        cutsceneSpaces: {
            [utils.asGridCoord(0,5)] : [
                {
                    events: [
                        {who: "npcC", type: "walk", direction: "up"},
                        {who: "npcC", type: "stand", direction: "up", time: 500},
                        {type: "textMessage", text: "Manager: Hey, where you goin'?"},
                        {type: "textMessage", text: "you're shift isn't over yet!"},
                        {who: "hero", type: "stand", direction: "down"},
                        {who: "npcC", type: "walk", direction: "down"},
                    ]
                },
                {
                    required: ["COFFEE_DONE"],
                    events: [
                        {who: "npcC", type: "walk", direction: "up"},
                        {who: "npcC", type: "stand", direction: "up", time: 500},
                        {type: "textMessage", text: "I'll see you tomorrow!"},
                        {who: "hero", type: "walk", direction: "right"},
                        {who: "npcC", type: "walk", direction: "down"},
                    ]
                },
            ]
        }
    },
}
