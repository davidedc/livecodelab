/**
 * CoedeMirror Live Code Lab mode
 */

CodeMirror.defineMode('livecodelab', function(conf) {
  var ERRORCLASS = 'error';

  function wordRegexp(words) {
    return new RegExp('^((' + words.join(')|(') + '))\\b');
  }

  var tutorialLink = /\/\/\s*(next-tutorial:([^\s]+))\b/;

  var singleOperators = new RegExp('^[\\+\\-\\*/%&|\\^~<>!\?]');
  var singleDelimiters = new RegExp('^[\\(\\)\\[\\]\\{\\}@,:`=;\\.]');
  var doubleOperators = new RegExp('^((\->)|(\=>)|(\\+\\+)|(\\+\\=)|(\\-\\-)|(\\-\\=)|(\\*\\*)|(\\*\\=)|(\\/\\/)|(\\/\\=)|(==)|(!=)|(<=)|(>=)|(<>)|(<<)|(>>)|(//))');
  var identifiers = new RegExp('^[_A-Za-z][_A-Za-z0-9]*');

  var wordOperators = wordRegexp(['and', 'or', 'not']);
  var indentKeywords = ['times', 'if', 'else'];
  var commonKeywords = [
    'move', 'rotate', 'scale',
    'with'
  ];

  var keywords = wordRegexp(indentKeywords.concat(commonKeywords));
  var indentKeywordsCheck = wordRegexp(indentKeywords);

  var commonConstants = ['true', 'false'];
  var constants = wordRegexp(commonConstants);

  var lambdaOps = ['->', '=>'];

  var lambdaOpsCheck = wordRegexp(lambdaOps);

  function tokenBase(stream, state) {

    if (stream.sol()) {
      if (stream.eatSpace()) {
        var lineOffset = stream.indentation();
        if (lineOffset > state.indentation) {
          return 'indent';
        } else if (lineOffset < state.indentation) {
          return 'dedent';
        }
        return null;
      } else {
        if (state.indentation > 0) {
          return 'undent';
        }
      }
    }

    if (stream.eatSpace()) {
      return null;
    }

    var ch = stream.peek();

    if (ch === '/') {
      if (stream.match(tutorialLink)) {
        stream.skipToEnd();
        return 'link';
      }
      if (stream.match(/\/\//)) {
        stream.skipToEnd();
        return 'comment';
      }
    }

    // Handle number literals
    if (stream.match(/^-?[0-9\.]/, false)) {
      // Floats
      if (stream.match(/^-?\d*\.\d+(e[\+\-]?\d+)?/i)) {
        return 'number';
      }
      if (stream.match(/^-?\d+\.\d*/)) {
        return 'number';
      }
      if (stream.match(/^-?\.\d+/)) {
        return 'number';
      }
      // Integers
      // Hex
      if (stream.match(/^-?0x[0-9a-f]+/i)) {
        return 'number';
      }
      // Decimal
      if (stream.match(/^-?[1-9]\d*(e[\+\-]?\d+)?/)) {
        return 'number';
      }
      // Zero by itself with no other piece of number.
      if (stream.match(/^-?0(?![\dx])/i)) {
        return 'number';
      }
    }

    // Handle strings
    if (ch === '"' || ch === '\'') {
      state.tokenize = tokenString(ch);
      return state.tokenize(stream, state);
    }

    // Handle operators and delimiters
    if (stream.match(doubleOperators)
        || stream.match(singleOperators)
        || stream.match(wordOperators)) {
      return 'operator';
    }
    if (stream.match(singleDelimiters)) {
      return 'punctuation';
    }

    if (stream.match(constants)) {
      return 'atom';
    }

    if (stream.match(keywords)) {
      return 'keyword';
    }

    if (stream.match(identifiers)) {
      return 'variable';
    }

    // Handle non-detected items
    stream.next();
    return ERRORCLASS;
  }

  function tokenString(quote) {
    return function (stream, state) {
      // consume the first quote
      stream.eat(quote);
      while (!stream.eol()) {
        stream.eatWhile(/[^'"]/);
        if (stream.match(quote)) {
          state.tokenize = tokenBase;
          return 'string';
        }
      }
      state.tokenize = tokenBase;
      return ERRORCLASS;
    };
  }

  function indent(state) {
    state.indentation += conf.indentUnit;
  }

  function dedent(state) {
    state.indentation -= conf.indentUnit;
    return state.indentation < 0;
  }

  function undent(state) {
    state.indentation = 0;
  }

  function tokenLexer(stream, state) {
    var style = state.tokenize(stream, state);
    var current = stream.current();

    if (lambdaOpsCheck.exec(current) && stream.eol()) {
      indent(state);
    }

    if (style === 'indent') {
      indent(state);
    }

    if (style === 'dedent') {
      if (dedent(state)) {
        return ERRORCLASS;
      }
    }

    if (style === 'undent') {
      undent(state);
    }

    if (indentKeywordsCheck.exec(current)){
      indent(state);
    }

    return style;
  }

  var external = {
    startState: function () {
      return {
        tokenize: tokenBase,
        indentation: 0
      };
    },

    token: tokenLexer,

    blankLine: function (state) {
      undent(state);
    },

    indent: function (state) {
      return state.indentation;
    }

  };
  return external;
});

CodeMirror.defineMIME('text/x-livecodelang', 'livecodelang');
