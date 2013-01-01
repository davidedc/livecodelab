#jslint maxerr: 200, browser: true, devel: true, bitwise: true 

createDrawFunctionRunner = (eventRouter, liveCodeLabCoreInstance) ->
  "use strict"
  DrawFunctionRunner = {}
  
  # this array is used to keep track of all the instances of "doOnce" in the code
  # we need to keep this so we can put the ticks next to doOnce once that doOnce
  # block has run.
  doOnceOccurrencesLineNumbers = []
  
  # contains the draw function as a Function object. Never mind the
  # initialisation as an empty string.
  DrawFunctionRunner.drawFunction = ""
  DrawFunctionRunner.consecutiveFramesWithoutRunTimeError = 0
  
  # contains the last stable draw function as a Function object. Never mind the
  # initialisation as an empty string.
  DrawFunctionRunner.lastStableDrawFunction = null
  
  # contains the code that is meant to be run, as a string.
  # note that it might be impossible to run it because of errors, in which case
  # LiveCodeLab might be running an older version.
  DrawFunctionRunner.currentCodeString = ""
  
  # This is the function called from the compiled code to add the doOnce line
  window.addDoOnce = DrawFunctionRunner.addDoOnce = (lineNum) ->
    doOnceOccurrencesLineNumbers.push lineNum

  DrawFunctionRunner.setDrawFunction = (drawFunc) ->
    DrawFunctionRunner.drawFunction = drawFunc

  DrawFunctionRunner.resetTrackingOfDoOnceOccurrences = ->
    doOnceOccurrencesLineNumbers = []

  DrawFunctionRunner.putTicksNextToDoOnceBlocksThatHaveBeenRun = ->
    CodeTransformer = liveCodeLabCoreInstance.CodeTransformer
    if doOnceOccurrencesLineNumbers.length isnt 0
      DrawFunctionRunner.setDrawFunction \
        CodeTransformer.addCheckMarksAndUpdateCodeAndNotifyChange(
          CodeTransformer, doOnceOccurrencesLineNumbers
        )

  DrawFunctionRunner.runDrawFunction = ->
    
    # this invokation below could be throwing an error,
    # in which case the lines afterwards are not executed
    # and the exception is propagated to the callee of this function,
    # which is the main animation loop.
    DrawFunctionRunner.drawFunction()
    
    # if we are here it means that the draw function didn't generate
    # any runtime errors, so we increment a counter that tells how long
    # this program has been stable for.
    # Beyond 5 frames, we consider this program as "stable" and we save
    # it in a special variable.
    # This "stability" counter is obviously reset anytime the program is changed
    # so the new version too gets an opportunity to be tested and saved.
    DrawFunctionRunner.consecutiveFramesWithoutRunTimeError += 1
    if DrawFunctionRunner.consecutiveFramesWithoutRunTimeError is 5
      DrawFunctionRunner.lastStableDrawFunction = DrawFunctionRunner.drawFunction
      eventRouter.trigger "livecodelab-running-stably"

  DrawFunctionRunner.reinstateLastWorkingDrawFunction = ->
    
    # mark the program as flawed and register the previous stable one.
    DrawFunctionRunner.consecutiveFramesWithoutRunTimeError = 0
    DrawFunctionRunner.drawFunction = DrawFunctionRunner.lastStableDrawFunction

  DrawFunctionRunner