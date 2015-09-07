/* global exports, require */

var ProgramData = require('../../src/js/lcl/programdata');

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

