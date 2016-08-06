var parser  = require('../../src/generated/parser');
var ast     = require('../../src/js/lcl/ast').Node;

var dedent = require('dentist').dedent;

exports.programdata = {

  'basic times loop works': function (test) {

    var program = dedent(`
                         4 times
                         \tbox(4)
                         `);
    var parsed = parser.parse(program, {functionNames: ['box']});

    var expected = ast.Block([
      ast.Times(
        ast.Num(4),
        ast.Block([
          ast.Application(
            'box',
            [ast.Num(4)],
            null
          )
        ]),
        null
      )
    ]);
    test.deepEqual(parsed, expected);
    test.done();
  },

  'times loop with variable': function (test) {

    var program = dedent(`
                         4 times with i
                         \tbox(4)
                         `);
    var parsed = parser.parse(program, {functionNames: ['box']});

    var expected = ast.Block([
      ast.Times(
        ast.Num(4),
        ast.Block([
          ast.Application(
            'box',
            [ast.Num(4)],
            null
          )
        ]),
        'i'
      )
    ]);
    test.deepEqual(parsed, expected);
    test.done();
  },

  'times loop with variable number and loopvar': function (test) {

    var program = dedent(`
                         foo = 100
                         foo times with i
                         \tbox(4)
                         `);
    var parsed = parser.parse(program, {functionNames: ['box']});

    var expected = ast.Block([
      ast.Assignment('foo', ast.Num(100)),
      ast.Times(
        ast.Variable('foo'),
        ast.Block([
          ast.Application(
            'box',
            [ast.Num(4)],
            null
          )
        ]),
        'i'
      )
    ]);
    test.deepEqual(parsed, expected);
    test.done();
  },

  'times loop can be inlined': function (test) {
    var program = dedent(`4 times 3 times box`);
    var parsed = parser.parse(program, {functionNames: ['box']});

    var expected = ast.Block([
      ast.Times(
        ast.Num(4),
        ast.Block([
          ast.Times(
            ast.Num(3),
            ast.Block([
                ast.Application(
                    'box',
                    [],
                    null
                )
            ]),
            null
          )
        ]),
        null
      )
    ]);
    test.deepEqual(parsed, expected);
    test.done();
  }

};

