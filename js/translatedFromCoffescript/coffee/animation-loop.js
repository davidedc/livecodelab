/*
## The animation loop is the loop that make each "frame" happen,
## i.e. whatever happend every 30 to 60 times (or, indeed, "frames")
## per second - which is the following:
## * the next frame is scheduled
## * the current program (i.e. a draw() Function) is run
## * the background is repainted if it has changed from the previous frame
## * the new 3d scene is painted
## * the stats widget on the top right is updated to show
##   milliseconds taken by each loop frame.
##
## Note that the followings are NOT done as part of the animation loop:
## * Syntax checking of the program typed by the user
##   (that's checked only when it changed)
## * sound playing. That happens by its own series of timeouts
##   (as defined by the optional "bpm" command) separately from the
##   animation loop.
## * blinking of the cursor
##
## About the current Function being run:
## note that this might not be the Function corresponding to the very latest
## content of the editor, for two reasons:
## 1. the newest content of the editor might not be syntactically incorrect
## 2. even if it's syntactically correct it might not be "stable"
##    i.e. it might have thrown a runtime error
##    (for example used an undefined variable or function).
##
## Rather, the current draw() function is the latest program
## that is both syntactically correct and "stable" (or in the process of
## being proven stable).
## Stability of a program cannot be guaranteed, but LiveCodeLab heuristically
## considers as "stable" a program once it's able to run for 5 frames
## without throwing errors.
## If the program throws an error past this testing window, then LiveCodeLab
## currently has no further fallback, so the Function will be just run each
## frame and hope is that it has time to draw enough animation on the screen
## before it throws the error so that some kind of animation
## will still be playing.
## One could devise a mechanism by which a stack of stable functions
## is maintained, so each failing function of the stack would cause the
## previous one to become the current stable alternative.
## This would practically guarantee that there is a Function that
## is simple enough in the past that it would contain no runtime
## errors - unless a previous function has so dramatically borked the
## state of the entire system, but that would probably take some malice.
*/

var AnimationLoop;

AnimationLoop = (function() {
  AnimationLoop.prototype.loopInterval = null;

  AnimationLoop.prototype.wantedFramesPerSecond = null;

  AnimationLoop.prototype.liveCodeLabCoreInstance = void 0;

  AnimationLoop.prototype.AS_HIGH_FPS_AS_POSSIBLE = -1;

  AnimationLoop.prototype.noDrawFrame = false;

  AnimationLoop.prototype.fpsHistory = [10];

  function AnimationLoop(eventRouter, stats, liveCodeLabCoreInstance, forceUseOfTimeoutForScheduling) {
    this.eventRouter = eventRouter;
    this.stats = stats;
    this.liveCodeLabCoreInstance = liveCodeLabCoreInstance;
    this.forceUseOfTimeoutForScheduling = forceUseOfTimeoutForScheduling != null ? forceUseOfTimeoutForScheduling : false;
    this.wantedFramesPerSecond = this.AS_HIGH_FPS_AS_POSSIBLE;
    window.frame = 0;
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
        if (typeof loopInterval !== "undefined" && loopInterval !== null) {
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
    var beatRecurrence, currentTime, drawFunctionRunner, e, forbiddenZone, musicBeatStart, timeSinceMusicBeatStart;
    if (window.frame === 0) {
      this.liveCodeLabCoreInstance.timeKeeper.resetTime();
    } else {
      this.liveCodeLabCoreInstance.timeKeeper.updateTime();
    }
    forbiddenZone = Math.max.apply(Math, this.fpsHistory);
    currentTime = this.liveCodeLabCoreInstance.timeKeeper.milliseconds;
    musicBeatStart = this.liveCodeLabCoreInstance.soundSystem.startOfInterval;
    timeSinceMusicBeatStart = currentTime - musicBeatStart;
    beatRecurrence = this.liveCodeLabCoreInstance.soundSystem.beatRecurrence;
    if (timeSinceMusicBeatStart % beatRecurrence >= beatRecurrence - forbiddenZone * 2) {
      this.noDrawFrame = true;
    } else {
      this.noDrawFrame = false;
    }
    this.liveCodeLabCoreInstance.matrixCommands.resetMatrixStack();
    this.liveCodeLabCoreInstance.soundSystem.resetLoops();
    this.liveCodeLabCoreInstance.soundSystem.anyCodeReactingTobpm = false;
    this.liveCodeLabCoreInstance.drawFunctionRunner.resetTrackingOfDoOnceOccurrences();
    this.liveCodeLabCoreInstance.soundSystem.setUpdatesPerMinute(60 * 4);
    this.liveCodeLabCoreInstance.lightSystem.noLights();
    this.liveCodeLabCoreInstance.graphicsCommands.reset();
    this.liveCodeLabCoreInstance.blendControls.animationStyle(this.liveCodeLabCoreInstance.blendControls.animationStyles.normal);
    this.liveCodeLabCoreInstance.backgroundPainter.resetGradientStack();
    if (this.liveCodeLabCoreInstance.drawFunctionRunner.drawFunction) {
      this.scheduleNextFrame();
      try {
        this.liveCodeLabCoreInstance.drawFunctionRunner.runDrawFunction();
      } catch (_error) {
        e = _error;
        this.eventRouter.trigger("runtime-error-thrown", e);
        return;
      }
      drawFunctionRunner = this.liveCodeLabCoreInstance.drawFunctionRunner;
      drawFunctionRunner.putTicksNextToDoOnceBlocksThatHaveBeenRun(this.liveCodeLabCoreInstance.codeTransformer);
    } else {
      this.liveCodeLabCoreInstance.dozingOff = true;
      window.frame = 0;
    }
    if (frame === 0) {
      this.liveCodeLabCoreInstance.timeKeeper.resetTime();
    }
    this.liveCodeLabCoreInstance.blendControls.animationStyleUpdateIfChanged();
    this.liveCodeLabCoreInstance.backgroundPainter.simpleGradientUpdateIfChanged();
    this.liveCodeLabCoreInstance.soundSystem.changeUpdatesPerMinuteIfNeeded();
    window.frame++;
    if (!this.noDrawFrame || this.liveCodeLabCoreInstance.dozingOff) {
      this.liveCodeLabCoreInstance.renderer.render(this.liveCodeLabCoreInstance.graphicsCommands);
      this.fpsHistory.push((new Date().getMilliseconds()) - currentTime);
      if (this.fpsHistory.length > 60) {
        this.fpsHistory.shift();
      }
    }
    if (this.stats) {
      return this.stats.update();
    }
  };

  return AnimationLoop;

})();
