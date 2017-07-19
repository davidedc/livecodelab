/* global describe, it */

var Interpreter = require('../../src/js/lcl/interpreter');
var parser = require('../../src/grammar/lcl');
var ast = require('../../src/js/lcl/ast').Node;

var dedent = require('dentist').dedent;

var assert = require('assert');

describe('Interpreter', function() {
  it('evaluate simple expression', function() {
    var i = Interpreter;
    var output;
    var scope = {
      result: {
        type: 'builtin',
        func: function(v) {
          output = v;
        }
      }
    };
    var program = parser.parse('result (3 + 4) * 2', {
      functionNames: ['result']
    });
    i.run(program, scope);

    assert.equal(output, 14, 'should return 14');
  });

  it('evaluate expression with variable', function() {
    var i = Interpreter;
    var output;
    var scope = {
      result: {
        type: 'builtin',
        func: function(v) {
          output = v;
        }
      },
      foo: 4
    };
    var program = parser.parse(
      dedent(`
             a = foo + 1
             result (a + 4) * foo`),
      { functionNames: ['result'] }
    );
    i.run(program, scope);

    assert.equal(output, 36, 'output should be 36');
  });

  it('times loop', function() {
    var i = Interpreter;
    var output;
    var scope = {
      result: {
        type: 'builtin',
        func: function(v) {
          output = v;
        }
      }
    };

    var program = parser.parse(
      dedent(`
             a = 0
             5 times with i
             \ta = a + i
             \tresult a
             `),
      { functionNames: ['result'] }
    );

    i.run(program, scope);

    assert.equal(output, 4, `output should be 4 not ${output}`);
  });

  it('function definition and usage', function() {
    var i = Interpreter;
    var output;
    var scope = {
      result: {
        type: 'builtin',
        func: function(v) {
          output = v;
        }
      }
    };

    var program = parser.parse(
      dedent(`
             //the first function
             a = (x) -> x * 2
             //another function
             b = (x, y) -> x + y
             result (b (a 2), 3) + a 1
             `),
      { functionNames: ['result'] }
    );

    var expected = ast.Block([
      ast.Assignment(
        'a',
        ast.Closure(['x'], ast.BinaryOp('*', ast.Variable('x'), ast.Num(2)))
      ),
      ast.Assignment(
        'b',
        ast.Closure(
          ['x', 'y'],
          ast.BinaryOp('+', ast.Variable('x'), ast.Variable('y'))
        )
      ),
      ast.Application(
        'result',
        [
          ast.BinaryOp(
            '+',
            ast.Application(
              'b',
              [ast.Application('a', [ast.Num(2)], null), ast.Num(3)],
              null
            ),
            ast.Application('a', [ast.Num(1)], null)
          )
        ],
        null
      )
    ]);

    assert.deepEqual(program, expected);

    i.run(program, scope);

    assert.equal(output, 9, `output should be 9 not ${output}`);
  });
});
