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
    this.INIT = new McLexer.State();
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
    this.INIT(/\/\/.*\n/)(function(match, rest, state) {
      _this.Tokens.push(new COMMENT(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/\t/)(function(match, rest, state) {
      _this.Tokens.push(new TAB(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/-?[0-9]+\.?[0-9]*/)(function(match, rest, state) {
      _this.Tokens.push(new NUM(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/-?\.[0-9]*/)(function(match, rest, state) {
      _this.Tokens.push(new NUM(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/[*|\/|+|\-|=]/)(function(match, rest, state) {
      _this.Tokens.push(new OP(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/,/)(function(match, rest, state) {
      _this.Tokens.push(new ARGDLIM(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/[\n|\r]{1,2}/)(function(match, rest, state) {
      _this.Tokens.push(new NEWLINE(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/rotate/)(function(match, rest, state) {
      _this.Tokens.push(new TRANSLATION(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/move/)(function(match, rest, state) {
      _this.Tokens.push(new TRANSLATION(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/scale/)(function(match, rest, state) {
      _this.Tokens.push(new TRANSLATION(match[0]));
      return state.continuation(rest);
    });
    scanningAllColors = 0;
    while (scanningAllColors < this.colourNames.length) {
      this.INIT(new RegExp(this.colourNames[scanningAllColors]))(function(match, rest, state) {
        _this.Tokens.push(new COLOUR(match[0]));
        return state.continuation(rest);
      });
      scanningAllColors++;
    }
    this.INIT(/background/)(function(match, rest, state) {
      _this.Tokens.push(new COLOUROP(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/fill/)(function(match, rest, state) {
      _this.Tokens.push(new COLOUROP(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/stroke/)(function(match, rest, state) {
      _this.Tokens.push(new COLOUROP(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/simpleGradient/)(function(match, rest, state) {
      _this.Tokens.push(new COLOUROP(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/box/)(function(match, rest, state) {
      _this.Tokens.push(new MESH(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/ball/)(function(match, rest, state) {
      _this.Tokens.push(new MESH(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/peg/)(function(match, rest, state) {
      _this.Tokens.push(new MESH(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/rect/)(function(match, rest, state) {
      _this.Tokens.push(new MESH(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/line/)(function(match, rest, state) {
      _this.Tokens.push(new MESH(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/ambientLight/)(function(match, rest, state) {
      _this.Tokens.push(new STATEFUN(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/noStroke/)(function(match, rest, state) {
      _this.Tokens.push(new STATEFUN(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/ballDetail/)(function(match, rest, state) {
      _this.Tokens.push(new STATEFUN(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/animationStyle\s\w+/)(function(match, rest, state) {
      _this.Tokens.push(new STATEFUN(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/\d+\s+times\s+->/)(function(match, rest, state) {
      _this.Tokens.push(new ITERATION(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/time/)(function(match, rest, state) {
      _this.Tokens.push(new VARIABLE(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/delay/)(function(match, rest, state) {
      _this.Tokens.push(new VARIABLE(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/\?doOnce\s+->\s*/)(function(match, rest, state) {
      _this.Tokens.push(new DOONCE(match[0]));
      return state.continuation(rest);
    });
    this.INIT(RegExp(" +"))(function(match, rest, state) {
      _this.Tokens.push(new SPACE(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/'/)(function(match, rest, state) {
      _this.Tokens.push(new UNKNOWN(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/[✓]?doOnce\s+\->?/)(function(match, rest, state) {
      _this.Tokens.push(new UNKNOWN(match[0]));
      return state.continuation(rest);
    });
    this.INIT(RegExp("=="))(function(match, rest, state) {
      _this.Tokens.push(new UNKNOWN(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/else/)(function(match, rest, state) {
      _this.Tokens.push(new UNKNOWN(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/next-tutorial:\w+/)(function(match, rest, state) {
      _this.Tokens.push(new UNKNOWN(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/\w+/)(function(match, rest, state) {
      _this.Tokens.push(new UNKNOWN(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/if/)(function(match, rest, state) {
      _this.Tokens.push(new UNKNOWN(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/pushMatrix/)(function(match, rest, state) {
      _this.Tokens.push(new UNKNOWN(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/popMatrix/)(function(match, rest, state) {
      _this.Tokens.push(new UNKNOWN(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/play/)(function(match, rest, state) {
      _this.Tokens.push(new UNKNOWN(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/bpm/)(function(match, rest, state) {
      _this.Tokens.push(new UNKNOWN(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/color\s*\(.+\)/)(function(match, rest, state) {
      _this.Tokens.push(new UNKNOWN(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/noFill/)(function(match, rest, state) {
      _this.Tokens.push(new UNKNOWN(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/frame/)(function(match, rest, state) {
      _this.Tokens.push(new UNKNOWN(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/strokeSize/)(function(match, rest, state) {
      _this.Tokens.push(new UNKNOWN(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/\(/)(function(match, rest, state) {
      _this.Tokens.push(new UNKNOWN(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/\)/)(function(match, rest, state) {
      _this.Tokens.push(new UNKNOWN(match[0]));
      return state.continuation(rest);
    });
    this.INIT(/%/)(function(match, rest, state) {
      _this.Tokens.push(new UNKNOWN(match[0]));
      return state.continuation(rest);
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
      this.INIT.lex(editorContent);
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
