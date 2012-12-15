
var createParsingFunctions = function () {

    'use strict';

    var Parser = {},
        source,
        sourceLength,
        position;

    Parser.finished = true;

    Parser.setString = function (parseString) {
        position = 0;
        source = parseString;
        sourceLength = source.length;
        if (parseString !== '') {
            Parser.finished = false;
        } else {
            Parser.finished = true;
        }
    };

    Parser.pop = function () {
        if (position >= sourceLength) {
            return undefined;
        }
        var c = source.charAt(position);
        position += 1;
        if (position >= sourceLength) {
            Parser.finished = true;
        }
        return c;
    };

    Parser.peek = function () {
        if (position < sourceLength) {
            return source.charAt(position);
        }
    };

    return Parser;
};


// This should check to see that brackets and string quotes are balanced
var createCodeChecker = function () {

    'use strict';

    var CodeChecker = createParsingFunctions(),
        states = {},
        isErr,
        setState,
        generateErrMessage;

    setState = function () {
        var state = {
            err: false,
            // number of each bracket found
            bracketStack: [],
            // string quotes
            doubleQ: 0,
            singleQ: 0,
            // states the parser could be in
            inSingleString: false,
            inDoubleString: false,
            inComment: false,
            // any error message
            message: ""
        };
        return state;
    };

    isErr = function (s) {
        if (s.bracketStack.length > 0) {
            var b = s.bracketStack.pop();
            states.message = generateErrMessage(b);
            s.err = true;
        } else if (s.inSingleString) {
            states.message = generateErrMessage("'");
            s.err = true;
        } else if (s.inDoubleString) {
            states.message = generateErrMessage('"');
            s.err = true;
        }
        return s;
    };

    generateErrMessage = function (token) {
        var message;
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
        case '"':
            message = 'Missing "';
            break;
        default:
            message = "Unexpected " + token;
        }
        return message;
    };

    CodeChecker.charHandlers = {
        "[": function () {
            if (!states.inSingleString && !states.inDoubleString && !states.inComment) {
                states.bracketStack.push('[');
            }
        },
        "]": function () {
            if (!states.inSingleString && !states.inDoubleString && !states.inComment) {
                var b = states.bracketStack.pop();
                if (b !== '[') {
                    states.err = true;
                    states.message = generateErrMessage(b);
                }
            }
        },
        "(": function () {
            if (!states.inSingleString && !states.inDoubleString && !states.inComment) {
                states.bracketStack.push('(');
            }
        },
        ")": function () {
            if (!states.inSingleString && !states.inDoubleString && !states.inComment) {
                var b = states.bracketStack.pop();
                if (b !== '(') {
                    states.err = true;
                    states.message = generateErrMessage(b);
                }
            }
        },
        "{": function () {
            if (!states.inSingleString && !states.inDoubleString && !states.inComment) {
                states.bracketStack.push('{');
            }
        },
        "}": function () {
            if (!states.inSingleString && !states.inDoubleString && !states.inComment) {
                var b = states.bracketStack.pop();
                if (b !== "{") {
                    states.err = true;
                    states.message = generateErrMessage(b);
                }
            }
        },
        "'": function () {
            if (states.inComment) {
                // We can ignore quotes in comments
            } else if (states.inSingleString) {
                states.inSingleString = false;
                states.singleQ -= 1;
            } else if (!states.inDoubleString) {
                states.inSingleString = true;
                states.singleQ += 1;
            }
        },
        '"': function () {
            if (states.inComment) {
                // We can ignore quotes in comments
            } else if (states.inDoubleString) {
                states.inDoubleString = false;
                states.doubleQ -= 1;
            } else if (!states.inSingleString) {
                states.inDoubleString = true;
                states.doubleQ += 1;
            }
        },
        "/": function () {
            if (!states.inSingleString && !states.inDoubleString && !states.inComment) {
                if (CodeChecker.peek() === "/") {
                    CodeChecker.pop();
                    states.inComment = true;
                }
            }
        },
        "\\": function () {
            // Escaping next character
            CodeChecker.pop();
        },
        "\n": function () {
            if (states.inSingleString) {
                states.message = generateErrMessage("'");
                states.err = true;
            } else if (states.inDoubleString) {
                states.message = generateErrMessage('"');
                states.err = true;
            } else if (states.inComment) {
                states.inComment = false;
            }
        }
    };

    CodeChecker.parseChar = function (c) {
        if (CodeChecker.charHandlers[c]) {
            CodeChecker.charHandlers[c]();
        }
    };

    CodeChecker.parse = function (source) {
        var c;
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

// Add support for CommonJS. Just put this file somewhere on your require.paths
// and you will be able to `var js_beautify = require("beautify").js_beautify`.
if (typeof exports !== "undefined") {
    exports.simple_checker = {
        createChecker: createCodeChecker,
        createParsingFunctions: createParsingFunctions
    };
}
