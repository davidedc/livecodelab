/* global exports, require, console */

var parser  = require('../../src/js/lcl/parser');
var ast     = require('../../src/js/lcl/ast').Node;

exports.programdata = {

    'negative number': function (test) {

        var program = [
            "a = -3"
        ].join('\n');
        var processed = parser.preprocess(program);
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
        var processed = parser.preprocess(program);
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
        var processed = parser.preprocess(program);
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

