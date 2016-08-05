var parser  = require('../../src/generated/parser');
var ast     = require('../../src/js/lcl/ast').Node;

var dedent = require('dentist').dedent;

exports.programdata = {

  'expression function with one argument is parsed': function (test) {

    var program = `foo = (a) -> a + 1`;
    var parsed = parser.parse(program);

    var expected = ast.Block([
      ast.Assignment(
        'foo',
        ast.Closure(
          ['a'],
          ast.BinaryOp(
            '+', 
            ast.Variable('a'),
            ast.Num(1)
          )
        )
      )
    ]);

    test.deepEqual(parsed, expected);
    test.done();
  },

  'expression function is parsed': function (test) {

    var program = dedent(`
                         foo = (a, b) -> a + b
                         `);
    var parsed = parser.parse(program);

    var expected = ast.Block([
      ast.Assignment(
        'foo',
        ast.Closure(
          ['a', 'b'],
          ast.BinaryOp(
            '+', 
            ast.Variable('a'),
            ast.Variable('b')
          )
        )
      )
    ]);

    test.deepEqual(parsed, expected);
    test.done();
  },

  'block function is parsed': function (test) {

    var program = dedent(`
                         bar = (a, b) ->
                         \tc = a + b
                         \tbox c, 3
                         `);
    var parsed = parser.parse(program, {functionNames: ['box']});

    var expected = ast.Block([
      ast.Assignment(
        'bar',
        ast.Closure(
          ['a', 'b'],
          ast.Block([
            ast.Assignment(
              'c',
              ast.BinaryOp(
                '+', 
                ast.Variable('a'),
                ast.Variable('b')
              )
            ),
            ast.Application(
              'box',
              [ast.Variable('c'), ast.Num(3)],
              null
            )
          ])
        )
      )
    ]);

    test.deepEqual(parsed, expected);
    test.done();
  },

  'expression function is parsed then used': function (test) {

    var program = dedent(`
                         foo = (a) -> a + 3
                         bar = foo 1 + foo(2)
                         `);
    var parsed = parser.parse(program);

    var expected = ast.Block([
      ast.Assignment(
        'foo',
        ast.Closure(
          ['a'],
          ast.BinaryOp(
            '+', 
            ast.Variable('a'),
            ast.Num(3)
          )
        )
      ),
      ast.Assignment(
        'bar',
        ast.BinaryOp(
          '+',
          ast.Application('foo', [ast.Num(1)], null),
          ast.Application('foo', [ast.Num(2)], null)
        )
      )
    ]);

    test.deepEqual(parsed, expected);
    test.done();
  },

  'bare application call with single expression args': function (test) {

    var program = `box (3 + 4) + 2`;
    var parsed = parser.parse(program, {functionNames: ['box']});

    var expected = ast.Block([
      ast.Application(
        'box',
        [
          ast.BinaryOp(
            '+', 
            ast.BinaryOp(
              '+', 
              ast.Num(3),
              ast.Num(4)
            ),
            ast.Num(2)
          )
        ],
        null
      )
    ]);

    test.deepEqual(parsed, expected);
    test.done();
  },

  'bare application call with expression args': function (test) {

    var program = `box 3 + 4, a * 2`;
    var parsed = parser.parse(program, {functionNames: ['box']});

    var expected = ast.Block([
      ast.Application(
        'box',
        [
          ast.BinaryOp(
            '+', 
            ast.Num(3),
            ast.Num(4)
          ),
          ast.BinaryOp(
            '*', 
            ast.Variable('a'),
            ast.Num(2)
          )
        ],
        null
      )
    ]);

    test.deepEqual(parsed, expected);
    test.done();
  },

  'two inlined function calls are parsed': function (test) {

    var program = `rotate 2 box 3`;
    var parsed = parser.parse(program, {functionNames: ['rotate', 'box']});

    var expected = ast.Block([
      ast.Application(
        'rotate',
        [ ast.Num(2) ],
        ast.Block([
          ast.Application(
            'box',
            [ ast.Num(3)],
            null
          )
        ])
      )
    ]);

    test.deepEqual(parsed, expected);
    test.done();
  },

  'inlined function calls are parsed': function (test) {

    var program = `rotate 2 fill red box 3, 4 peg 2`;
    var parsed = parser.parse(program,
                              {functionNames: [
                                'rotate', 'fill', 'box', 'peg'
                              ]});

    var expected = ast.Block([
      ast.Application(
        'rotate',
        [ ast.Num(2) ],
        ast.Block([
          ast.Application(
            'fill',
            [ ast.Variable('red') ],
            ast.Block([
              ast.Application(
                'box',
                [ ast.Num(3), ast.Num(4) ],
                ast.Block([ast.Application('peg', [ast.Num(2)], null)])
              )
            ])
          )
        ])
      )
    ]);

    test.deepEqual(parsed, expected);
    test.done();
  },

  'inlined function calls without arguments': function (test) {

    var program = dedent(`
                         a = 3
                         rotate scale move a rotate box 3, 4 peg 2
                         `);
    var parsed = parser.parse(program,
                              {functionNames: [
                                'rotate', 'scale', 'move', 'box', 'peg'
                              ]});

    var expected = ast.Block([
      ast.Assignment('a', ast.Num(3)),
      ast.Application(
        'rotate', [],
        ast.Block([
          ast.Application(
            'scale', [],
            ast.Block([
              ast.Application(
                'move', [ast.Variable('a')],
                ast.Block([
                  ast.Application(
                    'rotate', [],
                    ast.Block([
                      ast.Application(
                        'box',
                        [ ast.Num(3), ast.Num(4) ],
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

    test.deepEqual(parsed, expected);
    test.done();
  }
};

