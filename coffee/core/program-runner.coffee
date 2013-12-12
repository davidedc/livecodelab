###
## ProgramRunner manages interpretation of the AST. E.g. this is not a
## translation step, this is managing things such as the actually running of the
## latest "stable" program, keeping track of when a program appears
## to be stable, and reinstating the last stable program if the current one
## throws a runtime error.
###

isFunction = (functionToCheck) ->
  getType = {}
  functionToCheck and getType.toString.call(functionToCheck) is "[object Function]"

define [
  'lib/lcl/interpreter'
], (
  Interpreter
) ->

  class ProgramRunner

    # contains the program AST
    program = []

    consecutiveFramesWithoutRunTimeError = 0

    # contains the code that is meant to be run, as a string.
    # note that it might be impossible to run it because of errors, in which case
    # LiveCodeLab might be running an older version.
    currentCodeString = ""
    
    # contains the last stable program AST
    lastStableProgram = []

    constructor: (@eventRouter, @liveCodeLabCoreInstance) ->

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
      if isFunction functionToBeRun
        functionToBeRun()

      if isFunction chainedFunction
        chainedFunction()

    setProgram: (programAST) ->
      @consecutiveFramesWithoutRunTimeError = 0
      @program = programAST


    runProgram: ->
      # this invokation below could be throwing an error,
      # in which case the lines afterwards are not executed
      # and the exception is propagated to the callee of this function,
      # which is the main animation loop.
      scope = {}
      Interpreter.run(program, scope)

      # if we are here it means that the interpreter didn't throw
      # any runtime errors, so we increment a counter that tracks how long
      # this program has been stable for.
      # Beyond 5 frames, we consider this program as "stable" and we save
      # it in a special variable.
      # This "stability" counter is obviously reset anytime the program is changed
      # so the new version too gets an opportunity to be tested and saved.
      @consecutiveFramesWithoutRunTimeError += 1
      if @consecutiveFramesWithoutRunTimeError is 5
        @lastStableProgram = @program
        @eventRouter.emit("livecodelab-running-stably")

    reinstateLastWorkingProgram: ->
      # mark the program as flawed and register the previous stable one.
      @consecutiveFramesWithoutRunTimeError = 0
      @program = @lastStableProgram

  ProgramRunner

