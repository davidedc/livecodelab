/* global exports, require */

var parser = require('../../src/js/lcl/parser');
var ast    = require('../../src/js/lcl/ast').Node;

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

