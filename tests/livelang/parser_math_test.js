/* global describe, it */

var parser = require('../../src/grammar/lcl');
var ast = require('../../src/js/lcl/ast').Node;

var dedent = require('dentist').dedent;

var assert = require('assert');

describe('Math', function() {
  it('negative number', function() {
    var program = 'a = -3';
    var parsed = parser.parse(program);

    var expected = ast.Block([
      ast.Assignment('a', ast.UnaryOp('-', ast.Num(3)))
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('negative variable', function() {
    var program = dedent(`
                         a = 3
                         b = -a
                         `);
    var parsed = parser.parse(program);

    var expected = ast.Block([
      ast.Assignment('a', ast.Num(3)),
      ast.Assignment('b', ast.UnaryOp('-', ast.Variable('a')))
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('negative expression', function() {
    var program = 'a = -(3 + 4)';
    var parsed = parser.parse(program);

    var expected = ast.Block([
      ast.Assignment(
        'a',
        ast.UnaryOp('-', ast.BinaryOp('+', ast.Num(3), ast.Num(4)))
      )
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('parenthesised expressions', function() {
    var program = 'a = (3 + 4) + 4';
    var parsed = parser.parse(program);

    var expected = ast.Block([
      ast.Assignment(
        'a',
        ast.BinaryOp('+', ast.BinaryOp('+', ast.Num(3), ast.Num(4)), ast.Num(4))
      )
    ]);

    assert.deepEqual(parsed, expected);
  });
});
