
{

    var Ast = require('../js/lcl/ast');
    var _ = require('underscore');

    var indentStack = [], indent = "";

    var collapseTail = function (head, tail, astNode) {
        return _.reduce(tail, function (o, n) {
            var op  = n[1];
            var exp = n[3];
            return astNode(op, o, exp);
        }, head);
    };

    function extractOptional(optional, index) {
        return optional ? optional[index] : null;
    }

    function extractList(list, index) {
        var result = new Array(list.length), i;

        for (i = 0; i < list.length; i++) {
            result[i] = list[i][index];
        }

        return result;
    }

    function buildList(head, tail, index) {
        return [head].concat(extractList(tail, index));
    }

    function optionalList(value) {
        return value !== null ? value : [];
    }

}

Program
  = NewLine* elements:SourceElements? NewLine* EOF {
      return Ast.Node.Block(optionalList(elements, 0));
  }

SourceElements "elements"
  = head:SourceElement tail:(NewLine SourceElement)* {
      return buildList(head, tail, 1);
  }

SourceElement "elements"
  = Samedent statement:Statement _ Comment* _ {
      return statement;
  }

Block "block"
  = Indent elements:SourceElements Dedent {
      return Ast.Node.Block(elements);
  }

/** Base statements
 *
 */

Statement "statement"
  = Assignment
  / DoOnce
  / If
  / TimesLoop
  / Application

Assignment "assignment"
  = id:Identifier _ "=" _ expr:Expression {
      return Ast.Node.Assignment(id, expr);
  }

/** Application Rules
 *
 */

Application "application"
  = FullApplication
  / ExpressionApplication

ExpressionApplication "expr application"
  = name:Identifier _ "(" _ args:ArgumentList? _ ")" {
      var argList =  optionalList(args, 0);
      return Ast.Node.Application(name, argList, null);
  }

FullApplication
  = name:Identifier _ args:ArgumentList? _ block:ApplicationBlock? {
      var argList =  optionalList(args, 0);
      return Ast.Node.Application(name, argList, block);
  }

ApplicationBlock
  = NewLine block:Block {
      return block;
  }
  / ">>"? _ fullApl:FullApplication {
      return Ast.Node.Block([fullApl]);
  }

ArgumentList
  = head:Expression tail:(_ "," _ Expression)* {
      return buildList(head, tail, 3);
    }

/** If Rules
 *
 */

If "if"
  = "if" _ predicate:Expression _ NewLine ifBlock:Block elseBlock:Else?{
      return Ast.Node.If(predicate, ifBlock, elseBlock);
  }

Else "else"
  = NewLine "else" _ NewLine elseBlock:Block {
      return elseBlock;
  }

/** Times Loop Rules
 *
 */

TimesLoop "times"
  = expr:Expression _ "times" loopVar:LoopVar? _ NewLine block:Block {
      return Ast.Node.Times(expr, block, loopVar);
  }

LoopVar
  = _ "with" _ loopVar:Identifier {
      return loopVar;
  }

/** DoOnce Rules
 *
 */

DoOnce "do once"
  = FinishedDoOnce
  / ActiveDoOnce

FinishedDoOnce "finished do once"
  = "✓" _ doOnce:ActiveDoOnce {
      doOnce.active = false;
      return doOnce;
  }

ActiveDoOnce "active do once"
  = "doOnce" _ NewLine block:Block {
      return Ast.Node.DoOnce(true, block);
  }
  / "doOnce" _ expr:Expression {
      return Ast.Node.DoOnce(true, Ast.Node.Block([expr]));
  }

/** Expression Rules
 *
 */

Expression
  = LogicCombi

LogicCombi "logicCombinator"
  = head:LogicExpr tail:( _ ("&&" / "||") _ LogicExpr)* {
      return collapseTail(head, tail, Ast.Node.BinaryOp);
  }

LogicExpr "logicExpr"
  = head:AddSub tail:( _ (">=" / "<=" / "==" / ">" / "<") _ AddSub)* {
      return collapseTail(head, tail, Ast.Node.BinaryOp);
  }

UnaryLogicExpr "unaryLogicExpr"
  = "!" _ expr:AddSub {
      return Ast.Node.UnaryOp("!", expr);
  }

AddSub "addsub"
  = head:Factor tail:( _ ("+" / "-") _ Factor)* {
      return collapseTail(head, tail, Ast.Node.BinaryOp);
  }

Factor "factor"
  = head:Exponent tail:( _ ("*" / "/" / "%") _ Exponent)* {
      return collapseTail(head, tail, Ast.Node.BinaryOp);
  }

Exponent "exponent"
  = head:Primary tail:( _ "^" _ Primary)* {
      return collapseTail(head, tail, Ast.Node.BinaryOp);
  }

Primary
  = Lambda
  / Base
  / String
  / NegativeExpr

NegativeExpr
  = "-" _ base:Base {
      return Ast.Node.UnaryOp('-', base);
  }

Base
  = Num
  / ExpressionApplication
  / Variable
  / "(" _ expr:Expression _ ")" { return expr; }

Variable "variable"
  = id:Identifier { return Ast.Node.Variable(id); }

Identifier
  = [a-zA-Z]+[a-zA-Z0-9]* {return text(); }

/** Literals
 *
 */


Num "number"
  = [0-9]+('.'[0-9]+)? {
      return Ast.Node.Num(Number(text()));
  }

String "string"
  = "'" chars:([^\n\r\f'])* "'" {
      return Ast.Node.Str(chars.join(''));
  }
  / '"' chars:([^\n\r\f"])* '"' {
      return Ast.Node.Str(chars.join(''));
  }

Lambda "lambda"
  = "(" _ params:ParamList? _ ")" _ "->" _ body:LambdaBody {
      return Ast.Node.Closure(optionalList(params), body);
  }

LambdaBody
  = Expression
  / NewLine block:Block {
      return block;
  }

ParamList "param list"
  = head:Identifier tail:(_ "," _ Identifier)* {
      return buildList(head, tail, 3);
    }

/** Indentation Rules
 *
 */

Indent
  = &(
        i:[\t]+ &{
            return i.length === (indent.length + 1);
        }
        {
            indentStack.push(indent);
            indent = i.join("");
            parser.position = location().start.offset;
        }
    )

Samedent
  = i:[\t]* &{
      return i.join("") === indent;
  }

Dedent
  = &(
        i:[\t]* &{
            return i.length <= (indent.length - 1);
        }
        {
            indent = indentStack.pop();
        }
    )

/** Util Rules
 *
 */

Comment
  = "//" [^\n]*

NewLine
  = Comment? "\n"+ Comment? NewLine?

EOF
  = !.

_ "whitespace"
  = [ ]*

