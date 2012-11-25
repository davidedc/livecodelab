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


// For each pool we have a count of how many of those entries
// are actually used in the current frame.
// This is so that we can go through the scene graph and hide the unused objects.
var objectsUsedInFrameCounts = [];
var usedAmbientLights = 0;
var usedPointLights = 0;


var ballDefaultDetLevel;
var ballDetLevel;
var currentStrokeSize = 1;


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



