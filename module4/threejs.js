/* ----- Constructing the scene ----- */

var renderer, scene, camera, cameraController;

function constructScene() {

	// Set scene size
	var WIDTH = 640,
		HEIGHT = 480;

	// Set camera settings
	var VIEW_ANGLE = 70,
		ASPECT = WIDTH / HEIGHT,
		NEAR = 0.1,
		FAR = 1000.0;

	// Create a new renderer
	renderer = new THREE.WebGLRenderer({
		canvas: document.getElementById("canvas1"), // canvas element to be used for drawing
		clearColor: 0x000000, // clear color
		clearAlpha: 1.0, // clear alpha
		antialias: true // anti-aliasing
	});

	// Set the renderer size
	renderer.setSize(WIDTH, HEIGHT);

	// Create a new scene
	scene = new THREE.Scene();

	// Create a camera
	camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);

	// Create a new empty object
	cameraController = new THREE.Object3D();

	// Set it as the parent of camera
	cameraController.add(camera);

	// Add it to the scene
	scene.add(cameraController);
	cameraController.position.set(0, 3, 9);

	// Add objects to the scene
	addObjects();

	update();

}

/* ----- Adding objects to the scene ----- */

function addObjects() {

	// Create an empty 3D object and hand parts. Adjust hand parts accordingly.
	armModel = new THREE.Object3D();

	shoulder = new THREE.Mesh(new THREE.SphereGeometry(1.4, 20, 20), new THREE.MeshLambertMaterial({ color: 0x00ff00 }));

	upperArm = new THREE.Mesh(new THREE.CubeGeometry(1, 4, 1), new THREE.MeshLambertMaterial({ color: 0xff0000 }));
	upperArm.position.y = 2.0;

	elbow = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 20), new THREE.MeshLambertMaterial({ color: 0x0000ff }));
	elbow.position.y = 2.0;
	elbow.rotation.z = -1.0;

	lowerArm = new THREE.Mesh(new THREE.CubeGeometry(0.8, 3.6, 0.8), new THREE.MeshLambertMaterial({ color: 0xffff00 }));
	lowerArm.position.y = 1.8;

	hand = new THREE.Mesh(new THREE.CubeGeometry(1.2, 1.0, 1.0), new THREE.MeshLambertMaterial({ color: 0xff00ff }));
	hand.position.y = 1.8;

	thumb = new THREE.Mesh(new THREE.CubeGeometry(0.3, 0.6, 0.2), new THREE.MeshLambertMaterial({ color: 0x00ff00 }));
	thumb.position.y = 0.0;
	thumb.position.x = 0.7;
	thumb.rotation.z = -1.0;

	indexFinger = new THREE.Mesh(new THREE.CubeGeometry(0.2, 1.6, 0.2), new THREE.MeshLambertMaterial({ color: 0x00ff00 }));
	indexFinger.position.y = 0.8;
	indexFinger.position.x = 0.4;
	indexFinger.rotation.z = -0.1;

	middleFinger = new THREE.Mesh(new THREE.CubeGeometry(0.2, 1.6, 0.2), new THREE.MeshLambertMaterial({ color: 0x00ff00 }));
	middleFinger.position.y = 0.8;
	middleFinger.position.x = 0.0;

	littleFinger = new THREE.Mesh(new THREE.CubeGeometry(0.2, 1.2, 0.2), new THREE.MeshLambertMaterial({ color: 0x00ff00 }));
	littleFinger.position.y = 0.8;
	littleFinger.position.x = -0.4;
	littleFinger.rotation.z = 0.1;

	// Attach objects to each other
	armModel.add(shoulder);
	shoulder.add(upperArm);
	upperArm.add(elbow);
	elbow.add(lowerArm);
	lowerArm.add(hand);
	hand.add(thumb);
	hand.add(indexFinger);
	hand.add(middleFinger);
	hand.add(littleFinger);

	// Add the entire arm to the scene
	scene.add(armModel);

	// Add an ambient light
	var ambientLight = new THREE.AmbientLight(0x000000);
	scene.add(ambientLight);

	// Add a directional light
	var directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
	directionalLight.position.set(0, 0, 1).normalize();
	scene.add(directionalLight);

}

/* ----- Render function ----- */

