var stats, scene, renderer;
var camera;

var editor;
var autocoder;

var composer;

var logger = createDebugger();
var BigCursor = createBigCursor();
var LiveCodeLab = createLiveCodeLab();

// creating a geometry is expensive
// so we need to create ONE cube of dimensions 1,1,1
// if we need a cube of different size, then we need to
// scale it. Note that the scale for the specific cube shouldn't
// influence the stack, so we need to create a scale node,
// and then go up a node.
var isWebGLUsed = false;

var minimumBallDetail = 2;
var maximumBallDetail = 30;

var GEOM_TYPE_LINE = 0;
var GEOM_TYPE_RECT = 1;
var GEOM_TYPE_BOX = 2;
var GEOM_TYPE_CYLINDER = 3;
var GEOM_TYPE_SPHERE = 4;

// Since you can't change the mesh of an object once it's created, we keep around
// a pool of objects for each mesh type. There is one pool for lines, one for rectangles, one
// for boxes. There is one pool for each detail level of spheres (since they are different)
// meshes. For the time being there is no detail level for cylinders so there is only
// one pool for cylinders.

// For how the mechanism works now, all pooled objects end up in the scene graph.
// The scene graph is traversed at each frame and only the used objects are marked as
// visible, the other unused objects are hidden. This is because adding/removing
// objects from the scene is expensive. Note that this might have changed with more
// recent versions of Three.js of the past 4 months.

// All object pools start empty. Note that each sphere detail level must have
// its own pool, because you can't easily change the mesh of an object.
// If one doesn't like the idea of creating dozens of empty arrays that won't ever be
// used (since probably only a few sphere detail levels will be used in a session)
// then one could leave all these arrays undefined and define them at runtime
// only when needed.
var objectPool = [];
objectPool[GEOM_TYPE_LINE] = [];
objectPool[GEOM_TYPE_RECT] = [];
objectPool[GEOM_TYPE_BOX] = [];
objectPool[GEOM_TYPE_CYLINDER] = [];
for (var creatingSpherePools = 0; creatingSpherePools < (maximumBallDetail - minimumBallDetail + 1); creatingSpherePools++){
	objectPool[GEOM_TYPE_SPHERE + creatingSpherePools] = [];
}

var sphereGeometriesPool = {};

var ambientLightsPool = [];
var pointLightsPool = [];

// For each pool we have a count of how many of those entries
// are actually used in the current frame.
// This is so that we can go through the scene graph and hide the unused objects.
var objectsUsedInFrameCounts = [];
var usedAmbientLights = 0;
var usedPointLights = 0;


var ballDefaultDetLevel;
var ballDetLevel;
var currentStrokeSize = 1;

var geometriesBank = [];
geometriesBank[GEOM_TYPE_LINE] = new THREE.Geometry();
  geometriesBank[GEOM_TYPE_LINE].vertices.push(new THREE.Vertex(new THREE.Vector3(0, -0.5, 0)));
  geometriesBank[GEOM_TYPE_LINE].vertices.push(new THREE.Vertex(new THREE.Vector3(0, 0.5, 0)));
geometriesBank[GEOM_TYPE_RECT] = new THREE.PlaneGeometry(1, 1);
geometriesBank[GEOM_TYPE_BOX] = new THREE.CubeGeometry(1, 1, 1);
geometriesBank[GEOM_TYPE_CYLINDER] = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
for (var creatingSphereGeometries = 0; creatingSphereGeometries < (maximumBallDetail - minimumBallDetail + 1); creatingSphereGeometries++){
	geometriesBank[GEOM_TYPE_SPHERE + creatingSphereGeometries] = new THREE.SphereGeometry(1, minimumBallDetail + creatingSphereGeometries, minimumBallDetail + creatingSphereGeometries);
}

//var geometriesBank[primitiveType];
//var planeGeometry;
//var geometriesBank[primitiveType];
//var geometriesBank[primitiveType];

// loads identity matrix
var worldMatrix = new THREE.Matrix4();

var forceCanvasRenderer = false;
var backgroundScene;
var backgroundSceneContext;
var sceneRenderingCanvas;
var sceneRenderingCanvasContext;
var previousRenderForBlending;
var previousRenderForBlendingContext;
var finalRenderWithSceneAndBlend;
var finalRenderWithSceneAndBlendContext;
var useRequestAnimationFrame = true;
// if you put to -1 then it means that
// requestAnimationFrame will try to go as fast as it
// can.
var wantedFramesPerSecond = -1;
var backGroundFraction = 15;
var scaledBackgroundWidth;
var scaledBackgroundHeight;
var repaintBackroundEveryFrame = true;
var fullScreenifyBackground = true;
var animationStyleValue = 0;
var previousanimationStyleValue = 0;
var blendAmount = 0;
var normal = 0;
var paintOver = 1;
var motionBlur = 2;

var soundLoops = [];
soundLoops.soundIDs = [];
soundLoops.beatStrings = [];

var programHasBasicError = false;
var reasonOfBasicError = "";
var consecutiveFramesWithoutRunTimeError = 0;
var out;
var lastStableProgram;

// the "spinthingy" is because we want
// users who type "box" to see that it's actually
// a 3d environment. So the first few primitives
// spin for a few moments when they are created.
var doTheSpinThingy = true;
var resetTheSpinThingy = false;
var SPINFRAMES = 30;

var userWarnedAboutWebglExamples = false;


var dimIntervalID;



function isCanvasSupported() {
    var elem = document.createElement('canvas');
    return !!(elem.getContext && elem.getContext('2d'));
}


