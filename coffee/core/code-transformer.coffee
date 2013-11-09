###
## Although LiveCodeLab is ultimately running Javascript code behind the scenes,
## the user uses a simpler syntax which is basically coffeescript with a
## little bit of extra sugar.
## CodeTransformer takes care of translating this simplified syntax to
## Javascript. Also note that CodeTransformer might return a program
## that substituted the program passed as input.
## This is because doOnce statements get transformed by pre-prending a
## tick once they are run, which prevents them from being run again.
###

define () ->

  class CodeTransformer
    currentCodeString: null

    # We separate Statements from Expressions here.
    # Expressions return a value that is useful
    # for being further used.
    # Statements don't. Note that actually in
    # coffeescript everything returns a value,
    # only in our case we really don't know what to
    # do with return values of primitives.
    # The explanation of why we need this separation
    # is in the "implicit function" transformations
    # code below.
    listOfStatements: [
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
    ]

    listOfExpressions: [
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
      "wave"
      # Random
      "random"
      "randomSeed"
      "noise"
      "noiseDetail"
      "noiseSeed"
    ]

    constructor: (@eventRouter, @CoffeeCompiler, @liveCodeLabCoreInstance) ->

    ###
    ## Stops ticked doOnce blocks from running
    ##
    ## doOnce statements which have a tick mark next to them
    ## are not run. This is achieved by replacing the line with
    ## the "doOnce" with "if false" or "//" depending on whether
    ## the doOnce is a multiline or an inline one, like so:
    ##
    ##      ✓doOnce ->
    ##      background 255
    ##      fill 255,0,0
    ##      ✓doOnce -> ball
    ##      becomes:
    ##      if false ->
    ##      background 255
    ##      fill 255,0,0
    ##      //doOnce -> ball
    ##
    ## @param {string} code    the code to re-write
    ##
    ## @returns {string}
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
      #
      #      doOnce ->
      #        background 255
      #        fill 255,0,0
      #
      #      doOnce -> ball
      #
      # it becomes:
      #
      #      (1+0).times ->
      #        addDoOnce(1); background 255
      #        fill 255,0,0
      #
      #      ;addDoOnce(4);
      #      (1+0).times -> ball
      #
      # So: if there is at least one doOnce
      #   split the source in lines
      #   add line numbers tracing instructions so we can track which
      #   ones have been run regroup the lines into a single string again
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
          if /^(\s*)doOnce[ ]*\->[ ]*$/g.test(elaboratedSourceByLine[iteratingOverSource])
            
            #alert('doOnce multiline!');
            elaboratedSourceByLine[iteratingOverSource] =
              elaboratedSourceByLine[iteratingOverSource].replace(
                /^(\s*)doOnce[ ]*\->[ ]*$/g, "$1(1+0).times ->")
            elaboratedSourceByLine[iteratingOverSource + 1] =
              elaboratedSourceByLine[iteratingOverSource + 1].replace(
                /^(\s*)(.+)$/g, "$1addDoOnce(" + iteratingOverSource + "); $2")
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
        # note the use of coffeescripts' "block regular expressions" here,
        # and note that there is no need to escape "/" with "\/",
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
        
        # in the version we use for syntax checking we delete all the strings
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
    ## Some of the functions can be used with postfix notation
    ##
    ## e.g.
    ##
    ##      60 bpm
    ##      red fill
    ##      yellow stroke
    ##      black background
    ##
    ## We need to switch this round before coffee script compilation
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
      ## The CodeChecker will check for unbalanced brackets
      ## and unfinished strings
      ##
      ## If any errors are found then we quit compilation here
      ## and display an error message
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

      # allow some common command forms can be used in postfix notation, e.g.
      #   60 bpm
      #   red fill
      #   yellow stroke
      #   black background
      code = @adjustPostfixNotations(code)

      # if what we transform makes any sense at all, then
      # coffeescript will translate it for us and run it, which
      # in some cases we don't want.
      # We want to simply rule out some common cases here
      # so we don't need to make the regexpes too complicated
      # for example we want to avoid
      #   peg; times rotate box 2* wave
      # to become
      #   (peg()+0).times ->  rotate box 2* wave()
      # and run simply because we forgot a number
      if /^\s*times/gm.test(code) or
        /;\s*times/g.test(code) or
        /else\s+times/g.test(code) or
        /then\s+times/g.test(code)
          programHasBasicError = true
          @eventRouter.trigger "compile-time-error-thrown", "how many times?"
          return
      
      # little trick. This is mangled up in the translation to javascript
      # from the coffeescript translator:
      #   (1).times ->
      # But this isn't:
      #   (1+0).times ->
      # So here is the little replace.
      # ( see http://coffeescript.org/#try:%23%20incorrect%0A1.times%20-%3E%0A%20%20test%0A%0A%23%20incorrect%0A(1).times%20-%3E%0A%20%20test%0A%0A%23%20correct%0A(1%2B0).times%20-%3E%0A%20%20test%0A%0A%23%20correct%0An.times%20-%3E%0A%20%20test%0A )
      # TODO:
      # you should be a little smarter about the substitution of the draw method
      # You can tell a method declaration because the line below is indented
      # so you should check that.

      # note that [a-zA-Z1-9] prevents the times being on his own
      # without anything before it

      # else has to be matched before the then, and then the semicolon.
      # this is in order of specificity: the else dangles last so we match
      # that first. Then the "then"s. The semicolons separations are last.
      # example:
      #  if random > 0.5 then 3 times: rotate; box else 3 times rotate; 2 times: peg; wave
      # if you match the "then" first, then "; box else 3 times rotate; 2 times: peg; wave"
      # is matched and becomes 
      #  if random > 0.5 then 3 times: rotate; (box else 3+0).times ->  rotate; 2 times: peg; wave
      # which is not correct
      code = code.replace(/(else)\s+([a-zA-Z1-9])(.*?)[^\.]times[:]*(.*)/g, "$1 ($2$3+0).times -> $4")
      code = code.replace(/(then)\s+([a-zA-Z1-9])(.*?)[^\.]times[:]*(.*)/g, "$1 ($2$3+0).times -> $4")
      # the [^;]*? is to make sure that we don't take ; within the times argument
      # example:
      #  box; box ;  2 times: peg
      # if we don't exclude the semicolon form the times argument then we transform into
      #  box; (box ;  2+0).times ->  peg
      # which is not correct
      code = code.replace(/^(.*?)(;)\s*([a-zA-Z1-9])([^;\r\n]*?)[^\.\r\n]times[:]*(.*)$/gm, "$1$2 ($3$4+0).times -> $5")

      # last (catch all other cases where it captures everything
      # since the start of the line,
      # which is why you need to handle the other cases before):

      # the ^\r\n is to avoid matching a return, which would cause
      #   peg
      #   times
      #     box
      # to match ("p" as group 1, "eg[newline]" as group 2 and empty as group 3)
      # the ^; is to avoid this matching:
      #   peg; times rotate box 2* wave (group1: p group2: eg; group3: rot...wave)
      code = code.replace(/^(\s*)([a-zA-Z1-9])(.*?)[^;\r\n\.]times[:]*(.*)$/gm, "$1($2$3+0).times -> $4")


      
      # code =  code.replace(
      #   /^([a-z]+[a-zA-Z0-9]+)\s*$/gm, "$1 = ->" );

      # Note that coffeescript allows you to split arguments
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
      # This doesn't seem to be a problem, but worth noting.


      # Each doBlock, when run, pushes its own line number to a particular
      # array. It leaves traces of which doOnce block has been run and
      # where exactly it is so that we can go back and mark it with a tick
      # (which prevents a second run to happen, as the tickmarks expand into
      # line comments).
      code = @addTracingInstructionsToDoOnceBlocks(code)

      listOfStatements = @listOfStatements.join "|"
      listOfExpressions = @listOfExpressions.join "|"
      listOfLCLKeywords = listOfStatements + "|" + listOfExpressions

      
      # adding () to single tokens on their own at the start of a line
      # ball
      rx = RegExp("^(\\s*)("+listOfLCLKeywords+")[ ]*$",'gm');
      code = code.replace(rx, "$1$2();")


      # adding () to single tokens at the start of the line
      # followed by a semicolon (might be followed by more instructions)
      # ball;
      # ball; somethingelse
      rx = RegExp("^(\\s*)("+listOfLCLKeywords+")[ ]*;",'gm');
      code = code.replace(rx, "$1$2();")

      # adding () to any functions not at the beginning of a line
      # and followed by a anything that might end the command
      # eg semicolon, closing parenthesis, math sign, etc.
      #   something;ball
      #   something;ball;
      #   something;ball;ball
      #   something;ball;ball;
      #   ✓doOnce -> ball; background red
      #   if ball then ball else something
      #   box wave
      #   box wave(wave)
      # Why do we handle Statements differently from expressions?
      # cause they have different delimiters
      # I expect
      #   wave -1
      # to be transformed into
      #   wave() -1
      # but I don't want
      #   box -1
      # to turn into box() -1
      delimitersForStatements = ":|;|\\,|\\?|\\)|//|\\#|\\selse|\\sthen"
      delimitersForExpressions = delimitersForStatements + "|" + "\\+|-|\\*|/|%|&|]|<|>|=|\\|"
      rx = RegExp("([^a-zA-Z0-9])("+listOfStatements+")[ \\t]*("+delimitersForStatements+")",'g');
      code = code.replace(rx, "$1$2()$3")
      rx = RegExp("([^a-zA-Z0-9])("+listOfExpressions+")[ \\t]*("+delimitersForExpressions+")",'g');
      code = code.replace(rx, "$1$2()$3")

      #box 0.5,2
      #box; rotate; box
      #if random() > 0.5 then box 0.2,3; ball; background red
      #if ball then ball if true then 0 else 1
      #ball if true then 0 else 1
      
      # tokens at the end of the line (without final semicolon,
      # if there is a final semicolon it's handled by previous case)
      # doOnce frame = 0; box
      # if random() > 0.5 then box
      # 2 times -> box
      # 2 times -> rotate; box
      rx = RegExp("([^a-zA-Z0-9])("+listOfLCLKeywords+")[ \\t]*$",'gm');
      code = code.replace(rx, "$1$2()")
      
      
      # draw() could just be called by mistake and it's likely
      # to be disastrous. User doesn't even have visibility of such method,
      # why should he/she call it?
      # TODO: call draw() something else that the user is not
      # likely to use by mistake and take away this check.
      if /[\s\+\;]+draw\s*\(/.test(code)
        programHasBasicError = true
        @eventRouter.trigger "compile-time-error-thrown", "You can't call draw()"
        return
      
      # allows // for comments
      # the hash is more difficult to write
      code = code.replace(/\/\//g, "#")
      #console.log code
      

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
      # of each doOnce block that has been run. Which could be more than one,
      # because when we start the program we could have more than one
      # doOnce that has to run.
      elaboratedSource = @currentCodeString
      
      # we know the line number of each doOnce block that has been run
      # so we go there and add a tick next to each doOnce to indicate
      # that it has been run.
      elaboratedSourceByLine = elaboratedSource.split("\n")
      for iteratingOverSource in doOnceOccurrencesLineNumbers
        elaboratedSourceByLine[iteratingOverSource] =
          elaboratedSourceByLine[iteratingOverSource].replace(
            /^(\s*)doOnce([ \t]*\->[ \t]*.*)$/gm, "$1✓doOnce$2")
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

  CodeTransformer

### Tests for "times"

6 times: rotate box

6 times: rotate; box

6 times:
  rotate box

// should give error
peg
times
  box 2

// should give error
times
  box

1+1 times: rotate; box

// should give error
peg; times rotate box 2* wave

peg; 2 times rotate box 2* wave

n = 2; n times: rotate;box

box; box ;  2 times: rotate; peg 1.3

if random > 0.5 then 3 times: rotate; box else 3 times rotate; 2 times: peg; true

if true then 3 times rotate; box

// should give error
if true then  times do that

(9+0).times -> rotate; box

if random() > 0.5 then rotate; box else 3 times rotate; peg; true

// should give error
if random() > 0.5 then rotate; box else times rotate; peg; true

5 times
  rotate 0,1,time/5000
  move 0.2,0,0
  3 times
    rotate 1
    box

// testing whether mangled accross multiple lines
if random() > 0.5 then box
2 times: box
2 times: rotate; box

// testing whether mangled accross multiple lines
6 times: rotate; box
6 times:
  rotate box

// tests for the implicit functions
ab
box
2 times rotate box wave; wave
box + box
wave wave wave
if wave then box wave else wave
if wave then box + wave else wave
wave
wave + wave
;wave
;wave;
if random() > 0.5 then box
2 times: box
2 times: rotate; box
2 times rotate box wave
rotate box 2,33
box wave
box wave 3
2 times: rotate box wave
if rotate wave then rotate wave else rotate wave

2 times: move; rotate wave; box


###

