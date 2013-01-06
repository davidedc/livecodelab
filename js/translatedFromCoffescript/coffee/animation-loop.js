var createAnimationLoop, frame;

frame = 0;

createAnimationLoop = function(eventRouter, stats, liveCodeLabCoreInstance) {
  "use strict";

  var AnimationLoop, loopInterval, scheduleNextFrame;
  AnimationLoop = {};
  loopInterval = void 0;
  AnimationLoop.wantedFramesPerSecond = -1;
  AnimationLoop.useRequestAnimationFrame = true;
  scheduleNextFrame = function() {
    if (AnimationLoop.useRequestAnimationFrame) {
      if (AnimationLoop.wantedFramesPerSecond === -1) {
        return window.requestAnimationFrame(function() {
          return AnimationLoop.animate();
        });
      } else {
        if (loopInterval === undefined) {
          return loopInterval = setInterval(function() {
            return window.requestAnimationFrame(function() {
              return AnimationLoop.animate();
            });
          }, 1000 / AnimationLoop.wantedFramesPerSecond);
        }
      }
    } else {
      if (AnimationLoop.wantedFramesPerSecond === -1) {
        return setTimeout((function() {
          return AnimationLoop.animate();
        }), 1000 / 60);
      } else {
        return setTimeout((function() {
          return AnimationLoop.animate();
        }), 1000 / AnimationLoop.wantedFramesPerSecond);
      }
    }
  };
  AnimationLoop.animate = function() {
    var DrawFunctionRunner, drawFunction;
    drawFunction = void 0;
    liveCodeLabCoreInstance.MatrixCommands.resetMatrixStack();
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
    if (liveCodeLabCoreInstance.DrawFunctionRunner.drawFunction) {
      scheduleNextFrame();
      try {
        liveCodeLabCoreInstance.DrawFunctionRunner.runDrawFunction();
      } catch (e) {
        eventRouter.trigger("runtime-error-thrown", e);
        return;
      }
      DrawFunctionRunner = liveCodeLabCoreInstance.DrawFunctionRunner;
      DrawFunctionRunner.putTicksNextToDoOnceBlocksThatHaveBeenRun(liveCodeLabCoreInstance.CodeTransformer);
    } else {
      liveCodeLabCoreInstance.dozingOff = true;
    }
    if (frame === 0) {
      liveCodeLabCoreInstance.TimeKeeper.resetTime();
    }
    liveCodeLabCoreInstance.BlendControls.animationStyleUpdateIfChanged();
    liveCodeLabCoreInstance.BackgroundPainter.simpleGradientUpdateIfChanged();
    liveCodeLabCoreInstance.SoundSystem.changeUpdatesPerMinuteIfNeeded();
    frame++;
    liveCodeLabCoreInstance.Renderer.render(liveCodeLabCoreInstance.GraphicsCommands);
    if (stats !== null) {
      return stats.update();
    }
  };
  return AnimationLoop;
};
