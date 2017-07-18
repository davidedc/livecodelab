###
## V2CodeCompiler takes the user sketch and turns it into an AST.
## This is then run by the ProgramRunner.
###

Parser = require '../../grammar/lcl'

class V2CodeCompiler

  constructor: () ->
    # the code compiler needs the CodePreprocessor

    @parser = Parser

  # returns an object
  # {
  #   status: 'empty', 'error' or 'parsed'
  #   program: the program, if the status is parsed
  #   error: the error if there is one
  # }
  compileCode: (code, globalscope) ->

    output = {}

    try
      programAST = @parser.parse(
        code,
        {
          functionNames: globalscope.getFunctions(),
          inlinableFunctions: globalscope.getInlinables()
        }
      )
    catch e
      # parser has caught a syntax error.
      # we are going to display the error and we WON'T register the new code
      output.status = 'error'
      output.error = e
      return output

    if (programAST.elements.length == 0)
      output.status = 'empty'
    else
      output.status = 'parsed'
      output.program = programAST
    return output

module.exports = V2CodeCompiler

