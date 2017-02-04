////////////////////////////////////////////
// Date: 12/02/2016
// No: 0665005 & 0648304
// Name: Harsh Joshi & Lang Wu
//
// Title : Super Bug Zapper 3D
///////////////////////////////////////////



//---------Global Generic variables
var canvas; // Canvas element of the HTML.
var gl; // Element to use the shaders
var gameDelay = 150; // Speed of the game
var gamePoints = 0; // Points which computer gains because of the delay of the user clicks
var pMatrixUniform; // Uniform variable for the projection matrix
var mvMatrixUniform; // Uniform variable for the model view matrix
var useLightingUniform; // Unifrom variable for enabling and disabling the lightning
var ambientColorUniform; // Uniform variable for the ambient color
var vColorUniform; // Uniform variable for the color
var diffuseColorUniform; // Uniform variable for the diffused color
var specularColorUniform; // Uniform variable for the specular color
var lightPositionUniform; // Uniform variable for the light position
var shininessUniform; // Uniform variable for the shininess
var modelViewMatrix; // Model view matrix for the transformations
var modelViewMatrixStack = [];
var vPosition; // Attribute for the vertices
var vNormal; // Attribute for the normals
var rotationMatrix = mat4(); // Generic rotation matrix, it works for bacteria and sphere
var newX; // Latest click position - X coordinate
var newY; // Latest click position - Y coordinate
var growDirectionRange = 360; // Initialize growing angle
// Scaling related variables
var scaleMultiple = 0.006; // Scale multiple for the each bacteria which increases the scale factor
var explosionMultiple = []; // Explosion multiple for the particle system

// Rotation related variables
var rotationAngleX = 0; // Rotation angle along the X axis
var rotationAngleY = 0; // Rotation angle along the y axis
var rotationAngleXFactor = 0; // Rotation angle incrementer or decrementer along X axis
var rotationAngleYFactor = 0; // Rotation angle incrementer or decrementer along y axis
var rotationAngleMultiple = 1.0; // multitple for the incrementer or decrementer

// Model-View related variables
var eye = vec3(-0.002092145792941734, -9.789484465415809, 0.45386068821657377); // Eye position of the camera
var at = vec3(0.0, 0.0, 0.0); // At position of the camera
var up = vec3(0.0, 0.0001, 0.0); // Up position of the camera

// Projection related variables
var fovy =100.0; // Fovy for the projection matrix
var aspect = 1.0; // Aspect for the projection matrix
var near = 0.1; // Near for the projection matrix
var far = 100; // Far for the projection matrix

//Lighting related variables
var lightPosition = vec4(-4.4, 1.4, 8.2, 0.0 ); // Light source position
var ambientColor = vec4(0.3, 0.3, 0.3, 0.1 ); // Ambient color for lightning
var diffuseColor = vec4( 1.0, 1.0, 1.0, 1.0 ); // Diffuse lightning color
var specularColor = vec4( 1.0, 1.0, 1.0, 1.0 ); // Specular lightning color
var diffuseProduct, ambientProduct; // Product of the two lightning
var materialColor = vec4( 0.3, 0.3, 1.0, 1.0 ); // material color of individual color
var glossiness = 140.0; // shininess or glossiness
var isLighting = true; // Whether lightning is true or not

//---------Sphere related variables
var sphereVertexBuffer; // Buffer for the vertices of sphere
var sphereNormalBuffer; // Buffer for the normals of sphere
var coneNormals = []; // Normals for the sphere not in sequenced manner and unique
var sequencedSphereNormals = []; // Sequenced normals for the sphere
var coneVertices = []; // Sphere vertices not in sequenced manner and unique
var sequencedSphereVertices = []; // Sequenced vertices for the sphere and duplicated.
var sphereColor = vec4(0.4, 0.9, 0.4, 0.8); // Color of the sphere
var noOfFans = 300;
var ATTRIBUTES = 2; // Attributes to skip to index during the cache of the points
var radiusOfCircle = 0.4; // Radius of the center of the circle

//------------For click and key presses
var clickPosition = vec2(0.0, 0.0); // Stores the coordinates of the click
var mouseDown = false; // Whether mouse down or not
var lastMouseX = null; // Stores last mouse x position
var lastMouseY = null; // stores last mouse y position
var isClicked = false; // is clicked or not
var isKeyPressed = false; // is any key pressed or not
var keyValue; // What key you have pressed

//for cylinder
var h = 1, r1 = .6, r2 = .5, nPhi = 100;
var cylinderVertexBuffer;
var cylinderNormalBuffer;
var pt = [];
var nt = [];

// for sun
var vertices = [];
var normalData = [];
var normalDataSeq = [];
var sunVertexBuffer;
var sunNormalBuffer;
var sphereVertices = [];
var noOfLatitudeBands = 2;
var noOfLongituteBands = 6;
var noOfSphereVertices;

//colors for object
var brown = vec4(0.36,0.25,0.20,1);

// for fruits
var noOfFruits = 2;

var noOfBranches = [];
var noOfLevels = [];
var angleX = [];
var angleY = [];
var angleZ = [];
var colorR = [];
var colorG = [];
var colorB = [];
var scaleFactorX = [];
var scaleFactorY = [];
var scaleFactorZ = [];
var scaleFactor = [];
var translateX = [];
var translateY = [];
var translateZ = [];


var objSimpleTreeLeaves = 0;
var objSimpleTreeBranches = 1;
var objSimpleTreeTrunk = 2;
var objBambooTrunk = 3;
var objBambooBranches = 4;
var objChristmasTreeTrunk = 5;
var objChristmasTreeBranches = 6;
var objPalmTreeTrunk = 7;
var objPalmTreeFruit = 8;
var objPalmTreeBranches = 9;
var objSuperSimpleTreeLeaves = 10;
var objSuperSimpleTreeBranches = 11;
var objSuperSimpleTreeTrunk = 12;
var objSimpleTree = 13;
var objBambooTree = 14;
var objChristmasTree = 15;
var objPalmTree = 16;
var objSuperSimpleTree = 17;

