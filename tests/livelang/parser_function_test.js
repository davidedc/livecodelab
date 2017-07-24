/* global describe, it */

var parser = require('../../src/grammar/lcl');
var ast = require('../../src/js/lcl/ast').Node;

var dedent = require('dentist').dedent;

var assert = require('assert');

describe('Function', function() {
  it('expression function with one argument is parsed', function() {
    var program = 'foo = (a) -> a + 1';
    var parsed = parser.parse(program);

    var expected = ast.Block([
      ast.Assignment(
        'foo',
        ast.Closure(
          ['a'],
          ast.BinaryOp('+', ast.Variable('a'), ast.Num(1)),
          false
        )
      )
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('expression function is parsed', function() {
    var program = dedent(`
                         foo = (a, b) -> a + b
                         `);
    var parsed = parser.parse(program);

    var expected = ast.Block([
      ast.Assignment(
        'foo',
        ast.Closure(
          ['a', 'b'],
          ast.BinaryOp('+', ast.Variable('a'), ast.Variable('b')),
          false
        )
      )
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('lambda can be used ok', function() {
    var program = dedent(`
                         foo = () => 255 * random
                         fill foo
                         box
                         `);
    var parsed = parser.parse(program, {
      functionNames: ['box', 'random', 'fill'],
      inlinableFunctions: ['box']
    });

    var expected = ast.Block([
      ast.Assignment(
        'foo',
        ast.Closure(
          [],
          ast.BinaryOp('*', ast.Num(255), ast.Application('random', [], null)),
          false
        )
      ),
      ast.Application('fill', [ast.Application('foo', [])], null),
      ast.Application('box', [], null)
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('simple function call is parsed', function() {
    var program = 'box 1';
    var parsed = parser.parse(program, {
      functionNames: ['box'],
      inlinableFunctions: ['box']
    });

    var expected = ast.Block([ast.Application('box', [ast.Num(1)], null)]);

    assert.deepEqual(parsed, expected);
  });

  it('simple function call with empty arg list is parsed', function() {
    var program = 'box';
    var parsed = parser.parse(program, {
      functionNames: ['box'],
      inlinableFunctions: ['box']
    });

    var expected = ast.Block([ast.Application('box', [], null)]);

    assert.deepEqual(parsed, expected);
  });

  it('block function is parsed', function() {
    var program = dedent(`
                         bar = (a, b) ->
                         \tc = a + b
                         \tbox c, 3
                         `);
    var parsed = parser.parse(program, {
      functionNames: ['box'],
      inlinableFunctions: ['box']
    });

    var expected = ast.Block([
      ast.Assignment(
        'bar',
        ast.Closure(
          ['a', 'b'],
          ast.Block([
            ast.Assignment(
              'c',
              ast.BinaryOp('+', ast.Variable('a'), ast.Variable('b'))
            ),
            ast.Application('box', [ast.Variable('c'), ast.Num(3)], null)
          ]),
          false
        )
      )
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('block function with if is parsed', function() {
    var program = dedent(`
                         bar = (a, b) ->
                         \tif a > b
                         \t\tbox a
                         \telse
                         \t\tbox b
                         `);
    var parsed = parser.parse(program, {
      functionNames: ['box'],
      inlinableFunctions: ['box']
    });

    var expected = ast.Block([
      ast.Assignment(
        'bar',
        ast.Closure(
          ['a', 'b'],
          ast.Block([
            ast.If(
              ast.BinaryOp('>', ast.Variable('a'), ast.Variable('b')),
              ast.Block([ast.Application('box', [ast.Variable('a')], null)]),
              ast.If(
                ast.Num(1),
                ast.Block([ast.Application('box', [ast.Variable('b')], null)])
              )
            )
          ]),
          false
        )
      )
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('expression function is parsed then used', function() {
    var program = dedent(`
                         foo = (a) -> a + 3
                         bar = foo 1 + foo 2
                         `);
    var parsed = parser.parse(program);

    var expected = ast.Block([
      ast.Assignment(
        'foo',
        ast.Closure(
          ['a'],
          ast.BinaryOp('+', ast.Variable('a'), ast.Num(3)),
          false
        )
      ),
      ast.Assignment(
        'bar',
        ast.Application(
          'foo',
          [
            ast.BinaryOp(
              '+',
              ast.Num(1),
              ast.Application('foo', [ast.Num(2)], null)
            )
          ],
          null
        )
      )
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('function precedence is linear', function() {
    var program = dedent(`
                         foo = (a, b) -> a + b
                         bar = foo foo 1, 2, 3
                         `);
    var parsed = parser.parse(program);

    var expected = ast.Block([
      ast.Assignment(
        'foo',
        ast.Closure(
          ['a', 'b'],
          ast.BinaryOp('+', ast.Variable('a'), ast.Variable('b')),
          false
        )
      ),
      ast.Assignment(
        'bar',
        ast.Application(
          'foo',
          [ast.Application('foo', [ast.Num(1), ast.Num(2), ast.Num(3)], null)],
          null
        )
      )
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('complex expression function is parsed', function() {
    var program =
      'foo = (x, y, j, z) -> spread * (  ( noise  (x * abs (sin (time+y) * movmentSpeed)) / (j + z) ) - 0.5  )';

    var parsed = parser.parse(program, {
      functionNames: ['noise', 'abs', 'sin'],
      inlinableFunctions: []
    });

    var expected = ast.Block([
      ast.Assignment(
        'foo',
        ast.Closure(
          ['x', 'y', 'j', 'z'],
          ast.BinaryOp(
            '*',
            ast.Variable('spread'),
            ast.BinaryOp(
              '-',
              ast.Application(
                'noise',
                [
                  ast.BinaryOp(
                    '/',
                    ast.BinaryOp(
                      '*',
                      ast.Variable('x'),
                      ast.Application(
                        'abs',
                        [
                          ast.Application(
                            'sin',
                            [
                              ast.BinaryOp(
                                '*',
                                ast.BinaryOp(
                                  '+',
                                  ast.Variable('time'),
                                  ast.Variable('y')
                                ),
                                ast.Variable('movmentSpeed')
                              )
                            ],
                            null
                          )
                        ],
                        null
                      )
                    ),
                    ast.BinaryOp('+', ast.Variable('j'), ast.Variable('z'))
                  )
                ],
                null
              ),
              ast.Num(0.5)
            )
          ),
          false
        )
      )
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('bare application call with single expression args', function() {
    var program = 'box 3 + 4 + 2';
    var parsed = parser.parse(program, {
      functionNames: ['box'],
      inlinableFunctions: ['box']
    });

    var expected = ast.Block([
      ast.Application(
        'box',
        [
          ast.BinaryOp(
            '+',
            ast.BinaryOp('+', ast.Num(3), ast.Num(4)),
            ast.Num(2)
          )
        ],
        null
      )
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('bare application call with expression args', function() {
    var program = 'box 3 + 4, a * 2';
    var parsed = parser.parse(program, {
      functionNames: ['box'],
      inlinableFunctions: ['box']
    });

    var expected = ast.Block([
      ast.Application(
        'box',
        [
          ast.BinaryOp('+', ast.Num(3), ast.Num(4)),
          ast.BinaryOp('*', ast.Variable('a'), ast.Num(2))
        ],
        null
      )
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('bare application call with parenthesised expression args', function() {
    var program = 'box (3 + 4) * 2, a * 2';
    var parsed = parser.parse(program, {
      functionNames: ['box'],
      inlinableFunctions: ['box']
    });

    var expected = ast.Block([
      ast.Application(
        'box',
        [
          ast.BinaryOp(
            '*',
            ast.BinaryOp('+', ast.Num(3), ast.Num(4)),
            ast.Num(2)
          ),
          ast.BinaryOp('*', ast.Variable('a'), ast.Num(2))
        ],
        null
      )
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('two inlined function calls are parsed', function() {
    var program = 'rotate 2 box 3';
    var parsed = parser.parse(program, {
      functionNames: ['rotate', 'box'],
      inlinableFunctions: ['rotate', 'box']
    });

    var expected = ast.Block([
      ast.Application(
        'rotate',
        [ast.Num(2)],
        ast.Block([ast.Application('box', [ast.Num(3)], null)])
      )
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('paren-less function with parened function as argument', function() {
    var program = 'box bar 3';
    var parsed = parser.parse(program, {
      functionNames: ['box', 'bar'],
      inlinableFunctions: ['box']
    });

    var expected = ast.Block([
      ast.Application('box', [ast.Application('bar', [ast.Num(3)], null)], null)
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('inlined function calls are parsed', function() {
    var program = 'rotate 2 fill red box 3, 4 peg 2';
    var parsed = parser.parse(program, {
      functionNames: ['rotate', 'fill', 'box', 'peg'],
      inlinableFunctions: ['rotate', 'fill', 'box', 'peg']
    });

    var expected = ast.Block([
      ast.Application(
        'rotate',
        [ast.Num(2)],
        ast.Block([
          ast.Application(
            'fill',
            [ast.Variable('red')],
            ast.Block([
              ast.Application(
                'box',
                [ast.Num(3), ast.Num(4)],
                ast.Block([ast.Application('peg', [ast.Num(2)], null)])
              )
            ])
          )
        ])
      )
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('inlined function calls without arguments', function() {
    var program = dedent(`
                         a = 3
                         rotate scale move a rotate box 3, 4 peg 2
                         `);
    var parsed = parser.parse(program, {
      functionNames: ['rotate', 'scale', 'move', 'box', 'peg'],
      inlinableFunctions: ['rotate', 'scale', 'move', 'box', 'peg']
    });

    var expected = ast.Block([
      ast.Assignment('a', ast.Num(3)),
      ast.Application(
        'rotate',
        [],
        ast.Block([
          ast.Application(
            'scale',
            [],
            ast.Block([
              ast.Application(
                'move',
                [ast.Variable('a')],
                ast.Block([
                  ast.Application(
                    'rotate',
                    [],
                    ast.Block([
                      ast.Application(
                        'box',
                        [ast.Num(3), ast.Num(4)],
                        ast.Block([ast.Application('peg', [ast.Num(2)], null)])
                      )
                    ])
                  )
                ])
              )
            ])
          )
        ])
      )
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('inlined simple function calls without arguments', function() {
    var program = dedent('scale wave box');
    var parsed = parser.parse(program, {
      functionNames: ['scale', 'wave', 'box'],
      inlinableFunctions: ['scale', 'box']
    });

    var expected = ast.Block([
      ast.Application(
        'scale',
        [ast.Application('wave', [], null)],
        ast.Block([ast.Application('box', [], null)])
      )
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('multiple inlined simple function calls without arguments', function() {
    var program = dedent('scale wave wave box');
    var parsed = parser.parse(program, {
      functionNames: ['scale', 'wave', 'box'],
      inlinableFunctions: ['scale', 'box']
    });

    var expected = ast.Block([
      ast.Application(
        'scale',
        [ast.Application('wave', [ast.Application('wave', [], null)], null)],
        ast.Block([ast.Application('box', [], null)])
      )
    ]);

    assert.deepEqual(parsed, expected);
  });
});
