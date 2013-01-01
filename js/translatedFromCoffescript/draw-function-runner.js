var createDrawFunctionRunner;

createDrawFunctionRunner = function(eventRouter, liveCodeLabCoreInstance) {
  "use strict";

  var DrawFunctionRunner, doOnceOccurrencesLineNumbers;
  DrawFunctionRunner = {};
  doOnceOccurrencesLineNumbers = [];
  DrawFunctionRunner.drawFunction = "";
  DrawFunctionRunner.consecutiveFramesWithoutRunTimeError = 0;
  DrawFunctionRunner.lastStableDrawFunction = null;
  DrawFunctionRunner.currentCodeString = "";
  window.addDoOnce = DrawFunctionRunner.addDoOnce = function(lineNum) {
    return doOnceOccurrencesLineNumbers.push(lineNum);
  };
  DrawFunctionRunner.setDrawFunction = function(drawFunc) {
    return DrawFunctionRunner.drawFunction = drawFunc;
  };
  DrawFunctionRunner.resetTrackingOfDoOnceOccurrences = function() {
    return doOnceOccurrencesLineNumbers = [];
  };
  DrawFunctionRunner.putTicksNextToDoOnceBlocksThatHaveBeenRun = function() {
    var CodeTransformer;
    CodeTransformer = liveCodeLabCoreInstance.CodeTransformer;
    if (doOnceOccurrencesLineNumbers.length !== 0) {
      return DrawFunctionRunner.setDrawFunction(CodeTransformer.addCheckMarksAndUpdateCodeAndNotifyChange(CodeTransformer, doOnceOccurrencesLineNumbers));
    }
  };
  DrawFunctionRunner.runDrawFunction = function() {
    DrawFunctionRunner.drawFunction();
    DrawFunctionRunner.consecutiveFramesWithoutRunTimeError += 1;
    if (DrawFunctionRunner.consecutiveFramesWithoutRunTimeError === 5) {
      DrawFunctionRunner.lastStableDrawFunction = DrawFunctionRunner.drawFunction;
      return eventRouter.trigger("livecodelab-running-stably");
    }
  };
  DrawFunctionRunner.reinstateLastWorkingDrawFunction = function() {
    DrawFunctionRunner.consecutiveFramesWithoutRunTimeError = 0;
    return DrawFunctionRunner.drawFunction = DrawFunctionRunner.lastStableDrawFunction;
  };
  return DrawFunctionRunner;
};
