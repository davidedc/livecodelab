###
## CodeCompiler takes the user sketch and turns it into an AST which
## is then turned into javascript
###

Parser = require '../../grammar/lcl'
JsCompiler = require '../../js/lcl/compiler'

class LiveLangCompiler

  # returns an object
  # {
  #   status: 'empty', 'error' or 'parsed'
  #   program: the program, if the status is parsed
  #   error: the error if there is one
  # }
  compileCode: (code, globalscope) ->

    output = {}

    try
      programAST = Parser.parse(
        code,
        {
          functionNames: globalscope.getFunctions(),
          inlinableFunctions: globalscope.getInlinables()
        }
      )
      jsProgram = JsCompiler.compile(programAST)
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
      output.program = jsProgram
    return output

module.exports = LiveLangCompiler

