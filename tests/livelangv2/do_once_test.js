/* global describe, it */

var parser = require('../../src/grammar/lcl');
var ast = require('../../src/js/lcl/ast').Node;

var dedent = require('dentist').dedent;

var assert = require('assert');

describe('Do Once', function() {
  it('should be parsed with an inline expression', function() {
    var program = 'doOnce box';
    var parsed = parser.parse(program, {
      functionNames: ['box'],
      inlinableFunctions: ['box']
    });

    var expected = ast.Block([
      ast.DoOnce(true, ast.Block([ast.Application('box', [], null)]))
    ]);
    assert.deepEqual(parsed, expected);
  });

  it('should be parsed when marked as run', function() {
    var program = '✓doOnce box';
    var parsed = parser.parse(program, {
      functionNames: ['box'],
      inlinableFunctions: ['box']
    });

    var expected = ast.Block([
      ast.DoOnce(false, ast.Block([ast.Application('box', [], null)]))
    ]);

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

    var expected = ast.Block([
      ast.DoOnce(
        true,
        ast.Block([
          ast.Application(
            'rotate',
            [],
            ast.Block([ast.Application('box', [ast.Num(4)], null)])
          )
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

    var expected = ast.Block([
      ast.DoOnce(
        false,
        ast.Block([
          ast.Application(
            'rotate',
            [],
            ast.Block([ast.Application('box', [ast.Num(4)], null)])
          )
        ])
      )
    ]);

    assert.deepEqual(parsed, expected);
  });
});
