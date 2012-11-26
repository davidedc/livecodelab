/*jslint browser: true, devel: true */
/*global $ */

// if you put to -1 then it means that
// requestAnimationFrame will try to go as fast as it
// can.
var wantedFramesPerSecond = -1;

var useRequestAnimationFrame = true;

var frame = 0;
// this array is used to keep track of all the instances of "doOnce" in the code
// we need to keep this so we can put the ticks next to doOnce once that doOnce
// block has run.
var doOnceOccurrencesLineNumbers = [];
var time;

// if there isn't any code using the bpm setting then we can save a timer, so
// worth tracking with this variable
var anyCodeReactingTobpm;

var createLiveCodeLab = function (CodeTransformer, threejs) {

    var LiveCodeLab = {},
        loopInterval,
        timeAtStart,
        lastStableProgram;

    LiveCodeLab.drawFunction = "";

    LiveCodeLab.setDrawFunction = function (drawFunc) {
        LiveCodeLab.drawFunction = drawFunc;
    };

    // animation loop
    LiveCodeLab.animate = function () {

        // loop on request animation loop
        // - it has to be at the begining of the function
        // - see details at http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
        // requestAnimationFrame seems to only do 60 fps, which in my case is too much,
        // I rather prefer to have a slower framerate but steadier.
        if (useRequestAnimationFrame) {
            if (wantedFramesPerSecond === -1) {
                requestAnimationFrame(LiveCodeLab.animate);
            } else {
                //setTimeout("window.requestAnimationFrame(LiveCodeLab.animate)",
                //       1000 / wantedFramesPerSecond);
                if (loopInterval === undefined) {
                    loopInterval = setInterval("window.requestAnimationFrame(LiveCodeLab.animate)", 1000 / wantedFramesPerSecond);
                }
            }
        } else {
            setTimeout(LiveCodeLab.animate, 1000 / wantedFramesPerSecond);
        }

        matrixStack = [];
        worldMatrix.identity();

        // the sound list needs to be cleaned
        // so that the user program can create its own from scratch
        soundLoops.soundIDs = [];
        soundLoops.beatStrings = [];


        if (LiveCodeLab.drawFunction !== "") {
            var d = new Date();
            if (frame === 0) {
                timeAtStart = d.getTime();
                time = 0;
            } else {
                time = d.getTime() - timeAtStart;
            }
            doOnceOccurrencesLineNumbers = [];
            anyCodeReactingTobpm = false;
            fill(0xFFFFFFFF);
            stroke(0xFF000000);
            currentStrokeSize = 1;
            defaultNormalFill = true;
            defaultNormalStroke = true;
            ballDetLevel = threejs.ballDefaultDetLevel;
            updatesPerMinute = 60 * 4;
            noLights();

            usedAmbientLights = 0;
            objectsUsedInFrameCounts[GEOM_TYPE_LINE] = 0;
            objectsUsedInFrameCounts[GEOM_TYPE_RECT] = 0;
            objectsUsedInFrameCounts[GEOM_TYPE_BOX] = 0;
            objectsUsedInFrameCounts[GEOM_TYPE_CYLINDER] = 0;
            for (var initialisingSphereCounts = 0; initialisingSphereCounts < (maximumBallDetail - minimumBallDetail + 1); initialisingSphereCounts++) {
                objectsUsedInFrameCounts[GEOM_TYPE_SPHERE + initialisingSphereCounts] = 0;
            }

            animationStyleValue = normal;
            BackgroundPainter.resetGradientStack();
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
                LiveCodeLab.drawFunction();
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
                LiveCodeLab.drawFunction = lastStableProgram;

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
            BackgroundPainter.simpleGradientUpdateIfChanged();
            changeUpdatesPerMinuteIfNeeded();
            frame++;
            consecutiveFramesWithoutRunTimeError++;
            if (consecutiveFramesWithoutRunTimeError == 5) {
                lastStableProgram = LiveCodeLab.drawFunction;
                //chromeHackUncaughtReferenceName = '';
            }
        } // if typeof draw

        // do the render
        LiveCodeLab.combDisplayList();
        LiveCodeLab.render();
        // update stats
        stats.update();

        CodeTransformer.putTicksNextToDoOnceBlocksThatHaveBeenRun(editor);

    };

    LiveCodeLab.render = function () {

        if (threejs.isWebGLUsed) {
            threejs.composer.render();
        } else {

            // the renderer draws into an offscreen canvas called sceneRenderingCanvas
            threejs.renderer.render(threejs.scene, threejs.camera);

            // clear the final render context
            threejs.finalRenderWithSceneAndBlendContext.globalAlpha = 1.0;
            threejs.finalRenderWithSceneAndBlendContext.clearRect(0, 0, window.innerWidth, window.innerHeight);

            // draw the rendering of the scene on the final render
            // clear the final render context
            threejs.finalRenderWithSceneAndBlendContext.globalAlpha = blendAmount;
            threejs.finalRenderWithSceneAndBlendContext.drawImage(threejs.previousRenderForBlending, 0, 0);

            threejs.finalRenderWithSceneAndBlendContext.globalAlpha = 1.0;
            threejs.finalRenderWithSceneAndBlendContext.drawImage(threejs.sceneRenderingCanvas, 0, 0);

            threejs.previousRenderForBlendingContext.globalCompositeOperation = 'copy';
            threejs.previousRenderForBlendingContext.drawImage(threejs.finalRenderWithSceneAndBlend, 0, 0);

            // clear the renderer's canvas to transparent black
            threejs.sceneRenderingCanvasContext.clearRect(0, 0, window.innerWidth, window.innerHeight);

        }
    };

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

    LiveCodeLab.combDisplayList = function () {
        // scan all the objects in the display list
        for (var i = 0; i < threejs.scene.objects.length; ++i) {
            var sceneObject = threejs.scene.objects[i];

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
    };

    return LiveCodeLab;

}

