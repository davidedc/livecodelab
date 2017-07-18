/* global describe, it */

import parser from '../../src/grammar/lcl';
import { Application, Block, Num } from '../../src/js/lcl/ast';

import { dedent } from 'dentist';

import assert from 'assert';

describe('Comments', function() {
  it('ignores single comments', function() {
    var program = '// this is a comment';
    var parsed = parser.parse(program, {});

    var expected = Block([]);

    assert.deepEqual(parsed, expected);
  });

  it('comments are ignored', function() {
    var program = dedent(`

                         // this is a comment


                         // parser should ignore


                         box 4
                         `);
    var parsed = parser.parse(program, { functionNames: ['box'] });

    var expected = Block([Application('box', [Num(4)])]);

    assert.deepEqual(parsed, expected);
  });

  it('comments after commands are ignored', function() {
    var program = dedent(`

                         box 4 // this is a comment

                         `);
    var parsed = parser.parse(program, { functionNames: ['box'] });

    var expected = Block([Application('box', [Num(4)])]);

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

    var expected = Block([
      Application('box', [Num(4)]),
      Application('peg', [Num(3)])
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('comments at the end of the program are ignored', function() {
    var program = dedent(`

                         box 4 // this is a comment

                         `);
    var parsed = parser.parse(program, { functionNames: ['box'] });

    var expected = Block([Application('box', [Num(4)])]);

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

    var expected = Block([
      Application('rotate', [], Block([Application('peg', [Num(3)])]))
    ]);

    assert.deepEqual(parsed, expected);
  });
});
