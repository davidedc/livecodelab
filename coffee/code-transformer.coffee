###
## Although LiveCodeLab is ultimately running Javascript code behind the scenes,
## the user uses a simpler syntax which is basically coffeescript with a little bit of
## extra sugar. CodeTransformer takes care of translating this simplified syntax to
## Javascript. Also note that CodeTransformer might return a program that substituted
## the program passed as input. This is because doOnce statements get transformed by
## pre-prending a tick once they are run, which prevents them from being run again.
###

class CodeTransformer
  currentCodeString: null
  
  constructor: (@eventRouter, @CoffeeCompiler, @liveCodeLabCoreInstance) ->
    # note that this is not used anywhere for the time being.
    listOfPossibleFunctions = [
      "function"
      "alert"
      # Geometry
      "rect"
      "line"
      "box"
      "ball"
      "ballDetail"
      "peg"
      # Matrix manipulation
      "rotate"
      "move"
      "scale"
      "pushMatrix"
      "popMatrix"
      "resetMatrix"
      # Sound
      "bpm"
      "play"
      # Color and drawing styles
      "fill"
      "noFill"
      "stroke"
      "noStroke"
      "strokeSize"
      "animationStyle"
      "background"
      "simpleGradient"
      "colorMode"
      "color"
      # Lighting
      # "ambient""reflect" "refract"
      "lights"
      "noLights"
      "ambientLight"
      "pointLight"
      # Calculations
      "abs"
      "ceil"
      "constrain"
      "dist"
      "exp"
      "floor"
      "lerp"
      "log"
      "mag"
      "map"
      "max"
      "min"
      "norm"
      "pow"
      "round"
      "sq"
      "sqrt"
      # Trigonometry
      "acos"
      "asin"
      "atan"
      "atan2"
      "cos"
      "degrees"
      "radians"
      "sin"
      "tan"
      # Random
      "random"
      "randomSeed"
      "noise"
      "noiseDetail"
      "noiseSeed"
      # do once
      "addDoOnce"
    ]


  ###
  Stops ticked doOnce blocks from running
  
  doOnce statements which have a tick mark next to them
  are not run. This is achieved by replacing the line with
  the "doOnce" with "if false" or "//" depending on whether
  the doOnce is a multiline or an inline one, like so:
  ✓doOnce ->
  background 255
  fill 255,0,0
  ✓doOnce -> ball
  becomes:
  if false ->
  background 255
  fill 255,0,0
  //doOnce -> ball
  
  @param {string} code    the code to re-write
  
  @returns {string}
  ###
  removeTickedDoOnce: (code) ->
    newCode = undefined
    newCode = code.replace(/^(\s)*✓[ ]*doOnce[ ]*\-\>[ ]*$/gm, "$1if false")
    newCode = newCode.replace(/\u2713/g, "//")
    newCode

  addTracingInstructionsToDoOnceBlocks: (code) ->
    # ADDING TRACING INSTRUCTION TO THE DOONCE BLOCKS
    # each doOnce block is made to start with an instruction that traces whether
    # the block has been run or not. This allows us to put back the tick where
    # necessary, so the doOnce block is not run again.
    # Example - let's say one pastes in this code:
    #      doOnce ->
    #        background 255
    #        fill 255,0,0
    #
    #      doOnce -> ball
    #
    # it becomes:
    #      (1+0).times ->
    #        addDoOnce(1); background 255
    #        fill 255,0,0
    #
    #      ;addDoOnce(4);
    #      (1+0).times -> ball
    #    
    # So: if there is at least one doOnce
    #   split the source in lines
    #   add line numbers tracing instructions so we can track which ones have been run
    #   regroup the lines into a single string again
    #
    elaboratedSourceByLine = undefined
    iteratingOverSource = undefined
    if code.indexOf("doOnce") > -1
      
      #alert("a doOnce is potentially executable");
      elaboratedSourceByLine = code.split("\n")
      
      #alert('splitting: ' + elaboratedSourceByLine.length );
      for iteratingOverSource in [0...elaboratedSourceByLine.length]
        
        #alert('iterating: ' + iteratingOverSource );
        
        # add the line number tracing instruction to inline case
        elaboratedSourceByLine[iteratingOverSource] =
          elaboratedSourceByLine[iteratingOverSource].replace(
            /^(\s*)doOnce[ ]*\->[ ]*(.+)$/g,
            "$1;addDoOnce(" + iteratingOverSource + "); (1+0).times -> $2")
        
        # add the line number tracing instruction to multiline case
        if elaboratedSourceByLine[iteratingOverSource].match(/^(\s*)doOnce[ ]*\->[ ]*$/g)
          
          #alert('doOnce multiline!');
          elaboratedSourceByLine[iteratingOverSource] =
            elaboratedSourceByLine[iteratingOverSource].replace(
              /^(\s*)doOnce[ ]*\->[ ]*$/g, "$1(1+0).times ->")
          elaboratedSourceByLine[iteratingOverSource + 1] =
            elaboratedSourceByLine[iteratingOverSource + 1].replace(
              /^(\s*)(.+)$/g, "$1;addDoOnce(" + iteratingOverSource + "); $2")
      code = elaboratedSourceByLine.join("\n")
    
    #alert('soon after replacing doOnces'+code);
    code

  doesProgramContainStringsOrComments: (code) ->    
    # make a copy of the string because we are going to
    # slice it in the process.
    copyOfcode = code
    characterBeingExamined = undefined
    nextCharacterBeingExamined = undefined
    while copyOfcode.length
      characterBeingExamined = copyOfcode.charAt(0)
      nextCharacterBeingExamined = copyOfcode.charAt(1)
      if characterBeingExamined is "'" or
          characterBeingExamined is "\"" or
          (characterBeingExamined is "/" and
            (nextCharacterBeingExamined is "*" or
            nextCharacterBeingExamined is "/"))
        return true
      copyOfcode = copyOfcode.slice(1)

  stripCommentsAndCheckBasicSyntax: (code) ->
    codeWithoutComments = undefined
    codeWithoutStringsOrComments = undefined
    
    # check whether the program potentially
    # contains strings or comments
    # if it doesn't then we can do some
    # simple syntactic checks that are likely
    # to be much faster than attempting a
    # coffescript to javascript translation
    
    # let's do a quick check:
    # these groups of characters should be in even number:
    # ", ', (), {}, []
    # Note that this doesn't check nesting, so for example
    # [{]} does pass the test.
    if @doesProgramContainStringsOrComments(code)
      
      # OK the program contains comments and/or strings
      # so this is what we are going to do:
      # first we remove all the comments for good
      # then we create a version without the strings
      # so we can perform some basic syntax checking.
      # Note that when we remove the comments we also need to
      # take into account strings because otherwise we mangle a line like
      # print "frame/100 //"
      # where we need to now that that single comment is actually the content
      # of a string.
      # modified from Processing.js (search for: "masks strings and regexs")
      # this is useful to remove all comments but keeping all the strings
      # the difference is that here I don't treat regular expressions.
      # Note that string take precedence over comments i.e.
      # is a string, not half a string with a quote in a comment
      # get rid of the comments for good.
      # note the use of coffeescripts' "block regular expressions" here, and note that
      # there is no need to escape "/" with "\/",
      # see https://github.com/jashkenas/coffee-script/issues/2358
      code = code.replace(
        ///
        ("(?:[^"\\\n]|\\.)*")|
        ('(?:[^'\\\n]|\\.)*')|
        (//[^\n]*\n)|
        (/\*(?:(?!\*/)(?:.|\n))*\*/)
        ///g,
          (all, quoted, aposed, singleComment, comment) ->
            numberOfLinesInMultilineComment = undefined
            rebuiltNewLines = undefined
            cycleToRebuildNewLines = undefined
            
            # strings are kept as they are
            return quoted  if quoted
            return aposed  if aposed
            
            # preserve the line because
            # the doOnce mechanism needs to retrieve
            # the line where it was
            return "\n"  if singleComment
            
            # eliminate multiline comments preserving the lines
            numberOfLinesInMultilineComment = comment.split("\n").length - 1
            rebuiltNewLines = ""
            for cycleToRebuildNewLines in [0...numberOfLinesInMultilineComment]
              rebuiltNewLines = rebuiltNewLines + "\n"
            rebuiltNewLines
      )
      codeWithoutComments = code
      
      # ok now in the version we use for syntax checking we delete all the strings
      codeWithoutStringsOrComments =
        code.replace(/("(?:[^"\\\n]|\\.)*")|('(?:[^'\\\n]|\\.)*')/g, "")
    else
      codeWithoutStringsOrComments = code
    aposCount = 0
    quoteCount = 0
    roundBrackCount = 0
    curlyBrackCount = 0
    squareBrackCount = 0
    characterBeingExamined = undefined
    reasonOfBasicError = undefined
    while codeWithoutStringsOrComments.length
      characterBeingExamined = codeWithoutStringsOrComments.charAt(0)
      if characterBeingExamined is "'"
        aposCount += 1
      else if characterBeingExamined is "\""
        quoteCount += 1
      else if characterBeingExamined is "(" or characterBeingExamined is ")"
        roundBrackCount += 1
      else if characterBeingExamined is "{" or characterBeingExamined is "}"
        curlyBrackCount += 1
      else if characterBeingExamined is "[" or characterBeingExamined is "]"
        squareBrackCount += 1
      codeWithoutStringsOrComments = codeWithoutStringsOrComments.slice(1)
    
    # according to jsperf, the fastest way to check if number is even/odd
    if aposCount & 1 or quoteCount & 1 or roundBrackCount & 1 or
        curlyBrackCount & 1 or squareBrackCount & 1
      programHasBasicError = true
      reasonOfBasicError = "Missing '"  if aposCount & 1
      reasonOfBasicError = "Missing \""  if quoteCount & 1
      reasonOfBasicError = "Unbalanced ()"  if roundBrackCount & 1
      reasonOfBasicError = "Unbalanced {}"  if curlyBrackCount & 1
      reasonOfBasicError = "Unbalanced []"  if squareBrackCount & 1
      @eventRouter.trigger "compile-time-error-thrown", reasonOfBasicError
      return null
    
    # no comments or strings were found, just return the same string
    # that was passed
    code

  ###
  Some of the functions can be used with postfix notation
  
  e.g.
  
  60 bpm
  red fill
  yellow stroke
  black background
  
  We need to switch this round before coffee script compilation
  ###
  adjustPostfixNotations: (code) ->
    elaboratedSource = undefined
    elaboratedSource = code.replace(/(\d+)[ ]+bpm(\s)/g, "bpm $1$2")
    elaboratedSource = elaboratedSource.replace(/([a-zA-Z]+)[ ]+fill(\s)/g, "fill $1$2")
    elaboratedSource = elaboratedSource.replace(
      /([a-zA-Z]+)[ ]+stroke(\s)/g, "stroke $1$2")
    elaboratedSource = elaboratedSource.replace(
      /([a-zA-Z]+)[ ]+background(\s)/g, "background $1$2")
    elaboratedSource

  updateCode: (code) ->
  	elaboratedSource = undefined
  	errResults = undefined
  	characterBeingExamined = undefined
  	nextCharacterBeingExamined = undefined
  	aposCount = undefined
  	quoteCount = undefined
  	roundBrackCount = undefined
  	curlyBrackCount = undefined
  	squareBrackCount = undefined
  	elaboratedSourceByLine = undefined
  	iteratingOverSource = undefined
  	reasonOfBasicError = undefined
  	@currentCodeString = code
  	if @currentCodeString is ""
      @liveCodeLabCoreInstance.graphicsCommands.resetTheSpinThingy = true
      programHasBasicError = false
      @eventRouter.trigger "clear-error"
      @liveCodeLabCoreInstance.drawFunctionRunner.consecutiveFramesWithoutRunTimeError = 0
      functionFromCompiledCode = new Function("")
      @liveCodeLabCoreInstance.drawFunctionRunner.setDrawFunction null
      @liveCodeLabCoreInstance.drawFunctionRunner.lastStableDrawFunction = null
      return functionFromCompiledCode
  	code = @removeTickedDoOnce(code)
  	
  	#////////////////// Newer code checks
  	###
  	The CodeChecker will check for unbalanced brackets
  	and unfinished strings
  	
  	If any errors are found then we quit compilation here
  	and display an error message
  	###
  	
  	#
  	# errResults = CodeChecker.parse(code);
  	#
  	# if (errResults.err === true) {
  	#     @eventRouter.trigger('compile-time-error-thrown', errResults.message);
  	#     return;
  	# }
  	#
  	# elaboratedSource = code;
  	# elaboratedSource = preprocessingFunctions.adjustPostfixNotations(elaboratedSource);
  	# elaboratedSource = preprocessingFunctions.fixTimesFunctions(elaboratedSource);
  	# elaboratedSource = preprocessingFunctions.addDoOnceTracing(elaboratedSource);
  	
  	#////////////////////////////////////
  	
  	#//////////////// Older code checks
  	
  	code = @stripCommentsAndCheckBasicSyntax(code)
  	return if code is null
  	elaboratedSource = code
  	
  	# we make it so some common command forms can be used in postfix notation, e.g.
  	#   60 bpm
  	#   red fill
  	#   yellow stroke
  	#   black background
  	code = @adjustPostfixNotations(code);
  	
  	# little trick. This is mangled up in the translation from coffeescript
  	# (1).times ->
  	# But this isn't:
  	# (1+0).times ->
  	# So here is the little replace.
  	# TODO: you should be a little smarter about the substitution of the draw method
  	# You can tell a method declaration because the line below is indented
  	# so you should check that.
  	
  	# code =  code.replace(
  	#   /^([a-z]+[a-zA-Z0-9]+)\s*$/gm, "$1 = ->" );
  	# some replacements add a semicolon for the
  	# following reason: coffeescript allows you to split arguments
  	# over multiple lines.
  	# So if you have:
  	#   rotate 0,0,1
  	#   box
  	# and you want to add a scale like so:
  	#   scale 2,2,2
  	#   rotate 0,0,1
  	#   box
  	# What happens is that as you are in the middle of typing:
  	#   scale 2,
  	#   rotate 0,0,1
  	#   box
  	# coffeescript takes the rotate as the second argument of scale
  	# causing mayhem.
  	# Instead, all is good if rotate is prepended with a semicolon.
  	code =
  	  code.replace(/(\d+)\s+times[ ]*\->/g, ";( $1 + 0).times ->")
  	code =
  	  @addTracingInstructionsToDoOnceBlocks(code)
  	
  	# adding () to single tokens left on their own
  	code =
  	  code.replace(/^(\s*)([a-z]+[a-zA-Z0-9]*)[ ]*$/gm, "$1;$2()")
  	
  	# this takes care of when a token that it's supposed to be
  	# a function is inlined with something else e.g.
  	# doOnce frame = 0; box
  	# 2 times -> box
  	code =
  	  code.replace(/;\s*([a-z]+[a-zA-Z0-9]*)[ ]*([;\n]+)/g, ";$1()$2")
  	
  	# this takes care of when a token that it's supposed to be
  	# a function is inlined like so:
  	# 2 times -> box
  	code =
  	  code.replace(/\->\s*([a-z]+[a-zA-Z0-9]*)[ ]*([;\n]+)/g, ";$1()$2")
  	
  	# draw() could just be called by mistake and it's likely
  	# to be disastrous. User doesn't even have visibility of such method,
  	# why should he/she call it?
  	# TODO: call draw() something else that the user is not
  	# likely to use by mistake and take away this check.
  	if code.match(/[\s\+\;]+draw\s*\(/) or false
      programHasBasicError = true
      @eventRouter.trigger "compile-time-error-thrown", "You can't call draw()"
      return
  	
  	# we don't want if and for to undergo the same tratment as, say, box
  	# so put those back to normal.
  	code = code.replace(/;(if)\(\)/g, ";$1")
  	code = code.replace(/;(else)\(\)/g, ";$1")
  	code = code.replace(/;(for)\(\)/g, ";$1")
  	code = code.replace(/\/\//g, "#")
  	
  	# Why do we have to match a non-digit non-letter?
  	# because we have to make sure that the keyword is "on its own"
  	# otherwise for example we interfere the replacements of "background" and "round"
  	# Checking whether the keyword is "on its own" avoid those interferences.
  	code = code.replace(/([^a-zA-Z0-9])(scale)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(rotate)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(move)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(rect)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(line)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(bpm)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(play)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(pushMatrix)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(popMatrix)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(resetMatrix)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(fill)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(noFill)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(stroke)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(noStroke)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(strokeSize)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(animationStyle)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(simpleGradient)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(background)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(colorMode)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(color)(\s)+/g, "$1;$2$3")
  	
  	#code =  code.replace(/([^a-zA-Z0-9])(ambient)(\s)+/g, "$1;$2$3" );
  	#code =  code.replace(/([^a-zA-Z0-9])(reflect)(\s)+/g, "$1;$2$3" );
  	#code =  code.replace(/([^a-zA-Z0-9])(refract)(\s)+/g, "$1;$2$3" );
  	code = code.replace(/([^a-zA-Z0-9])(lights)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(noLights)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(ambientLight)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(pointLight)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(ball)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(ballDetail)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(peg)(\s)+/g, "$1;$2$3")
  	
  	# Calculation
  	code = code.replace(/([^a-zA-Z0-9])(abs)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(ceil)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(constrain)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(dist)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(exp)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(floor)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(lerp)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(log)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(mag)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(map)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(max)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(min)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(norm)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(pow)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(round)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(sq)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(sqrt)(\s)+/g, "$1;$2$3")
  	
  	# Trigonometry
  	code = code.replace(/([^a-zA-Z0-9])(acos)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(asin)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(atan)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(atan2)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(cos)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(degrees)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(radians)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(sin)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(tan)(\s)+/g, "$1;$2$3")
  	
  	# Random
  	code = code.replace(/([^a-zA-Z0-9])(random)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(randomSeed)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(noise)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(noiseDetail)(\s)+/g, "$1;$2$3")
  	code = code.replace(/([^a-zA-Z0-9])(noiseSeed)(\s)+/g, "$1;$2$3")
  	
  	# you'd think that semicolons are OK anywhere before any command
  	# but coffee-script doesn't like some particular configurations - fixing those:
  	# the semicolon mangles the first line of the function definitions:
  	code = code.replace(/->(\s+);/g, "->$1")
  	
  	# the semicolon mangles the first line of if statements
  	code = code.replace(/(\sif\s*.*\s*);/g, "$1")
  	
  	# the semicolon mangles the first line of else if statements
  	code = code.replace(/(\s);(else\s*if\s*.*\s*);/g, "$1$2")
  	
  	# the semicolon mangles the first line of else statements
  	code = code.replace(/(\s);(else.*\s*);/g, "$1$2")
  	try
      compiledOutput = @CoffeeCompiler.compile(code,
      	bare: "on"
      )
  	catch e
      # coffescript compiler has caught a syntax error.
      # we are going to display the error and we WON'T register
      # the new code
      @eventRouter.trigger "compile-time-error-thrown", e
      return
  	#alert compiledOutput
  	programHasBasicError = false
  	@eventRouter.trigger "clear-error"
  	
  	# see here for the deepest examination ever of "eval"
  	# http://perfectionkills.com/global-eval-what-are-the-options/
  	# note that exceptions are caught by the window.onerror callback
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
  	functionFromCompiledCode = new Function(compiledOutput)
  	@liveCodeLabCoreInstance.drawFunctionRunner.setDrawFunction functionFromCompiledCode
  	functionFromCompiledCode

  # this function is used externally after the code has been
  # run, so we need to attach it to the CodeTransformer object.
  addCheckMarksAndUpdateCodeAndNotifyChange: \
      (CodeTransformer, doOnceOccurrencesLineNumbers) ->
  	elaboratedSource = undefined
  	elaboratedSourceByLine = undefined
  	iteratingOverSource = undefined
  	drawFunction = undefined
  	
  	# if we are here, the following has happened: someone has added an element
  	# to the doOnceOccurrencesLineNumbers array. This can only have happened
  	# when a doOnce block is run, because we manipulate each doOnce block
  	# so that in its first line the line number of the block is pushed into
  	# the doOnceOccurrencesLineNumbers array.
  	# So, the doOnceOccurrencesLineNumbers array contains all and only the lines
  	# of each doOnce block that has been run. Which could be more than one, because
  	# when we start the program we could have more than one doOnce that has
  	# to run.
  	elaboratedSource = @currentCodeString
  	
  	# we know the line number of each doOnce block that has been run
  	# so we go there and add a tick next to each doOnce to indicate
  	# that it has been run.
  	elaboratedSourceByLine = elaboratedSource.split("\n")
  	for iteratingOverSource in doOnceOccurrencesLineNumbers
      elaboratedSourceByLine[iteratingOverSource] =
        elaboratedSourceByLine[iteratingOverSource].replace(
          /^(\s*)doOnce([ ]*\->[ ]*.*)$/gm, "$1✓doOnce$2")
  	elaboratedSource = elaboratedSourceByLine.join("\n")
  	
  	# puts the new code (where the doOnce that have been executed have
  	# tickboxes put back) in the editor. Which will trigger a re-registration
  	# of the new code.
  	@eventRouter.trigger "code-updated-by-livecodelab", elaboratedSource
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
