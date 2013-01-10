var AnimationLoop, frame, lastTime, vendors, x;

frame = 0;

"use strict";


AnimationLoop = (function() {

  AnimationLoop.prototype.loopInterval = null;

  AnimationLoop.prototype.wantedFramesPerSecond = null;

  AnimationLoop.prototype.liveCodeLabCoreInstance = void 0;

  AnimationLoop.prototype.AS_HIGH_FPS_AS_POSSIBLE = -1;

  function AnimationLoop(eventRouter, stats, liveCodeLabCoreInstance, forceUseOfTimeoutForScheduling) {
    this.eventRouter = eventRouter;
    this.stats = stats;
    this.liveCodeLabCoreInstance = liveCodeLabCoreInstance;
    this.forceUseOfTimeoutForScheduling = forceUseOfTimeoutForScheduling != null ? forceUseOfTimeoutForScheduling : false;
    this.wantedFramesPerSecond = this.AS_HIGH_FPS_AS_POSSIBLE;
  }

  AnimationLoop.prototype.scheduleNextFrame = function() {
    var loopInterval,
      _this = this;
    if (this.forceUseOfTimeoutForScheduling) {
      if (this.wantedFramesPerSecond === this.AS_HIGH_FPS_AS_POSSIBLE) {
        return setTimeout((function() {
          return _this.animate();
        }), 1000 / 60);
      } else {
        return setTimeout((function() {
          return _this.animate();
        }), 1000 / this.wantedFramesPerSecond);
      }
    } else {
      if (this.wantedFramesPerSecond === this.AS_HIGH_FPS_AS_POSSIBLE) {
        return window.requestAnimationFrame(function() {
          return _this.animate();
        });
      } else {
        if (loopInterval === undefined) {
          return loopInterval = setInterval(function() {
            return window.requestAnimationFrame(function() {
              return this.animate();
            });
          }, 1000 / this.wantedFramesPerSecond);
        }
      }
    }
  };

  AnimationLoop.prototype.animate = function() {
    var DrawFunctionRunner;
    this.liveCodeLabCoreInstance.MatrixCommands.resetMatrixStack();
    this.liveCodeLabCoreInstance.SoundSystem.resetLoops();
    if (frame === 0) {
      this.liveCodeLabCoreInstance.TimeKeeper.resetTime();
    } else {
      this.liveCodeLabCoreInstance.TimeKeeper.updateTime();
    }
    this.liveCodeLabCoreInstance.DrawFunctionRunner.resetTrackingOfDoOnceOccurrences();
    this.liveCodeLabCoreInstance.SoundSystem.anyCodeReactingTobpm = false;
    this.liveCodeLabCoreInstance.SoundSystem.SetUpdatesPerMinute(60 * 4);
    this.liveCodeLabCoreInstance.LightSystem.noLights();
    this.liveCodeLabCoreInstance.GraphicsCommands.reset();
    this.liveCodeLabCoreInstance.BlendControls.animationStyle(this.liveCodeLabCoreInstance.BlendControls.animationStyles.normal);
    this.liveCodeLabCoreInstance.BackgroundPainter.resetGradientStack();
    if (this.liveCodeLabCoreInstance.DrawFunctionRunner.drawFunction) {
      this.scheduleNextFrame();
      try {
        this.liveCodeLabCoreInstance.DrawFunctionRunner.runDrawFunction();
      } catch (e) {
        this.eventRouter.trigger("runtime-error-thrown", e);
        return;
      }
      DrawFunctionRunner = this.liveCodeLabCoreInstance.DrawFunctionRunner;
      DrawFunctionRunner.putTicksNextToDoOnceBlocksThatHaveBeenRun(this.liveCodeLabCoreInstance.CodeTransformer);
    } else {
      this.liveCodeLabCoreInstance.dozingOff = true;
      frame = 0;
    }
    if (frame === 0) {
      this.liveCodeLabCoreInstance.TimeKeeper.resetTime();
    }
    this.liveCodeLabCoreInstance.BlendControls.animationStyleUpdateIfChanged();
    this.liveCodeLabCoreInstance.BackgroundPainter.simpleGradientUpdateIfChanged();
    this.liveCodeLabCoreInstance.SoundSystem.changeUpdatesPerMinuteIfNeeded();
    frame++;
    this.liveCodeLabCoreInstance.Renderer.render(this.liveCodeLabCoreInstance.GraphicsCommands);
    if (this.stats !== null) {
      return this.stats.update();
    }
  };

  return AnimationLoop;

})();

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
