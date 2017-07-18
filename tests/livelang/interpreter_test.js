/* global describe, it */

import { run } from '../../src/js/lcl/interpreter';
import parser from '../../src/grammar/lcl';
import {
  Application,
  Assignment,
  BinaryOp,
  Block,
  Closure,
  Num,
  Variable
} from '../../src/js/lcl/ast';

import { dedent } from 'dentist';

import assert from 'assert';

describe('Interpreter', function() {
  it('evaluate simple expression', function() {
    var output;
    var scope = {
      result: {
        type: 'builtin',
        func: function(v) {
          output = v;
        }
      }
    };
    var program = parser.parse('result 3 + 4 * 2', {
      functionNames: ['result']
    });
    run(program, scope);

    assert.equal(output, 11, 'should return 11');
  });

  it('evaluate expression with variable', function() {
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
             result((a + 4) * foo)`),
      { functionNames: ['result'] }
    );
    run(program, scope);

    assert.equal(output, 36, 'output should be 36');
  });

  it('times loop', function() {
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

    run(program, scope);

    assert.equal(output, 4, `output should be 4 not ${output}`);
  });

  it('function definition and usage', function() {
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
             result b(a(2), 3) +  a 1
             `),
      { functionNames: ['result'] }
    );

    var expected = Block([
      Assignment('a', Closure(['x'], BinaryOp('*', Variable('x'), Num(2)))),
      Assignment(
        'b',
        Closure(['x', 'y'], BinaryOp('+', Variable('x'), Variable('y')))
      ),
      Application('result', [
        BinaryOp(
          '+',
          Application('b', [Application('a', [Num(2)]), Num(3)]),
          Application('a', [Num(1)])
        )
      ])
    ]);

    assert.deepEqual(program, expected);

    run(program, scope);

    assert.equal(output, 9, `output should be 9 not ${output}`);
  });
});
