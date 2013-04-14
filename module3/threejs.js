var renderer
var scene
var camera
var cube
var material = []
var rotateCube = false

function start() {

	// Initialize the scene
	initScene()

	// Render the scene
	renderScene()

}

function initScene() {

	// Set the scene size
	var WIDTH = 640,
		HEIGHT = 480

	// Set camera attributes
	var VIEW_ANGLE = 70,
		ASPECT = WIDTH / HEIGHT,
		NEAR = 0.1,
		FAR = 1000.0

	// Create a WebGL renderer
	renderer = new THREE.WebGLRenderer()

	// Set the clear color
	renderer.setClearColorHex(0x000000, 1.0)

	// Set the renderers size
	renderer.setSize(WIDTH, HEIGHT)

	// Add the generated canvas element to the HTML page
	document.getElementById("canvas1").appendChild(renderer.domElement)

	// Create a scene
	scene = new THREE.Scene()

	// Create a camera
	camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR)

	// Adjust camera's position
	camera.position.set(0, 0, 0)

	// Create material for the cube
	var side = "BackSide"
	material.push(new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("negx.jpg"), side: THREE[side]}))
	material.push(new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("posx.jpg"), side: THREE[side]}))
	material.push(new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("posy.jpg"), side: THREE[side]}))
	material.push(new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("negy.jpg"), side: THREE[side]}))
	material.push(new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("negz.jpg"), side: THREE[side]}))
	material.push(new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("posz.jpg"), side: THREE[side]}))

	// Create a new cube mesh
	cube = new THREE.Mesh(new THREE.CubeGeometry(100, 100, 100, 1, 1, 1), new THREE.MeshFaceMaterial(material))

	// Add the cube to the scene
	scene.add(cube)

}

function updateMaterial(side) {
	for (var i = 0; i < material.length; i++) {
		material[i].side = THREE[side]
	}
}

var mat = true

function toggleMaterial() {
	if (mat) {
		for (var i = 0; i < material.length; i++)
			material[i].map = THREE.ImageUtils.loadTexture("stone.png")
		mat = false
	} else {
		var i = 0

		material[i++].map = THREE.ImageUtils.loadTexture("negx.jpg")
		material[i++].map = THREE.ImageUtils.loadTexture("posx.jpg")
		material[i++].map = THREE.ImageUtils.loadTexture("posy.jpg")
		material[i++].map = THREE.ImageUtils.loadTexture("negy.jpg")
		material[i++].map = THREE.ImageUtils.loadTexture("negz.jpg")
		material[i++].map = THREE.ImageUtils.loadTexture("posz.jpg")
		mat = true
	}
}

function renderScene() {
	renderer.render(scene, camera)
	if (rotateCube)
		cube.rotation.y += 0.01
	requestAnimationFrame(renderScene)
}

/* ----- Mouse drag input -----*/
var mouse = {
	down: false,
	prevX: 0,
	prevY: 0
}

document.onmousedown = function(ev) {
	mouse.down = true;
	mouse.prevX = ev.pageX;
	mouse.prevY = ev.pageY;
}

document.onmouseup = function(ev) {
	mouse.down = false;
}

document.onmousemove = function(ev) {
	if (mouse.down) {
		var rotX = (ev.pageY - mouse.prevY) / 100;
		var rotY = (ev.pageX - mouse.prevX) / 100;
		cube.rotation.x -= rotX;
		cube.rotation.y -= rotY;
		mouse.prevX = ev.pageX;
		mouse.prevY = ev.pageY;
	}
}

/* ----- Mouse scroll input ----- */
function handle(delta) {
	if (delta < 0) // Scroll forward
		camera.position.z += 4
	else // Scroll backward
		camera.position.z -= 4
}

function wheel(event) {
	var delta = 0;
	if (!event) event = window.event;
	if (event.wheelDelta) {
		delta = event.wheelDelta/120; 
	} else if (event.detail) {
		delta = -event.detail/3;
	}
	if (delta)
		handle(delta);
        if (event.preventDefault)
                event.preventDefault();
        event.returnValue = false;
}

if (window.addEventListener)
	window.addEventListener('DOMMouseScroll', wheel, false);
window.onmousewheel = document.onmousewheel = wheel;
