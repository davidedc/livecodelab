/* global exports, require, console */

'use strict';

var parser  = require('../../src/generated/parser').parser;
var preproc = require('../../src/js/lcl/preprocessor');
var ast     = require('../../src/js/lcl/ast').Node;

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

parser.yy.parseError = function () {
    console.log(arguments);
};

exports.programdata = {

    'negative number': function (test) {

        var program = [
            "a = -3"
        ].join('\n');
        var processed = preproc.process(program);
        var parsed = parser.parse(processed);

        var expected = ast.Block([
            ast.Assignment('a',
                ast.UnaryMathOp(
                    '-', ast.Num(3)
                )
            )
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    },

    'negative variable': function (test) {

        var program = [
            "a = 3",
            "b = -a"
        ].join('\n');
        var processed = preproc.process(program);
        var parsed = parser.parse(processed);

        var expected = ast.Block([
            ast.Assignment('a', ast.Num(3)),
            ast.Assignment('b',
                ast.UnaryMathOp(
                    '-', ast.Variable('a')
                )
            )
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    },

    'negative expression': function (test) {

        var program = [
            "a = -(3 + 4)"
        ].join('\n');
        var processed = preproc.process(program);
        var parsed = parser.parse(processed);

        var expected = ast.Block([
            ast.Assignment('a',
                ast.UnaryMathOp(
                    '-',
                    ast.BinaryMathOp(
                        '+',
                        ast.Num(3),
                        ast.Num(4)
                    )
                )
            )
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    },
};

