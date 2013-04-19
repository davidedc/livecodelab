/*
## This could be an alternative to the lexer and the many regular expressions used
## in the Autocoder and in the CodeTransformer. Not used at the moment. In development
## stage.
*/

var CodeChecker, Parser,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Parser = (function() {
  "use strict";
  var finished, position, source, sourceLength;

  source = void 0;

  sourceLength = void 0;

  position = void 0;

  finished = true;

  function Parser() {}

  Parser.prototype.setString = function(parseString) {
    this.position = 0;
    this.source = parseString;
    this.sourceLength = this.source.length;
    if (parseString !== "") {
      return this.finished = false;
    } else {
      return this.finished = true;
    }
  };

  Parser.prototype.pop = function() {
    var c;

    if (this.position >= this.sourceLength) {
      return undefined;
    }
    c = this.source.charAt(this.position);
    this.position += 1;
    if (this.position >= this.sourceLength) {
      this.finished = true;
    }
    return c;
  };

  Parser.prototype.peek = function() {
    if (this.position < this.sourceLength) {
      return this.source.charAt(this.position);
    }
  };

  return Parser;

})();

CodeChecker = (function(_super) {
  __extends(CodeChecker, _super);

  CodeChecker.prototype.states = {};

  function CodeChecker() {
    this.charHandlers = {
      "[": function() {
        if (!this.states.inSingleString && !this.states.inDoubleString && !this.states.inComment) {
          return this.states.bracketStack.push("[");
        }
      },
      "]": function() {
        var b;

        if (!this.states.inSingleString && !this.states.inDoubleString && !this.states.inComment) {
          b = this.states.bracketStack.pop();
          if (b !== "[") {
            this.states.err = true;
            return this.states.message = this.generateErrMessage(b);
          }
        }
      },
      "(": function() {
        if (!this.states.inSingleString && !this.states.inDoubleString && !this.states.inComment) {
          return this.states.bracketStack.push("(");
        }
      },
      ")": function() {
        var b;

        if (!this.states.inSingleString && !this.states.inDoubleString && !this.states.inComment) {
          b = this.states.bracketStack.pop();
          if (b !== "(") {
            this.states.err = true;
            return this.states.message = this.generateErrMessage(b);
          }
        }
      },
      "{": function() {
        if (!this.states.inSingleString && !this.states.inDoubleString && !this.states.inComment) {
          return this.states.bracketStack.push("{");
        }
      },
      "}": function() {
        var b;

        if (!this.states.inSingleString && !this.states.inDoubleString && !this.states.inComment) {
          b = this.states.bracketStack.pop();
          if (b !== "{") {
            this.states.err = true;
            return this.states.message = this.generateErrMessage(b);
          }
        }
      },
      "'": function() {
        if (this.states.inComment) {

        } else if (this.states.inSingleString) {
          this.states.inSingleString = false;
          return this.states.singleQ -= 1;
        } else if (!this.states.inDoubleString) {
          this.states.inSingleString = true;
          return this.states.singleQ += 1;
        }
      },
      "\"": function() {
        if (this.states.inComment) {

        } else if (this.states.inDoubleString) {
          this.states.inDoubleString = false;
          return this.states.doubleQ -= 1;
        } else if (!this.states.inSingleString) {
          this.states.inDoubleString = true;
          return this.states.doubleQ += 1;
        }
      },
      "/": function() {
        if (!this.states.inSingleString && !this.states.inDoubleString && !this.states.inComment) {
          if (this.peek() === "/") {
            this.pop();
            return this.states.inComment = true;
          }
        }
      },
      "\\": function() {
        return this.pop();
      },
      "\n": function() {
        if (this.states.inSingleString) {
          this.states.message = this.generateErrMessage("'");
          return this.states.err = true;
        } else if (this.states.inDoubleString) {
          this.states.message = this.generateErrMessage("\"");
          return this.states.err = true;
        } else {
          if (this.states.inComment) {
            return this.states.inComment = false;
          }
        }
      }
    };
  }

  CodeChecker.prototype.resetState = function() {
    var aFreshlyMadeState;

    return aFreshlyMadeState = {
      err: false,
      bracketStack: [],
      doubleQ: 0,
      singleQ: 0,
      inSingleString: false,
      inDoubleString: false,
      inComment: false,
      message: ""
    };
  };

  CodeChecker.prototype.isErr = function(s) {
    var b;

    if (s.bracketStack.length) {
      b = s.bracketStack.pop();
      this.states.message = this.generateErrMessage(b);
      s.err = true;
    } else if (s.inSingleString) {
      this.states.message = this.generateErrMessage("'");
      s.err = true;
    } else if (s.inDoubleString) {
      this.states.message = this.generateErrMessage("\"");
      s.err = true;
    }
    return s;
  };

  CodeChecker.prototype.generateErrMessage = function(token) {
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

  CodeChecker.prototype.parseChar = function(c) {
    if (this.charHandlers[c]) {
      return this.charHandlers[c]();
    }
  };

  CodeChecker.prototype.parse = function(source) {
    var c;

    c = void 0;
    this.states = this.resetState();
    this.setString(source);
    while (!this.finished && !this.states.err) {
      c = this.pop();
      this.parseChar(c);
    }
    return this.isErr(this.states);
  };

  return CodeChecker;

})(Parser);
