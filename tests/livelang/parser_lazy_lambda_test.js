/* global describe, it */

import parser from '../../src/grammar/lcl';
import {
  Application,
  Assignment,
  Block,
  Closure,
  Num
} from '../../src/js/lcl/ast';

import { dedent } from 'dentist';

import assert from 'assert';

describe('Lazy Lambda', function() {
  it('lazy closure is parsed', function() {
    var program = 'foo = <box 3, 4>';
    var parsed = parser.parse(program, {
      functionNames: ['box'],
      inlinableFunctions: ['box']
    });

    var expected = Block([
      Assignment(
        'foo',
        Closure([], Block([Application('box', [Num(3), Num(4)])]), true)
      )
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('lazy closure is created and used', function() {
    var program = dedent(`
                         foo = <box 3, 4>
                         rotate
                         \tfoo
                         `);
    var parsed = parser.parse(program, {
      functionNames: ['rotate', 'box'],
      inlinableFunctions: ['rotate', 'box']
    });

    var expected = Block([
      Assignment(
        'foo',
        Closure([], Block([Application('box', [Num(3), Num(4)])]), true)
      ),
      Application('rotate', [], Block([Application('foo', [])]))
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('lazy closure is inlinable', function() {
    var program = dedent(`
                         bigger = <scale 1.1>
                         rotate bigger box
                         `);
    var parsed = parser.parse(program, {
      functionNames: ['rotate', 'box', 'scale'],
      inlinableFunctions: ['rotate', 'box', 'scale']
    });

    var expected = Block([
      Assignment(
        'bigger',
        Closure([], Block([Application('scale', [Num(1.1)])]), true),
        true
      ),
      Application(
        'rotate',
        [],
        Block([Application('bigger', [], Block([Application('box', [])]))])
      )
    ]);

    assert.deepEqual(parsed, expected);
  });
});
