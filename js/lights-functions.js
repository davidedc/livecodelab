
var previousanimationStyleValue = 0;
var ambientLightsPool = [];

// ambientColor is always white
// because it needs to reflect what the
// ambient light color is
// I tried to set the ambientColor directly
// but it doesn't work. It needs to be white so
// that the tint of the ambientLight is shown. 
var ambientColor = color(255, 255, 255);
//ambient = function(a) {
//ambientColor = a;
//}
var reflectValue = 1;
//reflect = function(a) {
//  reflectValue = a;
//}
var refractValue = 0.98;
//refract = function(a) {
//  refractValue = a;
//}
var lightsAreOn = false;
var lights = function() {
  lightsAreOn = true;
}
var noLights = function() {
  lightsAreOn = false;
}


var ambientLight = function() {

  var colorToBeUsed;
  if (arguments[0] === undefined) {
    // empty arguments gives some sort
    // of grey ambient light.
    // black is too stark and white
    // doesn't show the effect with the
    // default white fill
    colorToBeUsed = color$1(125);
  } else {
    colorToBeUsed = color(arguments[0], arguments[1], arguments[2], arguments[3]);
  }

  var newLightCreated = false;
  lightsAreOn = true;
  defaultNormalFill = false;
  defaultNormalStroke = false;

  var pooledAmbientLight = ambientLightsPool[usedAmbientLights];
  if (pooledAmbientLight === undefined) {
    logger('no ambientLight in pool, creating one');
    pooledAmbientLight = new THREE.AmbientLight(colorToBeUsed);
    newLightCreated = true;
    ambientLightsPool.push(pooledAmbientLight);
  } else {
    pooledAmbientLight.color.setHex(colorToBeUsed);
    logger('existing ambientLight in pool, setting color: ' + pooledAmbientLight.color.r + ' ' + pooledAmbientLight.color.g + ' ' + pooledAmbientLight.color.b);
  }


  pooledAmbientLight.isLine = false;
  pooledAmbientLight.isRectangle = false;
  pooledAmbientLight.isBox = false;
  pooledAmbientLight.isCylinder = false;
  pooledAmbientLight.isAmbientLight = true;
  pooledAmbientLight.isPointLight = false;
  pooledAmbientLight.isSphere = 0;


  usedAmbientLights++;
  pooledAmbientLight.matrixAutoUpdate = false;
  pooledAmbientLight.matrix.copy(worldMatrix);
  pooledAmbientLight.matrixWorldNeedsUpdate = true;

  if (newLightCreated) ThreeJs.scene.add(pooledAmbientLight);


}

var animationStyle = function(a) {
  // turns out when you type normal that the first two letters "no"
  // are sent as "false"
  if (a === false) return;
  if (a === undefined) return;
  animationStyleValue = a;
}


var animationStyleUpdateIfChanged = function() {
  //alert("actual called " + a);
  if ((animationStyleValue !== previousanimationStyleValue)) {
    //alert("actual changed!");
  } else {
    //alert("no change");
    return;
  }

  previousanimationStyleValue = animationStyleValue;

  if (ThreeJs.isWebGLUsed && animationStyleValue === motionBlur) {
    ThreeJs.effectBlend.uniforms['mixRatio'].value = 0.7;
  } else if (!ThreeJs.isWebGLUsed && animationStyleValue === motionBlur) {
    blendAmount = 0.6;
    //alert('motion blur canvas');
  }

  if (ThreeJs.isWebGLUsed && animationStyleValue === paintOver) {
    ThreeJs.effectBlend.uniforms['mixRatio'].value = 1;
  } else if (!ThreeJs.isWebGLUsed && animationStyleValue === paintOver) {
    blendAmount = 1;
    //alert('paintOver canvas');
  }

  if (ThreeJs.isWebGLUsed && animationStyleValue === normal) {
    ThreeJs.effectBlend.uniforms['mixRatio'].value = 0;
  } else if (!ThreeJs.isWebGLUsed && animationStyleValue === normal) {
    blendAmount = 0;
    //alert('normal canvas');
  }

}
