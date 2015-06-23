###
## ProgramRunner manages the running function as it runs. E.g. this is not a
## translation step, this is managing things such as the actually running of the
## latest "stable" function and keeping track of when a function appears
## to be stable, and reinstating the last stable function if the current one
## throws a runtime error.
###

_ = require 'underscore'

class ProgramRunner
  
  # this array is used to keep track of all the instances of "doOnce" in the
  # code we need to keep this so we can put the ticks next to doOnce once
  # that doOnce block has run.
  doOnceOccurrencesLineNumbers = []
  
  # contains the draw function as a Function object. Never mind the
  # initialisation as an empty string.
  drawFunction = ""
  
  consecutiveFramesWithoutRunTimeError = 0

  # contains the last stable draw function as a Function object. Never mind the
  # initialisation as an empty string.
  lastStableProgram = null

  # contains the code that is meant to be run, as a string.
  # note that it might be impossible to run it because of errors, in which case
  # LiveCodeLab might be running an older version.
  currentCodeString = ""
  
  constructor: (@eventRouter, @codeCompiler) ->

  addToScope: (scope) ->

    scope.add('addDoOnce', (a) => @addDoOnce(a))
    scope.add('run', (a,b) => @run(a,b))

  # the run function is used so one can write
  #   a = <box>
  #   run a
  # instead of
  #   a = <box>
  #   a()
  # Note that the pre-processor appends an arrow
  # after "run", so that
  #   run <box> 2
  # becomes
  #   
  run: (functionToBeRun, chainedFunction) ->
    # in the case "run <box> 2" the box is
    # already painted here.

    # in the case "run <box>"
    # we have to paint it now
    if _.isFunction functionToBeRun
      functionToBeRun()

    if _.isFunction chainedFunction
      chainedFunction()

  # This is the function called from the compiled code to add the doOnce line
  addDoOnce: (lineNum) ->
    @doOnceOccurrencesLineNumbers.push lineNum

  reset: () ->
    @consecutiveFramesWithoutRunTimeError = 0
    @drawFunction = () -> {}
    @lastStableProgram = () -> {}

  setProgram: (drawFunc) ->
    @consecutiveFramesWithoutRunTimeError = 0
    @drawFunction = drawFunc

  resetTrackingOfDoOnceOccurrences: ->
    @doOnceOccurrencesLineNumbers = []

  putTicksNextToDoOnceBlocksThatHaveBeenRun: ->
    codeCompiler = @codeCompiler
    if @doOnceOccurrencesLineNumbers.length
      p = codeCompiler.addCheckMarksAndUpdateCodeAndNotifyChange(
        codeCompiler, @doOnceOccurrencesLineNumbers
      )
      @setProgram(p)

  runProgram: ->
    # this invokation below could be throwing an error,
    # in which case the lines afterwards are not executed
    # and the exception is propagated to the callee of this function,
    # which is the main animation loop.
    @drawFunction()
    
    # if we are here it means that the draw function didn't generate
    # any runtime errors, so we increment a counter that tells how long
    # this program has been stable for.
    # Beyond 5 frames, we consider this program as "stable" and we save
    # it in a special variable.
    # This "stability" counter is obviously reset anytime the program is changed
    # so the new version too gets an opportunity to be tested and saved.
    @consecutiveFramesWithoutRunTimeError += 1
    if @consecutiveFramesWithoutRunTimeError is 5
      @lastStableProgram = @drawFunction
      @eventRouter.emit("livecodelab-running-stably")

  runLastWorkingProgram: ->
    # mark the program as flawed and register the previous stable one.
    @consecutiveFramesWithoutRunTimeError = 0
    @drawFunction = @lastStableProgram

module.exports = ProgramRunner

