###
## Lexer is a variation/port of:
## 
## McLexer: A lexical analysis system/library for JavaScript.
## Author:  Matthew Might
## Site:    http://matt.might.net/
##          http://www.ucombinator.com/
## 
## The lexer associates rules with analysis states.
## 
## Each rule contains a regular expression to match, 
## and action to execute upon finding a match.
## 
## When a state matches its rules against an input text, 
## it chooses the rule with the longest match against the prefix 
## of the input text.
## 
## A lexical state is a collection of rules.
## 
## It has three primary methods:
## 
## + lex(input) runs a continuation-based lexer on the input;
##   lex invokes next once, and expects a continuation back;
##   it then invokes the continuation and expects each continuation
##   it invokes to return another continuation.  Once a continuation
##   returns null; parsing is complete.     
## 
## + findAndRunActionPairedToLongestAppliableRegex(input) runs a match against an input,
##   fires the action.
##   An action is a procedure that accepts the match data (an array),
##   the remainder of the input, and the current state and returns a function that
##   applies the rules again and finds and runs the next action. An action does not run
##   the next one (that would be recursion). Rather, it returns a function to find and
##   run the next one
## 
## Why this "step by step" approach instead of a normal recursion? The advantage is
## that you can stop the parsing and resume it any time you want. Suppose that
## you have a huge program to parse. With recursion, once you start you can't
## stop until the end (at least if you are using normal recursion as provided by
## the language runtime. If you implement your own recursion using your own stack
## then you could indeed pause/resume things). In a single-threaded language like
## Javascript this results in everything else "blocking". A "continuations" approach
## lets you stop and resume the parsing more easily, since you lex the program step
## by step in a manner that does not rely on the runtime stack. There is no recursion.
###

define () ->

  ###
  ## Each rule contains a regular expression to match, 
  ## and action to execute upon finding a match.
  ###

  class LexerRule
    constructor: (@regex, @action) ->  
      # Each rule is re-written to match prefixes of the input string.
      @regex = new RegExp("^(" + @regex.source + ")")
      @regex.compile @regex  if @regex.compile
    matches: (s) ->
      m = s.match(@regex)
      m.shift()  if m
      m

  class LexerState
    rules: []

    addRule: (regex, action) ->
        @rules.push new LexerRule(regex, action)
    
    lex: (input) ->
      # findAndRunActionPairedToLongestAppliableRegex returns an action triggered by the
      # longest regex appliable. An action is a function that takes the current matched
      # part of the input, the remaining part of the input and the current state. It can
      # do anything, but it must return a function that applies rules to the remaining
      # part of the input and finds the next action.
      # So note here that nextAction is a function that does stuff and returns a function
      # to find the next action. We are not running it yet.
      nextAction = @findAndRunActionPairedToLongestAppliableRegex(input)    
      while typeof nextAction is "function"
        # OK an action has been returned. Now by running it the action does some custom
        # stuff and then it returns a function that finds the next action. So continue to
        # run the action spawned by each action until no action is returned.
        nextAction = nextAction()
      return nextAction

    findAndRunActionPairedToLongestAppliableRegex: (input) ->
      longestMatchedRule = null
      longestMatch = null
      longestMatchedLength = -1
      
      #console.log("trying to match: " + input)
      for i in [@rules.length-1..0]
        r = @rules[i]
        
        m = r.matches(input)
        
        if m and (m[0].length >= longestMatchedLength)
          longestMatchedRule = r
          longestMatch = m
          longestMatchedLength = m[0].length
      if longestMatchedRule
        #console.log("found a matching rule")
        # now return the result of the action, which is the next action
        return (longestMatchedRule.action(longestMatch, input.substring(longestMatchedLength), this))
      else
        throw ("Lexing error; no match found for: '" + input + "'")

    returnAFunctionThatAppliesRulesAndRunsActionFor: (input) ->
      =>
        @findAndRunActionPairedToLongestAppliableRegex input

  # Creates a continuation that switches analysis to another lexical state.  
  #McCONTINUE = (state) ->
  #  (match, rest) ->
  #    state.findAndRunActionPairedToLongestAppliableRegex rest

  LexerState

