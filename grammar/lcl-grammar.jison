

%lex

/* lexical grammar */

comment               "//"
letter                [a-zA-Z]
digit                 [0-9]
whitespace            [ \t]+
newline               [\n]+

identifier            {letter}({letter}|{digit})*
number                (\-)?{digit}+("."{digit}+)?

%%


/* control structures */
"if"                  return "t_if"
"elif"                return "t_elif"
"else"                return "t_else"
"times"               return "t_times"
"function"            return "t_function"
"return"              return "t_return"

/* arrows */
"->"                  return "t_arrow"
">>"                  return "t_inlined"

/* comments */
{comment}.*\n         /* skip comments */

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

/* colour commands */
"fill"                return "t_style"
"noFill"              return "t_style"
"stroke"              return "t_style"
"noStroke"            return "t_style"

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
\n+                   return "t_newline"
","                   return "t_comma"
<<EOF>>               return "t_eof"
{whitespace}          /* skip whitespace */
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
    : t_newline t_eof
        { return []; }
    | t_eof
        { return []; }
    | SourceElements t_eof
        { return $SourceElements; }
    | t_newline SourceElements t_eof
        { return $SourceElements; }
    ;

SourceElements
    : Statement
        { $$ = [$1]; }
    | Statement t_newline SourceElements
        { $$ = [$1, $3]; }
    ;

Block
    : t_blockstart t_newline BlockElements t_blockend
        {$$ = ["BLOCK", $3]; }
    ;

BlockElements
    : BlockStatement t_newline
        { $$ = [$1]; }
    | BlockStatement t_newline BlockElements
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
    | ColourCall
    | ShapeCall
    ;

MatrixCall
    : MatrixFunction FunctionArgs
        { $$ = ["FUNCTIONCALL", $1, $2]; }
    | MatrixFunction FunctionArgs t_inlined PrimitiveCall
        { $$ = ["FUNCTIONCALL", $1, $2, $5]; }
    | MatrixFunction FunctionArgs t_inlined Block
        { $$ = ["FUNCTIONCALL", $1, $2, $5]; }
    | MatrixFunction FunctionArgs Block
        { $$ = ["FUNCTIONCALL", $1, $2, $4]; }
    ;

ColourCall
    : ColourFunction FunctionArgs
        { $$ = ["FUNCTIONCALL", $1, $2]; }
    | ColourFunction FunctionArgs t_inlined PrimitiveCall
        { $$ = ["FUNCTIONCALL", $1, $2, $5]; }
    | ColourFunction FunctionArgs t_inlined Block
        { $$ = ["FUNCTIONCALL", $1, $2, $5]; }
    | ColourFunction FunctionArgs Block
        { $$ = ["FUNCTIONCALL", $1, $2, $5]; }
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
        { $$ = [$1, $2, $3]; }
    | t_if Expression Block t_else Block
        { $$ = [$1, $2, $3, $4]; }
    ;

FunctionDef
    : t_function "(" FunctionArgNames ")" t_arrow Expression
        { $$ = ["FUNCTIONDEF", $1, $4]; }
    | t_function "(" FunctionArgNames ")" t_arrow Block
        { $$ = ["FUNCTIONDEF", $1, $4]; }
    ;

FunctionArgNames
    :
        { $$ = []; }
    | Identifier
        { $$ = [$1]; }
    | FunctionArgNames t_comma Identifier
        { $$ = [$1, $2]; }
    ;

TimesLoop
    : Number t_times Block
        { $$ = ["TIMES", $1, $3]; }
    | Number t_times "with" Identifier Block
        { $$ = ["TIMES", $1, $6, $3]; }
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
    | Identifier
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

ColourFunction
    : t_colour
        { $$ = yytext; }
    ;

Number
    : t_number
        { $$ = Number(yytext); }
    ;

Identifier
    : t_id
        { $$ = yytext; }
    ;

