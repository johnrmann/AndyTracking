var Andy = {};

// Define constants.
Andy.SCREEN_WIDTHS_PER_ORBIT = 0.5;
Andy.SCREEN_HEIGHTS_PER_ORBIT = 1.0;

Andy.SPACE_MOON_MODEL_RADIUS = 5;
Andy.SPACE_MOON_MODEL_COMPLEXITY = 64;
Andy.SPACE_MOON_ORBIT_DISTANCE = 10;

Andy.POSITION_ZERO = new THREE.Vector3(0, 0, 0);

// Define global variables.
Andy.currentView = null;
Andy.spaceView = null;
Andy.groundViews = [];

Andy.lerp = function (x0, x1, t) {
    return ((1 - t) * x0) + (t * x1);
};

/**
 * orbitAround : (Object3D * Vector3 * float * boolean) -> (event -> void)
 *
 * This function returns a function that, when given an event, orbits a `THREE`
 * object around some point `aroundPoint` at a fixed distance `distance`. If
 * `lookAt` is set to `true`, then we have `object` face said point.
 */
Andy.orbitAround = function (object, aroundPoint, distance, lookAt) {
    // Assumes that the canvas/webgl thing consumes the entire browser view.
    return function (event) {
        var viewWidth = window.innerWidth;
        var viewHeight = window.innerHeight;

        // Calculate the change in mouse position. (Units: pixels).
        var dMouseX;
        var dMouseY;

        // Calculate the change in orientation. (Units: radians).
        var dAltitude = (dMouseX / viewWidth) * 2 * Math.PI;
        var dAzimuth = (dMouseY / viewHeight) * 2 * Math.PI;
        dAltitude *= Andy.SCREEN_WIDTHS_PER_ORBIT;
        dAzimuth *= Andy.SCREEN_HEIGHTS_PER_ORBIT;

        // Calculate the change in three-dimensional cartesian coordinates.
        var dX = distance * Math.cos(dAzimuth) * Math.sin(dAltitude);
        var dY = distance * Math.sin(dAzimuth) * Math.cos(dAltitude);
        var dZ = distance * Math.cos(dAltitude);

        // Perform the change.
        object.position.x += dX;
        object.position.y += dY;
        object.position.z += dZ;
        if (lookAt) {
            object.lookAt(aroundPoint);
        }
    };
};

/*
 In this section, we define the `View` class that is used as am abstraction
 for THREE.js scenes.
*/

Andy.View = function (uid) {
    this.uid = uid;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(/* TODO */);
    this.renderer = new THREE.WebGLRenderer();

    this.visible = false;
};

Andy.View.prototype.getObjects = function () {
    return this.scene.children;
};

Andy.View.prototype.show = function () {
    this.visible = true;
    Andy.currentView = this;

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.render();
};

Andy.View.prototype.hide = function () {
    if (this.visible) {
        this.visible = false;

    }
};

Andy.View.prototype.render = function () {
    requsetAnimationFrame(render);
    this.renderer.render(this.scene, this.camera);
};

Andy.View.prototype.setCameraPosition = function (x, y, z) {
    this.camera.position.x = x;
    this.camera.position.y = y;
    this.camera.position.z = z;
};

$(function () {
    var spaceView = new Andy.View(0);

    function setupSpaceView () {
        // Shorthand for constants used to create the model.
        var r = Andy.SPACE_MOON_MODEL_RADIUS;
        var complexity = Andy.SPACE_MOON_MODEL_COMPLEXITY;

        // Create the geometry used for the moon model, and then add it to the
        // view.
        var geo = new THREE.SphereGeometry(r, complexity, complexity);
        var mat = new THREE.MeshBasicMaterial( {color: 0x777777 });
        var sphere = new THREE.Mesh(geo, mat);
        spaceView.scene.add(sphere);

        // Move the camera into position and rotate it to look at our Moon
        // model.
        spaceView.setCameraPosition(0, 0, Andy.SPACE_MOON_ORBIT_DISTANCE);
        spaceView.camera.lookAt(Andy.POSITION_ZERO);
    }

    /*
     In this section, we perform final setup such as showing the space view.
     */

    setupSpaceView();
    spaceView.show();
});
