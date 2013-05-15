/* ----- Constructing the scene ----- */

var renderer, scene, camera, cameraController, fogDensity = 0.05;

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
	scene.fog = new THREE.FogExp2(0x101e35, fogDensity);

	// Create a camera
	camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);

	// Create a new empty object
	cameraController = new THREE.Object3D();

	// Set it as the parent of camera
	cameraController.add(camera);

	// Add it to the scene
	scene.add(cameraController);
	cameraController.position.set(2, 3, 9);

	// Add objects to the scene
	addObjects();

	// Start rendering
	update();

}

/* ----- Render function ----- */

var wobble = 0;

function update() {

	// Render the scene
	renderer.render(scene, camera);

	// Listen for keyboard
	moveCamera();

	// Update spot light position
	moveSpotLight();

	// Update particle systems
	fireParticleSystem.update();
	smokeParticleSystem.update();

	hemisphere.rotation.z -= 0.001;
	//sphere.rotation.y += 0.01;

	pointLight.intensity = 4 + Math.sin(wobble) / 2 * Math.random();
	wobble += 0.5;

	requestAnimationFrame(update);

}

/* ----- Adds all objects to the scene ----- */

var particleSystem;

function addObjects() {
	// Transparent: smaller value closer to camera
	// Opaque: smaller value further from camera
	addSkybox();			// renderDepth = 0
	addGround();			// renderDepth = 100 (transparent)
	addHemisphere();		// renderDepth = 100 (transparent)
	addMeshes();			// renderDepth = 90 (transparent)
	addTrees();				// renderDepth = 80 (transparent)
	addLights();
	addBonfire();
	addSmoke();
}

