var stats, scene, renderer;
var camera;

// creating a geometry is expensive
// so we need to create ONE cube of dimensions 1,1,1
// if we need a cube of different size, then we need to
// scale it. Note that the scale for the specific cube shouldn't
// influence the stack, so we need to create a scale node,
// and then go up a node.
var isWebGLUsed = false;

var linesPool = [];
var rectanglesPool = [];
var boxesPool = [];
var cylindersPool = [];
// spheres have different geometries
// depending on the detail level,
// which can be set at whim
var spheresPool = {};
var sphereGeometriesPool = {};
var ambientLightsPool = [];
var pointLightsPool = [];
var usedLines = 0;
var usedRectangles = 0;
var usedBoxes = 0;
var usedCylinders = 0;
var usedAmbientLights = 0;
var usedPointLights = 0;
var usedSpheres = {};
var ballDefaultDetLevel;
var ballDetLevel;
var currentStrokeSize = 1;
var cubeGeometry = new THREE.CubeGeometry(1, 1, 1);
var planeGeometry = new THREE.PlaneGeometry(1, 1);
var lineGeometry = new THREE.Geometry();
var cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
lineGeometry.vertices.push(new THREE.Vertex(new THREE.Vector3(0, -0.5, 0)));
lineGeometry.vertices.push(new THREE.Vertex(new THREE.Vector3(0, 0.5, 0)));

// loads identity matrix
var worldMatrix = new THREE.Matrix4();

var frenchVersion = false;
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
var currentGradientStackValue = '';
var previousGradientStackValue = 0;
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

