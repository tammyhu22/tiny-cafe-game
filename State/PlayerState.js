class PlayerState {
    constructor() {
        this.lineup = [];
        this.storyFlags = {
        }
    }

    // addPizza(pizzaId) {
    //     // const newId = `p${Date.now()}`+Math.floor(Math.random() * 99999);
    //     this.pizzas[newId] = {
    //       pizzaId,
    //       hp: 50,
    //       maxHp: 50,
    //       xp: 0,
    //       maxXp: 100,
    //       level: 1,
    //       status: null,
    //     }
    //     if (this.lineup.length < 3) {
    //       this.lineup.push(newId)
    //     }
    //     utils.emitEvent("LineupChanged");
    //   }
}

window.playerState = new PlayerState();