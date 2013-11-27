###
## CodePreprocessor takes care of translating the simplified syntax
## of livecodelb to a coffeescript that is degestible by the
## coffeescript compiler.
## This pre-processing step can raise some errors - which are
## returned in a dedicated variable.
###

detailedDebug = false

define ['core/code-preprocessor-tests'], (CodePreprocessorTests) ->

  class CodePreprocessor

    testCases: null

    # qualifiers are special keywords that make
    # it easy to change qualities of some
    # primitives without affecting the
    # primitives that come afterwards.
    qualifierKeywords: [
      # the first one is the qualifier keyword,
      # the next one is the command that will replace
      # it, the last two are the commands that are added
      # at the beginning of the sequence of primitives
      # and the end to push and pop the state, so that
      # the primitives that come *afterwards* are unaffected
      "rotating", "rotate", "pushMatrix()", "popMatrix()"
      "moving", "move", "pushMatrix()", "popMatrix()"
      "scaling", "scale", "pushMatrix()", "popMatrix()"
    ]
    # We separate Commands from Expressions here.
    # Expressions return a value that is potentially
    # useful, while Stataments just change some sort
    # of state but don't return anything useful.
    # For example you can say
    #   wave + 1; scale wave
    # but not
    #   box + 1; scale box
    # hence, wave is an expression while box is
    # a command.
    # Note that actually in
    # coffeescript everything returns a value,
    # only in our case we really don't know what to
    # do with return values of many functions.
    # The explanation of why we need this separation
    # is in the "implicit function" transformations
    # code.
    scaleRotateMoveCommands: [
      # scale rotate move
      "rotate"
      "move"
      "scale"
    ]
    commandsExcludingScaleRotateMove: [
      # Geometry
      "rect"
      "line"
      "box"
      "ball"
      "ballDetail"
      "peg"
      # Matrix manipulation other than scale rotate move
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
      # Lighting
      # "ambient""reflect" "refract"
      "lights"
      "noLights"
      "ambientLight"
      "pointLight"
      # Server connections
      "connect"
    ]

    expressions: [
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
      "beat"
      "pulse"
      # Random
      "random"
      "randomSeed"
      "noise"
      "noiseDetail"
      "noiseSeed"
      # Color
      "color"
    ]

    constructor: ->
      @testCases = (new CodePreprocessorTests()).testCases
      @scaleRotateMoveCommandsRegex = @scaleRotateMoveCommands.join "|"
      @allCommandsRegex = (@commandsExcludingScaleRotateMove.join "|") + "|" + @scaleRotateMoveCommandsRegex
      @expressionsRegex = @expressions.join "|"
      # make the preprocessor tests easily accessible from
      # the debug console (just type testPreprocessor())
      window.testPreprocessor = => @test()

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
    removeTickedDoOnce: (code, error) ->
      # if there is an error, just propagate it
      return [undefined, error] if error?

      code = code.replace(/^(\s)*✓[ ]*doOnce[ ]*\-\>[ ]*$/gm, "$1if false")
      code = code.replace(/\u2713/g, "//")
      return [code, error]

    addTracingInstructionsToDoOnceBlocks: (code, error) ->
      # if there is an error, just propagate it
      return [undefined, error] if error?

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
      #      1.times ->
      #        addDoOnce(1); background 255
      #        fill 255,0,0
      #
      #      ;addDoOnce(4);
      #      1.times -> ball
      #
      # So: if there is at least one doOnce
      #   split the source in lines
      #   add line numbers tracing instructions so we can track which
      #   ones have been run regroup the lines into a single string again
      #
      elaboratedSourceByLine = undefined
      if code.indexOf("doOnce") > -1
        
        #alert("a doOnce is potentially executable")
        elaboratedSourceByLine = code.split("\n")
        
        #alert('splitting: ' + elaboratedSourceByLine.length )
        for eachLine in [0...elaboratedSourceByLine.length]
          
          #alert('iterating: ' + eachLine )
          
          # add the line number tracing instruction to inline case
          elaboratedSourceByLine[eachLine] =
            elaboratedSourceByLine[eachLine].replace(
              /^(\s*)doOnce[ ]*\->[ ]*(.+)$/g,
              "$1;addDoOnce(" + eachLine + "); 1.times -> $2")
          
          # add the line number tracing instruction to multiline case
          if /^(\s*)doOnce[ ]*\->[ ]*$/g.test(elaboratedSourceByLine[eachLine])
            
            #alert('doOnce multiline!')
            elaboratedSourceByLine[eachLine] =
              elaboratedSourceByLine[eachLine].replace(
                /^(\s*)doOnce[ ]*\->[ ]*$/g, "$11.times ->")
            elaboratedSourceByLine[eachLine + 1] =
              elaboratedSourceByLine[eachLine + 1].replace(
                /^(\s*)(.+)$/g, "$1addDoOnce(" + eachLine + "); $2")
        code = elaboratedSourceByLine.join("\n")
      
      #alert('soon after replacing doOnces'+code)
      return [code, error]

    doesProgramContainStringsOrComments: (code) ->
      characterBeingExamined = undefined
      nextCharacterBeingExamined = undefined
      while code.length
        characterBeingExamined = code.charAt(0)
        nextCharacterBeingExamined = code.charAt(1)
        if characterBeingExamined is "'" or
            characterBeingExamined is "\"" or
            (characterBeingExamined is "/" and
              (nextCharacterBeingExamined is "*" or
              nextCharacterBeingExamined is "/"))
          return true
        code = code.slice(1)

    stripCommentsAndStrings: (code, error) ->
      # if there is an error, just propagate it
      return [undefined, undefined, error] if error?

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
        #   "lorem ipsum //"
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
        codeWithoutComments = code

      return [codeWithoutComments, codeWithoutStringsOrComments, error]

    checkBasicSyntax: (code, codeWithoutStringsOrComments, error) ->
      # if there is an error, just propagate it
      return [undefined, error] if error?


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
        return [undefined,reasonOfBasicError]
      
      # no comments or strings were found, just return the same string
      # that was passed
      return [code, error]

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
    adjustPostfixNotations: (code, error) ->
      # if there is an error, just propagate it
      return [undefined, error] if error?

      # red background
      # red fill;box

      # if there is an error, just propagate it
      return [undefined, error] if error?

      code = code.replace(/(\d+)[ ]+bpm(\s|$|;)/g, "bpm $1$2")
      code = code.replace(/([a-zA-Z]+)[ ]+fill(\s|$|;)/g, "fill $1$2")
      code = code.replace(/([a-zA-Z]+)[ ]+stroke(\s|$|;)/g, "stroke $1$2")
      code = code.replace(/([a-zA-Z]+)[ ]+background(\s|$|;)/g, "background $1$2")
      return [code, error]

    normaliseCode:(code, error) ->
      # if there is an error, just propagate it
      return [undefined, error] if error?

      #code = code.replace(/;[ ]+/gm, "; ")
      code = code.replace(/[ ];/gm, "; ")
      code = code.replace(/;$/gm, "")
      code = code.replace(/;([^ \r\n])/gm, "; $1")
      return [code, error]

    checkBasicErrorsWithTimes:(code, error) ->
      # if there is an error, just propagate it
      return [undefined, error] if error?

      # if what we transform makes any sense *at all*, then
      # coffeescript will translate it to js and run it, which
      # in some cases we don't want.
      # We want to simply rule out some common cases here
      # so we don't need to make the regexpes too complicated
      # For example we want to avoid
      #   peg; times rotate box 2* wave
      # to become
      #   (peg()).times ->  rotate box 2* wave()
      # and run simply because we forgot a number in front
      # of 'times'

      if /^\s*times/gm.test(code) or
        /;\s*times/g.test(code) or
        /else\s+times/g.test(code) or
        /then\s+times/g.test(code)
          programHasBasicError = true
          return [undefined, "how many times?"]
      return [code, error]

    transformTimesSyntax: (code, error) ->
      # if there is an error, just propagate it
      return [undefined, error] if error?

      if detailedDebug then console.log "transformTimesSyntax-0\n" + code + " error: " + error
      code = code.replace(/(else)\s+([a-zA-Z1-9])([^;\r\n]*) times[:]?([^a-zA-Z0-9])/g, "$1 ($2$3).times -> $4")
      code = code.replace(/(then)\s+([a-zA-Z1-9])([^;\r\n]*) times[:]?([^a-zA-Z0-9])/g, "$1 ($2$3).times -> $4")

      # the [^;\r\n]*? is to make sure that we don't take ; within the times argument
      # example:
      #  box; box ;  2 times: peg
      # if we don't exclude the semicolon form the times argument then we transform into
      #  box; (box ;  2).times ->  peg
      # which is not correct
      if detailedDebug then console.log "transformTimesSyntax-1\n" + code + " error: " + error
      code = code.replace(/;[ \t]*([a-zA-Z1-9])([^;\r\n]*?) times[:]?([^a-zA-Z0-9])/g, "; ($1$2).times -> $3")


      # takes care of cases like myFunc = -> 20 times rotate box
      if detailedDebug then console.log "transformTimesSyntax-2\n" + code + " error: " + error
      code = code.replace(/(->)\s+([a-zA-Z1-9])(.*?) times[:]?([^a-zA-Z0-9])/g, "$1 ($2$3).times -> $4")


      # last (catch all other cases where it captures everything
      # since the start of the line,
      # which is why you need to handle the other cases before):
      # the ^; is to avoid this matching:
      #   peg; times rotate box 2* wave (group1: p group2: eg; group3: rot...wave)
      code = code.replace(/([a-zA-Z1-9])(.*?) times[:]?([^a-zA-Z0-9])/g, "($1$2).times -> $3")
      if detailedDebug then console.log "transformTimesSyntax-3\n" + code + " error: " + error

      return @normaliseCode(code, error)

    markFunctionalReferences: (code, error, userDefinedFunctions) ->
      # if there is an error, just propagate it
      return [undefined, error] if error?

      expressionsAndUserDefinedFunctionsRegex = @expressionsRegex + userDefinedFunctions
      allFunctionsRegex = @allCommandsRegex + "|" + expressionsAndUserDefinedFunctionsRegex

      rx = RegExp("<[\\s]*("+allFunctionsRegex+")[\\s]*>",'g')
      code = code.replace(rx, "MARKED$1")

      return [code, error]

    unmarkFunctionalReferences: (code, error, userDefinedFunctions) ->
      # if there is an error, just propagate it
      return [undefined, error] if error?

      expressionsAndUserDefinedFunctionsRegex = @expressionsRegex + userDefinedFunctions
      allFunctionsRegex = @allCommandsRegex + "|" + expressionsAndUserDefinedFunctionsRegex

      rx = RegExp("MARKED("+allFunctionsRegex+")",'g')
      code = code.replace(rx, "$1")

      # TODO this shouldn't be here
      # replace stuff like (box 3).times -> into box(); 3.times
      rx = RegExp("\\(("+@allCommandsRegex+") ",'g');
      code = code.replace(rx, "$1(); (")
      if detailedDebug then console.log "unmarkFunctionalReferences-0\n" + code + " error: " + error

      code = code.replace(/->;/gm, "->")
      if detailedDebug then console.log "unmarkFunctionalReferences-1\n" + code + " error: " + error

      # transform stuff like (3).times and (n).times
      # into 3.times and n.times
      code = code.replace(/\(\s*(\d+|[$A-Z_][0-9A-Z_$]*)\s*\)\.times/gi, "$1.times")

      code = code.replace(/->[ ]+/g, "-> ")

      return [code, error]
    
    adjustImplicitCalls: (code, error, userDefinedFunctions) ->
      # if there is an error, just propagate it
      return [undefined, error] if error?

      expressionsAndUserDefinedFunctionsRegex = @expressionsRegex + userDefinedFunctions
      allFunctionsRegex = @allCommandsRegex + "|" + expressionsAndUserDefinedFunctionsRegex

      
      # adding () to single tokens on their own at the start of a line
      # ball
      if detailedDebug then console.log "adjustImplicitCalls-1\n" + code + " error: " + error
      rx = RegExp("^([ \\t]*)("+allFunctionsRegex+")[ ]*$",'gm')
      code = code.replace(rx, "$1$2();")
      if detailedDebug then console.log "adjustImplicitCalls-2\n" + code + " error: " + error


      # adding () to single tokens at the start of the line
      # followed by a semicolon (might be followed by more instructions)
      # ball;
      # ball; somethingelse
      rx = RegExp("^([ \\t]*)("+allFunctionsRegex+")[ ]*;",'gm')
      code = code.replace(rx, "$1$2();")
      if detailedDebug then console.log "adjustImplicitCalls-3\n" + code + " error: " + error

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
      # Why do we handle Commands differently from expressions?
      # cause they have different delimiters
      # I expect
      #   wave -1
      # to be transformed into
      #   wave() -1
      # but I don't want
      #   box -1
      # to turn into box() -1
      delimitersForCommands = ":|;|\\,|\\?|\\)|//|\\#|\\selse|\\sthen"
      delimitersForExpressions = delimitersForCommands + "|" + "\\+|-|\\*|/|%|&|]|<|>|=|\\|"

      for i in [1..2]
        rx = RegExp("([^a-zA-Z0-9\\r\\n])("+@allCommandsRegex+")[ \\t]*("+delimitersForCommands+")",'g')
        code = code.replace(rx, "$1$2()$3")
      if detailedDebug then console.log "adjustImplicitCalls-4\n" + code + " error: " + error

      for i in [1..2]
        rx = RegExp("([^a-zA-Z0-9\\r\\n])("+expressionsAndUserDefinedFunctionsRegex+")[ \\t]*("+delimitersForExpressions+")",'g')
        code = code.replace(rx, "$1$2()$3")
      if detailedDebug then console.log "adjustImplicitCalls-5\n" + code + " error: " + error

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
      rx = RegExp("([^a-zA-Z0-9\\r\\n])("+allFunctionsRegex+")[ \\t]*$",'gm')
      code = code.replace(rx, "$1$2()")
      if detailedDebug then console.log "adjustImplicitCalls-6\n" + code + " error: " + error
      return [code, error]

    addCommandsSeparations: (code, error, userDefinedFunctions) ->
      # if there is an error, just propagate it
      return [undefined, error] if error?

      expressionsAndUserDefinedFunctionsRegex = @expressionsRegex + userDefinedFunctions
      allFunctionsRegex = @allCommandsRegex + "|" + expressionsAndUserDefinedFunctionsRegex
      
      rx = RegExp("("+@allCommandsRegex+")([ \\t]*)("+@allCommandsRegex+")([ ]*)($)?",'gm')
      code = code.replace(rx, "$1();$2$3$4$5")
      if detailedDebug then console.log "addCommandsSeparations 1: " + code

      return [code, error]

    fleshOutQualifiers: (code, error) ->
      # if there is an error, just propagate it
      return [undefined, error] if error?

      previousCodeTransformations = ''

      while code != previousCodeTransformations
        previousCodeTransformations = code
        for i in [0...@qualifierKeywords.length] by 4
          toBeReplaced = @qualifierKeywords[i] + ""
          replaceWith = @qualifierKeywords[i+1] + ""
          prependWith = @qualifierKeywords[i+2] + ""
          appendWith = @qualifierKeywords[i+3] + ""

          rx = RegExp("^()("+toBeReplaced+")([^a-zA-Z0-9\\r\\n].*?)("+@allCommandsRegex+")([^;\\r\\n]*)(.*)",'gm')
          replacement = '$1'+ prependWith + ';' + replaceWith + '$3$4$5; ' + appendWith + '$6'
          code = code.replace(rx,replacement)

          rx = RegExp("([^a-zA-Z0-9\\r\\n])("+toBeReplaced+")([^a-zA-Z0-9\\r\\n].*?)("+@allCommandsRegex+")([^;\\r\\n]*)(.*)",'gm')
          replacement = '$1'+ prependWith + ';' + replaceWith + '$3$4$5; ' + appendWith + '$6'
          code = code.replace(rx,replacement)
      if detailedDebug then console.log "fleshOutQualifiers 1: " + code

      return [code, error]

    findUserDefinedFunctions: (code, error) ->
      # if there is an error, just propagate it
      return [undefined, error] if error?

      rx = RegExp("([a-zA-Z\\d]+)([ \\t]*)=[ \\t]*[\\(-]([^>\\r\\n]*)>",'gm')
      userDefinedFunctions = []
      while match = rx.exec code
        userDefinedFunctions.push(match[1])

      userDefinedFunctions = userDefinedFunctions.join "|"
      if userDefinedFunctions != ""
        userDefinedFunctions = "|"+userDefinedFunctions

      #console.log "*****" + userDefinedFunctions
      return [code, error, userDefinedFunctions]


    evaluateAllExpressions: (code, error, userDefinedFunctions) ->
      # if there is an error, just propagate it
      return [undefined, error] if error?

      expressionsAndUserDefinedFunctionsRegex = @expressionsRegex + userDefinedFunctions
      allFunctionsRegex = @allCommandsRegex + "|" + expressionsAndUserDefinedFunctionsRegex

      rx = RegExp("("+expressionsAndUserDefinedFunctionsRegex+")([ \\t]*)times",'g')
      code = code.replace(rx, "$1()$2times")
      
      rx = RegExp("([^;>\\( \\t\\r\\n])([ ])("+@allCommandsRegex+")([^a-zA-Z0-9\\r\\n])",'gm')
      code = code.replace(rx, "$1;$2$3$4")
      if detailedDebug then console.log "evaluateAllExpressions-1\n" + code + " error: " + error

      rx = RegExp("([^a-zA-Z0-9\\r\\n])("+allFunctionsRegex+")([ \\t]*);",'g')
      code = code.replace(rx, "$1$2();")
      if detailedDebug then console.log "evaluateAllExpressions-2\n" + code + " error: " + error
      rx = RegExp("([^a-zA-Z0-9\\r\\n])("+allFunctionsRegex+")([ \\t]*)$",'gm')
      code = code.replace(rx, "$1$2();")
      if detailedDebug then console.log "evaluateAllExpressions-3\n" + code + " error: " + error


      delimitersForCommandsMod = ":|;|\\,|\\?|//|\\#|\\selse|\\sthen"
      delimitersForExpressions = delimitersForCommandsMod + "|if|" + "\\+|-|\\*|/|%|&|]|<|>|=|\\|"
      delimitersForExpressions = delimitersForExpressions + userDefinedFunctions
      rx = RegExp("("+delimitersForExpressions+")([ \\t]*);",'g')
      code = code.replace(rx, "$1$2")
      if detailedDebug then console.log "evaluateAllExpressions-4\n" + code + " error: " + error

      #rx = RegExp("([^a-zA-Z0-9;>\\(])([ \\t]*)("+@allCommandsRegex+")([^a-zA-Z0-9])",'g')
      #code = code.replace(rx, "$1;$2$3$4")
      #code = code.replace(/[>][ ]*;/g, "> ")
      #code = code.replace(/[=][ ]*;/g, "= ")

      return @normaliseCode(code, error)


    adjustDoubleSlashSyntaxForComments: (code, error) ->
      # if there is an error, just propagate it
      return [undefined, error] if error?

      # allows // for comments
      # the hash is more difficult to write
      code = code.replace(/\/\//g, "#")
      return [code, error]

    preprocess: (code) ->
      # we'll keep any errors in here as we transform the code
      # as soon as there is any error, all next stages of
      # transformation do nothing
      error = undefined

      if detailedDebug then console.log "preprocess-0\n" + code + " error: " + error
      [code, error, userDefinedFunctions] = @findUserDefinedFunctions(code, error)
      if detailedDebug then console.log "preprocess-1\n" + code + " error: " + error

      [code, error] = @removeTickedDoOnce(code, error)
      if detailedDebug then console.log "preprocess-2\n" + code + " error: " + error
      [code, codeWithoutStringsOrComments, error] = @stripCommentsAndStrings(code, error)
      if detailedDebug then console.log "preprocess-3\n" + code + " error: " + error
      [code, error] = @checkBasicSyntax(code, codeWithoutStringsOrComments, error)
      if detailedDebug then console.log "preprocess-4\n" + code + " error: " + error

      [code, error] = @markFunctionalReferences(code, error, userDefinedFunctions)
      if detailedDebug then console.log "preprocess-5\n" + code + " error: " + error

      # allow some common command forms can be used in postfix notation, e.g.
      #   60 bpm
      #   red fill
      #   yellow stroke
      #   black background
      [code, error] = @adjustPostfixNotations(code, error)
      if detailedDebug then console.log "preprocess-6\n" + code + " error: " + error

      [code, error] = @checkBasicErrorsWithTimes(code, error)
      if detailedDebug then console.log "preprocess-7\n" + code + " error: " + error
      


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


      # Each doOnce block, when run, pushes its own line number to a particular
      # array. It leaves traces of which doOnce block has been run and
      # where exactly it is so that we can go back and mark it with a tick
      # (which prevents a second run to happen, as the tickmarks expand into
      # line comments).
      if detailedDebug then console.log "preprocess-8\n" + code + " error: " + error
      [code, error] = @addTracingInstructionsToDoOnceBlocks(code, error)

      if detailedDebug then console.log "preprocess-9\n" + code + " error: " + error
      [code, error] = @fleshOutQualifiers(code, error)
      if detailedDebug then console.log "preprocess-10\n" + code + " error: " + error
      [code, error] = @addCommandsSeparations(code, error, userDefinedFunctions)
      if detailedDebug then console.log "preprocess-11\n" + code + " error: " + error
      [code, error] = @adjustImplicitCalls(code, error, userDefinedFunctions)
      if detailedDebug then console.log "preprocess-12\n" + code + " error: " + error
      [code, error] = @adjustDoubleSlashSyntaxForComments(code, error)
      if detailedDebug then console.log "preprocess-13\n" + code + " error: " + error
      [code, error] = @evaluateAllExpressions(code, error, userDefinedFunctions)
      if detailedDebug then console.log "preprocess-14\n" + code + " error: " + error
      [code, error] = @transformTimesSyntax(code, error)
      if detailedDebug then console.log "preprocess-15\n" + code + " error: " + error
      [code, error] = @unmarkFunctionalReferences(code, error, userDefinedFunctions)

      return [code, error, userDefinedFunctions]



    # to run the tests, just open the dev console
    # and type: testPreprocessor()
    test: ->
        failedTests = successfulTest = knownIssues = failedIdempotency = failedMootAppends = failedMootPrepends = 0
        for testCaseNumber in [0...@testCases.length]
          testCase = @testCases[testCaseNumber]

          # just like in demos and tutorials, we use an
          # arrow to represent tabs so it's more
          # readable when looking at the examples.
          # We replace it with tabs here.
          testCase.input = testCase.input.replace(/\u25B6/g, "\t")
          if testCase.expected?
            testCase.expected = testCase.expected.replace(/\u25B6/g, "\t")

          [transformed, error, userDefinedFunctions] = @preprocess(testCase.input)
          # only check idempotency if there was no error
          # in the first step and if the test case
          # has no "notIdempotent" flag
          testIdempotency = !error? and !(testCase.notIdempotent?)
          #testIdempotency = false
          if testIdempotency
            [transformedTwice, error, ] = @preprocess(transformed)

          expressionsAndUserDefinedFunctionsRegex = @expressionsRegex + userDefinedFunctions
          allFunctionsRegex = @allCommandsRegex + "|" + expressionsAndUserDefinedFunctionsRegex

          for i in [0...@qualifierKeywords.length] by 4
            allFunctionsRegex = allFunctionsRegex + '|' + (@qualifierKeywords[i])
          
          appendString = 's'
          prependString = 't'
          [mootInput, ignore, errorMoot] = @stripCommentsAndStrings(testCase.input,null)
          if !errorMoot?
            rx = RegExp("(("+allFunctionsRegex+"|times)([^a-zA-Z0-9]|$))",'gm');
            mootInputAppend = mootInput.replace(rx, "$2"+appendString+"$3")
            mootInputPrepend = mootInput.replace(rx, prependString+"$2$3")

            mootInputAppend = @normaliseCode(mootInputAppend,null)[0]
            [transformedMootAppend, errorMootAppend,] = @preprocess(mootInputAppend)
            mootInputPrepend = @normaliseCode(mootInputPrepend,null)[0]
            [transformedMootPrepend, errorMootPrepend,] = @preprocess(mootInputPrepend)
            


          if !errorMootAppend?
            if userDefinedFunctions != ""
              rx = RegExp("("+userDefinedFunctions+")"+appendString+"\\(\\)",'gm');
              transformedMootAppend = transformedMootAppend.replace(rx, "$1"+appendString)
            transformedMootAppend = @stripCommentsAndStrings(transformedMootAppend,null)[0]
            if mootInputAppend != transformedMootAppend
              failedMootAppends++
              console.log "unexpected transformation"
              console.log "moot input:\n" + mootInputAppend
              console.log "transformed into:\n" + transformedMootAppend          

          if !errorMootPrepend?
            if userDefinedFunctions != ""
              rx = RegExp(prependString+"("+userDefinedFunctions+")\\(\\)",'gm');
              transformedMootPrepend = transformedMootPrepend.replace(rx, prependString+"$1")            
            transformedMootPrepend = @stripCommentsAndStrings(transformedMootPrepend,null)[0]
            if mootInputPrepend != transformedMootPrepend
              failedMootPrepends++
              console.log "unexpected transformation"
              console.log "moot input:\n" + mootInputPrepend
              console.log "transformed into:\n" + transformedMootPrepend          


          if transformed == testCase.expected and
              error == testCase.error and
              (transformed == transformedTwice or !testIdempotency)
            console.log "testCase #{testCaseNumber}: pass"
            successfulTest++
          else
            if testCase.knownIssue
              console.log "!!!!!!!!!! testCase #{testCaseNumber} known fail"
              knownIssues++
            else
              console.log "!!!!!!!!!! testCase #{testCaseNumber} fail:"
              if testIdempotency and transformed != transformedTwice
                if transformed == testCase.expected
                  failedIdempotency++
                console.log "\nNot idempotent\n"
                console.log "\n 2nd run result: \n"
                console.log transformedTwice
              console.log '\ninput: \n' + testCase.input \
                + '\nobtained: \n' + transformed \
                + '\nwith error:\n' + error \
                + '\ninstead of:\n' + testCase.expected \
                + '\nwith error:\n' + testCase.error
              failedTests++
        console.log "######### summary #######"
        console.log "      passed: #{successfulTest}"
        console.log "      failed: #{failedTests}"
        console.log "      failed moot appends: #{failedMootAppends}"
        console.log "      failed moot prepends: #{failedMootPrepends}"
        console.log "      out of which only idempotency fails: #{failedIdempotency}"
        console.log "known issues: #{knownIssues}"
        return