// Color constants, modified from processing.js
// with added the missing ones from the CSS standard,
// which includes the spelling "grey" on top of "gray"
var aliceblue = 0xfff0f8ff;
var antiquewhite = 0xfffaebd7;
var aqua = 0xff00ffff;
var aquamarine = 0xff7fffd4;
var azure = 0xfff0ffff;
var beige = 0xfff5f5dc;
var bisque = 0xffffe4c4;
var black = 0xff000000;
var blanchedalmond = 0xffffebcd;
var blue = 0xff0000ff;
var blueviolet = 0xff8a2be2;
var brown = 0xffa52a2a;
var burlywood = 0xffdeb887;
var cadetblue = 0xff5f9ea0;
var chartreuse = 0xff7fff00;
var chocolate = 0xffd2691e;
var coral = 0xffff7f50;
var cornflowerblue = 0xff6495ed;
var cornsilk = 0xfffff8dc;
var crimson = 0xffdc143c;
var cyan = 0xff00ffff;
var darkblue = 0xff00008b;
var darkcyan = 0xff008b8b;
var darkgoldenrod = 0xffb8860b;
var darkgray = 0xffa9a9a9;
var darkgrey = 0xffa9a9a9;
var darkgreen = 0xff006400;
var darkkhaki = 0xffbdb76b;
var darkmagenta = 0xff8b008b;
var darkolivegreen = 0xff556b2f;
var darkorange = 0xffff8c00;
var darkorchid = 0xff9932cc;
var darkred = 0xff8b0000;
var darksalmon = 0xffe9967a;
var darkseagreen = 0xff8fbc8f;
var darkslateblue = 0xff483d8b;
var darkslategray = 0xff2f4f4f;
var darkslategrey = 0xff2f4f4f;
var darkturquoise = 0xff00ced1;
var darkviolet = 0xff9400d3;
var deeppink = 0xffff1493;
var deepskyblue = 0xff00bfff;
var dimgray = 0xff696969;
var dimgrey = 0xff696969;
var dodgerblue = 0xff1e90ff;
var firebrick = 0xffb22222;
var floralwhite = 0xfffffaf0;
var forestgreen = 0xff228b22;
var fuchsia = 0xffff00ff;
var gainsboro = 0xffdcdcdc;
var ghostwhite = 0xfff8f8ff;
var gold = 0xffffd700;
var goldenrod = 0xffdaa520;
var gray = 0xff808080;
var grey = 0xff808080;
var green = 0xff008000;
var greenyellow = 0xffadff2f;
var honeydew = 0xfff0fff0;
var hotpink = 0xffff69b4;
var indianred = 0xffcd5c5c;
var indigo = 0xff4b0082;
var ivory = 0xfffffff0;
var khaki = 0xfff0e68c;
var lavender = 0xffe6e6fa;
var lavenderblush = 0xfffff0f5;
var lawngreen = 0xff7cfc00;
var lemonchiffon = 0xfffffacd;
var lightblue = 0xffadd8e6;
var lightcoral = 0xfff08080;
var lightcyan = 0xffe0ffff;
var lightgoldenrodyellow = 0xfffafad2;
var lightgrey = 0xffd3d3d3;
var lightgray = 0xffd3d3d3;
var lightgreen = 0xff90ee90;
var lightpink = 0xffffb6c1;
var lightsalmon = 0xffffa07a;
var lightseagreen = 0xff20b2aa;
var lightskyblue = 0xff87cefa;
var lightslategray = 0xff778899;
var lightslategrey = 0xff778899;
var lightsteelblue = 0xffb0c4de;
var lightyellow = 0xffffffe0;
var lime = 0xff00ff00;
var limegreen = 0xff32cd32;
var linen = 0xfffaf0e6;
var magenta = 0xffff00ff;
var maroon = 0xff800000;
var mediumaquamarine = 0xff66cdaa;
var mediumblue = 0xff0000cd;
var mediumorchid = 0xffba55d3;
var mediumpurple = 0xff9370d8;
var mediumseagreen = 0xff3cb371;
var mediumslateblue = 0xff7b68ee;
var mediumspringgreen = 0xff00fa9a;
var mediumturquoise = 0xff48d1cc;
var mediumvioletred = 0xffc71585;
var midnightblue = 0xff191970;
var mintcream = 0xfff5fffa;
var mistyrose = 0xffffe4e1;
var moccasin = 0xffffe4b5;
var navajowhite = 0xffffdead;
var navy = 0xff000080;
var oldlace = 0xfffdf5e6;
var olive = 0xff808000;
var olivedrab = 0xff6b8e23;
var orange = 0xffffa500;
var orangered = 0xffff4500;
var orchid = 0xffda70d6;
var palegoldenrod = 0xffeee8aa;
var palegreen = 0xff98fb98;
var paleturquoise = 0xffafeeee;
var palevioletred = 0xffd87093;
var papayawhip = 0xffffefd5;
var peachpuff = 0xffffdab9;
var peru = 0xffcd853f;
var pink = 0xffffc0cb;
var plum = 0xffdda0dd;
var powderblue = 0xffb0e0e6;
var purple = 0xff800080;
var red = 0xffff0000;
var rosybrown = 0xffbc8f8f;
var royalblue = 0xff4169e1;
var saddlebrown = 0xff8b4513;
var salmon = 0xfffa8072;
var sandybrown = 0xfff4a460;
var seagreen = 0xff2e8b57;
var seashell = 0xfffff5ee;
var sienna = 0xffa0522d;
var silver = 0xffc0c0c0;
var skyblue = 0xff87ceeb;
var slateblue = 0xff6a5acd;
var slategray = 0xff708090;
var slategrey = 0xff708090;
var snow = 0xfffffafa;
var springgreen = 0xff00ff7f;
var steelblue = 0xff4682b4;
var tan = 0xffd2b48c;
var teal = 0xff008080;
var thistle = 0xffd8bfd8;
var tomato = 0xffff6347;
var turquoise = 0xff40e0d0;
var violet = 0xffee82ee;
var wheat = 0xfff5deb3;
var white = 0xffffffff;
var whitesmoke = 0xfff5f5f5;
var yellow = 0xffffff00;
var yellowgreen = 0xff9acd32;