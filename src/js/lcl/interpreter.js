
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

    internal.evaluate(state, programBlock, globalscope);
    return state;
};

internal.evaluate = function (state, node, scope) {

    var output;

    switch (node.ast) {

    case 'BLOCK':
        output = internal.evaluateBlock(state, node, scope);
        break;

    case 'ASSIGNMENT':
        output = internal.evaluateAssignment(state, node, scope);
        break;

    case 'APPLICATION':
        output = internal.evaluateApplication(state, node, scope);
        break;

    case 'IF':
        output = internal.evaluateIf(state, node, scope);
        break;

    case 'CLOSURE':
        output = internal.evaluateClosure(state, node, scope);
        break;

    case 'TIMES':
        output = internal.evaluateTimes(state, node, scope);
        break;

    case 'DOONCE':
        output = internal.evaluateDoOnce(state, node, scope);
        break;

    case 'BINARYOP':
        output = internal.evaluateBinaryOp(state, node, scope);
        break;

    case 'UNARYOP':
        output = internal.evaluateUnaryOp(state, node, scope);
        break;

    case 'NUMBER':
        output = node.value;
        break;

    case 'VARIABLE':
        output = internal.evaluateVariable(state, node, scope);
        break;

    case 'STRING':
        output = node.value;
        break;

    default:
        throw 'Unknown Symbol: ' + node.ast;
    }

    return output;

};

internal.evaluateBlock = function (state, block, scope) {
    var childScope = helpers.createChildScope(scope);
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

internal.evaluateApplication = function (state, application, scope) {

    var func, barefunc, funcname, args, evaledargs, output, i, block;

    funcname = application.identifier;

    func = scope[funcname];
    if (!helpers.exists(func)) {
        throw 'Function not defined: ' + funcname;
    }

    evaledargs = [];

    args = application.args;

    for (i = 0; i < args.length; i += 1) {
        evaledargs.push(internal.evaluate(state, args[i], scope));
    }

    // if this function call has a block section then add it to the args
    block = application.block;
    if (helpers.exists(block)) {
        evaledargs.push(function () {
            internal.evaluateBlock(state, block, scope);
        });
    }

    // functions written in javascript will be normal functions added to the scope
    // user defined functions will be wrapped in a list so we unwrap them then call them
    if (typeof func === 'function') {

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
    } else if (typeof func === 'object') {
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

internal.evaluateIf = function (state, ifStatement, scope) {
    var predicate, ifblock, elseblock;

    predicate = ifStatement.predicate;
    ifblock = ifStatement.ifBlock;
    elseblock = ifStatement.elseBlock;

    if (internal.evaluate(state, predicate, scope)) {
        internal.evaluateBlock(state, ifblock, scope);
    } else if (helpers.exists(elseblock)) {
        internal.evaluateBlock(state, elseblock, scope);
    }

};

internal.evaluateClosure = function (state, closure, scope) {
    var argnames, body, func;
    argnames = closure.argNames;
    body = closure.body;

    func = function (argvalues) {
        var i, childScope, output;
        childScope = helpers.createChildScope(scope);
        for (i = 0; i < argnames.length; i += 1) {
            childScope[argnames[i]] = argvalues[i];
        }
        output = internal.evaluate(state, body, childScope);
        return output;
    };

    // return a list containing the function so that when
    // we come to evaluate this we can tell the difference between
    // a user defined function and a normal javascript function
    return [func];
};

internal.evaluateTimes = function (state, times, scope) {
    var i;

    var loops      = internal.evaluate(state, times.number, scope);
    var block      = times.block;
    var loopVar    = times.loopVar;
    var childScope = helpers.createChildScope(scope);

    for (i = 0; i < loops; i += 1) {

        childScope[loopVar] = i;

        internal.evaluate(state, block, childScope);
    }

};

internal.evaluateDoOnce = function (state, doOnce, scope) {
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

    switch(operation.operator) {

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

    switch(binaryOp.operator) {

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

internal.evaluateVariable = function (state, variable, scope) {
    var output = scope[variable.identifier];
    if (!helpers.exists(output)) {
        throw 'Undefined Variable: ' + variable.identifier;
    }
    return output;
};

module.exports = Interpreter;

