var parser  = require('../../src/generated/parser');
var ast     = require('../../src/js/lcl/ast').Node;

var dedent = require('dentist').dedent;

exports.programdata = {

  'basic function calls work': function (test) {

    var program = dedent(`

                         box
                         `);
    var parsed = parser.parse(program, {functionNames: ['box']});

    var expected = ast.Block([
      ast.Application('box', [], null)
    ]);

    test.deepEqual(parsed, expected);
    test.done();
  },

  'primitive with args and block': function (test) {

    var program = dedent(`
                         rotate 2, 3
                         \tbox

                         `);
    var parsed = parser.parse(program, {functionNames: ['rotate', 'box']});

    var expected = ast.Block([
      ast.Application(
        'rotate',
        [ast.Num(2), ast.Num(3)],
        ast.Block([
          ast.Application('box', [], null)
        ])
      )
    ]);

    test.deepEqual(parsed, expected);
    test.done();
  },

  'inline calls': function (test) {

    var program = dedent(`
                         rotate 2, 3 >> box
                         `);
    var parsed = parser.parse(program, {functionNames: ['rotate', 'box']});

    var expected = ast.Block([
      ast.Application(
        'rotate',
        [ast.Num(2), ast.Num(3)],
        ast.Block([
          ast.Application('box', [], null)
        ])
      )
    ]);

    test.deepEqual(parsed, expected);
    test.done();
  },

  'multiple inline calls': function (test) {

    var program = dedent(`rotate 2, 3 >> fill red >> box
                         `);
    var parsed = parser.parse(program,
                              {functionNames:
                               ['rotate', 'fill', 'box']}
                             );

    var expected = ast.Block([
      ast.Application(
        'rotate',
        [ast.Num(2), ast.Num(3)],
        ast.Block([
          ast.Application(
            'fill',
            [ast.Variable('red')],
            ast.Block([
              ast.Application('box', [], null)
            ])
          )
        ])
      )
    ]);

    test.deepEqual(parsed, expected);
    test.done();
  },

  'multiple inline calls with no arrows': function (test) {

    var program = dedent(`
                         rotate 2, 3 fill red box
                         `);
    var parsed = parser.parse(program,
                              {functionNames:
                               ['rotate', 'fill', 'box']}
                             );

    var expected = ast.Block([
      ast.Application(
        'rotate',
        [ast.Num(2), ast.Num(3)],
        ast.Block([
          ast.Application(
            'fill',
            [ast.Variable('red')],
            ast.Block([
              ast.Application('box', [], null)
            ])
          )
        ])
      )
    ]);

    test.deepEqual(parsed, expected);
    test.done();
  },

  'more complex inline function calls': function (test) {

    var program = dedent(`
                         scale 2, wave 2 peg
                         \tscale 2, wave 2 ball
                         `);
    var parsed = parser.parse(program,
                              {functionNames:
                               ['scale', 'wave', 'peg', 'ball']}
                             );

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
                ast.Block([
                  ast.Application(
                    'ball',
                    [],
                    null
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
  },

  'more complicated times loop inlining': function (test) {

    var program = `rotate wave + 2 times box`;
    var parsed = parser.parse(program,
                              {functionNames:
                               ['rotate', 'wave', 'box']}
                             );

    var expected = ast.Block([
      ast.Application(
        'rotate',
        [],
        ast.Block([
            ast.Times(
            ast.BinaryOp('+', ast.Application('wave', [], null), ast.Num(2)),
            ast.Block([
                ast.Application(
                'box',
                [],
                null
                )
            ]),
            null
            )
        ])
      )
    ]);

    test.deepEqual(parsed, expected);
    test.done();
  }

};

