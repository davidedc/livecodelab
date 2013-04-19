/*
## Autocoder takes care of making random variations to the code. It lexes the input,
## collects the tokens that can be mutated, picks one at random, invokes a mutation on it,
## and then re-builds a string pritout from the tokens so to obtain the mutated program.
*/

var Autocoder, TOKEN_ARGDLIM, TOKEN_COLOUR, TOKEN_COLOUROP, TOKEN_COMMENT, TOKEN_DOONCE, TOKEN_ITERATION, TOKEN_MESH, TOKEN_NEWLINE, TOKEN_NUM, TOKEN_OP, TOKEN_SPACE, TOKEN_STATEFUN, TOKEN_TAB, TOKEN_TRANSLATION, TOKEN_UNKNOWN, TOKEN_VARIABLE;

Autocoder = (function() {
  "use strict";  Autocoder.prototype.active = false;

  Autocoder.prototype.autocoderMutateTimeout = void 0;

  Autocoder.prototype.numberOfResults = 0;

  Autocoder.prototype.whichOneToChange = 0;

  function Autocoder(eventRouter, editor, colourNames) {
    var addRule, scanningAllColors, _i, _len, _ref,
      _this = this;

    this.eventRouter = eventRouter;
    this.editor = editor;
    this.colourNames = colourNames;
    this.Tokens = [];
    this.LexersOnlyState = new LexerState();
    addRule = function(regex, TokenClass, otherArgs) {
      return _this.LexersOnlyState.addRule(regex, function(matchedPartOfInput, remainingInput, currentState) {
        _this.Tokens.push(new TokenClass(matchedPartOfInput[0], otherArgs));
        return currentState.returnAFunctionThatAppliesRulesAndRunsActionFor(remainingInput);
      });
    };
    addRule(/\/\/.*\n/, TOKEN_COMMENT);
    addRule(/\t/, TOKEN_TAB);
    addRule(/-?[0-9]+\.?[0-9]*/, TOKEN_NUM);
    addRule(/-?\.[0-9]*/, TOKEN_NUM);
    addRule(/[*|\/|+|\-|=]/, TOKEN_OP);
    addRule(/,/, TOKEN_ARGDLIM);
    addRule(/[\n|\r]{1,2}/, TOKEN_NEWLINE);
    addRule(/rotate/, TOKEN_TRANSLATION);
    addRule(/move/, TOKEN_TRANSLATION);
    addRule(/scale/, TOKEN_TRANSLATION);
    _ref = this.colourNames;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      scanningAllColors = _ref[_i];
      addRule(new RegExp(scanningAllColors), TOKEN_COLOUR, this.colourNames);
    }
    addRule(/background/, TOKEN_COLOUROP);
    addRule(/fill/, TOKEN_COLOUROP);
    addRule(/stroke/, TOKEN_COLOUROP);
    addRule(/simpleGradient/, TOKEN_COLOUROP);
    addRule(/box/, TOKEN_MESH);
    addRule(/ball/, TOKEN_MESH);
    addRule(/peg/, TOKEN_MESH);
    addRule(/rect/, TOKEN_MESH);
    addRule(/line/, TOKEN_MESH);
    addRule(/ambientLight/, TOKEN_STATEFUN);
    addRule(/noStroke/, TOKEN_STATEFUN);
    addRule(/ballDetail/, TOKEN_STATEFUN);
    addRule(/animationStyle\s\w+/, TOKEN_STATEFUN);
    addRule(/\d+\s+times\s+->/, TOKEN_ITERATION);
    addRule(/time/, TOKEN_VARIABLE);
    addRule(/delay/, TOKEN_VARIABLE);
    addRule(/\?doOnce\s+->\s*/, TOKEN_DOONCE);
    addRule(RegExp(" +"), TOKEN_SPACE);
    addRule(/'/, TOKEN_UNKNOWN);
    addRule(/[✓]?doOnce\s+\->?/, TOKEN_UNKNOWN);
    addRule(RegExp("=="), TOKEN_UNKNOWN);
    addRule(/else/, TOKEN_UNKNOWN);
    addRule(/next-tutorial:\w+/, TOKEN_UNKNOWN);
    addRule(/\w+/, TOKEN_UNKNOWN);
    addRule(/if/, TOKEN_UNKNOWN);
    addRule(/pushMatrix/, TOKEN_UNKNOWN);
    addRule(/popMatrix/, TOKEN_UNKNOWN);
    addRule(/play/, TOKEN_UNKNOWN);
    addRule(/bpm/, TOKEN_UNKNOWN);
    addRule(/color\s*\(.+\)/, TOKEN_UNKNOWN);
    addRule(/noFill/, TOKEN_UNKNOWN);
    addRule(/frame/, TOKEN_UNKNOWN);
    addRule(/strokeSize/, TOKEN_UNKNOWN);
    addRule(/\(/, TOKEN_UNKNOWN);
    addRule(/\)/, TOKEN_UNKNOWN);
    addRule(/%/, TOKEN_UNKNOWN);
  }

  Autocoder.prototype.emit = function(stream) {
    var ret, scanningTheStream, _i, _len;

    ret = "";
    for (_i = 0, _len = stream.length; _i < _len; _i++) {
      scanningTheStream = stream[_i];
      ret = ret + scanningTheStream.string;
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
    var idx, mutatableTokens, scanningTheStream, _i, _len;

    mutatableTokens = [];
    idx = void 0;
    for (_i = 0, _len = stream.length; _i < _len; _i++) {
      scanningTheStream = stream[_i];
      if (this.canMutate(scanningTheStream)) {
        mutatableTokens.push(scanningTheStream);
      }
    }
    if (mutatableTokens.length === 0) {
      return;
    }
    idx = Math.floor(Math.random() * mutatableTokens.length);
    return mutatableTokens[idx].mutate();
  };

  Autocoder.prototype.replaceTimeWithAConstant = function() {
    var allMatches, countWhichOneToSwap, editorContent, rePattern;

    editorContent = this.editor.getValue();
    rePattern = /(time)/g;
    allMatches = editorContent.match(rePattern);
    countWhichOneToSwap = 0;
    if (!allMatches) {
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
    var e, editorContent, newContent;

    editorContent = this.editor.getValue();
    newContent = void 0;
    this.Tokens = [];
    try {
      this.LexersOnlyState.lex(editorContent);
    } catch (_error) {
      e = _error;
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
    return this.string = this.colourNames[idx];
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
