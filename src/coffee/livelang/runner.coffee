###
## LiveLangRunner manages the running program.
## This primarily involves:
## * keeping track of when a function appears to be stable
## * reinstating the last stable function if the current one throws an error.
###

_ = require 'underscore'

class LiveLangRunner

  constructor: (@eventRouter, @codeCompiler, @globalScope) ->
    @reset()

  addToScope: (scope) ->

    scope.addFunction('doOnce', (a) => @doOnce(a))
    scope.addFunction('run', (a,b) => @run(a,b))

  doOnce: (block) ->
    @doOnceTriggered = true
    block()

  run: (functionToBeRun, chainedFunction) ->
    if _.isFunction functionToBeRun
      functionToBeRun()

    if _.isFunction chainedFunction
      chainedFunction()

  reset: () ->
    @programFunc = () -> {}
    @programText = ''
    @lastStableFunc = () -> {}
    @lastStableText = ''
    @consecutiveFramesWithoutRunTimeError = 0
    @doOnceTriggered = false

  setProgram: (newProgramFunc, newProgramText) ->
    @consecutiveFramesWithoutRunTimeError = 0
    @programFunc = newProgramFunc
    @programText = newProgramText

  runProgram: ->
    # Errors thrown by the drawFunction are handled by the main animation loop
    @programFunc()

    # Beyond 5 frames, we consider this program as "stable" and we save it
    @consecutiveFramesWithoutRunTimeError += 1
    if @consecutiveFramesWithoutRunTimeError is 5
      @lastStableFunc = @programFunc
      @lastStableText = @programText
      @eventRouter.emit("livecodelab-running-stably")

    if (@doOnceTriggered)
      @doOnceTriggered = false
      rewrittenSource = @programText.replace(/^(\s*)doOnce/gm, "$1✓doOnce")

      @eventRouter.emit("code-updated-by-livecodelab", rewrittenSource)

  runLastWorkingProgram: ->
    # Load the previous stable program
    @consecutiveFramesWithoutRunTimeError = 0
    @programFunc = @lastStableFunc
    @programText = @lastStableText

module.exports = LiveLangRunner