var totalObjects = 18;




// On load of the page event
window.onload = function init()
{
  canvas = document.getElementById( "gl-canvas" );

  // Initialize the canvas
  gl = WebGLUtils.setupWebGL( canvas );
  if ( !gl ) { alert( "WebGL isn't available" ); }

  // Configure the Webgl
  gl.viewport( 0.0, 0.0, canvas.width, canvas.height );
  gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
  gl.enable(gl.DEPTH_TEST);

  //  Load shaders and initialize attribute buffers
  var program = initShaders( gl, "vertex-shader", "fragment-shader" );
  gl.useProgram( program );

  cacheConeVertices();
  cacheCylinderVertices();
  cacheSphereVertices();
  initializeValues();

  // Load the data into the GPU
  sphereVertexBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, sphereVertexBuffer);
  gl.bufferData( gl.ARRAY_BUFFER, flatten(coneVertices), gl.STATIC_DRAW);

  sphereNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sphereNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(coneNormals), gl.STATIC_DRAW);

  // load the data into GPU for cacheCylinderVertices
  cylinderVertexBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, cylinderVertexBuffer);
  gl.bufferData( gl.ARRAY_BUFFER, flatten(pt), gl.STATIC_DRAW);

  cylinderNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cylinderNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(nt), gl.STATIC_DRAW);

  sunVertexBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, sunVertexBuffer);
  gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  sunNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sunNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(normalDataSeq), gl.STATIC_DRAW);

  // Associate out shader variables with our data buffer
  vPosition = gl.getAttribLocation( program, "vPosition" ); // Vertex buffer
  gl.enableVertexAttribArray( vPosition );

  vNormal = gl.getAttribLocation(program, "vNormal");
  gl.enableVertexAttribArray(vNormal);

  mvMatrixUniform = gl.getUniformLocation(program, "uMVMatrix");
  pMatrixUniform = gl.getUniformLocation(program, "uPMatrix");
  uNMatrixUniform = gl.getUniformLocation(program, "uNMatrix");
  vColorUniform = gl.getUniformLocation(program, "vColor");
  ambientColorUniform = gl.getUniformLocation(program, "uAmbientColor");
  diffuseColorUniform = gl.getUniformLocation(program, "uDiffuseColor");
  specularColorUniform = gl.getUniformLocation(program, "uSpecularColor");
  lightPositionUniform = gl.getUniformLocation(program, "ulightPosition");
  useLightingUniform = gl.getUniformLocation(program, "uUseLighting");
  glossinessUniform=gl.getUniformLocation(program, "glossiness");

  canvas.onmousedown = handleMouseDown;
  document.onmouseup = handleMouseUp;
  document.onmousemove = handleMouseMove;
  document.onkeydown = handleKeyDown;
  document.onkeyup = handleKeyUp;

  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Clear the buffer bit before starting the game
  render();
}

