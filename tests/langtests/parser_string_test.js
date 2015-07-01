/* global exports, require */

'use strict';

var parser  = require('../../src/generated/parser').parser;
var preproc = require('../../src/js/lcl/preprocessor');
var ast     = require('../../src/js/lcl/ast').Node;

parser.yy.parseError = function (message) {
    console.log(message);
};

exports.programdata = {

    'simple string assignment passes': function (test) {

        var program, parsed, expected, processed;

        program = [
            "a = \"string\"",
        ].join('\n');
        processed = preproc.process(program);
        parsed = parser.parse(processed);

        expected = ast.Block([
            ast.Assignment('a', ast.Str('string'))
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    },

    'string with whitespace passes': function (test) {

        var program, parsed, expected, processed;

        program = [
            "a = \"string  sdf\tasdf\"",
        ].join('\n');
        processed = preproc.process(program);
        parsed = parser.parse(processed);

        expected = ast.Block([
            ast.Assignment('a', ast.Str("string  sdf\tasdf"))
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    }

};

