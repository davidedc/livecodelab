###
## Autocoder takes care of making random variations to the code. It lexes the input,
## collects the tokens that can be mutated, picks one at random, invokes a mutation on it,
## and then re-builds a string pritout from the tokens so to obtain the mutated program.
###

define ['autocoder/lexer'], (LexerState) ->

  class Autocoder
    
    active: false
    autocoderMutateTimeout: undefined
    numberOfResults: 0
    whichOneToChange: 0
    
    constructor: (@eventRouter, @editor, @colourNames) ->
      
      # The Tokens array will contain all of the tokens in the form of functions.
      @Tokens = []
      
      # Lexing states. There is only one state so far.
      # The LexerState constructor returns a function that takes a regex and returns a
      # function that
      # takes an action and pushes it into a rules array (which is made of pairs of regexes,
      # actions)
      @LexersOnlyState = new LexerState()

      # Now for this state define all the rules. The rules are defined by the pair:
      #
      # * the regex that activates them (if multiple regexes will match, then)
      #   the longest regex will be activated.
      # * an action, which is a function that takes some matching input, the remaining
      #   input and the current state, and does anything it wants and returns a function
      #   that applies rules to further input and it returns the next action. So, recapping,
      #   an action does stuff and returns a function which when evaluated runs the rules
      #   again and returns another action. So an action, when run, does not run the
      #   next action. It just returns a function that finds it and runs it. Which in turn
      #  returns another function that finds and returns another action. Which in turn...
      #
      # Digression on actions:
      #  (matchedPartOfInput, remainingInput, currentState) =>
      #   @Tokens.push new TOKEN_TAB(matchedPartOfInput[0])
      #   return currentState.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput
      # is an action. The action, when its rule is activated, just adds a TAB object to
      # the @Tokens list and returns a function that finds and runs the next action
      # appliable to the remaining input. Note that an action does not find and run another
      # action. It just returns a function that finds and runs another action.
      #
      # So a complete paragraph below like this one:
      # @LexersOnlyState.addRule(/\t/, (matchedPartOfInput, remainingInput, currentState) =>
      #  @Tokens.push new TOKEN_TAB(matchedPartOfInput[0])
      #   return currentState.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput
      # )
      # defines a rule as the pair "regex, action" as discussed above.
      #
      # Why this "step by step" approach instead of a normal recursion? The advantage is
      # that you can stop the parsing and resume it any time you want. Suppose that
      # you have a huge program to parse. With recursion, once you start you can't
      # stop until the end (at least if you are using normal recursion as provided by
      # the language runtime. If you implement your own recursion using your own stack
      # then you could indeed pause/resume things). In a single-threaded language like
      # Javascript this results in everything else "blocking". A "continuations" approach
      # lets you stop and resume the parsing more easily, since you lex the program step
      # by step in a manner that does not rely on the runtime stack. There is no recursion.

      addRule= (regex, TokenClass, otherArgs) =>
        @LexersOnlyState.addRule(regex,
          (matchedPartOfInput, remainingInput, currentState) =>
            @Tokens.push new TokenClass(matchedPartOfInput[0], otherArgs)
            return currentState.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput
        )
      
      addRule(/\/\/.*\n/,TOKEN_COMMENT)
      addRule(/\t/,TOKEN_TAB)
      addRule(/-?[0-9]+\.?[0-9]*/,TOKEN_NUM)
      addRule(/-?\.[0-9]*/,TOKEN_NUM)
      addRule(/[*|\/|+|\-|=]/,TOKEN_OP)
      addRule(/,/,TOKEN_ARGDLIM)
      addRule(/[\n|\r]{1,2}/,TOKEN_NEWLINE)
      addRule(/rotate/,TOKEN_TRANSLATION)
      addRule(/move/,TOKEN_TRANSLATION)
      addRule(/scale/,TOKEN_TRANSLATION)
    
      # colour
      for scanningAllColors in @colourNames
        addRule(new RegExp(scanningAllColors),TOKEN_COLOUR, @colourNames)
    
      # colour ops
      addRule(/background/,TOKEN_COLOUROP)

      addRule(/fill/,TOKEN_COLOUROP)

      addRule(/stroke/,TOKEN_COLOUROP)
    
      # hmm  TODO
      addRule(/simpleGradient/,TOKEN_COLOUROP)

      addRule(/box/,TOKEN_MESH)
      addRule(/ball/,TOKEN_MESH)
      addRule(/peg/,TOKEN_MESH)
      addRule(/rect/,TOKEN_MESH)
      addRule(/line/,TOKEN_MESH)

      # state changes?
      addRule(/ambientLight/,TOKEN_STATEFUN)
      addRule(/noStroke/, TOKEN_STATEFUN)
      addRule(/ballDetail/,TOKEN_STATEFUN)
      addRule(/animationStyle\s\w+/,TOKEN_STATEFUN)
    
      # iteration
      addRule(/\d+\s+times\s+->/,TOKEN_ITERATION)
    
      # vars
      addRule(/time/,TOKEN_VARIABLE)
      addRule(/delay/,TOKEN_VARIABLE)

    
      # special
      addRule(/\?doOnce\s+->\s*/, TOKEN_DOONCE)
    
      # ignore white space ?
      addRule(RegExp(" +"), TOKEN_SPACE)
    
      # The bad stuff
    
      # string delimiters
      addRule(/'/,TOKEN_UNKNOWN)
      addRule(/[✓]?doOnce\s+\->?/,TOKEN_UNKNOWN)
      addRule(RegExp("=="),TOKEN_UNKNOWN)
      addRule(/else/,TOKEN_UNKNOWN)
      addRule(/next-tutorial:\w+/, TOKEN_UNKNOWN)

      # this is for all variable names
      addRule(/\w+/, TOKEN_UNKNOWN)
      addRule(/if/, TOKEN_UNKNOWN)
      addRule(/pushMatrix/, TOKEN_UNKNOWN)
      addRule(/popMatrix/,TOKEN_UNKNOWN)
      addRule(/play/, TOKEN_UNKNOWN)
      addRule(/bpm/, TOKEN_UNKNOWN)
      addRule(/color\s*\(.+\)/, TOKEN_UNKNOWN)
      addRule(/noFill/, TOKEN_UNKNOWN)
      addRule(/frame/, TOKEN_UNKNOWN)
      addRule(/strokeSize/, TOKEN_UNKNOWN)
      addRule(/\(/, TOKEN_UNKNOWN)
      addRule(/\)/, TOKEN_UNKNOWN)
      addRule(/%/, TOKEN_UNKNOWN)
      
    # Traverses the Tokens array and concatenates the strings,
    # hence generating a possibly mutated program.
    emit: (stream) ->
      ret = ""
      for scanningTheStream in stream
        ret = ret + scanningTheStream.string
      ret

    
    # Checks whether a token can mutate by checking whether the mutate function exists.
    canMutate: (token) ->
      if typeof token.mutate is "function"
        true
      else
        false

    
    # Scans the tokens and collects the mutatable ones.
    # Then picks one random and invokes its mutate().
    pickMutatableTokenAndMutateIt: (stream) ->
      mutatableTokens = []
      idx = undefined
      # collect the items that can be mutated
      for scanningTheStream in stream
        if @canMutate(scanningTheStream)
          mutatableTokens.push scanningTheStream
      if mutatableTokens.length == 0
        #nothing can be mutated
        return
      #found at least a mutatable token, pick one at random and mutate it
      idx = Math.floor(Math.random() * mutatableTokens.length)
      mutatableTokens[idx].mutate()

    
    # Currently unused.
    replaceTimeWithAConstant: ->
      editorContent = @editor.getValue()
      rePattern = /(time)/g
      allMatches = editorContent.match(rePattern)
      countWhichOneToSwap = 0
      if !allMatches
        @numberOfResults = 0
      else
        @numberOfResults = allMatches.length
      @whichOneToChange = Math.floor(Math.random() * @numberOfResults) + 1
      editorContent = editorContent.replace(rePattern, (match, text, urlId) ->
        countWhichOneToSwap++
        if countWhichOneToSwap is @whichOneToChange
          return "" + Math.floor(Math.random() * 20) + 1
        match
      )
      @editor.setValue editorContent

    
    # Every time a mutation is invoked, the following happens
    #
    # * the program is scanned by a lexer
    # the lexer could maintain/change/act on an user-defined state based on what it
    # encounters but for the time being that is not used.
    # So for the time being in practice the lexer
    # parses the tokens based on regular expressions without using states.
    # The definitions of what constitutes a token is defined by regexes in the "rules"
    # section
    #
    # * for each token, a function is added to the Token array. For example "rotate 20"
    # creates two
    # tokens, which are two functions TRANSLATE and NUM
    #
    # * each of the "token" functions contains a) a string representation from the text in
    # the program e.g. in the example above "rotate" and "20" and b) an accessory function
    # for printout of the token and c) optionally, a function mutate() that changes the
    # string of the field of a) with a mutated string
    #
    # * the token list is scanned. Each function is checked for whether it contains a
    # "mutate" function. If yes, then it's added as a candidate to an "mutatableTokens"
    # array.
    #
    # * a random option is picked and mutate is ran for that token
    #
    # * the token list is traversed and the strings are appended one
    #   to another, creating the new mutated program.
    mutate: ->
      editorContent = @editor.getValue()
      newContent = undefined
      @Tokens = []
      try
        @LexersOnlyState.lex editorContent
      catch e
        #console.log e

      @pickMutatableTokenAndMutateIt @Tokens
      newContent = @emit(@Tokens)
      @editor.setValue newContent

    autocoderMutate: ->
      @eventRouter.emit("autocoderbutton-flash")
      @mutate()

    toggle: (forcedState) ->
      if forcedState is `undefined`
        @active = not @active
      else
        @active = forcedState
      
      if @active
        @autocoderMutateTimeout = setInterval((()=>@autocoderMutate()), 1000)
        if @editor.getValue() is "" or
            ((window.location.hash.indexOf("bookmark") isnt -1) and
            (window.location.hash.indexOf("autocodeTutorial") isnt -1))
          @eventRouter.emit("load-program", "cubesAndSpikes")
      else
        clearInterval @autocoderMutateTimeout
      @eventRouter.emit("autocoder-button-pressed", @active)

# Token types. If they contain a mutate() function, then they can be mutated.

  class TOKEN_COMMENT
    constructor: (@string) ->
    toString: ->
      "COMMENT(" + string + ")"    
      
  class TOKEN_SPACE
    constructor: (@string) ->
    toString: ->
      "SPACE(" + string + ")"
      
  class TOKEN_NEWLINE
    constructor: (@string) ->
    toString: ->
      "<br/>"
      
  class TOKEN_TRANSLATION
    constructor: (@string) ->
    toString: ->
      "TOKEN_TRANSLATION(" + @string + ")"
          
  class TOKEN_VARIABLE
    constructor: (@string) ->
    toString: ->
      "TOKEN_VARIABLE(" + @string + ")"
      
  class TOKEN_NUM
    constructor: (@string) ->
    toString: ->
      "TOKEN_NUM(" + @string + ")"
    mutate: ->
      num = new Number(@string)
      scalar = undefined
      num = 0.1  if 0 is num
      if Math.random() > 0.5
        scalar = (0 - Math.random())
      else
        scalar = Math.random()
      offset = (num * Math.random())
      num += offset
      num = num.toFixed(2)
      @string = num.toString()
      
  class TOKEN_OP
    constructor: (@string) ->
    toString: ->
      "TOKEN_OP(" + @string + ")"
      
  class TOKEN_ARGDLIM
    constructor: (@string) ->
    toString: ->
      "TOKEN_ARGDLIM(" + @string + ")"
      
  class TOKEN_TAB
    constructor: (@string) ->
    toString: ->
      "TOKEN_TAB(" + @string + ")"

  class TOKEN_DOONCE
    constructor: (@string) ->
    toString: ->
      "TOKEN_DOONCE(" + @string + ")"
          
  class TOKEN_MESH
    constructor: (@string) ->
    toString: ->
      "TOKEN_MESH(" + @string + ")"
    mutate: ->
      switch @string
        when "box"
          @string = "ball"
          return
        when "ball"
          @string = "box"
          return
        when "line"
          @string = "rect"
          return
        when "rect"
          @string = "line"
          return

  class TOKEN_STATEFUN
    constructor: (@string) ->
    toString: ->
      "TOKEN_STATEFUN(" + @string + ")"

  class TOKEN_ITERATION
    constructor: (@string) ->
    toString: ->
      "TOKEN_ITERATION(" + @string + ")"  
    mutate: ->
      pat = /\d/
      num = pat.exec(@string)
      if Math.random() > 0.5
        num++
      else
        num--
      @string = num.toString() + " times ->"

  class TOKEN_UNKNOWN
    constructor: (@string) ->
    toString: ->
      "TOKEN_UNKNOWN(" + @string + ")"

  class TOKEN_COLOUR
    constructor: (@string, @colourNames) ->
    toString: ->
      "TOKEN_COLOUR(" + @string + ")"
        
    mutate: ->
      #picking another color at index idx
      idx = Math.floor(Math.random() * @colourNames.length)
      while @string is @colourNames[idx]
        idx = Math.floor(Math.random() * @colourNames.length)
      @string = @colourNames[idx]

  class TOKEN_COLOUROP
    constructor: (@string) ->
    toString: ->
      "TOKEN_COLOUROP(" + @string + ")"

  Autocoder

