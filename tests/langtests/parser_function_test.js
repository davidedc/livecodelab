/* global exports, require */

var parser  = require('../../src/js/lcl/parser');
var ast     = require('../../src/js/lcl/ast').Node;

exports.programdata = {

    'expression function is parsed': function (test) {

        var program = "foo = (a, b) -> a + b\n";
        var processed = parser.preprocess(program);
        var parsed = parser.parse(processed);

        var expected = ast.Block([
            ast.Assignment(
                'foo',
                ast.Closure(
                    ['a', 'b'],
                    ast.BinaryMathOp(
                        '+', 
                        ast.Variable('a'),
                        ast.Variable('b')
                    )
                )
            )
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    },

    'block function is parsed': function (test) {

        var program = "bar = (a, b) -> \n\t c = a + b\n\t box c, 3";
        var processed = parser.preprocess(program);
        var parsed = parser.parse(processed);

        var expected = ast.Block([
            ast.Assignment(
                'bar',
                ast.Closure(
                    ['a', 'b'],
                    ast.Block([
                        ast.Assignment(
                            'c',
                            ast.BinaryMathOp(
                                '+', 
                                ast.Variable('a'),
                                ast.Variable('b')
                            )
                        ),
                        ast.Application(
                            'box',
                            [ast.Variable('c'), ast.Num(3)]
                        )
                    ])
                )
            )
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    },

    'expression function is parsed then used': function (test) {

        var program = "foo = (a) -> a + 3\nbar = foo(1)";
        var processed = parser.preprocess(program);
        var parsed = parser.parse(processed);

        var expected = ast.Block([
            ast.Assignment(
                'foo',
                ast.Closure(
                    ['a'],
                    ast.BinaryMathOp(
                        '+', 
                        ast.Variable('a'),
                        ast.Num(3)
                    )
                )
            ),
            ast.Assignment(
                'bar',
                ast.Application('foo', [ast.Num(1)])
            )
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    },


};

