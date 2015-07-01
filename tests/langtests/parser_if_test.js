/* global exports, require */

'use strict';

var parser  = require('../../src/generated/parser').parser;
var preproc = require('../../src/js/lcl/preprocessor');
var ast     = require('../../src/js/lcl/ast').Node;

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

        var program = [
            "a = 3\n",
            "if a == 3",
            "\tbox"
        ].join('\n');
        var processed = preproc.process(program);
        var parsed = parser.parse(processed);

        var expected = ast.Block([
            ast.Assignment('a', ast.Num(3)),
            ast.If(
                ast.BinaryLogicOp('==', ast.Variable('a'), ast.Num(3)),
                ast.Block([
                    ast.Application('box', [])
                ])
            )
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    }

};

