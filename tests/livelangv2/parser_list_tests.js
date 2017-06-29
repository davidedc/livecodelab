/* global describe, it */

var parser  = require('../../src/grammar/lcl');
var ast     = require('../../src/js/lcl/ast').Node;

var dedent = require('dentist').dedent;

var assert = require('assert');

describe('List', function () {

  it('basic list literal works', function () {

    var program = dedent(`
                         a = [1, 3, 5]
                         `);
    var parsed = parser.parse(
      program, {
        functionNames: [],
        inlinableFunctions: []
      });

    var expected = ast.Block([
      ast.Assignment(
        'a',
        ast.List([
          ast.Num(1), ast.Num(3), ast.Num(5)
        ])
      )
    ]);
    assert.deepEqual(parsed, expected);
  });

});