function initializeValues()
{
  for(var i = 0; i < totalObjects; i++)
  {
    noOfBranches.push(0);
    noOfLevels.push(0);
    angleX.push(0);
    angleY.push(0);
    angleZ.push(0);
    colorR.push(0);
    colorG.push(0);
    colorB.push(0);
    scaleFactorX.push(0);
    scaleFactorY.push(0);
    scaleFactorZ.push(0);
    scaleFactor.push(0);
    translateX.push(0);
    translateY.push(0);
    translateZ.push(0);
  }

  // Simple Tree Trunk
  scaleFactorX[objSimpleTreeTrunk] = 1.3;
  scaleFactorY[objSimpleTreeTrunk] = 1.2;
  scaleFactorZ[objSimpleTreeTrunk] = 4;
  translateX[objSimpleTreeTrunk] = 0;
  translateY[objSimpleTreeTrunk] = 0;
  translateZ[objSimpleTreeTrunk] = -0.4;
  colorR[objSimpleTreeTrunk] = 0.36;
  colorG[objSimpleTreeTrunk] = 0.25;
  colorB[objSimpleTreeTrunk] = 0.20;

  // Simple Tree Leaves
  noOfBranches[objSimpleTreeLeaves] = 4;
  noOfLevels[objSimpleTreeLeaves] = 11;
  angleZ[objSimpleTreeLeaves] = 360;
  angleX[objSimpleTreeLeaves] = 40;
  scaleFactor[objSimpleTreeLeaves] = 0.7;
  translateX[objSimpleTreeLeaves] = 0.08;
  translateY[objSimpleTreeLeaves] = 0.5;
  translateZ[objSimpleTreeLeaves] = 2;
  colorR[objSimpleTreeLeaves] = 0.4;
  colorG[objSimpleTreeLeaves] = 0.9;
  colorB[objSimpleTreeLeaves] = 0.4;

  // Simple Tree Branches
  noOfBranches[objSimpleTreeBranches] = 4;
  noOfLevels[objSimpleTreeBranches] = 10;
  angleZ[objSimpleTreeBranches] = 360;
  angleX[objSimpleTreeBranches] = 40;
  scaleFactor[objSimpleTreeBranches] = 1;
  scaleFactorX[objSimpleTreeBranches] = 0.4;
  scaleFactorY[objSimpleTreeBranches] = 0.5;
  translateX[objSimpleTreeBranches] = 0;
  translateY[objSimpleTreeBranches] = 0;
  translateZ[objSimpleTreeBranches] = 1;
  colorR[objSimpleTreeBranches] = 0.36;
  colorG[objSimpleTreeBranches] = 0.25;
  colorB[objSimpleTreeBranches] = 0.20;

  // Bamboo Trunk
  colorR[objBambooTrunk] = 0.4;
  colorG[objBambooTrunk] = 0.9;
  colorB[objBambooTrunk] = 0.4;

  // Bamboo Tree Branches
  noOfBranches[objBambooBranches] = 4;
  noOfLevels[objBambooBranches] = 12;
  angleZ[objBambooBranches] = 0;
  angleX[objBambooBranches] = 182;
  translateX[objBambooBranches] = 0;
  translateY[objBambooBranches] = 0;
  translateZ[objBambooBranches] = 1;
  colorR[objBambooBranches] = 0.4;
  colorG[objBambooBranches] = 0.9;
  colorB[objBambooBranches] = 0.4;

  // Christmas Tree Trunk
  scaleFactorX[objChristmasTreeTrunk] = 0.9;
  scaleFactorY[objChristmasTreeTrunk] = 1;
  scaleFactorZ[objChristmasTreeTrunk] = 5;
  translateX[objChristmasTreeTrunk] = 0;
  translateY[objChristmasTreeTrunk] = 0;
  translateZ[objChristmasTreeTrunk] = -6;
  colorR[objChristmasTreeTrunk] = 0.36;
  colorG[objChristmasTreeTrunk] = 0.25;
  colorB[objChristmasTreeTrunk] = 0.20;

  // Christmas Tree Branches
  noOfBranches[objChristmasTreeBranches] = 4;
  noOfLevels[objChristmasTreeBranches] = 5;
  scaleFactor[objChristmasTreeBranches] = 1.5;
  scaleFactorY[objChristmasTreeBranches] = 1.5;
  scaleFactorZ[objChristmasTreeBranches] = 1.3;
  translateX[objChristmasTreeBranches] = 0;
  translateY[objChristmasTreeBranches] = 0;
  translateZ[objChristmasTreeBranches] = -0.5;
  colorR[objChristmasTreeBranches] = 1;
  colorG[objChristmasTreeBranches] = 1;
  colorB[objChristmasTreeBranches] = 1;

  // Palm Tree Trunk
  angleX[objPalmTreeTrunk] = 4;
  scaleFactorX[objPalmTreeTrunk] = 0.9;
  scaleFactorY[objPalmTreeTrunk] = 1;
  scaleFactorZ[objPalmTreeTrunk] = 1;
  translateX[objPalmTreeTrunk] = 0;
  translateY[objPalmTreeTrunk] = 0;
  translateZ[objPalmTreeTrunk] = 1;
  colorR[objPalmTreeTrunk] = 0.36;
  colorG[objPalmTreeTrunk] = 0.25;
  colorB[objPalmTreeTrunk] = 0.20;

  // Palm Tree Fruit
  noOfBranches[objPalmTreeFruit] = 2;
  noOfLevels[objPalmTreeTrunk] = 12;
  angleX[objPalmTreeFruit] = 110;
  angleY[objPalmTreeFruit] = 120;
  scaleFactorX[objPalmTreeFruit] = 1.2;
  scaleFactorY[objPalmTreeFruit] = 1;
  scaleFactorZ[objPalmTreeFruit] = 1;
  translateX[objPalmTreeFruit] = -2.1;
  translateY[objPalmTreeFruit] = -2.4;
  translateZ[objPalmTreeFruit] = 2.1;
  colorR[objPalmTreeFruit] = 0.8;
  colorG[objPalmTreeFruit] = 0.3;
  colorB[objPalmTreeFruit] = 0.15;

  // Palm Tree Branches
  noOfBranches[objPalmTreeBranches] = 13;
  noOfLevels[objPalmTreeBranches] = 10;
  angleX[objPalmTreeBranches] = -200; //80
  angleY[objPalmTreeBranches] = 130; //260
  angleZ[objPalmTreeBranches] = 300; //80
  scaleFactorX[objPalmTreeBranches] = 1.0; //1.3
  scaleFactorY[objPalmTreeBranches] = 1.0; //0.2
  scaleFactorZ[objPalmTreeBranches] = 1.15; //2.6
  translateX[objPalmTreeBranches] = 0;
  translateY[objPalmTreeBranches] = 0;
  translateZ[objPalmTreeBranches] = 0.8;
  colorR[objPalmTreeBranches] = 0.4;
  colorG[objPalmTreeBranches] = 0.9;
  colorB[objPalmTreeBranches] = 0.4;

  // Super Simple Tree Trunk
  scaleFactorX[objSuperSimpleTreeTrunk] = 1.3;
  scaleFactorY[objSuperSimpleTreeTrunk] = 1.2;
  scaleFactorZ[objSuperSimpleTreeTrunk] = 4;
  translateX[objSuperSimpleTreeTrunk] = 0;
  translateY[objSuperSimpleTreeTrunk] = 0;
  translateZ[objSuperSimpleTreeTrunk] = -0.4;
  colorR[objSuperSimpleTreeTrunk] = 0.4;
  colorG[objSuperSimpleTreeTrunk] = 0.8;
  colorB[objSuperSimpleTreeTrunk] = 0.4;

  // Super Simple Tree Branches
  noOfBranches[objSuperSimpleTreeBranches] = 3;
  noOfLevels[objSuperSimpleTreeBranches] = 10;
  angleZ[objSuperSimpleTreeBranches] = 360;
  angleX[objSuperSimpleTreeBranches] = 40;
  scaleFactor[objSuperSimpleTreeBranches] = 1;
  translateX[objSuperSimpleTreeBranches] = 0;
  translateY[objSuperSimpleTreeBranches] = 0;
  translateZ[objSuperSimpleTreeBranches] = 1;
  colorR[objSuperSimpleTreeBranches] = 0.4;
  colorG[objSuperSimpleTreeBranches] = 0.85;
  colorB[objSuperSimpleTreeBranches] = 0.4;

  // Whole trees
  // Simple Tree
  translateX[objSimpleTree] = -5;
  translateY[objSimpleTree] = 0;
  translateZ[objSimpleTree] = 3;

  //Bamboo
  translateX[objBambooTree] = 3;
  translateY[objBambooTree] = 0;
  translateZ[objBambooTree] = 4;
  scaleFactorX[objBambooTree] = 0.3;
  scaleFactorY[objBambooTree] = 0.5;
  scaleFactorZ[objBambooTree] = 1;
  angleX[objBambooTree] = 15;

  //Christmas Tree
  translateX[objChristmasTree] = -8;
  translateY[objChristmasTree] = 3;
  translateZ[objChristmasTree] = -2;

  //Palm Tree
  translateX[objPalmTree] = -3;
  translateY[objPalmTree] = 3;
  translateZ[objPalmTree] = -10;

  // Super Simple Tree
  translateX[objSuperSimpleTree] = 10;
  translateY[objSuperSimpleTree] = 2.7;
  translateZ[objSuperSimpleTree] = -9.8;

}

