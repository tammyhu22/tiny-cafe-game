class OverworldMap {
    constructor(config) {
        this.gameObjects = config.gameObjects;
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
        return this.walls[`${x},${y}`] || false; // true if wall is there
    }

    mountObjects() {
        Object.keys(this.gameObjects).forEach(key => {
            
            let object = this.gameObjects[key];
            object.id = key; // like hero, or npc1
            // To do: determine if this object should actually mount, has an action happened
            object.mount(this);
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
            console.log(events.length);
            console.log(i);

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
            this.startCutscene(match.talking[0].events);
            // const relevantScenario = match.talking.find(scenario => {
            //     return (scenario.required || []).every(sf => {
            //         return PlayerState.storyFlags[sf]
            //     })
            // })
            // relevantScenario && this.startCutscene(relevantScenario.events);
        }
    }

    checkForFootstepCutscene() {
        const hero = this.gameObjects["hero"];
        const match = this.cutsceneSpaces[ `${hero.x},${hero.y}` ];
        console.log({ match });
        if (!this.isCutscenePlaying && match) {
            this.startCutscene(match[0].events);
        }
    }

    addWall(x,y) {
        this.walls[`${x},${y}`] = true;
    }

    removeWall(x,y) {
        delete this.walls[`${x},${y}`]
    }

    moveWall(wasX,wasY, direction) {
        this.removeWall(wasX, wasY);
        const {x,y} = utils.nextPosition(wasX, wasY, direction); // new wall
        this.addWall(x,y); // create new wall
    }
}

window.OverworldMaps = {
    Cafe: {
        lowerSrc: "./images/mapLower.png",
        upperSrc:"./images/mapUpper.png",
        gameObjects: {
            hero: new Person({
                isPlayerControlled: true,
                x: utils.withGrid(5),
                y: utils.withGrid(6),
            }),
            npcA: new Person({
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
                        events: [
                            {type: "textMessage", text: "Kelly: can I help you?", faceHero:"npcA"},
                            {type: "textMessage", text: "I'm busy"},
                            {who: "hero", type: "walk", direction: "up"},
                        ]
                    },
                ]
            }),
            npcB: new Person({
                x: utils.withGrid(10),
                y: utils.withGrid(3),
                src: "./images/npc3.png",
                behaviorLoop: [ // idle behavior loop
                    { type: "walk", direction: "left" },
                    { type: "stand", direction: "up", time: 800 },
                    { type: "walk", direction: "down" },
                    { type: "walk", direction: "right" }, 
                    { type: "walk", direction: "up" },
                ],
                talking: [
                    // {
                    //     required: ["SERVED_CORRECT"],
                    //     events: [
                    //         {type: "textMessage", text: "Eric: Oh thanks!", faceHero: "npc"},
                    //     ]
                    // },
                    {
                        events: [
                            {type: "textMessage", text: "You: Hey, sorry to bother you,", faceHero:"npcB"},
                            {type: "textMessage", text: "May I ask what you ordered?"},
                            {type: "textMessage", text: "Eric: Uh..one of your lattes and cake I think."},
                            {type: "textMessage", text: "You: Ok thanks!"},
                        ]
                    },
                ]
            }),
            npcC: new Person({
                x: utils.withGrid(2),
                y: utils.withGrid(7),
                src: "./images/erio.png",
                behaviorLoop: [ // idle behavior loop
                    { type: "stand", direction: "left" },
                ],
                talking: [
                    {
                        events: [
                            {type: "textMessage", text: "Manager: If you have any questions,", faceHero:"npcC"},
                            {type: "textMessage", text: "just don't ask me"},
                            {type: "textMessage", text: "I'm too busy wiping these tables, haha", faceHero:"npcC"},
                            {who: "hero", type: "walk", direction: "up"},
                            {who: "npcC", type: "stand", direction: "down"},
                        ]
                    },
                ]
            }),
            FoodStone:new FoodStone({
                x: utils.withGrid(2),
                y: utils.withGrid(4),
                storyFlag: "USED_CAKE"
            })
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
                        {type: "textMessage", text: "Hey, where you goin'?"},
                        {type: "textMessage", text: "you're shift isn't over yet!"},
                        {who: "hero", type: "walk", direction: "right"},
                        {who: "npcC", type: "walk", direction: "down"},
                    ]
                }
            ]
        }
    },
}
