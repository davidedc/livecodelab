###
## CodePreprocessor takes care of translating the simplified syntax
## of livecodelb to a coffeescript that is degestible by the
## coffeescript compiler.
## This pre-processing step can raise some errors - which are
## returned in a dedicated variable.
###

define ['core/code-preprocessor-tests'], (CodePreprocessorTests) ->

  class CodePreprocessor

    testCases: null

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
    scaleRotateMoveStatements: [
      # scale rotate move
      "rotate"
      "move"
      "scale"
    ]
    listOfStatements: [
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
      # Color
      "color"
    ]

    constructor: ->
      @testCases = (new CodePreprocessorTests()).testCases
      # make the preprocessor tests easily accessible from the console.
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
              "$1;addDoOnce(" + eachLine + "); (1+0).times -> $2")
          
          # add the line number tracing instruction to multiline case
          if /^(\s*)doOnce[ ]*\->[ ]*$/g.test(elaboratedSourceByLine[eachLine])
            
            #alert('doOnce multiline!')
            elaboratedSourceByLine[eachLine] =
              elaboratedSourceByLine[eachLine].replace(
                /^(\s*)doOnce[ ]*\->[ ]*$/g, "$1(1+0).times ->")
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

    stripCommentsAndCheckBasicSyntax: (code, error) ->
      # if there is an error, just propagate it
      return [undefined, error] if error?

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
      #   (peg()+0).times ->  rotate box 2* wave()
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

      # Note: this is mangled up in the translation to javascript
      # from the coffeescript translator:
      #   (1).times ->
      # But this isn't:
      #   (1+0).times ->
      # So here is the little replace.
      # ( see http://coffeescript.org/#try:%23%20incorrect%0A1.times%20-%3E%0A%20%20test%0A%0A%23%20incorrect%0A(1).times%20-%3E%0A%20%20test%0A%0A%23%20correct%0A(1%2B0).times%20-%3E%0A%20%20test%0A%0A%23%20correct%0An.times%20-%3E%0A%20%20test%0A )

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
      code = code.replace(/(else)\s+([a-zA-Z1-9])([^;\r\n]*)[^\.\r\n]times[:]?([^a-zA-Z0-9].*)/g, "$1 ($2$3+0).times -> $4")
      code = code.replace(/(then)\s+([a-zA-Z1-9])([^;\r\n]*)[^\.\r\n]times[:]?([^a-zA-Z0-9].*)/g, "$1 ($2$3+0).times -> $4")

      # the [^;]*? is to make sure that we don't take ; within the times argument
      # example:
      #  box; box ;  2 times: peg
      # if we don't exclude the semicolon form the times argument then we transform into
      #  box; (box ;  2+0).times ->  peg
      # which is not correct
      code = code.replace(/^(.*?)(;)\s*([a-zA-Z1-9])([^;\r\n]*?)[^\.\r\n]times[:]?([^a-zA-Z0-9].*)$/gm, "$1$2 ($3$4+0).times -> $5")


      # takes care of cases like myFunc = -> 20 times rotate box
      code = code.replace(/(->)\s+([a-zA-Z1-9])(.*?)[^\.\r\n;]times[:]?([^a-zA-Z0-9].*)/g, "$1 ($2$3+0).times -> $4")


      # "times" takes as its first argument (i.e. the number of times)
      # anything before it up to the first statement or ; (or start of line)
      # so for example rotate wave 2 times box becomes
      # 

      # start of line case first
      #rx = RegExp("^("+listOfStatementsForStartOfLine+")([ \\t]*)([a-zA-Z1-9])((?!;|\\r|\\n|times|"+listOfStatementsForStartOfLine+")*)[^\\.\\r\\n]times[:]*(.*)$",'gm');
      #alert rx
      #alert code
      #code = code.replace(rx, "$1;$2($3+0).times -> $5")
      #alert code

      # cases for non-start of line
      #rx = RegExp("^(.*?)(;|"+listOfStatements+")([ \\t]*)([a-zA-Z1-9])((?!;|\\r|\\n|times|"+listOfStatements+")*)[^\\.\\r\\n]times[:]*(.*)$",'gm');
      #code = code.replace(rx, "$1$2;$3($4+0).times -> $6")
      #code = code.replace(/;+/g, ";")


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
      code = code.replace(/^(\s*)([a-zA-Z1-9])(.*?)[^;\r\n\.]times[:]?([^a-zA-Z0-9].*)$/gm, "$1($2$3+0).times -> $4")


      code = code.replace(/[ ];/gm, "; ")
      code = code.replace(/;+/g, ";")
      code = code.replace(/;$/gm, "")
      code = code.replace(/;([^ \r\n])/gm, "; $1")

      return [code, error]

    markFunctionalReferences: (code, error) ->
      # if there is an error, just propagate it
      return [undefined, error] if error?

      scaleRotateMoveStatements = @scaleRotateMoveStatements.join "|"
      listOfStatements = (@listOfStatements.join "|") + "|" + scaleRotateMoveStatements
      listOfExpressions = @listOfExpressionsAnduserDefinedFunctions.join "|"
      listOfLCLKeywords = listOfStatements + "|" + listOfExpressions

      rx = RegExp("<[\\s]*("+listOfLCLKeywords+")[\\s]*>",'g')
      code = code.replace(rx, "MARKED$1")

      return [code, error]

    unmarkFunctionalReferences: (code, error) ->
      # if there is an error, just propagate it
      return [undefined, error] if error?

      scaleRotateMoveStatements = @scaleRotateMoveStatements.join "|"
      listOfStatements = (@listOfStatements.join "|") + "|" + scaleRotateMoveStatements
      listOfExpressions = @listOfExpressionsAnduserDefinedFunctions.join "|"
      listOfLCLKeywords = listOfStatements + "|" + listOfExpressions

      rx = RegExp("MARKED("+listOfLCLKeywords+")",'g')
      code = code.replace(rx, "$1")

      # TODO this shouldn't be here
      # replace stuff like (box 3+0).times -> into box; (3+0).times
      scaleRotateMoveStatements = @scaleRotateMoveStatements.join "|"
      listOfStatements = (@listOfStatements.join "|") + "|" + scaleRotateMoveStatements
      rx = RegExp("\\(("+listOfStatements+") ",'g');
      code = code.replace(rx, "$1(); (")

      code = code.replace(/->;/gm, "->")

      return [code, error]
    
    adjustImplicitCalls: (code, error) ->
      # if there is an error, just propagate it
      return [undefined, error] if error?

      scaleRotateMoveStatements = @scaleRotateMoveStatements.join "|"
      listOfStatements = (@listOfStatements.join "|") + "|" + scaleRotateMoveStatements
      listOfExpressions = @listOfExpressionsAnduserDefinedFunctions.join "|"
      listOfLCLKeywords = listOfStatements + "|" + listOfExpressions

      
      # adding () to single tokens on their own at the start of a line
      # ball
      rx = RegExp("^([ \\t]*)("+listOfLCLKeywords+")[ ]*$",'gm')
      code = code.replace(rx, "$1$2();")


      # adding () to single tokens at the start of the line
      # followed by a semicolon (might be followed by more instructions)
      # ball;
      # ball; somethingelse
      rx = RegExp("^([ \\t]*)("+listOfLCLKeywords+")[ ]*;",'gm')
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
      # these regexes needed to run twice 
      # in order to reach the token in between
      # delimiters, such as "box(wave,wave,wave)"
      # the second "wave" is not reached by the just one run
      # because the first matching wave consumes the comma before the
      # second...
      for i in [1..2]
        rx = RegExp("([^a-zA-Z0-9\\r\\n])("+listOfStatements+")[ \\t]*("+delimitersForStatements+")",'g')
        code = code.replace(rx, "$1$2()$3")
      for i in [1..2]
        rx = RegExp("([^a-zA-Z0-9\\r\\n])("+listOfExpressions+")[ \\t]*("+delimitersForExpressions+")",'g')
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
      rx = RegExp("([^a-zA-Z0-9\\r\\n])("+listOfLCLKeywords+")[ \\t]*$",'gm')
      code = code.replace(rx, "$1$2()")
      return [code, error]

    addCommandsSeparations: (code, error) ->
      # if there is an error, just propagate it
      return [undefined, error] if error?

      scaleRotateMoveStatements = @scaleRotateMoveStatements.join "|"
      listOfStatements = (@listOfStatements.join "|") + "|" + scaleRotateMoveStatements
      listOfExpressions = @listOfExpressionsAnduserDefinedFunctions.join "|"
      listOfLCLKeywords = listOfStatements + "|" + listOfExpressions

      
      for i in [1..2]
        rx = RegExp("("+scaleRotateMoveStatements+")([ \\t]*)("+listOfStatements+")([ ]*)([^;\\r\\n]*)",'g')
        #code = code.replace(rx, "C$1<>$2<>$3<>$4<>$5<>")
        code = code.replace(rx, "$1();$2$3$4$5")


      for i in [1..2]
        rx = RegExp("("+listOfStatements+")([ \\t]*)("+listOfStatements+")([ ]*)($)?",'gm')
        code = code.replace(rx, "$1();$2$3$4$5")

      for i in [1..2]
        rx = RegExp("("+scaleRotateMoveStatements+")([ \\t;]*)("+listOfStatements+")([ ]*)([^;\\r\\n]*)",'g')
        code = code.replace(rx, "$1();$2$3$4$5;")

      #for i in [1..2]
      #  rx = RegExp("("+scaleRotateMoveStatements+")(.*)("+listOfStatements+")(.*)$",'gm')
      #  code = code.replace(rx, "pushMatrix();$1$2$3;popMatrix();")



      code = code.replace(/;+/g, ";")
      code = code.replace(/;$/gm, "")
      return [code, error]

    findUserDefinedFunctions: (code, error) ->
      # if there is an error, just propagate it
      return [undefined, error] if error?

      rx = RegExp("([a-zA-Z\\d]+)([ \\t]*)=[ \\t]*[\\(-]([^>\\r\\n]*)>",'gm')
      userDefinedFunctions = []
      while match = rx.exec code
        userDefinedFunctions.push(match[1])

      #console.log "*****" + userDefinedFunctions
      return [code, error, userDefinedFunctions]


    evaluateAllExpressions: (code, userDefinedFunctions, error) ->
      # if there is an error, just propagate it
      return [undefined, error] if error?

      scaleRotateMoveStatements = @scaleRotateMoveStatements.join "|"
      listOfStatements = (@listOfStatements.join "|") + "|" + scaleRotateMoveStatements
      listOfExpressions = @listOfExpressionsAnduserDefinedFunctions.join "|"
      listOfLCLKeywords = listOfStatements + "|" + listOfExpressions

      
      rx = RegExp("([^;>\\( \\t\\r\\n])([ ])("+listOfStatements+")([^a-zA-Z0-9\\r\\n])",'gm')
      code = code.replace(rx, "$1;$2$3$4")

      rx = RegExp("([^a-zA-Z0-9\\r\\n])("+listOfLCLKeywords+")([ \\t]*);",'g')
      code = code.replace(rx, "$1$2();")
      rx = RegExp("([^a-zA-Z0-9\\r\\n])("+listOfLCLKeywords+")([ \\t]*)$",'gm')
      code = code.replace(rx, "$1$2();")


      delimitersForStatementsMod = ":|;|\\,|\\?|//|\\#|\\selse|\\sthen"
      delimitersForExpressions = delimitersForStatementsMod + "|if|" + "\\+|-|\\*|/|%|&|]|<|>|=|\\|"
      userDefinedFunctions = '' + userDefinedFunctions.join "|"
      if userDefinedFunctions != ""
        delimitersForExpressions = userDefinedFunctions + "|"+ delimitersForExpressions
      rx = RegExp("("+delimitersForExpressions+")([ \\t]*);",'g')
      code = code.replace(rx, "$1$2")

      #rx = RegExp("([^a-zA-Z0-9;>\\(])([ \\t]*)("+listOfStatements+")([^a-zA-Z0-9])",'g')
      #code = code.replace(rx, "$1;$2$3$4")
      #code = code.replace(/[>][ ]*;/g, "> ")
      #code = code.replace(/[=][ ]*;/g, "= ")

      code = code.replace(/[ ];/gm, "; ")
      code = code.replace(/;+/g, ";")
      code = code.replace(/;$/gm, "")
      code = code.replace(/;([^ \r\n])/gm, "; $1")
      return [code, error]


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

      [code, error, userDefinedFunctions] = @findUserDefinedFunctions(code, error)

      @listOfExpressionsAnduserDefinedFunctions = @listOfExpressions.concat userDefinedFunctions
      [code, error] = @removeTickedDoOnce(code, error)
      [code, error] = @stripCommentsAndCheckBasicSyntax(code, error)

      [code, error] = @markFunctionalReferences(code, error)

      # allow some common command forms can be used in postfix notation, e.g.
      #   60 bpm
      #   red fill
      #   yellow stroke
      #   black background
      [code, error] = @adjustPostfixNotations(code, error)

      [code, error] = @checkBasicErrorsWithTimes(code, error)
      


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
      [code, error] = @addTracingInstructionsToDoOnceBlocks(code, error)

      [code, error] = @addCommandsSeparations(code, error)
      [code, error] = @adjustImplicitCalls(code, error)
      [code, error] = @adjustDoubleSlashSyntaxForComments(code, error)
      [code, error] = @evaluateAllExpressions(code, userDefinedFunctions, error)
      for i in [1..5] # todo avoid that, or make the loop tighter
        [code, error] = @transformTimesSyntax(code, error)
      [code, error] = @adjustImplicitCalls(code, error)
      [code, error] = @unmarkFunctionalReferences(code, error)



    # to run the tests, just open the dev console
    # and type: testPreprocessor()
    test: ->
        failedTests = successfulTest = knownIssues = failedIdempotency =0
        for testCaseNumber in [0...@testCases.length]
          testCase = @testCases[testCaseNumber]
          [transformed, error] = @preprocess(testCase.input)
          # only check idempotency if there was no error
          # in the first step and if the test case
          # has no "notIdempotent" flag
          testIdempotency = !error? and !(testCase.notIdempotent?)
          #testIdempotency = false
          if testIdempotency
            [transformedTwice, error] = @preprocess(transformed)
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
        console.log "      out of which only idempotency fails: #{failedIdempotency}"
        console.log "known issues: #{knownIssues}"
        return

