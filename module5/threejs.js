/* ----- Constructing the scene ----- */

var renderer, scene, camera, cameraController;

function constructScene() {

	// Set scene size
	var WIDTH = 640,
		HEIGHT = 480;

	// Set camera settings
	var VIEW_ANGLE = 60,
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

	// Add fog to the scene
	//scene.fog = new THREE.FogExp2(0x122037, 0.05);

	// Create a camera
	camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);

	// Create a new empty object
	cameraController = new THREE.Object3D();

	// Set it as the parent of camera
	cameraController.add(camera);

	// Add it to the scene
	scene.add(cameraController);
	cameraController.position.set(2, 3, 9);
	
	// Create skybox materials
	var skyboxMaterials = [];
    skyboxMaterials.push(new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture("nightsky/nightsky_west.png"), side: THREE.BackSide, depthWrite: false }));
    skyboxMaterials.push(new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture("nightsky/nightsky_east.png"), side: THREE.BackSide, depthWrite: false }));
    skyboxMaterials.push(new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture("nightsky/nightsky_up.png"), side: THREE.BackSide, depthWrite: false }));
    skyboxMaterials.push(new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture("nightsky/nightsky_down.png"), side: THREE.BackSide, depthWrite: false }));
    skyboxMaterials.push(new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture("nightsky/nightsky_north.png"), side: THREE.BackSide, depthWrite: false }));
    skyboxMaterials.push(new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture("nightsky/nightsky_south.png"), side: THREE.BackSide, depthWrite: false }));
		
	// Create the skybox
	var skybox = new THREE.Mesh(
			new THREE.CubeGeometry(1, 1, 1, 1, 1, 1),
			new THREE.MeshFaceMaterial(skyboxMaterials)
	);

	// Lock its position to camera
	skybox.position = cameraController.position;

	// Add the skybox to the scene
	//scene.add(skybox);

	// Add objects to the scene
	addObjects();

	update();

}

/* ----- Adds all objects to the scene ----- */

function addObjects() {
	addLights();
	addArm();
	addGround();
	addMeshes();
}

var armModel, shoulder, upperArm, elbow, lowerArm,
	hand, thumb, indexFinger, middleFinger, littleFinger;

function addArm() {

	// Create an empty 3D object and hand parts. Adjust hand parts accordingly.
	armModel = new THREE.Object3D();

	shoulder = new THREE.Mesh(new THREE.SphereGeometry(1.4, 20, 20), new THREE.MeshPhongMaterial({
		color: 0x00ff00,
		transparent: true
	}));

	upperArm = new THREE.Mesh(new THREE.CubeGeometry(1, 4, 1), new THREE.MeshPhongMaterial({
		color: 0xff0000,
		transparent: true
	}));
	upperArm.position.y = 2.0;

	elbow = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 20), new THREE.MeshPhongMaterial({
		color: 0x0000ff,
		transparent: true
	}));
	elbow.position.y = 2.0;
	elbow.rotation.z = -1.0;

	lowerArm = new THREE.Mesh(new THREE.CubeGeometry(0.8, 3.6, 0.8), new THREE.MeshPhongMaterial({
		color: 0xffff00,
		transparent: true
	}));
	lowerArm.position.y = 1.8;

	hand = new THREE.Mesh(new THREE.CubeGeometry(1.2, 1.0, 1.0), new THREE.MeshPhongMaterial({
		color: 0xff00ff,
		transparent: true
	}));
	hand.position.y = 1.8;

	thumb = new THREE.Mesh(new THREE.CubeGeometry(0.3, 0.6, 0.2), new THREE.MeshPhongMaterial({
		color: 0x00ff00,
		transparent: true
	}));
	thumb.position.y = 0.0;
	thumb.position.x = 0.7;
	thumb.rotation.z = -1.0;

	indexFinger = new THREE.Mesh(new THREE.CubeGeometry(0.2, 1.6, 0.2), new THREE.MeshPhongMaterial({
		color: 0x00ff00,
		transparent: true
	}));
	indexFinger.position.y = 0.8;
	indexFinger.position.x = 0.4;
	indexFinger.rotation.z = -0.1;

	middleFinger = new THREE.Mesh(new THREE.CubeGeometry(0.2, 1.6, 0.2), new THREE.MeshPhongMaterial({
		color: 0x00ff00,
		transparent: true
	}));
	middleFinger.position.y = 0.8;
	middleFinger.position.x = 0.0;

	littleFinger = new THREE.Mesh(new THREE.CubeGeometry(0.2, 1.2, 0.2), new THREE.MeshPhongMaterial({
		color: 0x00ff00,
		transparent: true
	}));
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

	armModel.position.y = 1.0;
	armModel.scale.set(0.5, 0.5, 0.5);

	// Add the entire arm to the scene
	scene.add(armModel);

}

var rockTexture;
var customPhongShader;
var uniforms;

