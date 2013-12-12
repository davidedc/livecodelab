/* global exports, require */

'use strict';

var requirejs = require('requirejs');

requirejs.config({
    baseUrl: 'lib',
    nodeRequire: require
});

var parser = requirejs('parser');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

parser.yy.parseError = function () {
    console.log(arguments);
};

exports.programdata = {

    'process function works': function (test) {

        var program, ast, expected;

        program = "a = 3 + 5";
        ast = parser.parse(program);

        expected = [
            ['=', 'a', ['+', 3, 5]]
        ];

        test.deepEqual(ast, expected);
        test.done();
    },

    'assignment assigns numbers': function (test) {

        var program, ast, expected;

        program = "number = 444";
        ast = parser.parse(program);

        expected = [
            ['=', 'number', 444]
        ];

        test.deepEqual(ast, expected);
        test.done();
    },

    'assignment assigns negative numbers': function (test) {

        var program, ast, expected;

        program = "number = -333";
        ast = parser.parse(program);

        expected = [
            ['=', 'number', -333]
        ];

        test.deepEqual(ast, expected);
        test.done();
    },

    'multiple assignments assigns bigger expression': function (test) {

        var program, ast, expected, numa, numb, numc;

        program = "numa = 55 + 44 * 2 - 321\n numb = numa * -33\n numc = numa + numb";
        ast = parser.parse(program);

        numa = ['=', 'numa', ['-', ['+', 55, ['*', 44, 2]], 321]];
        numb = ['=', 'numb', ['*', 'numa', -33]];
        numc = ['=', 'numc', ['+', 'numa', 'numb']];
        expected = [numa, [numb, [numc]]];

        test.deepEqual(ast, expected);
        test.done();
    },

    'brackets work correctly in expressions': function (test) {

        var program, ast, expected;

        program = "number = (456 + 33) * 2";
        ast = parser.parse(program);

        expected = [
            ['=', 'number', ['*', ['+', 456, 33], 2]]
        ];

        test.deepEqual(ast, expected);
        test.done();
    },


};

