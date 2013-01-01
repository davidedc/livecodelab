var createCodeChecker, createParsingFunctions;

createParsingFunctions = function() {
  "use strict";

  var Parser, position, source, sourceLength;
  Parser = {};
  source = void 0;
  sourceLength = void 0;
  position = void 0;
  Parser.finished = true;
  Parser.setString = function(parseString) {
    position = 0;
    source = parseString;
    sourceLength = source.length;
    if (parseString !== "") {
      return Parser.finished = false;
    } else {
      return Parser.finished = true;
    }
  };
  Parser.pop = function() {
    var c;
    if (position >= sourceLength) {
      return undefined;
    }
    c = source.charAt(position);
    position += 1;
    if (position >= sourceLength) {
      Parser.finished = true;
    }
    return c;
  };
  Parser.peek = function() {
    if (position < sourceLength) {
      return source.charAt(position);
    }
  };
  return Parser;
};

createCodeChecker = function() {
  "use strict";

  var CodeChecker, generateErrMessage, isErr, setState, states;
  CodeChecker = createParsingFunctions();
  states = {};
  isErr = void 0;
  setState = void 0;
  generateErrMessage = void 0;
  setState = function() {
    var state;
    state = {
      err: false,
      bracketStack: [],
      doubleQ: 0,
      singleQ: 0,
      inSingleString: false,
      inDoubleString: false,
      inComment: false,
      message: ""
    };
    return state;
  };
  isErr = function(s) {
    var b;
    if (s.bracketStack.length > 0) {
      b = s.bracketStack.pop();
      states.message = generateErrMessage(b);
      s.err = true;
    } else if (s.inSingleString) {
      states.message = generateErrMessage("'");
      s.err = true;
    } else if (s.inDoubleString) {
      states.message = generateErrMessage("\"");
      s.err = true;
    }
    return s;
  };
  generateErrMessage = function(token) {
    var message;
    message = void 0;
    switch (token) {
      case "{":
        message = "Unbalanced {}";
        break;
      case "(":
        message = "Unbalanced ()";
        break;
      case "[":
        message = "Unbalanced []";
        break;
      case "'":
        message = "Missing '";
        break;
      case "\"":
        message = "Missing \"";
        break;
      default:
        message = "Unexpected " + token;
    }
    return message;
  };
  CodeChecker.charHandlers = {
    "[": function() {
      if (!states.inSingleString && !states.inDoubleString && !states.inComment) {
        return states.bracketStack.push("[");
      }
    },
    "]": function() {
      var b;
      if (!states.inSingleString && !states.inDoubleString && !states.inComment) {
        b = states.bracketStack.pop();
        if (b !== "[") {
          states.err = true;
          return states.message = generateErrMessage(b);
        }
      }
    },
    "(": function() {
      if (!states.inSingleString && !states.inDoubleString && !states.inComment) {
        return states.bracketStack.push("(");
      }
    },
    ")": function() {
      var b;
      if (!states.inSingleString && !states.inDoubleString && !states.inComment) {
        b = states.bracketStack.pop();
        if (b !== "(") {
          states.err = true;
          return states.message = generateErrMessage(b);
        }
      }
    },
    "{": function() {
      if (!states.inSingleString && !states.inDoubleString && !states.inComment) {
        return states.bracketStack.push("{");
      }
    },
    "}": function() {
      var b;
      if (!states.inSingleString && !states.inDoubleString && !states.inComment) {
        b = states.bracketStack.pop();
        if (b !== "{") {
          states.err = true;
          return states.message = generateErrMessage(b);
        }
      }
    },
    "'": function() {
      if (states.inComment) {

      } else if (states.inSingleString) {
        states.inSingleString = false;
        return states.singleQ -= 1;
      } else if (!states.inDoubleString) {
        states.inSingleString = true;
        return states.singleQ += 1;
      }
    },
    "\"": function() {
      if (states.inComment) {

      } else if (states.inDoubleString) {
        states.inDoubleString = false;
        return states.doubleQ -= 1;
      } else if (!states.inSingleString) {
        states.inDoubleString = true;
        return states.doubleQ += 1;
      }
    },
    "/": function() {
      if (!states.inSingleString && !states.inDoubleString && !states.inComment) {
        if (CodeChecker.peek() === "/") {
          CodeChecker.pop();
          return states.inComment = true;
        }
      }
    },
    "\\": function() {
      return CodeChecker.pop();
    },
    "\n": function() {
      if (states.inSingleString) {
        states.message = generateErrMessage("'");
        return states.err = true;
      } else if (states.inDoubleString) {
        states.message = generateErrMessage("\"");
        return states.err = true;
      } else {
        if (states.inComment) {
          return states.inComment = false;
        }
      }
    }
  };
  CodeChecker.parseChar = function(c) {
    if (CodeChecker.charHandlers[c]) {
      return CodeChecker.charHandlers[c]();
    }
  };
  CodeChecker.parse = function(source) {
    var c;
    c = void 0;
    states = setState();
    CodeChecker.setString(source);
    while (!CodeChecker.finished && !states.err) {
      c = CodeChecker.pop();
      CodeChecker.parseChar(c);
    }
    return isErr(states);
  };
  return CodeChecker;
};

if (typeof exports !== "undefined") {
  exports.simple_checker = {
    createChecker: createCodeChecker,
    createParsingFunctions: createParsingFunctions
  };
}
