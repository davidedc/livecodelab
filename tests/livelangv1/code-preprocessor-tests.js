/* global require, describe, it */

import assert from 'assert';

var CodePreprocessor = require('../../src/app/languages/livelangv1/code-preprocessor');

describe('V1 Code Preprocessor', function() {
  var testCases = [
    {
      notes:
        'An organic example which also\ntests whether multiple lines\nmangle things.',
      input:
        '5 times\n\trotate 0,1,time/5000\n\tmove 0.2,0,0\n\t3 times\n\t\trotate 1\n\t\tbox',
      expected:
        '5.times ->\n\trotate 0,1,time/5000\n\tmove 0.2,0,0\n\t3.times ->\n\t\trotate 1\n\t\tbox()',
    },
    {
      notes:
        "Should give error as 'times'\nis missing how many times the\nloop has to go for",
      input: '// should give error\npeg\ntimes\n\tbox 2',
      error: 'how many times?',
    },
    {
      notes:
        "Should give error as 'times'\nis missing how many times the\nloop has to go for",
      input: '// should give error\ntimes\n\tbox',
      error: 'how many times?',
    },
    {
      notes:
        "Should give error as 'times'\nis missing how many times the\nloop has to go for",
      input: '// should give error\npeg times rotate box 2* wave',
      error: 'how many times?',
    },
    {
      notes:
        "Should give error as 'times'\nis missing how many times the\nloop has to go for",
      input: '// should give error\nif true then  times do that',
      error: 'how many times?',
    },
    {
      notes:
        "Should give error as 'times'\nis missing how many times the\nloop has to go for",
      input:
        '// should give error\nif random() > 0.5 then rotate box else times rotate peg true',
      error: 'how many times?',
    },
    {
      notes:
        'Checking that times finds its "number of loops"\nexpression correctly.',
      input: 'a = 2\nbox a + 3 times rotate peg',
      expected: 'a = 2\nbox -> (a + 3).times -> rotate peg',
    },
    {
      notes: 'Checking "qualifying" rotate',
      input: '6 times: rotate box',
      expected: '6.times -> rotate box',
    },
    {
      notes:
        'Checking "qualifying" rotate and times within\na function definition',
      input: 'myFunc = -> 20 times rotate box',
      expected: 'myFunc = -> 20.times -> rotate box',
    },
    {
      notes:
        'Checking "qualifying" rotate and times within\nif within a function definition with arguments',
      input: 'myFunc = (a,b) -> if true then 20 times rotate box',
      expected: 'myFunc = (a,b) -> if true then 20.times -> rotate box',
    },
    {
      notes: 'Checking multiple times within if then statement',
      input: 'if true then 2 times box 3 times line 2',
      expected: 'if true then 2.times -> box -> 3.times -> line 2',
    },
    {
      notes:
        'Checking that separate rotate and primitive\nwithin a times body remain correctly separated.',
      input: '6 times: rotate box',
      expected: '6.times -> rotate box',
    },
    {
      notes: 'Qualifying rotate within an indented "times" body',
      input: '6 times:\n\trotate box',
      expected: '6.times ->\n\trotate box',
    },
    {
      input: '1+1 times: rotate box',
      expected: '(1+1).times -> rotate box',
    },
    {
      input: 'peg 2 times rotate box 2* wave',
      expected: 'peg -> 2.times -> rotate -> box 2* wave()',
    },
    {
      input: 'n = 2 n times: rotate box',
      expected: 'n = 2; n.times -> rotate box',
    },
    {
      input: 'n = 2 (n+0).times rotate box()',
      expected: 'n = 2; (n+0).times -> rotate box',
    },
    {
      input: 'n = 2 rotate(n+0) rotate() box()',
      expected: 'n = 2; rotate(n+0); rotate(); box()',
    },
    {
      input: 'n = 2 rotate n + 1 box',
      expected: 'n = 2; rotate n + 1, box',
    },
    {
      input: 'box box   2 times: rotate peg 1.3',
      expected: 'box -> box -> 2.times -> rotate -> peg 1.3',
    },
    {
      input:
        'if random > 0.5 then 3 times: rotate box else 3 times rotate 2 times: peg 1',
      expected:
        'if random() > 0.5 then 3.times -> rotate box else 3.times -> rotate -> 2.times -> peg 1',
    },
    {
      input: 'if true then 3 times rotate box',
      expected: 'if true then 3.times -> rotate box',
    },
    {
      input: '(9+0).times -> rotate box',
      expected: '(9+0).times -> rotate box',
    },
    {
      input: 'if random() > 0.5 then rotate box else 3 times rotate peg 1',
      expected:
        'if random() > 0.5 then rotate box else 3.times -> rotate -> peg 1',
    },
    {
      input:
        'if random() > 0.5 then rotate 1 + wave box else 3 times rotate peg 1',
      expected:
        'if random() > 0.5 then rotate 1 + wave(), box else 3.times -> rotate -> peg 1',
    },
    {
      input:
        '// testing whether mangled accross multiple lines\nif random() > 0.5 then box\n2 times: box\n2 times: rotate box',
      expected:
        '\nif random() > 0.5 then box()\n2.times box\n2.times -> rotate box',
    },
    {
      input:
        '// testing whether mangled accross multiple lines\n6 times: rotate box\n6 times:\n\trotate box',
      expected: '\n6.times -> rotate box\n6.times ->\n\trotate box',
    },
    {
      input: 'ab',
      expected: 'ab',
    },
    {
      input: 'ball line peg',
      expected: 'ball -> line peg',
    },
    {
      input: 'box',
      expected: 'box()',
    },
    {
      input: '2 times rotate box wave wave',
      expected: '2.times -> rotate -> box wave wave()',
    },
    {
      notes: 'we should give an error in these cases',
      input: 'box + box',
      expected: 'box +, box',
    },
    {
      input: 'wave wave wave',
      expected: 'wave wave wave()',
    },
    {
      input: 'if wave then box wave else wave',
      expected: 'if wave() then box wave() else wave()',
    },
    {
      input: 'if wave then box + wave else wave',
      expected: 'if wave() then box + wave() else wave()',
    },
    {
      input: 'wave',
      expected: 'wave()',
    },
    {
      input: 'wave + wave',
      expected: 'wave + wave()',
    },
    {
      input: 'a = wave + wave',
      expected: 'a = wave() + wave()',
    },
    {
      input: '(wave + wave)',
      expected: '(wave() + wave())',
    },
    {
      input: 'wave',
      expected: 'wave()',
    },
    {
      input: 'if random() > 0.5 then box',
      expected: 'if random() > 0.5 then box()',
    },
    {
      input: '2 times: box',
      expected: '2.times box',
    },
    {
      input: '2 times: rotate box',
      expected: '2.times -> rotate box',
    },
    {
      input: '2 times rotate box wave',
      expected: '2.times -> rotate -> box wave()',
    },
    {
      input: 'rotate box 2,33',
      expected: 'rotate -> box 2,33',
    },
    {
      input: 'box wave',
      expected: 'box wave()',
    },
    {
      input: 'box wave 3',
      expected: 'box wave 3',
    },
    {
      input: '2 times: rotate box wave',
      expected: '2.times -> rotate -> box wave()',
    },
    {
      input: 'if rotate wave then rotate wave else rotate wave',
      expected: 'if rotate wave() then rotate wave() else rotate wave()',
    },
    {
      input: '2 times: move rotate wave box',
      expected: '2.times -> move -> rotate wave(), box',
    },
    {
      input: 'rotate wave box',
      expected: 'rotate wave(), box',
    },
    {
      input: 'box -1',
      expected: 'box -1',
    },
    {
      input: 'box - 1',
      expected: 'box - 1',
    },
    {
      input: 'a = box -1',
      expected: 'a = box -1',
    },
    {
      input: 'a = box - 1',
      expected: 'a = box - 1',
    },
    {
      input: 'wave -1',
      expected: 'wave -1',
    },
    {
      input: 'wave - 1',
      expected: 'wave - 1',
    },
    {
      input: 'a = wave - 1',
      expected: 'a = wave() - 1',
    },
    {
      input: 'box wave + 1',
      expected: 'box wave() + 1',
    },
    {
      input: 'box wave +1',
      expected: 'box wave +1',
    },
    {
      input: 'box wave -1',
      expected: 'box wave -1',
    },
    {
      input: 'box wave *1',
      expected: 'box wave() *1',
    },
    {
      input: 'box wave /1',
      expected: 'box wave() /1',
    },
    {
      input: 'box wave * 1',
      expected: 'box wave() * 1',
    },
    {
      input: 'box wave / 1',
      expected: 'box wave() / 1',
    },
    {
      input: 'box wave +wave',
      expected: 'box wave +wave()',
    },
    {
      input: 'box wave+wave',
      expected: 'box wave()+wave()',
    },
    {
      input: 'rotate wave times box',
      expected: 'rotate -> (wave()).times box',
    },
    {
      input: 'rotate 10*wave times box',
      expected: 'rotate -> (10*wave()).times box',
    },
    {
      input: 'rotate 10 * wave times box',
      expected: 'rotate -> (10 * wave()).times box',
    },
    {
      input: 'rotate wave * wave times box',
      expected: 'rotate -> (wave() * wave()).times box',
    },
    {
      input: 'rotates waves * waves timess boxs',
      expected: 'rotates waves * waves timess boxs',
    },
    {
      input: 'rotate wave*wave times box',
      expected: 'rotate -> (wave()*wave()).times box',
    },
    {
      input: 'rotate wave*wave\nbox',
      expected: 'rotate wave()*wave()\nbox()',
    },
    {
      input: 'rotate 2 times box',
      expected: 'rotate -> 2.times box',
    },
    {
      notes: 'There are two ways to interpret this,\nwe pick one',
      input: 'rotate wave 2 times box',
      expected: 'rotate -> (wave 2).times box',
    },
    {
      input: 'rotate wave + 2 times box',
      expected: 'rotate -> (wave() + 2).times box',
    },
    {
      input: 'box 2 times box',
      expected: 'box -> 2.times box',
    },
    {
      input: '2 times 3 times box',
      expected: '2.times -> 3.times box',
    },
    {
      input: '2 times 3 times 4 times box',
      expected: '2.times -> 3.times -> 4.times box',
    },
    {
      input: '2 times box 3 times line 2',
      expected: '2.times -> box -> 3.times -> line 2',
    },
    {
      input: 'box(wave)',
      expected: 'box(wave())',
    },
    {
      input: 'box(wave,wave)',
      expected: 'box(wave(),wave())',
    },
    {
      input: 'box(wave,wave,wave)',
      expected: 'box(wave(),wave(),wave())',
    },
    {
      input: 'a=wave+wave+wave',
      expected: 'a = wave()+wave()+wave()',
    },
    {
      input: 'rotate box peg line',
      expected: 'rotate -> box -> peg line',
    },
    {
      input: 'rotate 2 box peg line',
      expected: 'rotate 2, -> box -> peg line',
    },
    {
      input: 'rotate 2 + n box peg line',
      expected: 'rotate 2 + n, -> box -> peg line',
    },
    {
      input: 'rotate 2 + time box peg line',
      expected: 'rotate 2 + time, -> box -> peg line',
    },
    {
      input: 'for i in [0...wave * 2]',
      expected: 'for i in [0...wave() * 2]',
    },
    {
      input: 'for i in [0...2*wave]',
      expected: 'for i in [0...2*wave()]',
    },
    {
      input:
        'either = (a,b) -> if random > 0.5 then a() else b()\nrotate box, peg',
      expected:
        'either = (a,b) -> if random() > 0.5 then a() else b()\nrotate box, peg',
    },
    {
      input:
        'scale 0.3\na = 3\nmove rotate scale 3 box peg line 2\nmove 0.1 peg move 0.4 box',
      expected:
        'scale 0.3\na = 3\nmove -> rotate -> scale 3, -> box -> peg -> line 2\nmove 0.1, -> peg -> move 0.4, box',
    },
    {
      input: 'noFill\nfor i in [1..20]\n\trotate time/100000\n\tbox i/8',
      expected: 'noFill()\nfor i in [1..20]\n\trotate time/100000\n\tbox i/8',
    },
    {
      input: 'noFill\nfor i in [1..20] by 5\n\trotate time/100000\n\tbox i/8',
      expected:
        'noFill()\nfor i in [1..20] by 5\n\trotate time/100000\n\tbox i/8',
    },
    {
      input:
        '// yo dawg I heard you like balls so I put a ball inside a ball so you can see balls inside balls\nnoFill\nsizes = [1..3]\nball size for size in sizes when size isnt 3',
      expected:
        '\nnoFill()\nsizes = [1..3]\nball size for size in sizes when size isnt 3',
    },
    {
      input: 'noFill\n20.times (i) ->\n\trotate time/100000\n\tbox i/8',
      expected:
        'noFill()\n20.timesWithVariable (i) ->\n\trotate time/100000\n\tbox i/8',
    },
    {
      input:
        "scale 0.1\nshapes = 'box': 1, 'ball': 2, 'peg': 3\n\nfor shape, size of shapes\n\tmove 2\n\teval(shape+\"(\" + size+\")\")",
      expected:
        "scale 0.1\nshapes = 'box': 1, 'ball': 2, 'peg': 3\n\nfor shape, size of shapes\n\tmove 2\n\teval(shape+\"(\" + size+\")\")",
    },
    {
      input: 'd = 2\nscale 2, d box b, c',
      expected: 'd = 2\nscale 2, d, -> box b, c',
    },
    {
      input: 'd = -> 2\nscale 2, d box b, c',
      expected: 'd = -> 2\nscale 2, d(), -> box b, c',
    },
    {
      input: 'a = 2\nscale 2, a box b, c',
      expected: 'a = 2\nscale 2, a, -> box b, c',
    },
    {
      input:
        'either = (a,b) -> if random > 0.5 then a() else b()\neither (->box), (->peg)',
      expected:
        'either = (a,b) -> if random() > 0.5 then a() else b()\neither (-> box()), (-> peg())',
    },
    {
      input:
        'either = (a,b) -> if random > 0.5 then a() else b()\neither <box>, <peg>',
      expected:
        'either = (a,b) -> if random() > 0.5 then a() else b()\neither box, peg',
      notIdempotent: true,
      failsMootAppends: true,
    },
    {
      input:
        'either = (a,b) -> if random > 0.5 then a() else b()\neither <box 2>, <peg 2>',
      expected:
        'either = (a,b) -> if random() > 0.5 then a() else b()\neither ((parametersForBracketedFunctions) -> (box 2, -> (if parametersForBracketedFunctions? then parametersForBracketedFunctions() else null))), ((parametersForBracketedFunctions) -> (peg 2, -> (if parametersForBracketedFunctions? then parametersForBracketedFunctions() else null)))',
      failsMootAppends: true,
    },
    {
      input:
        'either = (a,b) -> if random > 0.5 then a() else b()\neither (->box),(->rect)',
      expected:
        'either = (a,b) -> if random() > 0.5 then a() else b()\neither (-> box()),(-> rect())',
    },
    {
      input: 'rand = (arg) -> random(arg)\nbox (rand 2) ball 2',
      expected: 'rand = (arg) -> random(arg)\nbox (rand 2), -> ball 2',
    },
    {
      input:
        'animationStyle paintOver\nnoStroke\nrand = -> 255*random\nfill rand, 255*random, 255*random\n50 times\n\tresetMatrix\n\tscale 0.4\n\tmove 5-(random 10), 5-(random 10), 5-(random 10)\n\tball',
      expected:
        'animationStyle paintOver\nnoStroke()\nrand = -> 255*random()\nfill rand(), 255*random(), 255*random()\n50.times ->\n\tresetMatrix()\n\tscale 0.4\n\tmove 5-(random 10), 5-(random 10), 5-(random 10)\n\tball()',
    },
    {
      input: 'scale rotate box 2 peg 2.3',
      expected: 'scale -> rotate -> box 2, -> peg 2.3',
    },
    {
      input: 'rotate box peg 1.1',
      expected: 'rotate -> box -> peg 1.1',
    },
    {
      input: 'rotate box peg 1.1',
      expected: 'rotate -> box -> peg 1.1',
    },
    {
      input: 'rotate box rotate line 2',
      expected: 'rotate -> box -> rotate -> line 2',
    },
    {
      input: 'rotate box line 2',
      expected: 'rotate -> box -> line 2',
    },
    {
      input: 'rotate rotate rotate rotate box line 2',
      expected: 'rotate -> rotate -> rotate -> rotate -> box -> line 2',
    },
    {
      input: '2 times rotate box line 2',
      expected: '2.times -> rotate -> box -> line 2',
    },
    {
      input: 'rotate rotate box',
      expected: 'rotate -> rotate box',
    },
    {
      input: '10 times rotate scale box',
      expected: '10.times -> rotate -> scale box',
    },
    {
      input:
        'rotate time/1000\n✓doOnce\n\tbackground 255\n\tfill 255,0,0\n✓doOnce ball\nbox',
      expected:
        'rotate time/1000\nif false\n\tbackground 255\n\tfill 255,0,0\nnoOperation\nbox()',
    },
    {
      input: 'line\n✓doOnce\n\tbox 1\n\nline\n✓doOnce //\n\tbox 1',
      expected: 'line()\nif false\n\tbox 1\n\nline()\nif false\n\tbox 1',
    },
    {
      input: 'line\n✓doOnce\n\tbox 1\n\nline\n✓doOnce//\n\tbox 1',
      expected: 'line()\nif false\n\tbox 1\n\nline()\nif false\n\tbox 1',
    },
    {
      input:
        'rotate time\n✓doOnce\n\tbackground 255\n\tfill 255,0,0\nif true\n\t✓doOnce ball\nbox',
      expected:
        'rotate time\nif false\n\tbackground 255\n\tfill 255,0,0\nif true\n\tnoOperation\nbox()',
    },
    {
      input:
        'rotate time/1000\ndoOnce\n\tbackground 255\n\tfill 255,0,0\ndoOnce ball\nbox',
      expected:
        'rotate time/1000\n1.times ->\n\taddDoOnce(1); background 255\n\tfill 255,0,0\naddDoOnce(4); 1.times ball\nbox()',
    },
    {
      input:
        'rotate time/1000\ndoOnce\n\t// test\n\tbackground 255\n\tfill 255,0,0\n✓doOnce -> ball\nbox',
      expected:
        'rotate time/1000\n1.times ->\n\taddDoOnce(1)\n\tbackground 255\n\tfill 255,0,0\nnoOperation\nbox()',
    },
    {
      input: 'move peg 1.2 move box',
      expected: 'move -> peg 1.2, -> move box',
    },
    {
      input: 'rotate\n\tbox\npeg',
      expected: 'rotate ->\n\tbox()\npeg()',
    },
    {
      input: 'rotate 2\n\tbox\npeg',
      expected: 'rotate 2, ->\n\tbox()\npeg()',
    },
    {
      input:
        'rotate\nrotate 2,1,0\n\tbox\n\trotate 1\n\t\tline 3\n\t\tmove\n\t\trotate\n\t\t\tball 0.6',
      expected:
        'rotate()\nrotate 2,1,0, ->\n\tbox()\n\trotate 1, ->\n\t\tline 3\n\t\tmove()\n\t\trotate ->\n\t\t\tball 0.6',
    },
    {
      notes:
        'A complex case with nested if then else and\nfunction definition.',
      input:
        'if true then if true then a = -> ball if true then a = -> rect else line ball\na',
      expected:
        'if true then if true then a = -> ball(); if true then a = -> rect() else line ball\na()',
    },
    {
      notes: "Check that qualifiers don't span over else",
      input: 'if true then move rotate box else move line',
      expected: 'if true then move -> rotate box else move line',
    },
    {
      notes:
        'Some times nested in ifs. The final js,\nconsistently with coffeescript, is:\n  if (true) {\n    2..times(function() {\n      box();\n      return line();\n    });\n  } else {\n    peg();\n  }                   ',
      input: 'if true then 2 times box line else peg',
      expected: 'if true then 2.times -> box line else peg()',
    },
    {
      notes:
        'Some more "times nested in ifs". The final js,\nconsistently with coffeescript, is:\nif (true) {\n  2..times(function() {\n    box();\n    if (true) {\n      return 2..times(function() {\n        return rect();\n      });\n    }\n  });\n} else {\n  2..times(function() {\n    peg();\n    return ball();',
      input:
        'if true then 2 times box if true then 2 times rect else 2 times peg ball',
      expected:
        'if true then 2.times box; if true then 2.times rect else 2.times -> peg ball',
    },
    {
      notes: '                 ',
      input: '2 times if true then ball',
      expected: '2.times -> if true then ball()',
    },
    {
      notes: '                 ',
      input: '2 times if true then ball',
      expected: '2.times -> if true then ball()',
    },
    {
      notes:
        'note that you cannot have anonymous\nfunctions in the test in coffeescript,\ni.e. pasting the "expected" below\ninto coffeescript gives an error',
      input: 'if 2 times a then ball',
      expected: 'if 2.times -> a then ball()',
    },
    {
      notes: "this example doesn't mean anything\nmeaningful...",
      input: 'if (2 times a) then ball',
      expected: 'if (2.times -> a) then ball()',
    },
    {
      notes: 'times and qualifiers within an if-then-else',
      input: 'if random < 0.5 then 2 times rotate box else 3 times move peg',
      expected:
        'if random() < 0.5 then 2.times -> rotate box else 3.times -> move peg',
    },
    {
      notes: '                 ',
      input: 'peg move\n\tbox\npeg',
      expected: 'peg -> move ->\n\tbox()\npeg()',
    },
    {
      notes: '                 ',
      input:
        'a = 3\nrotate 2,a+1+3*(a*2.32+Math.PI) 2+a+Math.PI times box\npeg',
      expected:
        'a = 3\nrotate 2,a+1+3*(a*2.32+Math.PI), -> (2+a+Math.PI).times box\npeg()',
    },
    {
      notes: '                 ',
      input: 'rotate move scale 2 times box',
      expected: 'rotate -> move -> scale -> 2.times box',
    },
    {
      notes: '                 ',
      input:
        'if true then rotate move scale box else rotate move scale 2 times box',
      expected:
        'if true then rotate -> move -> scale box else rotate -> move -> scale -> 2.times box',
    },
    {
      notes: '                 ',
      input:
        'if true then rotate move scale 2 times box else rotate move scale box',
      expected:
        'if true then rotate -> move -> scale -> 2.times box else rotate -> move -> scale box',
    },
    {
      notes: '                 ',
      input: 'if true then scale rotate else scale rotate 2 times move',
      expected:
        'if true then scale rotate else scale -> rotate -> 2.times move',
    },
    {
      notes:
        "a long chain of matrix operations will tell\nwhether there are some trandformations that\ndon't quite complete their job.",
      input:
        'if true then rotate move scale scale scale scale move move rotate rotate box else rotate move scale scale scale scale move move rotate rotate 2 times box',
      expected:
        'if true then rotate -> move -> scale -> scale -> scale -> scale -> move -> move -> rotate -> rotate box else rotate -> move -> scale -> scale -> scale -> scale -> move -> move -> rotate -> rotate -> 2.times box',
    },
    {
      notes:
        'note that\n  scale(3)},{(-> box());\nwould give error in coffeescript',
      input: 'scale (3) box\nball',
      expected: 'scale (3), box\nball()',
    },
    {
      notes: '                 ',
      input: 'scale(3) box\nball',
      expected: 'scale(3); box()\nball()',
    },
    {
      notes: '                 ',
      input: 'scale 2, box',
      expected: 'scale 2, box',
    },
    {
      notes: '                 ',
      input: 'scale 2,box',
      expected: 'scale 2, box',
    },
    {
      notes: '                 ',
      input: 'scale 2, -> box',
      expected: 'scale 2, box',
    },
    {
      notes: '                 ',
      input: 'scale 2, ->box',
      expected: 'scale 2, box',
    },
    {
      notes: '                 ',
      input: 'scale 2,->box',
      expected: 'scale 2, box',
    },
    {
      notes: '                 ',
      input: 'rotate 1 + wave, -> box',
      expected: 'rotate 1 + wave(), box',
    },
    {
      notes: '                 ',
      input: 'localMaterial <box peg 1.1, time rotate ball>',
      expected:
        'localMaterial ((parametersForBracketedFunctions) -> (box -> peg 1.1, time, -> rotate -> ball -> (if parametersForBracketedFunctions? then parametersForBracketedFunctions() else null)))',
      failsMootAppends: true,
    },
    {
      notes: '                 ',
      input:
        'a = 2\n\nrotate 2 times box box\nrotate 2 2+2*2 times box\nrotate 2,a 2+2*2 times box\nrotate a+1+3 2 times box\nrotate 2 2 times box\nrotate 2,a+1+3*(a*2.32+Math.PI) 2+a+Math.PI times box\nbox a + 3 times rotate peg\n2 times box\n1+1 times box\npeg 2 times box\nn = 2 n times: box\nrotate wave times box\nrotate 10*wave times box\nrotate 10 * wave times box\nwave wave times box\nrotate wave wave times box\n\nif true then rotate 2 times box box\nif true then rotate 2 2+2*2 times box\nif true then rotate 2,a 2+2*2 times box\nif true then rotate a+1+3 2 times box\nif true then rotate 2 2 times box\nif true then rotate 2,a+1+3*(a*2.32+Math.PI) 2+a+Math.PI times box\nif true then box a + 3 times rotate peg\nif true then 2 times box\nif true then 1+1 times box\nif true then peg 2 times box\nif true then n = 2 n times: box\nif true then rotate wave times box\nif true then rotate 10*wave times box\nif true then rotate 10 * wave times box\nif true then wave wave times box\nif true then rotate wave wave times box\n\nif true then rotate 2 times box box else rotate 2 times box box\nif true then rotate 2 2+2*2 times box else rotate 2 2+2*2 times box\nif true then rotate 2,a 2+2*2 times box else rotate 2,a 2+2*2 times box\nif true then rotate a+1+3 2 times box else rotate a+1+3 2 times box\nif true then rotate 2 2 times box else rotate 2 2 times box\nif true then rotate 2,a+1+3*(a*2.32+Math.PI) 2+a+Math.PI times box else rotate 2,a+1+3*(a*2.32+Math.PI) 2+a+Math.PI times box\nif true then box a + 3 times rotate peg else box a + 3 times rotate peg\nif true then 2 times box else 2 times box\nif true then 1+1 times box else 1+1 times box\nif true then peg 2 times box else peg 2 times box\nif true then n = 2 n times: box else n = 2 n times: box\nif true then rotate wave times box else rotate wave times box\nif true then rotate 10*wave times box else rotate 10*wave times box\nif true then rotate 10 * wave times box else rotate 10 * wave times box\nif true then wave wave times box else wave wave times box\nif true then rotate wave wave times box else rotate wave wave times box                   ',
      expected:
        'a = 2\n\nrotate -> 2.times -> box box\nrotate 2, -> (2+2*2).times box\nrotate 2,a, -> (2+2*2).times box\nrotate a+1+3, -> 2.times box\nrotate 2, -> 2.times box\nrotate 2,a+1+3*(a*2.32+Math.PI), -> (2+a+Math.PI).times box\nbox -> (a + 3).times -> rotate peg\n2.times box\n(1+1).times box\npeg -> 2.times box\nn = 2; n.times box\nrotate -> (wave()).times box\nrotate -> (10*wave()).times box\nrotate -> (10 * wave()).times box\n(wave wave()).times box\nrotate -> (wave wave()).times box\n\nif true then rotate -> 2.times -> box box\nif true then rotate 2, -> (2+2*2).times box\nif true then rotate 2,a, -> (2+2*2).times box\nif true then rotate a+1+3, -> 2.times box\nif true then rotate 2, -> 2.times box\nif true then rotate 2,a+1+3*(a*2.32+Math.PI), -> (2+a+Math.PI).times box\nif true then box -> (a + 3).times -> rotate peg\nif true then 2.times box\nif true then (1+1).times box\nif true then peg -> 2.times box\nif true then n = 2; n.times box\nif true then rotate -> (wave()).times box\nif true then rotate -> (10*wave()).times box\nif true then rotate -> (10 * wave()).times box\nif true then (wave wave()).times box\nif true then rotate -> (wave wave()).times box\n\nif true then rotate -> 2.times -> box box else rotate -> 2.times -> box box\nif true then rotate 2, -> (2+2*2).times box else rotate 2, -> (2+2*2).times box\nif true then rotate 2,a, -> (2+2*2).times box else rotate 2,a, -> (2+2*2).times box\nif true then rotate a+1+3, -> 2.times box else rotate a+1+3, -> 2.times box\nif true then rotate 2, -> 2.times box else rotate 2, -> 2.times box\nif true then rotate 2,a+1+3*(a*2.32+Math.PI), -> (2+a+Math.PI).times box else rotate 2,a+1+3*(a*2.32+Math.PI), -> (2+a+Math.PI).times box\nif true then box -> (a + 3).times -> rotate peg else box -> (a + 3).times -> rotate peg\nif true then 2.times box else 2.times box\nif true then (1+1).times box else (1+1).times box\nif true then peg -> 2.times box else peg -> 2.times box\nif true then n = 2; n.times box else n = 2; n.times box\nif true then rotate -> (wave()).times box else rotate -> (wave()).times box\nif true then rotate -> (10*wave()).times box else rotate -> (10*wave()).times box\nif true then rotate -> (10 * wave()).times box else rotate -> (10 * wave()).times box\nif true then (wave wave()).times box else (wave wave()).times box\nif true then rotate -> (wave wave()).times box else rotate -> (wave wave()).times box',
    },
    {
      notes: '                 ',
      input:
        'a = 0\naf = -> 0\nb = true\nbf = -> true\nif a == 0 then line a\nif a != 0 then line a\nif a >= 0 then line a\nif a <= 0 then line a\nif af == 0 then line a\nif af != 0 then line a\nif af >= 0 then line a\nif af <= 0 then line a\nif b and true then line a\nif b or true then line a\nif not b then line a\nif ! b then line a\nif !b then line a\nif bf and true then line a\nif bf or true then line a\nif not bf then line a\nif ! bf then line a\nif !bf then line a',
      expected:
        'a = 0\naf = -> 0\nb = true\nbf = -> true\nif a == 0 then line a\nif a != 0 then line a\nif a >= 0 then line a\nif a <= 0 then line a\nif af() == 0 then line a\nif af() != 0 then line a\nif af() >= 0 then line a\nif af() <= 0 then line a\nif b and true then line a\nif b or true then line a\nif not b then line a\nif ! b then line a\nif !b then line a\nif bf() and true then line a\nif bf() or true then line a\nif not bf() then line a\nif ! bf() then line a\nif !bf() then line a',
    },
    {
      notes: '                 ',
      input: 'myBoxFunc = <box>\nrotate -> myBoxFunc 1, 2, 3',
      expected: 'myBoxFunc = box\nrotate -> myBoxFunc 1, 2, 3',
      notIdempotent: true,
      failsMootAppends: true,
    },
    {
      notes: '                 ',
      input: 'myBoxFunc = <box>\nrotate\n\tmyBoxFunc 1, 2, 3',
      expected: 'myBoxFunc = box\nrotate ->\n\tmyBoxFunc 1, 2, 3',
      notIdempotent: true,
      failsMootAppends: true,
    },
    {
      notes: '                 ',
      input: 'myBoxFunc = -> <box>\nrotate myBoxFunc 1, 2, 3',
      expected: 'myBoxFunc = -> box\nrotate myBoxFunc 1, 2, 3',
      notIdempotent: true,
      failsMootAppends: true,
    },
    {
      notes: '                 ',
      input: 'myBoxFunc = (a,b,c) -> box a,b,c\nrotate -> myBoxFunc 1, 2, 3',
      expected: 'myBoxFunc = (a,b,c) -> box a,b,c\nrotate -> myBoxFunc 1, 2, 3',
    },
    {
      notes: '                 ',
      input: 'myBoxFunc = (a,b,c) -> -> box a,b,c\nrotate myBoxFunc 1, 2, 3',
      expected: 'myBoxFunc = (a,b,c) -> -> box a,b,c\nrotate myBoxFunc 1, 2, 3',
    },
    {
      notes: '                 ',
      input: 'myBoxFunc = (a,b,c) -> box a,b,c\nrotate\n\tmyBoxFunc 1, 2, 3',
      expected:
        'myBoxFunc = (a,b,c) -> box a,b,c\nrotate ->\n\tmyBoxFunc 1, 2, 3',
    },
    {
      notes: '                 ',
      input:
        'flickr = (code) -> if random < 0.5 then code()\nflickr <box peg 1.1 2 times rotate ball>',
      expected:
        'flickr = (code) -> if random() < 0.5 then code()\nflickr ((parametersForBracketedFunctions) -> (box -> peg 1.1, -> 2.times -> rotate -> ball -> (if parametersForBracketedFunctions? then parametersForBracketedFunctions() else null)))',
      failsMootAppends: true,
    },
    {
      notes: '                 ',
      input: 'sin time*10 times\n\tbox',
      expected: '(sin time*10).times ->\n\tbox()',
    },
    {
      notes: '                 ',
      input: '(sin time*10) times\n\tbox',
      expected: '(sin time*10).times ->\n\tbox()',
    },
    {
      notes: '                 ',
      input: 'time*100 % 1 times\n\tbox',
      expected: '(time*100 % 1).times ->\n\tbox()',
    },
    {
      notes: '                 ',
      input: 'round(wave 0.5) times\n\tbox',
      expected: '(round(wave 0.5)).times ->\n\tbox()',
    },
    {
      notes: '                 ',
      input: 'myF = (a)-> sin time*a\n\nmyF 2 times\n\tbox',
      expected: 'myF = (a) -> sin time*a\n\n(myF 2).times ->\n\tbox()',
      failsMootAppends: true,
      failsMootPrepends: true,
    },
    {
      notes: '                 ',
      input: 'myF = ()-> sin time*2\n\nmyF 2 times\n\tbox',
      expected: 'myF = () -> sin time*2\n\nmyF(); 2.times ->\n\tbox()',
    },
    {
      notes: '                 ',
      input: 'myF = -> sin time*2\n\nmyF 2 times\n\tbox',
      expected: 'myF = -> sin time*2\n\nmyF(); 2.times ->\n\tbox()',
    },
    {
      notes: '                 ',
      input: 'myF = (a)-> sin time*2\nb = myF +4',
      expected: 'myF = (a) -> sin time*2\nb = myF +4',
    },
    {
      notes:
        "note that this example would translate\ncorrectly but it wouldn't work. the translation\nis exactly the same that one would get with\ncoffeescript",
      input: 'myF = ()-> sin time*2\nb = myF -4',
      expected: 'myF = () -> sin time*2\nb = myF -4',
    },
    {
      notes:
        "note that this example would translate\ncorrectly but it wouldn't work. the translation\nis exactly the same that one would get with\ncoffeescript. See example below for a program\nthat indeed would work.",
      input: 'myF = -> sin time*2\nb = myF -4',
      expected: 'myF = -> sin time*2\nb = myF -4',
    },
    {
      input: 'myF = -> sin time*2\nb = myF - 4',
      expected: 'myF = -> sin time*2\nb = myF() - 4',
    },
    {
      notes: '                 ',
      input: 'rotate 1\nrotate (wave 0.5) * 0.1 box 2',
      expected: 'rotate 1\nrotate (wave(0.5) * 0.1), -> box 2',
    },
    {
      notes: '                 ',
      input: 'a = (val) -> val * 2\nrotate 3, a 1 box 3, 4, a 1',
      expected: 'a = (val) -> val * 2\nrotate 3, a(1), -> box 3, 4, a 1',
    },
    {
      notes: '                 ',
      input: 'a = (val) -> val * 2\nrotate 3, wave wave 2 box 3, 4, a 1',
      expected:
        'a = (val) -> val * 2\nrotate 3, wave(wave(2)), -> box 3, 4, a 1',
    },
    {
      notes: '                 ',
      input: 'a = (val) -> val * 2\nrotate 3, wave pulse / 10 box 3, 4, a 1',
      expected:
        'a = (val) -> val * 2\nrotate 3, wave(pulse() / 10), -> box 3, 4, a 1',
    },
    {
      notes: '                 ',
      input: 'rotate 3 scale 2 box 3, 4',
      expected: 'rotate 3, -> scale 2, -> box 3, 4',
    },
    {
      notes:
        'Code blocks being passed to a function,\none accepting a parameter and the other one\nreturning a value',
      input:
        'either = (a,b) -> if random > 0.5 then a 2 else b()\nconsole.log either <box>, <random>',
      expected:
        'either = (a,b) -> if random() > 0.5 then a 2 else b()\nconsole.log either box, random',
      notIdempotent: true,
      failsMootAppends: true,
      failsMootPrepends: true,
    },
    {
      notes: '                 ',
      input: 'noFill\nfill red stroke white rect\nball',
      expected: 'noFill()\nfill red, -> stroke white, rect\nball()',
      failsMootAppends: true,
      failsMootPrepends: true,
    },
    {
      notes: 'checking that comments on the last line\nare properly stripped',
      input:
        'either = (a,b) -> if random > 0.5 then a() else b() // ouch\neither <box>, <peg> //ouch',
      expected:
        'either = (a,b) -> if random() > 0.5 then a() else b() \neither box, peg ',
      notIdempotent: true,
      failsMootAppends: true,
      failsMootPrepends: true,
    },
    {
      notes: '                 ',
      input: 'red box',
      expected: 'fill red, box',
      failsMootAppends: true,
      failsMootPrepends: true,
    },
    {
      notes: '                 ',
      input: 'rotate red box\nrotate  red box',
      expected: 'rotate -> fill red, box\nrotate -> fill red, box',
      failsMootAppends: true,
      failsMootPrepends: true,
    },
    {
      notes: '                 ',
      input: 'line red box',
      expected: 'line -> fill red, box',
      failsMootAppends: true,
      failsMootPrepends: true,
    },
    {
      notes: 'solid red box even when you change\nthe number',
      input: 'fill red,22 red box',
      expected: 'fill red,22, -> fill red, box',
      failsMootAppends: true,
      failsMootPrepends: true,
    },
    {
      notes: '                 ',
      input: 'fill red,20+5*pulse+sin(time) box 3,5 yellow stroke box',
      expected:
        'fill red,20+5*pulse()+sin(time), -> box 3,5, -> stroke yellow, box',
      failsMootAppends: true,
      failsMootPrepends: true,
    },
    {
      notes: '                 ',
      input: 'red yellow stroke box',
      expected: 'fill red, -> stroke yellow, box',
      failsMootAppends: true,
      failsMootPrepends: true,
    },
    {
      notes: '                 ',
      input: 'red fill stroke yellow ball',
      expected: 'fill red, -> stroke yellow, ball',
      failsMootAppends: true,
      failsMootPrepends: true,
    },
    {
      notes: '                 ',
      input: 'red fill noStroke peg',
      expected: 'fill red, -> noStroke peg',
      failsMootAppends: true,
      failsMootPrepends: true,
    },
    {
      notes: '                 ',
      input: 'rotate noStroke fill 255*pulse,0,0, 255*pulse box',
      expected: 'rotate -> noStroke -> fill 255*pulse(),0,0, 255*pulse(), box',
    },
    {
      notes: '                 ',
      input:
        'f = (a,b) -> a\nrotate 2, f f 3,4 box\nrotate 2, f(f(3,4)) box\nfill red,20 box',
      expected:
        'f = (a,b) -> a\nrotate 2, f(f(3,4)), box\nrotate 2, f(f(3,4)), box\nfill red,20, box',
    },
    {
      notes: '                 ',
      input: 'rotate wave wave wave  0.5 * 0.1 box',
      expected: 'rotate wave(wave(wave(0.5 * 0.1))), box',
    },
    {
      notes: '                 ',
      input: 'background black\nrotate noStroke fill 255*pulse 2 box',
      expected:
        'background black\nrotate -> noStroke -> fill 255*pulse(2), box',
    },
    {
      notes: '                 ',
      input: 'rotate 2, sin sin time 1 times box',
      expected: 'rotate 2, sin(sin(time)), -> 1.times box',
    },
    {
      notes: '                 ',
      input: 'rotate red fill red stroke box',
      expected: 'rotate -> fill red, -> stroke red, box',
      failsMootAppends: true,
      failsMootPrepends: true,
    },
    {
      notes: '                 ',
      input: 'stroke stroke',
      error: 'redundant stroke',
    },
    {
      notes: '                 ',
      input: 'fill fill',
      error: 'redundant fill',
    },
    {
      notes: '                 ',
      input: 'stroke red stroke',
      error: 'redundant stroke',
    },
    {
      notes: '                 ',
      input: 'fill red fill',
      error: 'redundant fill',
    },
    {
      notes: '                 ',
      input: 'box fill red stroke box',
      error: 'missing color',
    },
    {
      notes: '                 ',
      input: 'fill red stroke box',
      error: 'missing color',
    },
    {
      notes: '                 ',
      input: 'box fill red stroke fill',
      error: 'missing color',
    },
    {
      notes: '                 ',
      input: 'box fill red stroke stroke',
      error: 'redundant stroke',
    },
    {
      notes: '                 ',
      input: 'box red red box',
      error: 'redundant color',
    },
    {
      notes:
        "it's a little silly to write this\nbut we accept\n  stroke red green box\nso we also accept this",
      input: 'fill red red box',
      expected: 'fill red, -> fill -> fill red, box',
      failsMootAppends: true,
      failsMootPrepends: true,
    },
    {
      notes:
        "it's a little silly to write this\nbut we accept\n  stroke red green box\nso we also accept this",
      input: 'rotate\n\tfill red red box',
      expected: 'rotate ->\n\tfill red, -> fill -> fill red, box',
      failsMootAppends: true,
      failsMootPrepends: true,
    },
    {
      notes:
        'although this code is weird, we do\nallow for users to write stuff like\n  red green stroke box\nand\n  box red peg\nso we also need to accept this',
      input: 'box red red fill',
      expected: 'box -> fill red, -> fill red',
      failsMootAppends: true,
      failsMootPrepends: true,
    },
    {
      notes: '                 ',
      input: 'rotate stroke frame*100%255 red box',
      expected: 'rotate -> stroke frame*100%255, -> fill red, box',
      failsMootAppends: true,
      failsMootPrepends: true,
    },
    {
      notes: '                 ',
      input: 'box red fill red box',
      error: 'missing color command',
    },
    {
      notes: '                 ',
      input: 'red fill red red',
      error: 'redundant color',
    },
    {
      notes: '                 ',
      input: 'red red fill red',
      error: 'redundant color',
    },
    {
      notes: '                 ',
      input: 'red red red',
      error: 'redundant color',
    },
    {
      notes: '                 ',
      input: 'a = (code) -> code()\n\na <ball>\n\na\n\trect\n\tpeg',
      expected: 'a = (code) -> code()\n\na ball\n\na ->\n\trect()\n\tpeg()',
      notIdempotent: true,
      failsMootAppends: true,
      failsMootPrepends: true,
    },
    {
      notes: '                 ',
      input:
        'skel = (numberOfTimes, code) ->\n\tfor i in [1..numberOfTimes]\n\t\trotate i*time scale i noFill\n\t\t\tcode()\n\nscale 1/4\nskel 10 * wave 0.1\n\tball',
      expected:
        'skel = (numberOfTimes, code) ->\n\tfor i in [1..numberOfTimes]\n\t\trotate i*time, -> scale i, -> noFill ->\n\t\t\tcode()\n\nscale 1/4\nskel 10 * wave(0.1), ->\n\tball()',
      failsMootAppends: true,
      failsMootPrepends: true,
    },
    {
      notes: '                 ',
      input: 'run <box> 2',
      expected: 'run -> box 2',
      failsMootAppends: true,
    },
    {
      notes: '                 ',
      input: 'a = <box>\nnoFill\nrotate run a scale 2 run a',
      expected: 'a = box\nnoFill()\nrotate -> run -> a -> scale 2, -> run a',
      notIdempotent: true,
      failsMootAppends: true,
      failsMootPrepends: true,
    },
    {
      notes: '                 ',
      input: 'a = (code) -> code()\na <ball wave>',
      expected:
        'a = (code) -> code()\na ((parametersForBracketedFunctions) -> (ball wave -> (if parametersForBracketedFunctions? then parametersForBracketedFunctions() else null)))',
      failsMootAppends: true,
    },
    {
      notes: '                 ',
      input: 'f = (a,b)-> rotate a run b\nf 2 * sin time, <ball>',
      expected: 'f = (a,b) -> rotate a, -> run b\nf 2 * sin(time), ball',
      notIdempotent: true,
      failsMootAppends: true,
    },
    {
      notes: 'tests more exotic colors',
      input:
        'background black\nrotate noStroke lemonchiffon box\nrotate 4 red stroke rect',
      expected:
        'background black\nrotate -> noStroke -> fill lemonchiffon, box\nrotate 4, -> stroke red, rect',
      failsMootAppends: true,
      failsMootPrepends: true,
    },
    {
      notes:
        'colors can be on their own with their own\nindented scoping, just like "rotate" and\nalike',
      input: 'red\n\tbox\n\tball\npeg',
      expected: 'fill red},{ ->\n\tbox()\n\tball()\npeg()',
      failsMootAppends: true,
      failsMootPrepends: true,
    },
    {
      notes: 'more color rejigging test of\nlines on their own',
      input: 'red stroke\n\tbox\npeg',
      expected: 'stroke red},{ ->\n\tbox()\npeg()',
      failsMootAppends: true,
      failsMootPrepends: true,
    },
    {
      notes: 'more color rejigging test of\nlines starting with tabs',
      input: 'rotate\n\tred box',
      expected: 'rotate ->\n\tfill red, box',
      failsMootAppends: true,
      failsMootPrepends: true,
    },
    {
      notes: 'binding a variable to times ',
      input: 'noFill wave*3 times with i rotate box i+1',
      expected:
        'noFill -> (wave()*3).timesWithVariable (i) -> rotate -> box i+1',
    },
    {
      notes: 'An organic example,\nusing times with binding',
      input:
        '5 times with i\n\trotate 0,time,time/5000\n\t\tmove i/5,0,0\n\t\t3 times with j\n\t\t\trotate j\n\t\t\tbox',
      expected:
        '5.timesWithVariable (i) ->\n\trotate 0,time,time/5000, ->\n\t\tmove i/5,0,0\n\t\t3.timesWithVariable (j) ->\n\t\t\trotate j\n\t\t\tbox()',
    },
    {
      notes:
        "Should give error as 'times'\nis missing how many times the\nloop has to go for",
      input: '// should give error\npeg\ntimes with i\n\tbox 2',
      error: 'how many times?',
    },
    {
      notes:
        "Should give error as 'times'\nis missing how many times the\nloop has to go for",
      input: '// should give error\ntimes with i\n\tbox',
      error: 'how many times?',
    },
    {
      notes:
        "Should give error as 'times'\nis missing how many times the\nloop has to go for",
      input: '// should give error\npeg times with i rotate box 2* wave',
      error: 'how many times?',
    },
    {
      notes:
        "Should give error as 'times'\nis missing how many times the\nloop has to go for",
      input: '// should give error\nif true then  times with i do that',
      error: 'how many times?',
    },
    {
      notes:
        "Should give error as 'times'\nis missing how many times the\nloop has to go for",
      input:
        '// should give error\nif random() > 0.5 then rotate box else times with i rotate peg true',
      error: 'how many times?',
    },
    {
      notes:
        'Checking that times finds its "number of loops"\nexpression correctly.',
      input: 'a = 2\nbox a + 3 times with i rotate peg',
      expected: 'a = 2\nbox -> (a + 3).timesWithVariable (i) -> rotate peg',
    },
    {
      notes: 'Checking "qualifying" rotate',
      input: '6 times with i: rotate box',
      expected: '6.timesWithVariable (i) -> rotate box',
    },
    {
      notes:
        'Checking "qualifying" rotate and times within\na function definition',
      input: 'myFunc = -> 20 times with i rotate box',
      expected: 'myFunc = -> 20.timesWithVariable (i) -> rotate box',
    },
    {
      notes:
        'Checking "qualifying" rotate and times within\nif within a function definition with arguments',
      input: 'myFunc = (a,b) -> if true then 20 times with i rotate box',
      expected:
        'myFunc = (a,b) -> if true then 20.timesWithVariable (i) -> rotate box',
    },
    {
      notes: 'Checking multiple times within if then statement',
      input: 'if true then 2 times with i box 3 times with j line 2',
      expected:
        'if true then 2.timesWithVariable (i) -> box -> 3.timesWithVariable (j) -> line 2',
    },
    {
      notes:
        'Checking that separate rotate and primitive\nwithin a times body remain correctly separated.',
      input: '6 times with i: rotate box',
      expected: '6.timesWithVariable (i) -> rotate box',
    },
    {
      notes: 'Qualifying rotate within an indented "times" body',
      input: '6 times with i:\n\trotate box',
      expected: '6.timesWithVariable (i) ->\n\trotate box',
    },
    {
      input: '1+1 times with i: rotate box',
      expected: '(1+1).timesWithVariable (i) -> rotate box',
    },
    {
      input: 'peg 2 times with i rotate box 2* wave',
      expected: 'peg -> 2.timesWithVariable (i) -> rotate -> box 2* wave()',
    },
    {
      input: 'n = 2 n times with i: rotate box',
      expected: 'n = 2; n.timesWithVariable (i) -> rotate box',
      notIdempotent: true,
    },
    {
      input: 'n = 2 (n+0).times with i rotate box()',
      expected: 'n = 2; (n+0).timesWithVariable (i) -> rotate box',
      notIdempotent: true,
    },
    {
      input: 'box box   2 times with i: rotate peg 1.3',
      expected: 'box -> box -> 2.timesWithVariable (i) -> rotate -> peg 1.3',
    },
    {
      input:
        'if random > 0.5 then 3 times with i: rotate box else 3 times with i rotate 2 times with k: peg 1',
      expected:
        'if random() > 0.5 then 3.timesWithVariable (i) -> rotate box else 3.timesWithVariable (i) -> rotate -> 2.timesWithVariable (k) -> peg 1',
    },
    {
      input: 'if true then 3 times with i rotate box',
      expected: 'if true then 3.timesWithVariable (i) -> rotate box',
    },
    {
      input: '(9+0).times with i -> rotate box',
      expected: '(9+0).timesWithVariable (i) -> rotate box',
    },
    {
      input:
        'if random() > 0.5 then rotate box else 3 times with i rotate peg 1',
      expected:
        'if random() > 0.5 then rotate box else 3.timesWithVariable (i) -> rotate -> peg 1',
    },
    {
      input:
        'if random() > 0.5 then rotate 1 + wave box else 3 times with i rotate peg 1',
      expected:
        'if random() > 0.5 then rotate 1 + wave(), box else 3.timesWithVariable (i) -> rotate -> peg 1',
    },
    {
      input:
        '// testing whether mangled accross multiple lines\nif random() > 0.5 then box\n2 times with i: box\n2 times with i: rotate box',
      expected:
        '\nif random() > 0.5 then box()\n2.timesWithVariable (i) -> box()\n2.timesWithVariable (i) -> rotate box',
    },
    {
      input:
        '// testing whether mangled accross multiple lines\n6 times with i: rotate box\n6 times with i:\n\trotate box',
      expected:
        '\n6.timesWithVariable (i) -> rotate box\n6.timesWithVariable (i) ->\n\trotate box',
    },
    {
      input: '2 times with i rotate box wave wave',
      expected: '2.timesWithVariable (i) -> rotate -> box wave wave()',
    },
    {
      input: '2 times with i: box',
      expected: '2.timesWithVariable (i) -> box()',
    },
    {
      input: '2 times with i: rotate box',
      expected: '2.timesWithVariable (i) -> rotate box',
    },
    {
      input: '2 times with i rotate box wave',
      expected: '2.timesWithVariable (i) -> rotate -> box wave()',
    },
    {
      input: '2 times with i: rotate box wave',
      expected: '2.timesWithVariable (i) -> rotate -> box wave()',
    },
    {
      input: '2 times with i: move rotate wave box',
      expected: '2.timesWithVariable (i) -> move -> rotate wave(), box',
    },
    {
      input: 'rotate wave times with i box',
      expected: 'rotate -> (wave()).timesWithVariable (i) -> box()',
    },
    {
      input: 'rotate 10*wave times with i box',
      expected: 'rotate -> (10*wave()).timesWithVariable (i) -> box()',
    },
    {
      input: 'rotate 10 * wave times with i box',
      expected: 'rotate -> (10 * wave()).timesWithVariable (i) -> box()',
    },
    {
      input: 'rotate wave * wave times with i box',
      expected: 'rotate -> (wave() * wave()).timesWithVariable (i) -> box()',
    },
    {
      input: 'rotates waves * waves timess with i boxs',
      expected: 'rotates waves * waves timess with i boxs',
    },
    {
      input: 'rotate wave*wave times with i box',
      expected: 'rotate -> (wave()*wave()).timesWithVariable (i) -> box()',
    },
    {
      input: 'rotate 2 times with i box',
      expected: 'rotate -> 2.timesWithVariable (i) -> box()',
    },
    {
      notes: 'There are two ways to interpret this,\nwe pick one',
      input: 'rotate wave 2 times with i box',
      expected: 'rotate -> (wave 2).timesWithVariable (i) -> box()',
    },
    {
      input: 'rotate wave + 2 times with i box',
      expected: 'rotate -> (wave() + 2).timesWithVariable (i) -> box()',
    },
    {
      input: 'box 2 times with i box',
      expected: 'box -> 2.timesWithVariable (i) -> box()',
    },
    {
      input: '2 times with i 3 times with k box',
      expected: '2.timesWithVariable (i) -> 3.timesWithVariable (k) -> box()',
    },
    {
      input: '2 times with i 3 times with j 4 times with k box',
      expected:
        '2.timesWithVariable (i) -> 3.timesWithVariable (j) -> 4.timesWithVariable (k) -> box()',
    },
    {
      input: '2 times with i box 3 times with j line 2',
      expected:
        '2.timesWithVariable (i) -> box -> 3.timesWithVariable (j) -> line 2',
    },
    {
      input: '2 times with i rotate box line 2',
      expected: '2.timesWithVariable (i) -> rotate -> box -> line 2',
    },
    {
      input: '10 times with i rotate scale box',
      expected: '10.timesWithVariable (i) -> rotate -> scale box',
    },
    {
      notes:
        'Some times nested in ifs. The final js,\nconsistently with coffeescript, is:\n  if (true) {\n    2..times(function() {\n      box();\n      return line();\n    });\n  } else {\n    peg();\n  }                   ',
      input: 'if true then 2 times with i box line else peg',
      expected: 'if true then 2.timesWithVariable (i) -> box line else peg()',
    },
    {
      notes:
        'Some more "times nested in ifs". The final js,\nconsistently with coffeescript, is:\nif (true) {\n  2..times(function() {\n    box();\n    if (true) {\n      return 2..times(function() {\n        return rect();\n      });\n    }\n  });\n} else {\n  2..times(function() {\n    peg();\n    return ball();',
      input:
        'if true then 2 times with i box if true then 2 times with j rect else 2 times with k peg ball',
      expected:
        'if true then 2.timesWithVariable (i) -> box(); if true then 2.timesWithVariable (j) -> rect() else 2.timesWithVariable (k) -> peg ball',
    },
    {
      notes: '                 ',
      input: '2 times with i if true then ball',
      expected: '2.timesWithVariable (i) -> if true then ball()',
    },
    {
      notes: '                 ',
      input: '2 times with i if true then ball',
      expected: '2.timesWithVariable (i) -> if true then ball()',
    },
    {
      notes:
        'note that you cannot have anonymous\nfunctions in the test in coffeescript,\ni.e. pasting the "expected" below\ninto coffeescript gives an error',
      input: 'if 2 times with i a then ball',
      expected: 'if 2.timesWithVariable (i) -> a then ball()',
    },
    {
      notes: "this example doesn't mean anything\nmeaningful...",
      input: 'if (2 times with i a) then ball',
      expected: 'if (2.timesWithVariable (i) -> a) then ball()',
    },
    {
      notes: 'times and qualifiers within an if-then-else',
      input:
        'if random < 0.5 then 2 times with i rotate box else 3 times with j move peg',
      expected:
        'if random() < 0.5 then 2.timesWithVariable (i) -> rotate box else 3.timesWithVariable (j) -> move peg',
    },
    {
      notes:
        'the parser implementation accepts the notation of times\nwithout the dot and with the arrow, so\nmatching that',
      input: '2 times -> box 4',
      expected: '2.times -> box 4',
    },
    {
      notes:
        'the parser implementation accepts the notation of times\nwithout the dot and with the arrow, so\nmatching that',
      input: '2 times ->\n\tbox 4',
      expected: '2.times ->\n\tbox 4',
    },
    {
      notes: "the specs supported chevrons for making\nuser's life easier",
      input: 'rotate 2, 3 >> box',
      expected: 'rotate 2, 3, box',
      failsMootPrepends: true,
      failsMootAppends: true,
    },
    {
      notes: 'testing some more advanced higher-order-functions\nexamples',
      input:
        'transforms = [<rotate>, <scale>, <fill blue>]\nrandomTransforms = transforms.filter (x) -> random > 0.5\ndrawThis = [<box>].concat randomTransforms\ndrawThisFunction = drawThis.reduce (acc,x) -> -> x(acc)\ndrawThisFunction()',
      expected:
        'transforms = [rotate, scale, ((parametersForBracketedFunctions) -> (fill blue, -> (if parametersForBracketedFunctions? then parametersForBracketedFunctions() else null)))]\nrandomTransforms = transforms.filter (x) -> random() > 0.5\ndrawThis = [box].concat randomTransforms\ndrawThisFunction = drawThis.reduce (acc,x) -> -> x(acc)\ndrawThisFunction()',
      notIdempotent: true,
      failsMootAppends: true,
    },
    {
      notes: 'testing some more advanced higher-order-functions\nexamples',
      input: 'a = <box 1>\nb = <rotate ball>\na b\nmove\nb a',
      expected:
        'a = ((parametersForBracketedFunctions) -> (box 1, -> (if parametersForBracketedFunctions? then parametersForBracketedFunctions() else null)))\nb = ((parametersForBracketedFunctions) -> (rotate -> ball -> (if parametersForBracketedFunctions? then parametersForBracketedFunctions() else null)))\na b\nmove()\nb a',
      notIdempotent: true,
      failsMootAppends: true,
    },
    {
      notes: 'testing some more advanced higher-order-functions\nexamples',
      input: 'a = <fill red>\nb= <box>\na b\nmove\nb a',
      expected:
        'a = ((parametersForBracketedFunctions) -> (fill red, -> (if parametersForBracketedFunctions? then parametersForBracketedFunctions() else null)))\nb = box\na b\nmove()\nb a',
      notIdempotent: true,
      failsMootAppends: true,
    },
    {
      notes: 'testing some more advanced higher-order-functions\nexamples',
      input: 'a = <box 1>\nb = <rotate ball>\na b\nmove\nb a',
      expected:
        'a = ((parametersForBracketedFunctions) -> (box 1, -> (if parametersForBracketedFunctions? then parametersForBracketedFunctions() else null)))\nb = ((parametersForBracketedFunctions) -> (rotate -> ball -> (if parametersForBracketedFunctions? then parametersForBracketedFunctions() else null)))\na b\nmove()\nb a',
      notIdempotent: true,
      failsMootAppends: true,
    },
    {
      notes: 'testing some more advanced higher-order-functions\nexamples',
      input: 'noFill\n[1..2].map (i) -> box i',
      expected: 'noFill()\n[1..2].map (i) -> box i',
    },
    {
      notes: 'testing some more advanced higher-order-functions\nexamples',
      input: '[<box>, <line>, <peg>].map (i) -> rotate i',
      expected: '[box, line, peg].map (i) -> rotate i',
      notIdempotent: true,
      failsMootAppends: true,
    },
    {
      notes: 'testing some more advanced higher-order-functions\nexamples',
      input:
        'primitives = [<box>, <line>, <peg>, <ball>]\nselected = primitives.filter (x) -> random > 0.5\nselected.map (i) -> i()',
      expected:
        'primitives = [box, line, peg, ball]\nselected = primitives.filter (x) -> random() > 0.5\nselected.map (i) -> i()',
      notIdempotent: true,
      failsMootAppends: true,
    },
    {
      notes: 'testing some more advanced higher-order-functions\nexamples',
      input:
        'drawThis = [<box>, <scale>,<rotate>].reduce (acc,x) -> -> x(acc)\ndrawThis()',
      expected:
        'drawThis = [box, scale,rotate].reduce (acc,x) -> -> x(acc)\ndrawThis()',
      notIdempotent: true,
      failsMootAppends: true,
    },
    {
      notes: 'testing some more advanced higher-order-functions\nexamples',
      input:
        'drawPieces = [<box>, <move>,<ball>]\nif random > 0.5\n\tdrawThis = drawPieces.reduce (acc,x) -> -> x(acc)\nelse\n\tdrawThis = drawPieces.reduceRight (acc,x) -> -> x(acc)\ndrawThis()',
      expected:
        'drawPieces = [box, move, ball]\nif random() > 0.5\n\tdrawThis = drawPieces.reduce (acc,x) -> -> x(acc)\nelse\n\tdrawThis = drawPieces.reduceRight (acc,x) -> -> x(acc)\ndrawThis()',
      notIdempotent: true,
      failsMootAppends: true,
    },
    {
      notes: 'testing some more advanced higher-order-functions\nexamples',
      input:
        'drawPieces = [<box>, <move>,<ball>]\nrotate\n\tif random > 0.5\n\t\tdrawThis = drawPieces.reduce (acc,x) -> -> x(acc)\n\telse\n\t\tdrawThis = drawPieces.reduceRight (acc,x) -> -> x(acc)\n\tdrawThis()',
      expected:
        'drawPieces = [box, move, ball]\nrotate ->\n\tif random() > 0.5\n\t\tdrawThis = drawPieces.reduce (acc,x) -> -> x(acc)\n\telse\n\t\tdrawThis = drawPieces.reduceRight (acc,x) -> -> x(acc)\n\tdrawThis()',
      notIdempotent: true,
      failsMootAppends: true,
    },
    {
      notes: 'testing some more advanced higher-order-functions\nexamples',
      input: 'rotate\n\tbox\npeg\n\na = <move 1>\nbox a ball',
      expected:
        'rotate ->\n\tbox()\npeg()\n\na = ((parametersForBracketedFunctions) -> (move 1, -> (if parametersForBracketedFunctions? then parametersForBracketedFunctions() else null)))\nbox -> a ball',
      notIdempotent: true,
      failsMootAppends: true,
    },
    {
      notes: 'testing some more advanced higher-order-functions\nexamples',
      input: 'above  = <move 0,-0.5,0>\nbox above ball above peg',
      expected:
        'above = ((parametersForBracketedFunctions) -> (move 0,-0.5,0, -> (if parametersForBracketedFunctions? then parametersForBracketedFunctions() else null)))\nbox -> above -> ball -> above peg',
      notIdempotent: true,
      failsMootAppends: true,
    },
    {
      notes: 'tests that nothing inside strings undergoes\nany processing',
      input: 'F = -> box\ns = "F-"\nk = \'F\'',
      expected: 'F = -> box()\ns = "F-"\nk = \'F\'',
      notIdempotent: false,
      failsMootAppends: false,
    },
    {
      notes:
        'tests avoidLastArgumentInvocationOverflowing\nsubstitutions also work with a dangling\nfunctions',
      input: 'scale 2, wave time peg\n\tscale ball',
      expected: 'scale 2, wave(time), -> peg ->\n\tscale ball',
      notIdempotent: false,
      failsMootAppends: false,
    },
    {
      notes:
        'tests avoidLastArgumentInvocationOverflowing\nsubstitutions also work with a dangling\nfunctions',
      input: 'scale 2, wave 2 peg\n\tscale 2, wave 2 ball',
      expected: 'scale 2, wave(2), -> peg ->\n\tscale 2, wave(2), ball',
      notIdempotent: false,
      failsMootAppends: false,
    },
    {
      notes: '                 ',
      input:
        'flashing = <if random > 0.5 then rotate else scale>\nflashing ball\nbox',
      expected:
        'flashing = ifFunctional(random() > 0.5},{rotate, scale)\nflashing ball\nbox()',
      notIdempotent: false,
      failsMootAppends: false,
    },
    {
      notes: '                 ',
      input: 'flashing = <if random > 0.5 then scale 0>\nflashing ball\nbox',
      expected:
        'flashing = ifFunctional(random() > 0.5},{((parametersForBracketedFunctions) -> (scale 0, -> (if parametersForBracketedFunctions? then parametersForBracketedFunctions() else null))))\nflashing ball\nbox()',
      notIdempotent: false,
      failsMootAppends: false,
    },
    {
      notes: '                 ',
      input: 'ball\n\tbox',
      expected: 'ball ->\n\tbox()',
      notIdempotent: false,
      failsMootAppends: false,
    },
    {
      notes: '                 ',
      input:
        'flashing = <if random > 0.5 then scale 0>\nrotating = <rotate>\nflashing\n\tball\n\trotating box\nrotate 2 peg 0.7',
      expected:
        'flashing = ifFunctional(random() > 0.5},{((parametersForBracketedFunctions) -> (scale 0, -> (if parametersForBracketedFunctions? then parametersForBracketedFunctions() else null))))\nrotating = rotate\nflashing ->\n\tball()\n\trotating box\nrotate 2, -> peg 0.7',
      notIdempotent: false,
      failsMootAppends: false,
    },
    {
      notes: '                 ',
      input:
        'flashing = <if random < 0.5 then scale 0 else scale 2>\nflashing\nball',
      expected:
        'flashing = ifFunctional(random() < 0.5},{((parametersForBracketedFunctions) -> (scale 0, -> (if parametersForBracketedFunctions? then parametersForBracketedFunctions() else null))), ((parametersForBracketedFunctions) -> (scale 2, -> (if parametersForBracketedFunctions? then parametersForBracketedFunctions() else null))))\nflashing()\nball()',
      notIdempotent: false,
      failsMootAppends: false,
    },
    {
      notes: '                 ',
      input: 'flashing = <if random < 0.5 then scale>\nflashing\nball',
      expected:
        'flashing = ifFunctional(random() < 0.5},{scale)\nflashing()\nball()',
      notIdempotent: false,
      failsMootAppends: false,
    },
    {
      notes: '                 ',
      input: 'flashing = <if random < 0.5 then scale 0>\nflashing\nball',
      expected:
        'flashing = ifFunctional(random() < 0.5},{((parametersForBracketedFunctions) -> (scale 0, -> (if parametersForBracketedFunctions? then parametersForBracketedFunctions() else null))))\nflashing()\nball()',
      notIdempotent: false,
      failsMootAppends: false,
    },
    {
      notes: '                 ',
      input: 'F = <box> \na = <F>\nrun a',
      expected: 'F = box \na = F\nrun a',
      notIdempotent: false,
      failsMootAppends: false,
    },
  ];

  it('should pass all the existing tests', function() {
    var error, results, tc, transformed, userDefinedFunctions;

    var preprocessor = new CodePreprocessor();

    var len = testCases.length;
    for (var i = 0; i < len; i += 1) {
      tc = testCases[i];
      results = preprocessor.preprocess(tc.input);
      transformed = results[0];
      error = results[1];
      userDefinedFunctions = results[2];

      assert((tc.error === undefined && !error) || tc.error !== undefined);
    }
  });
});
