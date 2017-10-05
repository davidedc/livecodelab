###
## LiveLangRunner manages the running program.
## This primarily involves:
## * keeping track of when a function appears to be stable
## * reinstating the last stable function if the current one throws an error.
###

_ = require 'underscore'

class LiveLangRunner

  constructor: (@eventRouter, @codeCompiler, @globalScope) ->
    @drawFunction = () -> {}
    @lastStableProgram = () -> {}
    @consecutiveFramesWithoutRunTimeError = 0

  addToScope: (scope) ->

    scope.addFunction('addDoOnce', (a) => @addDoOnce(a))
    scope.addFunction('run', (a,b) => @run(a,b))

  run: (functionToBeRun, chainedFunction) ->
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

  setProgram: (newDrawFunction) ->
    @consecutiveFramesWithoutRunTimeError = 0
    @drawFunction = newDrawFunction

  resetTrackingOfDoOnceOccurrences: ->
    @doOnceOccurrencesLineNumbers = []

  putTicksNextToDoOnceBlocksThatHaveBeenRun: ->
    # TODO

  runProgram: ->
    # Errors thrown by the drawFunction are handled by the main animation loop
    @drawFunction()

    # Beyond 5 frames, we consider this program as "stable" and we save it
    @consecutiveFramesWithoutRunTimeError += 1
    if @consecutiveFramesWithoutRunTimeError is 5
      @lastStableProgram = @drawFunction
      @eventRouter.emit("livecodelab-running-stably")

  runLastWorkingProgram: ->
    # Load the previous stable program
    @consecutiveFramesWithoutRunTimeError = 0
    @drawFunction = @lastStableProgram

module.exports = LiveLangRunner
