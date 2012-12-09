/*jslint browser: true */
/*global $ */


var frame = 0;


var createAnimationController = function (events, CodeTransformer, threejs, timekeeper, graphics, stats, matrixcommands, soundsystem, lightsystem, blendcontrols, backgroundpainter) {

    'use strict';

    var AnimationController = {},
        loopInterval,
        lastStableProgram;

    // if you put to -1 then it means that
    // requestAnimationFrame will try to go as fast as it
    // can.
    AnimationController.wantedFramesPerSecond = -1;
    AnimationController.useRequestAnimationFrame = true;

    AnimationController.drawFunction = "";

    AnimationController.setDrawFunction = function (drawFunc) {
        AnimationController.drawFunction = drawFunc;
    };

    AnimationController.registerCode = function (Editor) {
        var drawFunction = CodeTransformer.registerCode(Editor);
        AnimationController.setDrawFunction(drawFunction);
    };

    // animation loop
    AnimationController.animate = function (Editor) {

        var drawFunction;

        // loop on request animation loop
        // - it has to be at the begining of the function
        // - see details at http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
        // requestAnimationFrame seems to only do 60 fps, which in my case is too much,
        // I rather prefer to have a slower framerate but steadier.
        if (AnimationController.useRequestAnimationFrame) {
            if (AnimationController.wantedFramesPerSecond === -1) {
                window.requestAnimationFrame(function () {
                    AnimationController.animate(Editor);
                });
            } else {
                if (loopInterval === undefined) {
                    loopInterval = setInterval(function () {
                        window.requestAnimationFrame(function () {
                            AnimationController.animate(Editor);
                        });
                    }, 1000 / AnimationController.wantedFramesPerSecond);
                }
            }
        } else {
            setTimeout(function () {
                AnimationController.animate(Editor);
            }, 1000 / AnimationController.wantedFramesPerSecond);
        }

        matrixcommands.resetMatrixStack();

        // the sound list needs to be cleaned
        // so that the user program can create its own from scratch
        soundsystem.resetLoops();


        if (AnimationController.drawFunction !== "") {

            if (frame === 0) {
                timekeeper.resetTime();
            } else {
                timekeeper.updateTime();
            }
            CodeTransformer.doOnceOccurrencesLineNumbers = [];
            soundsystem.anyCodeReactingTobpm = false;

            soundsystem.SetUpdatesPerMinute(60 * 4);
            lightsystem.noLights();

            graphics.reset();

            blendcontrols.animationStyle(blendcontrols.animationStyles.normal);
            backgroundpainter.resetGradientStack();

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
                AnimationController.drawFunction();
            } catch (e) {

                // highlight the error
                events.trigger('display-error', e);

                // mark the program as flawed and register the previous stable one.
                CodeTransformer.consecutiveFramesWithoutRunTimeError = 0;
                AnimationController.drawFunction = lastStableProgram;

                return;
            }

            // we have to repeat this check because in the case
            // the user has set frame = 0,
            // then we have to catch that case here
            // after the program has executed
            if (frame === 0) {
                timekeeper.resetTime();
            }
            blendcontrols.animationStyleUpdateIfChanged();
            backgroundpainter.simpleGradientUpdateIfChanged();
            soundsystem.changeUpdatesPerMinuteIfNeeded();

            frame += 1;

            CodeTransformer.consecutiveFramesWithoutRunTimeError += 1;
            if (CodeTransformer.consecutiveFramesWithoutRunTimeError === 5) {
                lastStableProgram = AnimationController.drawFunction;
            }
        } // if typeof draw

        // do the render
        AnimationController.combDisplayList();
        AnimationController.render();
        // update stats
        stats.update();

        drawFunction = CodeTransformer.putTicksNextToDoOnceBlocksThatHaveBeenRun(Editor);
        if (drawFunction) {
            AnimationController.setDrawFunction(drawFunction);
        }

    };

    AnimationController.render = function () {

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
            threejs.finalRenderWithSceneAndBlendContext.globalAlpha = blendcontrols.blendAmount;
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
    // Note that in theory we could be smarter, instead of combing the whole scene
    // we could pack all the similar primitives together (because the order in the
    // display list doesn't matter, because there are no "matrix" nodes, each
    // primitive contains a fully calculated matrix) and keep indexes of where each
    // group is, so we could for example have 100 boxes and 100 balls, and we could
    // scan the first two boxes and set those two visible, then jump to the balls
    // avoiding to scan all the other 98 boxes, and set the correct amount of balls
    // visible. In practice, it's not clear whether a lot of time is spend in this
    // function, so that should be determined first.
    // TODO a way to shrink the scene and delete from the scene objects that have
    // not been used for a long time.
    // Note: Mr Doob said that the new scene destruction/creation primitives of Three.js
    //       are much faster. Also the objects of the scene are harder to reach, so
    //       it could be the case that this mechanism is not needed anymore.

    AnimationController.combDisplayList = function () {
        var i,
            sceneObject,
            primitiveType;
        // scan all the objects in the display list
        for (i = 0; i < threejs.scene.children.length; i += 1) {
            sceneObject = threejs.scene.children[i];

            // check the type of object. Each type has one pool. Go through each object in the
            // pool and set to visible the number of used objects in this frame, set the
            // others to hidden.
            // Only tiny exception is that the ball has one pool for each detail level.


            // set the first "used*****" objects to visible...
            //logger('combing display list objects: ' + (i+1) + " of " + threejs.scene.objects.length);
            //logger('prim type' + sceneObject.primitiveType);
            //logger('det level' + sceneObject.detailLevel);
            if (graphics.objectsUsedInFrameCounts[sceneObject.primitiveType + sceneObject.detailLevel] > 0) {
                //logger('object visible');
                sceneObject.visible = true;
                graphics.objectsUsedInFrameCounts[sceneObject.primitiveType + sceneObject.detailLevel] -= 1;
            } else {
                // ... and the others to invisible
                sceneObject.visible = false;
            }

        }
    };


    // Setup Event Listeners
    events.bind('editor-change', AnimationController.registerCode, AnimationController);



    return AnimationController;

};
