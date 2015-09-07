/* global exports, require */

var parser  = require('../../src/js/lcl/parser');
var ast     = require('../../src/js/lcl/ast').Node;

exports.programdata = {

    'simple doOnce expression works': function (test) {

        var program = "doOnce box";
        var processed = parser.preprocess(program);
        var parsed = parser.parse(processed);

        var expected = ast.Block([
            ast.DoOnce(
                ast.Block([
                    ast.Application('box', [])
                ])
            )
        ]);
        test.deepEqual(parsed, expected);
        test.done();
    },

    'finished simple doOnce expression works': function (test) {

        var program = "✓doOnce box";
        var processed = parser.preprocess(program);
        var parsed = parser.parse(processed);

        var expected = ast.Block([
            ast.DoOnce(
                ast.Block([])
            )
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    },

    'block doOnce expression works': function (test) {

        var program = "doOnce\n\trotate\n\t\tbox 4";
        var processed = parser.preprocess(program);
        var parsed = parser.parse(processed);

        var expected = ast.Block([
            ast.DoOnce(
                ast.Block([
                    ast.Application(
                        'rotate',
                        [],
                        ast.Block([
                            ast.Application('box', [ast.Num(4)])
                        ])
                    )
                ])
            )
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    },

    'finished block doOnce expression works': function (test) {

        var program = "✓doOnce\n\trotate\n\t\tbox 4";
        var processed = parser.preprocess(program);
        var parsed = parser.parse(processed);

        var expected = ast.Block([
            ast.DoOnce(
                ast.Block([])
            )
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    }

};

