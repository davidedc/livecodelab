var parser  = require('../../src/generated/parser');
var ast     = require('../../src/js/lcl/ast').Node;

var dedent = require('dentist').dedent;

exports.programdata = {

  'simple if statement parses': function (test) {

    var program = dedent(`
                         a = 3

                         if (a == 3)
                         \tbox
                         `);
    var parsed = parser.parse(
      program, {
        functionNames: ['box'],
        inlibaleFunctions: ['box']
      });

    var expected = ast.Block([
      ast.Assignment('a', ast.Num(3)),
      ast.If(
        ast.BinaryOp('==', ast.Variable('a'), ast.Num(3)),
        ast.Block([
          ast.Application('box', [], null)
        ]),
        null
      )
        ]);

    test.deepEqual(parsed, expected);
    test.done();
  },

  'if else statement parses': function (test) {

    var program = dedent(`
                         a = 3
                         if a == 3
                         \tbox
                         else
                         \tpeg
                         `);
    var parsed = parser.parse(
      program, {
        functionNames: ['box', 'peg'],
        inlinableFunctions: ['box', 'peg']
      });

    var expected = ast.Block([
      ast.Assignment('a', ast.Num(3)),
      ast.If(
        ast.BinaryOp('==', ast.Variable('a'), ast.Num(3)),
        ast.Block([
          ast.Application('box', [], null)
        ]),
        ast.If(
          ast.Num(1),
          ast.Block([
            ast.Application('peg', [], null)
          ])
        )
          )
        ]);

    test.deepEqual(parsed, expected);
    test.done();
  },

  'if ifelse else statement parses': function (test) {

    var program = dedent(`
                         a = 3
                         if a == 1
                         \tbox
                         else if a == 2
                         \tball
                         else
                         \tpeg
                         `);
    var parsed = parser.parse(
      program, {
        functionNames: ['box', 'peg', 'ball'],
        inlinableFunctions: ['box', 'peg', 'ball']
      });

    var expected = ast.Block([
      ast.Assignment('a', ast.Num(3)),
      ast.If(
        ast.BinaryOp('==', ast.Variable('a'), ast.Num(1)),
        ast.Block([
          ast.Application('box', [], null)
        ]),
        ast.If(
          ast.BinaryOp('==', ast.Variable('a'), ast.Num(2)),
          ast.Block([
            ast.Application('ball', [], null)
          ]),
          ast.If(
            ast.Num(1),
            ast.Block([
              ast.Application('peg', [], null)
            ])
          )
            )
          )
        ]);

    test.deepEqual(parsed, expected);
    test.done();
  }

};

