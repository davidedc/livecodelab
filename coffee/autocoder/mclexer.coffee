#
#  McLexer: A lexcial analysis system/library for JavaScript.
#  Author:  Matthew Might
#  Site:    http://matt.might.net/
#           http://www.ucombinator.com/
#
#  McLexer associates rules with analysis states.
#
#  Each rule contains a regular expression to match, 
#  and action to execute upon finding a match.
#
#  When a state matches its rules against an input text, 
#  it chooses the rule with the longest match against the prefix 
#  of the input text.
#
# 

#
#  A lexical state is a collection of rules.
#
#  It has three primary methods:
#
#  + lex(input) runs a continuation-based lexer on the input;
#    lex invokes next once, and expects a continuation back;
#    it then invokes the continuation and expects each continuation
#    it invokes to return another continuation.  Once a continuation
#    returns null; parsing is complete.     
#
#  + run(input) runs a match against a input, fires the action.
#    An action is a procedure that accepts the match data (an array),
#    the remainder of the input, and the current state.
#
#  + continuation(input) returns a continuation that, when executed,
#    continues to lex the input.  
#
#  A lexical state itself is also a Curried function, and when
#  executed, it takes a regular expression to match, and then an action
#  to execute upon matching; it adds this pair to its internal list of
#  rules.
#                       
# 
McState = ->
  that = this
  rules = []
  state = (regex) ->
    (action) ->
      rules.push new McRule(regex, action)
      null

  state.rules = rules
  state.lex = (input) ->
    nextCont = state.run(input)    
    nextCont = nextCont()  while typeof nextCont is "function"
    nextCont

  state.run = McRunMethod
  state.continuation = (input) ->
    ->
      state.run input

  state
McRule = (regex, action) ->  
  # Each rule is re-written to match prefixes of the input string.
  @regex = new RegExp("^(" + regex.source + ")")
  @regex.compile @regex  if @regex.compile
  @action = action
  null

McRunMethod = (input) ->
  longestMatchedRule = null
  longestMatch = null
  longestMatchedLength = -1
  
  #console.log("trying to match: " + input)
  i = @rules.length - 1

  while i >= 0
    r = @rules[i]

    m = r.matches(input)

    if m and (m[0].length >= longestMatchedLength)
      longestMatchedRule = r
      longestMatch = m
      longestMatchedLength = m[0].length
    --i
  if longestMatchedRule
    #console.log("found a matching rule")
    longestMatchedRule.action longestMatch, input.substring(longestMatchedLength), this
  else
    throw ("Lexing error; no match found for: '" + input + "'")

# Creates a continuation that switches analysis to another lexical state.  
McCONTINUE = (state) ->
  (match, rest) ->
    state.run rest

McRule::matches = (s) ->
  m = s.match(@regex)
  m.shift()  if m
  m


# For "package-style" access:
McLexer = State: McState