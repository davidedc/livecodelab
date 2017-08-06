/* global describe, it */

import parser from '../../src/grammar/lcl';
import { Assignment, Block, Str } from '../../src/js/lcl/ast';

import assert from 'assert';

describe('Do Once', function() {
  it('simple string assignment passes', function() {
    var program = 'a = "string"';
    var parsed = parser.parse(program);

    var expected = Block([Assignment('a', Str('string'))]);

    assert.deepEqual(parsed, expected);
  });

  it('string with whitespace passes', function() {
    var program = 'a = "string  sdf\tasdf"';
    var parsed = parser.parse(program);

    var expected = Block([Assignment('a', Str('string  sdf\tasdf'))]);

    assert.deepEqual(parsed, expected);
  });

  it('squote string with other dquote char passes', function() {
    var program = "a = 'stri\"asdf'";
    var parsed = parser.parse(program);

    var expected = Block([Assignment('a', Str('stri"asdf'))]);

    assert.deepEqual(parsed, expected);
  });

  it('dquote string with other squote char passes', function() {
    var program = 'a = "stri\'asdf"';
    var parsed = parser.parse(program);

    var expected = Block([Assignment('a', Str("stri'asdf"))]);

    assert.deepEqual(parsed, expected);
  });
});
