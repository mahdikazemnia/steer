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

        // radius (size)
        this.radius = settings.radius;

        // speed
        this.maxSpeed = settings.maxSpeed;
        this.minSpeed = settings.minSpeed;
        this.currentSpeed = 0;
        this.accPower = settings.accPower;
        this.decPower = settings.decPower;
        this.cautionRange = settings.cautionRange; // {from, to}

        // steps
        this.stepRate = 60;
        this.stepSize = 0;

        // rotation
        this.maxRotation = settings.maxRotation;
        this.minRotation = settings.minRotation;
        this.rotationControlRatio = -Math.sqrt(this.maxSpeed - this.minSpeed) / (this.minRotation - this.maxRotation); // TODO: explain 

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
    //          getters and setters
    // ---------------------------------------
    get stepSize() {
        return this.currentSpeed / this.stepRate;
    }

    get currentMaxRotation() {
        if (this.currentSpeed <= this.minSpeed) return this.maxRotation;
        return -Math.sqrt(this.currentSpeed - this.minSpeed) / this.rotationControlRatio + this.maxRotation; // TODO: explain
    }

    // ---------------------------------------
    //             speed control
    // ---------------------------------------


    /**
     * decide's to change and how to change the speed
     * @param {Number} rotation - current desired rotation (limited already)
     */
    normalizeSpeed(rotation) {
        let rotationPercent = rotation / this.currentMaxRotation * 100;
        if (rotationPercent >= this.cautionRange.to) { // unstable rotation
            this.decelerate();
        } else if (rotationPercent <= this.cautionRange.from) { // too much cautious
            this.accelerate();
        }
    }

    /**
     * increases speed by accPower
     */
    accelerate() {
        this.currentSpeed += this.accPower;
    }

    /**
     * decreases speed by decPower
     */
    decelerate() {
        this.currentSpeed -= this.decPower;
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
        this.desiredDirection.add(this.seekDirection);
    }

    /**
    * fetches the right avoidance and return's it
    * @param {Obstacle} - {type:'...' , ...}
    */
    avoid(obstacle) {

        // valid obstacle types
        let types = ['Circle'];

        // check if it's valid
        if (types.includes(obstacle.type)) return this['avoid' + obstacle.type](obstacle);
        return false;

    }

    /**
     * add's the avoid force to desiredDirection (if needed)
     * @param {Circle} circle 
     */
    avoidCircle(circle) {

        // incline
        let i = this.seekDirection.incline;

        // distance from here to circle's center
        let distance = this.position.distanceTo(circle.position);

        // if the mover would rotate with maximum ability, the circle would have this radius
        let rotateRadius = this.stepSize / (2 * Math.cos((180 - this.maxRotation) / 2 / 180 * Math.PI));

        // calculate the caution margin based on radius
        let margin = Math.sqrt(circle.radius * circle.radius + 2 * circle.radius * rotateRadius) - circle.radius;

        // in caution margin ?
        if (circle.radius + margin + this.radius > distance) {

            // crossed incline
            let i2 = -1 / i;

            // the closest point on mover's direction to circle's 
            let close = new V2D(0, 0);
            close.x = (circle.position.x - (i * this.position.y) + (i * i * this.position.x) + (i * circle.position.y)) / ((i * i) + 1);
            close.y = circle.position.y + ((close.x - circle.position.x) * i2);

            // collision ?
            if (close.distanceTo(circle.position) < circle.radius + this.radius) {

                // the "edge point" on circle
                let sign = Math.sign(close.x - circle.position.x);
                let edge = (new V2D(sign, sign * i2)).resize(circle.radius + this.radius).add(circle.position);

                // distance between "close" and "edge"
                let conflict = edge.distanceTo(close);

                // avoidance force
                let force = edge.subtract(close).resize(this.avoidRatio * conflict / distance);
                this.desiredDirection.add(force);

                return true;

            }

        }

        // no avoids?
        return false;

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

        let currentMaxRotation = this.currentMaxRotation;
        let rotation = this.desiredDirection.angle - this.currentDirection.angle;
        rotation = Math.abs(rotation) > 180 ? rotation - 360 * Math.sign(rotation) : rotation;
        rotation = Math.abs(rotation) > currentMaxRotation ? currentMaxRotation * Math.sign(rotation) : rotation;


        // step forward :)
        // this.position.add();

        // callback
        callback(this.position);
    }


}

module.exports = Mover;