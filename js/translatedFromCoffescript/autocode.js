var createAutocoder;

createAutocoder = function(eventRouter, editor, colourNames) {
  "use strict";

  var ARGDLIM, COLOUR, COLOUROP, COMMENT, DOONCE, INIT, ITERATION, MESH, NEWLINE, NUM, OP, SPACE, STATEFUN, TAB, TRANSLATION, Tokens, UNKNOWN, VARIABLE, autocoder, autocoderMutate, autocoderMutateTimeout, blinkingAutocoderStatus, canMutate, emit, mutate, numberOfResults, pickMutatableTokenAndMutateIt, replaceTimeWithAConstant, scanningAllColors, toggle, whichOneToChange;
  blinkingAutocoderStatus = false;
  autocoderMutateTimeout = void 0;
  numberOfResults = 0;
  whichOneToChange = 0;
  scanningAllColors = void 0;
  autocoder = {};
  autocoder.active = false;
  Tokens = [];
  INIT = new McLexer.State();
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
      idx = Math.floor(Math.random() * colourNames.length);
      while (this.string === colourNames[idx]) {
        idx = Math.floor(Math.random() * colourNames.length);
      }
      return this.string = colourNames[idx];
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
  INIT(/\/\/.*\n/)(function(match, rest, state) {
    Tokens.push(new COMMENT(match[0]));
    return state.continuation(rest);
  });
  INIT(/\t/)(function(match, rest, state) {
    Tokens.push(new TAB(match[0]));
    return state.continuation(rest);
  });
  INIT(/-?[0-9]+\.?[0-9]*/)(function(match, rest, state) {
    Tokens.push(new NUM(match[0]));
    return state.continuation(rest);
  });
  INIT(/-?\.[0-9]*/)(function(match, rest, state) {
    Tokens.push(new NUM(match[0]));
    return state.continuation(rest);
  });
  INIT(/[*|\/|+|\-|=]/)(function(match, rest, state) {
    Tokens.push(new OP(match[0]));
    return state.continuation(rest);
  });
  INIT(/,/)(function(match, rest, state) {
    Tokens.push(new ARGDLIM(match[0]));
    return state.continuation(rest);
  });
  INIT(/[\n|\r]{1,2}/)(function(match, rest, state) {
    Tokens.push(new NEWLINE(match[0]));
    return state.continuation(rest);
  });
  INIT(/rotate/)(function(match, rest, state) {
    Tokens.push(new TRANSLATION(match[0]));
    return state.continuation(rest);
  });
  INIT(/move/)(function(match, rest, state) {
    Tokens.push(new TRANSLATION(match[0]));
    return state.continuation(rest);
  });
  INIT(/scale/)(function(match, rest, state) {
    Tokens.push(new TRANSLATION(match[0]));
    return state.continuation(rest);
  });
  scanningAllColors = 0;
  while (scanningAllColors < colourNames.length) {
    INIT(new RegExp(colourNames[scanningAllColors]))(function(match, rest, state) {
      Tokens.push(new COLOUR(match[0]));
      return state.continuation(rest);
    });
    scanningAllColors++;
  }
  INIT(/background/)(function(match, rest, state) {
    Tokens.push(new COLOUROP(match[0]));
    return state.continuation(rest);
  });
  INIT(/fill/)(function(match, rest, state) {
    Tokens.push(new COLOUROP(match[0]));
    return state.continuation(rest);
  });
  INIT(/stroke/)(function(match, rest, state) {
    Tokens.push(new COLOUROP(match[0]));
    return state.continuation(rest);
  });
  INIT(/simpleGradient/)(function(match, rest, state) {
    Tokens.push(new COLOUROP(match[0]));
    return state.continuation(rest);
  });
  INIT(/box/)(function(match, rest, state) {
    Tokens.push(new MESH(match[0]));
    return state.continuation(rest);
  });
  INIT(/ball/)(function(match, rest, state) {
    Tokens.push(new MESH(match[0]));
    return state.continuation(rest);
  });
  INIT(/peg/)(function(match, rest, state) {
    Tokens.push(new MESH(match[0]));
    return state.continuation(rest);
  });
  INIT(/rect/)(function(match, rest, state) {
    Tokens.push(new MESH(match[0]));
    return state.continuation(rest);
  });
  INIT(/line/)(function(match, rest, state) {
    Tokens.push(new MESH(match[0]));
    return state.continuation(rest);
  });
  INIT(/ambientLight/)(function(match, rest, state) {
    Tokens.push(new STATEFUN(match[0]));
    return state.continuation(rest);
  });
  INIT(/noStroke/)(function(match, rest, state) {
    Tokens.push(new STATEFUN(match[0]));
    return state.continuation(rest);
  });
  INIT(/ballDetail/)(function(match, rest, state) {
    Tokens.push(new STATEFUN(match[0]));
    return state.continuation(rest);
  });
  INIT(/animationStyle\s\w+/)(function(match, rest, state) {
    Tokens.push(new STATEFUN(match[0]));
    return state.continuation(rest);
  });
  INIT(/\d+\s+times\s+->/)(function(match, rest, state) {
    Tokens.push(new ITERATION(match[0]));
    return state.continuation(rest);
  });
  INIT(/time/)(function(match, rest, state) {
    Tokens.push(new VARIABLE(match[0]));
    return state.continuation(rest);
  });
  INIT(/delay/)(function(match, rest, state) {
    Tokens.push(new VARIABLE(match[0]));
    return state.continuation(rest);
  });
  INIT(/\?doOnce\s+->\s*/)(function(match, rest, state) {
    Tokens.push(new DOONCE(match[0]));
    return state.continuation(rest);
  });
  INIT(RegExp(" +"))(function(match, rest, state) {
    Tokens.push(new SPACE(match[0]));
    return state.continuation(rest);
  });
  INIT(/'/)(function(match, rest, state) {
    Tokens.push(new UNKNOWN(match[0]));
    return state.continuation(rest);
  });
  INIT(/[✓]?doOnce\s+\->?/)(function(match, rest, state) {
    Tokens.push(new UNKNOWN(match[0]));
    return state.continuation(rest);
  });
  INIT(RegExp("=="))(function(match, rest, state) {
    Tokens.push(new UNKNOWN(match[0]));
    return state.continuation(rest);
  });
  INIT(/else/)(function(match, rest, state) {
    Tokens.push(new UNKNOWN(match[0]));
    return state.continuation(rest);
  });
  INIT(/next-tutorial:\w+/)(function(match, rest, state) {
    Tokens.push(new UNKNOWN(match[0]));
    return state.continuation(rest);
  });
  INIT(/\w+/)(function(match, rest, state) {
    Tokens.push(new UNKNOWN(match[0]));
    return state.continuation(rest);
  });
  INIT(/if/)(function(match, rest, state) {
    Tokens.push(new UNKNOWN(match[0]));
    return state.continuation(rest);
  });
  INIT(/pushMatrix/)(function(match, rest, state) {
    Tokens.push(new UNKNOWN(match[0]));
    return state.continuation(rest);
  });
  INIT(/popMatrix/)(function(match, rest, state) {
    Tokens.push(new UNKNOWN(match[0]));
    return state.continuation(rest);
  });
  INIT(/play/)(function(match, rest, state) {
    Tokens.push(new UNKNOWN(match[0]));
    return state.continuation(rest);
  });
  INIT(/bpm/)(function(match, rest, state) {
    Tokens.push(new UNKNOWN(match[0]));
    return state.continuation(rest);
  });
  INIT(/color\s*\(.+\)/)(function(match, rest, state) {
    Tokens.push(new UNKNOWN(match[0]));
    return state.continuation(rest);
  });
  INIT(/noFill/)(function(match, rest, state) {
    Tokens.push(new UNKNOWN(match[0]));
    return state.continuation(rest);
  });
  INIT(/frame/)(function(match, rest, state) {
    Tokens.push(new UNKNOWN(match[0]));
    return state.continuation(rest);
  });
  INIT(/strokeSize/)(function(match, rest, state) {
    Tokens.push(new UNKNOWN(match[0]));
    return state.continuation(rest);
  });
  INIT(/\(/)(function(match, rest, state) {
    Tokens.push(new UNKNOWN(match[0]));
    return state.continuation(rest);
  });
  INIT(/\)/)(function(match, rest, state) {
    Tokens.push(new UNKNOWN(match[0]));
    return state.continuation(rest);
  });
  INIT(/%/)(function(match, rest, state) {
    Tokens.push(new UNKNOWN(match[0]));
    return state.continuation(rest);
  });
  emit = function(stream) {
    var ret, scanningTheStream;
    ret = "";
    scanningTheStream = void 0;
    scanningTheStream = 0;
    while (scanningTheStream < stream.length) {
      ret = ret + stream[scanningTheStream].string;
      scanningTheStream++;
    }
    return ret;
  };
  canMutate = function(token) {
    if (typeof token.mutate === "function") {
      return true;
    } else {
      return false;
    }
  };
  pickMutatableTokenAndMutateIt = function(stream) {
    var idx, mutatableTokens, scanningTheStream;
    mutatableTokens = [];
    scanningTheStream = void 0;
    idx = void 0;
    scanningTheStream = 0;
    while (scanningTheStream < stream.length) {
      if (canMutate(stream[scanningTheStream])) {
        mutatableTokens.push(scanningTheStream);
      }
      scanningTheStream++;
    }
    if (0 === mutatableTokens.length) {
      return;
    }
    idx = Math.floor(Math.random() * mutatableTokens.length);
    return stream[mutatableTokens[idx]].mutate();
  };
  replaceTimeWithAConstant = function() {
    var allMatches, countWhichOneToSwap, editorContent, rePattern;
    editorContent = editor.getValue();
    rePattern = /(time)/g;
    allMatches = editorContent.match(rePattern);
    countWhichOneToSwap = 0;
    if (allMatches === null) {
      numberOfResults = 0;
    } else {
      numberOfResults = allMatches.length;
    }
    whichOneToChange = Math.floor(Math.random() * numberOfResults) + 1;
    editorContent = editorContent.replace(rePattern, function(match, text, urlId) {
      countWhichOneToSwap++;
      if (countWhichOneToSwap === whichOneToChange) {
        return "" + Math.floor(Math.random() * 20) + 1;
      }
      return match;
    });
    return editor.setValue(editorContent);
  };
  mutate = function() {
    var editorContent, newContent;
    editorContent = editor.getValue();
    newContent = void 0;
    Tokens = [];
    try {
      INIT.lex(editorContent);
    } catch (e) {

    }
    pickMutatableTokenAndMutateIt(Tokens);
    newContent = emit(Tokens);
    return editor.setValue(newContent);
  };
  autocoderMutate = function() {
    eventRouter.trigger("autocoderbutton-flash");
    return mutate();
  };
  toggle = function(active) {
    if (active === undefined) {
      autocoder.active = !autocoder.active;
    } else {
      autocoder.active = active;
    }
    if (autocoder.active) {
      autocoderMutateTimeout = setInterval(autocoderMutate, 1000);
      if (editor.getValue() === "" || ((window.location.hash.indexOf("bookmark") !== -1) && (window.location.hash.indexOf("autocodeTutorial") !== -1))) {
        eventRouter.trigger("load-program", "cubesAndSpikes");
      }
    } else {
      clearInterval(autocoderMutateTimeout);
    }
    return eventRouter.trigger("autocoder-button-pressed", autocoder.active);
  };
  eventRouter.bind("reset", function() {
    return toggle(false);
  });
  eventRouter.bind("toggle-autocoder", function() {
    return toggle();
  });
  return autocoder;
};
