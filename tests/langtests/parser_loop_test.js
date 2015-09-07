/* global exports, require */

var parser  = require('../../src/js/lcl/parser');
var ast     = require('../../src/js/lcl/ast').Node;

exports.programdata = {

    'basic times loop works': function (test) {

        var program = "4 times\n\tbox(4)";
        var processed = parser.preprocess(program);
        var parsed = parser.parse(processed);

        var expected = ast.Block([
            ast.Times(
                ast.Num(4),
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

    'times loop with variable': function (test) {

        var program = "4 times with i\n\tbox(4)";
        var processed = parser.preprocess(program);
        var parsed = parser.parse(processed);

        var expected = ast.Block([
            ast.Times(
                ast.Num(4),
                ast.Block([
                    ast.Application(
                        'box',
                        [ast.Num(4)]
                    )
                ]),
                'i'
            )
        ]);
        test.deepEqual(parsed, expected);
        test.done();
    },

    'times loop with variable number and loopvar': function (test) {

        var program = "foo = 100\nfoo times with i\n\tbox(4)";
        var processed = parser.preprocess(program);
        var parsed = parser.parse(processed);

        var expected = ast.Block([
            ast.Assignment('foo', ast.Num(100)),
            ast.Times(
                ast.Variable('foo'),
                ast.Block([
                    ast.Application(
                        'box',
                        [ast.Num(4)]
                    )
                ]),
                'i'
            )
        ]);
        test.deepEqual(parsed, expected);
        test.done();
    }

};

