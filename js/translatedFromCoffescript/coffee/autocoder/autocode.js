"use strict";

var Autocoder;

Autocoder = (function() {
  var active, autocoderMutateTimeout, numberOfResults, whichOneToChange;

  active = false;

  autocoderMutateTimeout = void 0;

  numberOfResults = 0;

  whichOneToChange = 0;

  function Autocoder(eventRouter, editor, colourNames) {
    var ARGDLIM, COLOUR, COLOUROP, COMMENT, DOONCE, ITERATION, MESH, NEWLINE, NUM, OP, SPACE, STATEFUN, TAB, TRANSLATION, UNKNOWN, VARIABLE, scanningAllColors,
      _this = this;
    this.eventRouter = eventRouter;
    this.editor = editor;
    this.colourNames = colourNames;
    this.Tokens = [];
    this.LexersOnlyState = new McLexer.State();
    this.LexersOnlyState(/\/\/.*\n/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new COMMENT(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/\t/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TAB(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/-?[0-9]+\.?[0-9]*/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new NUM(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/-?\.[0-9]*/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new NUM(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/[*|\/|+|\-|=]/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new OP(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/,/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new ARGDLIM(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/[\n|\r]{1,2}/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new NEWLINE(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/rotate/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TRANSLATION(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/move/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TRANSLATION(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/scale/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TRANSLATION(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    scanningAllColors = 0;
    while (scanningAllColors < this.colourNames.length) {
      this.LexersOnlyState(new RegExp(this.colourNames[scanningAllColors]))(function(matchedPartOfInput, remainingInput, state) {
        _this.Tokens.push(new COLOUR(matchedPartOfInput[0]));
        return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
      });
      scanningAllColors++;
    }
    this.LexersOnlyState(/background/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new COLOUROP(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/fill/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new COLOUROP(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/stroke/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new COLOUROP(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/simpleGradient/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new COLOUROP(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/box/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new MESH(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/ball/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new MESH(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/peg/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new MESH(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/rect/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new MESH(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/line/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new MESH(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/ambientLight/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new STATEFUN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/noStroke/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new STATEFUN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/ballDetail/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new STATEFUN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/animationStyle\s\w+/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new STATEFUN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/\d+\s+times\s+->/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new ITERATION(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/time/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new VARIABLE(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/delay/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new VARIABLE(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/\?doOnce\s+->\s*/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new DOONCE(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(RegExp(" +"))(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new SPACE(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/'/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new UNKNOWN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/[✓]?doOnce\s+\->?/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new UNKNOWN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(RegExp("=="))(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new UNKNOWN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/else/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new UNKNOWN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/next-tutorial:\w+/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new UNKNOWN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/\w+/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new UNKNOWN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/if/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new UNKNOWN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/pushMatrix/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new UNKNOWN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/popMatrix/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new UNKNOWN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/play/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new UNKNOWN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/bpm/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new UNKNOWN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/color\s*\(.+\)/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new UNKNOWN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/noFill/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new UNKNOWN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/frame/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new UNKNOWN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/strokeSize/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new UNKNOWN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/\(/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new UNKNOWN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/\)/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new UNKNOWN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState(/%/)(function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new UNKNOWN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    COMMENT = function(string) {
      this.string = string;
      this.toString = function() {
        return "COMMENT(" + string + ")";
      };
      return null;
    };
    SPACE = function(string) {
      this.string = string;
      this.toString = function() {
        return "SPACE(" + string + ")";
      };
      return null;
    };
    NEWLINE = function(string) {
      this.string = string;
      this.toString = function() {
        return "<br/>";
      };
      return null;
    };
    TRANSLATION = function(string) {
      this.string = string;
      this.toString = function() {
        return "TRANSLATION(" + string + ")";
      };
      return null;
    };
    VARIABLE = function(string) {
      this.string = string;
      this.toString = function() {
        return "VARIABLE(" + string + ")";
      };
      return null;
    };
    NUM = function(string) {
      this.string = string;
      this.toString = function() {
        return "NUM(" + string + ")";
      };
      this.mutate = function() {
        var num, offset, scalar;
        num = new Number(this.string);
        scalar = void 0;
        if (0 === num) {
          num = 0.1;
        }
        if (Math.random() > 0.5) {
          scalar = 0 - Math.random();
        } else {
          scalar = Math.random();
        }
        offset = num * Math.random();
        num += offset;
        num = num.toFixed(2);
        return this.string = num.toString();
      };
      return null;
    };
    OP = function(string) {
      this.string = string;
      this.toString = function() {
        return "OP(" + string + ")";
      };
      return null;
    };
    ARGDLIM = function(string) {
      this.string = string;
      this.toString = function() {
        return "ARGDLIM(" + string + ")";
      };
      return null;
    };
    TAB = function(string) {
      this.string = string;
      this.toString = function() {
        return "TAB(" + string + ")";
      };
      return null;
    };
    DOONCE = function(string) {
      this.string = string;
      this.toString = function() {
        return "DOONCE(" + string + ")";
      };
      return null;
    };
    COLOUROP = function(string) {
      this.string = string;
      this.toString = function() {
        return "COLOUROP(" + string + ")";
      };
      return null;
    };
    COLOUR = function(string) {
      this.string = string;
      this.toString = function() {
        return "COLOUR(" + string + ")";
      };
      this.mutate = function() {
        var idx;
        idx = Math.floor(Math.random() * this.colourNames.length);
        while (this.string === this.colourNames[idx]) {
          idx = Math.floor(Math.random() * this.colourNames.length);
        }
        return this.string = this.colourNames[idx];
      };
      return null;
    };
    MESH = function(string) {
      this.string = string;
      this.toString = function() {
        return "MESH(" + string + ")";
      };
      this.mutate = function() {
        switch (this.string) {
          case "box":
            this.string = "ball";
            break;
          case "ball":
            this.string = "box";
            break;
          case "line":
            this.string = "rect";
            break;
          case "rect":
            this.string = "line";
        }
      };
      return null;
    };
    STATEFUN = function(string) {
      this.string = string;
      this.toString = function() {
        return "STATEFUN(" + string + ")";
      };
      return null;
    };
    ITERATION = function(string) {
      this.string = string;
      this.toString = function() {
        return "ITERATION(" + string + ")";
      };
      this.mutate = function() {
        var num, pat;
        pat = /\d/;
        num = pat.exec(this.string);
        if (Math.random() > 0.5) {
          num++;
        } else {
          num--;
        }
        return this.string = num.toString() + " times ->";
      };
      return null;
    };
    UNKNOWN = function(string) {
      this.string = string;
      this.toString = function() {
        return "UNKNOWN(" + string + ")";
      };
      return null;
    };
  }

  Autocoder.prototype.emit = function(stream) {
    var ret, scanningTheStream;
    ret = "";
    scanningTheStream = 0;
    while (scanningTheStream < stream.length) {
      ret = ret + stream[scanningTheStream].string;
      scanningTheStream++;
    }
    return ret;
  };

  Autocoder.prototype.canMutate = function(token) {
    if (typeof token.mutate === "function") {
      return true;
    } else {
      return false;
    }
  };

  Autocoder.prototype.pickMutatableTokenAndMutateIt = function(stream) {
    var idx, mutatableTokens, scanningTheStream;
    mutatableTokens = [];
    idx = void 0;
    scanningTheStream = 0;
    while (scanningTheStream < stream.length) {
      if (this.canMutate(stream[scanningTheStream])) {
        mutatableTokens.push(scanningTheStream);
      }
      scanningTheStream++;
    }
    if (mutatableTokens.length === 0) {
      return;
    }
    idx = Math.floor(Math.random() * mutatableTokens.length);
    return stream[mutatableTokens[idx]].mutate();
  };

  Autocoder.prototype.replaceTimeWithAConstant = function() {
    var allMatches, countWhichOneToSwap, editorContent, rePattern;
    editorContent = this.editor.getValue();
    rePattern = /(time)/g;
    allMatches = editorContent.match(rePattern);
    countWhichOneToSwap = 0;
    if (allMatches === null) {
      this.numberOfResults = 0;
    } else {
      this.numberOfResults = allMatches.length;
    }
    this.whichOneToChange = Math.floor(Math.random() * this.numberOfResults) + 1;
    editorContent = editorContent.replace(rePattern, function(match, text, urlId) {
      countWhichOneToSwap++;
      if (countWhichOneToSwap === this.whichOneToChange) {
        return "" + Math.floor(Math.random() * 20) + 1;
      }
      return match;
    });
    return this.editor.setValue(editorContent);
  };

  Autocoder.prototype.mutate = function() {
    var editorContent, newContent;
    editorContent = this.editor.getValue();
    newContent = void 0;
    this.Tokens = [];
    try {
      this.LexersOnlyState.lex(editorContent);
    } catch (e) {

    }
    this.pickMutatableTokenAndMutateIt(this.Tokens);
    newContent = this.emit(this.Tokens);
    return this.editor.setValue(newContent);
  };

  Autocoder.prototype.autocoderMutate = function() {
    this.eventRouter.trigger("autocoderbutton-flash");
    return this.mutate();
  };

  Autocoder.prototype.toggle = function(forcedState) {
    var _this = this;
    if (forcedState === undefined) {
      this.active = !this.active;
    } else {
      this.active = forcedState;
    }
    if (this.active) {
      this.autocoderMutateTimeout = setInterval((function() {
        return _this.autocoderMutate();
      }), 1000);
      if (this.editor.getValue() === "" || ((window.location.hash.indexOf("bookmark") !== -1) && (window.location.hash.indexOf("autocodeTutorial") !== -1))) {
        this.eventRouter.trigger("load-program", "cubesAndSpikes");
      }
    } else {
      clearInterval(this.autocoderMutateTimeout);
    }
    return this.eventRouter.trigger("autocoder-button-pressed", this.active);
  };

  return Autocoder;

})();
