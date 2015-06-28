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

CodePreprocessor     = require './code-preprocessor'
CoffeeScriptCompiler = require 'coffee-script'

class CodeCompiler
  currentCodeString: null
  codePreprocessor: null
  lastCorrectOutput: null

  whitespaceCheck: /^\s*$/

  constructor: (@eventRouter) ->
    # the code compiler needs the CodePreprocessor
    
    @codePreprocessor = new CodePreprocessor()
    #@codePreprocessor = new CodePreprocessor()


  compileCode: (code) ->

    @currentCodeString = code

    output = {}

    # we do a couple of special resets when
    # the code is the empty string.
    if @whitespaceCheck.test(code)
      output.status = 'empty'
      return output

    [code, error] = @codePreprocessor.preprocess code

    # if 'error' is anything else then undefined then it
    # means that the process of translation has found
    # some glaringly missing pieces. In which case,
    # we report the error and skip the coffeescript
    # to javascript translation step.
    if error?
      output.status = 'error'
      output.error = error
      return output

    try
      compiledOutput = CoffeeScriptCompiler.compile(code,
        bare: "on"
      )
    catch e
      # coffescript compiler has caught a syntax error.
      output.status = 'error'
      output.error = e
      return output

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

    output.status = 'parsed'
    output.program = functionFromCompiledCode
    @lastCorrectOutput = output

    return output

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
    
    # no need to recompile the code here
    # because it's already recompiled with the "emit" done just
    # above. The editor update triggers an updateCode and a
    # compileCode. So no need to do anything here, just
    # return the output program produced by the last compilation
    # cause it's up to date.
    return @lastCorrectOutput.program

module.exports = CodeCompiler

