/* global exports, require, console */

var parser  = require('../../src/generated/parser');
var ast     = require('../../src/js/lcl/ast').Node;

exports.programdata = {

    'negative number': function (test) {

        var program = 'a = -3';
        var parsed = parser.parse(program);

        var expected = ast.Block([
            ast.Assignment('a',
                ast.UnaryOp(
                    '-', ast.Num(3)
                )
            )
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    },

    'negative variable': function (test) {

        var program = 'a = 3\nb = -a';
        var parsed = parser.parse(program);

        var expected = ast.Block([
            ast.Assignment('a', ast.Num(3)),
            ast.Assignment('b',
                ast.UnaryOp(
                    '-', ast.Variable('a')
                )
            )
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    },

    'negative expression': function (test) {

        var program = 'a = -(3 + 4)';
        var parsed = parser.parse(program);

        var expected = ast.Block([
            ast.Assignment('a',
                ast.UnaryOp(
                    '-',
                    ast.BinaryOp(
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

    'parenthesised expressions': function (test) {

        var program = 'a = (3 + 4) + 4';
        var parsed = parser.parse(program);

        var expected = ast.Block([
            ast.Assignment('a',
                ast.BinaryOp(
                    '+',
                    ast.BinaryOp(
                        '+',
                        ast.Num(3),
                        ast.Num(4)
                    ),
                    ast.Num(4)
                )
            )
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    }
};

