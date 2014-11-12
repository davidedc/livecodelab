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

    'basic times loop works': function (test) {

        var program, ast, expected, processed;

        program = "4 times\n\tbox(4)";
        processed = preproc.process(program);
        ast = parser.parse(processed);

        expected = [
            ['TIMES', ['NUMBER', 4],
                ['BLOCK', [
                    ['FUNCTIONCALL', 'box', [['NUMBER', 4]]]
                ]]]
        ];

        test.deepEqual(ast, expected);
        test.done();
    },

    'times loop with variable': function (test) {

        var program, ast, expected, processed;

        program = "4 times with i\n\tbox(4)";
        processed = preproc.process(program);
        ast = parser.parse(processed);

        expected = [
            ['TIMES', ['NUMBER', 4],
                ['BLOCK', [
                    ['FUNCTIONCALL', 'box', [['NUMBER', 4]]]
                ]], 'i']
        ];

        test.deepEqual(ast, expected);
        test.done();
    },

    'times loop with variable number and loopvar': function (test) {

        var program, ast, expected, processed;

        program = "foo = 100\nfoo times with i\n\tbox(4)";
        processed = preproc.process(program);
        ast = parser.parse(processed);

        expected = [
            ['=', 'foo', ['NUMBER', 100]], [
                ['TIMES', ['IDENTIFIER', 'foo'],
                    ['BLOCK', [
                        ['FUNCTIONCALL', 'box', [['NUMBER', 4]]]
                    ]],
                    'i']
            ]
        ];

        test.deepEqual(ast, expected);
        test.done();
    }

};

