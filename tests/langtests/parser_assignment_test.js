/* global exports, require */

var parser = require('../../src/generated/parser');
var ast    = require('../../src/js/lcl/ast').Node;

var Block = ast.Block;
var Assignment = ast.Assignment;
var BinaryOp = ast.BinaryOp;
var UnaryOp = ast.UnaryOp;
var Num = ast.Num;
var Variable = ast.Variable;

exports.programdata = {

    'process function works': function (test) {

        var program = 'a = 3 + 5';
        var parsed = parser.parse(program);

        var expected = Block([
            Assignment(
                'a',
                BinaryOp(
                    '+', Num(3), Num(5)
                )
            )
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    },

    'assignment assigns numbers': function (test) {

        var program = 'number = 444';
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

        var program = 'number = -333';
        var parsed = parser.parse(program);

        var expected = Block([
            Assignment(
                'number',
                UnaryOp('-', Num(333))
            )
        ]);


        test.deepEqual(parsed, expected);
        test.done();
    },

    'multiple assignments assigns bigger expression': function (test) {

        var program = 'numa = 55 + 44 * 2 - 321\nnumb = numa * -33\nnumc = numa + numb';
        var parsed = parser.parse(program);

        var numa = Assignment('numa',
            BinaryOp('-',
                BinaryOp('+', Num(55),
                    BinaryOp('*', Num(44), Num(2))
                ),
                Num(321)
            )
        );
        var numb = Assignment('numb',
            BinaryOp('*', Variable('numa'), UnaryOp('-', Num(33)))
        );
        var numc = Assignment('numc',
            BinaryOp('+', Variable('numa'), Variable('numb'))
        );

        var expected = Block([
            numa, numb, numc
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    },

    'brackets work correctly in expressions': function (test) {

        var program = 'number = (456 + 33) * 2';
        var parsed = parser.parse(program);

        var expected = Block([
            Assignment('number',
                BinaryOp('*',
                    BinaryOp('+', Num(456), Num(33)),
                    Num(2)
                )
            )
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    }

};

