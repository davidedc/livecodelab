// init the scene


buildPostprocessingChain = function() {
  renderTargetParameters = {
    format: THREE.RGBAFormat,
    stencilBuffer: true
  };

  renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters);
  effectSaveTarget = new THREE.SavePass(new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters));
  effectSaveTarget.clear = false;

  fxaaPass = new THREE.ShaderPass(THREE.ShaderExtras["fxaa"]);
  fxaaPass.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);

  effectBlend = new THREE.ShaderPass(THREE.ShaderExtras["blend"], "tDiffuse1");
  screenPass = new THREE.ShaderPass(THREE.ShaderExtras["screen"]);

  // motion blur
  effectBlend.uniforms['tDiffuse2'].texture = effectSaveTarget.renderTarget;
  effectBlend.uniforms['mixRatio'].value = 0;

  var renderModel = new THREE.RenderPass(scene, camera);

  composer = new THREE.EffectComposer(renderer, renderTarget);

  composer.addPass(renderModel);
  //composer.addPass( fxaaPass );
  composer.addPass(effectBlend);
  composer.addPass(effectSaveTarget);
  composer.addPass(screenPass);
  screenPass.renderToScreen = true;
}



function render() {


  /*
      // need a light for the meshlambert material
      var light = new THREE.PointLight( 0xFFFFFF );
      light.position.set( 10, 0, 10 );
      scene.add( light );
      */



  ////////////////////////
  if (isWebGLUsed) {
    composer.render();
    //renderer.render(scene,camera);
  } else {


    // the renderer draws into an offscreen canvas called sceneRenderingCanvas
    renderer.render(scene, camera);

    // clear the final render context
    finalRenderWithSceneAndBlendContext.globalAlpha = 1.0;
    finalRenderWithSceneAndBlendContext.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // draw the rendering of the scene on the final render
    // clear the final render context
    finalRenderWithSceneAndBlendContext.globalAlpha = blendAmount;
    finalRenderWithSceneAndBlendContext.drawImage(previousRenderForBlending, 0, 0);

    finalRenderWithSceneAndBlendContext.globalAlpha = 1.0;
    finalRenderWithSceneAndBlendContext.drawImage(sceneRenderingCanvas, 0, 0);

    //previousRenderForBlendingContext.clearRect(0, 0, window.innerWidth,window.innerHeight)
    previousRenderForBlendingContext.globalCompositeOperation = 'copy';
    previousRenderForBlendingContext.drawImage(finalRenderWithSceneAndBlend, 0, 0);

    // clear the renderer's canvas to transparent black
    sceneRenderingCanvasContext.clearRect(0, 0, window.innerWidth, window.innerHeight);



  }


}


var drawLoopTimer = null;
var frame = 0;
var doLNOnce = [];


// By doing some profiling it is apparent that
// adding and removing objects has a big cost.
// So instead of adding/removing objects every frame,
// objects are only added at creation and they are
// never removed from the scene. They are
// only made invisible. This routine combs the
// scene and finds the objects that.
// TODO a way to shrink the scene if it's been a
// long time that only a handful of lines/meshes
// have been used.

function combDisplayList() {

  for (var i = 0; i < scene.objects.length; ++i) {
    var sceneObject = scene.objects[i];
    if (sceneObject.isLine) {
      if (usedLines > 0) {
        sceneObject.visible = true;
        usedLines--;
      } else {
        sceneObject.visible = false;
      }
    } else if (sceneObject.isRectangle) {
      if (usedRectangles > 0) {
        sceneObject.visible = true;
        usedRectangles--;
      } else {
        sceneObject.visible = false;
      }
    } else if (sceneObject.isBox) {
      if (usedBoxes > 0) {
        sceneObject.visible = true;
        usedBoxes--;
      } else {
        sceneObject.visible = false;
      }
    } else if (sceneObject.isCylinder) {
      if (usedCylinders > 0) {
        sceneObject.visible = true;
        usedCylinders--;
      } else {
        sceneObject.visible = false;
      }
    } else if (sceneObject.isAmbientLight) {
      if (usedAmbientLights > 0) {
        sceneObject.visible = true;
        usedAmbientLights--;
      } else {
        sceneObject.visible = false;
      }
    } else if (sceneObject.isSphere !== 0) {
      if (usedSpheres['' + sceneObject.isSphere] > 0) {
        sceneObject.visible = true;
        usedSpheres['' + sceneObject.isSphere] = usedSpheres['' + sceneObject.isSphere] - 1;
      } else {
        sceneObject.visible = false;
      }
    }
  }
}


function clearDisplayList() {
  /*
  for(var i = 0; i < scene.objects.length; ++i) {
      scene.remove(scene.objects[i]);
      i--;
  }
  */
}



//var chromeHackUncaughtReferenceName = '';
//var chromeHackUncaughtReferenceNames = [];

// swap the two lines below in case one needs to
// debug the environment, otherwise all errors are
// caught and not bubbled up to the browser debugging tool.
// var foo = function(msg, url, linenumber) {
window.onerror = function(msg, url, linenumber) {

  if (autocodeOn) {
    editor.undo();
    //alert("did an undo");
    return;
  }

  if (msg.indexOf("Uncaught ReferenceError: ") > -1) {
    msg = msg.substring(25);
  }

  $('#dangerSignText').css('color', 'red');
  $('#errorMessageText').text(msg);

  // ok so this is kind of a hack that we need to put
  // in place for Chrome (both Windows and Mac)
  // what Chrome does is: when there is a function call,
  // it evaluates the arguments
  // of a function even if the function is undefined
  // so for example
  // doO alert "miao"
  // alerts a miao, because it's translated into
  // doO(alert("miao))
  // and even if doO is undefined, the argumen is evaluated
  // This is a problem because doOnce would encourage
  // the following use: misspell doOnce until the rest of the
  // line is finished, then correct the mispell to actually
  // run the line once.
  // But unfortunately because of the quirk described above,
  // that wouldn't work in Chrome.
  /*
 if (msg.indexOf("Uncaught ReferenceError") > -1) {
  chromeHackUncaughtReferenceName = msg.split(' ')[2];

  var lengthToCheck = chromeHackUncaughtReferenceNames.length;
  if (lengthToCheck == 0){
    chromeHackUncaughtReferenceNames.push(chromeHackUncaughtReferenceName);
  }
  else {
    for (var iteratingOverSource = 0; iteratingOverSource < lengthToCheck; iteratingOverSource++) {
      if (chromeHackUncaughtReferenceNames[iteratingOverSource].indexOf(chromeHackUncaughtReferenceName) > -1) {
        break;
      }
      else if (iteratingOverSource == lengthToCheck-1) {
       // if we are here it means that the variable is not in the array
       chromeHackUncaughtReferenceNames.push(chromeHackUncaughtReferenceName);
      }
    }
  }
 }
 */

  // we set this to 6 because we save it as stable
  // when it's 5, so we avoid re-saving.
  consecutiveFramesWithoutRunTimeError = 6;
  window.eval(lastStableProgram);

  return true;
}


// animation loop
var loopInterval;
var time;
var timeAtStart;

