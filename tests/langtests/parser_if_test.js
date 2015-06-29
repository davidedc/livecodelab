/* global exports, require */

'use strict';

var requirejs = require('requirejs');

requirejs.config({
    baseUrl: 'build/js',
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

    'simple if statement parses': function (test) {

        var program, ast, expected, processed;

        program = [
            "a = 3\n",
            "if a == 3",
            "\tbox"
        ].join('\n');
        processed = preproc.process(program);
        ast = parser.parse(processed);

        expected = [
            ['=', 'a', ['NUMBER', 3]],
            [[
                'IF',
                ['==', ['IDENTIFIER', 'a'], ['NUMBER', 3]],
                ['BLOCK', [['FUNCTIONCALL', 'box', []]]]
            ]]
        ];

        test.deepEqual(ast, expected);
        test.done();
    }

};

