/* global exports, require */

var Interpreter = require('../../src/js/lcl/interpreter');
var parser      = require('../../src/js/lcl/parser');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.programdata = {

    'evaluate number': function (test) {
        var i = Interpreter;

        //test.equal(i.evaluate(123.5), 123.5, 'should return 123.5');
        test.done();
    },

    /*
    'evaluate variable': function (test) {
        var i, scope;
        i = Interpreter;

        scope = {
            foo: 56
        };

        test.equal(i.evaluate('foo', scope), 56, 'output should be 56');
        test.done();

    },

    'evaluate addition': function (test) {
        var i, expression;
        i = Interpreter;
        expression = ['+', 5, 3];

        test.equal(i.evaluate(expression, {}), 8, 'output should be 8');
        test.done();

    },

    'basic foreign function call': function (test) {
        var i, output, scope, program, ast, p;
        i = Interpreter;
        p = parser;

        scope = {
            result: function (value) {
                output = value;
            }
        };

        program = "a = 4\nb = 3\nresult(a + b)";
        ast = p.parse(program);

        i.run(ast, scope);

        test.equal(output, 7, 'output should be 7');
        test.done();

    },

    'times loop': function (test) {
        var i, output, scope, program, ast, p;
        i = Interpreter;
        p = parser;

        scope = {
            result: function (value) {
                output = value;
            }
        };

        program = "a = 0\n5 times {\n\ta = 5\n}\nresult a";
        ast = p.parse(program);

        i.run(ast, scope);

        test.equal(output, 0, 'output should be 0');
        test.done();

    }

    */

};

