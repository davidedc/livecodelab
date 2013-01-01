# this file isn't currently used

createParsingFunctions = ->
  "use strict"
  Parser = {}
  source = undefined
  sourceLength = undefined
  position = undefined
  Parser.finished = true
  Parser.setString = (parseString) ->
    position = 0
    source = parseString
    sourceLength = source.length
    if parseString isnt ""
      Parser.finished = false
    else
      Parser.finished = true

  Parser.pop = ->
    return `undefined`  if position >= sourceLength
    c = source.charAt(position)
    position += 1
    Parser.finished = true  if position >= sourceLength
    c

  Parser.peek = ->
    source.charAt position  if position < sourceLength

  Parser


# This should check to see that brackets and string quotes are balanced
createCodeChecker = ->
  "use strict"
  CodeChecker = createParsingFunctions()
  states = {}
  isErr = undefined
  setState = undefined
  generateErrMessage = undefined
  setState = ->
    state =
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

    state

  isErr = (s) ->
    if s.bracketStack.length > 0
      b = s.bracketStack.pop()
      states.message = generateErrMessage(b)
      s.err = true
    else if s.inSingleString
      states.message = generateErrMessage("'")
      s.err = true
    else if s.inDoubleString
      states.message = generateErrMessage("\"")
      s.err = true
    s

  generateErrMessage = (token) ->
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

  CodeChecker.charHandlers =
    "[": ->
      states.bracketStack.push "["  if not states.inSingleString and not states.inDoubleString and not states.inComment

    "]": ->
      if not states.inSingleString and not states.inDoubleString and not states.inComment
        b = states.bracketStack.pop()
        if b isnt "["
          states.err = true
          states.message = generateErrMessage(b)

    "(": ->
      states.bracketStack.push "("  if not states.inSingleString and not states.inDoubleString and not states.inComment

    ")": ->
      if not states.inSingleString and not states.inDoubleString and not states.inComment
        b = states.bracketStack.pop()
        if b isnt "("
          states.err = true
          states.message = generateErrMessage(b)

    "{": ->
      states.bracketStack.push "{"  if not states.inSingleString and not states.inDoubleString and not states.inComment

    "}": ->
      if not states.inSingleString and not states.inDoubleString and not states.inComment
        b = states.bracketStack.pop()
        if b isnt "{"
          states.err = true
          states.message = generateErrMessage(b)

    "'": ->
      if states.inComment

      
      # We can ignore quotes in comments
      else if states.inSingleString
        states.inSingleString = false
        states.singleQ -= 1
      else unless states.inDoubleString
        states.inSingleString = true
        states.singleQ += 1

    "\"": ->
      if states.inComment

      
      # We can ignore quotes in comments
      else if states.inDoubleString
        states.inDoubleString = false
        states.doubleQ -= 1
      else unless states.inSingleString
        states.inDoubleString = true
        states.doubleQ += 1

    "/": ->
      if not states.inSingleString and not states.inDoubleString and not states.inComment
        if CodeChecker.peek() is "/"
          CodeChecker.pop()
          states.inComment = true

    "\\": ->
      
      # Escaping next character
      CodeChecker.pop()

    "\n": ->
      if states.inSingleString
        states.message = generateErrMessage("'")
        states.err = true
      else if states.inDoubleString
        states.message = generateErrMessage("\"")
        states.err = true
      else states.inComment = false  if states.inComment

  CodeChecker.parseChar = (c) ->
    CodeChecker.charHandlers[c]()  if CodeChecker.charHandlers[c]

  CodeChecker.parse = (source) ->
    c = undefined
    states = setState()
    CodeChecker.setString source
    while not CodeChecker.finished and not states.err
      c = CodeChecker.pop()
      CodeChecker.parseChar c
    isErr states

  CodeChecker


# Add support for CommonJS. Just put this file somewhere on your require.paths
# and you will be able to `var js_beautify = require("beautify").js_beautify`.
if typeof exports isnt "undefined"
  exports.simple_checker =
    createChecker: createCodeChecker
    createParsingFunctions: createParsingFunctions