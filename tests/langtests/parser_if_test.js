/* global exports, require */

var parser  = require('../../src/generated/parser');
var ast     = require('../../src/js/lcl/ast').Node;

exports.programdata = {

    'simple if statement parses': function (test) {

        var program = 'a = 3\n\nif (a == 3)\n\tbox';
        var parsed = parser.parse(program);

        var expected = ast.Block([
            ast.Assignment('a', ast.Num(3)),
            ast.If(
                ast.BinaryOp('==', ast.Variable('a'), ast.Num(3)),
                ast.Block([
                    ast.Application('box', [], null)
                ]),
                null
            )
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    },

    'if else statement parses': function (test) {

        var program = 'a = 3\nif (a == 3)\n\tbox\nelse\n\tpeg';
        var parsed = parser.parse(program);

        var expected = ast.Block([
            ast.Assignment('a', ast.Num(3)),
            ast.If(
                ast.BinaryOp('==', ast.Variable('a'), ast.Num(3)),
                ast.Block([
                    ast.Application('box', [], null)
                ]),
                ast.Block([
                    ast.Application('peg', [], null)
                ])
            )
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    }

};

