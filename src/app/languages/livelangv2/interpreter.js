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

function createChildScope(parentScope) {
  return Object.create(parentScope);
}

export const internal = {};

export function run(programBlock, globalscope) {
  const state = {
    exitCode: 0,
    doOnceTriggered: false
  };

  if (programBlock.type !== BLOCK) {
    state.exitCode = 1;
    return state;
  }

  internal.evaluate(state, programBlock, globalscope);
  return state;
}

internal.evaluate = function(state, node, scope) {
  var output;

  switch (node.type) {
    case BLOCK:
      output = internal.evaluateBlock(state, node, scope);
      break;

    case ASSIGNMENT:
      output = internal.evaluateAssignment(state, node, scope);
      break;

    case APPLICATION:
      output = internal.evaluateApplication(state, node, scope);
      break;

    case IF:
      output = internal.evaluateIf(state, node, scope);
      break;

    case CLOSURE:
      output = internal.evaluateClosure(state, node, scope);
      break;

    case TIMES:
      output = internal.evaluateTimes(state, node, scope);
      break;

    case DOONCE:
      output = internal.evaluateDoOnce(state, node, scope);
      break;

    case BINARYOP:
      output = internal.evaluateBinaryOp(state, node, scope);
      break;

    case UNARYOP:
      output = internal.evaluateUnaryOp(state, node, scope);
      break;

    case NUM:
      output = node.value;
      break;

    case VARIABLE:
      output = internal.evaluateVariable(state, node, scope);
      break;

    case DEINDEX:
      output = internal.evaluateDeIndex(state, node, scope);
      break;

    case STRING:
      output = node.value;
      break;

    case LIST:
      output = _.map(node.values, v => {
        return internal.evaluate(state, v, scope);
      });
      break;

    default:
      throw `Unknown AST Type: ${node.type}`;
  }

  return output;
};

internal.evaluateBlock = function(state, block, scope) {
  var childScope = createChildScope(scope);
  var output = null;
  var i, el;
  for (i = 0; i < block.elements.length; i += 1) {
    el = block.elements[i];
    output = internal.evaluate(state, el, childScope);
  }

  return output;
};

internal.evaluateAssignment = function(state, assignment, scope) {
  var value = internal.evaluate(state, assignment.expression, scope);
  scope[assignment.identifier] = value;
  return value;
};

internal.evaluateApplication = function(state, application, scope) {
  var func, funcname, args, evaledargs, output, i, block;

  funcname = application.identifier;

  func = scope[funcname];
  if (!exists(func)) {
    throw 'Function not defined: ' + funcname;
  }

  evaledargs = [];

  args = application.args;

  for (i = 0; i < args.length; i += 1) {
    evaledargs.push(internal.evaluate(state, args[i], scope));
  }

  // if this function call has a block section then add it to the args
  block = application.block;
  if (exists(block)) {
    evaledargs.push(function() {
      internal.evaluateBlock(state, block, scope);
    });
  }

  // functions are wrapped in an object with a function type
  // to differentiate between builtins and closures
  // user defined functions will be wrapped in a list so we unwrap them then call them
  if (func.type === 'builtin') {
    // apply is a method of the JS function object. it takes a scope
    // and then a list of arguments
    // eg
    //
    // var foo = function (a, b) {
    //     return a + b;
    // }
    //
    // var bar = foo.apply(window, [2, 3]);
    //
    // bar will equal 5

    output = func.func.apply(scope, evaledargs);
  } else if (func.type === 'closure') {
    // Functions defined by the user are wrapped in a list, so we need
    // to unwrap them
    // Also we don't pass the scope in because everything is created
    // as a closure
    output = func.func(evaledargs);
  } else {
    throw 'Error interpreting function: ' + funcname;
  }

  return output;
};

internal.evaluateIf = function(state, ifStatement, scope) {
  var predicate, ifblock, elseblock;

  predicate = ifStatement.predicate;
  ifblock = ifStatement.ifBlock;
  elseblock = ifStatement.elseBlock;

  if (internal.evaluate(state, predicate, scope)) {
    internal.evaluateBlock(state, ifblock, scope);
  } else if (exists(elseblock)) {
    internal.evaluateIf(state, elseblock, scope);
  }
};

internal.evaluateClosure = function(state, closure, scope) {
  var argnames, body, func;
  argnames = closure.argNames;
  body = closure.body;

  func = function(argvalues) {
    var i, childScope, output;
    childScope = createChildScope(scope);
    for (i = 0; i < argnames.length; i += 1) {
      childScope[argnames[i]] = argvalues[i];
    }
    output = internal.evaluate(state, body, childScope);
    return output;
  };

  // Return the function wrapped in an object with the function
  // type set to be closure
  return {
    type: 'closure',
    func: func
  };
};

internal.evaluateTimes = function(state, times, scope) {
  var i;

  var loops = internal.evaluate(state, times.number, scope);
  var block = times.block;
  var loopVar = times.loopVar;
  var childScope = createChildScope(scope);

  for (i = 0; i < loops; i += 1) {
    childScope[loopVar] = i;

    internal.evaluate(state, block, childScope);
  }
};

internal.evaluateDoOnce = function(state, doOnce, scope) {
  if (doOnce.active) {
    state.doOnceTriggered = true;
    var output = internal.evaluate(state, doOnce.block, scope);
  } else {
    output = [];
  }
  return output;
};

internal.evaluateUnaryOp = function(state, operation, scope) {
  var output;
  var val1 = internal.evaluate(state, operation.expr1, scope);

  switch (operation.operator) {
    case '-':
      output = -1 * val1;
      break;

    case '!':
      output = !val1;
      break;

    default:
      throw 'Unknown Operator: ' + operation.operator;
  }

  return output;
};

internal.evaluateBinaryOp = function(state, binaryOp, scope) {
  var output;
  var val1 = internal.evaluate(state, binaryOp.expr1, scope);
  var val2 = internal.evaluate(state, binaryOp.expr2, scope);

  switch (binaryOp.operator) {
    case '+':
      output = val1 + val2;
      break;

    case '-':
      output = val1 - val2;
      break;

    case '*':
      output = val1 * val2;
      break;

    case '/':
      output = val1 / val2;
      break;

    case '^':
      output = Math.pow(val1, val2);
      break;

    case '%':
      output = val1 % val2;
      break;

    case '>':
      output = val1 > val2;
      break;

    case '<':
      output = val1 < val2;
      break;

    case '>=':
      output = val1 >= val2;
      break;

    case '<=':
      output = val1 <= val2;
      break;

    case '==':
      output = val1 === val2;
      break;

    case '&&':
      output = val1 && val2;
      break;

    case '||':
      output = val1 || val2;
      break;

    default:
      throw 'Unknown Operator: ' + binaryOp.operator;
  }

  return output;
};

internal.evaluateVariable = function(state, variable, scope) {
  var output = scope[variable.identifier];
  if (!exists(output)) {
    throw 'Undefined Variable: ' + variable.identifier;
  }
  return output;
};

internal.evaluateDeIndex = function(state, deindex, scope) {
  var collection = internal.evaluate(state, deindex.collection, scope);
  if (!_.isArray(collection)) {
    throw 'Must deindex lists';
  }
  var index = internal.evaluate(state, deindex.index, scope);
  if (!_.isNumber(index)) {
    throw 'Index must be a number';
  }
  var output = collection[index];
  return output;
};
