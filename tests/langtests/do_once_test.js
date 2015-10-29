/* global exports, require */

var parser  = require('../../src/generated/parser');
var ast     = require('../../src/js/lcl/ast').Node;

exports.programdata = {

    'simple doOnce expression works': function (test) {

        var program = 'doOnce box()';
        var parsed = parser.parse(program);

        var expected = ast.Block([
            ast.DoOnce(
                ast.Block([
                    ast.Application('box', [], null)
                ])
            )
        ]);
        test.deepEqual(parsed, expected);
        test.done();
    },

    'finished simple doOnce expression works': function (test) {

        var program = '✓doOnce box';
        var parsed = parser.parse(program);

        var expected = ast.Block([
            ast.DoOnce(
                ast.Block([])
            )
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    },

    'block doOnce expression works': function (test) {

        var program = 'doOnce\n\trotate\n\t\tbox 4';
        var parsed = parser.parse(program);

        var expected = ast.Block([
            ast.DoOnce(
                ast.Block([
                    ast.Application(
                        'rotate',
                        [],
                        ast.Block([
                            ast.Application('box', [ast.Num(4)], null)
                        ])
                    )
                ])
            )
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    },

    'finished block doOnce expression works': function (test) {

        var program = '✓doOnce\n\trotate\n\t\tbox 4';
        var parsed = parser.parse(program);

        var expected = ast.Block([
            ast.DoOnce(
                ast.Block([])
            )
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    }

};

