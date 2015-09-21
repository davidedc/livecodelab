/* global exports, require */

var parser  = require('../../src/js/lcl/parser');
var ast     = require('../../src/js/lcl/ast').Node;

exports.programdata = {

    'simple doOnce block parses': function (test) {

        var program = "doOnce\n\tbox 4";
        var processed = parser.preprocess(program);
        var parsed = parser.parse(processed);

        var expected = ast.Block([
            ast.DoOnce(
                ast.Block([
                    ast.Application(
                        'box',
                        [ast.Num(4)]
                    )
                ])
            )
        ]);
        test.deepEqual(parsed, expected);
        test.done();
    },

    'nested blocks parses': function (test) {

        var program = "doOnce\n\tdoOnce\n\t\tbox 4";
        var processed = parser.preprocess(program);
        var parsed = parser.parse(processed);

        var expected = ast.Block([
            ast.DoOnce(
                ast.Block([
                    ast.DoOnce(
                        ast.Block([
                            ast.Application(
                                'box',
                                [ast.Num(4)]
                            )
                        ])
                    )
                ])
            )
        ]);
        test.deepEqual(parsed, expected);
        test.done();
    }

};

