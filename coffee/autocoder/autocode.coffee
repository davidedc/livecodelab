#jslint devel: true 
#global McLexer 

"use strict"
class Autocoder
  
  active = false
  autocoderMutateTimeout = undefined
  numberOfResults = 0
  whichOneToChange = 0
  
  constructor: (@eventRouter, @editor, @colourNames) ->
    
    # The Tokens array will contain all of the tokens in the form of functions.
    @Tokens = []
    
    # Lexing states. There is only one state so far.
    # McState.State() returns a function that takes a regex and returns a function that
    # takes an action and pushes it into a rules array (which is made of pairs of regexes,
    # actions)
    @LexersOnlyState = new McLexer.State()

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
    # So, for example @LexersOnlyState(/\t/) returns a function that
    # takes an action and pushes it into a rules array (which is made of pairs of regexes,
    # actions)
    # So:
    #   (matchedPartOfInput, remainingInput, state) =>
    #     @Tokens.push new TAB(matchedPartOfInput[0])
    #     return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput
    # is an action. The action, when its rule is activated, just adds a TAB object to
    # the @Tokens list and returns a function that finds and runs the next action
    # appliable to the remaining input. Note that an action does not find and run another
    # action. It just returns a function that finds and runs another action.
    #
    # So a complete paragraph below like this one:
    #   @LexersOnlyState(/\t/) (matchedPartOfInput, remainingInput, state) =>
    #     @Tokens.push new TAB(matchedPartOfInput[0])
    #     return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput
    # defines a rule as the pair "regex, action" as discussed above.
    #
    # Why this "step by step" approach instead of a normal recursion? The advantage is
    # that you can stop the parsing and resume it any time you want. Suppose that
    # you have a huge program to parse. With recursion, once you start you can't
    # stop until the end (at least if you are using normal recursion as provided by
    # the language runtime. If you implement your own recursion using your own stack
    # then you could indeed pause/resume things). A "continuations" approach lets you
    # stop and resume the parsing more easily, since you lex the program step by step
    # in a manner that does not rely on the runtime stack. There is no recursion.

    
    @LexersOnlyState(/\/\/.*\n/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new COMMENT(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput
  
    @LexersOnlyState(/\t/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new TAB(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput
  
    @LexersOnlyState(/-?[0-9]+\.?[0-9]*/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new NUM(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput
  
    @LexersOnlyState(/-?\.[0-9]*/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new NUM(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

    @LexersOnlyState(/[*|\/|+|\-|=]/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new OP(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

    @LexersOnlyState(/,/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new ARGDLIM(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

    @LexersOnlyState(/[\n|\r]{1,2}/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new NEWLINE(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

  
    # translations
    @LexersOnlyState(/rotate/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new TRANSLATION(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

    @LexersOnlyState(/move/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new TRANSLATION(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

    @LexersOnlyState(/scale/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new TRANSLATION(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

  
    # colour
    scanningAllColors = 0
    while scanningAllColors < @colourNames.length
      @LexersOnlyState(new RegExp(@colourNames[scanningAllColors])) (matchedPartOfInput, remainingInput, state) =>
        @Tokens.push new COLOUR(matchedPartOfInput[0])
        return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput
      scanningAllColors++
  
    # colour ops
    @LexersOnlyState(/background/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new COLOUROP(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

    @LexersOnlyState(/fill/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new COLOUROP(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

    @LexersOnlyState(/stroke/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new COLOUROP(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

  
    # hmm  TODO
    @LexersOnlyState(/simpleGradient/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new COLOUROP(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

  
    # mesh
    @LexersOnlyState(/box/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new MESH(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

    @LexersOnlyState(/ball/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new MESH(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

    @LexersOnlyState(/peg/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new MESH(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

    @LexersOnlyState(/rect/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new MESH(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

    @LexersOnlyState(/line/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new MESH(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

  
    # state changes?
    @LexersOnlyState(/ambientLight/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new STATEFUN(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

    @LexersOnlyState(/noStroke/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new STATEFUN(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

    @LexersOnlyState(/ballDetail/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new STATEFUN(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

    @LexersOnlyState(/animationStyle\s\w+/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new STATEFUN(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

  
    # iteration
    @LexersOnlyState(/\d+\s+times\s+->/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new ITERATION(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

  
    # vars
    @LexersOnlyState(/time/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new VARIABLE(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

    @LexersOnlyState(/delay/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new VARIABLE(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

  
    # special
    @LexersOnlyState(/\?doOnce\s+->\s*/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new DOONCE(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

  
    # ignore white space ?
    @LexersOnlyState(RegExp(" +")) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new SPACE(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

  
    # The bad stuff
  
    # string delimiters
    @LexersOnlyState(/'/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new UNKNOWN(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput
  
    @LexersOnlyState(/[✓]?doOnce\s+\->?/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new UNKNOWN(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

    @LexersOnlyState(RegExp("==")) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new UNKNOWN(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

    @LexersOnlyState(/else/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new UNKNOWN(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

  
    # this is for the links at the bottom of the tutorials
    # e.g. next-tutorial:frame
    @LexersOnlyState(/next-tutorial:\w+/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new UNKNOWN(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

  
    # this is for all variable names
    @LexersOnlyState(/\w+/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new UNKNOWN(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

    @LexersOnlyState(/if/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new UNKNOWN(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

    @LexersOnlyState(/pushMatrix/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new UNKNOWN(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

    @LexersOnlyState(/popMatrix/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new UNKNOWN(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

    @LexersOnlyState(/play/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new UNKNOWN(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

    @LexersOnlyState(/bpm/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new UNKNOWN(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

    @LexersOnlyState(/color\s*\(.+\)/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new UNKNOWN(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

    @LexersOnlyState(/noFill/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new UNKNOWN(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

    @LexersOnlyState(/frame/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new UNKNOWN(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

    @LexersOnlyState(/strokeSize/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new UNKNOWN(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

    @LexersOnlyState(/\(/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new UNKNOWN(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

    @LexersOnlyState(/\)/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new UNKNOWN(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput

    @LexersOnlyState(/%/) (matchedPartOfInput, remainingInput, state) =>
      @Tokens.push new UNKNOWN(matchedPartOfInput[0])
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor remainingInput
    
    # Token types. If they contain a mutate() function, then they can be mutated.
    COMMENT = (string) ->
      @string = string
      @toString = ->
        "COMMENT(" + string + ")"
      null
    
    SPACE = (string) ->
      @string = string
      @toString = ->
        "SPACE(" + string + ")"
      null
    
    NEWLINE = (string) ->
      @string = string
      @toString = ->
        "<br/>"
      null
    
    TRANSLATION = (string) ->
      @string = string
      @toString = ->
        "TRANSLATION(" + string + ")"
      null
    
    VARIABLE = (string) ->
      @string = string
      @toString = ->
        "VARIABLE(" + string + ")"
      null
    
    NUM = (string) ->
      @string = string
      @toString = ->
        "NUM(" + string + ")"
      @mutate = ->
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
      null

    
    OP = (string) ->
      @string = string
      @toString = ->
        "OP(" + string + ")"
      null
    
    ARGDLIM = (string) ->
      @string = string
      @toString = ->
        "ARGDLIM(" + string + ")"
      null
    
    TAB = (string) ->
      @string = string
      @toString = ->
        "TAB(" + string + ")"
      null
    
    DOONCE = (string) ->
      @string = string
      @toString = ->
        "DOONCE(" + string + ")"
      null
    
    COLOUROP = (string) ->
      @string = string
      @toString = ->
        "COLOUROP(" + string + ")"
      null
    
    COLOUR = (string) ->
      @string = string
      @toString = ->
        "COLOUR(" + string + ")"
      
      @mutate = ->
        idx = Math.floor(Math.random() * @colourNames.length)
        while @string is @colourNames[idx]
          idx = Math.floor(Math.random() * @colourNames.length)
        @string = @colourNames[idx]
      null

    MESH = (string) ->
      @string = string
      @toString = ->
        "MESH(" + string + ")"
      
      @mutate = ->
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
      null

    STATEFUN = (string) ->
      @string = string
      @toString = ->
        "STATEFUN(" + string + ")"
      null
    
    ITERATION = (string) ->
      @string = string
      @toString = ->
        "ITERATION(" + string + ")"
      
      @mutate = ->
        pat = /\d/
        num = pat.exec(@string)
        if Math.random() > 0.5
          num++
        else
          num--
        @string = num.toString() + " times ->"
      null

    UNKNOWN = (string) ->
      @string = string
      @toString = ->
        "UNKNOWN(" + string + ")"
      null

  

  
  # Traverses the Tokens array and concatenates the strings,
  # hence generating a possibly mutated program.
  emit: (stream) ->
    ret = ""
    scanningTheStream = 0
    while scanningTheStream < stream.length
      ret = ret + stream[scanningTheStream].string
      scanningTheStream++
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
    scanningTheStream = 0
    # collect the items that can be mutated
    while scanningTheStream < stream.length
      if @canMutate(stream[scanningTheStream])
        mutatableTokens.push scanningTheStream
      scanningTheStream++
    if mutatableTokens.length == 0
      #nothing can be mutated
      return
    #found at least a mutatable token, pick one at random and mutate it
    idx = Math.floor(Math.random() * mutatableTokens.length)
    stream[mutatableTokens[idx]].mutate()

  
  # Currently unused.
  replaceTimeWithAConstant: ->
    editorContent = @editor.getValue()
    rePattern = /(time)/g
    allMatches = editorContent.match(rePattern)
    countWhichOneToSwap = 0
    if allMatches is null
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
    @eventRouter.trigger "autocoderbutton-flash"
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
        @eventRouter.trigger "load-program", "cubesAndSpikes"
    else
      clearInterval @autocoderMutateTimeout
    @eventRouter.trigger "autocoder-button-pressed", @active
