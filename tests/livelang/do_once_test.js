/* global describe, it */

import parser from '../../src/grammar/lcl';
import { Application, Block, DoOnce, Num } from '../../src/js/lcl/ast';

import { dedent } from 'dentist';

import assert from 'assert';

describe('Do Once', function() {
  it('should be parsed with an inline expression', function() {
    var program = 'doOnce box';
    var parsed = parser.parse(program, {
      functionNames: ['box'],
      inlinableFunctions: ['box']
    });

    var expected = Block([DoOnce(true, Block([Application('box', [])]))]);
    assert.deepEqual(parsed, expected);
  });

  it('should be parsed when marked as run', function() {
    var program = '✓doOnce box';
    var parsed = parser.parse(program, {
      functionNames: ['box'],
      inlinableFunctions: ['box']
    });

    var expected = Block([DoOnce(false, Block([Application('box', [])]))]);

    assert.deepEqual(parsed, expected);
  });

  it('should be parsed with a block expression', function() {
    var program = dedent(`
                         doOnce
                         \trotate
                         \t\tbox 4
                         `);
    var parsed = parser.parse(program, {
      functionNames: ['rotate', 'box'],
      inlinableFunctions: ['rotate', 'box']
    });

    var expected = Block([
      DoOnce(
        true,
        Block([
          Application('rotate', [], Block([Application('box', [Num(4)])]))
        ])
      )
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('should be parsed with a block expression when finished', function() {
    var program = dedent(`
                         ✓doOnce
                         \trotate
                         \t\tbox 4
                         `);
    var parsed = parser.parse(program, {
      functionNames: ['rotate', 'box'],
      inlinableFunctions: ['rotate', 'box']
    });

    var expected = Block([
      DoOnce(
        false,
        Block([
          Application('rotate', [], Block([Application('box', [Num(4)])]))
        ])
      )
    ]);

    assert.deepEqual(parsed, expected);
  });
});
