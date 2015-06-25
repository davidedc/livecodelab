###
## V2CodeCompiler takes the user sketch and turns it into an AST.
## This is then run by the ProgramRunner.
###

Preprocessor = require '../../../js/lcl/preprocessor'
Parser       = require '../../../generated/parser'

class V2CodeCompiler

  constructor: () ->
    # the code compiler needs the CodePreprocessor

    @codePreprocessor = Preprocessor

    @parser = Parser.parser
    @parser.yy.parseError = (message, details) ->
      throw message

  # returns an object
  # {
  #   status: 'empty', 'error' or 'parsed'
  #   program: the program, if the status is parsed
  #   error: the error if there is one
  # }
  compileCode: (codeString) ->

    code = @codePreprocessor.process codeString

    output = {}

    # TODO
    # Currently the PreProcessor doesn't throw any meaningful errors
    # Will add all this back in when it does
    #
    # If 'error' is not null then it means that the preprocessing has
    # found an error. In which case, we report the error and skip the parsing.
    #if error?
    #  output.status = 'error'
    #  output.error = e
    #  return output

    try
      programAST = @parser.parse(code)
    catch e
      # parser has caught a syntax error.
      # we are going to display the error and we WON'T register the new code
      output.status = 'error'
      output.error = e
      return output

    if (programAST.length == 0)
      output.status = 'empty'
    else
      output.status = 'parsed'
      output.program = programAST
    return output

module.exports = V2CodeCompiler