function addBonfire() {

	// Load fire texture
	var fireTexture = THREE.ImageUtils.loadTexture("fire.png");
	fireTexture.flipY = false;

	// Create a custom particle system for fire
	fireParticleSystem = new customParticleSystem({
		maxParticles: 1000,
		energyDecrement: 3.0,
		throughPutFactor: 80.0,
		material: new THREE.ParticleBasicMaterial({
			map: fireTexture,
			color: 0xffffff,
			size: 2.5,
			transparent: true,
			alphaTest: 0.1,
			blending: THREE.AdditiveBlending,
			depthWrite: false
		}),
		onParticleInit: function(particle) {
			// Particle birth position
			particle.set(Math.sin(wobble) / 2, 0, Math.cos(wobble) / 2); 
			particle.velocity = new THREE.Vector3(0, 1, 0); // Particle direction and velocity
			particle.energy = 1.0; // Particle life force
		},
		onParticleUpdate: function(particle, delta) {
			// Move the particle vertex
			//particle.add(particle.velocity.clone().multiplyScalar(delta));
			particle.energy -= fireParticleSystem.options.energyDecrement * delta;

			var clone = particle.velocity.clone().multiplyScalar(delta);
			var randomY = Math.floor(Math.random() * 10);
			var vec = new THREE.Vector3(1, randomY, 1);
			particle.add(clone.multiply(vec));
		}
	});

	//fireParticleSystem.ps.position.set(10, 0, 0);

	// Add it to the scene
	scene.add(fireParticleSystem.ps);

	var rockMaterial = new THREE.MeshPhongMaterial({
		map: THREE.ImageUtils.loadTexture("rock.jpg"),
		color: 0xffffff,
		transparent: true
	});

	// Add rocks around the bonfire
	var rock1 = new THREE.Mesh(new THREE.SphereGeometry(0.3, 6, 6, 0, Math.PI), rockMaterial);
	rock1.rotation.x = -Math.PI / 2;
	
	var rock2 = rock1.clone();
	var rock3 = rock1.clone();
	var rock4 = rock1.clone();

	rock1.position.set(1, 0, 0);
	rock2.position.set(-1, 0, 0);
	rock3.position.set(0, 0, 1);
	rock4.position.set(0, 0, -1);

	var rocks1 = new THREE.Object3D();
	rocks1.add(rock1);
	rocks1.add(rock2);
	rocks1.add(rock3);
	rocks1.add(rock4);
	scene.add(rocks1);

	var rocks2 = rocks1.clone();
	rocks2.rotation.y = Math.PI / 6;
	scene.add(rocks2);

	var rocks3 = rocks1.clone();
	rocks3.rotation.y = Math.PI / 3;
	scene.add(rocks3);

	// Add some dirty ground as the base of the bonfire
	var bonfireBase = new THREE.Mesh(new THREE.SphereGeometry(0.5, 5, 5, 0, Math.PI), rockMaterial.clone());
	bonfireBase.material.color.setHex(0x332222);
	bonfireBase.rotation.x = -Math.PI / 2;
	bonfireBase.scale.set(2, 2, 0.5);
	scene.add(bonfireBase);

	// Create some logs on the bonfire
	var logTexture = THREE.ImageUtils.loadTexture("log.jpg");
	logTexture.wrapS = logTexture.wrapT = THREE.RepeatWrapping;

	var logMaterial = new THREE.MeshPhongMaterial({
		map: logTexture,
		bumpMap: logTexture,
		bumpScale: 0.02,
		color: 0x333030,
		transparent: true
	});


	// Create some logs in the bonfire, rotate and position them
	var logWidth = 0.4;
	var logHeight = 0.2;
	var logLength = 1.2;
	var log1 = new THREE.Mesh(new THREE.CubeGeometry(logWidth, logHeight, logLength), logMaterial);
	log1.position.set(0, 2, 0);

	var log2 = log1.clone();
	log2.position.set(0.5, 2.1, 0);
	log2.rotation.set(Math.PI / 3, Math.PI / 4, 0);

	var log3 = log2.clone();
	log3.position.set(0.2, 1.8, 0);
	log3.rotation.set(0, Math.PI / -4, Math.PI / 20);

	// Position the entire log formation and add it to the scene
	var logFormation = new THREE.Object3D();
	logFormation.add(log1);
	logFormation.add(log2);
	logFormation.add(log3);
	logFormation.position.set(-0.3, -1.5, 0)
	scene.add(logFormation);

	/*
	// Add logs around the bonfire
	var logWidth = 0.2;
	var logHeight = 0.2;
	var logLength = 2;
	var log1 = new THREE.Mesh(new THREE.CubeGeometry(logWidth, logHeight, logLength), logMaterial);
	var log2 = log1.clone();

	log1.rotation.x = Math.PI / 3;
	log1.position.z = 0.78;
	log2.rotation.x = Math.PI / -3;
	log2.position.z = -0.78;

	var logs1 = new THREE.Object3D();
	logs1.add(log1);
	logs1.add(log2);

	var logs2 = logs1.clone();
	logs2.rotation.y = Math.PI / 2;

	var logs3 = logs2.clone();
	logs3.rotation.y = Math.PI / 4;

	var logs4 = logs3.clone();
	logs4.rotation.y = 3 * Math.PI / 4;

	var logFormation = new THREE.Object3D();
	logFormation.add(logs1);
	logFormation.add(logs2);
	logFormation.add(logs3);
	logFormation.add(logs4);

	scene.add(logFormation);
	*/

}

function addSmoke() {

	// Load smoke texture
	var smokeTexture = THREE.ImageUtils.loadTexture("smoke.png");

	// Create a custom particle system for fire
	smokeParticleSystem = new customParticleSystem({
		maxParticles: 2000,
		energyDecrement: 0.05,
		throughPutFactor: 3.0,
		material: new THREE.ParticleBasicMaterial({
			map: smokeTexture,
			color: 0x122037,
			size: 8.0,
			transparent: true,
			alphaTest: 0.1,
			opacity: 0.8,
			blending: THREE.AdditiveBlending,
			depthWrite: false
		}),
		onParticleInit: function(particle) {
			// Particle birth position
			particle.set(Math.sin(wobble), 0, Math.cos(wobble)); 
			particle.velocity = new THREE.Vector3(0, 1, 0); // Particle direction and velocity
			particle.energy = 1.0; // Particle life force
		},
		onParticleUpdate: function(particle, delta) {
			// Move the particle vertex
			//particle.add(particle.velocity.clone().multiplyScalar(delta));
			particle.energy -= smokeParticleSystem.options.energyDecrement * delta;

			var clone = particle.velocity.clone().multiplyScalar(delta);
			var randomY = Math.floor(Math.random() * 4);
			var vec = new THREE.Vector3(1, randomY, 1);
			particle.add(clone.multiply(vec));
		}
	});

	// Add it to the scene
	scene.add(smokeParticleSystem.ps);

	smokeParticleSystem.ps.position.set(0, 3, 0);

}

