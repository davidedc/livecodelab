"use strict";

var DrawFunctionRunner;

DrawFunctionRunner = (function() {
  var consecutiveFramesWithoutRunTimeError, currentCodeString, doOnceOccurrencesLineNumbers, drawFunction, lastStableDrawFunction;

  doOnceOccurrencesLineNumbers = [];

  drawFunction = "";

  consecutiveFramesWithoutRunTimeError = 0;

  lastStableDrawFunction = null;

  currentCodeString = "";

  function DrawFunctionRunner(eventRouter, liveCodeLabCoreInstance) {
    var _this = this;
    this.eventRouter = eventRouter;
    this.liveCodeLabCoreInstance = liveCodeLabCoreInstance;
    window.addDoOnce = function(a) {
      return _this.addDoOnce(a);
    };
  }

  DrawFunctionRunner.prototype.addDoOnce = function(lineNum) {
    return this.doOnceOccurrencesLineNumbers.push(lineNum);
  };

  DrawFunctionRunner.prototype.setDrawFunction = function(drawFunc) {
    return this.drawFunction = drawFunc;
  };

  DrawFunctionRunner.prototype.resetTrackingOfDoOnceOccurrences = function() {
    return this.doOnceOccurrencesLineNumbers = [];
  };

  DrawFunctionRunner.prototype.putTicksNextToDoOnceBlocksThatHaveBeenRun = function() {
    var codeTransformer;
    codeTransformer = this.liveCodeLabCoreInstance.codeTransformer;
    if (this.doOnceOccurrencesLineNumbers.length !== 0) {
      return this.setDrawFunction(codeTransformer.addCheckMarksAndUpdateCodeAndNotifyChange(codeTransformer, this.doOnceOccurrencesLineNumbers));
    }
  };

  DrawFunctionRunner.prototype.runDrawFunction = function() {
    this.drawFunction();
    this.consecutiveFramesWithoutRunTimeError += 1;
    if (this.consecutiveFramesWithoutRunTimeError === 5) {
      this.lastStableDrawFunction = this.drawFunction;
      return this.eventRouter.trigger("livecodelab-running-stably");
    }
  };

  DrawFunctionRunner.prototype.reinstateLastWorkingDrawFunction = function() {
    this.consecutiveFramesWithoutRunTimeError = 0;
    return this.drawFunction = this.lastStableDrawFunction;
  };

  return DrawFunctionRunner;

})();
