/* global describe, it */

var parser = require('../../src/grammar/lcl');
var ast = require('../../src/js/lcl/ast').Node;

var dedent = require('dentist').dedent;

var assert = require('assert');

describe('Block', function() {
  it('simple doOnce block parses', function() {
    var program = dedent(`
                         doOnce
                         \tbox 4
                         peg 3, 4
                         `);
    var parsed = parser.parse(program, { functionNames: ['peg', 'box'] });

    var expected = ast.Block([
      ast.DoOnce(true, ast.Block([ast.Application('box', [ast.Num(4)], null)])),
      ast.Application('peg', [ast.Num(3), ast.Num(4)], null)
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

    var expected = ast.Block([
      ast.DoOnce(
        true,
        ast.Block([
          ast.DoOnce(
            true,
            ast.Block([
              ast.Application(
                'rotate',
                [],
                ast.Block([ast.Application('box', [ast.Num(4)], null)])
              )
            ])
          ),
          ast.Application('peg', [ast.Num(4)], null)
        ])
      ),
      ast.Application('ball', [ast.Num(2)], null)
    ]);
    assert.deepEqual(parsed, expected);
  });
});