// Cache the sphere vertices to make the sphere using triangles
function cacheConeVertices()
{
  xCenterOfCircle = 0;
  yCenterOfCircle = 0;
  centerOfCircle = vec4(0, 0, 1, 1);
  anglePerFan = (2*Math.PI) / noOfFans;
  coneVertices.push(centerOfCircle);
  coneNormals.push(vec3(centerOfCircle));

  for(var i = 0; i <= noOfFans; i++)
  {
    var index = ATTRIBUTES * i + 2;
    var angle = anglePerFan * (i+1);
    if(i%2 == 0)
    {
      var xCoordinate = xCenterOfCircle + Math.cos(angle) * (radiusOfCircle-0.005);
      var yCoordinate = yCenterOfCircle + Math.sin(angle) * (radiusOfCircle-0.005);
    }
    else {
      var xCoordinate = xCenterOfCircle + Math.cos(angle) * (radiusOfCircle+0.005);
      var yCoordinate = yCenterOfCircle + Math.sin(angle) * (radiusOfCircle+0.005);
    }
    var point = vec4(xCoordinate, yCoordinate, 0, 1);
    coneVertices.push(point);
    coneNormals.push(vec3(point));
  }
}

function cacheCylinderVertices()
{
  var increaseFactor = 0.005;
  var Phi = 0, dPhi = 2*Math.PI / (nPhi-1),
  Nx = r1 - r2, Ny = h, N = Math.sqrt(Nx*Nx + Ny*Ny);
  Nx /= N; Ny /= N;
  for (var i = 0; i < nPhi; i++ ){
    var cosPhi = Math.cos( Phi );
    var sinPhi = Math.sin( Phi );
    var cosPhi2 = Math.cos( Phi + dPhi/2 );
    var sinPhi2 = Math.sin( Phi + dPhi/2 );

    var xPt1 = -h/2;
    var yPt1 = cosPhi * r1;
    var zPt1 = sinPhi * r1;

    var xNPt1 = Nx;
    var yNPt1 =  Ny*cosPhi;
    var zNPt1 = Ny*sinPhi;

    var xPt2 = h/2;
    var yPt2 = cosPhi2 * r2;
    var zPt2 = sinPhi2 * r2;

    var xNPt2 = Nx;
    var yNPt2 = Ny*cosPhi2;
    var zNPt2 = Ny*sinPhi2;

    pt.push ( vec4(zPt1, yPt1, xPt1, 1) );   // points
    nt.push ( vec3(zNPt1, yNPt1, xNPt1) );         // normals
    pt.push ( vec4(zPt2, yPt2, xPt2,1 ));  // points
    nt.push ( vec3(zNPt2, yNPt2, xNPt2));       // normals
    Phi   += dPhi;
    increaseFactor += 0.005;
  }
}

//vertices for sun
function cacheSphereVertices()
{
  var vertexPositionData = [];
  for (var i=0; i<=noOfLatitudeBands; i++)
  {
    var radius = 0.01;
    var theta = i * Math.PI / noOfLatitudeBands;
    var sinTheta = Math.sin(theta);
    var cosTheta = Math.cos(theta);
    for (var j=0; j<=noOfLongituteBands; j++)
    {
      var phi = j * 2 * Math.PI / noOfLongituteBands;
      var sinPhi = Math.sin(phi);
      var cosPhi = Math.cos(phi);

      var x = (cosPhi * sinTheta) + (Math.random()*radius);
      var y = cosTheta + (Math.random()*radius);
      var z = (sinPhi * sinTheta) + (Math.random()*radius);
      var u = 1 - (j / noOfLongituteBands);
      var v = 1 - (i / noOfLatitudeBands);

      normalData.push(vec3(x,y,z));
      sphereVertices.push(vec4(x,y,z,1.0));
    }
  }

  //var indexData = [];
  for (var i=0; i<noOfLatitudeBands; i++) {
    for (var j=0; j<noOfLongituteBands; j++) {
      var first = (i * (noOfLongituteBands + 1)) + j;
      var second = first + noOfLongituteBands + 1;
      vertices.push(sphereVertices[first]);
      vertices.push(sphereVertices[second]);
      vertices.push(sphereVertices[first + 1]);

      vertices.push(sphereVertices[second]);
      vertices.push(sphereVertices[second + 1]);
      vertices.push(sphereVertices[first + 1]);

      normalDataSeq.push(normalData[first]);
      normalDataSeq.push(normalData[second]);
      normalDataSeq.push(normalData[first + 1]);

      normalDataSeq.push(normalData[second]);
      normalDataSeq.push(normalData[second + 1]);
      normalDataSeq.push(normalData[first + 1]);
    }
  }
  noOfSphereVertices = vertices.length;
}

// Convert degrees to radians
function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

// Convert radians to degrees
function radiansToDegrees(radians)
{
  return radians * 180 / Math.PI;
}

// Handles the key down event
function handleKeyDown(event) {
  keyValue = event.which || event.keyCode;
  isKeyPressed = true;
}

// Handles the key up event
function handleKeyUp(event) {
  isKeyPressed = false;
  keyValue = 0;
  rotationAngleYFactor = 0;
  rotationAngleXFactor = 0;
}

