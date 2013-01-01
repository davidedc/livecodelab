#jslint devel: true 
#global McLexer 

createAutocoder = (eventRouter, editor, colourNames) ->
  "use strict"
  blinkingAutocoderStatus = false
  autocoderMutateTimeout = undefined
  numberOfResults = 0
  whichOneToChange = 0
  scanningAllColors = undefined
  autocoder = {}
  autocoder.active = false
  
  # The Tokens array will contain all of the tokens in the form of functions.
  Tokens = []
  
  # Lexing states. There are no particular states so far.
  INIT = new McLexer.State()
  
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
      idx = Math.floor(Math.random() * colourNames.length)
      idx = Math.floor(Math.random() * colourNames.length)  while @string is colourNames[idx]
      @string = colourNames[idx]
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

  
  # Rules are used to
  #
  # * define how tokens are picked up from text (i.e. which regex)
  #
  # * how the lexer behaves depending on different states. This is currently not used.
  INIT(/\/\/.*\n/) (match, rest, state) ->
    Tokens.push new COMMENT(match[0])
    state.continuation rest

  INIT(/\t/) (match, rest, state) ->
    Tokens.push new TAB(match[0])
    state.continuation rest

  INIT(/-?[0-9]+\.?[0-9]*/) (match, rest, state) ->
    Tokens.push new NUM(match[0])
    state.continuation rest

  INIT(/-?\.[0-9]*/) (match, rest, state) ->
    Tokens.push new NUM(match[0])
    state.continuation rest

  INIT(/[*|\/|+|\-|=]/) (match, rest, state) ->
    Tokens.push new OP(match[0])
    state.continuation rest

  INIT(/,/) (match, rest, state) ->
    Tokens.push new ARGDLIM(match[0])
    state.continuation rest

  INIT(/[\n|\r]{1,2}/) (match, rest, state) ->
    Tokens.push new NEWLINE(match[0])
    state.continuation rest

  
  # translations
  INIT(/rotate/) (match, rest, state) ->
    Tokens.push new TRANSLATION(match[0])
    state.continuation rest

  INIT(/move/) (match, rest, state) ->
    Tokens.push new TRANSLATION(match[0])
    state.continuation rest

  INIT(/scale/) (match, rest, state) ->
    Tokens.push new TRANSLATION(match[0])
    state.continuation rest

  
  # colour
  scanningAllColors = 0
  while scanningAllColors < colourNames.length
    INIT(new RegExp(colourNames[scanningAllColors])) (match, rest, state) ->
      Tokens.push new COLOUR(match[0])
      state.continuation rest

    scanningAllColors++
  
  # colour ops
  INIT(/background/) (match, rest, state) ->
    Tokens.push new COLOUROP(match[0])
    state.continuation rest

  INIT(/fill/) (match, rest, state) ->
    Tokens.push new COLOUROP(match[0])
    state.continuation rest

  INIT(/stroke/) (match, rest, state) ->
    Tokens.push new COLOUROP(match[0])
    state.continuation rest

  
  # hmm  TODO
  INIT(/simpleGradient/) (match, rest, state) ->
    Tokens.push new COLOUROP(match[0])
    state.continuation rest

  
  # mesh
  INIT(/box/) (match, rest, state) ->
    Tokens.push new MESH(match[0])
    state.continuation rest

  INIT(/ball/) (match, rest, state) ->
    Tokens.push new MESH(match[0])
    state.continuation rest

  INIT(/peg/) (match, rest, state) ->
    Tokens.push new MESH(match[0])
    state.continuation rest

  INIT(/rect/) (match, rest, state) ->
    Tokens.push new MESH(match[0])
    state.continuation rest

  INIT(/line/) (match, rest, state) ->
    Tokens.push new MESH(match[0])
    state.continuation rest

  
  # state changes?
  INIT(/ambientLight/) (match, rest, state) ->
    Tokens.push new STATEFUN(match[0])
    state.continuation rest

  INIT(/noStroke/) (match, rest, state) ->
    Tokens.push new STATEFUN(match[0])
    state.continuation rest

  INIT(/ballDetail/) (match, rest, state) ->
    Tokens.push new STATEFUN(match[0])
    state.continuation rest

  INIT(/animationStyle\s\w+/) (match, rest, state) ->
    Tokens.push new STATEFUN(match[0])
    state.continuation rest

  
  # iteration
  INIT(/\d+\s+times\s+->/) (match, rest, state) ->
    Tokens.push new ITERATION(match[0])
    state.continuation rest

  
  # vars
  INIT(/time/) (match, rest, state) ->
    Tokens.push new VARIABLE(match[0])
    state.continuation rest

  INIT(/delay/) (match, rest, state) ->
    Tokens.push new VARIABLE(match[0])
    state.continuation rest

  
  # special
  INIT(/\?doOnce\s+->\s*/) (match, rest, state) ->
    Tokens.push new DOONCE(match[0])
    state.continuation rest

  
  # ignore white space ?
  INIT(RegExp(" +")) (match, rest, state) ->
    Tokens.push new SPACE(match[0])
    state.continuation rest

  
  # The bad stuff
  
  # string delimiters
  INIT(/'/) (match, rest, state) ->
    Tokens.push new UNKNOWN(match[0])
    state.continuation rest

  INIT(/[✓]?doOnce\s+\->?/) (match, rest, state) ->
    Tokens.push new UNKNOWN(match[0])
    state.continuation rest

  INIT(RegExp("==")) (match, rest, state) ->
    Tokens.push new UNKNOWN(match[0])
    state.continuation rest

  INIT(/else/) (match, rest, state) ->
    Tokens.push new UNKNOWN(match[0])
    state.continuation rest

  
  # this is for the links at the bottom of the tutorials
  # e.g. next-tutorial:frame
  INIT(/next-tutorial:\w+/) (match, rest, state) ->
    Tokens.push new UNKNOWN(match[0])
    state.continuation rest

  
  # this is for all variable names
  INIT(/\w+/) (match, rest, state) ->
    Tokens.push new UNKNOWN(match[0])
    state.continuation rest

  INIT(/if/) (match, rest, state) ->
    Tokens.push new UNKNOWN(match[0])
    state.continuation rest

  INIT(/pushMatrix/) (match, rest, state) ->
    Tokens.push new UNKNOWN(match[0])
    state.continuation rest

  INIT(/popMatrix/) (match, rest, state) ->
    Tokens.push new UNKNOWN(match[0])
    state.continuation rest

  INIT(/play/) (match, rest, state) ->
    Tokens.push new UNKNOWN(match[0])
    state.continuation rest

  INIT(/bpm/) (match, rest, state) ->
    Tokens.push new UNKNOWN(match[0])
    state.continuation rest

  INIT(/color\s*\(.+\)/) (match, rest, state) ->
    Tokens.push new UNKNOWN(match[0])
    state.continuation rest

  INIT(/noFill/) (match, rest, state) ->
    Tokens.push new UNKNOWN(match[0])
    state.continuation rest

  INIT(/frame/) (match, rest, state) ->
    Tokens.push new UNKNOWN(match[0])
    state.continuation rest

  INIT(/strokeSize/) (match, rest, state) ->
    Tokens.push new UNKNOWN(match[0])
    state.continuation rest

  INIT(/\(/) (match, rest, state) ->
    Tokens.push new UNKNOWN(match[0])
    state.continuation rest

  INIT(/\)/) (match, rest, state) ->
    Tokens.push new UNKNOWN(match[0])
    state.continuation rest

  INIT(/%/) (match, rest, state) ->
    Tokens.push new UNKNOWN(match[0])
    state.continuation rest

  
  # Traverses the Tokens array and concatenates the strings, hence generating a possibly mutated program.
  emit = (stream) ->
    ret = ""
    scanningTheStream = undefined
    scanningTheStream = 0
    while scanningTheStream < stream.length
      ret = ret + stream[scanningTheStream].string
      scanningTheStream++
    ret

  
  # Checks whether a token can mutate by checking whether the mutate function exists.
  canMutate = (token) ->
    if typeof token.mutate is "function"
      true
    else
      false

  
  # Scans the tokens and collects the mutatable ones. Then picks one random and invokes its mutate().
  pickMutatableTokenAndMutateIt = (stream) ->
    mutatableTokens = []
    scanningTheStream = undefined
    idx = undefined
    scanningTheStream = 0
    while scanningTheStream < stream.length
      mutatableTokens.push scanningTheStream  if canMutate(stream[scanningTheStream])
      scanningTheStream++
    return  if 0 is mutatableTokens.length
    idx = Math.floor(Math.random() * mutatableTokens.length)
    stream[mutatableTokens[idx]].mutate()

  
  # Currently unused.
  replaceTimeWithAConstant = ->
    editorContent = editor.getValue()
    rePattern = /(time)/g
    allMatches = editorContent.match(rePattern)
    countWhichOneToSwap = 0
    if allMatches is null
      numberOfResults = 0
    else
      numberOfResults = allMatches.length
    whichOneToChange = Math.floor(Math.random() * numberOfResults) + 1
    editorContent = editorContent.replace(rePattern, (match, text, urlId) ->
      countWhichOneToSwap++
      return "" + Math.floor(Math.random() * 20) + 1  if countWhichOneToSwap is whichOneToChange
      match
    )
    editor.setValue editorContent

  
  # Every time a mutation is invoked, the following happens
  #
  # * the program is scanned by a lexer
  # the lexer could maintain/change/act on an user-defined state based on what it
  # encounters but for the time being that is not used. So for the time being in practice the lexer
  # parses the tokens based on regular expressions without using states.
  # The definitions of what constitutes a token is defined by regexes in the "rules" section
  #
  # * for each token, a function is added to the Token array. For example "rotate 20" creates two
  # tokens, which are two functions TRANSLATE and NUM
  #
  # * each of the "token" functions contains a) a string representation from the text in the program
  # e.g. in the example above "rotate" and "20" and b) an accessory function for printout of the token and
  # c) optionally, a function mutate() that changes the string of the field of a) with a mutated string
  #
  # * the token list is scanned. Each function is checked for whether it contains a "mutate"
  # function. If yes, then it's added as a candidate to an "mutatableTokens" array.
  #
  # * a random option is picked and mutate is ran for that token
  #
  # * the token list is traversed and the strings are appended one to another, creating the new
  # mutated program.
  mutate = ->
    editorContent = editor.getValue()
    newContent = undefined
    Tokens = []
    try
      INIT.lex editorContent
    catch e
      #console.log e
    pickMutatableTokenAndMutateIt Tokens
    newContent = emit(Tokens)
    editor.setValue newContent

  autocoderMutate = ->
    eventRouter.trigger "autocoderbutton-flash"
    mutate()

  toggle = (active) ->
    if active is `undefined`
      autocoder.active = not autocoder.active
    else
      autocoder.active = active
    if autocoder.active
      autocoderMutateTimeout = setInterval(autocoderMutate, 1000)
      eventRouter.trigger "load-program", "cubesAndSpikes"  if editor.getValue() is "" or ((window.location.hash.indexOf("bookmark") isnt -1) and (window.location.hash.indexOf("autocodeTutorial") isnt -1))
    else
      clearInterval autocoderMutateTimeout
    eventRouter.trigger "autocoder-button-pressed", autocoder.active

  
  # Setup Event Listeners
  eventRouter.bind "reset", ->
    toggle false

  eventRouter.bind "toggle-autocoder", ->
    toggle()

  autocoder