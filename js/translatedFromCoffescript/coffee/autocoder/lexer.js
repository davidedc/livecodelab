/*
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
*/

var LexerRule, LexerState;

LexerState = (function() {
  function LexerState() {}

  LexerState.prototype.rules = [];

  LexerState.prototype.addRule = function(regex, action) {
    return this.rules.push(new LexerRule(regex, action));
  };

  LexerState.prototype.lex = function(input) {
    var nextAction;

    nextAction = this.findAndRunActionPairedToLongestAppliableRegex(input);
    while (typeof nextAction === "function") {
      nextAction = nextAction();
    }
    return nextAction;
  };

  LexerState.prototype.findAndRunActionPairedToLongestAppliableRegex = function(input) {
    var i, longestMatch, longestMatchedLength, longestMatchedRule, m, r, _i, _ref;

    longestMatchedRule = null;
    longestMatch = null;
    longestMatchedLength = -1;
    for (i = _i = _ref = this.rules.length - 1; _ref <= 0 ? _i <= 0 : _i >= 0; i = _ref <= 0 ? ++_i : --_i) {
      r = this.rules[i];
      m = r.matches(input);
      if (m && (m[0].length >= longestMatchedLength)) {
        longestMatchedRule = r;
        longestMatch = m;
        longestMatchedLength = m[0].length;
      }
    }
    if (longestMatchedRule) {
      return longestMatchedRule.action(longestMatch, input.substring(longestMatchedLength), this);
    } else {
      throw "Lexing error; no match found for: '" + input + "'";
    }
  };

  LexerState.prototype.returnAFunctionThatAppliesRulesAndRunsActionFor = function(input) {
    var _this = this;

    return function() {
      return _this.findAndRunActionPairedToLongestAppliableRegex(input);
    };
  };

  return LexerState;

})();

/*
## Each rule contains a regular expression to match, 
## and action to execute upon finding a match.
*/


LexerRule = (function() {
  function LexerRule(regex, action) {
    this.regex = regex;
    this.action = action;
    this.regex = new RegExp("^(" + this.regex.source + ")");
    if (this.regex.compile) {
      this.regex.compile(this.regex);
    }
  }

  LexerRule.prototype.matches = function(s) {
    var m;

    m = s.match(this.regex);
    if (m) {
      m.shift();
    }
    return m;
  };

  return LexerRule;

})();