var customParticleSystem = function(options) {

	// Store options in the object
	this.options = options;

	// Create a new geometry for particles
	this.particles = new THREE.Geometry();

	this.numAlive = 0; // Particles currently alive
	this.prevTime = new Date();
	this.throughPut = 0.0;
	this.throughPutFactor = 0.0;

	if (options.throughPutFactor !== undefined)
		this.throughPutFactor = options.throughPutFactor;

	// Add max amount of vertices to the geometry
	for (var i = 0; i < this.options.maxParticles; i++)
		this.particles.vertices.push(new THREE.Vector3(0, 0, 0));

	// Create a new particle system
	this.ps = new THREE.ParticleSystem(this.particles, this.options.material);

	this.ps.renderDepth = 0;
	this.ps.sortParticles = false;
	this.ps.geometry.__webglParticleCount = 0;
	
	this.getNumParticlesAlive = function() {
		return this.numAlive;
	}

	this.setNumParticlesAlive = function(particleCount) {
		this.numAlive = particleCount;
	}

	this.getMaxParticleCount = function() {
		return this.ps.geometry.vertices.length;
	}

	this.removeDeadParticles = function() {

		var endPoint = this.getNumParticlesAlive();

		for (var i = 0; i < endPoint; i++) {
			var particle = this.ps.geometry.vertices[i];
		
			if (particle.energy <= 0.0) {
				// Remove from array
				var tmp = this.ps.geometry.vertices.splice(i, 1);

				// Append to the end of array
				this.ps.geometry.vertices.push(tmp[0]);
				endPoint--;

				// Decrease alive count by one
				this.setNumParticlesAlive(this.getNumParticlesAlive()-1);
			}

		}

	}

	this.init = function(particleCount) {

		var previouslyAlive = this.getNumParticlesAlive();
		var newTotal = particleCount + previouslyAlive;
		newTotal = (newTotal > this.getMaxParticleCount()) ? this.getMaxParticleCount() : newTotal;
		this.setNumParticlesAlive(newTotal);

		// Initialize every vertex
		for (var i = previouslyAlive; i < newTotal; i++)
			this.options.onParticleInit(this.ps.geometry.vertices[i]);

		this.ps.geometry.verticesNeedUpdate = true;

	}

	this.update = function() {

		// Remove dead particles
		this.removeDeadParticles();

		var currentTime = new Date();
		var delta = (currentTime.getTime() - this.prevTime.getTime()) / 1000;

		this.ps.geometry.__webglParticleCount = this.getNumParticlesAlive();
		var endPoint = this.getNumParticlesAlive();
		
		for (var i = 0; i < endPoint; i++) {
			var particle = this.ps.geometry.vertices[i];
			if (particle !== undefined)
				this.options.onParticleUpdate(particle, delta);
		}

		// Add new particles according to throughput factor
		this.throughPut += this.throughPutFactor * delta;
		var numToCreate = Math.floor(this.throughPut);

		if (numToCreate > 0) {
			this.throughPut -= numToCreate;
			this.init(numToCreate);
		}

		this.ps.geometry.verticesNeedUpdate = true;
		this.prevTime = currentTime;

	}

}

var skyboxMaterials = [];

function addSkybox() {

	// Create skybox materials
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

	// Furthest distance from camera
	skybox.renderDepth = 0;

	// Lock its position to camera
	skybox.position = cameraController.position;

	// Add the skybox to the scene
	scene.add(skybox);

}

var hemisphere;

function addHemisphere() {

	// Create the cloud material
	var cloudMaterial = new THREE.MeshBasicMaterial({
		map: THREE.ImageUtils.loadTexture("clouds.png"),
		side: THREE.BackSide,
		//blending: THREE.NormalBlending,
		blending: THREE.AdditiveBlending,
		color: 0x99e3ff,
		//blending: THREE.SubtractiveBlending,
		//blending: THREE.MultiplyBlending,
		//blending: THREE.CustomBlending,
		//blendEquation: THREE.ReverseSubtractEquation,
		//blendSrc: THREE.OneMinusSrcAlphaFactor,
		//blendDst: THREE.SrcAlphaFactor,
		depthWrite: false,
		transparent: true
	});

	// Create a hemisphere which will be used to simulate clouds
	hemisphere = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 20, 0, Math.PI), cloudMaterial);
	hemisphere.rotation.x = -Math.PI / 2;
	hemisphere.renderDepth = 100;

	// Lock hemisphere to camera
	hemisphere.position = cameraController.position;

	// Add the hemisphere to the scene
	scene.add(hemisphere);

}

