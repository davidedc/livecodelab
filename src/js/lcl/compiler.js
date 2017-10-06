import _ from 'underscore';

import {
  NULL,
  BLOCK,
  ASSIGNMENT,
  APPLICATION,
  IF,
  CLOSURE,
  TIMES,
  DOONCE,
  UNARYOP,
  BINARYOP,
  DEINDEX,
  NUM,
  VARIABLE,
  STRING,
  LIST
} from './ast/types';

function exists(node) {
  return node.type !== NULL;
}

export function compile(astNode) {
  const jsProgram = compileNode(astNode);
  return new Function(jsProgram);
}

function compileNode(node) {
  var output;

  switch (node.type) {
    case BLOCK:
      output = compileBlock(node);
      break;

    case ASSIGNMENT:
      output = compileAssignment(node);
      break;

    case APPLICATION:
      output = compileApplication(node);
      break;

    case IF:
      output = compileIf(node);
      break;

    case CLOSURE:
      output = compileClosure(node);
      break;

    case TIMES:
      output = compileTimes(node);
      break;

    case DOONCE:
      output = compileDoOnce(node);
      break;

    case BINARYOP:
      output = compileBinaryOp(node);
      break;

    case UNARYOP:
      output = compileUnaryOp(node);
      break;

    case NUM:
      output = node.value;
      break;

    case VARIABLE:
      output = compileVariable(node);
      break;

    case DEINDEX:
      output = compileDeIndex(node);
      break;

    case STRING:
      output = node.value;
      break;

    case LIST:
      output = _.map(node.values, v => {
        return compile(v);
      });
      break;

    case NULL:
      output = 'null';
      break;

    default:
      throw `Unknown AST Type: ${node.type}`;
  }

  return output;
}

function compileBlock(block) {
  return block.elements
    .map(compileNode)
    .map(str => `${str};\n`)
    .join('');
}

function compileAssignment(assignment) {
  return [
    'var',
    assignment.identifier,
    '=',
    compileNode(assignment.expression),
    ';'
  ].join(' ');
}

function compileApplication(application) {
  const args = application.args.map(compileNode);
  if (exists(application.block)) {
    const blockFunc = 'function () {\n' + compileBlock(application.block) + '}';
    args.push(blockFunc);
  }
  return [application.identifier, '(', args, ')'].join(' ');
}

function compileIf(ifStatement) {
  const predicate = ifStatement.predicate;
  const ifBlock = ifStatement.ifBlock;
  const elseBlock = ifStatement.elseBlock;

  const ifString = [
    'if (',
    compileNode(predicate),
    ') {',
    compileBlock(ifBlock),
    '}'
  ].join('\n');

  if (exists(elseBlock)) {
    return [ifString, 'else {', compileNode(elseBlock), '}\n'].join('\n');
  }
  return ifString;
}

function compileClosure(closure) {
  return [
    'function (',
    closure.argnames.join(', '),
    ') {\n',
    compileBlock(closure.body),
    '}'
  ].join('');
}

function compileTimes(times) {
  const numberExpr = compileNode(times.number);
  const loopVar = exists(times.loopVar) ? times.loopVar : 'i';
  return [
    `for (var ${loopVar} = 0; ${loopVar} < ${numberExpr}; ${loopVar} += 1) {\n`,
    compileBlock(times.block),
    '}\n'
  ].join('');
}

function compileDoOnce(doOnce) {
  return ['(function () {\n', compileBlock(doOnce), '})();\n'].join('');
}

function compileUnaryOp(operation) {
  return `${operation.operator}(${compileNode(operation.expr1)})`;
}

function compileBinaryOp(binaryOp) {
  var output;
  const val1 = compileNode(binaryOp.expr1);
  const val2 = compileNode(binaryOp.expr2);

  switch (binaryOp.operator) {
    case '^':
      output = `Math.pow(${val1}, ${val2})`;
      break;

    default:
      output = `${val1} ${binaryOp.operator} ${val2}`;
      break;
  }

  return output;
}

function compileVariable(variable) {
  return variable.identifier;
}

function compileDeIndex(deindex) {
  const col = compileNode(deindex.collection);
  const idx = compileNode(deindex.index);
  return `${col}[${idx}]`;
}
