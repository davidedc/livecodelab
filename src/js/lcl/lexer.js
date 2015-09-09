/* global */

var Lexer = require('lex');

var lexer = new Lexer(function (c) {
    throw new Error(
        "Unexpected character at row " + row + ", col " + col + ": " + c
    );
});

lexer.yyloc = {
    first_column: 0,
    first_line: 1,
    last_line: 1,
    last_column: 0
};
lexer.yylloc = lexer.yyloc;
lexer.yylineno = 0;

var row = 1;
var col = 1;
/* Whitespace rules */
lexer.addRule(/[ ]+/, function () {});

indent = [0];
lexer.addRule(/^\t*(?!\n)/gm, function (lexeme) {
    var indentation = lexeme.length;

    if (indentation > indent[0]) {
        indent.unshift(indentation);
        return "t_blockstart";
    }

    var tokens = [];

    while (indentation < indent[0]) {
        tokens.push("t_blockend");
        tokens.push("t_newline");
        indent.shift();
    }

    if (tokens.length) {
        return tokens;
    }
});

lexer.addRule(/^(\t*)\n/gm, function (lexeme, tabs) {
    this.yylineno += 1;
    // ignore empty lines
});

lexer.addRule(/\n/, function (lexeme) {
    this.yytext = lexeme;
    lexer.yylineno += 1;
    row += 1;
    col = 1;
    return "t_newline";
});

lexer.addRule(/$/, function () {
    tokens = ["t_newline"];
    while (0 < indent[0]) {
        tokens.push("t_blockend");
        tokens.push("t_newline");
        indent.shift();
    }
    tokens.push("t_eof");
    return tokens;
});

/* Number */
lexer.addRule(/[0-9]+(?:\.[0-9]+)?\b/, function (lexeme) {
    this.yytext = lexeme;
    return "t_number";
});

/* If Tokens */
lexer.addRule(/if/, function (lexeme) {
    this.yytext = lexeme;
    return "t_if";
});
lexer.addRule(/elif/, function (lexeme) {
    this.yytext = lexeme;
    return "t_elif";
});
lexer.addRule(/else/, function (lexeme) {
    this.yytext = lexeme;
    return "t_else";
});

/* Times Tokens */
lexer.addRule(/times/, function (lexeme) {
    this.yytext = lexeme;
    return "t_times";
});
lexer.addRule(/loop/, function (lexeme) {
    this.yytext = lexeme;
    return "t_loop";
});
lexer.addRule(/with/, function (lexeme) {
    this.yytext = lexeme;
    return "t_with";
});

/* DoOnce Tokens */
lexer.addRule(/doOnce/, function (lexeme) {
    this.yytext = lexeme;
    return "t_doOnce";
});
lexer.addRule(/✓/, function (lexeme) {
    this.yytext = lexeme;
    return "t_tick";
});

/* Def Tokens */
lexer.addRule(/def/, function (lexeme) {
    this.yytext = lexeme;
    return "t_def";
});

/* Arrow Tokens */
lexer.addRule(/->/, function (lexeme) {
    this.yytext = lexeme;
    return "t_arrow";
});

/* Inlines Tokens */
lexer.addRule(/>>/, function (lexeme) {
    this.yytext = lexeme;
    return "t_inlined";
});

lexer.addRule(/\/\/.*\n/, function (lexeme) {
    this.yytext = lexeme;
    return "t_newline";
});
lexer.addRule(/\/\/.*$/, function (lexeme) {
    this.yytext = lexeme;
    return "t_eof";
});

/* String Tokens */
lexer.addRule(/"([a-zA-Z0-9\-_ \t]*)"/, function (lexeme) {
    this.yytext = lexeme.substr(1,lexeme.length-2);
    return "t_string";
});
lexer.addRule(/'[a-zA-Z0-9\-_ \t]*'/, function (lexeme) {
    this.yytext = lexeme.substr(1,lexeme.length-2);
    return "t_string";
});

