/*jslint browser: true */


var frame = 0;


var createAnimationLoop = function (editor, drawFunctionRunner, eventRouter, CodeTransformer, renderer, timekeeper, graphics, stats, matrixcommands, soundsystem, lightsystem, blendcontrols, backgroundpainter) {

    'use strict';

    var AnimationLoop = {},
        loopInterval;

    // if you put to -1 then it means that
    // requestAnimationFrame will try to go as fast as it
    // can.
    AnimationLoop.wantedFramesPerSecond = -1;
    AnimationLoop.useRequestAnimationFrame = true;


    var scheduleNextFrame = function() {
        // loop on request animation loop
        // - it has to be at the begining of the function
        // - see details at http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
        // requestAnimationFrame seems to only do 60 fps, which in my case is too much,
        // I rather prefer to have a slower framerate but steadier.
        if (AnimationLoop.useRequestAnimationFrame) {
            if (AnimationLoop.wantedFramesPerSecond === -1) {
                window.requestAnimationFrame(function () {
                    AnimationLoop.animate(editor);
                });
            } else {
                if (loopInterval === undefined) {
                    loopInterval = setInterval(function () {
                        window.requestAnimationFrame(function () {
                            AnimationLoop.animate(editor);
                        });
                    }, 1000 / AnimationLoop.wantedFramesPerSecond);
                }
            }
        } else {
            if (AnimationLoop.wantedFramesPerSecond === -1) {
							setTimeout(function () {
									AnimationLoop.animate(editor);
							}, 1000 / 60);
            } else {
							setTimeout(function () {
									AnimationLoop.animate(editor);
							}, 1000 / AnimationLoop.wantedFramesPerSecond);
            }
        }
    }
    
    // animation loop
    AnimationLoop.animate = function () {

        var drawFunction;

        scheduleNextFrame();

        // if the draw function is empty, then there
        // is nothing to do, return.
        if (drawFunctionRunner.drawFunction === "") {
          return;
        }
        
        matrixcommands.resetMatrixStack();

        // the sound list needs to be cleaned
        // so that the user program can create its own from scratch
        soundsystem.resetLoops();

				if (frame === 0) {
						timekeeper.resetTime();
				} else {
						timekeeper.updateTime();
				}
				
				drawFunctionRunner.resetTrackingOfDoOnceOccurrences();
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
				try{
					drawFunctionRunner.runDrawFunction();
				}
				catch (e) {
						 eventRouter.trigger('display-error', e);
						 drawFunctionRunner.reinstateLastWorkingProgram();
						 return;
				}
        drawFunctionRunner.putTicksNextToDoOnceBlocksThatHaveBeenRun(editor, CodeTransformer);


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

        // "frame" starts at zero, so we increment after the first time the draw
        // function has been run.
 				frame++;
		
        // do the render
        renderer.render(graphics);
        // update stats
        stats.update();
    };


    return AnimationLoop;

};
