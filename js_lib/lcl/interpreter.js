/*global define */

define([
    'lib/lcl/interpreter-funcs'
], function (
    helpers
) {

    'use strict';

    var Interpreter,
        interpreterState;

    Interpreter = {};
    interpreterState = {
        doOnceTriggered: false
    };

    Interpreter.run = function (ast, globalscope) {

        var scope = helpers.createChildScope(globalscope);

        interpreterState.doOnceTriggered = false;

        this.runAST(ast, scope);

        return {
            doOnceTriggered: interpreterState.doOnceTriggered
        };

    };

    Interpreter.runAST = function (ast, scope) {
        var branch, remainder;

        branch = ast[0];
        remainder = ast[1];

        this.evaluate(branch, scope);
        if (remainder !== undefined) {
            this.runAST(remainder, scope);
        }
    };

    Interpreter.evaluate = function (branch, scope) {

        var symbol, output;

        symbol = branch[0];

        switch (symbol) {

        case '=':
            // branch[1] = name
            // branch[2] = value
            scope[branch[1]] = this.evaluate(branch[2], scope);
            output = branch[2];
            break;

        case '+':
            output = this.evaluate(branch[1], scope) + this.evaluate(branch[2], scope);
            break;

        case '-':
            output = this.evaluate(branch[1], scope) - this.evaluate(branch[2], scope);
            break;

        case '*':
            output = this.evaluate(branch[1], scope) * this.evaluate(branch[2], scope);
            break;

        case '/':
            output = this.evaluate(branch[1], scope) / this.evaluate(branch[2], scope);
            break;

        case '^':
            output = Math.pow(this.evaluate(branch[1], scope), (this.evaluate(branch[2], scope)));
            break;

        case '%':
            output = this.evaluate(branch[1], scope) % this.evaluate(branch[2], scope);
            break;


        case '>':
            output = this.evaluate(branch[1], scope) > this.evaluate(branch[2], scope);
            break;

        case '<':
            output = this.evaluate(branch[1], scope) < this.evaluate(branch[2], scope);
            break;

        case '>=':
            output = this.evaluate(branch[1], scope) >= this.evaluate(branch[2], scope);
            break;

        case '<=':
            output = this.evaluate(branch[1], scope) <= this.evaluate(branch[2], scope);
            break;

        case '==':
            output = this.evaluate(branch[1], scope) === this.evaluate(branch[2], scope);
            break;

        case '&&':
            output = this.evaluate(branch[1], scope) && this.evaluate(branch[2], scope);
            break;

        case '||':
            output = this.evaluate(branch[1], scope) || this.evaluate(branch[2], scope);
            break;


        case 'IDENTIFIER':
            output = scope[branch[1]];
            if (output === undefined) {
                throw 'Undefined Variable: ' + branch[1];
            }
            break;

        case 'NUMBER':
            output = branch[1];
            break;

        case 'STRING':
            output = branch[1];
            break;


        case 'IF':
            output = this.evaluateIfBlock(branch, scope);
            break;

        case 'FUNCTIONCALL':
            output = this.evaluateFunctionCall(branch, scope);
            break;

        case 'FUNCTIONDEF':
            output = this.evaluateFunctionDefinition(branch, scope);
            break;

        case 'TIMES':
            output = this.evaluateTimesLoop(branch, scope);
            break;

        case 'BLOCK':
            output = this.evaluateBlock(branch, scope);
            break;

        case 'DOONCE':
            if (branch[1].length > 0) {
                interpreterState.doOnceTriggered = true;
                output = this.evaluate(branch[1], scope);
            } else {
                output = '';
            }
            break;

        default:
            throw 'Unknown Symbol: ' + symbol;
        }

        return output;

    };

    Interpreter.evaluateBlock = function (block, scope) {
        var childScope, statements;

        childScope = helpers.createChildScope(scope);

        statements = block[1];

        this.runAST(statements, childScope);

    };

    Interpreter.evaluateFunctionDefinition = function (branch, scope) {
        var argnames, block, func, self;
        argnames = helpers.functionargs(branch[1]);
        block = branch[2];

        self = this;

        func = function (funcscope, argvalues) {
            var i, childScope, output;

            childScope = helpers.createChildScope(funcscope);

            for (i = 0; i < argnames.length; i += 1) {
                childScope[argnames[i]] = argvalues[i];
            }

            output = self.evaluateBlock(block, childScope);

            return output;

        };

        // return a list containing the function so that when
        // we come to evaluate this we can tell the difference between
        // a user defined function and a normal javascript function
        return [func];

    };

    Interpreter.evaluateFunctionCall = function (branch, scope) {

        var func, barefunc, funcname, args, evaledargs, output, i, block, self;

        self = this;

        funcname = branch[1];

        func = scope[funcname];
        if (func === undefined) {
            throw 'Function not defined: ' + funcname;
        }

        evaledargs = [];

        args = helpers.functionargs(branch[2]);

        for (i = 0; i < args.length; i += 1) {
            evaledargs.push(this.evaluate(args[i], scope));
        }

        // if this function call has a block section then add it to the args
        block = branch[3];
        if (block !== undefined) {
            evaledargs.push(function () {
                self.evaluateBlock(block, scope);
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
            // functions defined by the user are wrapped in a list, so we need
            // to unwrap them
            barefunc = func[0];
            output = barefunc(scope, evaledargs);
        } else {
            throw 'Error interpreting function: ' + funcname;
        }

        return output;
    };

    Interpreter.evaluateTimesLoop = function (branch, scope) {
        var times, block, i, loopvar, statements, childScope;

        times   = this.evaluate(branch[1], scope);
        block   = branch[2];
        loopvar = branch[3];

        statements = block[1];

        childScope = helpers.createChildScope(scope);

        for (i = 0; i < times; i += 1) {

            childScope[loopvar] = i;

            this.runAST(statements, childScope);
        }

    };

    Interpreter.evaluateIfBlock = function (branch, scope) {
        var predicate, ifblock, elseblock;

        predicate = branch[1];
        ifblock = branch[2];
        elseblock = branch[3];

        if (this.evaluate(predicate, scope)) {
            this.evaluateBlock(ifblock, scope);
        } else if (elseblock !== undefined) {
            this.evaluateBlock(elseblock, scope);
        }

    };

    return Interpreter;

});