var treeObjects = [];

function addTrees() {

	// Load the lime texture
	var limeTexture = new THREE.ImageUtils.loadTexture("lime.png");
	limeTexture.flipY = false; // Don't flip the y-axis so we don't need to rotate the mesh

	// Create the lime material
	var limeMaterial = new THREE.MeshPhongMaterial({
		map: limeTexture,
		side: THREE.DoubleSide,
		alphaTest: 0.65,
		transparent: true
	});

	// Load the pine texture
	var pineTexture = new THREE.ImageUtils.loadTexture("pine.png");
	pineTexture.flipY = false; // Don't flip the y-axis so we don't need to rotate the mesh

	// Create the lime material
	var pineMaterial = limeMaterial.clone();
	pineMaterial.map = pineTexture;

	var numLimeTrees = 20;
	var numPineTrees = 20;
	var sizeVariation = 10;
	var minSize = 12;

	// Create lime trees
	for (var i = 0; i < numLimeTrees; i++) {

		// Randomize the tree size
		var width = height = Math.floor((Math.random() * sizeVariation) + minSize);

		// Create the first plane
		var treePlane1 = new THREE.Mesh(new THREE.PlaneGeometry(width, height, 1, 1), limeMaterial);
		treePlane1.renderDepth = 80;

		// Create the second plane and rotate it 90 degrees
		var treePlane2 = treePlane1.clone();
		treePlane2.rotation.y = Math.PI / 2;
		
		// Set up object hierarchy so we can operate with just one
		treePlane1.add(treePlane2);

		// Set the correct y-axis position
		treePlane1.position.y = height / 2;

		// Add each object to the array
		treeObjects.push(treePlane1);

	}

	// Create pine trees
	for (var i = 0; i < numPineTrees; i++) {

		var width = height = Math.floor((Math.random() * sizeVariation) + minSize);
		var treePlane1 = new THREE.Mesh(new THREE.PlaneGeometry(width, height, 1, 1), pineMaterial);
		treePlane1.renderDepth = 90;
		var treePlane2 = treePlane1.clone();
		treePlane2.rotation.y = Math.PI / 2;
		treePlane1.add(treePlane2);
		treePlane1.position.y = height / 2;
		treeObjects.push(treePlane1);

	}

	initTrees();

}

/* ----- Goes through the tree array and adds each tree to the scene ----- */

var rotation = 0;
var offset = -25; // Used to offset the point where trees are generated
var density = 70; // Lower value gives more dense forest

function initTrees() {

	// Position, rotate and add trees to the scene
	for (var i = 0; i < treeObjects.length; i++) {

		// Calculate random values for x and z coordinates
		var randomX = Math.floor((Math.random() * density) + offset);
		var randomZ = Math.floor((Math.random() * density) + offset);

		// Apply them to the current object
		treeObjects[i].position.x = randomX
		treeObjects[i].position.z = randomZ

		// Rotate the current object (every iteration adds 15 degrees)
		treeObjects[i].rotation.y = rotation += Math.PI / 12;

		// Add the current object to the scene
		scene.add(treeObjects[i]);

	}

}

var rockTexture, rockTextureBumpMap, rockTextureSpecularMap;

