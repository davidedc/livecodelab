
{

    var Ast = require('../js/lcl/ast');
    var types = require('../js/lcl/ast/types');
    var _ = require('underscore');

    var indentStack = [], indent = "";

    var functionNames = options.functionNames || [];

    var inlinableFunctions = options.inlinableFunctions || [];

    var blockFunctions = inlinableFunctions

    var keywords = ['else']

    var collapseTail = function (head, tail, astNode) {
        return _.reduce(tail, function (o, n) {
            var op  = n[1];
            var exp = n[3];
            return astNode(op, o, exp);
        }, head);
    };

    function extractOptional(optional, index) {
        return optional ? optional[index] : Ast.Null();
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
      return Ast.Block(optionalList(elements, 0));
  }

SourceElements "elements"
  = head:SourceElement tail:(NewLine SourceElement)* {
      var elements = buildList(head, tail, 1);
      return _.filter(elements, function (e) { return e.type !== types.NULL; });
  }

SourceElement "elements"
  = Samedent statement:Statement _ Comment? {
      return statement;
  }
  / [\t]* _ c:Comment {
      return Ast.Null();
  }

Block "block"
  = Indent elements:SourceElements Dedent {
      return Ast.Block(elements);
  }

/** Base statements
 *
 */

Statement "statement"
  = Assignment
  / DoOnce
  / If
  / Application
  / TimesLoop

Assignment "assignment"
  = id:Identifier _ "=" _ expr:Expression {
      if (expr.type === types.CLOSURE) {
          functionNames.push(id);
          if (expr.inlinable) {
            inlinableFunctions.push(id);
          }
      }
      return Ast.Assignment(id, expr);
  }

/** Application Rules
 *
 */

Application "application"
  = FullApplication
  / SimpleApplication

SimpleApplication "simple application"
  = name:FunctionName "(" _ args:ArgumentList? _ ")" {
      var argList =  optionalList(args, 0);
      return Ast.Application(name, argList);
  }
  / name:FunctionName _ args:ArgumentList? {
      var argList =  optionalList(args, 0);
      return Ast.Application(name, argList);
  }

FullApplication
  = name:InlinableFunction _ body:ApplicationBody? {
      var argList = [];
      var block = Ast.Null();
      if (body !== null) {
        argList = body.argList;
        block = body.block;
      }
      return Ast.Application(name, argList, block);
  }

ApplicationBody
  = block:ApplicationBlock {
      return {
        argList: [],
        block: block
      };
  }
  / args:ArgumentList? _ block:ApplicationBlock? {
      return {
        argList: optionalList(args, 0),
        block: block || Ast.Null()
      };
  }

ApplicationBlock
  = NewLine block:Block {
      return block;
  }
  / ">>"? _ inlined:Inlinable {
      return Ast.Block([inlined]);
  }

Inlinable
  = TimesLoop
  / InlinedApplication

InlinedApplication
  = name:InlinableFunction _ body:ApplicationBody {
      return Ast.Application(name, body.argList, body.block);
  }

ArgumentList
  = head:Expression tail:(_ "," _ Expression)* {
      return buildList(head, tail, 3);
  }

FunctionName
  = name:Identifier &{
    var isInlinable = (inlinableFunctions.indexOf(name) !== -1);
    var isFunction = (functionNames.indexOf(name) !== -1);
    return (isFunction && !isInlinable);
  } {
    return name;
  }

InlinableFunction
  = name:Identifier &{
    var isInlinable = (inlinableFunctions.indexOf(name) !== -1);
    return isInlinable;
  } {
    return name;
  }

/** If Rules
 *
 */

If "if"
  = "if" _ predicate:Expression _ NewLine ifBlock:Block elseBlock:(Else)? {
      return Ast.If(predicate, ifBlock, elseBlock || Ast.Null());
  }
  / "if" _ predicate:Expression _ NewLine ifBlock:Block {
      return Ast.If(predicate, ifBlock);
  }
  / "if" _ predicate:Expression _ "then" _ ifAction:Statement _ "else" _ elseAction:Statement {
      return Ast.If(
        predicate,
        Ast.Block([ifAction]),
        Ast.Block([elseAction])
      );
  }
  / "if" _ predicate:Expression _ "then" _ ifAction:Statement {
      return Ast.If(predicate, Ast.Block([ifAction]));
  }

Else "else"
  = NewLine Samedent "else" _ ifBlock:If {
      return ifBlock;
  }
  / NewLine Samedent "else" _ NewLine block:Block {
      return Ast.If(Ast.Num(1), block);
  }

/** Times Loop Rules
 *
 */

TimesLoop "times"
  = expr:Expression _ "times" loopVar:LoopVar? _ block:TimesLoopBlock {
      return Ast.Times(expr, block, loopVar || Ast.Null());
  }

TimesLoopBlock
  = NewLine block:Block {
      return block;
  }
  / ">>"? _ inlined:Inlinable {
      return Ast.Block([inlined]);
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
      return Ast.DoOnce(true, block);
  }
  / "doOnce" _ appl:FullApplication {
      return Ast.DoOnce(true, Ast.Block([appl]));
  }
  / "doOnce" _ expr:Expression {
      return Ast.DoOnce(true, Ast.Block([expr]));
  }
  / EmptyDoOnce

EmptyDoOnce "empty do once"
  = "doOnce" {
      return Ast.DoOnce(false);
  }

/** Expression Rules
 *
 */

Expression
  = LogicCombi

LogicCombi "logicCombinator"
  = head:LogicExpr tail:( _ ("&&" / "||") _ LogicExpr)* {
      return collapseTail(head, tail, Ast.BinaryOp);
  }

LogicExpr "logicExpr"
  = head:AddSub tail:( _ (">=" / "<=" / "==" / ">" / "<") _ AddSub)* {
      return collapseTail(head, tail, Ast.BinaryOp);
  }

UnaryLogicExpr "unaryLogicExpr"
  = "!" _ expr:AddSub {
      return Ast.UnaryOp("!", expr);
  }

AddSub "addsub"
  = head:Factor tail:( _ ("+" / "-") _ Factor)* {
      return collapseTail(head, tail, Ast.BinaryOp);
  }

Factor "factor"
  = head:Exponent tail:( _ ("*" / "/" / "%") _ Exponent)* {
      return collapseTail(head, tail, Ast.BinaryOp);
  }

Exponent "exponent"
  = head:Primary tail:( _ "^" _ Primary)* {
      return collapseTail(head, tail, Ast.BinaryOp);
  }

Primary
  = Lambda
  / DeIndex
  / Base
  / String
  / NegativeExpr

NegativeExpr
  = "-" _ base:Base {
      return Ast.UnaryOp('-', base);
  }

Base
  = Num
  / SimpleApplication
  / Variable
  / List
  / "(" _ expr:Expression _ ")" { return expr; }

Variable "variable"
  = id:Identifier &{
    var isInlinable = (inlinableFunctions.indexOf(id) !== -1);
    var isKeyword = (keywords.indexOf(id) !== -1);
    return !isInlinable && !isKeyword;
  } {
    return Ast.Variable(id);
  }

DeIndex "deindex"
  = collection:Base "[" index:Expression "]" {
    return Ast.DeIndex(collection, index);
  }

Identifier
  = [a-zA-Z]+[a-zA-Z0-9]* {return text(); }

/** Literals
 *
 */


Num "number"
  = [0-9]+('.'[0-9]+)? {
      return Ast.Num(Number(text()));
  }

String "string"
  = "'" chars:([^\n\r\f'])* "'" {
      return Ast.Str(chars.join(''));
  }
  / "\"" chars:([^\n\r\f\"])* "\"" {
      return Ast.Str(chars.join(''));
  }

List "list"
  = "[" valList:ArgumentList? "]" {
      var values =  optionalList(valList, 0);
      return Ast.List(values);
  }

Lambda "lambda"
  = LazyLambda
  / "(" _ params:ParamList? _ ")" _ ("->" / "=>") _ body:LambdaBody {
      return Ast.Closure(optionalList(params), body, false);
  }

LambdaBody
  = Expression
  / NewLine block:Block {
      return block;
  }

LazyLambda "lazy"
  = "<" _ lazy:Application _ ">" {
      return Ast.Closure([], Ast.Block([lazy]), true);
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

Comment = "//" [^\n]*

NewLine
  = "\n"+

EOF
  = !.

_ "whitespace"
  = [ ]*

