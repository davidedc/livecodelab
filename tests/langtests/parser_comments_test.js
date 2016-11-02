var parser = require('../../src/generated/parser');
var ast    = require('../../src/js/lcl/ast').Node;

var dedent = require('dentist').dedent;

exports.programdata = {

  'comments are ignored': function (test) {

    var program = dedent(`

                         // this is a comment


                         // parser should ignore


                         box 4
                         `);
    var parsed = parser.parse(program, {functionNames: ['box']});

    var expected = ast.Block([
      ast.Application('box', [ast.Num(4)], null)
    ]);

    test.deepEqual(parsed, expected);
    test.done();
  },

  'comments after commands are ignored': function (test) {

    var program = dedent(`

                         box 4 // this is a comment

                         `);
    var parsed = parser.parse(program, {functionNames: ['box']});

    var expected = ast.Block([
      ast.Application('box', [ast.Num(4)], null)
    ]);

    test.deepEqual(parsed, expected);
    test.done();
  },

  'comments in the middle of commands are ignored': function (test) {

    var program = dedent(`

                         box 4
                         // this is a comment
                         peg 3

                         //and another

                         `);
    var parsed = parser.parse(program, {functionNames: ['box', 'peg']});

    var expected = ast.Block([
      ast.Application('box', [ast.Num(4)], null),
      ast.Application('peg', [ast.Num(3)], null)
    ]);

    test.deepEqual(parsed, expected);
    test.done();
  },

  'comments at the end of the program are ignored': function (test) {

    var program = dedent(`

                         box 4 // this is a comment

                         `);
    var parsed = parser.parse(program, {functionNames: ['box']});

    var expected = ast.Block([
      ast.Application('box', [ast.Num(4)], null)
    ]);

    test.deepEqual(parsed, expected);
    test.done();
  }

};
