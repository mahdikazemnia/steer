const V2D = require('vectors-2d');
const Mover = require('./Mover.js');

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


    /**
     * make's a new mover and automatically add's it to the chain
     * @param {Object} settings 
     */
    makeMover(settings) {

         settings.position = new V2D(settings.x, settings.y);
         return new Mover(settings, this.chain);
 
    }

}

module.exports = Map;