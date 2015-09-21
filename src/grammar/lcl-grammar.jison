
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
    : t_blockstart SourceElement* t_blockend
        {$$ = Ast.Node.Block($2); }
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
    : t_if Expression t_newline Block
        { $$ = Ast.Node.If($2, $4); }
    | t_if Expression t_newline Block t_else Block
        { $$ = Ast.Node.If($2, $4, $4); }
    ;

EmptyArgsList
    :
        { $$ = []; }
    ;

TimesLoop
    : t_loop Expression t_times t_newline Block
        { $$ = Ast.Node.Times($2, $5); }
    | t_loop Expression t_times t_with Identifier t_newline Block
        { $$ = Ast.Node.Times($2, $7, $5); }
    ;

DoOnce
    : t_doOnce t_newline Block
        { $$ = Ast.Node.DoOnce($3); }
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
    | "-" "(" Expression ")" %prec UMINUS
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

