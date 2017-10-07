/* global describe, it */

import parser from '../../src/grammar/lcl';

import { dedent } from 'dentist';

import assert from 'assert';

describe('Parser', function() {
  it('throws a suitable error with an assignment', function() {
    var program = dedent(`
                         a = 3 +
                         `);
    assert.throws(() => {
      parser.parse(program, {});
    }, parser.SyntaxError);
  });
});
