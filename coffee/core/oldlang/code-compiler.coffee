###
## CodeCompiler makes available the user sketch
## (written in simplified syntax) as a runnable javascript function.
###

define ['core/oldlang/code-preprocessor', 'coffeescript'], (OldCodePreprocessor, CoffeescriptCompiler) ->

  class OldCodeCompiler
    currentCodeString: null
    codePreprocessor: null


    constructor: (@eventRouter, @liveCodeLabCoreInstance) ->
      # the code compiler needs the CodePreprocessor
      
      @codePreprocessor = new OldCodePreprocessor()


    updateCode: (code) ->
      @currentCodeString = code


      # we do a couple of special resets when
      # the code is the empty string.
      if code is ""
        @liveCodeLabCoreInstance.graphicsCommands.resetTheSpinThingy = true
        programHasBasicError = false
        @eventRouter.emit("clear-error")
        @liveCodeLabCoreInstance.programRunner.consecutiveFramesWithoutRunTimeError = 0
        functionFromCompiledCode = new Function("")
        @liveCodeLabCoreInstance.programRunner.setDrawFunction null
        @liveCodeLabCoreInstance.programRunner.lastStableDrawFunction = null
        return functionFromCompiledCode

      [code, error] = @codePreprocessor.preprocess code
      #console.log code


      # if 'error' is anything else then undefined then it
      # means that the process of translation has found
      # some glaringly missing pieces. In which case,
      # we report the error and skip the coffeescript
      # to javascript translation step.
      if error?
        @eventRouter.emit("compile-time-error-thrown", error)
        return
            
      #console.log code
      

      try
        compiledOutput = CoffeescriptCompiler.compile(code,
          bare: "on"
        )
      catch e
        # coffescript compiler has caught a syntax error.
        # we are going to display the error and we WON'T register
        # the new code
        @eventRouter.emit("compile-time-error-thrown", e)
        return
      #alert compiledOutput
      programHasBasicError = false
      @eventRouter.emit("clear-error")
      
      @liveCodeLabCoreInstance.programRunner.consecutiveFramesWithoutRunTimeError = 0
      
      # You might want to change the frame count from the program
      # just like you can in Processing, but it turns out that when
      # you ASSIGN a value to the frame variable inside
      # the coffeescript code, the coffeescript to javascript translator
      # declares a *local* frame variable, so changes to the frame
      # count get lost from one frame to the next.
      # TODO: There must be a way to tell coffeescript to accept
      # some variables as global, for the time being let's put
      # the cheap hack in place i.e. remove any local declaration that the
      # coffeescript to javascript translator inserts.
      compiledOutput = compiledOutput.replace(/var frame/, ";")

      # elegant way to not use eval
      functionFromCompiledCode = new Function(compiledOutput)
      @liveCodeLabCoreInstance.programRunner.setProgram functionFromCompiledCode
      functionFromCompiledCode