function animate() {

  // loop on request animation loop
  // - it has to be at the begining of the function
  // - see details at http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
  // requestAnimationFrame seems to only do 60 fps, which in my case is too much,
  // I rather prefer to have a slower framerate but steadier.
  if (useRequestAnimationFrame) {
    if (wantedFramesPerSecond === -1) {
      requestAnimationFrame(animate);
    } else {
      //setTimeout("window.requestAnimationFrame(animate)",
      //       1000 / wantedFramesPerSecond);
      if (loopInterval === undefined) {
        loopInterval = setInterval("window.requestAnimationFrame(animate)", 1000 / wantedFramesPerSecond);
      }
    }
  } else {
    setTimeout('animate();', 1000 / wantedFramesPerSecond);
  }

  //clearDisplayList();
  matrixStack = [];
  worldMatrix.identity();

  // the sound list needs to be cleaned
  // and the beatsPerMinute set to zero
  // so that the user program can create its own from scratch
  beatsPerMinute = 0;
  soundLoops.soundIDs = [];
  soundLoops.beatStrings = [];


  //rootObject = new THREE.Object3D();
  //scene.add(rootObject);
  //parentObject = rootObject;
  if (typeof(draw) != "undefined") {
    var d = new Date();
    if (frame === 0) {
      timeAtStart = d.getTime();
      time = 0;
    } else {
      time = d.getTime() - timeAtStart;
    }
    doLNOnce = [];
    fill(0xFFFFFFFF);
    stroke(0xFF000000);
    currentStrokeSize = 1;
    defaultNormalFill = true;
    defaultNormalStroke = true;
    ballDetLevel = ballDefaultDetLevel;
    noLights();
    usedLines = 0;
    usedRectangles = 0;
    usedBoxes = 0;
    usedAmbientLights = 0;
    usedPointLights = 0;
    // In theory there is no need to chuck away the
    // counter altogether, you could go through
    // the existing counters contained in this object
    // (one for each ball detail ever used)
    // and set it to zero. That would maybe save
    // some garbage collection time.
    // But it's probably not worth it...
    usedSpheres = {};
    animationStyleValue = normal;
    resetGradientStack();
    //bpm(0);
    draw();
    // we have to repeat this check because in the case
    // the user has set frame = 0,
    // then we have to catch that case here
    // after the program has executed
    if (frame === 0) {
      timeAtStart = d.getTime();
      time = 0;
    }
    animationStyleUpdateIfChanged();
    simpleGradientUpdateIfChanged();
    updateBpmIfChanged();
    frame++;
    consecutiveFramesWithoutRunTimeError++;
    if (consecutiveFramesWithoutRunTimeError == 5) {
      lastStableProgram = out;
      //chromeHackUncaughtReferenceName = '';
    }
  }

  // do the render
  combDisplayList();
  render();
  //clearDisplayList();
  // update stats
  stats.update();


  if (doLNOnce.length !== 0) {
    //alert("a doOnce has been ran");
    elaboratedSource = editor.getValue();

    if (frenchVersion) {
      elaboratedSource = elaboratedSource.replace(/uneFois/g, "doOnce");
    }

    elaboratedSourceByLine = elaboratedSource.split("\n");
    //alert('splitting: ' + elaboratedSourceByLine.length );
    for (var iteratingOverSource = 0; iteratingOverSource < doLNOnce.length; iteratingOverSource++) {
      //alert('iterating: ' + iteratingOverSource );
      elaboratedSourceByLine[doLNOnce[iteratingOverSource]] = elaboratedSourceByLine[doLNOnce[iteratingOverSource]].replace(/^(\s*)doOnce([ ]*\->[ ]*.+)$/gm, "$1\u2713doOnce$2");
      elaboratedSourceByLine[doLNOnce[iteratingOverSource]] = elaboratedSourceByLine[doLNOnce[iteratingOverSource]].replace(/^(\s*)doOnce([ ]*\->[ ]*)$/gm, "$1\u2713doOnce$2");
    }
    elaboratedSource = elaboratedSourceByLine.join("\n");

    var cursorPositionBeforeAddingCheckMark = editor.getCursor();
    cursorPositionBeforeAddingCheckMark.ch = cursorPositionBeforeAddingCheckMark.ch + 1;

    if (frenchVersion) {
      elaboratedSource = elaboratedSource.replace(/doOnce/g, "uneFois");
    }

    editor.setValue(elaboratedSource);
    editor.setCursor(cursorPositionBeforeAddingCheckMark);

    // we want to avoid that another frame is run with the old
    // code, as this would mean that the
    // runOnce code is run more than once,
    // so we need to register the new code.
    // TODO: ideally we don't want to register the
    // new code by getting the code from codemirror again
    // because we don't know what that entails. We should
    // just pass the code we already have.
    // Also registerCode() may split the source code by line, so we can
    // avoid that since we've just split it, we could pass
    // the already split code.
    registerCode();
  }


}

var lastkey = 0;
var fakeText = true;
document.onkeypress = function(e) {

  if (fakeText && editor.getValue() !== "") shrinkFakeText(e);

}

var shrinkFakeText = function(e) {

    if (e !== undefined) {
      var theEvent = e || window.event;
      var key = theEvent.keyCode || theEvent.which;
      key = String.fromCharCode(key);
    } else key = '';

    var currentCaption = $('#caption').html();
    var shorterCaption = currentCaption.substring(0, currentCaption.length - 1);
    $('#caption').html(shorterCaption + key + "|");
    $('#fakeStartingBlinkingCursor').html('');

    $("#toMove").animate({
      opacity: 0,
      margin: -100,
      fontSize: 300,
      left: 0
    }, "fast");

    setTimeout('$("#formCode").animate({opacity: 1}, "fast");', 120);
    setTimeout('$("#justForFakeCursor").hide();', 200);
    setTimeout('$("#toMove").hide();', 200);
    //setTimeout('clearTimeout(fakeCursorInterval);',200);
    fakeText = false;

  }



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
lights = function() {
  lightsAreOn = true;
}
noLights = function() {
  lightsAreOn = false;
}


ambientLight = function() {

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
    console.log('no ambientLight in pool, creating one');
    pooledAmbientLight = new THREE.AmbientLight(colorToBeUsed);
    newLightCreated = true;
    ambientLightsPool.push(pooledAmbientLight);
  } else {
    pooledAmbientLight.color.setHex(colorToBeUsed);
    console.log('existing ambientLight in pool, setting color: ' + pooledAmbientLight.color.r + ' ' + pooledAmbientLight.color.g + ' ' + pooledAmbientLight.color.b);
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

  if (newLightCreated) scene.add(pooledAmbientLight);


}

animationStyle = function(a) {
  // turns out when you type normal that the first two letters "no"
  // are sent as "false"
  if (a === false) return;
  if (a === undefined) return;
  animationStyleValue = a;
}


animationStyleUpdateIfChanged = function() {
  //alert("actual called " + a);
  if ((animationStyleValue !== previousanimationStyleValue)) {
    //alert("actual changed!");
  } else {
    //alert("no change");
    return;
  }

  previousanimationStyleValue = animationStyleValue;

  if (isWebGLUsed && animationStyleValue === motionBlur) {
    effectBlend.uniforms['mixRatio'].value = 0.7;
  } else if (!isWebGLUsed && animationStyleValue === motionBlur) {
    blendAmount = 0.6;
    //alert('motion blur canvas');
  }

  if (isWebGLUsed && animationStyleValue === paintOver) {
    effectBlend.uniforms['mixRatio'].value = 1;
  } else if (!isWebGLUsed && animationStyleValue === paintOver) {
    blendAmount = 1;
    //alert('paintOver canvas');
  }

  if (isWebGLUsed && animationStyleValue === normal) {
    effectBlend.uniforms['mixRatio'].value = 0;
  } else if (!isWebGLUsed && animationStyleValue === normal) {
    blendAmount = 0;
    //alert('normal canvas');
  }

}






/**
 * extend the Number prototype
 * @param func
 * @param scope [optional]
 */
Number.prototype.times = function(func, scope) {
  var v = this.valueOf();
  for (var i = 0; i < v; i++) {
    func.call(scope || window, i);
  }
};