function update() {

	// Render the scene
	renderer.render(scene, camera);

	// Listen for keyboard
	moveCamera();

	// Make the arm wave
	wave();

	requestAnimationFrame(update);

}

/* ----- Hand wave animation ----- */

var counter = 0.0;

function wave() {

	shoulder.rotation.z = Math.cos(counter) / 2 + 0.3;
	elbow.rotation.z = Math.sin(counter) / 2 - 0.6;
	hand.rotation.x = Math.sin(counter) / 1 + 0.6;

	counter += 0.1;

}

/* ----- Toggle wireframe option ----- */

// General switch for all scene objects' wireframe mode
var wireframe = false;

function toggleWireframe() {

	if (!wireframe) {
		for (var i = 0; i < scene.__webglObjects.length; i++)
			scene.__webglObjects[i].object.material.wireframe = true;
		wireframe = true;

	} else {
		for (var i = 0; i < scene.__webglObjects.length; i++)
			scene.__webglObjects[i].object.material.wireframe = false;
		wireframe = false;

	}

}

/* ----- Toggle ambient light option ----- */

var ambientColor = 0;

function toggleAmbientLightColor() {

	var element = document.getElementById("color");

	if (ambientColor == 0) { 
		scene.__lights[0].color.setHex(0x000033); // cold
		element.style.background = "rgba(0, 0, 51, 0.8)";
		ambientColor = 1;

	} else if (ambientColor == 1) {
		scene.__lights[0].color.setHex(0x330000); // warm
		element.style.background = "rgba(51, 0, 0, 0.8)";
		ambientColor = 2;

	} else if (ambientColor == 2) {
		scene.__lights[0].color.setHex(0xffffff); // full white
		element.style.background = "rgba(255, 255, 255, 0.8)";
		ambientColor = 3;

	} else if (ambientColor == 3) {
		scene.__lights[0].color.setHex(0x000000); // neutral
		element.style.background = "rgba(0, 0, 0, 0.8)";
		ambientColor = 0;

	}

}

/* ----- Input handling ----- */

var mouse = {
	down: false,
	prevX: 0,
	prevY: 0
}

var keysPressed = [];

function initControls() {

	/* ----- Mouse listeners ----- */

	document.onmousedown = function() {
		mouse.down = true;
		mouse.prevX = event.pageX;
		mouse.prevY = event.pageY;
	}

	document.onmouseup = function() {
		mouse.down = false;
	}

	document.onmousemove = function() {
		if (!mouse.down)
			return;

		var rotX = (event.pageY - mouse.prevY) / 100;
		var rotY = (event.pageX - mouse.prevX) / 100;

		//camera.rotation.x -= rotX;
		//cameraController.rotation.y -= rotY;
		armModel.position.y -= rotX;
		armModel.rotation.y -= rotY;

		mouse.prevX = event.pageX;
		mouse.prevY = event.pageY;

	}

	/* ----- Keyboard listeners ----- */

	document.onkeydown = function() {
		keysPressed[event.keyCode] = true;
	}

	document.onkeyup = function() {
		keysPressed[event.keyCode] = false;
	}

}

/* ----- Keyboard controls ----- */

function moveCamera() {

	var moveSpeed = 0.2;

	if (keysPressed["W".charCodeAt(0)]) {
		var dir = new THREE.Vector3(0, 0, -1);
		var dirW = dir.applyMatrix4(cameraController.matrixRotationWorld);
		cameraController.translate(moveSpeed, dirW);
	}

	if (keysPressed["S".charCodeAt(0)]) {
		var dir = new THREE.Vector3(0, 0, 1);
		var dirW = dir.applyMatrix4(cameraController.matrixRotationWorld);
		cameraController.translate(moveSpeed, dirW);
	}

	if (keysPressed["A".charCodeAt(0)]) {
		var dir = new THREE.Vector3(-1, 0, 0);
		var dirW = dir.applyMatrix4(cameraController.matrixRotationWorld);
		cameraController.translate(moveSpeed, dirW);
	}

	if (keysPressed["D".charCodeAt(0)]) {
		var dir = new THREE.Vector3(1, 0, 0);
		var dirW = dir.applyMatrix4(cameraController.matrixRotationWorld);
		cameraController.translate(moveSpeed, dirW);
	}

}
