
%lex

/* lexical grammar */

letter                [a-zA-Z]
digit                 [0-9]
strchars              [a-zA-Z0-9\-_ \t]*
dquote                "\""
squote                "'"

identifier            {letter}({letter}|{digit})*
number                (\-)?{digit}+("."{digit}+)?

%%

/* control structures */
"if"                  return "t_if"
"elif"                return "t_elif"
"else"                return "t_else"
"times"               return "t_times"
"with"                return "t_with"
"function"            return "t_function"
"return"              return "t_return"
"doOnce"              return "t_doOnce"

/* arrows */
"->"                  return "t_arrow"
">>"                  return "t_inlined"

/* comments */
"//".*\n              /* skip comments */
"//".*<<EOF>>         /* skip comments */

/* strings */
{dquote}{strchars}{dquote} yytext = yytext.substr(1,yyleng-2); return "t_string"
{squote}{strchars}{squote} yytext = yytext.substr(1,yyleng-2); return "t_string"

/* primitives */
"line"                return "t_shape"
"rect"                return "t_shape"
"box"                 return "t_shape"
"peg"                 return "t_shape"
"ball"                return "t_shape"

/* matrix command */
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

%token                t_if
%token                t_elif
%token                t_else
%token                t_times
%token                t_function
%token                t_arrow
%token                t_number
%token                t_primitive
%token                t_matrix
%token                t_style
%token                t_id
%token                t_eof
%token                t_newline
%token                t_blockstart
%token                t_blockend
%token                t_comma
%token                t_tick

/* operator associations and precedence */

%left "&&" "||"
%left ">" "<" ">=" "<=" "=="
%left "!"
%left "+" "-"
%left "*" "/" "%"
%left "^"

%start Program

%% /* language grammar */

Program
    : ProgramStart ProgramEnd
        { return []; }
    | ProgramStart SourceElements ProgramEnd
        { return $SourceElements; }
    ;

ProgramStart
    :
    | NewLine
    ;

ProgramEnd
    : t_eof
    ;

NewLine
    : t_newline
    | t_newline NewLine
    ;

SourceElements
    : Statement
        { $$ = [$1]; }
    | Statement NewLine SourceElements
        { $$ = [$1, $3]; }
    | Statement NewLine
        { $$ = [$1]; }
    ;

Block
    : t_blockstart NewLine BlockElements t_blockend
        {$$ = ["BLOCK", $3]; }
    ;

BlockElements
    : BlockStatement NewLine
        { $$ = [$1]; }
    | BlockStatement NewLine BlockElements
        { $$ = [$1, $3]; }
    ;

BlockStatement
    : Statement
    | t_return Expression
    ;

Statement
    : Assignment
    | FunctionCall
    | PrimitiveCall
    | IfStructure
    | TimesLoop
    | DoOnce
    | FinishedDoOnce
    ;

Assignment
    : Identifier "=" Expression
        { $$ = ["=", $1, $3]; }
    | Identifier "=" FunctionDef
        { $$ = ["=", $1, $3]; }
    ;

FunctionCall
    : Identifier FunctionArgs
        { $$ = ["FUNCTIONCALL", $1, $2]; }
    ;

PrimitiveCall
    : MatrixCall
    | StyleCall
    | ShapeCall
    ;

MatrixCall
    : MatrixFunction FunctionArgs
        { $$ = ["FUNCTIONCALL", $1, $2]; }
    | MatrixFunction FunctionArgs t_inlined PrimitiveCall
        { $$ = ["FUNCTIONCALL", $1, $2, ['BLOCK', [$4]]]; }
    | MatrixFunction FunctionArgs PrimitiveCall
        { $$ = ["FUNCTIONCALL", $1, $2, ['BLOCK', [$3]]]; }
    | MatrixFunction FunctionArgs t_inlined Block
        { $$ = ["FUNCTIONCALL", $1, $2, $4]; }
    | MatrixFunction FunctionArgs Block
        { $$ = ["FUNCTIONCALL", $1, $2, $3]; }
    ;

