/* global exports, require */

var parser  = require('../../src/js/lcl/parser');
var ast     = require('../../src/js/lcl/ast').Node;

exports.programdata = {

    'simple if statement parses': function (test) {

        var program = [
            "a = 3\n",
            "if a == 3",
            "\tbox"
        ].join('\n');
        var processed = parser.preprocess(program);
        var parsed = parser.parse(processed);

        var expected = ast.Block([
            ast.Assignment('a', ast.Num(3)),
            ast.If(
                ast.BinaryLogicOp('==', ast.Variable('a'), ast.Num(3)),
                ast.Block([
                    ast.Application('box', [])
                ])
            )
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    },

    'if else statement parses': function (test) {

        var program = [
            "a = 3\n",
            "if a == 3",
            "\tbox",
            "else",
            "\tpeg"
        ].join('\n');
        var processed = parser.preprocess(program);
        var parsed = parser.parse(processed);

        var expected = ast.Block([
            ast.Assignment('a', ast.Num(3)),
            ast.If(
                ast.BinaryLogicOp('==', ast.Variable('a'), ast.Num(3)),
                ast.Block([
                    ast.Application('box', [])
                ]),
                ast.Block([
                    ast.Application('peg', [])
                ])
            )
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    }

};

