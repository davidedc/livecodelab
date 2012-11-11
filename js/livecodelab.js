var drawLoopTimer = null;
var frame = 0;
var doLNOnce = [];
var loopInterval;
var time;
var timeAtStart;
// if there isn't any code using the bpm setting then we can save a timer, so
// worth tracking with this variable
var anyCodeReactingTobpm;

// animation loop
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
  // so that the user program can create its own from scratch
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
    anyCodeReactingTobpm = false;
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
    updatesPerMinute = 60*4;
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
    
    // Now here there is another try/catch check when the draw function is ran.
    // The reason is that there might be references to uninitialised or inexistent
    // variables. For example:
    //   box
    //   background yeLow
    //   ball
    // draws only a box, because the execution silently fails at the yeLow reference.
    // So in that case we need to a) highlight the error and b) run the previously
    // known good program.
    try {
	    draw();
	  } catch (e) {
		
				// I'm not sure that this type of error should occur during autocoding
				// but this can't hurt and it's symmetrical to the other try/catch
				// situation we have in livecodelab
				if (autocodeOn) {
					editor.undo();
					//alert("did an undo");
					return;
				}
		
				// highlight the error
				checkErrorAndReport(e);
				
				// mark the program as flawed and register the previous stable one.
				consecutiveFramesWithoutRunTimeError = 0;
				out = lastStableProgram;
  			window.eval(lastStableProgram);

				return;
		}

    // we have to repeat this check because in the case
    // the user has set frame = 0,
    // then we have to catch that case here
    // after the program has executed
    if (frame === 0) {
      timeAtStart = d.getTime();
      time = 0;
    }
    if (anyCodeReactingTobpm) changeUpdatesPerMinuteIfNeeded();
    animationStyleUpdateIfChanged();
    simpleGradientUpdateIfChanged();
    changeUpdatesPerMinuteIfNeeded();
    frame++;
    consecutiveFramesWithoutRunTimeError++;
    if (consecutiveFramesWithoutRunTimeError == 5) {
      lastStableProgram = out;
      //chromeHackUncaughtReferenceName = '';
    }
  } // if typeof draw

  // do the render
  combDisplayList();
  render();
  //clearDisplayList();
  // update stats
  stats.update();


  if (doLNOnce.length !== 0) {
    //alert("a doOnce has been ran");
    var elaboratedSource = editor.getValue();

    if (frenchVersion) {
      elaboratedSource = elaboratedSource.replace(/uneFois/g, "doOnce");
    }

    var elaboratedSourceByLine = elaboratedSource.split("\n");
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

var composer;

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


var dimcodeOn = false;

function triggerReset() {
  pickRandomDefaultGradient();
  if (autocodeOn) toggleAutocodeAndUpdateButtonAndBlinking();
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
 var foo = function(msg, url, linenumber) {
// window.onerror = function(msg, url, linenumber) {

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
