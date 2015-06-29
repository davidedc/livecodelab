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

parser.yy.parseError = function () {
    console.log(arguments);
};

exports.programdata = {

    'expression function is parsed': function (test) {

        var program, processed, ast, expected;

        program = "foo = function (a, b) -> a + b\n";
        processed = preproc.process(program);
        ast = parser.parse(processed);

        expected = [['=', 'foo',
                       ['FUNCTIONDEF',
                           ['a', ['b']],
                           ['+', ['IDENTIFIER', 'a'], ['IDENTIFIER', 'b'] ]
                       ]
                   ]];

        test.deepEqual(ast, expected);
        test.done();
    },

    'block function is parsed': function (test) {

        var program, processed, ast, expected;

        program = "bar = function (a, b) -> \n\t c = a + b\n\t box c, 3";
        processed = preproc.process(program);
        ast = parser.parse(processed);

        expected = [['=', 'bar',
                       ['FUNCTIONDEF',
                           ['a', ['b']],
                           ['BLOCK',
                               [['=', 'c', ['+', ['IDENTIFIER', 'a'], ['IDENTIFIER', 'b']]],
                                   [['FUNCTIONCALL', 'box', [['IDENTIFIER', 'c'], [['NUMBER', 3]]]]
                               ]
                           ]]
                       ]
                   ]];

        test.deepEqual(ast, expected);
        test.done();
    },

    'expression function is parsed then used': function (test) {

        var program, processed, ast, expected;

        program = "foo = function (a) -> a + 3\nbar = foo(1)";
        processed = preproc.process(program);
        ast = parser.parse(processed);

        expected = [['=', 'foo',
                       ['FUNCTIONDEF',
                           ['a'],
                           ['+', ['IDENTIFIER', 'a'], ['NUMBER', 3] ]
                       ]
                   ], [
                       ['=', 'bar', [
                           'FUNCTIONCALL', 'foo', [['NUMBER', 1]]
                       ]]
                   ]];

        test.deepEqual(ast, expected);
        test.done();
    },


};

