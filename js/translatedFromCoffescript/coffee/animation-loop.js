var AnimationLoop, frame, lastTime, vendors, x;

frame = 0;

AnimationLoop = function(eventRouter, stats, liveCodeLabCoreInstance, forceUseOfTimeoutForScheduling) {
  var loopInterval, scheduleNextFrame;
  if (forceUseOfTimeoutForScheduling == null) {
    forceUseOfTimeoutForScheduling = false;
  }
  "use strict";

  AnimationLoop = {};
  loopInterval = void 0;
  AnimationLoop.AS_HIGH_FPS_AS_POSSIBLE = -1;
  AnimationLoop.wantedFramesPerSecond = AnimationLoop.AS_HIGH_FPS_AS_POSSIBLE;
  AnimationLoop.forceUseOfTimeoutForScheduling = forceUseOfTimeoutForScheduling;
  scheduleNextFrame = function() {
    if (AnimationLoop.forceUseOfTimeoutForScheduling) {
      if (AnimationLoop.wantedFramesPerSecond === AnimationLoop.AS_HIGH_FPS_AS_POSSIBLE) {
        return setTimeout((function() {
          return AnimationLoop.animate();
        }), 1000 / 60);
      } else {
        return setTimeout((function() {
          return AnimationLoop.animate();
        }), 1000 / AnimationLoop.wantedFramesPerSecond);
      }
    } else {
      if (AnimationLoop.wantedFramesPerSecond === AnimationLoop.AS_HIGH_FPS_AS_POSSIBLE) {
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
    }
  };
  AnimationLoop.animate = function() {
    var DrawFunctionRunner;
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
      frame = 0;
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

lastTime = 0;

vendors = ["ms", "moz", "webkit", "o"];

x = 0;

while (x < vendors.length && !window.requestAnimationFrame) {
  window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
  window.cancelAnimationFrame = window[vendors[x] + "CancelAnimationFrame"] || window[vendors[x] + "CancelRequestAnimationFrame"];
  ++x;
}

if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = function(callback, element) {
    var currTime, id, timeToCall;
    currTime = new Date().getTime();
    timeToCall = Math.max(0, 16 - (currTime - lastTime));
    id = window.setTimeout(function() {
      return callback(currTime + timeToCall);
    }, timeToCall);
    lastTime = currTime + timeToCall;
    return id;
  };
}

if (!window.cancelAnimationFrame) {
  window.cancelAnimationFrame = function(id) {
    return clearTimeout(id);
  };
}
