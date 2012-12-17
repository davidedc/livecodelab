/*jslint browser: true */


var frame = 0;


var createAnimationLoop = function (eventRouter, stats, liveCodeLabCoreInstance) {

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
                    AnimationLoop.animate();
                });
            } else {
                if (loopInterval === undefined) {
                    loopInterval = setInterval(function () {
                        window.requestAnimationFrame(function () {
                            AnimationLoop.animate();
                        });
                    }, 1000 / AnimationLoop.wantedFramesPerSecond);
                }
            }
        } else {
            if (AnimationLoop.wantedFramesPerSecond === -1) {
							setTimeout(function () {
									AnimationLoop.animate();
							}, 1000 / 60);
            } else {
							setTimeout(function () {
									AnimationLoop.animate();
							}, 1000 / AnimationLoop.wantedFramesPerSecond);
            }
        }
    }
    
    // animation loop
    AnimationLoop.animate = function () {

        var drawFunction;

        liveCodeLabCoreInstance.MatrixCommands.resetMatrixStack();

        // the sound list needs to be cleaned
        // so that the user program can create its own from scratch
        liveCodeLabCoreInstance.SoundSystem.resetLoops();

				if (frame === 0) {
						liveCodeLabCoreInstance.TimeKeeper.resetTime();
				} else {
						liveCodeLabCoreInstance.TimeKeeper.updateTime();
				}
				
				liveCodeLabCoreInstance.DrawFunctionRunner.resetTrackingOfDoOnceOccurrences();
				liveCodeLabCoreInstance.SoundSystem.anyCodeReactingTobpm = false;

				liveCodeLabCoreInstance.SoundSystem.SetUpdatesPerMinute(60 * 4);
				liveCodeLabCoreInstance.LightSystem.noLights();

				liveCodeLabCoreInstance.GraphicsCommands.reset();

				liveCodeLabCoreInstance.BlendControls.animationStyle(liveCodeLabCoreInstance.BlendControls.animationStyles.normal);
				liveCodeLabCoreInstance.BackgroundPainter.resetGradientStack();
				        
				// if the draw function is empty, then don't schedule the
				// next animation frame and set a "I'm sleeping" flag.
				// We'll re-start the animation when the editor content
				// changes. Note that this frame goes to completion anyways, because
				// we actually do want to render one "empty screen" frame.
        if (liveCodeLabCoreInstance.DrawFunctionRunner.drawFunction) {
          scheduleNextFrame();
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
						liveCodeLabCoreInstance.DrawFunctionRunner.runDrawFunction();
					}
					catch (e) {
							 //alert('runtime error');
							 eventRouter.trigger('runtime-error-thrown', e);
							 return;
					}
					liveCodeLabCoreInstance.DrawFunctionRunner.putTicksNextToDoOnceBlocksThatHaveBeenRun(liveCodeLabCoreInstance.CodeTransformer);
        }
        else {
					liveCodeLabCoreInstance.dozingOff = true;
					//console.log('dozing off');
        }


				// we have to repeat this check because in the case
				// the user has set frame = 0,
				// then we have to catch that case here
				// after the program has executed
				if (frame === 0) {
						liveCodeLabCoreInstance.TimeKeeper.resetTime();
				}
				liveCodeLabCoreInstance.BlendControls.animationStyleUpdateIfChanged();
				liveCodeLabCoreInstance.BackgroundPainter.simpleGradientUpdateIfChanged();
				liveCodeLabCoreInstance.SoundSystem.changeUpdatesPerMinuteIfNeeded();

        // "frame" starts at zero, so we increment after the first time the draw
        // function has been run.
 				frame++;
		
        // do the render
        liveCodeLabCoreInstance.Renderer.render(liveCodeLabCoreInstance.GraphicsCommands);
        // update stats
        stats.update();
    };


    return AnimationLoop;

};