// Handles the mouse down event
function handleMouseDown(event) {
  mouseDown = true;
  isClicked = true;
  lastMouseX = event.clientX;
  lastMouseY = event.clientY;
  clickPosition = vec2((2.0*event.clientX)/canvas.width-1.0,
  // 1.0 - (2.0 * event.clientY)/canvas.height);
  2*(canvas.height-event.clientY)/canvas.height-1);

}

// Handles the mouse up event
function handleMouseUp(event) {
  mouseDown = false;
}

// Handles the mouse move event
function handleMouseMove(event) {
  if (!mouseDown) {
    return;
  }
  isClicked = false;
  newX = event.clientX;
  newY = event.clientY;

  var deltaX = newX - lastMouseX;
  var newRotationMatrix = mat4();
  newRotationMatrix = mult(newRotationMatrix, rotate(deltaX / 8, [0, 1, 0]));

  var deltaY = newY - lastMouseY;
  newRotationMatrix = mult(newRotationMatrix, rotate(deltaY / 8, [1, 0, 0]));

  var newEye = mult(newRotationMatrix, vec4(eye,0.0));

  eye = vec3(newEye);

  lastMouseX = newX
  lastMouseY = newY;
}

// Rotate every object when it is moved by mouse or key presses
function keepRotating(){
  modelViewMatrix = mult(modelViewMatrix, rotateX(rotationAngleX));
  modelViewMatrix = mult(modelViewMatrix, rotateY(rotationAngleY));

  rotationAngleX = rotationAngleX + rotationAngleXFactor;
  rotationAngleY = rotationAngleY + rotationAngleYFactor;
  if(rotationAngleX > 360)
  rotationAngleX = 0;
  if(rotationAngleY > 360)
  rotationAngleY = 0;

  if(rotationAngleX < 0)
  rotationAngleX = 360;
  if(rotationAngleY < 0)
  rotationAngleY = 360;

  if(isKeyPressed)
  {
    if(keyValue == 87) //w
    {
      rotationAngleXFactor = rotationAngleXFactor + rotationAngleMultiple;
    }
    else if(keyValue == 65) //a
    {
      rotationAngleYFactor = rotationAngleYFactor + rotationAngleMultiple;
    }
    else if(keyValue == 68) //d
    {
      rotationAngleYFactor = rotationAngleYFactor - rotationAngleMultiple;
    }
    else if(keyValue == 83) //s
    {
      rotationAngleXFactor = rotationAngleXFactor - rotationAngleMultiple;
    }
  }
}

//-------------------------------SIMPLE TREE - STARTS HERE-----------------------------------//

// Simple Tree
function drawSimpleTree()
{
  mvPushMatrix();
  modelViewMatrix = mult(modelViewMatrix, scalem([scaleFactorX[objSimpleTreeTrunk], scaleFactorY[objSimpleTreeTrunk], scaleFactorZ[objSimpleTreeTrunk]]));
  modelViewMatrix = mult(modelViewMatrix, translate(translateX[objSimpleTreeTrunk], translateY[objSimpleTreeTrunk], translateZ[objSimpleTreeTrunk]));
  gl.bindBuffer( gl.ARRAY_BUFFER, sphereVertexBuffer);
  gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);

  gl.bindBuffer( gl.ARRAY_BUFFER, sphereNormalBuffer);
  gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);

  materialColor = vec4(colorR[objSimpleTreeTrunk], colorG[objSimpleTreeTrunk], colorB[objSimpleTreeTrunk], 1);
  setMatrixUnifroms();
  gl.drawArrays(gl.TRIANGLE_FAN, 0, coneVertices.length); // Draws the sphere from the defined location in the buffer
  mvPopMatrix();
}

// Simple Tree Leaves
function drawLeaves(levels, scaleFactor)
{
  var angle = angleZ[objSimpleTreeLeaves]/noOfBranches[objSimpleTreeLeaves];
  for(var i = 0; i < noOfBranches[objSimpleTreeLeaves]; i++)
  {
    mvPushMatrix();
    modelViewMatrix = mult(modelViewMatrix, translate(translateX[objSimpleTreeLeaves], translateY[objSimpleTreeLeaves], translateZ[objSimpleTreeLeaves]));
    modelViewMatrix = mult(modelViewMatrix, rotateZ((i+1)*angle));
    modelViewMatrix = mult(modelViewMatrix, rotateX(angleX[objSimpleTreeLeaves]));
    modelViewMatrix = mult(modelViewMatrix, scalem([scaleFactor, scaleFactor, scaleFactor]));

    gl.bindBuffer( gl.ARRAY_BUFFER, sunVertexBuffer);
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);

    gl.bindBuffer( gl.ARRAY_BUFFER, sunNormalBuffer);
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);

    materialColor = vec4(colorR[objSimpleTreeLeaves], colorG[objSimpleTreeLeaves], colorB[objSimpleTreeLeaves], 1);;
    setMatrixUnifroms();
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length); // Draws the circle at the defined location in the buffer
    if(levels > 1)
    {
      drawLeaves(--levels, scaleFactor);
    }
    mvPopMatrix();
  }
}

//For Simple Tree Branches
function drawBranches(levels, scaleFactor)
{
  var angle = angleZ[objSimpleTreeBranches]/noOfBranches[objSimpleTreeBranches];
  for(var i = 0; i < noOfBranches[objSimpleTreeBranches]; i++)
  {
    mvPushMatrix();
    modelViewMatrix = mult(modelViewMatrix, translate(translateX[objSimpleTreeBranches], translateY[objSimpleTreeBranches], translateZ[objSimpleTreeBranches]));
    modelViewMatrix = mult(modelViewMatrix, rotateZ((i+1)*angle));
    modelViewMatrix = mult(modelViewMatrix, rotateX(angleX[objSimpleTreeBranches]));
    modelViewMatrix = mult(modelViewMatrix, scalem([scaleFactorX[objSimpleTreeBranches], scaleFactorY[objSimpleTreeBranches], scaleFactor]));

    gl.bindBuffer( gl.ARRAY_BUFFER, sphereVertexBuffer);
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);

    gl.bindBuffer( gl.ARRAY_BUFFER, sphereNormalBuffer);
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);

    materialColor = vec4(colorR[objSimpleTreeBranches], colorG[objSimpleTreeBranches], colorB[objSimpleTreeBranches], 1);
    setMatrixUnifroms();
    gl.drawArrays(gl.TRIANGLE_FAN, 0, coneVertices.length); // Draws the sphere from the defined location in the buffer
    if(levels > 1)
    {
      drawBranches(--levels, scaleFactor-0.05);
    }
    if(levels == 2)
    {
      drawLeaves(4,0.5);
    }
    mvPopMatrix();
  }
}
//------------------------------------------SIMPLE TREE - ENDS HERE----------------------------------------//

