/* global exports, require */

var parser  = require('../../src/js/lcl/parser');
var ast     = require('../../src/js/lcl/ast').Node;

exports.programdata = {

    'simple string assignment passes': function (test) {

        var program = [
            "a =\"string\"",
        ].join('\n');
        var processed = parser.preprocess(program);
        var parsed = parser.parse(processed);

        var expected = ast.Block([
            ast.Assignment('a', ast.Str('string'))
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    },

    'string with whitespace passes': function (test) {

        var program = [
            "a = \"string  sdf\tasdf\"",
        ].join('\n');
        var processed = parser.preprocess(program);
        var parsed = parser.parse(processed);

        var expected = ast.Block([
            ast.Assignment('a', ast.Str("string  sdf\tasdf"))
        ]);

        test.deepEqual(parsed, expected);
        test.done();
    }

};

