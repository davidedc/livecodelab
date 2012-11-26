/*
  McLexer: A lexcial analysis system/library for JavaScript.
  Author:  Matthew Might
  Site:    http://matt.might.net/
           http://www.ucombinator.com/

  McLexer associates rules with analysis states.

  Each rule contains a regular expression to match, 
  and action to execute upon finding a match.

  When a state matches its rules against an input text, 
  it chooses the rule with the longest match against the prefix 
  of the input text.

 */


/*
  A lexical state is a collection of rules.

  It has three primary methods:

  + lex(input) runs a continuation-based lexer on the input;
    lex invokes next once, and expects a continuation back;
    it then invokes the continuation and expects each continuation
    it invokes to return another continuation.  Once a continuation
    returns null; parsing is complete.     

  + run(input) runs a match against a input, fires the action.
    An action is a procedure that accepts the match data (an array),
    the remainder of the input, and the current state.

  + continuation(input) returns a continuation that, when executed,
    continues to lex the input.  

  A lexical state itself is also a Curried function, and when
  executed, it takes a regular expression to match, and then an action
  to execute upon matching; it adds this pair to its internal list of
  rules.
                       
 */
function McState() {

 var that = this ;

 var rules = [] ;
 
 var state = function (regex) {
  return function (action) {
   rules.push(new McRule(regex,action)) ;
  } ;
 } ;

 state.rules = rules ;

 state.lex = function (input) {
   var nextCont = state.run(input) ;
   while (typeof nextCont == "function") {
     nextCont = nextCont() ;
   }
   return nextCont ;
 }

 state.run = McRunMethod ;

 state.continuation = function (input) {
   return function () {
     return state.run(input) ;
   } ;
 }

 return state ;
}


function McRule(regex,action) {
  // Each rule is re-written to match prefixes of the input string.
  this.regex = new RegExp("^(" + regex.source + ")") ;
  if (this.regex.compile) this.regex.compile(this.regex) ;
  this.action = action ;
}

McRule.prototype.matches = function (s) {	
 var m = s.match(this.regex) ;
 if (m) m.shift() ;
 return m ;
} ;


function McRunMethod(input) {
  var longestMatchedRule = null ;
  var longestMatch = null ;
  var longestMatchedLength = -1 ;

  for (var i = this.rules.length-1; i >= 0; --i) {
    var r = this.rules[i] ;

    var m = r.matches (input) ;
    
    if (m && (m[0].length >= longestMatchedLength)) {
      longestMatchedRule = r ;
      longestMatch = m ;
      longestMatchedLength = m[0].length ;
    }
  }
  
  if (longestMatchedRule) {
    return longestMatchedRule.action(longestMatch,input.substring(longestMatchedLength),this) ;
  } else {
    throw ("Lexing error; no match found for: '" + input + "'") ;
  }
}

/* Creates a continuation that switches analysis to another lexical state.  */
function McCONTINUE(state) {
  return function (match, rest) {
    return state.run(rest) ;
  }
}


// For "package-style" access:
var McLexer = {
 State : McState 
} ;