//------------------------------------------BAMBOO TREE - STARTS HERE-------------------------------------//

function drawBambooTree()
{
  mvPushMatrix();
  gl.bindBuffer( gl.ARRAY_BUFFER, cylinderVertexBuffer);
  gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);

  gl.bindBuffer( gl.ARRAY_BUFFER, cylinderNormalBuffer);
  gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);

  materialColor = vec4(colorR[objBambooTrunk], colorG[objBambooTrunk], colorB[objBambooTrunk], 1);
  setMatrixUnifroms();
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, nt.length); // Draws the sphere from the defined location in the buffer
  mvPopMatrix();
}

function drawBamboo()
{
  for(var i = 0; i < noOfLevels[objBambooBranches]; i++)
  {
    if(i%2==0)
    {
      modelViewMatrix = mult(modelViewMatrix, translate(translateX[objBambooBranches], translateY[objBambooBranches], translateZ[objBambooBranches]));
      modelViewMatrix = mult(modelViewMatrix, rotateZ(angleZ[objBambooBranches]));
      modelViewMatrix = mult(modelViewMatrix, rotateX(angleX[objBambooBranches]));
    }
    else {
      modelViewMatrix = mult(modelViewMatrix, translate(translateX[objBambooBranches], translateY[objBambooBranches], -translateZ[objBambooBranches]));
      modelViewMatrix = mult(modelViewMatrix, rotateZ(angleZ[objBambooBranches]));
      modelViewMatrix = mult(modelViewMatrix, rotateX(angleX[objBambooBranches]-4));
    }

    gl.bindBuffer( gl.ARRAY_BUFFER, cylinderVertexBuffer);
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);

    gl.bindBuffer( gl.ARRAY_BUFFER, cylinderNormalBuffer);
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);

    materialColor = vec4(colorR[objBambooBranches], colorG[objBambooBranches], colorB[objBambooBranches]);
    setMatrixUnifroms();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, nt.length); // Draws the sphere from the defined location in the buffer
  }
}
//------------------------------------------BAMBOO TREE - ENDS HERE-------------------------------------//

//------------------------------------------CHRISTMAS TREE - STARTS HERE-------------------------------------//

function drawChristmasTreeTrunk()
{
  mvPushMatrix();
  modelViewMatrix = mult(modelViewMatrix, translate(translateX[objChristmasTreeTrunk], translateY[objChristmasTreeTrunk], translateZ[objChristmasTreeTrunk]));
  modelViewMatrix = mult(modelViewMatrix, scalem([scaleFactorX[objChristmasTreeTrunk], scaleFactorY[objChristmasTreeTrunk], scaleFactorZ[objChristmasTreeTrunk]]));
  gl.bindBuffer( gl.ARRAY_BUFFER, cylinderVertexBuffer);
  gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);

  gl.bindBuffer( gl.ARRAY_BUFFER, cylinderNormalBuffer);
  gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);

  materialColor = vec4(colorR[objChristmasTreeTrunk], colorG[objChristmasTreeTrunk], colorB[objChristmasTreeTrunk], 1);
  setMatrixUnifroms();
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, nt.length); // Draws the sphere from the defined location in the buffer
  mvPopMatrix();
}

function drawChristmasTree(levels, scaleFactor)
{
  for(var i = 0; i < noOfBranches[objChristmasTreeBranches]; i++)
  {
    mvPushMatrix();
    modelViewMatrix = mult(modelViewMatrix, translate(translateX[objChristmasTreeBranches], translateY[objChristmasTreeBranches], translateZ[objChristmasTreeBranches]));
    modelViewMatrix = mult(modelViewMatrix, scalem([scaleFactor, scaleFactorY[objChristmasTreeBranches], scaleFactorZ[objChristmasTreeBranches]]));

    gl.bindBuffer( gl.ARRAY_BUFFER, sphereVertexBuffer);
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);

    gl.bindBuffer( gl.ARRAY_BUFFER, sphereNormalBuffer);
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);

    materialColor = vec4(Math.random()*colorR[objChristmasTreeBranches], Math.random()*colorG[objChristmasTreeBranches], Math.random()*colorB[objChristmasTreeBranches], 1);
    setMatrixUnifroms();
    gl.drawArrays(gl.TRIANGLE_FAN, 0, coneVertices.length); // Draws the sphere from the defined location in the buffer
    if(levels > 1)
    {
      drawChristmasTree(--levels,scaleFactor+0.02);
    }
    mvPopMatrix();
  }
}
//------------------------------------------CHRISTMAS TREE - ENDS HERE-------------------------------------//

//------------------------------------------PALM TREE - STARTS HERE-------------------------------------//

