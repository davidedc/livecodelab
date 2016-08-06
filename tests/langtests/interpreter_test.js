var Interpreter = require('../../src/js/lcl/interpreter');
var parser      = require('../../src/generated/parser');

var dedent = require('dentist').dedent;

exports.programdata = {

  'evaluate simple expression': function (test) {
    var i = Interpreter;
    var result = {};
    var scope = {
      result: function (v) {
        result.v = v;
      }
    };
    var program = parser.parse(
      `result (3 + 4) * 2`,
      { functionNames: ['result']}
    );
    i.run(program, scope);

    test.equal(result.v, 14, 'should return 14');
    test.done();
  },

  'evaluate expression with variable': function (test) {
    var i = Interpreter;
    var result = {};
    var scope = {
      result: function (v) {
        result.v = v;
      },
      foo: 4
    };
    var program = parser.parse(
      dedent(`
             a = foo + 1
             result (a + 4) * foo`
            ),
      { functionNames: ['result']}
    );
    i.run(program, scope);

    test.equal(result.v, 36, 'output should be 36');
    test.done();

  },

  'times loop': function (test) {
    var i = Interpreter;
    var output;
    var scope = {
      result: function (value) {
        output = value;
      }
    };

    var program = parser.parse(
      dedent(`
             a = 0
             5 times with i
             \ta = a + i
             \tresult a
             `
            ),
      { functionNames: ['result']}
    );

    i.run(program, scope);

    test.equal(output, 4, 'output should be 4');
    test.done();

  },

  'function definition and usage': function (test) {
    var i = Interpreter;
    var output;
    var scope = {
      result: function (value) {
        output = value;
      }
    };

    var program = parser.parse(
      dedent(`
             //the first function
             a = (x) -> x * 2
             //another function
             b = (x, y) -> x + y
             c = a 1
             d = b(a(2), 3) + c
             result d
             `
            ),
      { functionNames: ['result']}
    );

    i.run(program, scope);

    test.equal(output, 9, 'output should be 9');
    test.done();

  }

};