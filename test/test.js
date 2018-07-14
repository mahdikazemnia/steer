const Map = require('./src/Map.js');
const V2D = require('vectors-2d');

let map = new Map(1000, 600);

let mover = map.makeMover({
    position: [0, 0],
    cautionRange: { from: 80, to: 90 },
    maxSpeed: 200,
    minSpeed: 10,
    accPower: 5,
    decPower: 3,
    maxRotation: 10,
    minRotation: 2,
    seekRatio: 1,
    avoidRatio: 1
});

window.point = new V2D(400, 100);

let div1 = document.querySelector('main #mover1');

document.querySelector('main').onmousedown = function (ev) {
    point.reset(ev.offsetX, ev.offsetY);
};

window.step = function () {
    if (mover.position.distanceTo(point) > 50) {
        mover.stepToward(point, function (pos) {
            // console.log(pos);
            div1.style.left = pos.x + 'px';
            div1.style.top = pos.y + 'px';
        });
    }
}
setInterval(() => {
    step();
}, 16);