function drawPalmTree()
{
  for(var i = 0; i < noOfLevels[objPalmTreeTrunk]; i++)
  {
  mvPushMatrix();
  modelViewMatrix = mult(modelViewMatrix, translate(translateX[objPalmTreeTrunk], translateY[objPalmTreeTrunk], translateZ[objPalmTreeTrunk]));
  modelViewMatrix = mult(modelViewMatrix, scalem([scaleFactorX[objPalmTreeTrunk], scaleFactorY[objPalmTreeTrunk], scaleFactorZ[objPalmTreeTrunk]]));
  modelViewMatrix = mult(modelViewMatrix, rotateX(angleX[objPalmTreeTrunk]));
  gl.bindBuffer( gl.ARRAY_BUFFER, cylinderVertexBuffer);
  gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);

  gl.bindBuffer( gl.ARRAY_BUFFER, cylinderNormalBuffer);
  gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);

  materialColor = vec4(colorR[objPalmTreeTrunk], colorG[objPalmTreeTrunk], colorB[objPalmTreeTrunk], 1);
  setMatrixUnifroms();
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, nt.length); // Draws the sphere from the defined location in the buffer
  }
  mvPopMatrix();
}

function drawFruits(noOfFruits)
{
  for(i = 0; i < noOfFruits; i++)
  {
  mvPushMatrix();
  modelViewMatrix = mult(modelViewMatrix, translate(translateX[objPalmTreeFruit], translateY[objPalmTreeFruit], translateZ[objPalmTreeFruit]));
  modelViewMatrix = mult(modelViewMatrix, scalem([scaleFactorX[objPalmTreeFruit], scaleFactorY[objPalmTreeFruit], scaleFactorZ[objPalmTreeFruit]]));
  modelViewMatrix = mult(modelViewMatrix, rotateY(angleY[objPalmTreeFruit]));
  modelViewMatrix = mult(modelViewMatrix, rotateX(angleX[objPalmTreeFruit]));

  gl.bindBuffer( gl.ARRAY_BUFFER, sunVertexBuffer);
  gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);

  gl.bindBuffer( gl.ARRAY_BUFFER, sunNormalBuffer);
  gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);

  materialColor = vec4(colorR[objPalmTreeFruit], colorG[objPalmTreeFruit], colorB[objPalmTreeFruit], 1);
  setMatrixUnifroms();
  gl.drawArrays(gl.TRIANGLES, 0, vertices.length); // Draws the circle at the defined location in the buffer
  }
  mvPopMatrix();
}

function drawBranchesOnTopOfPalm(levels)
{
  var angle = angleZ[objPalmTreeBranches]/noOfBranches[objPalmTreeBranches];
  for(var i = 0; i < noOfBranches[objPalmTreeBranches]; i++)
  {
    mvPushMatrix();
    for(var j = 0; j < levels; j++)
    {
      modelViewMatrix = mult(modelViewMatrix, translate(translateX[objPalmTreeBranches], translateY[objPalmTreeBranches], translateZ[objPalmTreeBranches]));
      modelViewMatrix = mult(modelViewMatrix, rotateZ((i+1)*angle));
      modelViewMatrix = mult(modelViewMatrix, rotateX(angleX[objPalmTreeBranches]));
      modelViewMatrix = mult(modelViewMatrix, rotateY(angleY[objPalmTreeBranches]));
      modelViewMatrix = mult(modelViewMatrix, scalem([scaleFactorX[objPalmTreeBranches], scaleFactorY[objPalmTreeBranches], scaleFactorZ[objPalmTreeBranches]]));

      gl.bindBuffer( gl.ARRAY_BUFFER, sphereVertexBuffer);
      gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);

      gl.bindBuffer( gl.ARRAY_BUFFER, sphereNormalBuffer);
      gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);

      materialColor = vec4(colorR[objPalmTreeBranches], colorG[objPalmTreeBranches], colorB[objPalmTreeBranches], 1);;
      setMatrixUnifroms();
      gl.drawArrays(gl.TRIANGLE_FAN, 0, coneVertices.length); // Draws the sphere from the defined location in the buffer
    }
    mvPopMatrix();
  }
}

//------------------------------------------PALM TREE - ENDS HERE-------------------------------------//

//------------------------------------------SUPER SIMPLE TREE - STARTS HERE-------------------------------------//

// Simple Tree
function drawSuperSimpleTree()
{
  mvPushMatrix();
  modelViewMatrix = mult(modelViewMatrix, scalem([scaleFactorX[objSuperSimpleTreeTrunk], scaleFactorY[objSuperSimpleTreeTrunk], scaleFactorZ[objSuperSimpleTreeTrunk]]));
  modelViewMatrix = mult(modelViewMatrix, translate(translateX[objSuperSimpleTreeTrunk], translateY[objSuperSimpleTreeTrunk], translateZ[objSuperSimpleTreeTrunk]));
  gl.bindBuffer( gl.ARRAY_BUFFER, sphereVertexBuffer);
  gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);

  gl.bindBuffer( gl.ARRAY_BUFFER, sphereNormalBuffer);
  gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);

  materialColor = vec4(colorR[objSuperSimpleTreeTrunk], colorG[objSuperSimpleTreeTrunk], colorB[objSuperSimpleTreeTrunk], 1);
  setMatrixUnifroms();
  gl.drawArrays(gl.TRIANGLE_FAN, 0, coneVertices.length); // Draws the sphere from the defined location in the buffer
  mvPopMatrix();
}

//For Simple Tree Branches
function drawSuperSimpleTreeBranches(levels, scaleFactor)
{
  var angle = angleZ[objSuperSimpleTreeBranches]/noOfBranches[objSuperSimpleTreeBranches];
  for(var i = 0; i < noOfBranches[objSuperSimpleTreeBranches]; i++)
  {
    mvPushMatrix();
    modelViewMatrix = mult(modelViewMatrix, translate(translateX[objSuperSimpleTreeBranches], translateY[objSuperSimpleTreeBranches], translateZ[objSuperSimpleTreeBranches]));
    modelViewMatrix = mult(modelViewMatrix, rotateZ((i+1)*angle));
    modelViewMatrix = mult(modelViewMatrix, rotateX(angleX[objSuperSimpleTreeBranches]));
    modelViewMatrix = mult(modelViewMatrix, scalem([scaleFactor, scaleFactor, scaleFactor]));

    gl.bindBuffer( gl.ARRAY_BUFFER, sphereVertexBuffer);
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);

    gl.bindBuffer( gl.ARRAY_BUFFER, sphereNormalBuffer);
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);

    setMatrixUnifroms();
    materialColor = vec4(colorR[objSuperSimpleTreeBranches], colorG[objSuperSimpleTreeBranches], colorB[objSuperSimpleTreeBranches], 1);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, coneVertices.length); // Draws the sphere from the defined location in the buffer
    if(levels > 1)
    {
      drawSuperSimpleTreeBranches(--levels, scaleFactor-0.05);
    }
    mvPopMatrix();
  }
}

