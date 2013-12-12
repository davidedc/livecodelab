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

    'basic times loop works': function (test) {

        var program, ast, expected;

        program = "4 times ->\n{\nbox(4)\n}";
        ast = parser.parse(program);

        expected = [
            ['TIMES', 4,
                ['BLOCK', [
                    ['FUNCTIONCALL', 'box', [4]]
                ]]]
            ];

        test.deepEqual(ast, expected);
        test.done();
    }

};

