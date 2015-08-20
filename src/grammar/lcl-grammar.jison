
%lex

/* lexical grammar */

letter                [a-zA-Z]
digit                 [0-9]
strchars              [a-zA-Z0-9\-_ \t]*
dquote                "\""
squote                "'"

identifier            {letter}({letter}|{digit})*
number                {digit}+("."{digit}+)?

%%

/* control structures */
"if"                  return "t_if"
"elif"                return "t_elif"
"else"                return "t_else"
"times"               return "t_times"
"loop"                return "t_loop"
"with"                return "t_with"
"doOnce"              return "t_doOnce"
"def"                 return "t_def"

/* arrows */
"->"                  return "t_arrow"
">>"                  return "t_inlined"

/* comments */
"//".*\n              return "t_newline"
"//".*<<EOF>>         return "t_eof"

/* strings */
{dquote}{strchars}{dquote} yytext = yytext.substr(1,yyleng-2); return "t_string"
{squote}{strchars}{squote} yytext = yytext.substr(1,yyleng-2); return "t_string"

/* inlinable functions */

/* shape commands */
"line"                return "t_shape"
"rect"                return "t_shape"
"box"                 return "t_shape"
"peg"                 return "t_shape"
"ball"                return "t_shape"

/* matrix commands */
"rotate"              return "t_matrix"
"scale"               return "t_matrix"
"move"                return "t_matrix"

/* style commands */
"fill"                return "t_style"
"noFill"              return "t_style"
"stroke"              return "t_style"
"noStroke"            return "t_style"

"✓"                   return "t_tick"

{number}              return "t_number"
{identifier}          return "t_id"

/* math operators */
"*"                   return "*"
"/"                   return "/"
"-"                   return "-"
"+"                   return "+"
"^"                   return "^"
"%"                   return "%"

/* boolean operators */
"!"                   return "!"
">"                   return ">"
"<"                   return "<"
">="                  return ">="
"<="                  return "<="
"=="                  return "=="
"&&"                  return "&&"
"||"                  return "||"

/* brackets */
"("                   return "("
")"                   return ")"
"{"                   return "t_blockstart"
"}"                   return "t_blockend"

/* assignment */
"="                   return "="

/* misc */
\n                    return "t_newline"
","                   return "t_comma"
<<EOF>>               return "t_eof"
[ \t]+                /* skip whitespace */
.                     return "INVALID"


/lex

%{

var Ast = require('../js/lcl/ast');

%}

/* operator associations and precedence */

%left "&&" "||"
%left ">" "<" ">=" "<=" "=="
%left "!"
%left "+" "-"
%left "*" "/" "%"
%left "^"
%right UMINUS

%start Program

%ebnf

%% /* language grammar */

Program
    : Terminator* SourceElement*
        { return Ast.Node.Block($2); }
    ;

Terminator
    : t_newline
    | t_eof
    ;

SourceElement
    : Statement Terminator+
        { $$ = $1; }
    ;

Block
    : t_blockstart Terminator+ SourceElement* t_blockend
        {$$ = Ast.Node.Block($3); }
    ;

Statement
    : Assignment
    | Application
    | InlinableApplication
    | If
    | TimesLoop
    | DoOnce
    | FinishedDoOnce
    ;

Assignment
    : Identifier "=" PrimaryExpression
        { $$ = Ast.Node.Assignment($1, $3); }
    ;

Application
    : Identifier ApplicationArgs
        { $$ = Ast.Node.Application($1, $2); }
    | Identifier ApplicationArgs t_inlined Application
        { $$ = Ast.Node.Application($1, $2, Ast.Node.Block([$4])); }
    | Identifier ApplicationArgs t_inlined InlinableApplication
        { $$ = Ast.Node.Application($1, $2, Ast.Node.Block([$4])); }
    | Identifier ApplicationArgs Block
        { $$ = Ast.Node.Application($1, $2, $3); }
    ;

InlinableApplication
    : Inlinable ApplicationArgs
        { $$ = Ast.Node.Application($1, $2); }
    | Inlinable ApplicationArgs t_inlined Application
        { $$ = Ast.Node.Application($1, $2, Ast.Node.Block([$4])); }
    | Inlinable ApplicationArgs t_inlined InlinableApplication
        { $$ = Ast.Node.Application($1, $2, Ast.Node.Block([$4])); }
    | Inlinable ApplicationArgs InlinableApplication
        { $$ = Ast.Node.Application($1, $2, Ast.Node.Block([$3])); }
    | Inlinable ApplicationArgs Block
        { $$ = Ast.Node.Application($1, $2, $3); }
    ;

ApplicationArgs
    : EmptyArgsList
    | ApplicationArgsList
    ;


