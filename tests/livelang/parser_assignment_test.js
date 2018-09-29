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

describe('Assignment', function() {
  it('process function works', function() {
    var program = 'a = 3 + 5';
    var parsed = parser.parse(program);

    var expected = Block([Assignment('a', BinaryOp('+', Num(3), Num(5)))]);

    assert.deepEqual(parsed, expected);
  });

  it('assignment assigns numbers', function() {
    var program = 'number = 444';
    var parsed = parser.parse(program);

    var expected = Block([Assignment('number', Num(444))]);

    assert.deepEqual(parsed, expected);
  });

  it('assignment assigns negative numbers', function() {
    var program = 'number = -333';
    var parsed = parser.parse(program);

    var expected = Block([Assignment('number', UnaryOp('-', Num(333)))]);

    assert.deepEqual(parsed, expected);
  });

  it('multiple assignments assigns bigger expression', function() {
    var program = dedent(`
                         numa = 55 + 44 * 2 - 321
                         numb = numa * -33
                         numc = numa + numb
                         `);
    var parsed = parser.parse(program);

    var numa = Assignment(
      'numa',
      BinaryOp(
        '-',
        BinaryOp('+', Num(55), BinaryOp('*', Num(44), Num(2))),
        Num(321)
      )
    );
    var numb = Assignment(
      'numb',
      BinaryOp('*', Variable('numa'), UnaryOp('-', Num(33)))
    );
    var numc = Assignment(
      'numc',
      BinaryOp('+', Variable('numa'), Variable('numb'))
    );

    var expected = Block([numa, numb, numc]);

    assert.deepEqual(parsed, expected);
  });

  it('brackets work correctly in expressions', function() {
    var program = 'number = (456 + 33) * 2';
    var parsed = parser.parse(program);

    var expected = Block([
      Assignment(
        'number',
        BinaryOp('*', BinaryOp('+', Num(456), Num(33)), Num(2))
      )
    ]);

    assert.deepEqual(parsed, expected);
  });
});
