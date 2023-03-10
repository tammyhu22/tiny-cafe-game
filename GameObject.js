class GameObject {
    constructor(config) {
        this.id = null;
        this.isMounted = false;
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.direction = config.direction || "down";
        this.sprite = new Sprite({
            gameObject: this,
            src: config.src || "./images/hero.png", // default hero sprite sheet
        });

        this.behaviorLoop = config.behaviorLoop || [];
        this.behaviorLoopIndex = 0;

        this.talking = config.talking || [];

        this.retryTimeout = null;
    }

    mount(map) {
        this.isMounted = true;

        // if we have a behavior, kick off after a short delay
        setTimeout(() => {
            this.doBehaviorEvent(map);
        }, 10)
    }

    update() {

    }

    // await means code will take a while, will wait until that line is done, mark function as async
    async doBehaviorEvent(map) {
        // don't do anything if there is a more important cutscene or i don't have config to do anything anyway
        if (this.behaviorLoop.length === 0 || this.isStanding) {
            return;
        }

        if (map.isCutscenePlaying) {
            if (this.retryTimeout) {
                clearTimeout(this.retryTimeout);
            }

            this.retryTimeout = setTimeout(() => {
                this.doBehaviorEvent(map);
            }, 1000)
            return;
        }

        // setting up our event with relevant info
        let eventConfig = this.behaviorLoop[this.behaviorLoopIndex];
        eventConfig.who = this.id; // hero, npcA, npcB

        // create an event instance out of our next event config
        const eventHandler = new OverworldEvent({ map, event: eventConfig }); // overworld event will contain instructions
        await eventHandler.init(); // returns promise, when resolved continue with loop

        // setting the next event to fire
        this.behaviorLoopIndex += 1;
        // console.log(behaviorLoopIndex)
        if (this.behaviorLoopIndex === this.behaviorLoop.length) {
            this.behaviorLoopIndex = 0;
        }
        // do again
        this.doBehaviorEvent(map);
    }
}
