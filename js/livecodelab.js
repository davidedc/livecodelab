/*jslint browser: true, devel: true */
/*global $ */


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

    matrixStack = [];
    worldMatrix.identity();

    // the sound list needs to be cleaned
    // so that the user program can create its own from scratch
    soundLoops.soundIDs = [];
    soundLoops.beatStrings = [];


    //rootObject = new THREE.Object3D();
    //scene.add(rootObject);
    //parentObject = rootObject;
    if (typeof (draw) != "undefined") {
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
        updatesPerMinute = 60 * 4;
        noLights();

        usedAmbientLights = 0;
        usedPointLights = 0;
        objectsUsedInFrameCounts[GEOM_TYPE_LINE] = 0;
        objectsUsedInFrameCounts[GEOM_TYPE_RECT] = 0;
        objectsUsedInFrameCounts[GEOM_TYPE_BOX] = 0;
        objectsUsedInFrameCounts[GEOM_TYPE_CYLINDER] = 0;
        for (var initialisingSphereCounts = 0; initialisingSphereCounts < (maximumBallDetail - minimumBallDetail + 1); initialisingSphereCounts++) {
            objectsUsedInFrameCounts[GEOM_TYPE_SPHERE + initialisingSphereCounts] = 0;
        }

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
            if (autocoder.active) {
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
    // update stats
    stats.update();


    if (doLNOnce.length !== 0) {
        //alert("a doOnce has been ran");
        var elaboratedSource = editor.getValue();

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

    // need a light for the meshlambert material
    // var light = new THREE.PointLight( 0xFFFFFF );
    // light.position.set( 10, 0, 10 );
    // scene.add( light );

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



function triggerReset() {
    pickRandomDefaultGradient();
    if (autocoder.active) toggleAutocodeAndUpdateButtonAndBlinking();
    editor.setValue('');
    $("#resetButtonContainer").css("background-color", '#FF0000');
    setTimeout('$("#resetButtonContainer").css("background-color","");', 200);
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
    $('.CodeMirror-scroll').css('height', window.innerHeight - $('#theMenu').height());
}


function fullscreenify(canvas) {
    var style = canvas.getAttribute('style') || '';
    window.addEventListener('resize', function () {
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

        // if (scale.x < 1 || scale.y < 1) {
        //     scale = '1, 1';
        // } else if (scale.x < scale.y) {
        //     scale = scale.x + ', ' + scale.x;
        // } else {
        //     scale = scale.y + ', ' + scale.y;
        // }

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
// scene and finds the objects that need to be visible and
// those that need to be hidden.
// This is a scenario of how it works:
//   frame 1: 3 boxes invoked. effect: 3 cubes are created and put in the scene
//   frame 2: 1 box invoked. effect: 1st cube is updated with new scale/matrix/material
//            and the other 2 boxes are set to hidden
// So there is a pool of objects for each primitive. It starts empty, new objects are
// added to the scene only if the ones available from previous draws are not sufficient.
// TODO a way to shrink the scene if it's been a
// long time that only a handful of lines/meshes
// have been used.
// Note: Mr Doob said that the new scene destruction/creation primitives of Three.js
//       are much faster. Also the objects of the scene are harder to reach, so
//       it could be the case that this mechanism is not needed anymore.

function combDisplayList() {
    // scan all the objects in the display list
    for (var i = 0; i < scene.objects.length; ++i) {
        var sceneObject = scene.objects[i];

        // check the type of object. Each type has one pool. Go through each object in the
        // pool and set to visible the number of used objects in this frame, set the
        // others to hidden.
        // Only tiny exception is that the sphere has one pool for each detail level.
        var primitiveType;
        if (sceneObject.isLine) primitiveType = GEOM_TYPE_LINE;
        else if (sceneObject.isRectangle) primitiveType = GEOM_TYPE_RECT;
        else if (sceneObject.isBox) primitiveType = GEOM_TYPE_BOX;
        else if (sceneObject.isCylinder) primitiveType = GEOM_TYPE_CYLINDER;
        else if (sceneObject.isSphere !== 0) primitiveType = GEOM_TYPE_SPHERE + sceneObject.isSphere - minimumBallDetail;

        // set the first "used*****" objects to visible...
        if (objectsUsedInFrameCounts[primitiveType] > 0) {
            sceneObject.visible = true;
            objectsUsedInFrameCounts[primitiveType]--;
        } else {
            // ... and the others to invisible
            sceneObject.visible = false;
        }

        if (sceneObject.isAmbientLight) {
            if (usedAmbientLights > 0) {
                sceneObject.visible = true;
                usedAmbientLights--;
            } else {
                sceneObject.visible = false;
            }
        }
    }
}
