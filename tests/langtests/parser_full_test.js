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

    'basic function calls work': function (test) {

        var program = "\n\nbox\n";
        var processed = preproc.process(program);
        var parsed = parser.parse(processed);

        var expected = ast.Block([
            ast.Application('box', [])
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    },

    'primitive with args and block': function (test) {

        var program = "rotate 2, 3\n\tbox\n";
        var processed = preproc.process(program);
        var parsed = parser.parse(processed);

        var expected = ast.Block([
            ast.Application(
                'rotate',
                [ast.Num(2), ast.Num(3)],
                ast.Block([
                    ast.Application('box', [])
                ])
            )
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    },

    'inline calls': function (test) {

        var program = "rotate 2, 3 >> box\n";
        var processed = preproc.process(program);
        var parsed = parser.parse(processed);

        var expected = ast.Block([
            ast.Application(
                'rotate',
                [ast.Num(2), ast.Num(3)],
                ast.Block([
                    ast.Application('box', [])
                ])
            )
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    },

    'multiple inline calls': function (test) {

        var program = "rotate 2, 3 >> fill red >> box\n";
        var processed = preproc.process(program);
        var parsed = parser.parse(processed);

        var expected = ast.Block([
            ast.Application(
                'rotate',
                [ast.Num(2), ast.Num(3)],
                ast.Block([
                    ast.Application(
                        'fill',
                        [ast.Variable('red')],
                            ast.Block([
                                ast.Application('box', [])
                            ])
                    )
                ])
            )
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    },

    'multiple inline calls with no arrows': function (test) {

        var program = "rotate 2, 3 fill red box\n";
        var processed = preproc.process(program);
        var parsed = parser.parse(processed);

        var expected = ast.Block([
            ast.Application(
                'rotate',
                [ast.Num(2), ast.Num(3)],
                ast.Block([
                    ast.Application(
                        'fill',
                        [ast.Variable('red')],
                            ast.Block([
                                ast.Application('box', [])
                            ])
                    )
                ])
            )
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    }

};

