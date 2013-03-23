var renderer
var scene
var camera

function start() {

	// Initializes the scene
	initScene()

	// Renders the scene
	renderScene()

}

function initScene() {

	// Set the scene size
	var WIDTH = 640,
		HEIGHT = 480

	// Set camera attributes
	var VIEW_ANGLE = 45,
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
	camera.position.set(0, 0, 6)

	// Create the square geometry object
	var squareGeometry = new THREE.Geometry()

	// Add vertices to the object
	squareGeometry.vertices.push(new THREE.Vector3(-1.0,  1.0, 0.0))
	squareGeometry.vertices.push(new THREE.Vector3( 1.0,  1.0, 0.0))
	squareGeometry.vertices.push(new THREE.Vector3( 1.0, -1.0, 0.0))
	squareGeometry.vertices.push(new THREE.Vector3(-1.0, -1.0, 0.0))

	// Define the faces by setting the vertices indices
	squareGeometry.faces.push(new THREE.Face4(0, 1, 2, 3))

	// Create material for the square
	var squareMaterial = new THREE.MeshBasicMaterial({
		color: 0xFF0000,
		side: THREE.DoubleSide
	})

	// Create a mesh by inserting the geometry and material
	var squareMesh = new THREE.Mesh(squareGeometry, squareMaterial)
	
	// Add the mesh to the scene
	scene.add(squareMesh)

}

function renderScene() {
	renderer.render(scene, camera)
}
