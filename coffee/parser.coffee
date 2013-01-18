###
This could be an alternative to the lexer and the many regular expressions used
in the Autocoder and in the CodeTransformer. Not used at the moment. In development
stage.
###

class Parser
  "use strict"

  source = undefined
  sourceLength = undefined
  position = undefined
  finished = true
  
  constructor: ->

  setString: (parseString) ->
    @position = 0
    @source = parseString
    @sourceLength = @source.length
    if parseString isnt ""
      @finished = false
    else
      @finished = true

  pop: ->
    return `undefined`  if @position >= @sourceLength
    c = @source.charAt(@position)
    @position += 1
    @finished = true  if @position >= @sourceLength
    c

  peek: ->
    @source.charAt @position  if @position < @sourceLength

# This should check to see that brackets and string quotes are balanced
class CodeChecker extends Parser
  states: {}
  constructor: ->
    @charHandlers =
    "[": ->
      @states.bracketStack.push "["  if not @states.inSingleString and not @states.inDoubleString and not @states.inComment

    "]": ->
      if not @states.inSingleString and not @states.inDoubleString and not @states.inComment
        b = @states.bracketStack.pop()
        if b isnt "["
          @states.err = true
          @states.message = @generateErrMessage(b)

    "(": ->
      @states.bracketStack.push "("  if not @states.inSingleString and not @states.inDoubleString and not @states.inComment

    ")": ->
      if not @states.inSingleString and not @states.inDoubleString and not @states.inComment
        b = @states.bracketStack.pop()
        if b isnt "("
          @states.err = true
          @states.message = @generateErrMessage(b)

    "{": ->
      @states.bracketStack.push "{"  if not @states.inSingleString and not @states.inDoubleString and not @states.inComment

    "}": ->
      if not @states.inSingleString and not @states.inDoubleString and not @states.inComment
        b = @states.bracketStack.pop()
        if b isnt "{"
          @states.err = true
          @states.message = @generateErrMessage(b)

    "'": ->
      if @states.inComment

      
      # We can ignore quotes in comments
      else if @states.inSingleString
        @states.inSingleString = false
        @states.singleQ -= 1
      else unless @states.inDoubleString
        @states.inSingleString = true
        @states.singleQ += 1

    "\"": ->
      if @states.inComment

      
      # We can ignore quotes in comments
      else if @states.inDoubleString
        @states.inDoubleString = false
        @states.doubleQ -= 1
      else unless @states.inSingleString
        @states.inDoubleString = true
        @states.doubleQ += 1

    "/": ->
      if not @states.inSingleString and not @states.inDoubleString and not @states.inComment
        if @peek() is "/"
          @pop()
          @states.inComment = true

    "\\": ->
      
      # Escaping next character
      @pop()

    "\n": ->
      if @states.inSingleString
        @states.message = @generateErrMessage("'")
        @states.err = true
      else if @states.inDoubleString
        @states.message = @generateErrMessage("\"")
        @states.err = true
      else @states.inComment = false  if @states.inComment

  resetState: ->
    return aFreshlyMadeState =
      err: false
      
      # number of each bracket found
      bracketStack: []
      
      # string quotes
      doubleQ: 0
      singleQ: 0
      
      # states the parser could be in
      inSingleString: false
      inDoubleString: false
      inComment: false
      
      # any error message
      message: ""

  isErr: (s) ->
    if s.bracketStack.length
      b = s.bracketStack.pop()
      @states.message = @generateErrMessage(b)
      s.err = true
    else if s.inSingleString
      @states.message = @generateErrMessage("'")
      s.err = true
    else if s.inDoubleString
      @states.message = @generateErrMessage("\"")
      s.err = true
    s

  generateErrMessage: (token) ->
    message = undefined
    switch token
      when "{"
        message = "Unbalanced {}"
      when "("
        message = "Unbalanced ()"
      when "["
        message = "Unbalanced []"
      when "'"
        message = "Missing '"
      when "\""
        message = "Missing \""
      else
        message = "Unexpected " + token
    message

  parseChar: (c) ->
    @charHandlers[c]()  if @charHandlers[c]

  parse: (source) ->
    c = undefined
    @states = @resetState()
    @setString source
    while not @finished and not @states.err
      c = @pop()
      @parseChar c
    @isErr @states
