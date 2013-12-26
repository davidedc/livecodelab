###
## test cases for the CodePreprocessor
###

define ['core/code-preprocessor-tests'], (foo) ->

  class CodePreprocessorTests

    testCases: null

    constructor: ->

      @testCases= [
         notes:    """
                   An organic example which also
                   tests whether multiple lines
                   mangle things.
                   """
         input:    """
                   5 times
                   ▶rotate 0,1,time/5000
                   ▶move 0.2,0,0
                   ▶3 times
                   ▶▶rotate 1
                   ▶▶box
                   """
         expected: """
                   5.times ->
                   ▶rotate 0,1,time/5000
                   ▶move 0.2,0,0
                   ▶3.times ->
                   ▶▶rotate 1
                   ▶▶box()
                   """
        ,
         notes:    """
                   Should give error as 'times'
                   is missing how many times the
                   loop has to go for
                   """
         input:    """
                   // should give error
                   peg
                   times
                   ▶box 2
                   """
         error: "how many times?"
        ,
         notes:    """
                   Should give error as 'times'
                   is missing how many times the
                   loop has to go for
                   """
         input:    """
                   // should give error
                   times
                   ▶box
                   """
         error: "how many times?"
        ,
         notes:    """
                   Should give error as 'times'
                   is missing how many times the
                   loop has to go for
                   """
         input:    """
                   // should give error
                   peg times rotate box 2* wave
                   """
         error: "how many times?"
        ,
         notes:    """
                   Should give error as 'times'
                   is missing how many times the
                   loop has to go for
                   """
         input:    """
                   // should give error
                   if true then  times do that
                   """
         error: "how many times?"
        ,
         notes:    """
                   Should give error as 'times'
                   is missing how many times the
                   loop has to go for
                   """
         input:    """
                   // should give error
                   if random() > 0.5 then rotate box else times rotate peg true
                   """
         error: "how many times?"
        ,
         notes:    """
                   Checking that times finds its "number of loops"
                   expression correctly.
                   """
         input:    """
                   a = 2
                   box a + 3 times rotate peg
                   """
         expected: """
                   a = 2
                   box -> (a + 3).times -> rotate -> peg()
                   """
        ,
         notes:    """
                   Checking "qualifying" rotate
                   """
         input:    """
                   6 times: rotate box
                   """
         expected: """
                   6.times -> rotate -> box()
                   """
        ,
         notes:    """
                   Checking "qualifying" rotate and times within
                   a function definition
                   """
         input:    """
                   myFunc = -> 20 times rotate box
                   """
         expected: """
                   myFunc = -> 20.times -> rotate -> box()
                   """
        ,
         notes:    """
                   Checking "qualifying" rotate and times within
                   if within a function definition with arguments
                   """
         input:    """
                   myFunc = (a,b) -> if true then 20 times rotate box
                   """
         expected: """
                   myFunc = (a,b) -> if true then 20.times -> rotate -> box()
                   """
        ,
         notes:    """
                   Checking multiple times within if then statement
                   """
         input:    """
                   if true then 2 times box 3 times line 2
                   """
         expected: """
                   if true then 2.times -> box -> 3.times -> line 2
                   """
        ,
         notes:    """
                   Checking that separate rotate and primitive
                   within a times body remain correctly separated.
                   """
         input:    """
                   6 times: rotate box
                   """
         expected: """
                   6.times -> rotate -> box()
                   """
        ,
         notes:    """
                   Qualifying rotate within an indented "times" body
                   """
         input:    """
                   6 times:
                   ▶rotate box
                   """
         expected: """
                   6.times ->
                   ▶rotate -> box()
                   """
        ,
         input:    """
                   1+1 times: rotate box
                   """
         expected: """
                   (1+1).times -> rotate -> box()
                   """
        ,
         input:    """
                   peg 2 times rotate box 2* wave
                   """
         expected: """
                   peg -> 2.times -> rotate -> box 2* wave()
                   """
        ,
         input:    """
                   n = 2 n times: rotate box
                   """
         expected: """
                   n = 2; n.times -> rotate -> box()
                   """
        ,
         input:    """
                   n = 2 (n+0).times -> rotate() box()
                   """
         expected: """
                   n = 2; (n+0).times -> rotate(); box()
                   """
        ,
         input:    """
                   n = 2 rotate(n+0) rotate() box()
                   """
         expected: """
                   n = 2; rotate(n+0); rotate(); box()
                   """
        ,
         input:    """
                   n = 2 rotate n + 1 box
                   """
         expected: """
                   n = 2; rotate n + 1, -> box()
                   """
        ,
         input:    """
                   box box   2 times: rotate peg 1.3
                   """
         expected: """
                   box -> box -> 2.times -> rotate -> peg 1.3
                   """
        ,
         input:    """
                   if random > 0.5 then 3 times: rotate box else 3 times rotate 2 times: peg 1
                   """
         expected: """
                   if random() > 0.5 then 3.times -> rotate -> box() else 3.times -> rotate -> 2.times -> peg 1
                   """
        ,
         input:    """
                   if true then 3 times rotate box
                   """
         expected: """
                   if true then 3.times -> rotate -> box()
                   """
        ,
         input:    """
                   (9+0).times -> rotate box
                   """
         expected: """
                   (9+0).times -> rotate -> box()
                   """
        ,
         input:    """
                   if random() > 0.5 then rotate box else 3 times rotate peg 1
                   """
         expected: """
                   if random() > 0.5 then rotate -> box() else 3.times -> rotate -> peg 1
                   """
        ,
         input:    """
                   if random() > 0.5 then rotate 1 + wave box else 3 times rotate peg 1
                   """
         expected: """
                   if random() > 0.5 then rotate 1 + wave(), -> box() else 3.times -> rotate -> peg 1
                   """
        ,
         input:    """
                   // testing whether mangled accross multiple lines
                   if random() > 0.5 then box
                   2 times: box
                   2 times: rotate box
                   """
         expected: """
                   
                   if random() > 0.5 then box()
                   2.times -> box()
                   2.times -> rotate -> box()
                   """
        ,
         input:    """
                   // testing whether mangled accross multiple lines
                   6 times: rotate box
                   6 times:
                   ▶rotate box
                   """
         expected: """

                   6.times -> rotate -> box()
                   6.times ->
                   ▶rotate -> box()
                   """
        ,
         input:    """
                   ab
                   """
         expected: """
                   ab
                   """
        ,
         input:    """
                   ball line peg
                   """
         expected: """
                   ball -> line -> peg()
                   """
        ,
         input:    """
                   box
                   """
         expected: """
                   box()
                   """
        ,
         input:    """
                   2 times rotate box wave wave
                   """
         expected: """
                   2.times -> rotate -> box wave wave()
                   """
        ,
         notes:    """
                   we should give an error in these cases
                   """
         input:    """
                   box + box
                   """
         expected: """
                   box +, -> box()
                   """
        ,
         input:    """
                   wave wave wave
                   """
         expected: """
                   wave wave wave()
                   """
        ,
         input:    """
                   if wave then box wave else wave
                   """
         expected: """
                   if wave() then box wave() else wave()
                   """
        ,
         input:    """
                   if wave then box + wave else wave
                   """
         expected: """
                   if wave() then box + wave() else wave()
                   """
        ,
         input:    """
                   wave
                   """
         expected: """
                   wave()
                   """
        ,
         # this is technically wrong,
         # but in fact will work, because
         # wave + wave is not assigned
         # or used for anything.
         # The transformation is only done when
         # the expression is preceded by an
         # operator, and in this case there is
         # nothing using the expression, so
         # this pre-processing is as good as
         # the technically correct one.
         input:    """
                   wave + wave
                   """
         expected: """
                   wave + wave()
                   """
        ,
         input:    """
                   a = wave + wave
                   """
         expected: """
                   a = wave() + wave()
                   """
        ,
         input:    """
                   (wave + wave)
                   """
         expected: """
                   (wave() + wave())
                   """
        ,
         input:    """
                   wave
                   """
         expected: """
                   wave()
                   """
        ,
         input:    """
                   if random() > 0.5 then box
                   """
         expected: """
                   if random() > 0.5 then box()
                   """
        ,
         input:    """
                   2 times: box
                   """
         expected: """
                   2.times -> box()
                   """
        ,
         input:    """
                   2 times: rotate box
                   """
         expected: """
                   2.times -> rotate -> box()
                   """
        ,
         input:    """
                   2 times rotate box wave
                   """
         expected: """
                   2.times -> rotate -> box wave()
                   """
        ,
         input:    """
                   rotate box 2,33
                   """
         expected: """
                   rotate -> box 2,33
                   """
        ,
         input:    """
                   box wave
                   """
         expected: """
                   box wave()
                   """
        ,
         input:    """
                   box wave 3
                   """
         expected: """
                   box wave 3
                   """
        ,
         input:    """
                   2 times: rotate box wave
                   """
         expected: """
                   2.times -> rotate -> box wave()
                   """
        ,
         input:    """
                   if rotate wave then rotate wave else rotate wave
                   """
         expected: """
                   if rotate wave() then rotate wave() else rotate wave()
                   """
        ,
         input:    """
                   2 times: move rotate wave box
                   """
         expected: """
                   2.times -> move -> rotate wave(), -> box()
                   """
        ,
         input:    """
                   rotate wave box
                   """
         expected: """
                   rotate wave(), -> box()
                   """
        ,
         input:    """
                   box -1
                   """
         expected: """
                   box -1
                   """
        ,
         input:    """
                   box - 1
                   """
         expected: """
                   box - 1
                   """
        ,
         input:    """
                   a = box -1
                   """
         expected: """
                   a = box -1
                   """
        ,
         input:    """
                   a = box - 1
                   """
         expected: """
                   a = box - 1
                   """
        ,
         input:    """
                   wave -1
                   """
         expected: """
                   wave -1
                   """
        ,
         # this is technically wrong,
         # but in fact will work, because
         # wave - 1 is not assigned
         # or used for anything.
         # The transformation is only done when
         # the expression is preceded by an
         # operator, and in this case there is
         # nothing using the expression, so
         # this pre-processing is as good as
         # the technically correct one.
         input:    """
                   wave - 1
                   """
         expected: """
                   wave - 1
                   """
        ,
         input:    """
                   a = wave -1
                   """
         expected: """
                   a = wave() -1
                   """
        ,
         input:    """
                   a = wave - 1
                   """
         expected: """
                   a = wave() - 1
                   """
        ,
         input:    """
                   rotate wave times box
                   """
         expected: """
                   rotate -> (wave()).times -> box()
                   """
        ,
         input:    """
                   rotate 10*wave times box
                   """
         expected: """
                   rotate -> (10*wave()).times -> box()
                   """
        ,
         input:    """
                   rotate 10 * wave times box
                   """
         expected: """
                   rotate -> (10 * wave()).times -> box()
                   """
        ,
         input:    """
                   rotate wave * wave times box
                   """
         expected: """
                   rotate -> (wave() * wave()).times -> box()
                   """
        ,
         input:    """
                   rotates waves * waves timess boxs
                   """
         expected: """
                   rotates waves * waves timess boxs
                   """
        ,
         input:    """
                   rotate wave*wave times box
                   """
         expected: """
                   rotate -> (wave()*wave()).times -> box()
                   """
        ,
         input:    """
                   rotate wave*wave
                   box
                   """
         expected: """
                   rotate wave()*wave()
                   box()
                   """
        ,
         input:    """
                   rotate 2 times box
                   """
         expected: """
                   rotate -> 2.times -> box()
                   """
        ,
         notes:    """
                   There are two ways to interpret this,
                   we pick one
                   """
         input:    """
                   rotate wave 2 times box
                   """
         expected: """
                   rotate -> (wave 2).times -> box()
                   """
        ,
         input:    """
                   rotate wave + 2 times box
                   """
         expected: """
                   rotate -> (wave() + 2).times -> box()
                   """
        ,
         input:    """
                   box 2 times box
                   """
         expected: """
                   box -> 2.times -> box()
                   """
        ,
         input:    """
                   2 times 3 times box
                   """
         expected: """
                   2.times -> 3.times -> box()
                   """
        ,
         input:    """
                   2 times 3 times 4 times box
                   """
         expected: """
                   2.times -> 3.times -> 4.times -> box()
                   """
        ,
         input:    """
                   2 times box 3 times line 2
                   """
         expected: """
                   2.times -> box -> 3.times -> line 2
                   """
        ,
         input:    """
                   box(wave)
                   """
         expected: """
                   box(wave())
                   """
        ,
         input:    """
                   box(wave,wave)
                   """
         expected: """
                   box(wave(),wave())
                   """
        ,
         input:    """
                   box(wave,wave,wave)
                   """
         expected: """
                   box(wave(),wave(),wave())
                   """
        ,
         input:    """
                   a=wave+wave+wave
                   """
         expected: """
                   a = wave()+wave()+wave()
                   """
        ,
         # to be investigated
         input:    """
                   rotate(box,peg,line)
                   """
         expected: """
                   rotate(box(),-> peg(),-> line())
                   """
        ,
         input:    """
                   rotate box peg line
                   """
         expected: """
                   rotate -> box -> peg -> line()
                   """
        ,
         input:    """
                   rotate 2 box peg line
                   """
         expected: """
                   rotate 2, -> box -> peg -> line()
                   """
        ,
         input:    """
                   rotate 2 + n box peg line
                   """
         expected: """
                   rotate 2 + n, -> box -> peg -> line()
                   """
        ,
         input:    """
                   rotate 2 + time box peg line
                   """
         expected: """
                   rotate 2 + time, -> box -> peg -> line()
                   """
        ,
         input:    """
                   for i in [0...wave * 2]
                   """
         expected: """
                   for i in [0...wave() * 2]
                   """
        ,
         input:    """
                   for i in [0...2*wave]
                   """
         expected: """
                   for i in [0...2*wave()]
                   """
        ,
         # note that this example doesn't make sense
         input:    """
                   either = (a,b) -> if random > 0.5 then a() else b()
                   either box, peg
                   """
         expected: """
                   either = (a,b) -> if random() > 0.5 then a() else b()
                   either box(), -> peg()
                   """
        ,
         # note that this example doesn't make sense
         input:    """
                   either = (a,b) -> if random > 0.5 then a() else b()
                   rotate box, peg
                   """
         expected: """
                   either = (a,b) -> if random() > 0.5 then a() else b()
                   rotate -> box(), -> peg()
                   """
        ,
         input:    """
                   scale 0.3
                   a = 3
                   move rotate scale 3 box peg line 2
                   move 0.1 peg move 0.4 box
                   """
         expected: """
                   scale 0.3
                   a = 3
                   move -> rotate -> scale 3, -> box -> peg -> line 2
                   move 0.1, -> peg -> move 0.4, -> box()
                   """
        ,
         input:    """
                   noFill
                   for i in [1..20]
                   ▶rotate time/100000
                   ▶box i/8
                   """
         expected: """
                   noFill()
                   for i in [1..20]
                   ▶rotate time/100000
                   ▶box i/8
                   """
        ,
         input:    """
                   noFill
                   for i in [1..20] by 5
                   ▶rotate time/100000
                   ▶box i/8
                   """
         expected: """
                   noFill()
                   for i in [1..20] by 5
                   ▶rotate time/100000
                   ▶box i/8
                   """
        ,
         input:    """
                   // yo dawg I heard you like balls so I put a ball inside a ball so you can see balls inside balls
                   noFill
                   sizes = [1..3]
                   ball size for size in sizes when size isnt 3
                   """
         expected: """

                   noFill()
                   sizes = [1..3]
                   ball size for size in sizes when size isnt 3
                   """
        ,
         input:    """
                   noFill
                   20.times (i) ->
                   ▶rotate time/100000
                   ▶box i/8
                   """
         expected: """
                   noFill()
                   20.times (i) ->
                   ▶rotate time/100000
                   ▶box i/8
                   """
        ,
         input:    """
                   scale 0.1
                   shapes = 'box': 1, 'ball': 2, 'peg': 3
                   
                   for shape, size of shapes
                   ▶move 2
                   ▶eval(shape+"(" + size+")")
                   """
         expected: """
                   scale 0.1
                   shapes = 'box': 1, 'ball': 2, 'peg': 3
                   
                   for shape, size of shapes
                   ▶move 2
                   ▶eval(shape+"(" + size+")")
                   """
        ,
         input:    """
                   d = 2
                   scale 2, d box b, c
                   """
         expected: """
                   d = 2
                   scale 2, d, -> box b, c
                   """
        ,
         # This might not be what the user means,
         # but it probably is.
         input:    """
                   d = -> 2
                   scale 2, d box b, c
                   """
         expected: """
                   d = -> 2
                   scale 2, d(), -> box b, c
                   """
        ,
         input:    """
                   a = 2
                   scale 2, a box b, c
                   """
         expected: """
                   a = 2
                   scale 2, a, -> box b, c
                   """
        ,
         input:    """
                   either = (a,b) -> if random > 0.5 then a() else b()
                   either (->box), (->peg)
                   """
         expected: """
                   either = (a,b) -> if random() > 0.5 then a() else b()
                   either (-> box()), (-> peg())
                   """
        ,
         input:    """
                   either = (a,b) -> if random > 0.5 then a() else b()
                   either <box>, <peg>
                   """
         expected: """
                   either = (a,b) -> if random() > 0.5 then a() else b()
                   either (box), (peg)
                   """
         notIdempotent: true
         failsMootAppends: true
        ,
         input:    """
                   either = (a,b) -> if random > 0.5 then a() else b()
                   either <box 2>, <peg 2>
                   """
         expected: """
                   either = (a,b) -> if random() > 0.5 then a() else b()
                   either (-> (box 2)), (-> (peg 2))
                   """
         notIdempotent: true
         failsMootAppends: true
        ,
         input:    """
                   either = (a,b) -> if random > 0.5 then a() else b()
                   either (->box),(->rect)
                   """
         expected: """
                   either = (a,b) -> if random() > 0.5 then a() else b()
                   either (-> box()),(-> rect())
                   """
        ,
         input:    """
                   rand = (arg) -> random(arg)
                   box (rand 2) ball 2
                   """
         expected: """
                   rand = (arg) -> random(arg)
                   box (rand 2), -> ball 2
                   """
        ,
         input:    """
                   animationStyle paintOver
                   noStroke
                   rand = -> 255*random
                   fill rand, 255*random, 255*random
                   50 times
                   ▶resetMatrix
                   ▶scale 0.4
                   ▶move 5-(random 10), 5-(random 10), 5-(random 10)
                   ▶ball
                   """
         expected: """
                   animationStyle paintOver
                   noStroke()
                   rand = -> 255*random()
                   fill rand(), 255*random(), 255*random()
                   50.times ->
                   ▶resetMatrix()
                   ▶scale 0.4
                   ▶move 5-(random 10), 5-(random 10), 5-(random 10)
                   ▶ball()
                   """
        ,
         input:    """
                   scale rotate box 2 peg 2.3
                   """
         expected: """
                   scale -> rotate -> box 2, -> peg 2.3
                   """
        ,
         input:    """
                   rotate box peg 1.1
                   """
         expected: """
                   rotate -> box -> peg 1.1
                   """
        ,
         input:    """
                   rotate box peg 1.1
                   """
         expected: """
                   rotate -> box -> peg 1.1
                   """
        ,
         input:    """
                   rotate box rotate line 2
                   """
         expected: """
                   rotate -> box -> rotate -> line 2
                   """
        ,
         input:    """
                   rotate box line 2
                   """
         expected: """
                   rotate -> box -> line 2
                   """
        ,
         input:    """
                   rotate rotate rotate rotate box line 2
                   """
         expected: """
                   rotate -> rotate -> rotate -> rotate -> box -> line 2
                   """
        ,
         input:    """
                   2 times rotate box line 2
                   """
         expected: """
                   2.times -> rotate -> box -> line 2
                   """
        ,
         input:    """
                   rotate rotate box
                   """
         expected: """
                   rotate -> rotate -> box()
                   """
        ,
         input:    """
                   10 times rotate scale box
                   """
         expected: """
                   10.times -> rotate -> scale -> box()
                   """
        ,
         input:    """
                   rotate time/1000
                   ✓doOnce ->
                   ▶background 255
                   ▶fill 255,0,0
                   ✓doOnce -> ball
                   box
                   """
         expected: """
                   rotate time/1000
                   if false
                   ▶background 255
                   ▶fill 255,0,0

                   box()
                   """
        ,
         input:    """
                   rotate time/1000
                   doOnce ->
                   ▶background 255
                   ▶fill 255,0,0
                   doOnce -> ball
                   box
                   """
         expected: """
                   rotate time/1000
                   1.times ->
                   ▶addDoOnce(1); background 255
                   ▶fill 255,0,0
                   addDoOnce(4); 1.times -> ball()
                   box()
                   """
        ,
         # note that the matrix operations do chain also this case
         # just add a semicolon if you don't wand them to
         input:    """
                   move peg 1.2 move box
                   """
         expected: """
                   move -> peg 1.2, -> move -> box()
                   """
        ,
         input:    """
                   rotate
                   ▶box
                   peg
                   """
         expected: """
                   rotate ->
                   ▶box()
                   peg()
                   """
        ,
         input:    """
                   rotate 2
                   ▶box
                   peg
                   """
         expected: """
                   rotate 2, ->
                   ▶box()
                   peg()
                   """
        ,
         input:    """
                   rotate
                   rotate 2,1,0
                   ▶box
                   ▶rotate 1
                   ▶▶line 3
                   ▶▶move
                   ▶▶rotate
                   ▶▶▶ball 0.6
                   """
         expected: """
                   rotate()
                   rotate 2,1,0, ->
                   ▶box()
                   ▶rotate 1, ->
                   ▶▶line 3
                   ▶▶move()
                   ▶▶rotate ->
                   ▶▶▶ball 0.6
                   """
        ,
         notes:    """
                   A complex case with nested if then else and
                   function definition.
                   """
         input:    """
                   if true then if true then a = -> ball if true then a = -> rect else line ball
                   a
                   """
         expected: """
                   if true then if true then a = -> ball(); if true then a = -> rect() else line -> ball()
                   a()
                   """
        ,
         notes:    """
                   Check that qualifiers don't span over else
                   """
         input:    """
                   if true then move rotate box else move line
                   """
         expected: """
                   if true then move -> rotate -> box() else move -> line()
                   """
        ,
         notes:    """
                   Some times nested in ifs. The final js,
                   consistently with coffeescript, is:
                     if (true) {
                       2..times(function() {
                         box();
                         return line();
                       });
                     } else {
                       peg();
                     }                   
                   """
         input:    """
                   if true then 2 times box line else peg
                   """
         expected: """
                   if true then 2.times -> box -> line() else peg()
                   """
        ,
         notes:    """
                   Some more "times nested in ifs". The final js,
                   consistently with coffeescript, is:
                   if (true) {
                     2..times(function() {
                       box();
                       if (true) {
                         return 2..times(function() {
                           return rect();
                         });
                       }
                     });
                   } else {
                     2..times(function() {
                       peg();
                       return ball();
                   """
         input:    """
                   if true then 2 times box if true then 2 times rect else 2 times peg ball
                   """
         expected: """
                   if true then 2.times -> box(); if true then 2.times -> rect() else 2.times -> peg -> ball()
                   """
        ,
         notes:    """
                   """
         input:    """
                   2 times if true then ball
                   """
         expected: """
                   2.times -> if true then ball()
                   """
        ,
         notes:    """
                   """
         input:    """
                   2 times if true then ball
                   """
         expected: """
                   2.times -> if true then ball()
                   """
        ,
         notes:    """
                   note that you cannot have anonymous
                   functions in the test in coffeescript,
                   i.e. pasting the "expected" below
                   into coffeescript gives an error
                   """
         input:    """
                   if 2 times a then ball
                   """
         expected: """
                   if 2.times -> a then ball()
                   """
        ,
         notes:    """
                   this example doesn't mean anything
                   meaningful...
                   """
         input:    """
                   if (2 times a) then ball
                   """
         expected: """
                   if (2.times -> a) then ball()
                   """
        ,
         notes:    """
                   times and qualifiers within an if-then-else
                   """
         input:    """
                   if random < 0.5 then 2 times rotate box else 3 times move peg
                   """
         expected: """
                   if random() < 0.5 then 2.times -> rotate -> box() else 3.times -> move -> peg()
                   """
        ,
         notes:    """
                   """
         input:    """
                   peg move
                   ▶box
                   peg
                   """
         expected: """
                   peg -> move ->
                   ▶box()
                   peg()
                   """
        ,
         notes:    """
                   """
         input:    """
                   a = 3
                   rotate 2,a+1+3*(a*2.32+Math.PI) 2+a+Math.PI times box
                   peg
                   """
         expected: """
                   a = 3
                   rotate 2,a+1+3*(a*2.32+Math.PI), -> (2+a+Math.PI).times -> box()
                   peg()
                   """
        ,
         notes:    """
                   """
         input:    """
                   rotate move scale 2 times box
                   """
         expected: """
                   rotate -> move -> scale -> 2.times -> box()
                   """
        ,
         notes:    """
                   """
         input:    """
                   if true then rotate move scale box else rotate move scale 2 times box
                   """
         expected: """
                   if true then rotate -> move -> scale -> box() else rotate -> move -> scale -> 2.times -> box()
                   """
        ,
         notes:    """
                   """
         input:    """
                   if true then rotate move scale 2 times box else rotate move scale box
                   """
         expected: """
                   if true then rotate -> move -> scale -> 2.times -> box() else rotate -> move -> scale -> box()
                   """
        ,
         notes:    """
                   """
         input:    """
                   if true then scale rotate else scale rotate 2 times move
                   """
         expected: """
                   if true then scale -> rotate() else scale -> rotate -> 2.times -> move()
                   """
        ,
         notes:    """
                   a long chain of matrix operations will tell
                   whether there are some trandformations that
                   don't quite complete their job.
                   """
         input:    """
                   if true then rotate move scale scale scale scale move move rotate rotate box else rotate move scale scale scale scale move move rotate rotate 2 times box
                   """
         expected: """
                   if true then rotate -> move -> scale -> scale -> scale -> scale -> move -> move -> rotate -> rotate -> box() else rotate -> move -> scale -> scale -> scale -> scale -> move -> move -> rotate -> rotate -> 2.times -> box()
                   """
        ,
         notes:    """
                   note that
                     scale(3) ,(-> box());
                   would give error in coffeescript
                   """
         input:    """
                   scale (3) box
                   ball
                   """
         expected: """
                   scale (3), -> box()
                   ball()
                   """
        ,
         notes:    """
                   """
         input:    """
                   scale(3) box
                   ball
                   """
         expected: """
                   scale(3); box()
                   ball()
                   """
        ,
         notes:    """
                   """
         input:    """
                   scale 2, box
                   """
         expected: """
                   scale 2, -> box()
                   """
        ,
         notes:    """
                   """
         input:    """
                   scale 2,box
                   """
         expected: """
                   scale 2,-> box()
                   """
        ,
         notes:    """
                   """
         input:    """
                   scale 2, -> box
                   """
         expected: """
                   scale 2, -> box()
                   """
        ,
         notes:    """
                   """
         input:    """
                   scale 2, ->box
                   """
         expected: """
                   scale 2, -> box()
                   """
        ,
         notes:    """
                   """
         input:    """
                   scale 2,->box
                   """
         expected: """
                   scale 2,-> box()
                   """
        ,
         notes:    """
                   """
         input:    """
                   rotate 1 + wave, -> box
                   """
         expected: """
                   rotate 1 + wave(), -> box()
                   """
        ,
         notes:    """
                   """
         input:    """
                   localMaterial <box peg 1.1, time rotate ball>
                   """
         expected: """
                   localMaterial (-> (box -> peg 1.1, time, -> rotate -> ball()))
                   """
         failsMootAppends: true
        ,

         notes:    """
                   """
         input:    """
                   a = 2

                   rotate 2 times box box
                   rotate 2 2+2*2 times box
                   rotate 2,a 2+2*2 times box
                   rotate a+1+3 2 times box
                   rotate 2 2 times box
                   rotate 2,a+1+3*(a*2.32+Math.PI) 2+a+Math.PI times box
                   box a + 3 times rotate peg
                   2 times box
                   1+1 times box
                   peg 2 times box
                   n = 2 n times: box
                   rotate wave times box
                   rotate 10*wave times box
                   rotate 10 * wave times box
                   wave wave times box
                   rotate wave wave times box

                   if true then rotate 2 times box box
                   if true then rotate 2 2+2*2 times box
                   if true then rotate 2,a 2+2*2 times box
                   if true then rotate a+1+3 2 times box
                   if true then rotate 2 2 times box
                   if true then rotate 2,a+1+3*(a*2.32+Math.PI) 2+a+Math.PI times box
                   if true then box a + 3 times rotate peg
                   if true then 2 times box
                   if true then 1+1 times box
                   if true then peg 2 times box
                   if true then n = 2 n times: box
                   if true then rotate wave times box
                   if true then rotate 10*wave times box
                   if true then rotate 10 * wave times box
                   if true then wave wave times box
                   if true then rotate wave wave times box

                   if true then rotate 2 times box box else rotate 2 times box box
                   if true then rotate 2 2+2*2 times box else rotate 2 2+2*2 times box
                   if true then rotate 2,a 2+2*2 times box else rotate 2,a 2+2*2 times box
                   if true then rotate a+1+3 2 times box else rotate a+1+3 2 times box
                   if true then rotate 2 2 times box else rotate 2 2 times box
                   if true then rotate 2,a+1+3*(a*2.32+Math.PI) 2+a+Math.PI times box else rotate 2,a+1+3*(a*2.32+Math.PI) 2+a+Math.PI times box
                   if true then box a + 3 times rotate peg else box a + 3 times rotate peg
                   if true then 2 times box else 2 times box
                   if true then 1+1 times box else 1+1 times box
                   if true then peg 2 times box else peg 2 times box
                   if true then n = 2 n times: box else n = 2 n times: box
                   if true then rotate wave times box else rotate wave times box
                   if true then rotate 10*wave times box else rotate 10*wave times box
                   if true then rotate 10 * wave times box else rotate 10 * wave times box
                   if true then wave wave times box else wave wave times box
                   if true then rotate wave wave times box else rotate wave wave times box                   """
         expected: """
                   a = 2

                   rotate -> 2.times -> box -> box()
                   rotate 2, -> (2+2*2).times -> box()
                   rotate 2,a, -> (2+2*2).times -> box()
                   rotate a+1+3, -> 2.times -> box()
                   rotate 2, -> 2.times -> box()
                   rotate 2,a+1+3*(a*2.32+Math.PI), -> (2+a+Math.PI).times -> box()
                   box -> (a + 3).times -> rotate -> peg()
                   2.times -> box()
                   (1+1).times -> box()
                   peg -> 2.times -> box()
                   n = 2; n.times -> box()
                   rotate -> (wave()).times -> box()
                   rotate -> (10*wave()).times -> box()
                   rotate -> (10 * wave()).times -> box()
                   (wave wave()).times -> box()
                   rotate -> (wave wave()).times -> box()

                   if true then rotate -> 2.times -> box -> box()
                   if true then rotate 2, -> (2+2*2).times -> box()
                   if true then rotate 2,a, -> (2+2*2).times -> box()
                   if true then rotate a+1+3, -> 2.times -> box()
                   if true then rotate 2, -> 2.times -> box()
                   if true then rotate 2,a+1+3*(a*2.32+Math.PI), -> (2+a+Math.PI).times -> box()
                   if true then box -> (a + 3).times -> rotate -> peg()
                   if true then 2.times -> box()
                   if true then (1+1).times -> box()
                   if true then peg -> 2.times -> box()
                   if true then n = 2; n.times -> box()
                   if true then rotate -> (wave()).times -> box()
                   if true then rotate -> (10*wave()).times -> box()
                   if true then rotate -> (10 * wave()).times -> box()
                   if true then (wave wave()).times -> box()
                   if true then rotate -> (wave wave()).times -> box()

                   if true then rotate -> 2.times -> box -> box() else rotate -> 2.times -> box -> box()
                   if true then rotate 2, -> (2+2*2).times -> box() else rotate 2, -> (2+2*2).times -> box()
                   if true then rotate 2,a, -> (2+2*2).times -> box() else rotate 2,a, -> (2+2*2).times -> box()
                   if true then rotate a+1+3, -> 2.times -> box() else rotate a+1+3, -> 2.times -> box()
                   if true then rotate 2, -> 2.times -> box() else rotate 2, -> 2.times -> box()
                   if true then rotate 2,a+1+3*(a*2.32+Math.PI), -> (2+a+Math.PI).times -> box() else rotate 2,a+1+3*(a*2.32+Math.PI), -> (2+a+Math.PI).times -> box()
                   if true then box -> (a + 3).times -> rotate -> peg() else box -> (a + 3).times -> rotate -> peg()
                   if true then 2.times -> box() else 2.times -> box()
                   if true then (1+1).times -> box() else (1+1).times -> box()
                   if true then peg -> 2.times -> box() else peg -> 2.times -> box()
                   if true then n = 2; n.times -> box() else n = 2; n.times -> box()
                   if true then rotate -> (wave()).times -> box() else rotate -> (wave()).times -> box()
                   if true then rotate -> (10*wave()).times -> box() else rotate -> (10*wave()).times -> box()
                   if true then rotate -> (10 * wave()).times -> box() else rotate -> (10 * wave()).times -> box()
                   if true then (wave wave()).times -> box() else (wave wave()).times -> box()
                   if true then rotate -> (wave wave()).times -> box() else rotate -> (wave wave()).times -> box()
                   """
        ,
         notes:    """
                   """
         input:    """
                   a = 0
                   af = -> 0
                   b = true
                   bf = -> true
                   if a == 0 then line a
                   if a != 0 then line a
                   if a >= 0 then line a
                   if a <= 0 then line a
                   if af == 0 then line a
                   if af != 0 then line a
                   if af >= 0 then line a
                   if af <= 0 then line a
                   if b and true then line a
                   if b or true then line a
                   if not b then line a
                   if ! b then line a
                   if !b then line a
                   if bf and true then line a
                   if bf or true then line a
                   if not bf then line a
                   if ! bf then line a
                   if !bf then line a
                   """
         expected: """
                   a = 0
                   af = -> 0
                   b = true
                   bf = -> true
                   if a == 0 then line a
                   if a != 0 then line a
                   if a >= 0 then line a
                   if a <= 0 then line a
                   if af() == 0 then line a
                   if af() != 0 then line a
                   if af() >= 0 then line a
                   if af() <= 0 then line a
                   if b and true then line a
                   if b or true then line a
                   if not b then line a
                   if ! b then line a
                   if !b then line a
                   if bf() and true then line a
                   if bf() or true then line a
                   if not bf() then line a
                   if ! bf() then line a
                   if !bf() then line a
                   """
        ,
         notes:    """
                   """
         input:    """
                   myBoxFunc = <box>
                   rotate -> myBoxFunc 1, 2, 3
                   """
         expected: """
                   myBoxFunc = (box)
                   rotate -> myBoxFunc 1, 2, 3
                   """
         notIdempotent: true
         failsMootAppends: true
        ,
         notes:    """
                   """
         input:    """
                   myBoxFunc = <box>
                   rotate
                   ▶myBoxFunc 1, 2, 3
                   """
         expected: """
                   myBoxFunc = (box)
                   rotate ->
                   ▶myBoxFunc 1, 2, 3
                   """
         notIdempotent: true
         failsMootAppends: true
        ,
         notes:    """
                   """
         input:    """
                   myBoxFunc = -> <box>
                   rotate -> myBoxFunc() 1, 2, 3
                   """
         expected: """
                   myBoxFunc = -> (box)
                   rotate -> myBoxFunc() 1, 2, 3
                   """
         notIdempotent: true
         failsMootAppends: true
        ,
         notes:    """
                   """
         input:    """
                   myBoxFunc = (a,b,c) -> box a,b,c
                   rotate -> myBoxFunc 1, 2, 3
                   """
         expected: """
                   myBoxFunc = (a,b,c) -> box a,b,c
                   rotate -> myBoxFunc 1, 2, 3
                   """
        ,
         notes:    """
                   """
         input:    """
                   myBoxFunc = (a,b,c) -> -> box a,b,c
                   rotate myBoxFunc 1, 2, 3
                   """
         expected: """
                   myBoxFunc = (a,b,c) -> -> box a,b,c
                   rotate myBoxFunc 1, 2, 3
                   """
        ,
         notes:    """
                   """
         input:    """
                   myBoxFunc = (a,b,c) -> box a,b,c
                   rotate
                   ▶myBoxFunc 1, 2, 3
                   """
         expected: """
                   myBoxFunc = (a,b,c) -> box a,b,c
                   rotate ->
                   ▶myBoxFunc 1, 2, 3
                   """
        ,
         notes:    """
                   """
         input:    """
                   flickr = (code) -> if random < 0.5 then code()
                   flickr <box peg 1.1 2 times rotate ball>
                   """
         expected: """
                   flickr = (code) -> if random() < 0.5 then code()
                   flickr (-> (box -> peg 1.1, -> 2.times -> rotate -> ball()))
                   """
         notIdempotent: true
         failsMootAppends: true
        ,
         notes:    """
                   """
         input:    """
                   sin time*10 times
                   ▶box
                   """
         expected: """
                   (sin time*10).times ->
                   ▶box()
                   """
        ,
         notes:    """
                   """
         input:    """
                   (sin time*10) times
                   ▶box
                   """
         expected: """
                   ((sin time*10)).times ->
                   ▶box()
                   """
        ,
         notes:    """
                   """
         input:    """
                   time*100 % 1 times
                   ▶box
                   """
         expected: """
                   (time*100 % 1).times ->
                   ▶box()
                   """
        ,
         notes:    """
                   """
         input:    """
                   round(wave 0.5) times
                   ▶box
                   """
         expected: """
                   (round(wave 0.5)).times ->
                   ▶box()
                   """
        ,
         notes:    """
                   """
         input:    """
                   myF = (a)-> sin time*a

                   myF 2 times
                   ▶box
                   """
         expected: """
                   myF = (a) -> sin time*a

                   (myF 2).times ->
                   ▶box()
                   """
        ,
         notes:    """
                   """
         input:    """
                   myF = ()-> sin time*2

                   myF 2 times
                   ▶box
                   """
         expected: """
                   myF = () -> sin time*2

                   myF(); 2.times ->
                   ▶box()
                   """
        ,
         notes:    """
                   """
         input:    """
                   myF = -> sin time*2

                   myF 2 times
                   ▶box
                   """
         expected: """
                   myF = -> sin time*2

                   myF(); 2.times ->
                   ▶box()
                   """
        ,
         notes:    """
                   """
         input:    """
                   myF = (a)-> sin time*2
                   b = myF +4
                   """
         expected: """
                   myF = (a) -> sin time*2
                   b = myF +4
                   """
        ,
         notes:    """
                   """
         input:    """
                   myF = ()-> sin time*2
                   b = myF -4
                   """
         expected: """
                   myF = () -> sin time*2
                   b = myF() -4
                   """
        ,
         notes:    """
                   """
         input:    """
                   myF = -> sin time*2
                   b = myF -4
                   """
         expected: """
                   myF = -> sin time*2
                   b = myF() -4
                   """
        ,
         notes:    """
                   """
         input:    """
                   rotate 1
                   rotate (wave 0.5) * 0.1 box 2
                   """
         expected: """
                   rotate 1
                   rotate (wave 0.5) * 0.1, -> box 2
                   """
        ,
         notes:    """
                   """
         input:    """
                   a = (val) -> val * 2
                   rotate 3, a 1 box 3, 4, a 1
                   """
         expected: """
                   a = (val) -> val * 2
                   rotate 3, (a 1), -> box 3, 4, a 1
                   """
        ,
         notes:    """
                   """
         input:    """
                   a = (val) -> val * 2
                   rotate 3, wave wave 2 box 3, 4, a 1
                   """
         expected: """
                   a = (val) -> val * 2
                   rotate 3, (wave wave 2), -> box 3, 4, a 1
                   """
        ,
         notes:    """
                   """
         input:    """
                   a = (val) -> val * 2
                   rotate 3, wave pulse / 10 box 3, 4, a 1
                   """
         expected: """
                   a = (val) -> val * 2
                   rotate 3, (wave pulse() / 10), -> box 3, 4, a 1
                   """
        ,
         notes:    """
                   """
         input:    """
                   rotate 3 scale 2 box 3, 4
                   """
         expected: """
                   rotate 3, -> scale 2, -> box 3, 4
                   """
        ,
         notes:    """
                   Code blocks being passed to a function,
                   one accepting a parameter and the other one
                   returning a value
                   """
         input:    """
                   either = (a,b) -> if random > 0.5 then a 2 else b()
                   console.log either <box>, <random>
                   """
         expected: """
                   either = (a,b) -> if random() > 0.5 then a 2 else b()
                   console.log either (box), (random)
                   """
         notIdempotent: true
         failsMootAppends: true
         failsMootPrepends: true
        ,
         notes:    """
                   """
         input:    """
                   noFill
                   fill red stroke white rect
                   ball
                   """
         expected: """
                   noFill()
                   fill red, -> stroke white, -> rect()
                   ball()
                   """
         failsMootAppends: true
         failsMootPrepends: true
        ,
         notes:    """
                   checking that comments on the last line
                   are properly stripped
                   """
         input:    """
                   either = (a,b) -> if random > 0.5 then a() else b() // ouch
                   either <box>, <peg> //ouch
                   """
         expected: """
                   either = (a,b) -> if random() > 0.5 then a() else b() 
                   either (box), (peg)
                   """
         notIdempotent: true
         failsMootAppends: true
         failsMootPrepends: true
        ,
         notes:    """
                   """
         input:    """
                   red box
                   """
         expected: """
                   fill red, -> box()
                   """
         notIdempotent: true
         failsMootAppends: true
        ,
         notes:    """
                   """
         input:    """
                   line red box
                   """
         expected: """
                   line -> fill red, -> box()
                   """
         notIdempotent: true
         failsMootAppends: true
        ,
         notes:    """
                   """
         input:    """
                   fill red,22 red box
                   """
         expected: """
                   fill red,22, -> fill red, -> box()
                   """
         notIdempotent: true
         failsMootAppends: true
        ,
         notes:    """
                   """
         input:    """
                   fill red,20+5*pulse+sin(time) box 3,5 yellow stroke box
                   """
         expected: """
                   fill red,20+5*pulse()+sin(time), -> box 3,5, -> stroke yellow, -> box()
                   """
         notIdempotent: true
         failsMootAppends: true
        ,
         notes:    """
                   """
         input:    """
                   red yellow stroke box
                   """
         expected: """
                   fill red, -> stroke yellow, -> box()
                   """
         notIdempotent: true
         failsMootAppends: true


      ]

  CodePreprocessorTests
