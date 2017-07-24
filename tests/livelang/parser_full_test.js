/* global describe, it */

var parser = require('../../src/grammar/lcl');
var ast = require('../../src/js/lcl/ast').Node;

var dedent = require('dentist').dedent;

var assert = require('assert');

describe('Parser', function() {
  it('always returns a block, even with an empty program', function() {
    var program = '';
    var parsed = parser.parse(program, {});

    var expected = ast.Block([]);

    assert.deepEqual(parsed, expected);
  });

  it('basic function calls work', function() {
    var program = dedent(`

                         box
                         `);
    var parsed = parser.parse(program, { functionNames: ['box'] });

    var expected = ast.Block([ast.Application('box', [], null)]);

    assert.deepEqual(parsed, expected);
  });

  it('primitive with args and block', function() {
    var program = dedent(`
                         rotate 2, 3
                         \tbox

                         `);
    var parsed = parser.parse(program, {
      functionNames: ['rotate', 'box'],
      inlinableFunctions: ['rotate', 'box']
    });

    var expected = ast.Block([
      ast.Application(
        'rotate',
        [ast.Num(2), ast.Num(3)],
        ast.Block([ast.Application('box', [], null)])
      )
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('inline calls', function() {
    var program = dedent(`
                         rotate 2, 3 >> box
                         `);
    var parsed = parser.parse(program, {
      functionNames: ['rotate', 'box'],
      inlinableFunctions: ['rotate', 'box']
    });

    var expected = ast.Block([
      ast.Application(
        'rotate',
        [ast.Num(2), ast.Num(3)],
        ast.Block([ast.Application('box', [], null)])
      )
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('multiple inline calls', function() {
    var program = dedent(`rotate 2, 3 >> fill red >> box
                         `);
    var parsed = parser.parse(program, {
      functionNames: ['rotate', 'fill', 'box'],
      inlinableFunctions: ['rotate', 'fill', 'box']
    });

    var expected = ast.Block([
      ast.Application(
        'rotate',
        [ast.Num(2), ast.Num(3)],
        ast.Block([
          ast.Application(
            'fill',
            [ast.Variable('red')],
            ast.Block([ast.Application('box', [], null)])
          )
        ])
      )
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('multiple inline calls with no arrows', function() {
    var program = dedent(`
                         rotate 2, 3 fill red box
                         `);
    var parsed = parser.parse(program, {
      functionNames: ['rotate', 'fill', 'box'],
      inlinableFunctions: ['rotate', 'fill', 'box']
    });

    var expected = ast.Block([
      ast.Application(
        'rotate',
        [ast.Num(2), ast.Num(3)],
        ast.Block([
          ast.Application(
            'fill',
            [ast.Variable('red')],
            ast.Block([ast.Application('box', [], null)])
          )
        ])
      )
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('more complex inline function calls', function() {
    var program = dedent(`
                         scale 2, wave 2 peg
                         \tscale 2, wave 2 ball
                         `);
    var parsed = parser.parse(program, {
      functionNames: ['scale', 'wave', 'peg', 'ball'],
      inlinableFunctions: ['scale', 'peg', 'ball']
    });

    var expected = ast.Block([
      ast.Application(
        'scale',
        [ast.Num(2), ast.Application('wave', [ast.Num(2)], null)],
        ast.Block([
          ast.Application(
            'peg',
            [],
            ast.Block([
              ast.Application(
                'scale',
                [ast.Num(2), ast.Application('wave', [ast.Num(2)], null)],
                ast.Block([ast.Application('ball', [], null)])
              )
            ])
          )
        ])
      )
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('more complicated times loop inlining', function() {
    var program = 'rotate wave + 2 times box';
    var parsed = parser.parse(program, {
      functionNames: ['rotate', 'wave', 'box'],
      inlinableFunctions: ['rotate', 'box']
    });

    var expected = ast.Block([
      ast.Application(
        'rotate',
        [],
        ast.Block([
          ast.Times(
            ast.BinaryOp('+', ast.Application('wave', [], null), ast.Num(2)),
            ast.Block([ast.Application('box', [], null)]),
            null
          )
        ])
      )
    ]);

    assert.deepEqual(parsed, expected);
  });
});
