(function() {
    console.log("It's working!")
    window.addEventListener("keydown", function(e) {
        if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
            e.preventDefault();
        }
    }, false);
    const overworld = new Overworld({
        element: document.querySelector(".game-container")
    });

    overworld.init();
})();