/* global describe, it */

import parser from '../../src/app/languages/livelangv2/grammar';
import { Assignment, Block, Str } from '../../src/app/languages/livelangv2/ast';

import assert from 'assert';

describe('Parser - strings', function() {
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
