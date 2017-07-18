/* global describe, it */

import parser from '../../src/grammar/lcl';
import { Application, Block, DoOnce, Num } from '../../src/js/lcl/ast';

import { dedent } from 'dentist';

import assert from 'assert';

describe('Block', function() {
  it('simple doOnce block parses', function() {
    var program = dedent(`
                         doOnce
                         \tbox 4
                         peg 3, 4
                         `);
    var parsed = parser.parse(program, { functionNames: ['peg', 'box'] });

    var expected = Block([
      DoOnce(true, Block([Application('box', [Num(4)])])),
      Application('peg', [Num(3), Num(4)])
    ]);
    assert.deepEqual(parsed, expected);
  });

  it('nested blocks parses', function() {
    var program = dedent(`
                         doOnce
                         \tdoOnce
                         \t\trotate
                         \t\t\tbox 4
                         \tpeg 4
                         ball 2
                         `);
    var parsed = parser.parse(program, {
      functionNames: ['rotate', 'ball', 'peg', 'box'],
      inlinableFunctions: ['rotate', 'ball', 'peg', 'box']
    });

    var expected = Block([
      DoOnce(
        true,
        Block([
          DoOnce(
            true,
            Block([
              Application('rotate', [], Block([Application('box', [Num(4)])]))
            ])
          ),
          Application('peg', [Num(4)])
        ])
      ),
      Application('ball', [Num(2)])
    ]);
    assert.deepEqual(parsed, expected);
  });
});
