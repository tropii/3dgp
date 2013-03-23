/**
 * Called when body has finished loading.
 */
function start() {

	// Get the canvas element from the HTML document
	var canvas = document.getElementById("canvas1")

	// Initialize the GL context
	var gl = initWebGL(canvas)

	if (gl) {

		// Initialize buffer
		var buffer = initBuffer(gl)

		// Initialize shaders
		var shaderProgram = initShaders(gl)

		// Set the color which is used to clear the screen
		gl.clearColor(0.0, 0.0, 0.0, 1.0)

		// Enable depth test (objects in front obscure objects in back)
		gl.enable(gl.DEPTH_TEST)

		// Draw the scene
		drawScene(gl, buffer, shaderProgram)

	}

}

/**
 * Initializes the WebGL context and returns it, otherwise null.
 */
function initWebGL(canvas) {
	
	var gl = null

	// Try to grab the standard context. If it fails, fallback to experimental.
	try {
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
		gl.viewportWidth = canvas.width
		gl.viewportHeight = canvas.height
	} catch (e) {
		alert(e)
	}

	return gl

}

function initBuffer(gl) {

	// Obtain a buffer into which we will store the vertices
	var buffer = gl.createBuffer()

	// Bind the buffer (make it active, current buffer)
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

	// Array for our vertices (triangle)
	var vertices = [
		-1.0, -1.0,  0.0,
		 1.0, -1.0,  0.0,
		 0.0,  1.0,  0.0
	]

	// Add few helpful properties
	buffer.itemSize = 3 // How many floats does a single vertex element need
	buffer.numItems = 3 // How many vertex elements exist in the buffer

	// Copy the data from vertices to our current buffer
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

	return buffer

}

/**
 * Initializes shaders.
 */
function initShaders(gl) {

	// Create vertex and fragment shaders
	var vertexShader = getShader(gl, "shader-vs")
	var fragmentShader = getShader(gl, "shader-fs")

	// Create the shader program
	var shaderProgram = gl.createProgram()

	// Attach shaders to the program
	gl.attachShader(shaderProgram, vertexShader)
	gl.attachShader(shaderProgram, fragmentShader)

	// Link the shader program
	gl.linkProgram(shaderProgram)

	// Check if the shader linked successfully
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
		alert("An error occurred linking the shaders: " + gl.getProgramInfoLog(shaderProgram))

	// Activate the shader program
	gl.useProgram(shaderProgram)

	// Access the shader attribute from the HTML document
	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition")
	shaderProgram.projection = gl.getUniformLocation(shaderProgram, "uProjectionMatrix")
	shaderProgram.modelView = gl.getUniformLocation(shaderProgram, "uModelViewMatrix")

	// Enable vertex attrib array so data gets transferred
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute)

	return shaderProgram

}

/**
 * Returns the shader if it compiled successfully, otherwise null.
 */
function getShader(gl, id) {

	// Get the shader (the <script> element) from the HTML document
	var shaderScript = document.getElementById(id)
	
	// Return null if the element doesn't exist
	if (!shaderScript)
		return null

	// Get shaderScript's (the <script> element's) first child, which is
	// actually our shader code in the HTML document.
	var currentChild = shaderScript.firstChild

	// Shader source code
	var shaderSourceCode = "" // Must contain an empty string

	while (currentChild) {

		// Confirm that our currentChild is actually text ...
		if (currentChild.nodeType == currentChild.TEXT_NODE)
			// ... and concatenate it to our shader source code.
			shaderSourceCode += currentChild.textContent

		// Continue to the next sibling in the HTML document
		currentChild = currentChild.nextSibling
	}

	// Our shader
	var shader

	// Get the shader type and create corresponding shader
	if (shaderScript.type == "x-shader/x-fragment")
		shader = gl.createShader(gl.FRAGMENT_SHADER)

	else if (shaderScript.type == "x-shader/x-vertex")
		shader = gl.createShader(gl.VERTEX_SHADER)

	else
		// Unknown shader type
		return null

	// Set the shader source
	gl.shaderSource(shader, shaderSourceCode)

	// Compile the shader program
	gl.compileShader(shader)

	// If the shader didn't compile successfully, return null
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader))
		return null
	}

	return shader;

}

/**
 * Draws the scene.
 */
function drawScene(gl, buffer, shaderProgram) {

	// Make the viewport to fill the entire canvas area
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight)

	// Clear the color and depth buffer
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

	// Projection matrix
	var projectionMatrix = new THREE.Matrix4()
	projectionMatrix.makeOrthographic(-2.0, 2.0, 2.0, -2.0, -0.1, 2.0)

	// Model view matrix
	var modelViewMatrix = new THREE.Matrix4()
	modelViewMatrix.identity()

	// Bind buffer data to shader attribute
	gl.vertexAttribPointer(
			shaderProgram.vertexPositionAttribute,
			buffer.itemSize,
			gl.FLOAT, false, 0, 0)

	// Update uniforms in shader program
	gl.uniformMatrix4fv(shaderProgram.projection, false, projectionMatrix.flattenToArray([]))
	gl.uniformMatrix4fv(shaderProgram.modelView, false, modelViewMatrix.flattenToArray([]))

	// Draw stuff on screen from vertices using triangles
	gl.drawArrays(gl.TRIANGLES, 0, buffer.numItems)

}
