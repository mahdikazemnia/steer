const V2D = require('vectors-2d');

class Map {

    constructor(settings) {

        /**
        * the chain holding map's info
        * movers and obstacles have access to this chain so they can be aware of each other and the map
        */
        this.chain = {
            map: {},
            movers: [],
            obstacles: [],
        };

        // set the size ([width,height])
        this.size = this.chain.map.size = settings.size;

    }

}

module.exports = Map;