function addGround() {

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

	/*
	// Load specular map
	rockTextureSpecularMap = new THREE.ImageUtils.loadTexture("rock_specular_map.jpg");
	rockTextureSpecularMap.wrapS = rockTextureSpecularMap.wrapT = THREE.RepeatWrapping;
	rockTextureSpecularMap.anisotropy = renderer.getMaxAnisotropy();
	rockTextureSpecularMap.minFilter = THREE.LinearFilter;
	rockTextureSpecularMap.magFilter = THREE.LinearFilter;
	*/

	// Load normal map
	rockNormalMap = new THREE.ImageUtils.loadTexture("rock_normal_map.jpg");
	rockNormalMap.wrapS = rockNormalMap.wrapT = THREE.RepeatWrapping;
	rockNormalMap.anisotropy = renderer.getMaxAnisotropy();
	rockNormalMap.minFilter = THREE.LinearFilter;
	rockNormalMap.magFilter = THREE.LinearFilter;

	// Create a new mesh object for the ground
	var ground = new THREE.Mesh(new THREE.CubeGeometry(200, 0.2, 200, 1, 1, 1),
			new THREE.MeshPhongMaterial({
				map: rockTexture,
				/*
				bumpMap: rockTextureBumpMap,
				bumpScale: 0.05,
				*/
				normalMap: rockNormalMap,
				normalScale: new THREE.Vector2(1, 1),
				/*
				specularMap: rockTextureBumpMap,
				specular: 0x122037,
				color: 0x333333,
				emissive: 0x000000,
				shininess: 3,
				*/
				transparent: true
			}));
	ground.renderDepth = 100;
	console.log(ground);

	for (var i = 0; i < ground.geometry.faceVertexUvs[0].length; i++) {
		ground.geometry.faceVertexUvs[0][i][0] = new THREE.Vector2(0, 64);
		ground.geometry.faceVertexUvs[0][i][2] = new THREE.Vector2(64, 0);
		ground.geometry.faceVertexUvs[0][i][3] = new THREE.Vector2(64, 64);
	}

	// Add the ground to the scene
	scene.add(ground);

	/*
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
				shininess: 5
			}));
	sphere.position.set(0, 3, 5);
	scene.add(sphere);
*/
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
		var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
			map: rockTexture,
			transparent: true
		}));
		mesh.renderDepth = 90;
		ruinsObjects.push(mesh);
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

var ambientLight, directionalLight, spotLight, spotLightController, pointLight;

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

	// Add point light
	pointLight = new THREE.PointLight(0xff9933, 1, 15);
	pointLight.position.set(0, 1, 0);
	scene.add(pointLight);

}

function moveSpotLight() {

	spotLight.position = cameraController.position;
	var dir = new THREE.Vector3(0, 0, -1);
	var dirW = dir.applyMatrix4(cameraController.matrixRotationWorld);
	spotLight.target.position = dirW;

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

	/*
	if (keysPressed["P".charCodeAt(0)])
		smokeParticleSystem.init(1);
	*/

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

	var lightColor = scene.__lights[0].color;

	/* ----- Different colors to cycle through ----- */

	if (ambientColor == 0) {
		lightColor.setHex(0x0f072c); // purple
		scene.fog.color.setHex(0x0f072c);
		ambientColor = 1;

	} else if (ambientColor == 1) {
		lightColor.setHex(0xffffff); // full white
		scene.fog.color.setHex(0xffffff);
		ambientColor = 2;

	} else if (ambientColor == 2) { 
		lightColor.setHex(0x122037); // cold
		scene.fog.color.setHex(0x122037);
		ambientColor = 0;
	}

	// Color the user interface element with current color of the light
	//document.getElementById("color").style.background = "#" + lightColor.getHexString();

}

/* ----- Toggle fog option ----- */

function toggleFog() {
	scene.fog.density > 0 ? scene.fog.density = 0 : scene.fog.density = fogDensity;
}

/* ----- Toggle trees option ----- */

var renderTrees = true;

function toggleTrees() {

	if (renderTrees) {
		for (var i = 0; i < treeObjects.length; i++) {
			treeObjects[i].visible = false;
			treeObjects[i].children[0].visible = false;
		}

		renderTrees = false;

	} else {
		for (var i = 0; i < treeObjects.length; i++) {
			treeObjects[i].visible = true;
			treeObjects[i].children[0].visible = true;
		}

		renderTrees = true;

	}

}

/* ----- Toggle fire particle system option ----- */

function toggleFire() {
	fireParticleSystem.ps.visible ? fireParticleSystem.ps.visible = false
								  : fireParticleSystem.ps.visible = true;
}

/* ----- Toggle smoke particle system option ----- */

function toggleSmoke() {
	smokeParticleSystem.ps.visible ? smokeParticleSystem.ps.visible = false
								   : smokeParticleSystem.ps.visible = true;
}

/* ----- Toggle point light option ----- */

function togglePointLight() {
	pointLight.visible ? pointLight.visible = false : pointLight.visible = true;
}

/* ----- Toggle spot light option ----- */

function toggleSpotLight() {
	spotLight.visible ? spotLight.visible = false : spotLight.visible = true;
}

/* ----- Toggle sky sphere option ----- */

function toggleSkySphere() {
	hemisphere.visible ? hemisphere.visible = false : hemisphere.visible = true;
}