ApplicationArgsList
    : PrimaryExpression
        { $$ = [$1]; }
    | PrimaryExpression t_comma ApplicationArgsList
        { $$ = [$1].concat($3); }
    ;

If
    : t_if Expression Block
        { $$ = Ast.Node.If($2, $3); }
    | t_if Expression Block t_else Block
        { $$ = Ast.Node.If($2, $3, $4); }
    ;

EmptyArgsList
    :
        { $$ = []; }
    ;

TimesLoop
    : t_loop Expression t_times Block
        { $$ = Ast.Node.Times($2, $4); }
    | t_loop Expression t_times t_with Identifier Block
        { $$ = Ast.Node.Times($2, $6, $5); }
    ;

DoOnce
    : t_doOnce Block
        { $$ = Ast.Node.DoOnce($2); }
    | t_doOnce Application
        { $$ = Ast.Node.DoOnce(Ast.Node.Block([$2])); }
    | t_doOnce InlinableApplication
        { $$ = Ast.Node.DoOnce(Ast.Node.Block([$2])); }
    ;

FinishedDoOnce
    : t_tick DoOnce
        { $$ = Ast.Node.DoOnce(Ast.Node.Block([])); }
    ;


/** Expressions
 *
 */

PrimaryExpression
    : Expression
    | Closure
    ;

Expression
    : Expression "+" Expression
        { $$ = Ast.Node.BinaryMathOp("+", $1, $3); }
    | Expression "-" Expression
        { $$ = Ast.Node.BinaryMathOp("-", $1, $3); }
    | Expression "*" Expression
        { $$ = Ast.Node.BinaryMathOp("*", $1, $3); }
    | Expression "/" Expression
        { $$ = Ast.Node.BinaryMathOp("/", $1, $3); }
    | Expression "^" Expression
        { $$ = Ast.Node.BinaryMathOp("^", $1, $3); }
    | Expression "%" Expression
        { $$ = Ast.Node.BinaryMathOp("%", $1, $3); }

    | "!" Expression
        { $$ = Ast.Node.UnaryLogicOp("!", $1); }
    | Expression ">" Expression
        { $$ = Ast.Node.BinaryLogicOp(">", $1, $3); }
    | Expression "<" Expression
        { $$ = Ast.Node.BinaryLogicOp("<", $1, $3); }
    | Expression ">=" Expression
        { $$ = Ast.Node.BinaryLogicOp(">=", $1, $3); }
    | Expression "<=" Expression
        { $$ = Ast.Node.BinaryLogicOp("<=", $1, $3); }
    | Expression "==" Expression
        { $$ = Ast.Node.BinaryLogicOp("==", $1, $3); }
    | Expression "&&" Expression
        { $$ = Ast.Node.BinaryLogicOp("&&", $1, $3); }
    | Expression "||" Expression
        { $$ = Ast.Node.BinaryLogicOp("||", $1, $3); }

    | "(" Expression ")"
        { $$ = $2; }

    | NegativeExpression
        { $$ = $1; }

    | ExprApplication
        { $$ = $1; }
    | Number
        { $$ = $1; }
    | Variable
        { $$ = $1; }
    | String
        { $$ = $1; }
    ;

NegativeExpression
    : "-" Number %prec UMINUS
        { $$ = Ast.Node.UnaryMathOp("-", $2); }
    | "-" Variable %prec UMINUS
        { $$ = Ast.Node.UnaryMathOp("-", $2); }
    | "-" "(" Expression ")" prec UMINUS
        { $$ = Ast.Node.UnaryMathOp("-", $3); }
    ;

ExprApplication
    : Identifier "(" ApplicationArgs ")"
        { $$ = Ast.Node.Application($1, $3); }
    ;

Closure
    : t_def "(" ClosureArgs ")" t_arrow PrimaryExpression
        { $$ = Ast.Node.Closure($3, $6); }
    | t_def "(" ClosureArgs ")" t_arrow Block
        { $$ = Ast.Node.Closure($3, $6); }
    ;

ClosureArgs
    : EmptyArgsList
    | ClosureArgsList
    ;

ClosureArgsList
    : Identifier
        { $$ = [$1]; }
    | Identifier t_comma ClosureArgsList
        { $$ = [$1].concat($3); }
    ;

/* basics */

Number
    : t_number
        { $$ = Ast.Node.Num(Number(yytext)); }
    ;

Variable
    : Identifier
        { $$ = Ast.Node.Variable($1); }
    ;

String
    : t_string
        { $$ = Ast.Node.Str(yytext); }
    ;

Inlinable
    : t_shape
        { $$ = yytext; }
    | t_matrix
        { $$ = yytext; }
    | t_style
        { $$ = yytext; }
    ;

Identifier
    : t_id
        { $$ = yytext; }
    ;

