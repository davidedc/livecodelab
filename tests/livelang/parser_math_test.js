/* global describe, it */

import parser from '../../src/grammar/lcl';
import {
  Assignment,
  BinaryOp,
  Block,
  Num,
  UnaryOp,
  Variable
} from '../../src/js/lcl/ast';

import { dedent } from 'dentist';

import assert from 'assert';

describe('Math', function() {
  it('negative number', function() {
    var program = 'a = -3';
    var parsed = parser.parse(program);

    var expected = Block([Assignment('a', UnaryOp('-', Num(3)))]);

    assert.deepEqual(parsed, expected);
  });

  it('negative variable', function() {
    var program = dedent(`
                         a = 3
                         b = -a
                         `);
    var parsed = parser.parse(program);

    var expected = Block([
      Assignment('a', Num(3)),
      Assignment('b', UnaryOp('-', Variable('a')))
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('negative expression', function() {
    var program = 'a = -(3 + 4)';
    var parsed = parser.parse(program);

    var expected = Block([
      Assignment('a', UnaryOp('-', BinaryOp('+', Num(3), Num(4))))
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('parenthesised expressions', function() {
    var program = 'a = (3 + 4) + 4';
    var parsed = parser.parse(program);

    var expected = Block([
      Assignment('a', BinaryOp('+', BinaryOp('+', Num(3), Num(4)), Num(4)))
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('parses a unary logic expression', function() {
    var program = 'a = !(3 == 4)';
    var parsed = parser.parse(program);

    var expected = Block([
      Assignment('a', UnaryOp('!', BinaryOp('==', Num(3), Num(4))))
    ]);

    assert.deepEqual(parsed, expected);
  });
});
