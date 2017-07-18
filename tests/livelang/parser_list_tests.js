/* global describe, it */

var parser = require('../../src/grammar/lcl');
var ast = require('../../src/js/lcl/ast').Node;

var dedent = require('dentist').dedent;

var assert = require('assert');

describe('List', function() {
  it('basic list literal works', function() {
    var program = dedent(`
                         a = [1, 3, 5]
                         `);
    var parsed = parser.parse(program, {
      functionNames: [],
      inlinableFunctions: []
    });

    var expected = ast.Block([
      ast.Assignment('a', ast.List([ast.Num(1), ast.Num(3), ast.Num(5)]))
    ]);
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

    var expected = ast.Block([
      ast.Assignment('a', ast.List([ast.Num(1), ast.Num(3), ast.Num(5)])),
      ast.Assignment('b', ast.DeIndex(ast.Variable('a'), ast.Num(0)))
    ]);
    assert.deepEqual(parsed, expected);
  });
});
