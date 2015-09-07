/* global exports, require */

var parser = require('../../src/js/lcl/parser');
var ast    = require('../../src/js/lcl/ast').Node;

var Block = ast.Block;
var Assignment = ast.Assignment;
var BinaryMathOp = ast.BinaryMathOp;
var UnaryMathOp = ast.UnaryMathOp;
var Num = ast.Num;
var Variable = ast.Variable;

exports.programdata = {

    'process function works': function (test) {

        var program = "a = 3 + 5";
        var parsed = parser.parse(program);

        var expected = Block([
            Assignment(
                'a',
                BinaryMathOp(
                    '+', Num(3), Num(5)
                )
            )
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    },

    'assignment assigns numbers': function (test) {

        var program = "number = 444";
        var parsed = parser.parse(program);

        var expected = Block([
            Assignment(
                'number',
                Num(444)
            )
        ]);


        test.deepEqual(parsed, expected);
        test.done();
    },

    'assignment assigns negative numbers': function (test) {

        var program = "number = -333";
        var parsed = parser.parse(program);

        var expected = Block([
            Assignment(
                'number',
                UnaryMathOp('-', Num(333))
            )
        ]);


        test.deepEqual(parsed, expected);
        test.done();
    },

    'multiple assignments assigns bigger expression': function (test) {

        var program = "numa = 55 + 44 * 2 - 321\n numb = numa * -33\n numc = numa + numb";
        var parsed = parser.parse(program);

        var numa = Assignment('numa',
            BinaryMathOp('-',
                BinaryMathOp('+', Num(55),
                    BinaryMathOp('*', Num(44), Num(2))
                ),
                Num(321)
            )
        );
        var numb = Assignment('numb',
            BinaryMathOp('*', Variable('numa'), UnaryMathOp('-', Num(33)))
        );
        var numc = Assignment('numc',
            BinaryMathOp('+', Variable('numa'), Variable('numb'))
        );

        var expected = Block([
            numa, numb, numc
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    },

    'brackets work correctly in expressions': function (test) {

        var program = "number = (456 + 33) * 2";
        var parsed = parser.parse(program);

        var expected = Block([
            Assignment('number',
                BinaryMathOp('*',
                    BinaryMathOp('+', Num(456), Num(33)),
                    Num(2)
                )
            )
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    },


};

