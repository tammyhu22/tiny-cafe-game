class Hud {
    constructor() {
        
    }

    update () {

    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("Hud");

        const {playerState} = window;
        
    }

    init(container) {
        this.createElement();
        container.appendChild(container);
    }
}