var parser  = require('../../src/generated/parser');
var ast     = require('../../src/js/lcl/ast').Node;

var dedent = require('dentist').dedent;

exports.programdata = {

  'simple doOnce expression works': function (test) {

    var program = `doOnce box()`;
    var parsed = parser.parse(program, {
      functionNames: ['box'],
      inlinableFunctions: ['box']
    });

    var expected = ast.Block([
      ast.DoOnce(
        true,
        ast.Block([
          ast.Application('box', [], null)
        ])
      )
    ]);
    test.deepEqual(parsed, expected);
    test.done();
  },

  'finished simple doOnce expression works': function (test) {

    var program = `✓doOnce box()`;
    var parsed = parser.parse(program, {
      functionNames: ['box'],
      inlinableFunctions: ['box']
    });

    var expected = ast.Block([
      ast.DoOnce(
        false,
        ast.Block([
          ast.Application('box', [], null)
        ])
      )
    ]);

    test.deepEqual(parsed, expected);
    test.done();
  },

  'block doOnce expression works': function (test) {

    var program = dedent(`
                         doOnce
                         \trotate
                         \t\tbox 4
                         `);
    var parsed = parser.parse(
      program,
      {
        functionNames: ['rotate', 'box'],
        inlinableFunctions: ['rotate', 'box']
      }
    );

    var expected = ast.Block([
      ast.DoOnce(
        true,
        ast.Block([
          ast.Application(
            'rotate',
            [],
            ast.Block([
              ast.Application('box', [ast.Num(4)], null)
            ])
          )
        ])
      )
    ]);

    test.deepEqual(parsed, expected);
    test.done();
  },

  'finished block doOnce expression works': function (test) {

    var program = dedent(`
                         ✓doOnce
                         \trotate
                         \t\tbox 4
                         `);
    var parsed = parser.parse(
      program,
      {
        functionNames: ['rotate', 'box'],
        inlinableFunctions: ['rotate', 'box']
      }
    );

    var expected = ast.Block([
      ast.DoOnce(
        false,
        ast.Block([
          ast.Application(
            'rotate',
            [],
            ast.Block([
              ast.Application('box', [ast.Num(4)], null)
            ])
          )
        ])
      )
    ]);

    test.deepEqual(parsed, expected);
    test.done();
  }

};
