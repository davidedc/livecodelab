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
