var parser  = require('../../src/generated/parser');
var ast     = require('../../src/js/lcl/ast').Node;

var dedent = require('dentist').dedent;

exports.programdata = {

  'simple doOnce block parses': function (test) {

    var program = dedent(`
                         doOnce
                         \tbox 4
                         peg 3, 4
                         `);
    var parsed = parser.parse(program,
                              {functionNames: ['peg', 'box']}
                             );

    var expected = ast.Block([
      ast.DoOnce(
        true,
        ast.Block([
          ast.Application(
            'box',
            [ast.Num(4)],
            null
          )
        ])
      ),
      ast.Application(
        'peg',
        [ast.Num(3), ast.Num(4)],
        null
      )
    ]);
    test.deepEqual(parsed, expected);
    test.done();
  },

  'nested blocks parses': function (test) {

    var program = dedent(`
                         doOnce
                         \tdoOnce
                         \t\trotate
                         \t\t\tbox 4
                         \tpeg 4
                         ball 2
                         `);
    var parsed = parser.parse(program,
                              {functionNames: [
                                'rotate', 'ball', 'peg', 'box'
                              ]}
                             );

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
                ast.Block([
                  ast.Application(
                    'box',
                    [ast.Num(4)],
                    null
                  )
                ])
              )
            ])
          ),
          ast.Application(
            'peg',
            [ast.Num(4)],
            null
          )
        ])
      ),
      ast.Application(
        'ball',
        [ast.Num(2)],
        null
      )
    ]);
    test.deepEqual(parsed, expected);
    test.done();
  }

};
