/* global describe, it */

import parser from '../../src/grammar/lcl';

import { dedent } from 'dentist';

import assert from 'assert';

describe('Old Language tests', function() {
  it('example 1 from old language tests', function() {
    var program = dedent(`
                         animationStyle paintOver
                         noStroke
                         rand = () -> 255 * random
                         fill rand, 255 * random, 255 * random
                         50 times
                         \tresetMatrix
                         \tscale 0.4
                         \tmove 5-(random 10), 5-(random 10), 5-(random 10)
                         \tball
                         `);
    var parsed = parser.parse(program, {
      functionNames: [
        'animationStyle',
        'noStroke',
        'random',
        'resetMatrix',
        'scale',
        'move',
        'ball',
        'fill'
      ],
      inlinableFunctions: ['scale', 'move', 'ball']
    });

    assert.ok(parsed);
  });

  it('example 2 from old language tests', function() {
    var program = dedent(`
                         scale 2, wave rotate peg
                         \tscale ball
                         `);
    var parsed = parser.parse(program, {
      functionNames: ['scale', 'wave', 'peg', 'ball', 'rotate'],
      inlinableFunctions: ['scale', 'peg', 'ball', 'rotate']
    });

    assert.ok(parsed);
  });

  it('example 3 from old language tests', function() {
    var program = dedent(`
                         rotate noStroke fill 255*pulse,0,0, 255*pulse box
                         `);
    var parsed = parser.parse(program, {
      functionNames: ['rotate', 'noStroke', 'fill', 'pulse', 'box'],
      inlinableFunctions: ['rotate', 'noStroke', 'fill', 'box']
    });

    assert.ok(parsed);
  });

  it('example 4 from old language tests', function() {
    var program = dedent(`
                         a = <box 1>
                         b = <rotate ball>
                         a b
                         move
                         b a
                         `);
    var parsed = parser.parse(program, {
      functionNames: ['rotate', 'ball', 'box', 'move'],
      inlinableFunctions: ['rotate', 'ball', 'box', 'move']
    });

    assert.ok(parsed);
  });

  it('example 5 from old language tests', function() {
    var program = dedent(`
                         if random > 0.5 then box
                         2 times box
                         2 times rotate box
                         `);
    var parsed = parser.parse(program, {
      functionNames: ['rotate', 'ball', 'box', 'move'],
      inlinableFunctions: ['rotate', 'ball', 'box', 'move']
    });

    assert.ok(parsed);
  });
});
