###
## test cases for the CodePreprocessor
###

define ['core/code-preprocessor-tests'], (foo) ->

  class CodePreprocessorTests

    testCases: null

    constructor: ->

      @testCases= [
         input:    """
                   5 times
                     rotate 0,1,time/5000
                     move 0.2,0,0
                     3 times
                       rotate 1
                       box
                   """
         expected: """
                   (5+0).times -> 
                     rotate 0,1,time/5000
                     move 0.2,0,0
                     (3+0).times -> 
                       rotate 1
                       box()
                   """
        ,
         input:    """
                   // should give error
                   peg
                   times
                     box 2
                   """
         error: "how many times?"
        ,
         input:    """
                   // should give error
                   times
                     box
                   """
         error: "how many times?"
        ,
         input:    """
                   // should give error
                   peg; times rotate box 2* wave
                   """
         error: "how many times?"
        ,
         input:    """
                   // should give error
                   if true then  times do that
                   """
         error: "how many times?"
        ,
         input:    """
                   // should give error
                   if random() > 0.5 then rotate; box else times rotate; peg; true
                   """
         error: "how many times?"
        ,
         input:    """
                   6 times: rotate box
                   """
         expected: """
                   (6+0).times ->  rotate(); box()
                   """
        ,
         input:    """
                   6 times: rotate; box
                   """
         expected: """
                   (6+0).times ->  rotate(); box()
                   """
        ,
         input:    """
                   6 times:
                     rotate box
                   """
         expected: """
                   (6+0).times -> 
                     rotate(); box()
                   """
        ,
         input:    """
                   1+1 times: rotate; box
                   """
         expected: """
                   (1+1+0).times ->  rotate(); box()
                   """
        ,
         input:    """
                   peg; 2 times rotate box 2* wave
                   """
         expected: """
                   peg(); (2+0).times ->  rotate(); box 2* wave()
                   """
        ,
         input:    """
                   n = 2; n times: rotate;box
                   """
         expected: """
                   n = 2; (n+0).times ->  rotate(); box()
                   """
        ,
         input:    """
                   box; box ;  2 times: rotate; peg 1.3
                   """
         expected: """
                   box(); box(); (2+0).times ->  rotate(); peg 1.3
                   """
        ,
         input:    """
                   if random > 0.5 then 3 times: rotate; box else 3 times rotate; 2 times: peg; true
                   """
         expected: """
                   if random()> 0.5 then (3+0).times ->  rotate(); box() else (3+0).times ->  rotate(); (2+0).times ->  peg(); true
                   """
        ,
         input:    """
                   if true then 3 times rotate; box
                   """
         expected: """
                   if true then (3+0).times ->  rotate(); box()
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
                   if random() > 0.5 then rotate(); box() else (3+0).times ->  rotate(); peg(); true
                   """
        ,
         input:    """
                   if random() > 0.5 then rotate 1 + wave box else 3 times rotate; peg; true
                   """
         expected: """
                   if random() > 0.5 then rotate 1 + wave(); box() else (3+0).times ->  rotate(); peg(); true
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
                   (2+0).times ->  box()
                   (2+0).times ->  rotate(); box()
                   """
        ,
         input:    """
                   // testing whether mangled accross multiple lines
                   6 times: rotate; box
                   6 times:
                     rotate box
                   """
         expected: """
                   
                   (6+0).times ->  rotate(); box()
                   (6+0).times -> 
                     rotate(); box()
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
                   (2+0).times ->  rotate(); box wave(); wave()
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
                   (2+0).times ->  box()
                   """
        ,
         input:    """
                   2 times: rotate; box
                   """
         expected: """
                   (2+0).times ->  rotate(); box()
                   """
        ,
         input:    """
                   2 times rotate box wave
                   """
         expected: """
                   (2+0).times ->  rotate(); box wave()
                   """
        ,
         input:    """
                   rotate box 2,33
                   """
         expected: """
                   rotate(); box 2,33
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
                   (2+0).times ->  rotate(); box wave()
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
                   (2+0).times ->  move(); rotate wave(); box()
                   """
        ,
         input:    """
                   rotate wave box
                   """
         expected: """
                   rotate wave(); box()
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
         # would probably prefer this to be processed into
         # rotate (wave()+0).times ->  box()
         # so that "times" captures up to anything that
         # can be a number,
         # but I can't think of any clear example of
         # where this is clearly useful and where the
         # translation below is clearly unexpected.
         # It rather seems a very odd case with no
         # clear purpose where the user is not
         # expecting any particular result.
         input:    """
                   rotate wave times box
                   """
         expected: """
                   (rotate wave()+0).times ->  box()
                   """
        ,
         input:    """
                   rotate 2 times box
                   """
         expected: """
                   (rotate 2+0).times ->  box()
                   """
        ,
         input:    """
                   rotate wave 2 times box
                   """
         expected: """
                   (rotate wave 2+0).times ->  box()
                   """
        ,
         input:    """
                   rotate wave + 2 times box
                   """
         expected: """
                   (rotate wave()+ 2+0).times ->  box()
                   """
        ,
         input:    """
                   box 2 times box
                   """
         expected: """
                   (box 2+0).times ->  box()
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
                   rotate(); box(); peg(); line()
                   """
        ,
         input:    """
                   rotate 2 box peg line
                   """
         expected: """
                   rotate 2; box(); peg(); line()
                   """
        ,
         input:    """
                   rotate 2 + n box peg line
                   """
         expected: """
                   rotate 2 + n; box(); peg(); line()
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
                   rotate(); box(), peg()
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
                   move(); rotate(); scale 3; box(); peg(); line 2
                   move 0.1; peg(); move 0.4; box()
                   """
        ,
         input:    """
                   noFill
                   for i in [1..20]
                       rotate time/100000
                       box i/8
                   """
         expected: """
                   noFill()
                   for i in [1..20]
                       rotate time/100000
                       box i/8
                   """
        ,
         input:    """
                   noFill
                   for i in [1..20] by 5
                       rotate time/100000
                       box i/8
                   """
         expected: """
                   noFill()
                   for i in [1..20] by 5
                       rotate time/100000
                       box i/8
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
                       rotate time/100000
                       box i/8
                   """
         expected: """
                   noFill()
                   20.times (i) ->
                       rotate time/100000
                       box i/8
                   """
        ,
         input:    """
                   scale 0.1
                   shapes = 'box': 1, 'ball': 2, 'peg': 3
                   
                   for shape, size of shapes
                       move 2
                       eval(shape+"(" + size+")")
                   """
         expected: """
                   scale 0.1
                   shapes = 'box': 1, 'ball': 2, 'peg': 3
                   
                   for shape, size of shapes
                       move 2
                       eval(shape+"(" + size+")")
                   """
      ]

  CodePreprocessorTests
