var WebGLApp = function() {

	var that = this						// Used to access to object itself
	this.canvas = null					// Canvas where we draw our renders
	this.gl = null						// The WebGL context
	this.vertexPositionBuffer = null	// Vertex data buffer
	this.indexBuffer = null				// Vertex index data buffer

	this.projectionMatrix = new THREE.Matrix4()
	this.modelViewMatrix = new THREE.Matrix4()

	this.shaderProgram = null

	this.mode = "TRIANGLES" // Rendering mode
	//this.numVertices = 10 // Number of angles in the circle
	
	this.textureObject = null
	this.textureCoordinateBuffer = null

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

		// Initialize texture
		that.initTextures()

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

		/* ----- Vertices ----- */

		// Create buffer for vertex data
		that.vertexPositionBuffer = that.gl.createBuffer()

		// Bind the buffer to make it active
		that.gl.bindBuffer(that.gl.ARRAY_BUFFER, that.vertexPositionBuffer)

		var vertices = [
			-1.0, -1.0,  1.0,
			 1.0, -1.0,  1.0,
			 1.0,  1.0,  1.0,
			-1.0,  1.0,  1.0
		]

		// Copy data from vertices array to buffer
		that.gl.bufferData(that.gl.ARRAY_BUFFER,
				new Float32Array(vertices),
				that.gl.STATIC_DRAW)

		that.vertexPositionBuffer.itemSize = 3 // How many floats does a single vertex element need
		that.vertexPositionBuffer.numItems = 4 // How many vertex elements exist in the buffer

		/* ----- Texture coordinates ----- */

		// Create buffer for vertex data
		that.textureCoordinateBuffer = that.gl.createBuffer()
		
		// Bind the buffer to make it active
		that.gl.bindBuffer(that.gl.ARRAY_BUFFER, that.textureCoordinateBuffer)

		// Define texture coordinates
		var textureCoordinates = [
			0.0, 0.0,
			1.0, 0.0,
			1.0, 1.0,
			0.0, 1.0
		]

		// Copy data from texture coordinates array to buffer
		that.gl.bufferData(that.gl.ARRAY_BUFFER,
				new Float32Array(textureCoordinates),
				that.gl.STATIC_DRAW)

		that.textureCoordinateBuffer.itemSize = 2
		that.textureCoordinateBuffer.numItems = 4

		/* ----- Indices ----- */

		// Create an element array buffer where we can store vertex indexBuffer
		that.indexBuffer = that.gl.createBuffer()

		// Bind the buffer to make it active
		that.gl.bindBuffer(that.gl.ELEMENT_ARRAY_BUFFER, that.indexBuffer)

		// Define indices
		var indices = [
			0, 1, 2, 0, 2, 3
		]

		// Copy data from indexBuffer array to buffer
		that.gl.bufferData(that.gl.ELEMENT_ARRAY_BUFFER,
				new Uint16Array(indices),
				that.gl.STATIC_DRAW)

		// Size of each index value (UNSIGNED_BYTE for index values between 0 and 255)
		that.indexBuffer.itemSize = that.gl.UNSIGNED_SHORT

		// Number of elements in the index array
		that.indexBuffer.numItems = indices.length

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

		// Access attribute locations in program
		that.shaderProgram.vertexPositionAttribute = that.gl.getAttribLocation(that.shaderProgram, "aVertexPosition")
		that.gl.enableVertexAttribArray(that.shaderProgram.vertexPositionAttribute)

		that.shaderProgram.textureCoordinateAttribute = that.gl.getAttribLocation(that.shaderProgram, "aTextureCoordinate")
		that.gl.enableVertexAttribArray(that.shaderProgram.textureCoordinateAttribute)

		// Access uniform parameters
		that.shaderProgram.projection = that.gl.getUniformLocation(that.shaderProgram, "uProjection")
		that.shaderProgram.modelView = that.gl.getUniformLocation(that.shaderProgram, "uModelView")
		that.shaderProgram.sampler = that.gl.getUniformLocation(that.shaderProgram, "uSampler")

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

	/**
	 * Texture initialization.
	 */
	this.initTextures = function() {

		// Create a texture object
		that.textureObject = that.gl.createTexture()

		// Create a Javascript image object as an attribute
		that.textureObject.image = new Image()
		that.textureObject.image.side = that.gl.TEXTURE_2D
		that.textureObject.image.onload = function() { that.handleTexture(that.textureObject) }
		that.textureObject.image.src = "stone.png"

	}

	this.handleTexture = function(textureObject) {
		
		// Bind the texture
		that.gl.bindTexture(that.gl.TEXTURE_2D, textureObject)

		// Flip the Y-axis
		that.gl.pixelStorei(that.gl.UNPACK_FLIP_Y_WEBGL, true)

		that.gl.texImage2D(that.gl.TEXTURE_2D, 0, that.gl.RGBA, that.gl.RGBA, that.gl.UNSIGNED_BYTE, that.textureObject.image)
		that.gl.texParameteri(that.gl.TEXTURE_2D, that.gl.TEXTURE_MAG_FILTER, that.gl.NEAREST)
		that.gl.texParameteri(that.gl.TEXTURE_2D, that.gl.TEXTURE_MIN_FILTER, that.gl.NEAREST)

		// Unbind the texture
		that.gl.bindTexture(that.gl.TEXTURE_2D, null)

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
		that.projectionMatrix.makeOrthographic(-HALF_WIDTH, HALF_WIDTH, HALF_HEIGHT, -HALF_HEIGHT, -1.0, 100.0)
		that.modelViewMatrix.identity()

		that.gl.useProgram(that.shaderProgram) //?

		// Bind buffer for next operation
		that.gl.bindBuffer(that.gl.ARRAY_BUFFER, that.vertexPositionBuffer) //?

		// Bind buffer data to shader attribute
		that.gl.vertexAttribPointer(that.shaderProgram.vertexPositionAttribute,
				that.vertexPositionBuffer.itemSize,
				that.gl.FLOAT, false, 0, 0)

		// Bind buffer for next operation
		that.gl.bindBuffer(that.gl.ARRAY_BUFFER, that.textureCoordinateBuffer) //?

		// Bind buffer data to shader attribute
		that.gl.vertexAttribPointer(that.shaderProgram.textureCoordinateAttribute,
				that.textureCoordinateBuffer.itemSize,
				that.gl.FLOAT, false, 0, 0)

		// Enable vertex attrib array so data gets transferred
		//that.gl.enableVertexAttribArray(that.shaderProgram.vertexPositionAttribute)
		//that.gl.enableVertexAttribArray(that.shaderProgram.textureCoordinateAttribute)

		that.gl.activeTexture(that.gl.TEXTURE0)
		that.gl.bindTexture(that.gl.TEXTURE_2D, that.textureObject)
		that.gl.uniform1i(that.shaderProgram.samplerUniform, 0)

		// Tell OpenGL that we use this index buffer now
		that.gl.bindBuffer(that.gl.ELEMENT_ARRAY_BUFFER, that.indexBuffer) //?

		// Update uniforms in the shader program
		that.gl.uniformMatrix4fv(that.shaderProgram.projection, false, that.projectionMatrix.flattenToArray([]))
		that.gl.uniformMatrix4fv(that.shaderProgram.modelView, false, that.modelViewMatrix.flattenToArray([]))

		// Method 1: Draw stuff on screen using current mode and specified index buffer
		that.gl.drawElements(that.gl[that.mode], that.indexBuffer.numItems, that.indexBuffer.itemSize, 0)

		// Method 2: Draw stuff on screen using current mode and in sequential order
		//that.gl.drawArrays(that.gl[that.mode], 0, that.numVertices)

		console.log("Render complete.")

		requestAnimationFrame(that.render)

	}

}

var app = new WebGLApp()
