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

parser.yy.parseError = function (error) {
    console.log(error);
};

exports.programdata = {

    'simple doOnce expression works': function (test) {

        var program = "doOnce box";
        var processed = preproc.process(program);
        var parsed = parser.parse(processed);

        var expected = ast.Block([
            ast.DoOnce(
                ast.Block([
                    ast.Application('box', [])
                ])
            )
        ]);
        test.deepEqual(parsed, expected);
        test.done();
    },

    'finished simple doOnce expression works': function (test) {

        var program = "✓doOnce box";
        var processed = preproc.process(program);
        var parsed = parser.parse(processed);

        var expected = ast.Block([
            ast.DoOnce(
                ast.Block([])
            )
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    },

    'block doOnce expression works': function (test) {

        var program = "doOnce\n\trotate\n\t\tbox 4";
        var processed = preproc.process(program);
        var parsed = parser.parse(processed);

        var expected = ast.Block([
            ast.DoOnce(
                ast.Block([
                    ast.Application(
                        'rotate',
                        [],
                        ast.Block([
                            ast.Application('box', [ast.Num(4)])
                        ])
                    )
                ])
            )
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    },

    'finished block doOnce expression works': function (test) {

        var program = "✓doOnce\n\trotate\n\t\tbox 4";
        var processed = preproc.process(program);
        var parsed = parser.parse(processed);

        var expected = ast.Block([
            ast.DoOnce(
                ast.Block([])
            )
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    }

};

