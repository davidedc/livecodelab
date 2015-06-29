/* global exports, require */

'use strict';

var requirejs = require('requirejs');

requirejs.config({
    baseUrl: 'build/js',
    nodeRequire: require
});

var parser = requirejs('lib/lcl/parser');
var preproc = requirejs('lib/lcl/preprocessor');

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

parser.yy.parseError = function (error) {
    console.log(error);
};

exports.programdata = {

    'simple doOnce expression works': function (test) {

        var program, ast, expected, processed;

        program = "doOnce box";
        processed = preproc.process(program);
        ast = parser.parse(processed);

        expected = [
            ['DOONCE',
                ['FUNCTIONCALL', 'box', []]
            ]
        ];

        test.deepEqual(ast, expected);
        test.done();
    },

    'finished simple doOnce expression works': function (test) {

        var program, ast, expected, processed;

        program = "✓doOnce box";
        processed = preproc.process(program);
        ast = parser.parse(processed);

        expected = [
            ['DOONCE', []]
        ];

        test.deepEqual(ast, expected);
        test.done();
    },

    'block doOnce expression works': function (test) {

        var program, ast, expected, processed;

        program = "doOnce\n\trotate\n\t\tbox 4";
        processed = preproc.process(program);
        ast = parser.parse(processed);

        expected = [
            ['DOONCE', ['BLOCK',
                [
                    ['FUNCTIONCALL', 'rotate', [],
                        ['BLOCK', [
                            ['FUNCTIONCALL', 'box', [['NUMBER', 4]]]
                        ]]
                    ]
                ]
            ]]
        ];

        test.deepEqual(ast, expected);
        test.done();
    },

    'finished block doOnce expression works': function (test) {

        var program, ast, expected, processed;

        program = "✓doOnce\n\trotate\n\t\tbox 4";
        processed = preproc.process(program);
        ast = parser.parse(processed);

        expected = [
            ['DOONCE', []]
        ];

        test.deepEqual(ast, expected);
        test.done();
    }

};

