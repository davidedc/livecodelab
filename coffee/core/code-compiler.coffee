###
## CodeCompiler makes available the user sketch
## (written in simplified syntax) as a runnable javascript function.
## Also note that CodeCompiler might return a program
## that substituted the program passed as input.
## This is because doOnce statements get transformed by pre-prending a
## tick once they are run, which prevents them from being run again.
## Note that CodeCompiler doesn't run the user sketch, it just
## makes it available to the ProgramRunner.
###

define ['core/code-preprocessor', 'coffeescript'], (CodePreprocessor, CoffeescriptCompiler) ->

  class CodeCompiler
    currentCodeString: null
    codePreprocessor: null


    constructor: (@eventRouter, @liveCodeLabCoreInstance) ->
      # the code compiler needs the CodePreprocessor
      
      @codePreprocessor = new CodePreprocessor()
      #@codePreprocessor = new CodePreprocessor()


    updateCode: (code) ->
      @currentCodeString = code


      # we do a couple of special resets when
      # the code is the empty string.
      if code is ""
        @liveCodeLabCoreInstance.graphicsCommands.resetTheSpinThingy = true
        programHasBasicError = false
        @eventRouter.emit("clear-error")
        @liveCodeLabCoreInstance.drawFunctionRunner.consecutiveFramesWithoutRunTimeError = 0
        functionFromCompiledCode = new Function("")
        @liveCodeLabCoreInstance.drawFunctionRunner.setDrawFunction null
        @liveCodeLabCoreInstance.drawFunctionRunner.lastStableDrawFunction = null
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
      
      @liveCodeLabCoreInstance.drawFunctionRunner.consecutiveFramesWithoutRunTimeError = 0
      
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
      @liveCodeLabCoreInstance.drawFunctionRunner.setDrawFunction functionFromCompiledCode
      functionFromCompiledCode

    # this function is used externally after the code has been
    # run, so we need to attach it to the CodeCompiler object.
    addCheckMarksAndUpdateCodeAndNotifyChange: \
        (CodeCompiler, doOnceOccurrencesLineNumbers) ->
      elaboratedSource = undefined
      elaboratedSourceByLine = undefined
      drawFunction = undefined
      
      # if we are here, the following has happened: someone has added an element
      # to the doOnceOccurrencesLineNumbers array. This can only have happened
      # when a doOnce block is run, because we manipulate each doOnce block
      # so that in its first line the line number of the block is pushed into
      # the doOnceOccurrencesLineNumbers array.
      # So, the doOnceOccurrencesLineNumbers array contains all and only the lines
      # of each doOnce block that has been run. Which could be more than one,
      # because when we start the program we could have more than one
      # doOnce that has to run.
      elaboratedSource = @currentCodeString
      
      # we know the line number of each doOnce block that has been run
      # so we go there and add a tick next to each doOnce to indicate
      # that it has been run.
      elaboratedSourceByLine = elaboratedSource.split("\n")
      for eachLine in doOnceOccurrencesLineNumbers
        elaboratedSourceByLine[eachLine] =
          elaboratedSourceByLine[eachLine].replace(
            /(^|\s+)doOnce([ \t]*.*)$/gm, "$1✓doOnce$2")
      elaboratedSource = elaboratedSourceByLine.join("\n")
      
      # puts the new code (where the doOnce that have been executed have
      # tickboxes put back) in the editor. Which will trigger a re-registration
      # of the new code.
      @eventRouter.emit("code-updated-by-livecodelab", elaboratedSource)
      #alert elaboratedSource
      # we want to avoid that another frame is run with the old
      # code, as this would mean that the
      # runOnce code is run more than once,
      # so we need to register the new code.
      # TODO: ideally we don't want to register the
      # new code by getting the code from codemirror again
      # because we don't know what that entails. We should
      # just pass the code we already have.
      # Also updateCode() may split the source code by line, so we can
      # avoid that since we've just split it, we could pass
      # the already split code.
      drawFunction = @updateCode(elaboratedSource)
      drawFunction

