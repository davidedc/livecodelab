/*jslint browser: true, devel: true, maxerr: 200 */
/*global $, requestAnimationFrame, MatrixCommands, soundLoops: true, updatesPerMinute: true, LightSystem, autocoder, BlendControls, BackgroundPainter, editor, checkErrorAndReport, changeUpdatesPerMinuteIfNeeded, stats */


var frame = 0;
// this array is used to keep track of all the instances of "doOnce" in the code
// we need to keep this so we can put the ticks next to doOnce once that doOnce
// block has run.
var doOnceOccurrencesLineNumbers = [];

// if there isn't any code using the bpm setting then we can save a timer, so
// worth tracking with this variable
var anyCodeReactingTobpm;

var createLiveCodeLab = function (CodeTransformer, threejs, timekeeper, graphics) {

    'use strict';

    var LiveCodeLab = {},
        loopInterval,
        lastStableProgram;

    // if you put to -1 then it means that
    // requestAnimationFrame will try to go as fast as it
    // can.
    LiveCodeLab.wantedFramesPerSecond = -1;
    LiveCodeLab.useRequestAnimationFrame = true;

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
        if (LiveCodeLab.useRequestAnimationFrame) {
            if (LiveCodeLab.wantedFramesPerSecond === -1) {
                requestAnimationFrame(LiveCodeLab.animate);
            } else {
                if (loopInterval === undefined) {
                    loopInterval = setInterval("window.requestAnimationFrame(LiveCodeLab.animate)", 1000 / LiveCodeLab.wantedFramesPerSecond);
                }
            }
        } else {
            setTimeout(LiveCodeLab.animate, 1000 / LiveCodeLab.wantedFramesPerSecond);
        }

        MatrixCommands.resetMatrixStack();

        // the sound list needs to be cleaned
        // so that the user program can create its own from scratch
        soundLoops.soundIDs = [];
        soundLoops.beatStrings = [];


        if (LiveCodeLab.drawFunction !== "") {
            if (frame === 0) {
                timekeeper.resetTime();
            } else {
                timekeeper.updateTime();
            }
            doOnceOccurrencesLineNumbers = [];
            anyCodeReactingTobpm = false;
            graphics.fill(0xFFFFFFFF);
            graphics.stroke(0xFF000000);
            graphics.currentStrokeSize = 1;
            graphics.defaultNormalFill = true;
            graphics.defaultNormalStroke = true;
            graphics.ballDetLevel = threejs.ballDefaultDetLevel;
            updatesPerMinute = 60 * 4;
            LightSystem.noLights();

            LightSystem.usedAmbientLights = 0;

            graphics.objectsUsedInFrameCounts[graphics.geometries.line] = 0;
            graphics.objectsUsedInFrameCounts[graphics.geometries.rect] = 0;
            graphics.objectsUsedInFrameCounts[graphics.geometries.box] = 0;
            graphics.objectsUsedInFrameCounts[graphics.geometries.cylinder] = 0;
            // initialising sphere counts
            var i;
            for (i = 0; i < (graphics.maximumBallDetail - graphics.minimumBallDetail + 1); i += 1) {
                graphics.objectsUsedInFrameCounts[graphics.geometries.sphere + i] = 0;
            }

            BlendControls.animationStyle(BlendControls.animationStyles.normal);
            BackgroundPainter.resetGradientStack();

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
                    return;
                }

                // highlight the error
                checkErrorAndReport(e);

                // mark the program as flawed and register the previous stable one.
                CodeTransformer.consecutiveFramesWithoutRunTimeError = 0;
                LiveCodeLab.drawFunction = lastStableProgram;

                return;
            }

            // we have to repeat this check because in the case
            // the user has set frame = 0,
            // then we have to catch that case here
            // after the program has executed
            if (frame === 0) {
                timekeeper.resetTime();
            }
            if (anyCodeReactingTobpm) {
                changeUpdatesPerMinuteIfNeeded();
            }
            BlendControls.animationStyleUpdateIfChanged();
            BackgroundPainter.simpleGradientUpdateIfChanged();
            changeUpdatesPerMinuteIfNeeded();
            frame += 1;
            CodeTransformer.consecutiveFramesWithoutRunTimeError += 1;
            if (CodeTransformer.consecutiveFramesWithoutRunTimeError === 5) {
                lastStableProgram = LiveCodeLab.drawFunction;
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
            threejs.finalRenderWithSceneAndBlendContext.globalAlpha = BlendControls.blendAmount;
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
        var i,
            sceneObject,
            primitiveType;
        // scan all the objects in the display list
        for (i = 0; i < threejs.scene.objects.length; i += 1) {
            sceneObject = threejs.scene.objects[i];

            // check the type of object. Each type has one pool. Go through each object in the
            // pool and set to visible the number of used objects in this frame, set the
            // others to hidden.
            // Only tiny exception is that the sphere has one pool for each detail level.
            if (sceneObject.isLine) {
                primitiveType = graphics.geometries.line;
            } else if (sceneObject.isRectangle) {
                primitiveType = graphics.geometries.rect;
            } else if (sceneObject.isBox) {
                primitiveType = graphics.geometries.box;
            } else if (sceneObject.isCylinder) {
                primitiveType = graphics.geometries.cylinder;
            } else if (sceneObject.isSphere !== 0) {
                primitiveType = graphics.geometries.sphere + sceneObject.isSphere - graphics.minimumBallDetail;
            }

            // set the first "used*****" objects to visible...
            if (graphics.objectsUsedInFrameCounts[primitiveType] > 0) {
                sceneObject.visible = true;
                graphics.objectsUsedInFrameCounts[primitiveType] -= 1;
            } else {
                // ... and the others to invisible
                sceneObject.visible = false;
            }

            if (sceneObject.isAmbientLight) {
                if (LightSystem.usedAmbientLights > 0) {
                    sceneObject.visible = true;
                    LightSystem.usedAmbientLights -= 1;
                } else {
                    sceneObject.visible = false;
                }
            }
        }
    };

    return LiveCodeLab;

};
