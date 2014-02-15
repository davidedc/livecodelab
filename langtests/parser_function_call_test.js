/* global exports, require */

'use strict';

var requirejs = require('requirejs');

requirejs.config({
    baseUrl: 'dist/js',
    nodeRequire: require
});

var parser  = requirejs('lib/lcl/parser');
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

parser.yy.parseError = function () {
    console.log(arguments);
};

exports.programdata = {

    'basic function calls work': function (test) {

        var program, ast, expected;

        program = "box";
        ast = parser.parse(program);

        expected = [
            ['FUNCTIONCALL', 'box', []]
        ];

        test.deepEqual(ast, expected);
        test.done();
    },

    'primitive with args and block': function (test) {

        var program, ast, expected, processed;

        program = "rotate 2, 3\n\tbox";
        processed = preproc.process(program);
        ast = parser.parse(processed);

        expected = [
            ['FUNCTIONCALL', 'rotate', [2, [3]],
                ['BLOCK', [
                    ['FUNCTIONCALL', 'box', []]
                ]]
                ]
        ];

        test.deepEqual(ast, expected);
        test.done();
    }

};

