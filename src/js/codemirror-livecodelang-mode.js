/* global CodeMirror */
/**
 * CoedeMirror Live Code Lab mode
 */
CodeMirror.defineMode('livecodelab', function() {
  const ERRORCLASS = 'error';

  function wordRegexp(words) {
    return new RegExp('^((' + words.join(')|(') + '))\\b');
  }

  const tutorialLink = /\/\/\s*(next-tutorial:([^\s]+))\b/;

  const singleOperators = new RegExp('^[\\+\\-\\*/%&|\\^~<>!\?]');
  const singleDelimiters = new RegExp('^[\\(\\)\\[\\]\\{\\}@,:`=;\\.]');
  const doubleOperators = new RegExp('^((\->)|(\=>)|(\\+\\+)|(\\+\\=)|(\\-\\-)|(\\-\\=)|(\\*\\*)|(\\*\\=)|(\\/\\/)|(\\/\\=)|(==)|(!=)|(<=)|(>=)|(<>)|(<<)|(>>)|(//))');
  const identifiers = new RegExp('^[_A-Za-z][_A-Za-z0-9]*');

  const wordOperators = wordRegexp(['and', 'or', 'not']);
  const indentKeywords = ['times', 'if', 'else'];
  const commonKeywords = [
    'move', 'rotate', 'scale',
    'with'
  ];

  const keywords = wordRegexp(indentKeywords.concat(commonKeywords));

  const commonConstants = ['true', 'false'];
  const constants = wordRegexp(commonConstants);

  const lambdaOps = ['->', '=>'];

  function tokenBase(stream, state) {

    if (stream.sol()) {
      if (stream.eatSpace()) {
        const lineOffset = stream.indentation();
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

    const ch = stream.peek();

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
    return (stream, state) => {
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
    state.indentation += 1;
  }

  function dedent(state) {
    state.indentation -= 1;
    return state.indentation < 0;
  }

  function undent(state) {
    state.indentation = 0;
  }

  function tokenLexer(stream, state) {
    const style = state.tokenize(stream, state);
    const current = stream.current();

    if (lambdaOps.includes(current) && stream.eol()) {
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

    if (indentKeywords.includes(current)){
      indent(state);
    }

    return style;
  }

  const external = {
    startState: () => {
      return {
        tokenize: tokenBase,
        indentation: 0
      };
    },

    token: tokenLexer,

    blankLine: (state) => {
      undent(state);
    },

    indent: (state) => {
      return state.indentation;
    }

  };
  return external;
});

CodeMirror.defineMIME('text/x-livecodelang', 'livecodelang');
