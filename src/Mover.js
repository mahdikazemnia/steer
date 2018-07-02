const V2D = require('vectors-2d');

class Mover {

    constructor(settings, chain) {

        // info object to share with the chain
        this.info = {};
        this.info.id = chain.movers.length;

        // join the chain
        this.chain = chain;
        this.chain.movers.push(this.info);

        // position
        this.position = settings.position;

        // speed
        this.maxSpeed = settings.maxSpeed; // current speed

        // velocity (current, deisred, seek)
        this.currentVelocity = new V2D(0, 0);
        this.desiredVelocity = new V2D(0, 0);
        this.seekVelocity = new V2D(0, 0);

        // add referenced values to the chain
        this.info.position = this.position;
        this.info.currentVelocity = this.currentVelocity;
        this.info.desiredVelocity = this.desiredVelocity;
        this.info.seekVelocity = this.seekVelocity;

        // seek and avoid ratios
        this.seekRatio = settings.seekRatio;
        this.avoidRatio = settings.avoidRatio;

    }


    // ---------------------------------------
    //              operations
    // ---------------------------------------

    /**
     * add's the seek force to the desiredDirection
     * @param {V2D} point 
     */
    seek(point) {
        let force = point.clone().subtract(this.position).resize(this.seekRatio);
        this.seekVelocity.reset(force.x, force.y);
        this.desiredVelocity.add(force);
    }


}

module.exports = Mover;