//------------------------------------------SUPER SIMPLE TREE - ENDS HERE-------------------------------------//
















// Set all the matrix uniforms for all the object
function setMatrixUnifroms(){
  if(isLighting) {
    // ambient product will be the multiplication of the material color and ambient color
    ambientProduct = mult(ambientColor, materialColor);
    // diffuse product will be the multiplication of the material color and diffused lightning color
    diffuseProduct = mult(diffuseColor, materialColor);
  }
  else {
    diffuseProduct = materialColor;
    ambientProduct = ambientColor;
  }
  gl.uniformMatrix4fv(mvMatrixUniform, false, flatten(modelViewMatrix));
  gl.uniform1i(useLightingUniform, isLighting);
  gl.uniform4fv(vColorUniform, materialColor);
  gl.uniform4fv(ambientColorUniform, flatten(ambientProduct) );
  gl.uniform4fv(diffuseColorUniform, flatten(diffuseProduct) );
  gl.uniform4fv(specularColorUniform, flatten(specularColor) );
  gl.uniform4fv(lightPositionUniform, flatten(lightPosition) );
  gl.uniform1f(glossinessUniform,glossiness);
}



// for drawing sun
function drawSun()
{
  var temPositionOfsun = eye;

  mvPushMatrix();
  modelViewMatrix = mult(modelViewMatrix, translate(lightPosition[0] - 1,lightPosition[1] - 1, lightPosition[2] + 1));
  modelViewMatrix = mult(modelViewMatrix, scalem([0.8,0.8,0.8]));

  gl.bindBuffer( gl.ARRAY_BUFFER, sunVertexBuffer);
  gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);

  gl.bindBuffer( gl.ARRAY_BUFFER, sunNormalBuffer);
  gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);

  materialColor = vec4(1,1,1,1);
  setMatrixUnifroms();
  gl.drawArrays(gl.TRIANGLES, 0, vertices.length); // Draws the circle at the defined location in the buffer
  mvPopMatrix();
}

// Loop through render function in the specified time interval
function render()
{
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  modelViewMatrix = lookAt(eye, at , up); // Set the camera
  projectionMatrix = perspective(fovy, aspect, near, far); // Set the perspective

  // Set the projection matrix intially for all the objects
  gl.uniformMatrix4fv(pMatrixUniform, false, flatten(projectionMatrix));

  drawForest();

  setTimeout(
    function (){requestAnimFrame(render);}, gameDelay // According to the delay, render function will be called.
  );
}


function drawForest()
{

  drawSun();

  // Simple Tree
  mvPushMatrix();
  modelViewMatrix = mult(modelViewMatrix, translate(translateX[objSimpleTree], translateY[objSimpleTree], translateZ[objSimpleTree]));
  drawSimpleTree();
  drawBranches(noOfLevels[objSimpleTreeBranches], scaleFactor[objSimpleTreeBranches]);
  drawLeaves(noOfLevels[objSimpleTreeLeaves], scaleFactor[objSimpleTreeLeaves]);
  mvPopMatrix();

  // Only Bamboo Tree
  for(var i = 0; i < 2; i++)
  {
    mvPushMatrix();
    modelViewMatrix = mult(modelViewMatrix, translate(i+translateX[objBambooTree], translateY[objBambooTree], i-translateZ[objBambooTree]));
    modelViewMatrix = mult(modelViewMatrix, scalem([scaleFactorX[objBambooTree], scaleFactorY[objBambooTree], scaleFactorZ[objBambooTree]]));
    modelViewMatrix = mult(modelViewMatrix, rotateX((i*angleX[objBambooTree])-(2*angleX[objBambooTree])));
    drawBambooTree();
    drawBamboo();
    mvPopMatrix();
  }

  // Basic Tree
  mvPushMatrix();
  modelViewMatrix = mult(modelViewMatrix, translate(translateX[objSuperSimpleTree], translateY[objSuperSimpleTree], translateZ[objSuperSimpleTree]));
  drawSuperSimpleTree();
  drawSuperSimpleTreeBranches(noOfLevels[objSuperSimpleTreeBranches], scaleFactor[objSuperSimpleTreeBranches]);
  mvPopMatrix();

  // Christmas Tree
  mvPushMatrix();
  modelViewMatrix = mult(modelViewMatrix, translate(translateX[objChristmasTree], translateY[objChristmasTree], translateZ[objChristmasTree]));
  drawChristmasTreeTrunk();
  drawChristmasTree(noOfLevels[objChristmasTreeBranches], scaleFactor[objChristmasTreeBranches]);
  mvPopMatrix();

  // Palm Tree
  mvPushMatrix();
  modelViewMatrix = modelViewMatrix = mult(modelViewMatrix, translate(translateX[objPalmTree], translateY[objPalmTree], translateZ[objPalmTree]));
  drawPalmTree();
  drawFruits(noOfBranches[objPalmTreeFruit]);
  drawBranchesOnTopOfPalm(noOfLevels[objPalmTreeBranches]);
  mvPopMatrix();
}


function mvPushMatrix() {
  var copy = modelViewMatrix;
  modelViewMatrixStack.push(copy);
}

function mvPopMatrix()
{
  if (modelViewMatrixStack.length == 0) {
    throw "Invalid popMatrix!";
  }
  modelViewMatrix = modelViewMatrixStack.pop();
}