var SpotLightDirection;

function addGround() {

	function colorToVec4(color) {
		return new THREE.Vector4(color.r, color.g, color.b, color.a);
	}

	function XYZtoXZY(vec3) {
		// In addition to switching the order, the y-axis needs to be inverted
		return new THREE.Vector3(vec3.x, vec3.z, -vec3.y);
	}
	console.log(spotLight.position)

	uniforms = {
		t_reflectance: {
			type: "t",
			value: rockTexture
		},

		/* ----- Directional light ----- */

		u_dirlight_direction: {
			type: "v3",
			value: XYZtoXZY(directionalLight.position)
			//value: new THREE.Vector3(0, 0, 0)
			//directionalLight.position.set(1, 1, -1);
		},
		u_dirlight_color: {
			type: "v4",
			value: colorToVec4(directionalLight.color)
			//value: new THREE.Vector4(1.0, 0.0, 0.0, 1.0)
		},
		u_dirlight_intensity: {
			type: "f",
			value: directionalLight.intensity
		},

		/* ----- Spotlight ----- */
		u_spotlight_position: {
			type: "v3",
			value: spotLight.position
		},
		u_spotlight_direction: {
			type: "v3",
			value: spotLight.position
		},
		u_spotlight_color: {
			type: "v4",
			value: colorToVec4(spotLight.color)
			//value: new THREE.Vector4(0.0, 0.0, 1.0, 1.0)
		},
		u_spotlight_intensity: {
			type: "f",
			value: spotLight.intensity
		},
		u_spotlight_angle: {
			type: "f",
			value: spotLight.angle
		},
		u_spotlight_exponent: {
			type: "f",
			value: spotLight.exponent
		},
		u_spotlight_distance: {
			type: "f",
			value: spotLight.distance
		},

		/* ----- Ambient light ----- */

		u_ambient_color: {
			type: "v4",
			value: colorToVec4(ambientLight.color)
			//value: new THREE.Vector4(0, 0.2, 0, 1)
		}
	};

	// Custom shader material
	customPhongShader = new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader: document.getElementById("vertexShader").textContent,
		fragmentShader: document.getElementById("fragmentShader").textContent,
		transparent: true
	});

	// Create a new mesh object for the ground
	var ground = new THREE.Mesh(new THREE.CubeGeometry(100, 0.2, 100, 1, 1, 1), customPhongShader);

	// Load the rock texture
	rockTexture = new THREE.ImageUtils.loadTexture("rock.jpg");
	rockTexture.wrapS = rockTexture.wrapT = THREE.RepeatWrapping;
	rockTexture.anisotropy = renderer.getMaxAnisotropy();
	rockTexture.minFilter = THREE.LinearFilter;
	rockTexture.magFilter = THREE.LinearFilter;

	// Load bump map
	rockTextureBumpMap = new THREE.ImageUtils.loadTexture("rock_bump_map.jpg");
	rockTextureBumpMap.wrapS = rockTextureBumpMap.wrapT = THREE.RepeatWrapping;
	rockTextureBumpMap.anisotropy = renderer.getMaxAnisotropy();
	rockTextureBumpMap.minFilter = THREE.LinearFilter;
	rockTextureBumpMap.magFilter = THREE.LinearFilter;

	// Load specular map
	rockTextureSpecularMap = new THREE.ImageUtils.loadTexture("rock_specular_map.jpg");
	rockTextureSpecularMap.wrapS = rockTextureSpecularMap.wrapT = THREE.RepeatWrapping;
	rockTextureSpecularMap.anisotropy = renderer.getMaxAnisotropy();
	rockTextureSpecularMap.minFilter = THREE.LinearFilter;
	rockTextureSpecularMap.magFilter = THREE.LinearFilter;

	/*
	// Create a new mesh object for the ground
	var ground = new THREE.Mesh(new THREE.CubeGeometry(100, 0.2, 100, 1, 1, 1),
			new THREE.MeshPhongMaterial({
				map: rockTexture,
				bumpMap: rockTextureBumpMap,
				bumpScale: 0.05,

				specularMap: rockTextureSpecularMap,
				specular: 0x88aaff,
				color: 0x999999,
				emissive: 0x000000,
				shininess: 10,

				transparent: true
			}));
	*/

	for (var i = 0; i < ground.geometry.faceVertexUvs[0].length; i++) {
		ground.geometry.faceVertexUvs[0][i][0] = new THREE.Vector2(0, 25);
		ground.geometry.faceVertexUvs[0][i][2] = new THREE.Vector2(25, 0);
		ground.geometry.faceVertexUvs[0][i][3] = new THREE.Vector2(25, 25);
	}

	// Add the ground to the scene
	scene.add(ground);

	// Add a sphere to the scene
	sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 6, 6),
			new THREE.MeshPhongMaterial({
				map: rockTexture,
				bumpMap: rockTextureBumpMap,
				bumpScale: 0.2,
				specularMap: rockTextureSpecularMap,

				specular: 0x122037,
				color: 0x999999,
				emissive: 0x000000,
				shininess: 5,

				transparent: true
			}));
	sphere.position.set(0, 3, 5);
	scene.add(sphere);

}

