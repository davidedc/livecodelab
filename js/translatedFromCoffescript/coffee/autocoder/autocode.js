"use strict";

var Autocoder, TOKEN_ARGDLIM, TOKEN_COLOUR, TOKEN_COLOUROP, TOKEN_COMMENT, TOKEN_DOONCE, TOKEN_ITERATION, TOKEN_MESH, TOKEN_NEWLINE, TOKEN_NUM, TOKEN_OP, TOKEN_SPACE, TOKEN_STATEFUN, TOKEN_TAB, TOKEN_TRANSLATION, TOKEN_UNKNOWN, TOKEN_VARIABLE;

Autocoder = (function() {
  var active, autocoderMutateTimeout, numberOfResults, whichOneToChange;

  active = false;

  autocoderMutateTimeout = void 0;

  numberOfResults = 0;

  whichOneToChange = 0;

  function Autocoder(eventRouter, editor, colourNames) {
    var scanningAllColors,
      _this = this;
    this.eventRouter = eventRouter;
    this.editor = editor;
    this.colourNames = colourNames;
    this.Tokens = [];
    this.LexersOnlyState = new LexerState();
    this.LexersOnlyState.addRule(/\/\/.*\n/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_COMMENT(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/\t/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_TAB(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/-?[0-9]+\.?[0-9]*/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_NUM(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/-?\.[0-9]*/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_NUM(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/[*|\/|+|\-|=]/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_OP(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/,/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_ARGDLIM(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/[\n|\r]{1,2}/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_NEWLINE(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/rotate/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_TRANSLATION(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/move/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_TRANSLATION(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/scale/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_TRANSLATION(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    scanningAllColors = 0;
    while (scanningAllColors < this.colourNames.length) {
      this.LexersOnlyState.addRule(new RegExp(this.colourNames[scanningAllColors]), function(matchedPartOfInput, remainingInput, state) {
        _this.Tokens.push(new TOKEN_COLOUR(matchedPartOfInput[0], _this.colourNames));
        return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
      });
      scanningAllColors++;
    }
    this.LexersOnlyState.addRule(/background/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_COLOUROP(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/fill/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_COLOUROP(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/stroke/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_COLOUROP(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/simpleGradient/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_COLOUROP(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/box/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_MESH(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/ball/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_MESH(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/peg/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_MESH(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/rect/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_MESH(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/line/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_MESH(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/ambientLight/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_STATEFUN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/noStroke/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_STATEFUN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/ballDetail/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_STATEFUN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/animationStyle\s\w+/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_STATEFUN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/\d+\s+times\s+->/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_ITERATION(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/time/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_VARIABLE(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/delay/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_VARIABLE(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/\?doOnce\s+->\s*/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_DOONCE(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(RegExp(" +"), function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_SPACE(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/'/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_UNKNOWN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/[✓]?doOnce\s+\->?/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_UNKNOWN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(RegExp("=="), function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_UNKNOWN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/else/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_UNKNOWN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/next-tutorial:\w+/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_UNKNOWN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/\w+/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_UNKNOWN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/if/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_UNKNOWN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/pushMatrix/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_UNKNOWN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/popMatrix/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_UNKNOWN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/play/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_UNKNOWN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/bpm/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_UNKNOWN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/color\s*\(.+\)/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_UNKNOWN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/noFill/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_UNKNOWN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/frame/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_UNKNOWN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/strokeSize/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_UNKNOWN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/\(/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_UNKNOWN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/\)/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_UNKNOWN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
    this.LexersOnlyState.addRule(/%/, function(matchedPartOfInput, remainingInput, state) {
      _this.Tokens.push(new TOKEN_UNKNOWN(matchedPartOfInput[0]));
      return state.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
    });
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

TOKEN_COMMENT = (function() {

  function TOKEN_COMMENT(string) {
    this.string = string;
  }

  TOKEN_COMMENT.prototype.toString = function() {
    return "COMMENT(" + string + ")";
  };

  return TOKEN_COMMENT;

})();

TOKEN_SPACE = (function() {

  function TOKEN_SPACE(string) {
    this.string = string;
  }

  TOKEN_SPACE.prototype.toString = function() {
    return "SPACE(" + string + ")";
  };

  return TOKEN_SPACE;

})();

TOKEN_NEWLINE = (function() {

  function TOKEN_NEWLINE(string) {
    this.string = string;
  }

  TOKEN_NEWLINE.prototype.toString = function() {
    return "<br/>";
  };

  return TOKEN_NEWLINE;

})();

TOKEN_TRANSLATION = (function() {

  function TOKEN_TRANSLATION(string) {
    this.string = string;
  }

  TOKEN_TRANSLATION.prototype.toString = function() {
    return "TOKEN_TRANSLATION(" + this.string + ")";
  };

  return TOKEN_TRANSLATION;

})();

TOKEN_VARIABLE = (function() {

  function TOKEN_VARIABLE(string) {
    this.string = string;
  }

  TOKEN_VARIABLE.prototype.toString = function() {
    return "TOKEN_VARIABLE(" + this.string + ")";
  };

  return TOKEN_VARIABLE;

})();

TOKEN_NUM = (function() {

  function TOKEN_NUM(string) {
    this.string = string;
  }

  TOKEN_NUM.prototype.toString = function() {
    return "TOKEN_NUM(" + this.string + ")";
  };

  TOKEN_NUM.prototype.mutate = function() {
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

  return TOKEN_NUM;

})();

TOKEN_OP = (function() {

  function TOKEN_OP(string) {
    this.string = string;
  }

  TOKEN_OP.prototype.toString = function() {
    return "TOKEN_OP(" + this.string + ")";
  };

  return TOKEN_OP;

})();

TOKEN_ARGDLIM = (function() {

  function TOKEN_ARGDLIM(string) {
    this.string = string;
  }

  TOKEN_ARGDLIM.prototype.toString = function() {
    return "TOKEN_ARGDLIM(" + this.string + ")";
  };

  return TOKEN_ARGDLIM;

})();

TOKEN_TAB = (function() {

  function TOKEN_TAB(string) {
    this.string = string;
  }

  TOKEN_TAB.prototype.toString = function() {
    return "TOKEN_TAB(" + this.string + ")";
  };

  return TOKEN_TAB;

})();

TOKEN_DOONCE = (function() {

  function TOKEN_DOONCE(string) {
    this.string = string;
  }

  TOKEN_DOONCE.prototype.toString = function() {
    return "TOKEN_DOONCE(" + this.string + ")";
  };

  return TOKEN_DOONCE;

})();

TOKEN_MESH = (function() {

  function TOKEN_MESH(string) {
    this.string = string;
  }

  TOKEN_MESH.prototype.toString = function() {
    return "TOKEN_MESH(" + this.string + ")";
  };

  TOKEN_MESH.prototype.mutate = function() {
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

  return TOKEN_MESH;

})();

TOKEN_STATEFUN = (function() {

  function TOKEN_STATEFUN(string) {
    this.string = string;
  }

  TOKEN_STATEFUN.prototype.toString = function() {
    return "TOKEN_STATEFUN(" + this.string + ")";
  };

  return TOKEN_STATEFUN;

})();

TOKEN_ITERATION = (function() {

  function TOKEN_ITERATION(string) {
    this.string = string;
  }

  TOKEN_ITERATION.prototype.toString = function() {
    return "TOKEN_ITERATION(" + this.string + ")";
  };

  TOKEN_ITERATION.prototype.mutate = function() {
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

  return TOKEN_ITERATION;

})();

TOKEN_UNKNOWN = (function() {

  function TOKEN_UNKNOWN(string) {
    this.string = string;
  }

  TOKEN_UNKNOWN.prototype.toString = function() {
    return "TOKEN_UNKNOWN(" + this.string + ")";
  };

  return TOKEN_UNKNOWN;

})();

TOKEN_COLOUR = (function() {

  function TOKEN_COLOUR(string, colourNames) {
    this.string = string;
    this.colourNames = colourNames;
  }

  TOKEN_COLOUR.prototype.toString = function() {
    return "TOKEN_COLOUR(" + this.string + ")";
  };

  TOKEN_COLOUR.prototype.mutate = function() {
    var idx;
    idx = Math.floor(Math.random() * this.colourNames.length);
    while (this.string === this.colourNames[idx]) {
      idx = Math.floor(Math.random() * this.colourNames.length);
    }
    this.string = this.colourNames[idx];
    return null;
  };

  return TOKEN_COLOUR;

})();

TOKEN_COLOUROP = (function() {

  function TOKEN_COLOUROP(string) {
    this.string = string;
  }

  TOKEN_COLOUROP.prototype.toString = function() {
    return "TOKEN_COLOUROP(" + this.string + ")";
  };

  return TOKEN_COLOUROP;

})();
