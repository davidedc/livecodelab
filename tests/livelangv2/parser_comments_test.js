/* global describe, it */

var parser = require('../../src/grammar/lcl');
var ast = require('../../src/js/lcl/ast').Node;

var dedent = require('dentist').dedent;

var assert = require('assert');

describe('Comments', function() {
  it('ignores single comments', function() {
    var program = '// this is a comment';
    var parsed = parser.parse(program, {});

    var expected = ast.Block([]);

    assert.deepEqual(parsed, expected);
  });

  it('comments are ignored', function() {
    var program = dedent(`

                         // this is a comment


                         // parser should ignore


                         box 4
                         `);
    var parsed = parser.parse(program, { functionNames: ['box'] });

    var expected = ast.Block([ast.Application('box', [ast.Num(4)], null)]);

    assert.deepEqual(parsed, expected);
  });

  it('comments after commands are ignored', function() {
    var program = dedent(`

                         box 4 // this is a comment

                         `);
    var parsed = parser.parse(program, { functionNames: ['box'] });

    var expected = ast.Block([ast.Application('box', [ast.Num(4)], null)]);

    assert.deepEqual(parsed, expected);
  });

  it('comments in the middle of commands are ignored', function() {
    var program = dedent(`

                         box 4
                         // this is a comment
                         peg 3

                         //and another

                         `);
    var parsed = parser.parse(program, { functionNames: ['box', 'peg'] });

    var expected = ast.Block([
      ast.Application('box', [ast.Num(4)], null),
      ast.Application('peg', [ast.Num(3)], null)
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('comments at the end of the program are ignored', function() {
    var program = dedent(`

                         box 4 // this is a comment

                         `);
    var parsed = parser.parse(program, { functionNames: ['box'] });

    var expected = ast.Block([ast.Application('box', [ast.Num(4)], null)]);

    assert.deepEqual(parsed, expected);
  });

  it('ignores indented comments', function() {
    var program = dedent(`

                         rotate
                         \t// this is a comment
                         \tpeg 3

                         //and another

                         `);
    var parsed = parser.parse(program, {
      functionNames: ['rotate', 'peg'],
      inlinableFunctions: ['rotate']
    });

    var expected = ast.Block([
      ast.Application(
        'rotate',
        [],
        ast.Block([ast.Application('peg', [ast.Num(3)], null)])
      )
    ]);

    assert.deepEqual(parsed, expected);
  });
});