if (!frenchVersion) {

  var simpleCubeDemo = "" + "" + "// there you go!\n" + "" + "// a simple cube!\n" + "" + "\n" + "" + "background yellow\n" + "" + "rotate 0,time/2000,time/2000\n" + "" + "box";

  var webgltwocubesDemo = "" + "" + "background 155,255,255\n" + "" + "2 times ->\n" + "\t" + "rotate 0, 1, time/2000\n" + "\t" + "box";

  var cubesAndSpikes = "" + "" + "simpleGradient fuchsia,color(100,200,200),yellow\n" + "" + "scale 2.1\n" + "" + "5 times ->\n" + "\t" + "rotate 0,1,time/5000\n" + "\t" + "box 0.1,0.1,0.1\n" + "\t" + "move 0,0.1,0.1\n" + "\t" + "3 times ->\n" + "\t\t" + "rotate 0,1,1\n" + "\t\t" + "box 0.01,0.01,1";

  var webglturbineDemo = "" + "" + "background 155,55,255\n" + "" + "70 times ->\n" + "\t" + "rotate time/100000,1,time/100000\n" + "\t" + "box";

  var webglzfightartDemo = "" + "" + "// Explore the artifacts\n" + "" + "// of your GPU!\n" + "" + "// Go Z-fighting, go!\n" + "" + "scale 5\n" + "" + "rotate\n" + "" + "fill red\n" + "" + "box\n" + "" + "rotate 0.000001\n" + "" + "fill yellow\n" + "" + "box";

  var littleSpiralOfCubes = "" + "" + "background orange\n" + "" + "scale 0.1\n" + "" + "10 times ->\n" + "\t" + "rotate 0,1,time/1000\n" + "\t" + "move 1,1,1\n" + "\t" + "box";

  var tentacleDemo = "" + "" + "background 155,255,155\n" + "" + "scale 0.15\n" + "" + "3 times ->\n" + "\t" + "rotate 0,1,1\n" + "\t" + "10 times ->\n" + "\t\t" + "rotate 0,1,time/1000\n" + "\t\t" + "scale 0.9\n" + "\t\t" + "move 1,1,1\n" + "\t\t" + "box";

  var lampDemo = "" + "" + "animationStyle motionBlur\n" + "" + "simpleGradient red,yellow,color(255,0,255)\n" + "" + "//animationStyle paintOver\n" + "" + "scale 2\n" + "" + "rotate time/4000, time/4000,  time/4000\n" + "" + "90 times ->\n" + "\t" + "rotate time/200000, time/200000,  time/200000\n" + "\t" + "line\n" + "\t" + "move 0.5,0,0\n" + "\t" + "line\n" + "\t" + "move -0.5,0,0\n" + "\t" + "line\n" + "\t" + "line";

  var trillionfeathersDemo = "" + "" + "animationStyle paintOver\n" + "" + "move 2,0,0\n" + "" + "scale 2\n" + "" + "rotate\n" + "" + "20 times ->\n" + "\t" + "rotate\n" + "\t" + "move 0.25,0,0\n" + "\t" + "line\n" + "\t" + "move -0.5,0,0\n" + "\t" + "line";

  var monsterblobDemo = "" + "" + "ballDetail 6\n" + "" + "animationStyle motionBlur\n" + "" + "rotate time/5000\n" + "" + "simpleGradient fuchsia,aqua,yellow\n" + "" + "5 times ->\n" + "\t" + "rotate 0,1,time/5000\n" + "\t" + "move 0.2,0,0\n" + "\t" + "3 times ->\n" + "\t\t" + "rotate 1\n" + "\t\t" + "ball -1";

  var industrialMusicDemo = "" + "" + "bpm 350\n" + "" + "addSound 'alienBeep'  ,'zzxz zzzz zzxz zzzz'\n" + "" + "addSound 'beepC'  ,'zxzz zzzz xzzx xxxz'\n" + "" + "addSound 'beepA'  ,'zzxz zzzz zzxz zzzz'\n" + "" + "addSound 'lowFlash'  ,'zzxz zzzz zzzz zzzz'\n" + "" + "addSound 'beepB'  ,'xzzx zzzz zxzz zxzz'\n" + "" + "addSound 'voltage' ,'xzxz zxzz xzxx xzxx'\n" + "" + "addSound 'tranceKick' ,'zxzx zzzx xzzz zzxx'";

  var trySoundsDemo = "" + "" + "bpm 350\n" + "" + "// leave this one as base\n" + "" + "addSound 'tranceKick' ,'zxzx zzzx xzzz zzxx'\n" + "" + "\n" + "" + "// uncomment the sounds you want to try\n" + "" + "//addSound 'toc','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'highHatClosed','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'highHatOpen','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'toc2','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'toc3','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'toc4','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'snare','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'snare2','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'china','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'crash','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'crash2','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'crash3','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'ride','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'glass','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'glass1','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'glass2','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'glass3','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'thump','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'lowFlash','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'lowFlash2','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'tranceKick2','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'tranceKick','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'wosh','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'voltage','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'beepA','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'beepB','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'beepC','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'beepD','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'beep','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'hello','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'alienBeep','zzxz zzzz zzxz zzzz'";

  var springysquaresDemo = "" + "" + "animationStyle motionBlur\n" + "" + "simpleGradient fuchsia,color(100,200,200),yellow\n" + "" + "scale 0.3\n" + "" + "3 times ->\n" + "\t" + "move 0,0,0.5\n" + "\t" + "5 times ->\n" + "\t\t" + "rotate time/2000\n" + "\t\t" + "move 0.7,0,0\n" + "\t\t" + "rect";

  var diceDemo = "" + "" + "animationStyle motionBlur\n" + "" + "simpleGradient color(255),moccasin,peachpuff\n" + "" + "stroke 255,100,100,255\n" + "" + "fill red,155\n" + "" + "move -0.5,0,0\n" + "" + "scale 0.3\n" + "" + "3 times ->\n" + "\t" + "move 0,0,0.5\n" + "\t" + "1 times ->\n" + "\t\t" + "rotate time/1000\n" + "\t\t" + "move 2,0,0\n" + "\t\t" + "box";

  var webglalmostvoronoiDemo = "" + "" + "scale 10\n" + "" + "2 times ->\n" + "\t" + "rotate 0,1,time/10000\n" + "\t" + "ball -1";

  var webglshardsDemo = "" + "" + "scale 10\n" + "" + "fill 0\n" + "" + "strokeSize 7\n" + "" + "5 times ->\n" + "\t" + "rotate 0,1,time/20000\n" + "\t" + "ball \n" + "\t" + "rotate 0,1,1\n" + "\t" + "ball -1.01";

  var webglredthreadsDemo = "" + "" + "scale 10.5\n" + "" + "background black\n" + "" + "stroke red\n" + "" + "noFill\n" + "" + "strokeSize 7\n" + "" + "5 times ->\n" + "\t" + "rotate time/20000\n" + "\t" + "ball\n" + "\t" + "rotate 0,1,1\n" + "\t" + "ball";

  var webglnuclearOctopusDemo = "" + "" + "simpleGradient black,color(0,0,(time/5)%255),black\n" + "" + "scale 0.2\n" + "" + "move 5,0,0\n" + "" + "animationStyle motionBlur\n" + "" + "//animationStyle paintOver\n" + "" + "stroke 255,0,0,120\n" + "" + "fill time%255,0,0\n" + "" + "pushMatrix\n" + "" + "count = 0\n" + "" + "3 times ->\n" + "\t" + "count++\n" + "\t" + "pushMatrix\n" + "\t" + "rotate count+3+time/1000,2+count + time/1000,4+count\n" + "\t" + "120 times ->\n" + "\t\t" + "scale 0.9\n" + "\t\t" + "move 1,1,0\n" + "\t\t" + "rotate time/100\n" + "\t\t" + "box\n" + "\t" + "popMatrix";
} else {
  // French demos **********************************

  var simpleCubeDemo = "" + "" + "// there you go!\n" + "" + "// a simple cube!\n" + "" + "\n" + "" + "fond jaune\n" + "" + "tourne 0,temps/2000,temps/2000\n" + "" + "boite";

  var webgltwocubesDemo = "" + "" + "fond 155,255,255\n" + "" + "2 fois ->\n" + "\t" + "tourne 0, 1, temps/2000\n" + "\t" + "boite";

  var cubesAndSpikes = "" + "" + "dégradéSimple fuchsia,couleur(100,200,200),jaune\n" + "" + "taille 2.1\n" + "" + "5 fois ->\n" + "\t" + "tourne 0,1,temps/5000\n" + "\t" + "boite 0.1,0.1,0.1\n" + "\t" + "deplace 0,0.1,0.1\n" + "\t" + "3 fois ->\n" + "\t\t" + "tourne 0,1,1\n" + "\t\t" + "boite 0.01,0.01,1";

  var webglturbineDemo = "" + "" + "fond 155,55,255\n" + "" + "70 fois ->\n" + "\t" + "tourne temps/100000,1,temps/100000\n" + "\t" + "boite";

  var webglzfightartDemo = "" + "" + "// Explore the artifacts\n" + "" + "// of your GPU!\n" + "" + "// Go Z-fighting, go!\n" + "" + "taille 5\n" + "" + "tourne\n" + "" + "remplissage rouge\n" + "" + "boite\n" + "" + "tourne 0.000001\n" + "" + "remplissage jaune\n" + "" + "boite";

  var littleSpiralOfCubes = "" + "" + "fond orange\n" + "" + "taille 0.1\n" + "" + "10 fois ->\n" + "\t" + "tourne 0,1,temps/1000\n" + "\t" + "deplace 1,1,1\n" + "\t" + "boite";

  var tentacleDemo = "" + "" + "fond 155,255,155\n" + "" + "taille 0.15\n" + "" + "3 fois ->\n" + "\t" + "tourne 0,1,1\n" + "\t" + "10 fois ->\n" + "\t\t" + "tourne 0,1,temps/1000\n" + "\t\t" + "taille 0.9\n" + "\t\t" + "deplace 1,1,1\n" + "\t\t" + "boite";

  var lampDemo = "" + "" + "styleAnimation flouMouvement\n" + "" + "dégradéSimple rouge,jaune,couleur(255,0,255)\n" + "" + "//styleAnimation peindreAuDessus\n" + "" + "taille 2\n" + "" + "tourne temps/4000, temps/4000,  temps/4000\n" + "" + "90 fois ->\n" + "\t" + "tourne temps/200000, temps/200000,  temps/200000\n" + "\t" + "ligne\n" + "\t" + "deplace 0.5,0,0\n" + "\t" + "ligne\n" + "\t" + "deplace -0.5,0,0\n" + "\t" + "ligne\n" + "\t" + "ligne";

  var trillionfeathersDemo = "" + "" + "styleAnimation peindreAuDessus\n" + "" + "deplace 2,0,0\n" + "" + "taille 2\n" + "" + "tourne\n" + "" + "20 fois ->\n" + "\t" + "tourne\n" + "\t" + "deplace 0.25,0,0\n" + "\t" + "ligne\n" + "\t" + "deplace -0.5,0,0\n" + "\t" + "ligne";

  var monsterblobDemo = "" + "" + "balleDetail 6\n" + "" + "styleAnimation flouMouvement\n" + "" + "tourne temps/5000\n" + "" + "dégradéSimple fuchsia,aqua,jaune\n" + "" + "5 fois ->\n" + "\t" + "tourne 0,1,temps/5000\n" + "\t" + "deplace 0.2,0,0\n" + "\t" + "3 fois ->\n" + "\t\t" + "tourne 1\n" + "\t\t" + "balle -1";

  var industrialMusicDemo = "" + "" + "bpm 350\n" + "" + "ajouteSon 'alienBeep'  ,'zzxz zzzz zzxz zzzz'\n" + "" + "ajouteSon 'beepC'  ,'zxzz zzzz xzzx xxxz'\n" + "" + "ajouteSon 'beepA'  ,'zzxz zzzz zzxz zzzz'\n" + "" + "ajouteSon 'lowFlash'  ,'zzxz zzzz zzzz zzzz'\n" + "" + "ajouteSon 'beepB'  ,'xzzx zzzz zxzz zxzz'\n" + "" + "ajouteSon 'voltage' ,'xzxz zxzz xzxx xzxx'\n" + "" + "ajouteSon 'tranceKick' ,'zxzx zzzx xzzz zzxx'";

  var trySoundsDemo = "" + "" + "bpm 350\n" + "" + "// leave this one as base\n" + "" + "ajouteSon 'tranceKick' ,'zxzx zzzx xzzz zzxx'\n" + "" + "\n" + "" + "// uncomment the sounds you want to try\n" + "" + "//ajouteSon 'toc','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'highHatClosed','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'highHatOpen','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'toc2','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'toc3','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'toc4','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'snare','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'snare2','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'china','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'crash','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'crash2','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'crash3','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'ride','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'glass','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'glass1','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'glass2','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'glass3','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'thump','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'lowFlash','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'lowFlash2','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'tranceKick2','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'tranceKick','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'wosh','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'voltage','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'beepA','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'beepB','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'beepC','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'beepD','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'beep','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'hello','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'alienBeep','zzxz zzzz zzxz zzzz'";

  var springysquaresDemo = "" + "" + "styleAnimation flouMouvement\n" + "" + "dégradéSimple fuchsia,couleur(100,200,200),jaune\n" + "" + "taille 0.3\n" + "" + "3 fois ->\n" + "\t" + "deplace 0,0,0.5\n" + "\t" + "5 fois ->\n" + "\t\t" + "tourne temps/2000\n" + "\t\t" + "deplace 0.7,0,0\n" + "\t\t" + "rect";

  var diceDemo = "" + "" + "styleAnimation flouMouvement\n" + "" + "dégradéSimple couleur(255),moccasin,peche\n" + "" + "trait 255,100,100,255\n" + "" + "remplissage rouge,155\n" + "" + "deplace -0.5,0,0\n" + "" + "taille 0.3\n" + "" + "3 fois ->\n" + "\t" + "deplace 0,0,0.5\n" + "\t" + "1 fois ->\n" + "\t\t" + "tourne temps/1000\n" + "\t\t" + "deplace 2,0,0\n" + "\t\t" + "boite";

  var webglalmostvoronoiDemo = "" + "" + "taille 10\n" + "" + "2 fois ->\n" + "\t" + "tourne 0,1,temps/10000\n" + "\t" + "balle -1";

  var webglshardsDemo = "" + "" + "taille 10\n" + "" + "remplissage 0\n" + "" + "traitSize 7\n" + "" + "5 fois ->\n" + "\t" + "tourne 0,1,temps/20000\n" + "\t" + "balle \n" + "\t" + "tourne 0,1,1\n" + "\t" + "balle -1.01";

  var webglredthreadsDemo = "" + "" + "taille 10.5\n" + "" + "fond noir\n" + "" + "trait rouge\n" + "" + "sansRemplissage\n" + "" + "traitSize 7\n" + "" + "5 fois ->\n" + "\t" + "tourne temps/20000\n" + "\t" + "balle\n" + "\t" + "tourne 0,1,1\n" + "\t" + "balle";

  var webglnuclearOctopusDemo = "" + "" + "dégradéSimple noir,couleur(0,0,(temps/5)%255),noir\n" + "" + "taille 0.2\n" + "" + "deplace 5,0,0\n" + "" + "styleAnimation flouMouvement\n" + "" + "//styleAnimation peindreAuDessus\n" + "" + "trait 255,0,0,120\n" + "" + "remplissage temps%255,0,0\n" + "" + "sauveMatrice\n" + "" + "count = 0\n" + "" + "3 fois ->\n" + "\t" + "count++\n" + "\t" + "sauveMatrice\n" + "\t" + "tourne count+3+temps/1000,2+count + temps/1000,4+count\n" + "\t" + "120 fois ->\n" + "\t\t" + "taille 0.9\n" + "\t\t" + "deplace 1,1,0\n" + "\t\t" + "tourne temps/100\n" + "\t\t" + "boite\n" + "\t" + "restaureMatrice";

  //*********************************************
}

