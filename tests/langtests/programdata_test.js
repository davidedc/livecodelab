/* global exports, require */

'use strict';

var ProgramData = require('../../src/js/lcl/programdata');

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

exports.programdata = {

    'creation': function (test) {
        var p = new ProgramData("program data");

        test.ok(p, 'should be created');
        test.done();
    },

    'peek': function (test) {
        var p = new ProgramData("program data");

        test.equal(p.peek(), 'p', 'should return p');
        test.equal(p.peek(), 'p', 'should still return p');
        test.done();
    },

    'pop': function (test) {
        var p = new ProgramData("program data");

        test.equal(p.pop(), 'p', 'should return p');
        test.equal(p.pop(), 'r', 'should return r');
        test.done();
    },

    'unpop': function (test) {
        var p = new ProgramData("program data");

        test.equal(p.pop(), 'p', 'should return p');
        test.equal(p.pop(), 'r', 'should return r');
        p.unpop();
        p.unpop();
        test.equal(p.pop(), 'p', 'should return p');
        test.done();
    },

    'end data': function (test) {
        var p = new ProgramData("pr");

        test.equal(p.pop(), 'p', 'should return p');
        test.equal(p.pop(), 'r', 'should return r');
        test.equal(p.pop(), null, 'should return r');
        test.equal(p.peek(), null, 'should return r');
        test.equal(p.pop(), null, 'should return r');
        test.done();
    }

};

