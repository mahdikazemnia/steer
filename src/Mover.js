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
        this.position = new V2D(settings.position);

        // speed
        this.maxSpeed = settings.maxSpeed;
        this.minSpeed = settings.minSpeed;
        this.currentSpeed = 0;
        this.stepRate = 60;
        this.stepSize = 0;

        // direction (current, deisred, seek)
        this.currentDirection = new V2D(0, 0);
        this.desiredDirection = new V2D(0, 0);
        this.seekDirection = new V2D(0, 0);

        // add referenced values to the chain
        this.info.position = this.position;
        this.info.currentDirection = this.currentDirection;
        this.info.desiredDirection = this.desiredDirection;
        this.info.seekDirection = this.seekDirection;

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
        this.seekDirection.reset(force.x, force.y);
        this.desiredDirection.add(force);
    }

    /**
     * step's toward the point, return's callback(position)
     * @param {V2D} point
     * @param {Function} callback
     */
    stepToward(point, callback) {
        // reset the desiredDirection
        this.desiredDirection.reset(0, 0);

        // seek
        this.seek(point);

        // avoid(s)
        this.chain.obstacles.forEach(o => this.avoid(o));

        // set the direction
        this.currentDirection.add(this.desiredDirection);

        // step forward :)
        this.position.add(this.currentDirection.limit(0, this.maxSpeed));

        // callback
        callback(this.position);
    }


}

module.exports = Mover;