if (!frenchVersion) {

  var introTutorial = "" + "" + "// Lines beginning with two\n" + "" + "// slashes (like these) are just comments.\n" + "" + '// Everything else is run\n' + "" + '// about 30 to 60 times per second\n' + "" + '// in order to create an animation.\n' + "" + "\n" + "" + "// Click the link below to start the tutorial.\n" + "" + "// next-tutorial:hello_world";

  var helloworldTutorial = "" + "" + "// type these three letters\n" + "" + "// in one of these empty lines below:\n" + "" + '// "b" and "o" and "x"\n' + "" + "\n" + "" + "\n" + "" + "\n" + "" + "// (you should then see a box facing you)\n" + "" + "// click below for the next tutorial\n" + "" + "// next-tutorial:some_notes";

  var somenotesTutorial = "" + "" + "// If this makes sense to you:\n" + "" + "// the syntax is similar to Coffeescript\n" + "" + '// and the commands are almost\n' + "" + '// like Processing.\n' + "" + "\n" + "" + "// If this doesn't make sense to you\n" + "" + "// don't worry.\n" + "" + "// next-tutorial:rotate";

  var rotateTutorial = "" + "" + "// now that we have a box\n" + "" + "// let's rotate it:\n" + "" + '// type "rotate 1" in the\n' + "" + '// line before the "box"\n' + "" + "\n" + "" + "\n" + "" + "box\n" + "" + "\n" + "" + "// click for the next tutorial:\n" + "" + "// next-tutorial:frame";

  var frameTutorial = "" + "" + "// make the box spin\n" + "" + '// by replacing "1" with "frame"\n' + "" + "\n" + "" + "rotate 1\n" + "" + "box\n" + "" + "\n" + "" + '// "frame" contains a number\n' + "" + "// always incrementing as\n" + "" + "// the screen is re-drawn.\n" + "" + '// (use "frame/100" to slow it down)\n' + "" + "// next-tutorial:time";

  var timeTutorial = "" + "" + '// "frame/100" has one problem:\n' + "" + '// faster computers will make\n' + "" + '// the cube spin too fast.\n' + "" + '// Replace it with "time/2000".\n' + "" + "\n" + "" + "rotate frame/100\n" + "" + "box\n" + "" + "\n" + "" + '// "time" counts the\n' + "" + "// number of milliseconds since\n" + "" + "// the program started, so it's\n" + "" + "// independent of how fast\n" + "" + "// the computer is at drawing.\n" + "" + "// next-tutorial:move";

  var moveTutorial = "" + "" + "// you can move any object\n" + "" + '// by using "move"\n' + "" + "\n" + "" + "box\n" + "" + "move 1,1,0\n" + "" + "box\n" + "" + "\n" + "" + '// try to use a rotate before \n' + "" + "// the first box to see how the\n" + "" + "// scene changes.\n" + "" + "// next-tutorial:scale";

  var scaleTutorial = "" + "" + "// you can make an object bigger\n" + "" + '// or smaller by using "scale"\n' + "" + "\n" + "" + "rotate 3\n" + "" + "box\n" + "" + "move 1\n" + "" + "scale 2\n" + "" + "box\n" + "" + "\n" + "" + '// try to use a rotate before \n' + "" + "// the first box to see how the\n" + "" + "// scene changes.\n" + "" + "// next-tutorial:times";

  var timesTutorial = "" + "" + '// "times" (not to be confused with\n' + "" + '// "time"!) can be used to\n' + "" + '// repeat operations like so:\n' + "" + "\n" + "" + "rotate 1\n" + "" + "3 times ->\n" + "\t" + "move 0.2,0.2,0.2\n" + "\t" + "box\n" + "" + "\n" + "" + '// note how the tabs indicate \n' + "" + "// exactly the block of code\n" + "" + "// to be repeated.\n" + "" + "// next-tutorial:fill";

  var fillTutorial = "" + "" + '// "fill" changes the\n' + "" + '// color of all the faces:\n' + "" + "\n" + "" + "fill 255,255,0\n" + "" + "box\n" + "" + "\n" + "" + '// the three numbers indicate \n' + "" + "// red green and blue values.\n" + "" + "// You can also use color names such as indigo\n" + "" + "// Try replacing the numbers with\n" + "" + '// "angleColor"\n' + "" + "// next-tutorial:stroke";

  var strokeTutorial = "" + "" + '// "stroke" changes all the\n' + "" + '// edges:\n' + "" + "\n" + "" + "rotate 1\n" + "" + "strokeSize 5\n" + "" + "stroke 255,255,255\n" + "" + "box\n" + "" + "\n" + "" + '// the three numbers are RGB\n' + "" + "// but you can also use the color names\n" + "" + '// or the special color "angleColor"\n' + "" + '// Also you can use "strokeSize"\n' + "" + '// to specify the thickness.\n' + "" + "// next-tutorial:color_names";

  var colornamesTutorial = "" + "" + '// you can call colors by name\n' + "" + '// try to un-comment one line:\n' + "" + "\n" + "" + "//fill greenyellow\n" + "" + "//fill indigo\n" + "" + "//fill lemonchiffon // whaaaat?\n" + "" + "rotate 1\n" + "" + "box\n" + "" + "\n" + "" + '// more color names here:\n' + "" + '// http://html-color-codes.info/color-names/\n' + "" + '// (just use them in lower case)\n' + "" + "// next-tutorial:lights";


  var lightsTutorial = "" + "" + '// "ambientLight" creates an\n' + "" + '// ambient light so things have\n' + "" + '// some sort of shading:\n' + "" + "\n" + "" + "ambientLight 0,255,255\n" + "" + "rotate time/1000\n" + "" + "box\n" + "" + "\n" + "" + '// you can turn that light on and \n' + "" + "// off while you build the scene\n" + "" + '// by using "lights" and "noLights"\n' + "" + "// next-tutorial:background";

  var backgroundTutorial = "" + "" + '// "background" creates a\n' + "" + '// solid background:\n' + "" + "\n" + "" + "background 0,0,255\n" + "" + "rotate time/1000\n" + "" + "box\n" + "" + "\n" + "" + "// next-tutorial:gradient";

  var gradientTutorial = "" + "" + '// even nicer, you can paint a\n' + "" + '// background gradient:\n' + "" + "\n" + "" + "simpleGradient color(190,10,10),color(30,90,100),color(0)\n" + "" + "rotate time/1000\n" + "" + "box\n" + "" + "\n" + "" + "// next-tutorial:line";

  var lineTutorial = "" + "" + '// draw lines like this:\n' + "" + "\n" + "" + "20 times ->\n" + "\t" + "rotate time/9000\n" + "\t" + "line\n" + "" + "\n" + "" + "// next-tutorial:ball";

  var ballTutorial = "" + "" + '// draw balls like this:\n' + "" + "\n" + "" + "ballDetail 10\n" + "" + "3 times ->\n" + "\t" + "move 0.2,0.2,0.2\n" + "\t" + "ball\n" + "" + "\n" + "" + '// ("ballDetail" is optional)\n' + "" + "// next-tutorial:pushpopMatrix";

  var pushpopMatrixTutorial = "" + "" + '// pushMatrix creates a bookmark of\n' + "" + '// the position, which you can\n' + "" + '// return to later by using popMatrix.\n' + "" + '// You can reset using "resetMatrix".\n' + "" + "\n" + "" + "rotate time/1000\n" + "" + 'pushMatrix // bookmark the position after the rotation\n' + "" + "line\n" + "" + "move 0.5,0,0\n" + "" + "line\n" + "" + "popMatrix // go back to the bookmarked position\n" + "" + "move -0.5,0,0\n" + "" + "line\n" + "" + "resetMatrix // resets the position\n" + "" + "line // not affected by initial rotation\n" + "" + "// next-tutorial:animation_style";

  var animationstyleTutorial = "" + "" + '// try uncommenting either line\n' + "" + '// with the animationStyle\n' + "" + "\n" + "" + "background 255\n" + "" + "//animationStyle motionBlur\n" + "" + "//animationStyle paintOver\n" + "" + "rotate frame/10\n" + "" + "box\n" + "" + "\n" + "" + "// next-tutorial:do_once";

  var doonceTutorial = "" + "" + '// delete either check mark below\n' + "" + "\n" + "" + "rotate time/1000\n" + "" + "✓doOnce ->\n" + "\t" + "background 255\n" + "\t" + "fill 255,0,0\n" + "" + "✓doOnce -> ball\n" + "" + "box\n" + "" + "\n" + "" + '// ...the line or block of code\n' + "" + '// are ran one time only, after that the\n' + "" + '// check marks immediately re-appear\n' + "" + '// P.S. keep hitting the delete button\n' + "" + '// on that first check mark for seizures.\n' + "" + "// next-tutorial:autocode";

  var autocodeTutorial = "" + "" + '// the Autocode button invents random\n' + "" + '// variations for you.\n' + "" + '\n' + "" + '// You can interrupt the Autocoder at\n' + "" + '// any time by pressing the button again,\n' + "" + '// or you can press CTRL-Z\n' + "" + '// (or CMD-Z on Macs) to undo (or re-do) some of\n' + "" + '// the steps even WHILE the autocoder is running,\n' + "" + '// if you see that things got\n' + "" + '// boring down a particular path of changes.';
} else {

  // ***************************** French tutorials
  var introTutorial = "" + "" + "// Les lignes qui commencent avec deux slashes\n" + "" + "// (comme celle-ci) sont des commentaires.\n" + "" + '// Tout le reste est lancé\n' + "" + '// entre 30 et 60 fois par seconde\n' + "" + '// pour créer une animation\n' + "" + "\n" + "" + "// Cliquez sur le lien ci-dessous pour démarrer le tutorial.\n" + "" + "// next-tutorial:hello_world";

  var helloworldTutorial = "" + "" + "// Tapez ces cinq lettres\n" + "" + "// sur une des lignes vides\n" + "" + '// b, o, i, t, e\n' + "" + "\n" + "" + "\n" + "" + "\n" + "" + "// (vous devriez voir une belle boite apparaître)\n" + "" + "// cliquez pour le prochain tutorial :\n" + "" + "// next-tutorial:some_notes";

  var somenotesTutorial = "" + "" + "// Au cas où cela vous dit quelque chose :\n" + "" + "// la syntaxe est similaire à Coffeescript\n" + "" + '// et les commandes sont presque\n' + "" + '// comme Processing.\n' + "" + "\n" + "" + "// Si cela ne veut rien dire pour vous\n" + "" + "// pas de soucis.\n" + "" + "// next-tutorial:rotate";

  var rotateTutorial = "" + "" + "// Maintenant nous avons une boite\n" + "" + "// faisons la tourner:\n" + "" + '// tapez "tourne 1" sur la ligne\n' + "" + '// au dessus de "boite"\n' + "" + "\n" + "" + "\n" + "" + "boite\n" + "" + "\n" + "" + "// cliquez pour le prochain tutorial :\n" + "" + "// next-tutorial:frame";

  var frameTutorial = "" + "" + "// faites tourner la boite\n" + "" + '// en remplaçant "1" par "image"\n' + "" + "\n" + "" + "tourne 1\n" + "" + "boite\n" + "" + "\n" + "" + '// "image" contient un nombre\n' + "" + "// qui s’incrémente au fur et à mesure\n" + "" + "// que l’écran est re-dessiné.\n" + "" + '// (utilisez "image/100" pour la ralentir)\n' + "" + "// next-tutorial:time";

  var timeTutorial = "" + "" + '// "image/100" a un problème :\n' + "" + '// les ordinateurs rapides vont faire\n' + "" + '// tourner le cube trop vite.\n' + "" + '// Remplacez le par "temps/2000".\n' + "" + "\n" + "" + "tourne image/100\n" + "" + "boite\n" + "" + "\n" + "" + '// "temps" compte le nombre de millisecondes\n' + "" + "// depuis que le programme  a démarré,\n" + "" + "// il est donc indépendent de la vitesse\n" + "" + "// à laquelle l’ordinateur dessine les images.\n" + "" + "// next-tutorial:move";

  var moveTutorial = "" + "" + "// vous pouvez déplacer n’importe quel objet\n" + "" + '// en utilisant "deplace"\n' + "" + "\n" + "" + "boite\n" + "" + "deplace 1,1,0\n" + "" + "boite\n" + "" + "\n" + "" + '// essayez d’utiliser tourne\n' + "" + "// avant la première boite pour voir\n" + "" + "// comment la scène change.\n" + "" + "// next-tutorial:scale";

  var scaleTutorial = "" + "" + "// vous pouvez changer la taille des objets\n" + "" + '// en utilisant "taille"\n' + "" + "\n" + "" + "tourne 3\n" + "" + "boite\n" + "" + "deplace 1\n" + "" + "taille 2\n" + "" + "boite\n" + "" + "\n" + "" + '// essayez d’utiliser tourne\n' + "" + "// avant la première boite pour voir\n" + "" + "// comment la scène change..\n" + "" + "// next-tutorial:times";

  var timesTutorial = "" + "" + '// "fois" peut-être utilisé\n' + "" + '// pour répéter des opérations :\n' + "" + "\n" + "" + "tourne 1\n" + "" + "3 fois ->\n" + "\t" + "deplace 0.2,0.2,0.2\n" + "\t" + "boite\n" + "" + "\n" + "" + '// notez comme les tabulations indiquent \n' + "" + "// exactement le bloc de code\n" + "" + "// qui doit être répété.\n" + "" + "// next-tutorial:fill";

  var fillTutorial = "" + "" + '// "remplissage" défini la\n' + "" + '// couleur de toutes les faces :\n' + "" + "\n" + "" + "remplissage 255,255,0\n" + "" + "boite\n" + "" + "\n" + "" + '// les trois nombres indiquent\n' + "" + "// les valeurs de rouge, vert et bleu.\n" + "" + "// Vous pouvez aussi utiliser\n" + "" + "// des noms de couleur comme indigo\n" + "" + "// Essayez de remplacer les nombres avec\n" + "" + '// "couleurAngle"\n' + "" + "// next-tutorial:stroke";

  var strokeTutorial = "" + "" + '// "trait" change la couleur\n' + "" + '// des arrêtes :\n' + "" + "\n" + "" + "tourne 1\n" + "" + "tailleTrait 5\n" + "" + "trait 255,255,255\n" + "" + "boite\n" + "" + "\n" + "" + '// les trois nombres sont les valeurs RVB\n' + "" + "// mais vous pouvez utiliser les noms des couleurs,\n" + "" + '// ou la couleur spéciale  "couleurAngle"\n' + "" + '// Vous pouvez aussi utiliser "tailleTrait"\n' + "" + '// pour préciser l’épaisseur.\n' + "" + "// next-tutorial:color_names";

  var colornamesTutorial = "" + "" + '// vous pouvez indiquer les couleurs par nom\n' + "" + '// essayer de dé-commenter une ligne :\n' + "" + "\n" + "" + "//remplissage rouge\n" + "" + "//remplissage vert\n" + "" + "//remplissage pêche\n" + "" + "tourne 1\n" + "" + "boite\n" + "" + "\n" + "" + '// plus de noms de couleurs ici :\n' + "" + '// http://html-color-codes.info/color-names/\n' + "" + '// (utilisez en minuscule, pas de majuscules)\n' + "" + "// next-tutorial:lights";


  var lightsTutorial = "" + "" + '// "eclairageAmbiant" créé un\n' + "" + '// éclairage ambiant de sorte que les objets\n' + "" + '// ont une sorte de d’ombrage:\n' + "" + "\n" + "" + "eclairageAmbiant 0,255,255\n" + "" + "tourne temps/1000\n" + "" + "boite\n" + "" + "\n" + "" + '// vous pouvez éteindre ou allumer cet éclairage\n' + "" + "// pendant que vous construisez la scène" + "" + '// en utilisant "eclairage" et "sansEclairage"\n' + "" + "// next-tutorial:background";

  var backgroundTutorial = "" + "" + '// "fond" créé un\n' + "" + '// fond de couleur :\n' + "" + "\n" + "" + "fond 0,0,255\n" + "" + "tourne temps/1000\n" + "" + "boite\n" + "" + "\n" + "" + "// next-tutorial:gradient";

  var gradientTutorial = "" + "" + '// encore plus sympa, vous pouvez\n' + "" + '// créér un fond en dégradé:\n' + "" + "\n" + "" + "degradeSimple couleur(190,10,10),couleur(30,90,100),couleur(0)\n" + "" + "tourne temps/1000\n" + "" + "boite\n" + "" + "\n" + "" + "// next-tutorial:line";

  var lineTutorial = "" + "" + '// dessinez des lignes comme ceci :\n' + "" + "\n" + "" + "20 fois ->\n" + "\t" + "tourne temps/9000\n" + "\t" + "ligne\n" + "" + "\n" + "" + "// next-tutorial:ball";

  var ballTutorial = "" + "" + '// dessinez des balles comme ceci :\n' + "" + "\n" + "" + "balleDetail 10\n" + "" + "3 fois ->\n" + "\t" + "deplace 0.2,0.2,0.2\n" + "\t" + "balle\n" + "" + "\n" + "" + '// ("balleDetail" est optionnel)\n' + "" + "// next-tutorial:pushpopMatrix";

  var pushpopMatrixTutorial = "" + "" + '// sauveMatrice mémorise\n' + "" + '// la position, et vous pouvez\n' + "" + '// y revenir plus tard avec restaureMatrice.\n' + "" + '// Vous pouvez revenir à zéro avec "effaceMatrice".\n' + "" + "\n" + "" + "tourne temps/1000\n" + "" + 'sauveMatrice // mémorise la position après la rotation\n' + "" + "ligne\n" + "" + "deplace 0.5,0,0\n" + "" + "ligne\n" + "" + "restaureMatrice // revient à la position mémorisée\n" + "" + "deplace -0.5,0,0\n" + "" + "ligne\n" + "" + "effaceMatrice // remets la position à zéro\n" + "" + "ligne // cette ligne n’est donc pas affecté par la rotation\n" + "" + "// next-tutorial:animation_style";

  var animationstyleTutorial = "" + "" + '// essayez de dé-commenter l’une ou l’autre\n' + "" + '// des deux lignes  avec styleAnimation\n' + "" + "\n" + "" + "fond 255\n" + "" + "//styleAnimation flouMouvement\n" + "" + "//styleAnimation peindreAudessus\n" + "" + "tourne image/10\n" + "" + "boite\n" + "" + "\n" + "" + "// next-tutorial:do_once";

  var doonceTutorial = "" + "" + '// effacez l’une ou l’autre des coches\n' + "" + "\n" + "" + "tourne temps/1000\n" + "" + "✓uneFois ->\n" + "\t" + "fond 255\n" + "\t" + "remplissage 255,0,0\n" + "" + "✓uneFois -> balle\n" + "" + "boite\n" + "" + "\n" + "" + '// …la ligne ou le bloc de code\n' + "" + '// n’est exécuté qu’une seule fois, et après cela\n' + "" + '// la coche réapparait immédiattement\n' + "" + '// P.S. continuez de supprimer la première coche\n' + "" + '// en continu pour provoquer un évanouissement :-)\n' + "" + "// next-tutorial:autocode";

  var autocodeTutorial = "" + "" + '// le bouton Autocode invente pour vous\n' + "" + '// des variations aléatoires du code.\n' + "" + '\n' + "" + '// vous pouvez arrêter Autocode\n' + "" + '// à tout moment en ré-appuyant sur le bouton\n' + "" + '// ou vous pouvez faire CTRL-Z\n' + "" + '// (CMD-Z sur Mac) pour annuler (or rétablir) certainesn' + "" + '// des étapes y compris PENDANT que Autocode est actif\n' + "" + '// si par exemple vous trouvez que les choses\n' + "" + '// deviennent ennuyeuse dans la direction prise par Autocode.';

}
var autocodeOn = false;
var blinkingAutocoderTimeout;
var blinkingAutocoderStatus = false;
var dimcodeOn = false;


