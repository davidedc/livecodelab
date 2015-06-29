/* global exports, require */

'use strict';

var requirejs = require('requirejs');

requirejs.config({
    baseUrl: 'build/js',
    nodeRequire: require
});

var parser  = requirejs('lib/lcl/parser');
var preproc = requirejs('lib/lcl/preprocessor');

parser.yy.parseError = function (message) {
    console.log(message);
};

exports.programdata = {

    'simple string assignment passes': function (test) {

        var program, ast, expected, processed;

        program = [
            "a = \"string\"",
        ].join('\n');
        processed = preproc.process(program);
        ast = parser.parse(processed);

        expected = [
            ['=', 'a', ["STRING", "string"]]
        ];

        test.deepEqual(ast, expected);
        test.done();
    },

    'string with whitespace passes': function (test) {

        var program, ast, expected, processed;

        program = [
            "a = \"string  sdf\tasdf\"",
        ].join('\n');
        processed = preproc.process(program);
        ast = parser.parse(processed);

        expected = [
            ['=', 'a', ["STRING", "string  sdf\tasdf"]]
        ];

        test.deepEqual(ast, expected);
        test.done();
    }

};

