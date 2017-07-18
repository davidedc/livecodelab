/* global describe, it */

var parser = require('../../src/grammar/lcl');
var ast = require('../../src/js/lcl/ast').Node;

var dedent = require('dentist').dedent;

var assert = require('assert');

describe('Loop', function() {
  it('basic times loop works', function() {
    var program = dedent(`
                         4 times
                         \tbox(4)
                         `);
    var parsed = parser.parse(program, {
      functionNames: ['box'],
      inlinableFunctions: ['box']
    });

    var expected = ast.Block([
      ast.Times(
        ast.Num(4),
        ast.Block([ast.Application('box', [ast.Num(4)], null)]),
        null
      )
    ]);
    assert.deepEqual(parsed, expected);
  });

  it('times loop with variable', function() {
    var program = dedent(`
                         4 times with i
                         \tbox(4)
                         `);
    var parsed = parser.parse(program, {
      functionNames: ['box'],
      inlinableFunctions: ['box']
    });

    var expected = ast.Block([
      ast.Times(
        ast.Num(4),
        ast.Block([ast.Application('box', [ast.Num(4)], null)]),
        'i'
      )
    ]);
    assert.deepEqual(parsed, expected);
  });

  it('times loop with variable number and loopvar', function() {
    var program = dedent(`
                         foo = 100
                         foo times with i
                         \tbox(4)
                         `);
    var parsed = parser.parse(program, {
      functionNames: ['box'],
      inlinableFunctions: ['box']
    });

    var expected = ast.Block([
      ast.Assignment('foo', ast.Num(100)),
      ast.Times(
        ast.Variable('foo'),
        ast.Block([ast.Application('box', [ast.Num(4)], null)]),
        'i'
      )
    ]);
    assert.deepEqual(parsed, expected);
  });

  it('times loop can be inlined', function() {
    var program = dedent('4 times 3 times box');
    var parsed = parser.parse(program, {
      functionNames: ['box'],
      inlinableFunctions: ['box']
    });

    var expected = ast.Block([
      ast.Times(
        ast.Num(4),
        ast.Block([
          ast.Times(
            ast.Num(3),
            ast.Block([ast.Application('box', [], null)]),
            null
          )
        ]),
        null
      )
    ]);
    assert.deepEqual(parsed, expected);
  });
});