function blinkAutocodeIndicator() {
  blinkingAutocoderStatus = !blinkingAutocoderStatus;
  if (blinkingAutocoderStatus) {
    $("#autocodeIndicatorContainer").css("background-color", '');
  } else {
    $("#autocodeIndicatorContainer").css("background-color", '#FF0000');
    mutate();
  }
}

function toggleAutocode() {
  autocodeOn = !autocodeOn;

  if (!autocodeOn) {
    if (frenchVersion) {
      $("#autocodeIndicator").html("Autocode: inactif");
    } else {
      $("#autocodeIndicator").html("Autocode: off");
    }
    clearInterval(blinkingAutocoderTimeout);
    $("#autocodeIndicatorContainer").css("background-color", '');
  } else {
    if (frenchVersion) {
      $("#autocodeIndicator").html("Autocode: actif");
    } else {
      $("#autocodeIndicator").html("Autocode: on");
    }
    blinkingAutocoderTimeout = setInterval('blinkAutocodeIndicator();', 500);
    $("#autocodeIndicatorContainer").css("background-color", '#FF0000');
    if (editor.getValue() === '' || (
    (window.location.hash.indexOf("bookmark") !== -1) && (window.location.hash.indexOf("autocodeTutorial") !== -1))

    ) loadDemoOrTutorial('cubesAndSpikes');
  }
}