StyleCall
    : StyleFunction FunctionArgs
        { $$ = ["FUNCTIONCALL", $1, $2]; }
    | StyleFunction FunctionArgs t_inlined PrimitiveCall
        { $$ = ["FUNCTIONCALL", $1, $2, ['BLOCK', [$4]]]; }
    | StyleFunction FunctionArgs PrimitiveCall
        { $$ = ["FUNCTIONCALL", $1, $2, ['BLOCK', [$3]]]; }
    | StyleFunction FunctionArgs t_inlined Block
        { $$ = ["FUNCTIONCALL", $1, $2, $4]; }
    | StyleFunction FunctionArgs Block
        { $$ = ["FUNCTIONCALL", $1, $2, $3]; }
    ;

ShapeCall
    : ShapeFunction FunctionArgs
        { $$ = ["FUNCTIONCALL", $1, $2]; }
    ;

ExprFunctionCall
    : Identifier "(" FunctionArgs ")"
        { $$ = ["FUNCTIONCALL", $1, $3]; }
    ;

FunctionArgs
    :
        { $$ = []; }
    | FunctionArgValue
        { $$ = [$1]; }
    | FunctionArgValue t_comma FunctionArgs
        { $$ = [$1, $3]; }
    ;

FunctionArgValue
    : Expression
    | FunctionDef
    ;

IfStructure
    : t_if Expression Block
        { $$ = ["IF", $2, $3]; }
    | t_if Expression Block t_else Block
        { $$ = ["IF", $2, $3, $4]; }
    ;

FunctionDef
    : t_function "(" FunctionArgNames ")" t_arrow Expression
        { $$ = ["FUNCTIONDEF", $3, $6]; }
    | t_function "(" FunctionArgNames ")" t_arrow Block
        { $$ = ["FUNCTIONDEF", $3, $6]; }
    ;

FunctionArgNames
    :
        { $$ = []; }
    | Identifier
        { $$ = [$1]; }
    | Identifier t_comma FunctionArgNames
        { $$ = [$1, $3]; }
    ;

TimesLoop
    : Variable t_times Block
        { $$ = ["TIMES", $1, $3]; }
    | Variable t_times t_with Identifier Block
        { $$ = ["TIMES", $1, $5, $4]; }
    | Number t_times Block
        { $$ = ["TIMES", $1, $3]; }
    | Number t_times t_with Identifier Block
        { $$ = ["TIMES", $1, $5, $4]; }
    ;

DoOnce
    : t_doOnce Block
        { $$ = ["DOONCE", $2]; }
    | t_doOnce Expression
        { $$ = ["DOONCE", $2]; }
    | t_doOnce PrimitiveCall
        { $$ = ["DOONCE", $2]; }
    ;

FinishedDoOnce
    : t_tick DoOnce
        { $$ = ["DOONCE", []]; }
    ;

Expression
    : Expression "+" Expression
        { $$ = ["+", $1, $3]; }
    | Expression "-" Expression
        { $$ = ["-", $1, $3]; }
    | Expression "*" Expression
        { $$ = ["*", $1, $3]; }
    | Expression "/" Expression
        { $$ = ["/", $1, $3]; }
    | Expression "^" Expression
        { $$ = ["^", $1, $3]; }
    | Expression "%" Expression
        { $$ = ["%", $1, $3]; }

    | Expression ">" Expression
        { $$ = [">", $1, $3]; }
    | Expression "<" Expression
        { $$ = ["<", $1, $3]; }
    | Expression ">=" Expression
        { $$ = [">=", $1, $3]; }
    | Expression "<=" Expression
        { $$ = ["<=", $1, $3]; }
    | Expression "==" Expression
        { $$ = ["==", $1, $3]; }
    | Expression "&&" Expression
        { $$ = ["&&", $1, $3]; }
    | Expression "||" Expression
        { $$ = ["||", $1, $3]; }

    | "(" Expression ")"
        { $$ = $2; }
    | ExprFunctionCall
        { $$ = $1; }
    | Number
        { $$ = $1; }
    | Variable
        { $$ = $1; }
    | String
        { $$ = $1; }
    ;

ShapeFunction
    : t_shape
        { $$ = yytext; }
    ;

MatrixFunction
    : t_matrix
        { $$ = yytext; }
    ;

StyleFunction
    : t_style
        { $$ = yytext; }
    ;

Number
    : t_number
        { $$ = ["NUMBER", Number(yytext)]; }
    ;

Variable
    : Identifier
        { $$ = ["VARIABLE", $1]; }
    ;

String
    : t_string
        { $$ = ["STRING", yytext]; }
    ;

Identifier
    : t_id
        { $$ = yytext; }
    ;

