###
## CodeCompiler takes the user sketch and turns it into an AST.
## This is then run by the ProgramRunner.
###

define [
   'lib/lcl/preprocessor'
  ,'lib/lcl/parser'
], (
   Preprocessor
  ,Parser
) ->

  class CodeCompiler

    currentCodeString: null
    codePreprocessor: null

    constructor: (@eventRouter, @liveCodeLabCoreInstance) ->
      # the code compiler needs the CodePreprocessor

      @codePreprocessor = Preprocessor

      @parser = Parser
      @parser.yy.parseError = (message, details) ->
        console.log(details)
        throw message

    updateCode: (codeString) ->
      @currentCodeString = codeString

      code = @codePreprocessor.process codeString

      # we do a couple of special resets when the code is an empty string.
      if code is ""
        @liveCodeLabCoreInstance.graphicsCommands.resetTheSpinThingy = true
        @eventRouter.emit("clear-error")


      # TODO
      # Currently the PreProcessor doesn't throw any meaningful errors
      # Will add all this back in when it does
      #
      # If 'error' is not null then it means that the preprocessing has
      # found an error. In which case, we report the error and skip the parsing.
      #if error?
      #  @eventRouter.emit("compile-time-error-thrown", error)
      #  return

      try
        programAST = @parser.parse(code)
      catch e
        # parser has caught a syntax error.
        # we are going to display the error and we WON'T register the new code
        console.log(code)
        @eventRouter.emit("compile-time-error-thrown", e)
        return

      @eventRouter.emit("clear-error")

      @liveCodeLabCoreInstance.programRunner.setProgram programAST

