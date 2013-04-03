var WebGLApp = function() {

	var that = this			// Used to access to object itself
	this.canvas = null		// Canvas where we draw our renders
	this.gl = null			// The WebGL context
	this.vertexData = null	// Vertex data buffer
	this.indices = null		// Vertex index data buffer

	this.projectionMatrix = new THREE.Matrix4()
	this.modelViewMatrix = new THREE.Matrix4()

	this.shaderProgram = null

	this.mode = "TRIANGLE_FAN"	// Rendering mode
	this.radius = 1.0			// Radius of the circle
	this.numVertices = 10		// Number of angles in the circle

	/**
	 * Application initialization. Called after body has finished loading.
	 * Accepts a canvas element as a parameter, which is given in the HTML
	 * document.
	 */
	this.start = function(canvas) {

		that.canvas = canvas

		// Initialize WebGL
		that.initWebGL()

		// Initialize data and shaders
		that.initData()
		that.initShaders()

		// Define screen clear color
		that.gl.clearColor(0.0, 0.0, 0.0, 1.0)

		// Enable depth test
		that.gl.enable(that.gl.DEPTH_TEST)

		// Draw everything
		that.render()

	}

	/**
	 * WebGL context initialization.
	 */
	this.initWebGL = function() {

		// Try to grab the standard context. If if fails, fallback to the
		// experimental context.
		try {
			that.gl = that.canvas.getContext("webgl") || that.canvas.getContext("experimental-webgl")
			that.gl.viewportWidth = that.canvas.width
			that.gl.viewportHeight = that.canvas.height
		} catch (e) {
			console.error("An error occurred initializing WebGL:", e)
		}

		if (that.gl)
			console.log("WebGL initialized.")

	}

	/**
	 * Data initialization.
	 */
	this.initData = function() {

		// Create buffer for vertex data
		that.vertexData = that.gl.createBuffer()

		// Bind the buffer to make it active
		that.gl.bindBuffer(that.gl.ARRAY_BUFFER, that.vertexData)

		// Define the size of angle for each vertex
		var delta = 360 / that.numVertices

		// Store vertex angles in an array
		var angles = []

		for (var theta = 0; theta < 360; theta += delta)
			angles.push(theta) // Add each vertex angle to the array

		// Copy data from angles array to buffer
		that.gl.bufferData(that.gl.ARRAY_BUFFER,
				new Float32Array(angles),
				that.gl.STATIC_DRAW)

		that.vertexData.itemSize = 1 // How many floats does a single vertex element need
		//that.vertexData.numItems = 6 // How many vertex elements exist in the buffer

		// Create an element array buffer where we can store vertex indices
		that.indices = that.gl.createBuffer()

		// Bind the buffer to make it active
		that.gl.bindBuffer(that.gl.ELEMENT_ARRAY_BUFFER, that.indices)

		// Define indices
		var indices = []
		for (var i = 0; i < that.numVertices; i++)
			indices.push(i)

		// Copy data from indices array to buffer
		that.gl.bufferData(that.gl.ELEMENT_ARRAY_BUFFER,
				new Uint8Array(indices),
				that.gl.STATIC_DRAW)

		// Size of each index value (UNSIGNED_BYTE for index values between 0 and 255)
		that.indices.itemSize = that.gl.UNSIGNED_BYTE

		// Number of elements in the index array
		that.indices.numItems = indices.length

		console.log("Data initialized.")

	}

	/**
	 * Shader initialization.
	 */
	this.initShaders = function() {

		// Compile vertex and fragment shaders
		var vs = that.compileShader("shader-vs")
		var fs = that.compileShader("shader-fs")

		// Create the shader program
		that.shaderProgram = that.gl.createProgram()

		// Attach shaders into the shader program
		that.gl.attachShader(that.shaderProgram, vs)
		that.gl.attachShader(that.shaderProgram, fs)

		// Link shader program
		that.gl.linkProgram(that.shaderProgram)

		// Check if the shader program linked successfully
		if (!that.gl.getProgramParameter(that.shaderProgram, that.gl.LINK_STATUS))
			console.error("An error occurred linking the shaders:", that.gl.getProgramInfoLog(that.shaderProgram))

		// Enable program
		that.gl.useProgram(that.shaderProgram)

		// Access attribute location in program
		that.shaderProgram.vertexAngleAttribute = that.gl.getAttribLocation(that.shaderProgram, "aVertexAngle")

		// Access uniform parameters (matrices)
		that.shaderProgram.projection = that.gl.getUniformLocation(that.shaderProgram, "uProjection")
		that.shaderProgram.modelView = that.gl.getUniformLocation(that.shaderProgram, "uModelView")

		// Access radius uniform
		that.shaderProgram.radius = that.gl.getUniformLocation(that.shaderProgram, "uRadius")

	}

	this.compileShader = function(id) {
		
		// Get the shader's script element
		var script = document.getElementById(id)

		// Get the shader code
		var src = script.firstChild.textContent

		// Initialize variable for our shader
		var shader = null

		// Create appropriate type of shader
		if (script.type == "x-shader/x-fragment")
			shader = that.gl.createShader(that.gl.FRAGMENT_SHADER)
		else if (script.type == "x-shader/x-vertex")
			shader = that.gl.createShader(that.gl.VERTEX_SHADER)
		else {
			console.error("Unknown shader type:", script.type)
			return null
		}

		// Set the shader source
		that.gl.shaderSource(shader, src)

		// Compile the shader source
		that.gl.compileShader(shader)

		if (!that.gl.getShaderParameter(shader, that.gl.COMPILE_STATUS)) {
			console.error("An error occurred compiling the shaders:" + that.gl.getShaderInfoLog(shader))
			return null
		}

		return shader

	}

	this.render = function() {
		
		// Adjust viewport to fill the entire canvas area
		that.gl.viewport(0, 0, that.gl.viewportWidth, that.gl.viewportHeight)

		// Clear the screen
		that.gl.clear(that.gl.COLOR_BUFFER_BIT | that.gl.DEPTH_BUFFER_BIT)

		// Define the camera
		var ASPECT_RATIO = that.gl.viewportWidth / that.gl.viewportHeight
		var HALF_WIDTH = 3.0 * ASPECT_RATIO / 2
		var HALF_HEIGHT = 3.0 / 2

		// makeOrthographic(left, right, bottom, top, near, far)
		that.projectionMatrix.makeOrthographic(-HALF_WIDTH, HALF_WIDTH, HALF_HEIGHT, -HALF_HEIGHT, -0.1, 2.0)
		that.modelViewMatrix.identity()

		that.gl.useProgram(that.shaderProgram) //?

		// Bind buffer for next operation
		that.gl.bindBuffer(that.gl.ARRAY_BUFFER, that.vertexData) //?

		// Bind buffer data to shader attribute
		that.gl.vertexAttribPointer(that.shaderProgram.vertexAngleAttribute,
				that.vertexData.itemSize,
				that.gl.FLOAT, false, 0, 0)

		// Enable vertex attrib array so data gets transferred
		that.gl.enableVertexAttribArray(that.shaderProgram.vertexAngleAttribute)

		// Update uniforms in the shader program
		that.gl.uniformMatrix4fv(that.shaderProgram.projection, false, that.projectionMatrix.flattenToArray([]))
		that.gl.uniformMatrix4fv(that.shaderProgram.modelView, false, that.modelViewMatrix.flattenToArray([]))
		that.gl.uniform1f(that.shaderProgram.radius, that.radius)

		// Tell OpenGL that we use this index buffer now
		that.gl.bindBuffer(that.gl.ELEMENT_ARRAY_BUFFER, that.indices) //?

		// Method 1: Draw stuff on screen using current mode and specified index buffer
		that.gl.drawElements(that.gl[that.mode], that.indices.numItems, that.indices.itemSize, 0)

		// Method 2: Draw stuff on screen using current mode and in sequential order
		//that.gl.drawArrays(that.gl[that.mode], 0, that.numVertices)

		console.log("Render complete.")

	}

}

var app = new WebGLApp()
