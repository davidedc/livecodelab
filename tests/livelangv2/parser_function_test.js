/* global describe, it */

import parser from '../../src/grammar/lcl';
import {
  Application,
  Assignment,
  BinaryOp,
  Block,
  Closure,
  If,
  Num,
  Variable
} from '../../src/js/lcl/ast';

import { dedent } from 'dentist';

import assert from 'assert';

describe('Function', function() {
  it('expression function with one argument is parsed', function() {
    var program = 'foo = (a) -> a + 1';
    var parsed = parser.parse(program);

    var expected = Block([
      Assignment(
        'foo',
        Closure(['a'], BinaryOp('+', Variable('a'), Num(1)), false)
      )
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('expression function is parsed', function() {
    var program = dedent(`
                         foo = (a, b) -> a + b
                         `);
    var parsed = parser.parse(program);

    var expected = Block([
      Assignment(
        'foo',
        Closure(['a', 'b'], BinaryOp('+', Variable('a'), Variable('b')), false)
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

    var expected = Block([
      Assignment(
        'foo',
        Closure([], BinaryOp('*', Num(255), Application('random', [])), false)
      ),
      Application('fill', [Application('foo', [])]),
      Application('box', [])
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('simple function call is parsed', function() {
    var program = 'box 1';
    var parsed = parser.parse(program, {
      functionNames: ['box'],
      inlinableFunctions: ['box']
    });

    var expected = Block([Application('box', [Num(1)])]);

    assert.deepEqual(parsed, expected);
  });

  it('simple function call with empty arg list is parsed', function() {
    var program = 'box';
    var parsed = parser.parse(program, {
      functionNames: ['box'],
      inlinableFunctions: ['box']
    });

    var expected = Block([Application('box', [])]);

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

    var expected = Block([
      Assignment(
        'bar',
        Closure(
          ['a', 'b'],
          Block([
            Assignment('c', BinaryOp('+', Variable('a'), Variable('b'))),
            Application('box', [Variable('c'), Num(3)])
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

    var expected = Block([
      Assignment(
        'bar',
        Closure(
          ['a', 'b'],
          Block([
            If(
              BinaryOp('>', Variable('a'), Variable('b')),
              Block([Application('box', [Variable('a')])]),
              If(Num(1), Block([Application('box', [Variable('b')])]))
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

    var expected = Block([
      Assignment(
        'foo',
        Closure(['a'], BinaryOp('+', Variable('a'), Num(3)), false)
      ),
      Assignment(
        'bar',
        Application('foo', [
          BinaryOp('+', Num(1), Application('foo', [Num(2)]))
        ])
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

    var expected = Block([
      Assignment(
        'foo',
        Closure(['a', 'b'], BinaryOp('+', Variable('a'), Variable('b')), false)
      ),
      Assignment(
        'bar',
        Application('foo', [Application('foo', [Num(1), Num(2), Num(3)])])
      )
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('complex expression function is parsed', function() {
    var program =
      'foo = (x, y, j, z) -> spread * (  ( noise(x * abs(sin(time+y) * movmentSpeed)) / (j + z) ) - 0.5  )';

    var parsed = parser.parse(program, {
      functionNames: ['noise', 'abs', 'sin'],
      inlinableFunctions: []
    });

    var expected = Block([
      Assignment(
        'foo',
        Closure(
          ['x', 'y', 'j', 'z'],
          BinaryOp(
            '*',
            Variable('spread'),
            BinaryOp(
              '-',
              BinaryOp(
                '/',
                Application('noise', [
                  BinaryOp(
                    '*',
                    Variable('x'),
                    Application('abs', [
                      BinaryOp(
                        '*',
                        Application('sin', [
                          BinaryOp('+', Variable('time'), Variable('y'))
                        ]),
                        Variable('movmentSpeed')
                      )
                    ])
                  )
                ]),
                BinaryOp('+', Variable('j'), Variable('z'))
              ),
              Num(0.5)
            )
          )
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

    var expected = Block([
      Application('box', [BinaryOp('+', BinaryOp('+', Num(3), Num(4)), Num(2))])
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('bare application call with expression args', function() {
    var program = 'box 3 + 4, a * 2';
    var parsed = parser.parse(program, {
      functionNames: ['box'],
      inlinableFunctions: ['box']
    });

    var expected = Block([
      Application('box', [
        BinaryOp('+', Num(3), Num(4)),
        BinaryOp('*', Variable('a'), Num(2))
      ])
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('bare application call with parenthesised expression args', function() {
    var program = 'box (3 + 4) * 2, a * 2';
    var parsed = parser.parse(program, {
      functionNames: ['box'],
      inlinableFunctions: ['box']
    });

    var expected = Block([
      Application('box', [
        BinaryOp('*', BinaryOp('+', Num(3), Num(4)), Num(2)),
        BinaryOp('*', Variable('a'), Num(2))
      ])
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('two inlined function calls are parsed', function() {
    var program = 'rotate 2 box 3';
    var parsed = parser.parse(program, {
      functionNames: ['rotate', 'box'],
      inlinableFunctions: ['rotate', 'box']
    });

    var expected = Block([
      Application('rotate', [Num(2)], Block([Application('box', [Num(3)])]))
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('paren-less function with parened function as argument', function() {
    var program = 'box bar 3';
    var parsed = parser.parse(program, {
      functionNames: ['box', 'bar'],
      inlinableFunctions: ['box']
    });

    var expected = Block([Application('box', [Application('bar', [Num(3)])])]);

    assert.deepEqual(parsed, expected);
  });

  it('parens work as expectd with functions', function() {
    var program = dedent(`
                         a = bar 3 + 1
                         b = bar(3) + 1
                         c = bar (3) + 1
                         `);
    var parsed = parser.parse(program, {
      functionNames: ['bar'],
      inlinableFunctions: []
    });

    var expected = Block([
      Assignment('a', Application('bar', [BinaryOp('+', Num(3), Num(1))])),
      Assignment('b', BinaryOp('+', Application('bar', [Num(3)]), Num(1))),
      Assignment('c', Application('bar', [BinaryOp('+', Num(3), Num(1))]))
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('inlined function calls are parsed', function() {
    var program = 'rotate 2 fill red box 3, 4 peg 2';
    var parsed = parser.parse(program, {
      functionNames: ['rotate', 'fill', 'box', 'peg'],
      inlinableFunctions: ['rotate', 'fill', 'box', 'peg']
    });

    var expected = Block([
      Application(
        'rotate',
        [Num(2)],
        Block([
          Application(
            'fill',
            [Variable('red')],
            Block([
              Application(
                'box',
                [Num(3), Num(4)],
                Block([Application('peg', [Num(2)])])
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

    var expected = Block([
      Assignment('a', Num(3)),
      Application(
        'rotate',
        [],
        Block([
          Application(
            'scale',
            [],
            Block([
              Application(
                'move',
                [Variable('a')],
                Block([
                  Application(
                    'rotate',
                    [],
                    Block([
                      Application(
                        'box',
                        [Num(3), Num(4)],
                        Block([Application('peg', [Num(2)])])
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

    var expected = Block([
      Application(
        'scale',
        [Application('wave', [])],
        Block([Application('box', [])])
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

    var expected = Block([
      Application(
        'scale',
        [Application('wave', [Application('wave', [])])],
        Block([Application('box', [])])
      )
    ]);

    assert.deepEqual(parsed, expected);
  });
});
