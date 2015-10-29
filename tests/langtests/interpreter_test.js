/* global exports, require */

var Interpreter = require('../../src/js/lcl/interpreter');
var parser      = require('../../src/generated/parser');

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

    'evaluate simple expression': function (test) {
        var i = Interpreter;
        var result = {};
        var scope = {
            result: function (v) {
                result.v = v;
            }
        };
        var program = parser.parse('result (3 + 4) * 2');
        i.run(program, scope);

        test.equal(result.v, 14, 'should return 14');
        test.done();
    },

    'evaluate expression with variable': function (test) {
        var i = Interpreter;
        var result = {};
        var scope = {
            result: function (v) {
                result.v = v;
            },
            foo: 4
        };
        var program = parser.parse('a = foo + 1\nresult (a + 4) * foo');
        i.run(program, scope);

        test.equal(result.v, 36, 'output should be 36');
        test.done();

    },

    'times loop': function (test) {
        var i = Interpreter;
        var output;
        var scope = {
            result: function (value) {
                output = value;
            }
        };

        var program = parser.parse('a = 0\n5 times with i\n\ta = a + i\n\tresult a\n');

        i.run(program, scope);

        test.equal(output, 4, 'output should be 4');
        test.done();

    },

    'function definition and usage': function (test) {
        var i = Interpreter;
        var output;
        var scope = {
            result: function (value) {
                output = value;
            }
        };

        var program = parser.parse('//the first function\na = (x) -> x * 2\n//another function\nb = (x, y) -> x + y\nresult a(1) + b(a(2), 3)');

        i.run(program, scope);

        test.equal(output, 9, 'output should be 9');
        test.done();

    }

};

