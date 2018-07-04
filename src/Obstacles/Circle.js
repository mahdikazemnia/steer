class Circle {

    constructor(position, radius, chain) {

        // join the chain
        this.info = {};
        this.info.id = chain.obstacles.length;
        this.info.type = 'Circle';
        this.chain = chain;
        this.chain.obstacles.push(this.info);

        // position
        this.position = position;

        // radius (size)
        this.radius = radius;

        // attach referencable share info (objects)
        this.info.position = this.position;

    }

    // ---------------------------------------
    //          getters and setters
    // ---------------------------------------

    set radius(param) { this._radius = this.info.radius = param; }
    get radius() { return this._radius; }


}

module.exports = Circle;