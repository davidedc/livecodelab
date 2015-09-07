/* global */

var Lexer = require('lex');

var lexer = new Lexer();

/* Whitespace rules */
lexer.addRule(/[ \t]+/, function () {});

lexer.addRule(/\n/, function (lexeme) {
    this.yytext = lexeme;
    return "t_newline";
});

lexer.addRule(/$/, function () {
    return "t_eof";
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

lexer.addRule(/$/, function () {
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

