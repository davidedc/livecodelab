/*global define */

define([
    'lib/lcl/interpreter-funcs'
], function (
    helpers
) {

    'use strict';

    var Interpreter = {
    };

    Interpreter.run = function (ast, globalscope) {

        var scope = helpers.createChildScope(globalscope);

        this.runAST(ast, scope);

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

    Interpreter.evaluate = function (expression, scope) {

        var output;

        switch (typeof expression) {

        case 'object':
            output = this.evaluateBranch(expression, scope);
            break;

        case 'string':
            output = scope[expression];
            if (output === undefined) {
                throw 'Undefined Variable';
            }
            break;

        case 'number':
            output = expression;
            break;

        default:
            throw 'Unknown AST type';
        }

        return output;

    };

    Interpreter.evaluateBranch = function (branch, scope) {

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



        case 'IF':
            output = this.evaluateFunctionCall(branch, scope);
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

        case 'FFI':
            output = this.evaluateFFIFunctionCall(branch[1], scope);
            break;

        default:
            throw 'Unknown Symbol';
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
        var name, argnames, block, func, self;
        name = branch[1];
        argnames = branch[2];
        block = branch[3];

        self = this;

        func = function (funcscope, argvalues) {
            var i, childScope, output;

            childScope = helpers.createChildScope(funcscope);

            for (i = 0; i < argnames.length; i += 1) {
                childScope[argnames[i]] = argvalues[i];
            }

            output = self.evaluate(block, childScope);

            return output;

        };

        scope[name] = func;

    };

    /* FFI functions are any functions written in javascript */
    Interpreter.evaluateFFIFunctionCall = function (branch, scope) {

        var func, funcname, args, evaledargs, output, i;

        funcname = branch[1];

        func = scope[funcname];
        if (func === undefined) {
            throw 'Function not defined';
        }

        evaledargs = [];

        args = helpers.functionargs(branch[2]);

        for (i = 0; i < args.length; i += 1) {
            evaledargs.push(this.evaluate(args[i], scope));
        }


        output = scope[funcname].apply(scope, evaledargs);

        return output;
    };

    Interpreter.evaluateFunctionCall = function (branch, scope) {

        var func, funcname, args, evaledargs, output, i;

        funcname = branch[1];

        func = scope[funcname];
        if (func === undefined) {
            throw 'Function not defined';
        }

        evaledargs = [];

        args = helpers.functionargs(branch[2]);

        for (i = 0; i < args.length; i += 1) {
            evaledargs.push(this.evaluate(args[i], scope));
        }


        output = scope[funcname](scope, evaledargs);

        return output;
    };

    Interpreter.evaluateTimesLoop = function (branch, scope) {
        var times, block, i;

        times = branch[1];
        block = branch[2];

        for (i = 0; i < times; i += 1) {
            this.evaluateBlock(block, scope);
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