/* Shape Commands */
lexer.addRule(/line/, function (lexeme) {
    this.yytext = lexeme;
    return "t_shape";
});
lexer.addRule(/rect/, function (lexeme) {
    this.yytext = lexeme;
    return "t_shape";
});
lexer.addRule(/box/, function (lexeme) {
    this.yytext = lexeme;
    return "t_shape";
});
lexer.addRule(/peg/, function (lexeme) {
    this.yytext = lexeme;
    return "t_shape";
});
lexer.addRule(/ball/, function (lexeme) {
    this.yytext = lexeme;
    return "t_shape";
});

/* Matrix Commands */
lexer.addRule(/rotate/, function (lexeme) {
    this.yytext = lexeme;
    return "t_matrix";
});
lexer.addRule(/scale/, function (lexeme) {
    this.yytext = lexeme;
    return "t_matrix";
});
lexer.addRule(/move/, function (lexeme) {
    this.yytext = lexeme;
    return "t_matrix";
});

/* Style Commands */
lexer.addRule(/fill/, function (lexeme) {
    this.yytext = lexeme;
    return "t_style";
});
lexer.addRule(/noFill/, function (lexeme) {
    this.yytext = lexeme;
    return "t_style";
});
lexer.addRule(/stroke/, function (lexeme) {
    this.yytext = lexeme;
    return "t_style";
});
lexer.addRule(/noStroke/, function (lexeme) {
    this.yytext = lexeme;
    return "t_style";
});

lexer.addRule(/[a-zA-Z]([a-zA-Z0-9])*/, function (lexeme) {
    this.yytext = lexeme;
    return "t_id";
});

/* Math Operators */
lexer.addRule(/\*/, function (lexeme) {
    this.yytext = lexeme;
    return "*";
});
lexer.addRule(/\//, function (lexeme) {
    this.yytext = lexeme;
    return "/";
});
lexer.addRule(/\-/, function (lexeme) {
    this.yytext = lexeme;
    return "-";
});
lexer.addRule(/\+/, function (lexeme) {
    this.yytext = lexeme;
    return "+";
});
lexer.addRule(/\^/, function (lexeme) {
    this.yytext = lexeme;
    return "^";
});
lexer.addRule(/\%/, function (lexeme) {
    this.yytext = lexeme;
    return "%";
});

/* Boolean Operators */
lexer.addRule(/!/, function (lexeme) {
    this.yytext = lexeme;
    return "!";
});
lexer.addRule(/>/, function (lexeme) {
    this.yytext = lexeme;
    return ">";
});
lexer.addRule(/</, function (lexeme) {
    this.yytext = lexeme;
    return "<";
});
lexer.addRule(/>=/, function (lexeme) {
    this.yytext = lexeme;
    return ">=";
});
lexer.addRule(/<=/, function (lexeme) {
    this.yytext = lexeme;
    return "<=";
});
lexer.addRule(/==/, function (lexeme) {
    this.yytext = lexeme;
    return "==";
});
lexer.addRule(/&&/, function (lexeme) {
    this.yytext = lexeme;
    return "&&";
});
lexer.addRule(/\|\|/, function (lexeme) {
    this.yytext = lexeme;
    return "||";
});

/* Brackets */
lexer.addRule(/\(/, function (lexeme) {
    this.yytext = lexeme;
    return "(";
});
lexer.addRule(/\)/, function (lexeme) {
    this.yytext = lexeme;
    return ")";
});
lexer.addRule(/{/, function (lexeme) {
    this.yytext = lexeme;
    return "t_blockstart";
});
lexer.addRule(/}/, function (lexeme) {
    this.yytext = lexeme;
    return "t_blockend";
});

/* Assignment */
lexer.addRule(/=/, function (lexeme) {
    this.yytext = lexeme;
    return "=";
});

lexer.addRule(/,/, function (lexeme) {
    this.yytext = lexeme;
    return "t_comma";
});

module.exports = lexer;

