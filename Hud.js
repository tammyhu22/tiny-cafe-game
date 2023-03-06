class Hud {
    constructor() {
        
    }

    update () {

    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("Hud");

        const {playerState} = window;
        this.element.innerHTML = (`
        <img class = "picture"
        type = png
        src = "/images/cake.png"
        width = "20px" height = "20px"></p>
        `)

    }

    init() {
        this.createElement();
    }
}