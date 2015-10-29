/* global exports, require */

var parser  = require('../../src/generated/parser');
var ast     = require('../../src/js/lcl/ast').Node;

exports.programdata = {

    'simple doOnce block parses': function (test) {

        var program = 'doOnce\n\tbox 4\npeg 3, 4';
        var parsed = parser.parse(program);

        var expected = ast.Block([
            ast.DoOnce(
                ast.Block([
                    ast.Application(
                        'box',
                        [ast.Num(4)],
                        null
                    )
                ])
            ),
            ast.Application(
                'peg',
                [ast.Num(3), ast.Num(4)],
                null
            )
        ]);
        test.deepEqual(parsed, expected);
        test.done();
    },

    'nested blocks parses': function (test) {

        var program = 'doOnce\n\tdoOnce\n\t\trotate\n\t\t\tbox 4\n\tpeg 4\nball 2';
        var parsed = parser.parse(program);

        var expected = ast.Block([
            ast.DoOnce(
                ast.Block([
                    ast.DoOnce(
                        ast.Block([
                            ast.Application(
                                'rotate',
                                [],
                                ast.Block([
                                    ast.Application(
                                        'box',
                                        [ast.Num(4)],
                                        null
                                    )
                                ])
                            )
                        ])
                    ),
                    ast.Application(
                        'peg',
                        [ast.Num(4)],
                        null
                    )
                ])
            ),
            ast.Application(
                'ball',
                [ast.Num(2)],
                null
            )
        ]);
        test.deepEqual(parsed, expected);
        test.done();
    }

};

