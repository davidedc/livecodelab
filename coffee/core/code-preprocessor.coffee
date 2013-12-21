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
      "rotateing❤QUALIFIER", "rotate", "pushMatrix", "popMatrix"
      "moveing❤QUALIFIER", "move", "pushMatrix", "popMatrix"
      "scaleing❤QUALIFIER", "scale", "pushMatrix", "popMatrix"
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
    primitives: [
      # Geometry
      "rect"
      "line"
      "box"
      "ball"
      "peg"
    ]
    commandsExcludingScaleRotateMove: [
      # Geometry
      "ballDetail"
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
    colorCommands: [
      "fill"
      "stroke"      
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

    colors: [
      "red"
      "green"
      "blue"
    ]

    constructor: ->
      @testCases = (new CodePreprocessorTests()).testCases
      @scaleRotateMoveCommandsRegex = @scaleRotateMoveCommands.join "|"
      @primitivesRegex = @primitives.join "|"
      @primitivesAndMatrixRegex = @scaleRotateMoveCommandsRegex + "|" + @primitivesRegex
      @allCommandsRegex = (@commandsExcludingScaleRotateMove.join "|") +
        "|" + @scaleRotateMoveCommandsRegex +
        "|" + @primitivesRegex
      @expressionsRegex = @expressions.join "|"
      @colorsRegex = @colors.join "|"
      @colorsCommandsRegex = @colorCommands.join "|"
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

      # doOnce multiline case
      code = code.replace(/^(\s*)✓[ ]*doOnce[ \t\-]*\>[ ]*$/gm, "$1if false")
      # doOnce single-line case case
      code = code.replace(/^(\s*)✓([ ]*doOnce[ \t\-]*\>[ ]*)/gm, "$1//$2")
      if detailedDebug then console.log "removeTickedDoOnce\n" + code + " error: " + error
      if code.indexOf("✓") != -1
        return [undefined,"✓ must be next to a doOnce"]
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
              /(^|\s+)doOnce[ \t\-]*\>[ ]*(.+)$/g,
              "$1;addDoOnce(" + eachLine + "); 1.times -> $2")
          
          # add the line number tracing instruction to multiline case
          if /(^|\s+)doOnce[ \t\-]*\>[ ]*$/g.test(elaboratedSourceByLine[eachLine])
            
            #alert('doOnce multiline!')
            elaboratedSourceByLine[eachLine] =
              elaboratedSourceByLine[eachLine].replace(
                /(^|\s+)doOnce[ \t\-]*\>[ ]*$/g, "$11.times ->")
            elaboratedSourceByLine[eachLine + 1] =
              elaboratedSourceByLine[eachLine + 1].replace(
                /^(\s*)(.+)$/g, "$1addDoOnce(" + eachLine + "); $2")
        code = elaboratedSourceByLine.join "\n"
      
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
        else if characterBeingExamined is ";"
          return [undefined,"break line instead of using ';'"]
        codeWithoutStringsOrComments = codeWithoutStringsOrComments.slice(1)
      
      # according to jsperf, the fastest way to check if number is even/odd
      if aposCount & 1 or quoteCount & 1 or roundBrackCount & 1 or
          curlyBrackCount & 1 or squareBrackCount & 1
        programHasBasicError = true
        reasonOfBasicError = ''

        reasonOfBasicErrorMissing = ''
        reasonOfBasicErrorMissing = reasonOfBasicErrorMissing + "', "  if aposCount & 1
        reasonOfBasicErrorMissing = reasonOfBasicErrorMissing + "\", "  if quoteCount & 1

        if (aposCount & 1) or (quoteCount & 1)
          reasonOfBasicErrorMissing =  "Missing " + reasonOfBasicErrorMissing
          reasonOfBasicErrorMissing = reasonOfBasicErrorMissing.substring(0, reasonOfBasicErrorMissing.length - 2)

        reasonOfBasicErrorUnbalanced = ''
        reasonOfBasicErrorUnbalanced = reasonOfBasicErrorUnbalanced + "(), "  if roundBrackCount & 1
        reasonOfBasicErrorUnbalanced = reasonOfBasicErrorUnbalanced + "{}, "  if curlyBrackCount & 1
        reasonOfBasicErrorUnbalanced = reasonOfBasicErrorUnbalanced + "[], "  if squareBrackCount & 1

        if (roundBrackCount & 1) or (curlyBrackCount & 1) or (squareBrackCount & 1)
          reasonOfBasicErrorUnbalanced = "Unbalanced " + reasonOfBasicErrorUnbalanced
          reasonOfBasicErrorUnbalanced = reasonOfBasicErrorUnbalanced.substring(0, reasonOfBasicErrorUnbalanced.length - 2)

        reasonOfBasicError = reasonOfBasicErrorMissing + " " + reasonOfBasicErrorUnbalanced
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
      if detailedDebug then console.log "normalise-1:\n" + code + " error: " + error
      code = code.replace(/;$/gm, "")
      if detailedDebug then console.log "normalise-2:\n" + code + " error: " + error
      code = code.replace(/;([^ \r\n])/gm, "; $1")
      if detailedDebug then console.log "normalise-3:\n" + code + " error: " + error
      return [code, error]

    # these transformations are supposed to take as input
    # working coffeescript code and give as output
    # beautified and "normalised" coffeescript code
    # with the same exact meaning.
    beautifyCode:(code, error) ->
      # if there is an error, just propagate it
      return [undefined, error] if error?

      code = code.replace(/->(?![ \t])/gm, "-> ")
      if detailedDebug then console.log "beautifyCode-1:\n" + code + " error: " + error
      code = code.replace(/->[\t ;]+/gm, "-> ")
      if detailedDebug then console.log "beautifyCode-2:\n" + code + " error: " + error
      code = code.replace(/->[\t ]+$/gm, "->")
      if detailedDebug then console.log "beautifyCode-3:\n" + code + " error: " + error
      code = code.replace(/if[\t ;]+/gm, "if ")
      if detailedDebug then console.log "beautifyCode-4:\n" + code + " error: " + error
      code = code.replace(/then[\t ;]+/gm, "then ")
      if detailedDebug then console.log "beautifyCode-5:\n" + code + " error: " + error
      code = code.replace(/else[\t ;]+/gm, "else ")
      if detailedDebug then console.log "beautifyCode-6:\n" + code + " error: " + error
      code = code.replace(/;[\t ]+/gm, "; ")
      if detailedDebug then console.log "beautifyCode-7:\n" + code + " error: " + error
      code = code.replace(/([\w\d;\)])[\t ]*then/g, "$1 then")
      if detailedDebug then console.log "beautifyCode-8:\n" + code + " error: " + error
      code = code.replace(/([\w\d;\)])[\t ]*else/g, "$1 else")
      if detailedDebug then console.log "beautifyCode-9:\n" + code + " error: " + error
      code = code.replace(/;$/gm, "")
      if detailedDebug then console.log "beautifyCode-10:\n" + code + " error: " + error
      code = code.replace(/([\w\d;\)])[\t ]*->/g, "$1 ->")
      if detailedDebug then console.log "beautifyCode-11:\n" + code + " error: " + error
      code = code.replace(/([\w\d;\)])[\t ]*!=/g, "$1 !=")
      if detailedDebug then console.log "beautifyCode-12:\n" + code + " error: " + error
      code = code.replace(/([\w\d;\)])[\t ]*>=/g, "$1 >=")
      if detailedDebug then console.log "beautifyCode-13:\n" + code + " error: " + error
      code = code.replace(/([\w\d;\)])[\t ]*<=/g, "$1 <=")
      if detailedDebug then console.log "beautifyCode-14:\n" + code + " error: " + error
      code = code.replace(/([\w\d;\)])[\t ]*=/g, "$1 =")
      if detailedDebug then console.log "beautifyCode-15:\n" + code + " error: " + error
      code = code.replace(/\=([\w\d\(])/g, "= $1")
      if detailedDebug then console.log "beautifyCode-16:\n" + code + " error: " + error
      #code = code.replace(/\)([\t ]+\d)/g, ");$1")
      #if detailedDebug then console.log "beautifyCode-17:\n" + code + " error: " + error
      code = code.replace(/\)[\t ]*if/g, "); if")
      if detailedDebug then console.log "beautifyCode-18:\n" + code + " error: " + error
      code = code.replace(/;[\t ]+$/gm, "")
      if detailedDebug then console.log "beautifyCode-19:\n" + code + " error: " + error
      code = code.replace(/♠/g, "")
      if detailedDebug then console.log "beautifyCode-20:\n" + code + " error: " + error

      # transform stuff like (3).times and (n).times
      # into 3.times and n.times
      code = code.replace(/\(\s*(\d+|[$A-Z_][0-9A-Z_$]*)\s*\)\.times/gi, "$1.times")
      if detailedDebug then console.log "beautifyCode-21:\n" + code + " error: " + error

      code = code.replace(/\=[\t ]+-/g, "= -")
      if detailedDebug then console.log "beautifyCode-22:\n" + code + " error: " + error


      return [code, error]

    checkBasicErrorsWithTimes:(code, error) ->
      # if there is an error, just propagate it
      return [undefined, error] if error?

      # if what we transform makes any sense *at all*, then
      # coffeescript will translate it to js and run it, which
      # in some cases we don't want.
      # We want to simply rule out some common cases here
      # so we don't need to make the regexpes too complicated
      # For example we want to avoid:
      #
      #   peg; times rotate box 2* wave
      # to become
      #   (peg()).times ->  rotate box 2* wave()
      # or
      #   peg times rotate box 2* wave
      # to become
      #   peg.times ->  rotate box 2* wave()
      #
      # and run simply because we forgot a number in front
      # of 'times'

      rx = RegExp("("+@allCommandsRegex+")\\s+times(?![\\w\\d])",'g')

      if /^\s*times/gm.test(code) or
        /;\s*times/g.test(code) or
        /else\s+times/g.test(code) or
        /then\s+times/g.test(code) or
        rx.test(code)
          programHasBasicError = true
          return [undefined, "how many times?"]
      return [code, error]

    unbindFunctionsToArguments: (code, error) ->
      # if there is an error, just propagate it
      return [undefined, error] if error?
      # put back in place "sin⨁a,b" into "sin a,b" 
      code = code.replace(/⨁/g, "")
      return @normaliseCode(code, error)

    # in order to proper recognise where expressions
    # start and end, we need to tie the functions with their
    # arguments. For example "sin a" has to becomde
    # sin⨁ a.
    # The regexp for isolating expressions stops capturing
    # when there are two tokens not tied by an operator,
    # so this is why adding that special operator is needed
    bindFunctionsToArguments: (code, error, userDefinedFunctionsWithArguments) ->
      # if there is an error, just propagate it
      return [undefined, error] if error?

      # we don't want "sin times" to be considered an expression
      # so introduce a blocker character to avoid "sin times"
      # to becomde "sin⨁ times"
      rx = RegExp("([^\\w\\d\\r\\n])("+(@allCommandsRegex+"|times")+")(?![\w\d])",'g')
      code = code.replace(rx, "$1⧻$2")
      if detailedDebug then console.log "transformTimesSyntax-1\n" + code + " error: " + error


      # "expression" functions such as in "sin a,b" need to become
      # "sin⨁a,b" 
      # the for is needed for example for cases like round(pulse 15) times
      expsAndUserFunctionsWithArgs =  @expressionsRegex + userDefinedFunctionsWithArguments
      rx = RegExp("(^|[^\\w\\d\\r\\n])("+expsAndUserFunctionsWithArgs+")([ \\(]+)(?![⧻\\+\\-*/%,⨁])",'gm')
      for i in [0...5]
        code = code.replace(rx, "$1$2$3⨁")
        if detailedDebug then console.log "transformTimesSyntax-2\n" + code + " error: " + error

      # remove blocker character to avoid "sin times"
      # to becomde "sin⨁ times"
      code = code.replace(/⧻/g, "")

      return @normaliseCode(code, error)

    transformTimesSyntax: (code, error) ->
      # if there is an error, just propagate it
      return [undefined, error] if error?


      if detailedDebug then console.log "transformTimesSyntax-0\n" + code + " error: " + error
      #code = code.replace(/(else)\s+([a-zA-Z1-9])([^;\r\n]*) times[:]?([^a-zA-Z0-9])/g, "$1 ($2$3).times -> $4")
      #if detailedDebug then console.log "transformTimesSyntax-1\n" + code + " error: " + error
      #code = code.replace(/(then)\s+([a-zA-Z1-9])([^;\r\n]*) times[:]?([^a-zA-Z0-9])/g, "$1 ($2$3).times -> $4")
      #if detailedDebug then console.log "transformTimesSyntax-2\n" + code + " error: " + error
      # without the following, "if 2 times a" becomes "(if 2).times a"
      #code = code.replace(/(if)\s+([a-zA-Z1-9])([^;\r\n]*) times[:]?([^a-zA-Z0-9])/g, "$1 ($2$3).times -> $4")
      #if detailedDebug then console.log "transformTimesSyntax-3\n" + code + " error: " + error

      code = code.replace(/then/g, "then;")
      code = code.replace(/else/g, ";else;")

      # the diamond (♦) will be in front of the "times"
      # argument. This is needed to make it so
      # the qualifiers will be able to be fleshed out
      # correctly
      

      # simple mathematical expressions
      # e.g. rotate 2,a+1+3*(a*2.32+Math.PI) 2 times box
      code = code.replace(/(([\d\w\.\(\)]+([\t ]*[\+\-*\/⨁%,][\t ]*))+[\d\w\.\(\)]+|[\d\w\.\(\)]+) times[:]?(?![\w\d])/g, "♦ ($1).times ->")
      if detailedDebug then console.log "transformTimesSyntax-3\n" + code + " error: " + error

      allFunctionsRegex = @allCommandsRegex + "|" + @expressionsRegex

      # ([\d\w\(\)]+([ ]*[-+/*][ ]*[\d\w\(\)]+(\.[\d\w\(\)]+)?)+)+ captures
      # simple mathematical expressions
      # e.g. rotate 2,a+1+3*(a*2.32+Math.PI) 2 times box
      rx = RegExp("("+allFunctionsRegex+")[\\t ]*;[; ]*\\(?(([\\d\\w\\.\\(\\)]+([\\t ]*[\\+\\-*/⨁%,][\\t ]*))+[\\d\\w\\.\\(\\)]+|[\\d\\w\\.\\(\\)]+)\\)\\.times ->",'g')
      code = code.replace(rx, "$1()♦ ($2).times ->")
      if detailedDebug then console.log "transformTimesSyntax-3.5\n" + code + " error: " + error

      # whatever is remaining should be turned into a normal form with semicolon before it.
      code = code.replace(/\((([\d\w\.\(\)]+([\t ]*[\+\-*\/⨁%,][\t ]*))+[\d\w\.\(\)]+|[\d\w\.\(\)]+)\)[ \.]*times[:]?(?![\w\d])/g, ";($1).times ")
      if detailedDebug then console.log "transformTimesSyntax-3.55\n" + code + " error: " + error

      # whatever is remaining should be turned into a normal form with semicolon before it.
      code = code.replace(/[ ](([\d\w\.\(\)]+([\t ]*[\+\-*\/⨁%,][\t ]*))+[\d\w\.\(\)]+|[\d\w\.\(\)]+)\.times[:]?(?![\w\d])/g, "; $1.times ")
      if detailedDebug then console.log "transformTimesSyntax-3.56\n" + code + " error: " + error

      # transformation above transforms ;(sin ⨁ 5).times  ->  into ;(sin ⨁; 5).times   ->
      # so fixing that
      code = code.replace(/⨁;/g, "")


      # repairs myFunc = -> ; 20.times -> rotate -> box()
      code = code.replace(/->[\t ]*[♦;\t ]*[\t ]*\(/g, "-> (")
      if detailedDebug then console.log "transformTimesSyntax-3.57\n" + code + " error: " + error

      code = code.replace(/then[\t ]*[♦;\t ]*[\t ]*\(/g, "then (")
      if detailedDebug then console.log "transformTimesSyntax-3.57\n" + code + " error: " + error

      # the transformation above generates stuff like
      #   peg(); ;  (2).times ->
      # and
      #   ; (1+1).times ->...
      # so fixing these cases
      # but careful not to destroy the indentations
      code = code.replace(/->\s*;/g, "->")
      if detailedDebug then console.log "transformTimesSyntax-3.6\n" + code + " error: " + error
      code = code.replace(/([\w\d;])[\t ]?;[; ]+\(/g, "$1; (")
      if detailedDebug then console.log "transformTimesSyntax-3.7\n" + code + " error: " + error
      code = code.replace(/\)[ ]*;[; ]+\(/g, "); (")
      if detailedDebug then console.log "transformTimesSyntax-3.75\n" + code + " error: " + error
      code = code.replace(/^([\t ]*);[; ]+\(/gm, "$1(")
      if detailedDebug then console.log "transformTimesSyntax-3.8\n" + code + " error: " + error
      code = code.replace(/^([\t ]*)[♦;][;♦ ]*/gm, "$1")
      if detailedDebug then console.log "transformTimesSyntax-3.9\n" + code + " error: " + error
      
      # It's unclear whether the cases catered by the two 
      # transformatione below ever make sense.
      # without the following, "a = (2 times box)" becomes "(a = 2.times -> box())"
      code = code.replace(/(\()\s*([\w\d])([^;\r\n]*) times[:]?([^\w\d])/g, "$1 ($2$3).times -> $4")
      if detailedDebug then console.log "transformTimesSyntax-4\n" + code + " error: " + error
      # without the following, "a = 2 times box" becomes "(a = 2).times -> box()"
      code = code.replace(/(=)\s*([\w\d])([^;\r\n]*) times[:]?([^\w\d])/g, "$1 ($2$3).times -> $4")
      if detailedDebug then console.log "transformTimesSyntax-4\n" + code + " error: " + error

      # the [^;\r\n]*? is to make sure that we don't take ; within the times argument
      # example:
      #  box; box ;  2 times: peg
      # if we don't exclude the semicolon form the times argument then we transform into
      #  box; (box ;  2).times ->  peg
      # which is not correct
      code = code.replace(/;[ \t]*([\w\d])([^;\r\n]*?) times[:]?([^\w\d])/g, "♦ ($1$2).times -> $3")
      if detailedDebug then console.log "transformTimesSyntax-5\n" + code + " error: " + error

      # the transformation above generates stuff like
      #   if true then; (2).times ->
      # so fixing that
      code = code.replace(/if\s*;/g, "if")
      code = code.replace(/then\s*;/g, "then")
      code = code.replace(/else\s*;/g, "else")
      if detailedDebug then console.log "transformTimesSyntax-5.5\n" + code + " error: " + error


      # takes care of cases like myFunc = -> 20 times rotate box
      code = code.replace(/(->)\s+([\w\d])(.*?) times[:]?([^\w\d])/g, "$1 ($2$3).times -> $4")
      if detailedDebug then console.log "transformTimesSyntax-6\n" + code + " error: " + error


      # last (catch all other cases where it captures everything
      # since the start of the line,
      # which is why you need to handle the other cases before):
      # the ^; is to avoid this matching:
      #   peg; times rotate box 2* wave (group1: p group2: eg; group3: rot...wave)
      code = code.replace(/([\w\d])(.*?) times[:]?([^\w\d])/g, "($1$2).times -> $3")
      if detailedDebug then console.log "transformTimesSyntax-7\n" + code + " error: " + error

      code = code.replace(/;*[\t ]*else/g, " else")

      return @normaliseCode(code, error)


    adjustFunctionalReferences: (code, error, userDefinedFunctions) ->
      # if there is an error, just propagate it
      return [undefined, error] if error?

      # this one is so that arrow is not mistaken
      # for a closed bracket
      code = code.replace(/->/g, "→")

      # turns things like
      #  either <rotate -> box>, <peg>
      #  either <box 2>, <peg 2>
      # into
      #  either (-> rotate -> box), (->peg)
      #  either (-> box 2), (->peg 2)
      expressionsAndUserDefinedFunctionsRegex = @expressionsRegex + userDefinedFunctions
      allFunctionsRegex = @allCommandsRegex + "|" + expressionsAndUserDefinedFunctionsRegex

      rx = RegExp("<[\\s]*(("+allFunctionsRegex+")[\\t ]*)>\\s*([,;]|\\s*$)",'gm')
      code = code.replace(rx, "($1♠)$3")

      rx = RegExp("<[\\s]*(("+allFunctionsRegex+")[^\\r\\n]*?)>\\s*([,;]|\\s*$)",'gm')
      code = code.replace(rx, "(->($1))$3")

      code = code.replace(/→/g, "->")

      if detailedDebug then console.log "adjustFunctionalReferences-1\n" + code + " error: " + error

      return [code, error]
    
    adjustImplicitCalls: (code, error, userDefinedFunctions, userDefinedFunctionsWithArguments) ->
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
      delimitersForCommands = ":|;|\\,|\\?|\\)|//|\\#|\\s+if|\\s+else|\\s+then"
      delimitersForExpressions = delimitersForCommands + "|" + "\\+|-|\\*|/|%|&|]|<|>|==|!=|>=|<=|!(?![=])|\\s+and\\s+|\\s+or\\s+|\\s+not\\s+|\\|"

      rx = RegExp("([^\\w\\d\\r\\n])("+@allCommandsRegex+")[ \\t]*("+delimitersForCommands+")",'g')
      for i in [1..2]
        code = code.replace(rx, "$1$2()$3")
      if detailedDebug then console.log "adjustImplicitCalls-4\n" + code + " error: " + error

      rx = RegExp("([^\\w\\d\\r\\n])("+expressionsAndUserDefinedFunctionsRegex+")([ \\t]*)("+delimitersForExpressions+")",'g')
      for i in [1..2]
        code = code.replace(rx, "$1$2()$3$4")
      if detailedDebug then console.log "adjustImplicitCalls-5\n" + code + " error: " + error

      # user functions that take an argument can't be
      # in the form myF()
      # so myF() -4 should really be myF -4
      userDefinedFunctionsWithArguments = userDefinedFunctionsWithArguments.substring(1)
      if userDefinedFunctionsWithArguments != ""
        rx = RegExp("([^\\w\\d\\r\\n])("+userDefinedFunctionsWithArguments+")\\(\\)",'g')
        for i in [1..2]
          #console.log "userDefinedFunctionsWithArguments " + userDefinedFunctionsWithArguments
          code = code.replace(rx, "$1$2")
        if detailedDebug then console.log "adjustImplicitCalls-6\n" + code + " error: " + error



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
      rx = RegExp("([^\\w\\d\\r\\n])("+allFunctionsRegex+")[ \\t]*$",'gm')
      code = code.replace(rx, "$1$2()")
      if detailedDebug then console.log "adjustImplicitCalls-7\n" + code + " error: " + error
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

    findQualifiers: (code, error) ->
      # if there is an error, just propagate it
      return [undefined, error] if error?

      # this is to avoid transformations to span
      # the else, since all transformations stop
      # at semicolon. This is transformed back
      # at the end of the method.
      code = code.replace(/([^\w\d;])then(?![\w\d])/g, "$1;then")
      code = code.replace(/([^\w\d;])else(?![\w\d])/g, "$1;else")

      # we don't want the qualifiers
      # to span across ">, <" in this case:
      #   either <box 2>, <peg 2>
      # otherwise box would become a qualifier
      # and cause
      #   either <box 2>, < ->peg 2>
      code = code.replace(/\s*>\s*,/g, "♠")

      # already transformer stuff like
      #    rotate (-> box())
      # can't be transformed again, so
      # making sure that the qualifiers can't span
      # a function definition

      primitivesAndDiamondRegex = @primitivesAndMatrixRegex + '|♦'

      previousCodeTransformations = ''
      while code != previousCodeTransformations
        previousCodeTransformations = code

        rx = RegExp("(^|[^\\w\\d\\r\\n])("+@primitivesAndMatrixRegex+")(?![\\w\\d\\(])([^\\r\\n;'♠]*?)("+primitivesAndDiamondRegex+")([^\\w\\d\\r\\n]*)",'gm')
        replacement = '$1$2ing❤QUALIFIER$3$4$5'
        code = code.replace(rx,replacement)

      code = code.replace(/♠/g, ">,")

      if detailedDebug then console.log "findQualifiers 4: " + code

      return [code, error]

    fleshOutQualifiers: (code, error) ->
      # if there is an error, just propagate it
      return [undefined, error] if error?


      # we need to consider things like rotateQUALIFIER
      # as a keyword beause we want
      #   rotateQUALIFIER rotateQUALIFIER box
      # to first expand the first rotateQUALIFIER into
      #   rotate (→ rotateQUALIFIER box)
      # and not,
      #   rotate rotateQUALIFIER (→ box)
      # similar reason for adding rotate
      primtvsAndQualsRegex = ''
      for i in [0...@scaleRotateMoveCommands.length]
        primtvsAndQualsRegex = primtvsAndQualsRegex + @scaleRotateMoveCommands[i] + '|' + @scaleRotateMoveCommands[i]+"ing❤QUALIFIER|"
      for i in [0...@primitives.length]
        primtvsAndQualsRegex = primtvsAndQualsRegex + @primitives[i] + '|' + @primitives[i]+"ing❤QUALIFIER|"
      primtvsAndQualsRegex = primtvsAndQualsRegex + '♦'

      previousCodeTransformations = ''

      # the (→ $4$5); is to make sure that
      #   rotate line;  rotate  box
      # becomes
      #   rotate (-> line());  rotate  (-> box())
      # instead of
      #   rotate -> line();  rotate -> box()
      # i.e. there is no chaining across semicolon

      while code != previousCodeTransformations
        previousCodeTransformations = code

        rx = RegExp("(^|[^\\w\\d\\r\\n])(("+@primitivesAndMatrixRegex+")ing❤QUALIFIER)(?![\\w\\d\\(])([^\\r\\n;→]*?)("+primtvsAndQualsRegex+")([^;\\r\\n]*)(.*)",'gm')
        replacement = '$1$3$4→ $5$6;$7'
        code = code.replace(rx,replacement)

        rx = RegExp("(^|[^\\w\\d\\r\\n])(("+@primitivesAndMatrixRegex+")ing❤QUALIFIER)(?![\\w\\d\\(])([^\\r\\n;→♦❤]*?)♦",'g')
        replacement = '$1$3$4 →'
        code = code.replace(rx,replacement)

        if detailedDebug then console.log "fleshOutQualifiers 6: " + code

      # the trasformations above creates
      # stuff like:
      #    rotate 1 + wave, -> (→ box); 
      # so fixing that
      code = code.replace(/->\s*\(→/g, "(→")

      # we don't need the diamond anymore
      code = code.replace(/♦[♦\t ]*/g, "; ")

      code = code.replace(/;*[\t ]*else/gm, " else")

      # the trasformations above add lots of redundant
      # semicolons and spaces like so:
      #    ...tate (-> rotate (-> box())))))))))); ;  ;   
      # so fixing that
      code = code.replace(/\);([; ]*)/g, "); ")

      # these two are to satisfy idempotency
      code = code.replace(/->\s*→/g, "->")
      code = code.replace(/→\s*->/g, "->")
      if detailedDebug then console.log "fleshOutQualifiers 7: " + code

      rx = RegExp("(^|[^\\w\\d\\r\\n])("+@primitivesAndMatrixRegex+")(?![\\w\\d\\(])(\\s*\\(?→)",'gm')
      replacement = '$1$2 ->'
      code = code.replace(rx,replacement)
      if detailedDebug then console.log "fleshOutQualifiers 9: " + code
      
      # replace all the → that *do* need to be prepended
      # with a comma
      code = code.replace(/([^,])\s+([\(]?)→/g, "$1, $2->")
      if detailedDebug then console.log "fleshOutQualifiers 10: " + code

      # replace all the remaining arrows
      code = code.replace(/→/g, "->")
      if detailedDebug then console.log "fleshOutQualifiers 11: " + code

      code = code.replace(/;*[\t ]*else/g, " else")
      code = code.replace(/;*[\t ]*then/g, " then")

      return [code, error]

    wasFunctionNameAlreadyFound: (str, strArray) ->
      j = 0
      while j < strArray.length
        if strArray[j].match(str) then return true
        j++
      false

    # what we are trying to do here is to figure
    # out which other keywords besides the LCL ones
    # we need to automatically invoke as functions.
    # Findind user functions is an ill-posed problem
    # because the same variable might be a function
    # in one place and a number in another. And yet
    # once we find that there is a function definition
    # with that name *anywhere* in the code, for us
    # it's a function everywhere, so we force the
    # function call. Note that this can
    # be mitigated by wrapping the supposed user
    # functions with a special function that invokes
    # the supposed user function if it actually is
    # a function, or otherwise returns
    # the content of the variable if it is not a function.
    # That way we would always make the right thing,
    # although at some sort of performance penalty.
    #
    # Also we keep a separate list of names of functions
    # that need a parameter. This is because expressions
    # containing these functions consume an argument,
    # so we need to be aware of that to correctly
    # consume the argument, as for example
    # "myFunc a" is an expression even though there
    # is no operator between the two tokens.
    # also in automatic parentheses explicitation,
    # stuff like "myFunc() a" should actually be
    # "myFunc a".

    findUserDefinedFunctions: (code, error) ->
      # if there is an error, just propagate it
      return [undefined, error] if error?

      userDefinedFunctions = []
      userDefinedFunctionsWithArguments = []

      # form a = -> ...
      rx = RegExp("([a-zA-Z\\d]+)([ \\t]*)=[ \\t]*->",'gm')
      while match = rx.exec code
        userDefinedFunctions.push(match[1])
      if detailedDebug then console.log "findUserDefinedFunctions-1\n" + code + " error: " + error

      # form a = () -> ...
      rx = RegExp("([a-zA-Z\\d]+)([ \\t]*)=[ \\t]*\\([ \\t]*\\)[ \\t]*->",'gm')
      while match = rx.exec code
        userDefinedFunctions.push(match[1])
      if detailedDebug then console.log "findUserDefinedFunctions-2\n" + code + " error: " + error

      # all other forms. Finds all forms so just check whether
      # we didn't get this function name already
      rx = RegExp("([a-zA-Z\\d]+)([ \\t]*)=[ \\t]*[\\(-]([^>\\r\\n]*)>",'gm')
      while match = rx.exec code
        functionName = match[1]
        if not @wasFunctionNameAlreadyFound functionName, userDefinedFunctions
          userDefinedFunctions.push(functionName)
          userDefinedFunctionsWithArguments.push(functionName)
      if detailedDebug then console.log "findUserDefinedFunctions-3\n" + code + " error: " + error

      userDefinedFunctions = userDefinedFunctions.join "|"
      if userDefinedFunctions != ""
        userDefinedFunctions = "|"+userDefinedFunctions

      userDefinedFunctionsWithArguments = userDefinedFunctionsWithArguments.join "|"
      if userDefinedFunctionsWithArguments != ""
        userDefinedFunctionsWithArguments = "|"+userDefinedFunctionsWithArguments

      #console.log "*****" + userDefinedFunctions
      return [code, error, userDefinedFunctions, userDefinedFunctionsWithArguments]


    evaluateAllExpressions: (code, error, userDefinedFunctions) ->
      # if there is an error, just propagate it
      return [undefined, error] if error?

      expressionsAndUserDefinedFunctionsRegex = @expressionsRegex + userDefinedFunctions
      allFunctionsRegex = @allCommandsRegex + "|" + expressionsAndUserDefinedFunctionsRegex

      rx = RegExp("("+expressionsAndUserDefinedFunctionsRegex+")([ \\t]*)times",'g')
      code = code.replace(rx, "$1()$2times")
      
      rx = RegExp("([^;>\\( \\t\\r\\n])([ ])("+@allCommandsRegex+")([^\\w\\d\\r\\n])",'gm')
      code = code.replace(rx, "$1;$2$3$4")
      if detailedDebug then console.log "evaluateAllExpressions-1\n" + code + " error: " + error

      # the transformation above can add a semicolon
      # after an else, fixing that
      code = code.replace(/else;/g, "else")

      rx = RegExp("([^\\w\\d\\r\\n])("+allFunctionsRegex+")([ \\t]*);",'g')
      code = code.replace(rx, "$1$2();")
      if detailedDebug then console.log "evaluateAllExpressions-2\n" + code + " error: " + error
      rx = RegExp("([^\\w\\d\\r\\n])("+allFunctionsRegex+")([ \\t]*)$",'gm')
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

    rearrangeColorCommands: (code, error) ->
      # if there is an error, just propagate it
      return [undefined, error] if error?

      rx = RegExp("(^|;| )(\\s*)("+@colorsRegex+")(?![\\w\\d])",'gm')
      code = code.replace(rx, "$1$2♦$3♦")

      rx = RegExp("(^|;| )(\\s*)("+@colorsCommandsRegex+")(?![\\w\\d])",'gm')
      code = code.replace(rx, "$1$2♠$3♠")


      #color1,exp color2 stroke/fill nocolor -> color1,exp stroke/fill color2 nocolor

      # ([\d\w\(\)]+([ ]*[-+/*][ ]*[\d\w\(\)]+(\.[\d\w\(\)]+)?)+)+ captures
      # simple mathematical expressions
      # e.g. rotate 2,a+1+3*(a*2.32+Math.PI) 2 times box

    # handles the example
    #   a = (val) -> val * 2
    #   rotate 3, a 1 box 3, 4, a 1
    # so it's translated in
    #   a = (val) -> val * 2
    #   rotate 3, (a 1), -> box 3, 4, a 1 
    # instead of
    #   a = (val) -> val * 2
    #   rotate 3, a (1, -> box 3, 4, a 1)
    # same for
    #   rotate 3, wave wave 2 box 3, 4, a 1
    # and also
    #   rotate 3, wave pulse / 10 box 3, 4, a 1
    avoidLastArgumentInvocationOverflowing: (code, error) ->
      # if there is an error, just propagate it
      return [undefined, error] if error?

      # the following transformation only leaves
      # normal parentheses if they contain
      # a comma or the ->
      # the comma is obvious, the -> is
      # to avoid to turn
      #   move 0.1 peg move 0.4 box
      # into
      #   move 0.1, (-> peg -> move 0.4), -> box()

      code = code.replace(/->/g, "→")
      if detailedDebug then console.log "avoidLastArgumentInvocationOverflowing-0\n" + code + " error: " + error

      previousCodeTransformations = ''
      while code != previousCodeTransformations
        previousCodeTransformations = code
        code = code.replace(/\(([^,\(\)\r\n→]*)\)/g, "❪$1❫")
      if detailedDebug then console.log "avoidLastArgumentInvocationOverflowing-1\n" + code + " error: " + error

      # by avoiding normal parentheses we avoid anything with a comma
      # [^\❪→] is needed to avoid to add more and more
      # nested parentheses
      # and to avoid that
      #   rotate 3, → scale 2, → box 3, 4, a 2
      # becomes
      #   rotate 3, (→ scale 2), -> box 3, 4, a 2
      code = code.replace(/(,[ \t]+)([^\❪→][^\(\)\r\n,→]*),([ \t]*)→/g, "$1($2), ->")
      if detailedDebug then console.log "avoidLastArgumentInvocationOverflowing-2\n" + code + " error: " + error

      # put the thick parentheses back to normal
      code = code.replace(/❪/g, "(")
      code = code.replace(/❫/g, ")")
      code = code.replace(/→/g, "->")
      if detailedDebug then console.log "avoidLastArgumentInvocationOverflowing-3\n" + code + " error: " + error

      # you end up generating stuff like , (a), and , (a()),
      # so simplify those
      code = code.replace(/(,[ \t]*)\(([\d\w]+)\)([ \t]*,)/g, "$1$2$3")
      code = code.replace(/(,[ \t]*)\(([\d\w]+\(\))\)([ \t]*,)/g, "$1$2$3")

      return [code, error]

    preprocess: (code) ->
      # we'll keep any errors in here as we transform the code
      # as soon as there is any error, all next stages of
      # transformation do nothing
      error = undefined

      if detailedDebug then console.log "preprocess-0\n" + code + " error: " + error
      [code, error, userDefinedFunctions, userDefinedFunctionsWithArguments] = @findUserDefinedFunctions(code, error)
      if detailedDebug then console.log "preprocess-1\n" + code + " error: " + error

      [code, error] = @removeTickedDoOnce(code, error)
      if detailedDebug then console.log "preprocess-2\n" + code + " error: " + error
      [code, codeWithoutStringsOrComments, error] = @stripCommentsAndStrings(code, error)
      if detailedDebug then console.log "preprocess-3\n" + code + " error: " + error
      [code, error] = @checkBasicSyntax(code, codeWithoutStringsOrComments, error)
      if detailedDebug then console.log "preprocess-4\n" + code + " error: " + error


      #[code, error] = @rearrangeColorCommands(code, error)
      #if detailedDebug then console.log "preprocess-5\n" + code + " error: " + error

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

      [ignore,a,ignore] = @identifyBlockStarts code, error
      [code, error] = @completeImplicitFunctionPasses code, a, error
      if detailedDebug then console.log "completeImplicitFunctionPasses:\n" + code + " error: " + error

      [code, error] = @bindFunctionsToArguments(code, error, userDefinedFunctionsWithArguments)
      if detailedDebug then console.log "preprocess-8.5\n" + code + " error: " + error
      [code, error] = @transformTimesSyntax(code, error)
      if detailedDebug then console.log "preprocess-9\n" + code + " error: " + error
      [code, error] = @unbindFunctionsToArguments(code, error)
      if detailedDebug then console.log "preprocess-9.5\n" + code + " error: " + error
      [code, error] = @findQualifiers(code, error)
      if detailedDebug then console.log "preprocess-10\n" + code + " error: " + error
      [code, error] = @fleshOutQualifiers(code, error)
      if detailedDebug then console.log "preprocess-11\n" + code + " error: " + error
      [code, error] = @adjustFunctionalReferences(code, error, userDefinedFunctions)
      if detailedDebug then console.log "preprocess-17\n" + code + " error: " + error
      [code, error] = @addCommandsSeparations(code, error, userDefinedFunctions)
      if detailedDebug then console.log "preprocess-12\n" + code + " error: " + error
      [code, error] = @adjustImplicitCalls(code, error, userDefinedFunctions, userDefinedFunctionsWithArguments)
      if detailedDebug then console.log "preprocess-13\n" + code + " error: " + error
      [code, error] = @adjustDoubleSlashSyntaxForComments(code, error)
      if detailedDebug then console.log "preprocess-14\n" + code + " error: " + error
      [code, error] = @evaluateAllExpressions(code, error, userDefinedFunctions)
      if detailedDebug then console.log "preprocess-16\n" + code + " error: " + error
      [code, error] = @avoidLastArgumentInvocationOverflowing(code, error)
      if detailedDebug then console.log "preprocess-17\n" + code + " error: " + error
      [code, error] = @beautifyCode(code, error)
      if detailedDebug then console.log "preprocess-18\n" + code + " error: " + error


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
          testMoots = !error? and !(testCase.failsMootAppends?)
          #testIdempotency = false
          if testIdempotency
            [transformedTwice, error, ] = @preprocess(transformed.replace(/;/g,""))

          expressionsAndUserDefinedFunctionsRegex = @expressionsRegex + userDefinedFunctions
          allFunctionsRegex = @allCommandsRegex + "|" + expressionsAndUserDefinedFunctionsRegex

          for i in [0...@qualifierKeywords.length] by 4
            allFunctionsRegex = allFunctionsRegex + '|' + (@qualifierKeywords[i])
          
          if testMoots
            appendString = 's'
            prependString = 't'

            [mootInput, ignore, errorMoot] = @stripCommentsAndStrings(testCase.input,null)
            [mootInput, ignore, errorMoot] = @beautifyCode(mootInput,errorMoot)

            if !errorMoot?
              rx = RegExp("(("+allFunctionsRegex+"|times|doOnce)([^\\w\\d]|$))",'gm');
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

            if !errorMootPrepend? and testMoots
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
                  console.log "\nNot idempotent but 1st result OK\n"
                else
                  console.log "\nNot idempotent and 1st result not OK\n"
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

    # finds each possible block start
    identifyBlockStarts: (code, error) ->
      # if there is an error, just propagate it
      return [undefined, undefined, error] if error?

      sourceByLine = code.split("\n")
      startOfPreviousLine = ""
      linesWithBlockStart = []
      
      for eachLine in [0...sourceByLine.length]
        line = sourceByLine[eachLine]
        #console.log "checking " + line
        rx = RegExp("^(\\s*)",'gm')
        match = rx.exec line
        continue if not match?
        startOfThisLine = match[1]
        #console.log "start of line: >" + startOfThisLine + "<"
        if startOfThisLine.length > startOfPreviousLine.length
          linesWithBlockStart.push eachLine-1
          blockStart = eachLine-1
          #blockEnd = @identifyBlockEnd(sourceByLine, eachLine)
          #console.log 'block ' + blockStart + ' to ' + blockEnd
        startOfPreviousLine = startOfThisLine

      #console.log "code lenght at identifyBlockStarts: " + code.split("\n").length
      return [code, linesWithBlockStart, undefined]

    # we might not need this function, leaving it here,
    # mute for the moment.
    # finds where the block starting at line "startLine" ends
    identifyBlockEnd: (sourceByLine, startLine) ->
      # if there is an error, just propagate it
      return [undefined, undefined, error] if error?

      rx = RegExp("^(\\s*)",'gm')
      match = rx.exec sourceByLine[startLine]
      #console.log "start of line: >" + startOfThisLine + "<"
      lengthToBeat = (match[1]).length

      linesWithBlockStart = []
      
      for eachLine in [startLine...sourceByLine.length]
        line = sourceByLine[eachLine]
        rx = RegExp("^(\\s*)",'gm')
        match = rx.exec line
        continue if not match?
        startOfThisLine = match[1]
        if startOfThisLine.length < lengthToBeat
          return eachLine - 1

      bottomOfProgram = sourceByLine.length-1
      return bottomOfProgram

    completeImplicitFunctionPasses: (code, linesWithBlockStart, error) ->
      # if there is an error, just propagate it
      return [undefined, error] if error?

      sourceByLine = code.split("\n")
      transformedLines = []
      
      countingLines = -1;
      for line in sourceByLine
        countingLines++
        if countingLines in linesWithBlockStart
          #console.log "checking " + line
          
          # if the line already ends with an arrow
          # then there is nothing to do
          rx = RegExp("->\\s*$",'gm')
          match = rx.exec line
          if match?
            transformedLines.push line
            continue

          # if the line already ends with "times"
          # then stay away from this transformation
          rx = RegExp("[^\\w\\d\\r\\n]times\\s*$",'gm')
          match = rx.exec line
          if match?
            transformedLines.push line
            continue

          # case where the function-block is passed as first argument
          # so no comma is needed
          rx = RegExp("(^|;| )\\s*("+@scaleRotateMoveCommandsRegex+")\\s*$",'gm')
          match = rx.exec line
          if match?
            transformedLines.push line+" ->"
            continue

          # case where the function-block is passed as argument beyond
          # the first, so a comma is needed
          rx = RegExp("(^|;| )\\s*("+@scaleRotateMoveCommandsRegex+")(?![\\w\\d])([^;\r\n]*)$",'gm')
          match = rx.exec line
          if match?
            transformedLines.push line+", ->"
            continue

          # if we are here is means that there was no match
          # meaning that there is nothing to add.
          transformedLines.push line

        else
          transformedLines.push line

      transformedCode = transformedLines.join "\n"

      #console.log "code lenght at completeImplicitFunctionPasses: " + transformedCode.split("\n").length
      return [transformedCode, undefined]