function mutate() {
  var whichMutation = Math.floor(Math.random() * 5);
  if (whichMutation === 0) replaceAFloat();
  else if (whichMutation == 1) replaceAnInteger();
  else if (whichMutation == 2) replaceABoxWithABall();
  else if (whichMutation == 3) replaceABallWithABox();
  //else if (whichMutation == 4)
  //replacetimeWithAConstant();
}

function replaceAFloat() {
  var editorContent = editor.getValue();
  var rePattern = /([-+]?[0-9]*\.[0-9]+)/gi;

  var allMatches = editorContent.match(rePattern);
  if (allMatches === null) numberOfResults = 0;
  else numberOfResults = allMatches.length;
  whichOneToChange = Math.floor(Math.random() * numberOfResults) + 1;

  var countWhichOneToSwap = 0;
  editorContent = editorContent.replace(rePattern, function(match, text, urlId) {
    countWhichOneToSwap++;
    if (countWhichOneToSwap === whichOneToChange) {
      var whichOp = Math.floor(Math.random() * 12);
      if (whichOp === 0) return parseFloat(match) * 2;
      else if (whichOp == 1) return parseFloat(match) / 2;
      else if (whichOp == 2) return parseFloat(match) + 1;
      else if (whichOp == 3) return parseFloat(match) - 1;
      else if (whichOp == 4) return parseFloat(match) * 5;
      else if (whichOp == 5) return parseFloat(match) / 5;
      else if (whichOp == 6) return parseFloat(match) + 0.1;
      else if (whichOp == 7) return parseFloat(match) - 0.1;
      else if (whichOp == 8) return parseFloat(match) + 0.5;
      else if (whichOp == 9) return parseFloat(match) - 0.5;
      else if (whichOp == 10) return Math.floor(parseFloat(match));
      else if (whichOp == 11) if (!frenchVersion) {
        return 'time/1000';
      } else {
        return 'temps/1000';
      }
    }
    return match;
  });
  editor.setValue(editorContent);
}

