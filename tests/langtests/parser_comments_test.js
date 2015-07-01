/* global exports, require */

'use strict';

var parser = require('../../src/generated/parser').parser;
var ast    = require('../../src/js/lcl/ast').Node;

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

    'comments are ignored': function (test) {

        var program = '\n\n// this is a comment \n\n\n// parser should ignore\n\n\nbox 4';
        var parsed = parser.parse(program);

        var expected = ast.Block([
            ast.Application('box', [ast.Num(4)])
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    },

    'comments after commands are ignored': function (test) {

        var program = '\n\nbox 4 // this is a comment \n';
        var parsed = parser.parse(program);

        var expected = ast.Block([
            ast.Application('box', [ast.Num(4)])
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    },

    'comments at the end of the program are ignored': function (test) {

        var program = '\n\nbox 4 // this is a comment';
        var parsed = parser.parse(program);

        var expected = ast.Block([
            ast.Application('box', [ast.Num(4)])
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    }

};

