class OverworldEvent {
    constructor({map, event}) {
        this.map = map;
        this.event = event;
    }

    stand(resolve) {
        const who = this.map.gameObjects[ this.event.who ];
        who.startBehavior({
            map: this.map
        }, {
            type: "stand",
            direction: this.event.direction, // comes from overworld map
            time: this.event.time
        })

        // set up a handler to complete when correct person is done walking, then resolve the event
        const completeHandler = e => {
            if(e.detail.whoId === this.event.who) {
                document.removeEventListener("PersonStandComplete", completeHandler);
                resolve();
            }
        }
        document.addEventListener("PersonStandComplete", completeHandler)
    }

    walk(resolve) {
        // call resolve when done
        const who = this.map.gameObjects[ this.event.who ];
        who.startBehavior({
            map: this.map
        }, {
            type: "walk",
            direction: this.event.direction, // comes from overworld map
            retry: true // not always appropriate to do (for hero), but if something interrupts a scheduled walk then we pass this retry flag
        })

        // set up a handler to complete when correct person is done walking, then resolve the event
        const completeHandler = e => {
            if(e.detail.whoId === this.event.who) {
                document.removeEventListener("PersonWalkingComplete", completeHandler);
                resolve();
            }
        }
        document.addEventListener("PersonWalkingComplete", completeHandler)
    }

    textMessage(resolve) {

        if (this.event.faceHero) {
            const obj = this.map.gameObjects[this.event.faceHero];
            obj.direction = utils.oppositeDirection(this.map.gameObjects["hero"].direction);
        }

        const message = new TextMessage({
            text: this.event.text,
            onComplete: () => resolve()
        })
        message.init( document.querySelector(".game-container") ) // passing where it should inject the text
    }

    addStoryFlag(resolve) {
        window.playerState.storyFlags[this.event.flag] = true;
        console.log(window.playerState.storyFlags);
        window.playerState.currentFood = this.event.food;
        console.log(window.playerState.currentFood);
        if (window.playerState.storyFlags["CAKE_DONE"] === true && window.playerState.storyFlags["COFFEE_DONE"] === true && window.playerState.storyFlags["DONUT_DONE"] === true && window.playerState.storyFlags["BREAD_DONE"] === true) {
            window.playerState.storyFlags["ALL_DONE"] = true;
        }
        // const display = new Hud();
        // display.init();
        resolve();
      }

    disableStoryFlag(resolve) {
        window.playerState.storyFlags[this.event.flag] = false;
        console.log(window.playerState.storyFlags);
        window.playerState.currentFood = "";
        resolve();
    }

    //   addToTray(resolve) {
        
    //     resolve();
    //   }

    addToHud (resolve) {
        if(window.playerState.storyFlags["INVENTORY_FULL"] = true) {
            // if one of these "USED_DONUT, USED_CAKE, USED_COFFEE, USED_BREAD = TRUE"
            // display donut, if used_donut is true, or display cake if used_cake is true
            // QUESTION: IS THERE A WAY TO REPLACE A CONSTANT
        } else {
            // show nothing in top right corner
            return;
        }
        resolve();
    }

    init() {
        return new Promise(resolve => {
            this[this.event.type](resolve)
        })
    }
}