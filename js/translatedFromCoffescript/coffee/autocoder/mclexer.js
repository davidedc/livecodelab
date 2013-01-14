var McCONTINUE, McLexer, McRule, McState;

McState = function() {
  var rules, state;
  rules = [];
  state = function(regex) {
    return function(action) {
      rules.push(new McRule(regex, action));
      return null;
    };
  };
  state.rules = rules;
  state.lex = function(input) {
    var nextAction;
    nextAction = state.findAndRunActionPairedToLongestAppliableRegex(input);
    while (typeof nextAction === "function") {
      nextAction = nextAction();
    }
    return nextAction;
  };
  state.findAndRunActionPairedToLongestAppliableRegex = function(input) {
    var i, longestMatch, longestMatchedLength, longestMatchedRule, m, r;
    longestMatchedRule = null;
    longestMatch = null;
    longestMatchedLength = -1;
    i = this.rules.length - 1;
    while (i >= 0) {
      r = this.rules[i];
      m = r.matches(input);
      if (m && (m[0].length >= longestMatchedLength)) {
        longestMatchedRule = r;
        longestMatch = m;
        longestMatchedLength = m[0].length;
      }
      --i;
    }
    if (longestMatchedRule) {
      return longestMatchedRule.action(longestMatch, input.substring(longestMatchedLength), this);
    } else {
      throw "Lexing error; no match found for: '" + input + "'";
    }
  };
  state.returnAFunctionThatAppliesRulesAndRunsActionFor = function(input) {
    return function() {
      return state.findAndRunActionPairedToLongestAppliableRegex(input);
    };
  };
  return state;
};

McRule = function(regex, action) {
  this.regex = new RegExp("^(" + regex.source + ")");
  if (this.regex.compile) {
    this.regex.compile(this.regex);
  }
  this.action = action;
  return null;
};

McCONTINUE = function(state) {
  return function(match, rest) {
    return state.findAndRunActionPairedToLongestAppliableRegex(rest);
  };
};

McRule.prototype.matches = function(s) {
  var m;
  m = s.match(this.regex);
  if (m) {
    m.shift();
  }
  return m;
};

McLexer = {
  State: McState
};
