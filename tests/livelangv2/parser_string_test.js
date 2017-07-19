/* global describe, it */

var parser = require('../../src/grammar/lcl');
var ast = require('../../src/js/lcl/ast').Node;

var assert = require('assert');

describe('Do Once', function() {
  it('simple string assignment passes', function() {
    var program = 'a = "string"';
    var parsed = parser.parse(program);

    var expected = ast.Block([ast.Assignment('a', ast.Str('string'))]);

    assert.deepEqual(parsed, expected);
  });

  it('string with whitespace passes', function() {
    var program = 'a = "string  sdf\tasdf"';
    var parsed = parser.parse(program);

    var expected = ast.Block([
      ast.Assignment('a', ast.Str('string  sdf\tasdf'))
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('squote string with other dquote char passes', function() {
    var program = `a = 'stri"asdf'`;
    var parsed = parser.parse(program);

    var expected = ast.Block([ast.Assignment('a', ast.Str('stri"asdf'))]);

    assert.deepEqual(parsed, expected);
  });

  it('dquote string with other squote char passes', function() {
    var program = `a = "stri'asdf"`;
    var parsed = parser.parse(program);

    var expected = ast.Block([ast.Assignment('a', ast.Str("stri'asdf"))]);

    assert.deepEqual(parsed, expected);
  });
});
