/* global describe, it */

import parser from '../../src/grammar/lcl';
import {
  Assignment,
  Block,
  DeIndex,
  List,
  Num,
  Variable
} from '../../src/js/lcl/ast';

import { dedent } from 'dentist';

import assert from 'assert';

describe('List', function() {
  it('basic list literal works', function() {
    var program = dedent(`
                         a = [1, 3, 5]
                         `);
    var parsed = parser.parse(program, {
      functionNames: [],
      inlinableFunctions: []
    });

    var expected = Block([Assignment('a', List([Num(1), Num(3), Num(5)]))]);
    assert.deepEqual(parsed, expected);
  });

  it('can deindex a value from a list', function() {
    var program = dedent(`
                         a = [1, 3, 5]
                         b = a[0]
                         `);
    var parsed = parser.parse(program, {
      functionNames: [],
      inlinableFunctions: []
    });

    var expected = Block([
      Assignment('a', List([Num(1), Num(3), Num(5)])),
      Assignment('b', DeIndex(Variable('a'), Num(0)))
    ]);
    assert.deepEqual(parsed, expected);
  });
});
