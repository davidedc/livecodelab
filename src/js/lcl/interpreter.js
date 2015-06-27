/*global define */

var helpers = require('./interpreter-funcs');

var Interpreter = {};
var internal = {};
Interpreter.internal = internal;

Interpreter.run = function (programBlock, globalscope) {

    var state = {
        exitCode: 0,
        doOnceTriggered: false
    };

    if (programBlock.ast !== 'BLOCK') {
        state.exitCode = 1;
        return state;
    }

    internal.evaluate(programBlock, globalscope);
    return state;
};

internal.evaluate = function (node, scope) {

    var output;

    switch (node.ast) {

    case 'BLOCK':
        output = internal.evaluateBlock(node, scope);
        break;

    case 'ASSIGNMENT':
        output = internal.evaluateAssignment(node, scope);
        break;

    case 'APPLICATION':
        output = internal.evaluateApplication(node, scope);
        break;

    case 'IF':
        output = internal.evaluateIf(node, scope);
        break;

    case 'CLOSURE':
        output = internal.evaluateClosure(node, scope);
        break;

    case 'TIMES':
        output = internal.evaluateTimes(node, scope);
        break;

    case 'DOONCE':
        output = internal.evaluateDoOnce(node, scope);
        break;

    case 'BINARYMATHOP':
        output = internal.evaluateBinaryMathOp(node, scope);
        break;

    case 'UNARYMATHOP':
        output = internal.evaluateUnaryMathOp(node, scope);
        break;

    case 'BINARYLOGICOP':
        output = internal.evaluateBinaryLogicOp(node, scope);
        break;

    case 'UNARYLOGICOP':
        output = internal.evaluateUnaryLogicOp(node, scope);
        break;

    case 'NUMBER':
        output = node.value;
        break;

    case 'VARIABLE':
        output = internal.evaluateVariable(node, scope);
        break;

    case 'STRING':
        output = node.value;
        break;

    default:
        throw 'Unknown Symbol: ' + node.ast;
    }

    return output;

};

internal.evaluateBlock = function (block, scope) {
    var childScope = helpers.createChildScope(scope);
    var output = null;
    var i, el;
    for (i = 0; i < block.elements.length; i += 1) {
        el = block.elements[i];
        output = internal.evaluate(el, childScope);
    }

    return output;
};

internal.evaluateAssignment = function(assignment, scope) {
    var value = internal.evaluate(assignment.expression, scope);
    scope[assignment.identifier] = value;
    return value;
};

internal.evaluateApplication = function (application, scope) {

    var func, barefunc, funcname, args, evaledargs, output, i, block;

    funcname = application.identifier;

    func = scope[funcname];
    if (func === undefined) {
        throw 'Function not defined: ' + funcname;
    }

    evaledargs = [];

    args = application.args;

    for (i = 0; i < args.length; i += 1) {
        evaledargs.push(internal.evaluate(args[i], scope));
    }

    // if this function call has a block section then add it to the args
    block = application.block;
    if (block !== undefined) {
        evaledargs.push(function () {
            internal.evaluateBlock(block, scope);
        });
    }

    // functions written in javascript will be normal functions added to the scope
    // user defined functions will be wrapped in a list so we unwrap them then call them
    if (typeof func === "function") {

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

        output = func.apply(scope, evaledargs);
    } else if (typeof func === "object") {
        // Functions defined by the user are wrapped in a list, so we need
        // to unwrap them
        // Also we don't pass the scope in because everything is created
        // as a closure
        barefunc = func[0];
        output = barefunc(evaledargs);
    } else {
        throw 'Error interpreting function: ' + funcname;
    }

    return output;
};

internal.evaluateIf = function (ifStatement, scope) {
    var predicate, ifblock, elseblock;

    predicate = ifStatement.predicate;
    ifblock = ifStatement.ifBlock;
    elseblock = ifStatement.elseBlock;

    if (internal.evaluate(predicate, scope)) {
        internal.evaluateBlock(ifblock, scope);
    } else if (elseblock !== undefined) {
        internal.evaluateBlock(elseblock, scope);
    }

};

internal.evaluateClosure = function (closure, scope) {
    var argnames, body, func;
    argnames = closure.argNames;
    body = closure.body;

    func = function (argvalues) {
        var i, childScope, output;
        childScope = helpers.createChildScope(scope);
        for (i = 0; i < argnames.length; i += 1) {
            childScope[argnames[i]] = argvalues[i];
        }
        output = internal.evaluate(body, childScope);
        return output;
    };

    // return a list containing the function so that when
    // we come to evaluate this we can tell the difference between
    // a user defined function and a normal javascript function
    return [func];
};

internal.evaluateTimes = function (times, scope) {
    var i, statements, childScope;

    var loops   = internal.evaluate(times.number, scope);
    var block   = times.block;
    var loopVar = times.loopVar;

    block = times.block;

    childScope = helpers.createChildScope(scope);

    for (i = 0; i < loops; i += 1) {

        childScope[loopVar] = i;

        internal.evaluate(block, childScope);
    }

};

internal.evaluateDoOnce = function (doOnce, scope) {
    var output = internal.evaluate(doOnce.block, scope);
    return output;
};

internal.evaluateUnaryMathOp = function(mathOp, scope) {
    var output;
    var val1 = internal.evaluate(mathOp.expr1, scope);

    switch(mathOp.operation) {

    case '-':
        output = -1 * val1;
        break;

    default:
        throw 'Unknown Symbol: ' + mathOp.operation;
    }

    return output;
};

internal.evaluateBinaryMathOp = function(mathOp, scope) {
    var output;
    var val1 = internal.evaluate(mathOp.expr1, scope);
    var val2 = internal.evaluate(mathOp.expr2, scope);

    switch(mathOp.operation) {

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

    default:
        throw 'Unknown Symbol: ' + mathOp.operation;
    }

    return output;
};

internal.evaluateUnaryLogicOp = function(logicOp, scope) {
    var output;
    var val1 = internal.evaluate(logicOp.expr1, scope);

    switch(logicOp.operation) {

    case '!':
        output = !val1;
        break;

    default:
        throw 'Unknown Symbol: ' + logicOp.operation;
    }

    return output;
};

internal.evaluateBinaryLogicOp = function(logicOp, scope) {
    var output;
    var val1 = internal.evaluate(logicOp.expr1, scope);
    var val2 = internal.evaluate(logicOp.expr2, scope);

    switch(logicOp.operation) {

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
        throw 'Unknown Symbol: ' + logicOp.operation;
    }

    return output;
};

internal.evaluateVariable = function (variable, scope) {
    var output = scope[variable.identifier];
    if (output === undefined) {
        throw 'Undefined Variable: ' + variable.identifier;
    }
    return output;
};



module.exports = Interpreter;

