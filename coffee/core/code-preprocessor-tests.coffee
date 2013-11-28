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
                   peg; times rotate box 2* wave
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
                   if random() > 0.5 then rotate; box else times rotate; peg; true
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
                   box(); (a + 3).times -> pushMatrix(); rotate(); peg(); popMatrix()
                   """
        ,
         notes:    """
                   Checking "qualifying" rotate
                   """
         input:    """
                   6 times: rotate box
                   """
         expected: """
                   6.times -> pushMatrix(); rotate(); box(); popMatrix()
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
                   myFunc = -> 20.times -> pushMatrix(); rotate(); box(); popMatrix()
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
                   myFunc = (a,b) -> if true then 20.times -> pushMatrix(); rotate(); box(); popMatrix()
                   """
        ,
         notes:    """
                   Checking multiple times within if then statement
                   """
         input:    """
                   if true then 2 times box 3 times line 2
                   """
         expected: """
                   if true then 2.times -> box(); 3.times -> line 2
                   """
        ,
         notes:    """
                   Checking that separate rotate and primitive
                   within a times body remain correctly separated.
                   """
         input:    """
                   6 times: rotate; box
                   """
         expected: """
                   6.times -> rotate(); box()
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
                   ▶pushMatrix(); rotate(); box(); popMatrix()
                   """
        ,
         input:    """
                   1+1 times: rotate; box
                   """
         expected: """
                   (1+1).times -> rotate(); box()
                   """
        ,
         input:    """
                   peg; 2 times rotate box 2* wave
                   """
         expected: """
                   peg(); 2.times -> pushMatrix(); rotate(); box 2* wave(); popMatrix()
                   """
        ,
         input:    """
                   n = 2; n times: rotate;box
                   """
         expected: """
                   n = 2; n.times -> rotate(); box()
                   """
        ,
         input:    """
                   n = 2; (n+0).times -> rotate(); box()
                   """
         expected: """
                   n = 2; (n+0).times -> rotate(); box()
                   """
        ,
         input:    """
                   n = 2; rotate(n+0);rotate(); box()
                   """
         expected: """
                   n = 2; rotate(n+0); rotate(); box()
                   """
        ,
         input:    """
                   n = 2; rotate n + 1; box
                   """
         expected: """
                   n = 2; rotate n + 1; box()
                   """
        ,
         input:    """
                   box; box ;  2 times: rotate; peg 1.3
                   """
         expected: """
                   box(); box(); 2.times -> rotate(); peg 1.3
                   """
        ,
         input:    """
                   if random > 0.5 then 3 times: rotate; box else 3 times rotate; 2 times: peg; true
                   """
         expected: """
                   if random()> 0.5 then 3.times -> rotate(); box() else 3.times -> rotate(); 2.times -> peg(); true
                   """
        ,
         input:    """
                   if true then 3 times rotate; box
                   """
         expected: """
                   if true then 3.times -> rotate(); box()
                   """
        ,
         input:    """
                   (9+0).times -> rotate; box
                   """
         expected: """
                   (9+0).times -> rotate(); box()
                   """
        ,
         input:    """
                   if random() > 0.5 then rotate; box else 3 times rotate; peg; true
                   """
         expected: """
                   if random() > 0.5 then rotate(); box() else 3.times -> rotate(); peg(); true
                   """
        ,
         input:    """
                   if random() > 0.5 then rotate 1 + wave box else 3 times rotate; peg; true
                   """
         expected: """
                   if random() > 0.5 then pushMatrix(); rotate 1 + wave(); box(); popMatrix(); else 3.times -> rotate(); peg(); true
                   """
        ,
         input:    """
                   // testing whether mangled accross multiple lines
                   if random() > 0.5 then box
                   2 times: box
                   2 times: rotate; box
                   """
         expected: """
                   
                   if random() > 0.5 then box()
                   2.times -> box()
                   2.times -> rotate(); box()
                   """
        ,
         input:    """
                   // testing whether mangled accross multiple lines
                   6 times: rotate; box
                   6 times:
                   ▶rotate box
                   """
         expected: """
                   
                   6.times -> rotate(); box()
                   6.times -> 
                   ▶pushMatrix(); rotate(); box(); popMatrix()
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
                   ball(); line(); peg()
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
                   2 times rotate box wave; wave
                   """
         expected: """
                   2.times -> pushMatrix(); rotate(); box wave(); popMatrix(); wave()
                   """
        ,
         input:    """
                   box + box
                   """
         expected: """
                   box + box()
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
                   a = wave()+ wave()
                   """
        ,
         input:    """
                   (wave + wave)
                   """
         expected: """
                   (wave()+ wave())
                   """
        ,
         input:    """
                   ;wave
                   """
         expected: """
                   ; wave()
                   """
        ,
         input:    """
                   ;wave;
                   """
         expected: """
                   ; wave()
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
                   2 times: rotate; box
                   """
         expected: """
                   2.times -> rotate(); box()
                   """
        ,
         input:    """
                   2 times rotate box wave
                   """
         expected: """
                   2.times -> pushMatrix(); rotate(); box wave(); popMatrix()
                   """
        ,
         input:    """
                   rotate box 2,33
                   """
         expected: """
                   pushMatrix(); rotate(); box 2,33; popMatrix()
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
                   2.times -> pushMatrix(); rotate(); box wave(); popMatrix()
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
                   2 times: move; rotate wave; box
                   """
         expected: """
                   2.times -> move(); rotate wave(); box()
                   """
        ,
         input:    """
                   rotate wave box
                   """
         expected: """
                   pushMatrix(); rotate wave(); box(); popMatrix()
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
                   a = wave()-1
                   """
        ,
         input:    """
                   a = wave - 1
                   """
         expected: """
                   a = wave()- 1
                   """
        ,
         input:    """
                   rotate wave times box
                   """
         expected: """
                   rotate(); (wave()).times -> box()
                   """
        ,
         input:    """
                   rotate 10*wave times box
                   """
         expected: """
                   rotate(); (10*wave()).times -> box()
                   """
        ,
         input:    """
                   rotate 10 * wave times box
                   """
         expected: """
                   rotate(); (10 * wave()).times -> box()
                   """
        ,
         input:    """
                   rotate wave * wave times box
                   """
         expected: """
                   rotate(); (wave()* wave()).times -> box()
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
                   rotate(); (wave()*wave()).times -> box()
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
                   rotate(); 2.times -> box()
                   """
        ,
         input:    """
                   rotate wave 2 times box
                   """
         expected: """
                   rotate(); (wave 2).times -> box()
                   """
        ,
         input:    """
                   rotate wave + 2 times box
                   """
         expected: """
                   rotate(); (wave()+ 2).times -> box()
                   """
        ,
         input:    """
                   box 2 times box
                   """
         expected: """
                   box(); 2.times -> box()
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
                   2.times -> box(); 3.times -> line 2
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
                   a=wave()+wave()+wave()
                   """
        ,
         # in this case the user probably
         # meant to keep a box, a peg and a line
         # spinning. We don't give her that.
         # we draw the box, the peg and the line
         # and we do nothing. In this case
         # the user should understand that
         # one can't pass a primitive to
         # a function that is meant to
         # accept a number only.
         input:    """
                   rotate(box,peg,line)
                   """
         expected: """
                   rotate(box(),peg(),line())
                   """
        ,
         input:    """
                   rotate box peg line
                   """
         expected: """
                   pushMatrix(); rotate(); box(); peg(); line(); popMatrix()
                   """
        ,
         input:    """
                   rotate 2 box peg line
                   """
         expected: """
                   pushMatrix(); rotate 2; box(); peg(); line(); popMatrix()
                   """
        ,
         input:    """
                   rotate 2 + n box peg line
                   """
         expected: """
                   pushMatrix(); rotate 2 + n; box(); peg(); line(); popMatrix()
                   """
        ,
         input:    """
                   rotate 2 + time box peg line
                   """
         expected: """
                   pushMatrix(); rotate 2 + time; box(); peg(); line(); popMatrix()
                   """
        ,
         input:    """
                   for i in [0...wave * 2]
                   """
         expected: """
                   for i in [0...wave()* 2]
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
         # but we want to check that it doesn't give
         # any errors
         input:    """
                   either = (a,b) -> if random > 0.5 then a() else b()
                   either box, peg
                   """
         expected: """
                   either = (a,b) -> if random()> 0.5 then a() else b()
                   either box(), peg()
                   """
        ,
         input:    """
                   either = (a,b) -> if random > 0.5 then a() else b()
                   rotate box, peg
                   """
         expected: """
                   either = (a,b) -> if random()> 0.5 then a() else b()
                   pushMatrix(); rotate(); box(), peg(); popMatrix()
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
                   pushMatrix(); move(); pushMatrix(); popMatrix(); rotate(); pushMatrix(); scale 3; box(); peg(); line 2; popMatrix(); popMatrix()
                   pushMatrix(); move 0.1; peg(); popMatrix(); pushMatrix(); move 0.4; box(); popMatrix()
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
                   noFill
                   sizes = [1..3]
                   ball size for size in sizes when size isnt 3
                   # yo dawg I heard you like balls so I put a ball inside a ball so you can see balls inside balls
                   """
         expected: """
                   noFill()
                   sizes = [1..3]
                   ball size for size in sizes when size isnt 3
                   # yo dawg I heard you like balls so I put a; ball inside a; ball so you can see balls inside balls
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
                   pushMatrix(); scale 2, d; box b, c; popMatrix()
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
                   pushMatrix(); scale 2, d(); box b, c; popMatrix()
                   """
        ,
         input:    """
                   a = 2
                   scale 2, a; box b, c
                   """
         expected: """
                   a = 2
                   scale 2, a; box b, c
                   """
        ,
         input:    """
                   either = (a,b) -> if random > 0.5 then a() else b()
                   either (->box), (->peg)
                   """
         expected: """
                   either = (a,b) -> if random()> 0.5 then a() else b()
                   either (->box()), (->peg())
                   """
        ,
         input:    """
                   either = (a,b) -> if random > 0.5 then a() else b()
                   either <box>, <peg>
                   """
         expected: """
                   either = (a,b) -> if random()> 0.5 then a() else b()
                   either box, peg
                   """
         notIdempotent: true
        ,
         input:    """
                   rand = (arg) -> random(arg)
                   box rand line peg
                   """
         expected: """
                   rand = (arg) -> random(arg)
                   box rand(); line(); peg()
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
                   pushMatrix(); scale(); pushMatrix(); popMatrix(); rotate(); box 2; peg 2.3; popMatrix()
                   """
        ,
         input:    """
                   scale rotate box 2; peg 2.3
                   """
         expected: """
                   pushMatrix(); scale(); pushMatrix(); popMatrix(); rotate(); box 2; popMatrix(); peg 2.3
                   """
        ,
         input:    """
                   rotate box peg 1.1
                   """
         expected: """
                   pushMatrix(); rotate(); box(); peg 1.1; popMatrix()
                   """
        ,
         input:    """
                   rotate box; peg 1.1
                   """
         expected: """
                   pushMatrix(); rotate(); box(); popMatrix(); peg 1.1
                   """
        ,
         input:    """
                   rotate box; rotate line 2
                   """
         expected: """
                   pushMatrix(); rotate(); box(); popMatrix(); pushMatrix(); rotate(); line 2; popMatrix()
                   """
        ,
         input:    """
                   rotate box line 2
                   """
         expected: """
                   pushMatrix(); rotate(); box(); line 2; popMatrix()
                   """
        ,
         input:    """
                   rotate rotate rotate rotate box line 2
                   """
         expected: """
                   pushMatrix(); rotate(); pushMatrix(); rotate(); pushMatrix(); rotate(); pushMatrix(); rotate(); box(); line 2; popMatrix(); popMatrix(); popMatrix(); popMatrix()
                   """
        ,
         input:    """
                   2 times rotate box line 2
                   """
         expected: """
                   2.times -> pushMatrix(); rotate(); box(); line 2; popMatrix()
                   """
        ,
         input:    """
                   rotate rotate box
                   """
         expected: """
                   pushMatrix(); rotate(); pushMatrix(); rotate(); box(); popMatrix(); popMatrix()
                   """
        ,
         input:    """
                   10 times rotate scale box
                   """
         expected: """
                   10.times -> pushMatrix(); rotate(); pushMatrix(); scale(); box(); popMatrix(); popMatrix()
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
                   ; addDoOnce(4); 1.times -> ball()
                   box()
                   """
        ,
         # note that the matrix operations don't chain in this case
         # I think this is consistent, as I would expect
         #    move box move box 
         # to behave the same as
         # 2 times move box
         input:    """
                   move peg 1.2 move box
                   """
         expected: """
                   pushMatrix(); move(); peg 1.2;  popMatrix(); pushMatrix(); move(); box(); popMatrix()
                   """
      ]

  CodePreprocessorTests
