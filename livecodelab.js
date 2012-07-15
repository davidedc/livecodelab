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



function triggerReset() {
  pickRandomDefaultGradient();
  if (autocodeOn) toggleAutocode();
  editor.setValue('');
  $("#resetButtonContainer").css("background-color", '#FF0000');
  setTimeout('$("#resetButtonContainer").css("background-color","");', 200);
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