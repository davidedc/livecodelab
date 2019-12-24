/* global describe, it */

import assert from 'assert';

var Compiler = require('../../src/app/languages/livelangv1/compiler');
var GlobalScope = require('../../src/app/core/global-scope');

describe('V1 Compiler', function() {
  it('should identify sketches of just comments as empty', function() {
    var scope = new GlobalScope();
    var compiler = new Compiler({});

    var program = '//test comment\n\n//another comment\n';
    var output = compiler.compileCode(program, scope);

    assert.equal(output.status, 'empty');
  });
});