/* ----- Adds all the ruins objects to the scene ----- */

var ruinsObjects = [];

function addMeshes() {

	var loader = new THREE.JSONLoader();
	loader.load("meshes/ruins30.js", handler);
	loader.load("meshes/ruins31.js", handler);
	loader.load("meshes/ruins33.js", handler);
	loader.load("meshes/ruins34.js", handler);
	loader.load("meshes/ruins35.js", handler);

	/* ----- Handles the objects ----- */

	function handler(geometry, materials) {
		/*
		ruinsObjects.push(new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
			map: rockTexture,
			transparent: true
		})));
		*/
		ruinsObjects.push(new THREE.Mesh(geometry, customPhongShader));
		isAllLoaded();
	}

	/* ----- Rotates, adjusts positions and scales the ruins objects ----- */

	function isAllLoaded() {

		if (ruinsObjects.length == 5) {

			// Rotate and scale all objects and add them to the scene
			for (var i = 0; i < ruinsObjects.length; i++) {

				var mesh = ruinsObjects[i];
				mesh.rotation.x = Math.PI / 2;
				mesh.scale.multiplyScalar(2);
				mesh.position.y = 0.0;
				scene.add(mesh);

			}

			// Adjust some mesh positions
			ruinsObjects[0].position.z = 20;
			ruinsObjects[0].rotation.z = 0;

			ruinsObjects[1].position.x = 20;
			ruinsObjects[1].rotation.z = 0.6;

			ruinsObjects[2].position.z = -10;
			ruinsObjects[2].position.x = 8;
			ruinsObjects[3].position.z = -10;

		}

	}

}

/* ----- Adds lights to the scene ----- */

var ambientLight, directionalLight, spotLight, spotLightController;

function addLights() {

	// Add an ambient light
	ambientLight = new THREE.AmbientLight(0x122037);
	scene.add(ambientLight);

	// Add a directional light
	directionalLight = new THREE.DirectionalLight(0x88aaff, 1.0);
	directionalLight.position.set(1, 1, -1);
	scene.add(directionalLight);

	// Add a spot light
	var intensity = 16.0;
	var distance = 20.0;
	spotLight = new THREE.SpotLight(0xffbbaa, intensity, distance);
	spotLight.angle = 0.4;
	spotLight.exponent = 250.0;
	scene.add(spotLight);

	// Add spot light direction
	spotLightController = new THREE.Object3D();
	spotLight.target = spotLightController;
	camera.add(spotLightController);

}

function moveSpotLight() {

	spotLight.position = cameraController.position;
	var dir = new THREE.Vector3(0, 0, -1);
	var dirW = dir.applyMatrix4(cameraController.matrixRotationWorld);
	spotLight.target.position = dirW;

	/* ----- Update uniforms ----- */

	// Get the world space coordinates for the spotlight controller, subtract
	// spotlight's position coordinates from it, and invert the vector to get
	// the actual direction of the spotlight
	uniforms.u_spotlight_direction.value = camera.localToWorld(spotLightController.position.clone()).sub(spotLight.position).negate();
	uniforms.u_spotlight_position.value = spotLight.position;

}


/* ----- Render function ----- */

function update() {

	// Render the scene
	renderer.render(scene, camera);

	// Listen for keyboard
	moveCamera();

	// Update spot light position
	moveSpotLight();

	// Make the arm wave
	wave();

	sphere.rotation.y += 0.01;

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
		for (var i = 0; i < scene.__webglObjects.length; i++) {
			scene.__webglObjects[i].object.material.wireframe = true;
			scene.__webglObjects[i].object.castShadow = true;
			scene.__webglObjects[i].object.receiveShadow = true;
		}
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

	var lightColor = scene.__lights[0].color;

	/* ----- Different colors to cycle through ----- */

	if (ambientColor == 0) {
		lightColor.setHex(0x745616); // warm
		ambientColor = 1;

	} else if (ambientColor == 1) {
		lightColor.setHex(0xffffff); // full white
		ambientColor = 2;

	} else if (ambientColor == 2) { 
		lightColor.setHex(0x122037); // cold
		ambientColor = 0;
	}


	// Color the user interface element with current color of the light
	document.getElementById("color").style.background = "#" + lightColor.getHexString();
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

		camera.rotation.x -= rotX;
		cameraController.rotation.y -= rotY;
		//armModel.position.y -= rotX;
		//armModel.rotation.y -= rotY;

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

	// Reduce movement speed if shift is pressed
	if (keysPressed["16"])
		moveSpeed /= 10;

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
