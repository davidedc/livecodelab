/* global console */

var parser  = require('../../src/generated/parser');
var ast     = require('../../src/js/lcl/ast').Node;

exports.programdata = {

    'basic function calls work': function (test) {

        var program = '\n\nbox\n';
        var parsed = parser.parse(program);

        var expected = ast.Block([
            ast.Application('box', [], null)
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    },

    'primitive with args and block': function (test) {

        var program = 'rotate 2, 3\n\tbox\n';
        var parsed = parser.parse(program);

        var expected = ast.Block([
            ast.Application(
                'rotate',
                [ast.Num(2), ast.Num(3)],
                ast.Block([
                    ast.Application('box', [], null)
                ])
            )
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    },

    'inline calls': function (test) {

        var program = 'rotate 2, 3 >> box\n';
        var parsed = parser.parse(program);

        var expected = ast.Block([
            ast.Application(
                'rotate',
                [ast.Num(2), ast.Num(3)],
                ast.Block([
                    ast.Application('box', [], null)
                ])
            )
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    },

    'multiple inline calls': function (test) {

        var program = 'rotate 2, 3 >> fill red >> box\n';
        var parsed = parser.parse(program);

        var expected = ast.Block([
            ast.Application(
                'rotate',
                [ast.Num(2), ast.Num(3)],
                ast.Block([
                    ast.Application(
                        'fill',
                        [ast.Variable('red')],
                            ast.Block([
                                ast.Application('box', [], null)
                            ])
                    )
                ])
            )
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    },

    'multiple inline calls with no arrows': function (test) {

        var program = 'rotate 2, 3 fill red box\n';
        var parsed = parser.parse(program);

        var expected = ast.Block([
            ast.Application(
                'rotate',
                [ast.Num(2), ast.Num(3)],
                ast.Block([
                    ast.Application(
                        'fill',
                        [ast.Variable('red')],
                            ast.Block([
                                ast.Application('box', [], null)
                            ])
                    )
                ])
            )
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    }

};

