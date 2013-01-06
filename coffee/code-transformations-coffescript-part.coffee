addCoffescriptPartToCodeTransformer = (CodeTransformer, eventRouter, CoffeeCompiler, liveCodeLabCoreInstance) ->

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
  CodeTransformer.removeTickedDoOnce = (code) -> # was a preprocessing part
    newCode = undefined
    newCode = code.replace(/^(\s)*✓[ ]*doOnce[ ]*\-\>[ ]*$/gm, "$1if false")
    newCode = newCode.replace(/\u2713/g, "//")
    newCode

  CodeTransformer.updateCode = (updatedCodeAsString) ->
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
  	CodeTransformer.currentCodeString = updatedCodeAsString
  	if CodeTransformer.currentCodeString is ""
      liveCodeLabCoreInstance.GraphicsCommands.resetTheSpinThingy = true
      programHasBasicError = false
      eventRouter.trigger "clear-error"
      liveCodeLabCoreInstance.DrawFunctionRunner.consecutiveFramesWithoutRunTimeError = 0
      functionFromCompiledCode = new Function("")
      liveCodeLabCoreInstance.DrawFunctionRunner.setDrawFunction null
      liveCodeLabCoreInstance.DrawFunctionRunner.lastStableDrawFunction = null
      return functionFromCompiledCode
  	updatedCodeAsString = CodeTransformer.removeTickedDoOnce(updatedCodeAsString)
  	
  	#////////////////// Newer code checks
  	###
  	The CodeChecker will check for unbalanced brackets
  	and unfinished strings
  	
  	If any errors are found then we quit compilation here
  	and display an error message
  	###
  	
  	#
  	#        errResults = CodeChecker.parse(updatedCodeAsString);
  	#
  	#        if (errResults.err === true) {
  	#            eventRouter.trigger('compile-time-error-thrown', errResults.message);
  	#            return;
  	#        }
  	#
  	#
  	#        elaboratedSource = updatedCodeAsString;
  	#
  	#        elaboratedSource = preprocessingFunctions.postfixNotation(elaboratedSource);
  	#
  	#        elaboratedSource = preprocessingFunctions.fixTimesFunctions(elaboratedSource);
  	#
  	#        elaboratedSource = preprocessingFunctions.addDoOnceTracing(elaboratedSource);
  	#    
  	
  	#////////////////////////////////////
  	
  	#//////////////// Older code checks
  	
  	updatedCodeAsString = CodeTransformer.stripCommentsAndCheckBasicSyntax(updatedCodeAsString)
  	return if updatedCodeAsString is null
  	elaboratedSource = updatedCodeAsString
  	
  	# we make it so some common command forms can be used in postfix notation, e.g.
  	#   60 bpm
  	#   red fill
  	#   yellow stroke
  	#   black background
  	updatedCodeAsString = updatedCodeAsString.replace(/(\d+)[ ]+bpm(\s)/g, "bpm $1$2")
  	updatedCodeAsString = updatedCodeAsString.replace(/([a-zA-Z]+)[ ]+fill(\s)/g, "fill $1$2")
  	updatedCodeAsString = updatedCodeAsString.replace(/([a-zA-Z]+)[ ]+stroke(\s)/g, "stroke $1$2")
  	updatedCodeAsString = updatedCodeAsString.replace(/([a-zA-Z]+)[ ]+background(\s)/g, "background $1$2")
  	
  	# little trick. This is mangled up in the translation from coffeescript
  	# (1).times ->
  	# But this isn't:
  	# (1+0).times ->
  	# So here is the little replace.
  	# TODO: you should be a little smarter about the substitution of the draw method
  	# You can tell a method declaration because the line below is indented
  	# so you should check that.
  	
  	#updatedCodeAsString =  updatedCodeAsString.replace(/^([a-z]+[a-zA-Z0-9]+)\s*$/gm, "$1 = ->" );
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
  	updatedCodeAsString = updatedCodeAsString.replace(/(\d+)\s+times[ ]*\->/g, ";( $1 + 0).times ->")
  	updatedCodeAsString = CodeTransformer.addTracingInstructionsToDoOnceBlocks(updatedCodeAsString)
  	
  	# adding () to single tokens left on their own
  	updatedCodeAsString = updatedCodeAsString.replace(/^(\s*)([a-z]+[a-zA-Z0-9]*)[ ]*$/gm, "$1;$2()")
  	
  	# this takes care of when a token that it's supposed to be
  	# a function is inlined with something else e.g.
  	# doOnce frame = 0; box
  	# 2 times -> box
  	updatedCodeAsString = updatedCodeAsString.replace(/;\s*([a-z]+[a-zA-Z0-9]*)[ ]*([;\n]+)/g, ";$1()$2")
  	
  	# this takes care of when a token that it's supposed to be
  	# a function is inlined like so:
  	# 2 times -> box
  	updatedCodeAsString = updatedCodeAsString.replace(/\->\s*([a-z]+[a-zA-Z0-9]*)[ ]*([;\n]+)/g, ";$1()$2")
  	
  	# draw() could just be called by mistake and it's likely
  	# to be disastrous. User doesn't even have visibility of such method,
  	# why should he/she call it?
  	# TODO: call draw() something else that the user is not
  	# likely to use by mistake and take away this check.
  	if updatedCodeAsString.match(/[\s\+\;]+draw\s*\(/) or false
      programHasBasicError = true
      eventRouter.trigger "compile-time-error-thrown", "You can't call draw()"
      return
  	
  	# we don't want if and for to undergo the same tratment as, say, box
  	# so put those back to normal.
  	updatedCodeAsString = updatedCodeAsString.replace(/;(if)\(\)/g, ";$1")
  	updatedCodeAsString = updatedCodeAsString.replace(/;(else)\(\)/g, ";$1")
  	updatedCodeAsString = updatedCodeAsString.replace(/;(for)\(\)/g, ";$1")
  	updatedCodeAsString = updatedCodeAsString.replace(/\/\//g, "#")
  	
  	# Why do we have to match a non-digit non-letter?
  	# because we have to make sure that the keyword is "on its own"
  	# otherwise for example we interfere the replacements of "background" and "round"
  	# Checking whether the keyword is "on its own" avoid those interferences.
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(scale)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(rotate)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(move)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(rect)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(line)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(bpm)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(play)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(pushMatrix)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(popMatrix)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(resetMatrix)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(fill)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(noFill)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(stroke)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(noStroke)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(strokeSize)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(animationStyle)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(simpleGradient)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(background)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(color)(\s)+/g, "$1;$2$3")
  	
  	#updatedCodeAsString =  updatedCodeAsString.replace(/([^a-zA-Z0-9])(ambient)(\s)+/g, "$1;$2$3" );
  	#updatedCodeAsString =  updatedCodeAsString.replace(/([^a-zA-Z0-9])(reflect)(\s)+/g, "$1;$2$3" );
  	#updatedCodeAsString =  updatedCodeAsString.replace(/([^a-zA-Z0-9])(refract)(\s)+/g, "$1;$2$3" );
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(lights)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(noLights)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(ambientLight)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(pointLight)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(ball)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(ballDetail)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(peg)(\s)+/g, "$1;$2$3")
  	
  	# Calculation
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(abs)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(ceil)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(constrain)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(dist)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(exp)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(floor)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(lerp)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(log)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(mag)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(map)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(max)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(min)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(norm)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(pow)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(round)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(sq)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(sqrt)(\s)+/g, "$1;$2$3")
  	
  	# Trigonometry
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(acos)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(asin)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(atan)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(atan2)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(cos)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(degrees)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(radians)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(sin)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(tan)(\s)+/g, "$1;$2$3")
  	
  	# Random
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(random)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(randomSeed)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(noise)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(noiseDetail)(\s)+/g, "$1;$2$3")
  	updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(noiseSeed)(\s)+/g, "$1;$2$3")
  	
  	# you'd think that semicolons are OK anywhere before any command
  	# but coffee-script doesn't like some particular configurations - fixing those:
  	# the semicolon mangles the first line of the function definitions:
  	updatedCodeAsString = updatedCodeAsString.replace(/->(\s+);/g, "->$1")
  	
  	# the semicolon mangles the first line of if statements
  	updatedCodeAsString = updatedCodeAsString.replace(/(\sif\s*.*\s*);/g, "$1")
  	
  	# the semicolon mangles the first line of else if statements
  	updatedCodeAsString = updatedCodeAsString.replace(/(\s);(else\s*if\s*.*\s*);/g, "$1$2")
  	
  	# the semicolon mangles the first line of else statements
  	updatedCodeAsString = updatedCodeAsString.replace(/(\s);(else.*\s*);/g, "$1$2")
  	try
      compiledOutput = CodeTransformer.compiler.compile(updatedCodeAsString,
      	bare: "on"
      )
  	catch e
      # coffescript compiler has caught a syntax error.
      # we are going to display the error and we WON'T register
      # the new code
      eventRouter.trigger "compile-time-error-thrown", e
      return
  	#alert compiledOutput
  	programHasBasicError = false
  	eventRouter.trigger "clear-error"
  	
  	# see here for the deepest examination ever of "eval"
  	# http://perfectionkills.com/global-eval-what-are-the-options/
  	# note that exceptions are caught by the window.onerror callback
  	liveCodeLabCoreInstance.DrawFunctionRunner.consecutiveFramesWithoutRunTimeError = 0
  	
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
  	liveCodeLabCoreInstance.DrawFunctionRunner.setDrawFunction functionFromCompiledCode
  	functionFromCompiledCode

  # this function is used externally after the code has been
  # run, so we need to attach it to the CodeTransformer object.
  CodeTransformer.addCheckMarksAndUpdateCodeAndNotifyChange = (CodeTransformer, doOnceOccurrencesLineNumbers) ->
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
  	elaboratedSource = CodeTransformer.currentCodeString
  	
  	# we know the line number of each doOnce block that has been run
  	# so we go there and add a tick next to each doOnce to indicate
  	# that it has been run.
  	elaboratedSourceByLine = elaboratedSource.split("\n")
  	iteratingOverSource = 0
  	while iteratingOverSource < doOnceOccurrencesLineNumbers.length
      elaboratedSourceByLine[doOnceOccurrencesLineNumbers[iteratingOverSource]] = elaboratedSourceByLine[doOnceOccurrencesLineNumbers[iteratingOverSource]].replace(/^(\s*)doOnce([ ]*\->[ ]*.*)$/gm, "$1✓doOnce$2")
      iteratingOverSource += 1
  	elaboratedSource = elaboratedSourceByLine.join("\n")
  	
  	# puts the new code (where the doOnce that have been executed have
  	# tickboxes put back) in the editor. Which will trigger a re-registration
  	# of the new code.
  	eventRouter.trigger "code-updated-by-livecodelab", elaboratedSource
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
  	drawFunction = CodeTransformer.updateCode(elaboratedSource)
  	drawFunction

  CodeTransformer