function replaceABoxWithABall() {
  var editorContent = editor.getValue();
  var rePattern;
  if (!frenchVersion) {
    rePattern = /(box)/gi;
  } else {
    rePattern = /(boite)/gi;
  }

  var allMatches = editorContent.match(rePattern);
  if (allMatches === null) numberOfResults = 0;
  else numberOfResults = allMatches.length;
  whichOneToChange = Math.floor(Math.random() * numberOfResults) + 1;

  var countWhichOneToSwap = 0;
  editorContent = editorContent.replace(rePattern, function(match, text, urlId) {
    countWhichOneToSwap++;
    if (countWhichOneToSwap === whichOneToChange) {
      if (!frenchVersion) {
        return "ball";
      } else {
        return "balle";
      }
    }
    return match;
  });
  editor.setValue(editorContent);
}

function replaceTimeWithAConstant() {
  var editorContent = editor.getValue();
  var rePattern;
  if (!frenchVersion) {
    rePattern = /(time)/gi;
  } else {
    rePattern = /(temps)/gi;
  }

  var allMatches = editorContent.match(rePattern);
  if (allMatches === null) numberOfResults = 0;
  else numberOfResults = allMatches.length;
  whichOneToChange = Math.floor(Math.random() * numberOfResults) + 1;

  var countWhichOneToSwap = 0;
  editorContent = editorContent.replace(rePattern, function(match, text, urlId) {
    countWhichOneToSwap++;
    if (countWhichOneToSwap === whichOneToChange) {
      return '' + Math.floor(Math.random() * 20) + 1;
    }
    return match;
  });
  editor.setValue(editorContent);
}

function replaceABallWithABox() {
  var editorContent = editor.getValue();
  var rePattern;
  if (!frenchVersion) {
    rePattern = /(ball)/gi;
  } else {
    rePattern = /(balle)/gi;
  }

  var allMatches = editorContent.match(rePattern);
  if (allMatches === null) numberOfResults = 0;
  else numberOfResults = allMatches.length;
  whichOneToChange = Math.floor(Math.random() * numberOfResults) + 1;

  var countWhichOneToSwap = 0;
  editorContent = editorContent.replace(rePattern, function(match, text, urlId) {
    countWhichOneToSwap++;
    if (countWhichOneToSwap === whichOneToChange) {
      if (!frenchVersion) {
        return "box";
      } else {
        return "boite";
      }
    }
    return match;
  });
  editor.setValue(editorContent);
}

function replaceAnInteger() {
  var editorContent = editor.getValue();
  var rePattern = /([-+]?[0-9]+)/gi;

  var allMatches = editorContent.match(rePattern);
  if (allMatches === null) numberOfResults = 0;
  else numberOfResults = allMatches.length;
  whichOneToChange = Math.floor(Math.random() * numberOfResults) + 1;

  var countWhichOneToSwap = 0;
  editorContent = editorContent.replace(rePattern, function(match, text, urlId) {
    countWhichOneToSwap++;
    if (countWhichOneToSwap === whichOneToChange) {
      var whichOp = Math.floor(Math.random() * 7);
      if (whichOp === 0) return Math.floor(parseFloat(match) * 2);
      else if (whichOp == 1) return Math.floor(parseFloat(match) / 2);
      else if (whichOp == 2) return Math.floor(parseFloat(match) + 1);
      else if (whichOp == 3) return Math.floor(parseFloat(match) - 1);
      else if (whichOp == 4) return Math.floor(parseFloat(match) * 5);
      else if (whichOp == 5) return Math.floor(parseFloat(match) / 5);
      else if (whichOp == 6) if (!frenchVersion) {
        return 'Math.floor(1+time/1000)';
      } else {
        return 'Math.floor(1+temps/1000)';
      }
    }
    return match;
  });
  editor.setValue(editorContent);

}

function triggerReset() {
  pickRandomDefaultGradient();
  if (autocodeOn) toggleAutocode();
  editor.setValue('');
  $("#resetButtonContainer").css("background-color", '#FF0000');
  setTimeout('$("#resetButtonContainer").css("background-color","");', 200);
}

function loadDemoOrTutorial(whichDemo) {

  if ((!Detector.webgl || forceCanvasRenderer) && !userWarnedAboutWebglExamples && whichDemo.indexOf('webgl') === 0) {
    userWarnedAboutWebglExamples = true;
    $('#exampleNeedsWebgl').modal();
    $('#simplemodal-container').height(200);
  }


  // set the demo as a hash state
  // so that ideally people can link directly to
  // a specific demo they like.
  // (in the document.ready function we check for
  // this hash value and load the correct demo)
  window.location.hash = 'bookmark=' + whichDemo;

  if (fakeText) shrinkFakeText();
  undimEditor();

  doTheSpinThingy = false;

  var prependMessage = "";
  if ((!Detector.webgl || forceCanvasRenderer) && whichDemo.indexOf('webgl') === 0) {
    prependMessage = "" + "// this drawing makes much more sense\n" + "// in a WebGL-enabled browser\n" + "\n";
  }

  switch (whichDemo) {
  case 'simpleCubeDemo':
    editor.setValue(prependMessage + simpleCubeDemo);
    break;
  case 'webgltwocubesDemo':
    editor.setValue(prependMessage + webgltwocubesDemo);
    break;
  case 'cubesAndSpikes':
    editor.setValue(prependMessage + cubesAndSpikes);
    break;
  case 'webglturbineDemo':
    editor.setValue(prependMessage + webglturbineDemo);
    break;
  case 'webglzfightartDemo':
    editor.setValue(prependMessage + webglzfightartDemo);
    break;
  case 'littleSpiralOfCubes':
    editor.setValue(prependMessage + littleSpiralOfCubes);
    break;
  case 'tentacleDemo':
    editor.setValue(prependMessage + tentacleDemo);
    break;
  case 'lampDemo':
    editor.setValue(prependMessage + lampDemo);
    break;
  case 'trillionfeathersDemo':
    editor.setValue(prependMessage + trillionfeathersDemo);
    break;
  case 'monsterblobDemo':
    editor.setValue(prependMessage + monsterblobDemo);
    break;
  case 'industrialMusicDemo':
    editor.setValue(prependMessage + industrialMusicDemo);
    break;
  case 'trySoundsDemo':
    editor.setValue(prependMessage + trySoundsDemo);
    break;
  case 'springysquaresDemo':
    editor.setValue(prependMessage + springysquaresDemo);
    break;
  case 'diceDemo':
    editor.setValue(prependMessage + diceDemo);
    break;
  case 'webglalmostvoronoiDemo':
    editor.setValue(prependMessage + webglalmostvoronoiDemo);
    break;
  case 'webglshardsDemo':
    editor.setValue(prependMessage + webglshardsDemo);
    break;
  case 'webglredthreadsDemo':
    editor.setValue(prependMessage + webglredthreadsDemo);
    break;
  case 'webglnuclearOctopusDemo':
    editor.setValue(prependMessage + webglnuclearOctopusDemo);
    break;
  case 'introTutorial':
    editor.setValue(prependMessage + introTutorial);
    break;
  case 'helloworldTutorial':
    editor.setValue(prependMessage + helloworldTutorial);
    break;
  case 'somenotesTutorial':
    editor.setValue(prependMessage + somenotesTutorial);
    break;
  case 'rotateTutorial':
    editor.setValue(prependMessage + rotateTutorial);
    break;
  case 'frameTutorial':
    editor.setValue(prependMessage + frameTutorial);
    break;
  case 'timeTutorial':
    editor.setValue(prependMessage + timeTutorial);
    break;
  case 'moveTutorial':
    editor.setValue(prependMessage + moveTutorial);
    break;
  case 'scaleTutorial':
    editor.setValue(prependMessage + scaleTutorial);
    break;
  case 'timesTutorial':
    editor.setValue(prependMessage + timesTutorial);
    break;
  case 'fillTutorial':
    editor.setValue(prependMessage + fillTutorial);
    break;
  case 'strokeTutorial':
    editor.setValue(prependMessage + strokeTutorial);
    break;
  case 'colornamesTutorial':
    editor.setValue(prependMessage + colornamesTutorial);
    break;
  case 'lightsTutorial':
    editor.setValue(prependMessage + lightsTutorial);
    break;
  case 'backgroundTutorial':
    editor.setValue(prependMessage + backgroundTutorial);
    break;
  case 'gradientTutorial':
    editor.setValue(prependMessage + gradientTutorial);
    break;
  case 'lineTutorial':
    editor.setValue(prependMessage + lineTutorial);
    break;
  case 'ballTutorial':
    editor.setValue(prependMessage + ballTutorial);
    break;
  case 'pushpopMatrixTutorial':
    editor.setValue(prependMessage + pushpopMatrixTutorial);
    break;
  case 'animationstyleTutorial':
    editor.setValue(prependMessage + animationstyleTutorial);
    break;
  case 'doonceTutorial':
    editor.setValue(prependMessage + doonceTutorial);
    break;
  case 'autocodeTutorial':
    editor.setValue(prependMessage + autocodeTutorial);
    break;

    // bring the cursor to the top
  editor.setCursor(0, 0);
  }

  // setting the value of the editor triggers the
  // codeMirror onChange callback, and that runs
  // the demo.
}


