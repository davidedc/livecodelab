/*
## ProgramRunner manages the running function as it runs. E.g. this is not a
## translation step, this is managing things such as the actually running of the
## latest "stable" function and keeping track of when a function appears to be stable,
## and reinstating the last stable function if the current one throws a runtime error.
*/

var ProgramRunner;

ProgramRunner = (function() {
  "use strict";
  var consecutiveFramesWithoutRunTimeError, currentCodeString, doOnceOccurrencesLineNumbers, drawFunction, lastStableDrawFunction;

  doOnceOccurrencesLineNumbers = [];

  drawFunction = "";

  consecutiveFramesWithoutRunTimeError = 0;

  lastStableDrawFunction = null;

  currentCodeString = "";

  function ProgramRunner(eventRouter, liveCodeLabCoreInstance) {
    var _this = this;

    this.eventRouter = eventRouter;
    this.liveCodeLabCoreInstance = liveCodeLabCoreInstance;
    window.addDoOnce = function(a) {
      return _this.addDoOnce(a);
    };
  }

  ProgramRunner.prototype.addDoOnce = function(lineNum) {
    return this.doOnceOccurrencesLineNumbers.push(lineNum);
  };

  ProgramRunner.prototype.setDrawFunction = function(drawFunc) {
    return this.drawFunction = drawFunc;
  };

  ProgramRunner.prototype.resetTrackingOfDoOnceOccurrences = function() {
    return this.doOnceOccurrencesLineNumbers = [];
  };

  ProgramRunner.prototype.putTicksNextToDoOnceBlocksThatHaveBeenRun = function() {
    var codeTransformer;

    codeTransformer = this.liveCodeLabCoreInstance.codeTransformer;
    if (this.doOnceOccurrencesLineNumbers.length) {
      return this.setDrawFunction(codeTransformer.addCheckMarksAndUpdateCodeAndNotifyChange(codeTransformer, this.doOnceOccurrencesLineNumbers));
    }
  };

  ProgramRunner.prototype.runDrawFunction = function() {
    this.drawFunction();
    this.consecutiveFramesWithoutRunTimeError += 1;
    if (this.consecutiveFramesWithoutRunTimeError === 5) {
      this.lastStableDrawFunction = this.drawFunction;
      return this.eventRouter.trigger("livecodelab-running-stably");
    }
  };

  ProgramRunner.prototype.reinstateLastWorkingDrawFunction = function() {
    this.consecutiveFramesWithoutRunTimeError = 0;
    return this.drawFunction = this.lastStableDrawFunction;
  };

  return ProgramRunner;

})();