var changesHappened = false;

var cursorActivity = true;

function selectTheme(node) {
  var theme = node.options[node.selectedIndex].innerHTML;
  editor.setOption("theme", theme);
}

// resizing the text area is necessary otherwise
// as the user types to the end of it, instead of just scrolling
// the content leaving all the other parts of the page where
// they are, it expands and it pushes down
// the view of the page, meaning that the canvas goes up and
// the menu disappears
// so we have to resize it at launch and also every time the window
// is resized.

function adjustCodeMirrorHeight() {
  //alert("code height:" + $('#code').height());
  //alert("window height:" + window.innerHeight);
  //alert("code height:" + $('.CodeMirror-scroll').css('height'));
  //alert("menu height:" + $('#theMenu').height());
  $('.CodeMirror-scroll').css('height', window.innerHeight - $('#theMenu').height());
}

var fakeCursorInterval;

function fakeCursorBlinking() {
  $("#fakeStartingBlinkingCursor").animate({
    opacity: 0.2
  }, "fast", "swing").animate({
    opacity: 1
  }, "fast", "swing");
}

///////////// START OF MOUSEWHEEL HANDLER CODE
// I couldn't quote get the exact Javascript plugin below to
// work in its original form, so I only took the
// "calculation" routine.


function wheel(event) {

  /*! Copyright (c) 2011 Brandon Aaron (http://brandonaaron.net)
   * Licensed under the MIT License (LICENSE.txt).
   *
   * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
   * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
   * Thanks to: Seamus Leahy for adding deltaX and deltaY
   *
   * Version: 3.0.6
   *
   * Requires: 1.2.2+
   */

  var orgEvent = event || window.event,
    args = [].slice.call(arguments, 1),
    delta = 0,
    returnValue = true,
    deltaX = 0,
    deltaY = 0;
  event = $.event.fix(orgEvent);
  event.type = "mousewheel";

  // Old school scrollwheel delta
  if (orgEvent.wheelDelta) {
    delta = orgEvent.wheelDelta / 120;
  }
  if (orgEvent.detail) {
    delta = -orgEvent.detail / 3;
  }

  // New school multidimensional scroll (touchpads) deltas
  deltaY = delta;

  // Gecko
  if (orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS) {
    deltaY = 0;
    deltaX = -1 * delta;
  }

  // Webkit
  if (orgEvent.wheelDeltaY !== undefined) {
    deltaY = orgEvent.wheelDeltaY / 120;
  }
  if (orgEvent.wheelDeltaX !== undefined) {
    deltaX = -1 * orgEvent.wheelDeltaX / 120;
  }

  console.log(""+deltaX+" "+deltaY);
  if (deltaY > 0.2) {
    var cursorPositio = editor.getCursor(true);
    // this is to prevent that when the cursor reaches the
    // last line, then it goes to the END of the line
    // we avoid that because of a nasty workaround
    // where we check whether the cursor is in the
    // first few characters of the line to avoid
    // following a "next-tutorial" link.
    console.log(cursorPositio.line+" "+editor.lineCount())
    if (cursorPositio.line !== editor.lineCount() - 1) {
      editor.setCursor(cursorPositio.line + 1, cursorPositio.ch);
    }
  } else if (deltaY < -0.2) {
    var cursorPositio = editor.getCursor(true);
    editor.setCursor(cursorPositio.line - 1, cursorPositio.ch);
  }
}

/* Initialization code. */
if (window.addEventListener) window.addEventListener('DOMMouseScroll', wheel, false);
window.onmousewheel = document.onmousewheel = wheel;

///////////// END OF MOUSEWHEEL HANDLER CODE
// this function is called when the cursor moves
// and we handle this in two ways
// 1) we suspend the dimming countdown
// 2) we undim the editor if it is dimmed
// 3) we check whether the user moved the cursor over a link


function suspendDimmingAndCheckIfLink() {

  // Now this is kind of a nasty hack: we check where the
  // cursor is, and if it's over a line containing the
  // link then we follow it.
  // There was no better way, for some reason some onClick
  // events are lost, so what happened is that one would click on
  // the link and nothing would happen.
  var cursorP = editor.getCursor(true);
  if (cursorP.ch > 2) {
    var currentLineContent = editor.getLine(cursorP.line);
    if (currentLineContent.indexOf('// next-tutorial:') === 0) {
      currentLineContent = currentLineContent.substring(17);
      currentLineContent = currentLineContent.replace("_", "");
      //alert(""+url);
      setTimeout('loadDemoOrTutorial("' + currentLineContent + 'Tutorial");', 200);
    }
  }

  if (fakeText || editor.getValue() === '') return;
  console.log('cursor activity! opacity: ' + $("#formCode").css('opacity'));
  cursorActivity = true;
  undimEditor();
}

function undimEditor() {
  if (fakeText || editor.getValue() === '') $("#formCode").css('opacity', 0);
  if ($("#formCode").css('opacity') < 0.99) {
    console.log('undimming the editor');
    $("#formCode").animate({
      opacity: 1
    }, "fast");
  }
}

// Now that there is a manual switch to toggle it off and on
// the dimming goes to full INvisibility
// see toggleDimCode() 
// not sure about that, want to try it on people -- julien 

function dimEditor() {
  // TODO there is a chance that the animation library
  // doesn't bring the opacity completely to zero
  // but rather to a value close to it.
  // Make the animation step to print something
  // just to make sure that this is not the case.
  if ($("#formCode").css('opacity') > 0) {
    console.log('starting fadeout animation');
    $("#formCode").animate({
      opacity: 0
    }, "slow");
  }
}

function dimIfNoCursorActivity() {
  if (fakeText || editor.getValue() === '') return;
  if (cursorActivity) {
    console.log('marking cursor activity = false. Will check again in the next interval');
    cursorActivity = false;
    return;
  } else {
    console.log('no activity in the last interval. Dimming now, starting opacity is: ' + $("#formCode").css('opacity') );
    dimEditor();
  }
}


// a function to toggle code diming on and off -- julien 

function toggleDimCode() {
  dimcodeOn = !dimcodeOn;

  if (!dimcodeOn) {
    clearInterval(dimIntervalID);
    undimEditor();
    if (frenchVersion) {
      $("#dimCodeIndicator").html("Code Caché: inactif");
    } else {
      $("#dimCodeIndicator").html("Hide Code: off");
    }

  } else {
    // we restart a setInterval
    dimIntervalID = setInterval("dimIfNoCursorActivity()", 5000);
    if (frenchVersion) {
      $("#dimCodeIndicator").html("Code Caché: actif");
    } else {
      $("#dimCodeIndicator").html("Hide Code: on");
    }

  }
}




///////////////////////////////////////////////

function fullscreenify(canvas) {
  var style = canvas.getAttribute('style') || '';
  //alert('style: ' +  style);
  window.addEventListener('resize', function() {
    adjustCodeMirrorHeight();
    resize(canvas);
  }, false);

  resize(canvas);

  function resize(canvas) {
    var scale = {
      x: 1,
      y: 1
    };
    scale.x = (window.innerWidth + 40) / canvas.width;
    scale.y = (window.innerHeight + 40) / canvas.height;

    scale = scale.x + ', ' + scale.y;

    // this code below is if one wants to keep the aspect ratio
    // but I mean one doesn't necessarily resize the window
    // keeping the same aspect ratio.
    /*
        if (scale.x < 1 || scale.y < 1) {
            scale = '1, 1';
        } else if (scale.x < scale.y) {
            scale = scale.x + ', ' + scale.x;
        } else {
            scale = scale.y + ', ' + scale.y;
        }
        */

    canvas.setAttribute('style', style + ' ' + '-ms-transform-origin: left top; -webkit-transform-origin: left top; -moz-transform-origin: left top; -o-transform-origin: left top; transform-origin: left top; -ms-transform: scale(' + scale + '); -webkit-transform: scale3d(' + scale + ', 1); -moz-transform: scale(' + scale + '); -o-transform: scale(' + scale + '); transform: scale(' + scale + ');');

    // TODO In theory we want to re-draw the background because the
    // aspect ration might have changed.
    // But for the time being we only have vertical
    // gradients so that's not going to be a problem.
  }
}