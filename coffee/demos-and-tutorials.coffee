#jslint browser: true, nomen: true, regexp: true 
#global $, Detector 
"use strict"

class ProgramLoader

  constructor: (@eventRouter, @texteditor, @liveCodeLabCoreInstance) ->
    @lastHash = ""
    userWarnedAboutWebglExamples = false
    @program = {}
    setInterval(
      ()=>
        @pollHash()
      , 100)
    # Setup Event Listeners
    eventRouter.bind "url-hash-changed", ((hash) =>
      @loadAppropriateDemoOrTutorialBasedOnHash hash
    ), @
    
    @program.roseDemo =
		  """
		  // 'B rose' by Guy John (@rumblesan)
		  // Mozilla Festival 2012
		  // adapted from 'A rose' by Lib4tech
		  
		  doOnce -> frame = 0
		  background red
		  scale 1.5
		  animationStyle paintOver
		  rotate frame/100
		  fill 255-((frame/2)%255),0,0
		  stroke 255-((frame/2)%255),0,0
		  scale 1-((frame/2)%255) / 255
		  box
		  """.replace(/\u25B6/g, "\t")
    
    @program.cheeseAndOlivesDemo =
      """
      // 'Cheese and olives' by
      // Davina Tirvengadum
      // Mozilla festival 2012
      
      background white
      scale .3
      move 0,-1
      fill yellow
      stroke black
      rotate
      strokeSize 3
      line 4
      box
      
      rotate 2,3
      move 0,3
      scale .3
      fill black
      stroke black
      ball
      
      rotate 3
      move 5
      scale 1
      fill green
      stroke green
      ball
      
      rotate 1
      move -3
      scale 1
      fill yellow
      stroke yellow
      ball
      """.replace(/\u25B6/g, "\t")
  
    @program.simpleCubeDemo =
      """
      // there you go!
      // a simple cube!
      
      background yellow
      rotate 0,time/2000,time/2000
      box
      """.replace(/\u25B6/g, "\t")
  
    @program.webgltwocubesDemo =
      """
      background 155,255,255
      2 times ->
      ▶rotate 0, 1, time/2000
      ▶box
      """.replace(/\u25B6/g, "\t")
  
    @program.cubesAndSpikes =
      """
      simpleGradient fuchsia,color(100,200,200),yellow
      scale 2.1
      5 times ->
      ▶rotate 0,1,time/5000
      ▶box 0.1,0.1,0.1
      ▶move 0,0.1,0.1
      ▶3 times ->
      ▶▶rotate 0,1,1
      ▶▶box 0.01,0.01,1
      """.replace(/\u25B6/g, "\t")
  
    @program.webglturbineDemo =
      """
      background 155,55,255
      70 times ->
      ▶rotate time/100000,1,time/100000
      ▶box
      """.replace(/\u25B6/g, "\t")
  
    @program.webglzfightartDemo =
      """
      // Explore the artifacts
      // of your GPU!
      // Go Z-fighting, go!
      scale 5
      rotate
      fill red
      box
      rotate 0.000001
      fill yellow
      box
      """.replace(/\u25B6/g, "\t")
  
    @program.littleSpiralOfCubes =
      """
      background orange
      scale 0.1
      10 times ->
      ▶rotate 0,1,time/1000
      ▶move 1,1,1
      ▶box
      """.replace(/\u25B6/g, "\t")
  
    @program.tentacleDemo =
      """
      background 155,255,155
      scale 0.15
      3 times ->
      ▶rotate 0,1,1
      ▶10 times ->
      ▶▶rotate 0,1,time/1000
      ▶▶scale 0.9
      ▶▶move 1,1,1
      ▶▶box
      """.replace(/\u25B6/g, "\t")
  
    @program.lampDemo =
      """
      animationStyle motionBlur
      simpleGradient red,yellow,color(255,0,255)
      //animationStyle paintOver
      scale 2
      rotate time/4000, time/4000,  time/4000
      90 times ->
      ▶rotate time/200000, time/200000,  time/200000
      ▶line
      ▶move 0.5,0,0
      ▶line
      ▶move -0.5,0,0
      ▶line
      ▶line
      """.replace(/\u25B6/g, "\t")
  
    @program.trillionfeathersDemo =
      """
      animationStyle paintOver
      move 2,0,0
      scale 2
      rotate
      20 times ->
      ▶rotate
      ▶move 0.25,0,0
      ▶line
      ▶move -0.5,0,0
      ▶line
      """.replace(/\u25B6/g, "\t")
  
    @program.monsterblobDemo =
      """
      ballDetail 6
      animationStyle motionBlur
      rotate time/5000
      simpleGradient fuchsia,aqua,yellow
      5 times ->
      ▶rotate 0,1,time/5000
      ▶move 0.2,0,0
      ▶3 times ->
      ▶▶rotate 1
      ▶▶ball -1
      """.replace(/\u25B6/g, "\t")
  
    @program.industrialMusicDemo =
      """
      bpm 88
      play 'alienBeep'  ,'zzxz zzzz zzxz zzzz'
      play 'beepC'  ,'zxzz zzzz xzzx xxxz'
      play 'beepA'  ,'zzxz zzzz zzxz zzzz'
      play 'lowFlash'  ,'zzxz zzzz zzzz zzzz'
      play 'beepB'  ,'xzzx zzzz zxzz zxzz'
      play 'voltage'  ,'xzxz zxzz xzxx xzxx'
      play 'tranceKick'  ,'zxzx zzzx xzzz zzxx'
      """.replace(/\u25B6/g, "\t")
  
    @program.trySoundsDemo =
      """
      bpm 88
      // leave this one as base
      play 'tranceKick'  ,'zxzx zzzx xzzz zzxx'
      
      // uncomment the sounds you want to try
      //play 'toc'  ,'zzxz zzzz zzxz zzzz'
      //play 'highHatClosed'  ,'zzxz zzzz zzxz zzzz'
      //play 'highHatOpen'  ,'zzxz zzzz zzxz zzzz'
      //play 'toc2'  ,'zzxz zzzz zzxz zzzz'
      //play 'toc3'  ,'zzxz zzzz zzxz zzzz'
      //play 'toc4'  ,'zzxz zzzz zzxz zzzz'
      //play 'snare'  ,'zzxz zzzz zzxz zzzz'
      //play 'snare2'  ,'zzxz zzzz zzxz zzzz'
      //play 'china'  ,'zzxz zzzz zzxz zzzz'
      //play 'crash'  ,'zzxz zzzz zzxz zzzz'
      //play 'crash2'  ,'zzxz zzzz zzxz zzzz'
      //play 'crash3'  ,'zzxz zzzz zzxz zzzz'
      //play 'ride'  ,'zzxz zzzz zzxz zzzz'
      //play 'glass'  ,'zzxz zzzz zzxz zzzz'
      //play 'glass1'  ,'zzxz zzzz zzxz zzzz'
      //play 'glass2'  ,'zzxz zzzz zzxz zzzz'
      //play 'glass3'  ,'zzxz zzzz zzxz zzzz'
      //play 'thump'  ,'zzxz zzzz zzxz zzzz'
      //play 'lowFlash'  ,'zzxz zzzz zzxz zzzz'
      //play 'lowFlash2'  ,'zzxz zzzz zzxz zzzz'
      //play 'tranceKick2'  ,'zzxz zzzz zzxz zzzz'
      //play 'tranceKick'  ,'zzxz zzzz zzxz zzzz'
      //play 'wosh'  ,'zzxz zzzz zzxz zzzz'
      //play 'voltage'  ,'zzxz zzzz zzxz zzzz'
      //play 'beepA'  ,'zzxz zzzz zzxz zzzz'
      //play 'beepB'  ,'zzxz zzzz zzxz zzzz'
      //play 'beepC'  ,'zzxz zzzz zzxz zzzz'
      //play 'beepD'  ,'zzxz zzzz zzxz zzzz'
      //play 'beep'  ,'zzxz zzzz zzxz zzzz'
      //play 'hello'  ,'zzxz zzzz zzxz zzzz'
      //play 'alienBeep'  ,'zzxz zzzz zzxz zzzz'
      """.replace(/\u25B6/g, "\t")
  
    @program.springysquaresDemo =
      """
      animationStyle motionBlur
      simpleGradient fuchsia,color(100,200,200),yellow
      scale 0.3
      3 times ->
      ▶move 0,0,0.5
      ▶5 times ->
      ▶▶rotate time/2000
      ▶▶move 0.7,0,0
      ▶▶rect
      """.replace(/\u25B6/g, "\t")
  
    @program.diceDemo =
      """
      animationStyle motionBlur
      simpleGradient color(255),moccasin,peachpuff
      stroke 255,100,100,255
      fill red,155
      move -0.5,0,0
      scale 0.3
      3 times ->
      ▶move 0,0,0.5
      ▶1 times ->
      ▶▶rotate time/1000
      ▶▶move 2,0,0
      ▶▶box
      """.replace(/\u25B6/g, "\t")
  
    @program.webglalmostvoronoiDemo =
      """
      scale 10
      2 times ->
      ▶rotate 0,1,time/10000
      ▶ball -1
      """.replace(/\u25B6/g, "\t")
  
    @program.webglshardsDemo =
      """
      scale 10
      fill 0
      strokeSize 7
      5 times ->
      ▶rotate 0,1,time/20000
      ▶ball 
      ▶rotate 0,1,1
      ▶ball -1.01
      """.replace(/\u25B6/g, "\t")
  
    @program.webglredthreadsDemo =
      """
      scale 10.5
      background black
      stroke red
      noFill
      strokeSize 7
      5 times ->
      ▶rotate time/20000
      ▶ball
      ▶rotate 0,1,1
      ▶ball
      """.replace(/\u25B6/g, "\t")
  
    @program.webglnuclearOctopusDemo =
      """
      simpleGradient black,color(0,0,(time/5)%255),black
      scale 0.2
      move 5,0,0
      animationStyle motionBlur
      //animationStyle paintOver
      stroke 255,0,0,120
      fill time%255,0,0
      pushMatrix
      count = 0
      3 times ->
      ▶count++
      ▶pushMatrix
      ▶rotate count+3+time/1000,2+count + time/1000,4+count
      ▶120 times ->
      ▶▶scale 0.9
      ▶▶move 1,1,0
      ▶▶rotate time/100
      ▶▶box
      ▶popMatrix
      """.replace(/\u25B6/g, "\t")
  
    @program.introTutorial =
      """
      // Lines beginning with two
      // slashes (like these) are just comments.
      
      // Everything else is run
      // about 30 to 60 times per second
      // in order to create an animation.
      
      // Click the link below to start the tutorial.
      
      // next-tutorial:hello_world
      """.replace(/\u25B6/g, "\t")
  
    @program.helloworldTutorial =
      """
      // type these three letters
      // in one of these empty lines below:
      // 'b' and 'o' and 'x'
      
      
      
      // (you should then see a box facing you)
      // click below for the next tutorial
      // next-tutorial:some_notes
      """.replace(/\u25B6/g, "\t")
  
    @program.somenotesTutorial =
      """
      // If this makes sense to you:
      // the syntax is similar to Coffeescript
      // and the commands are almost
      // like Processing.
      
      // If this doesn't make sense to you
      // don't worry.
      
      // next-tutorial:rotate
      """.replace(/\u25B6/g, "\t")
  
    @program.rotateTutorial =
      """
      // now that we have a box
      // let's rotate it:
      // type 'rotate 1' in the
      // line before the 'box'
      
      
      box
      
      // click for the next tutorial:
      // next-tutorial:frame
      """.replace(/\u25B6/g, "\t")
  
    @program.frameTutorial =
      """
      // make the box spin
      // by replacing '1' with 'frame'
      
      rotate 1
      box
      
      // 'frame' contains a number
      // always incrementing as
      // the screen is re-drawn.
      // (use 'frame/100' to slow it down)
      // next-tutorial:time
      """.replace(/\u25B6/g, "\t")
  
    @program.timeTutorial =
      """
      // 'frame/100' has one problem:
      // faster computers will make
      // the cube spin too fast.
      // Replace it with 'time/2000'.
      
      rotate frame/100
      box
      
      // 'time' counts the
      // number of milliseconds since
      // the program started, so it's
      // independent of how fast
      // the computer is at drawing.
      // next-tutorial:move
      """.replace(/\u25B6/g, "\t")
  
    @program.moveTutorial =
      """
      // you can move any object
      // by using 'move'
      
      box
      move 1,1,0
      box
      
      // try to use a rotate before
      // the first box to see how the
      // scene changes.
      // next-tutorial:scale
      """.replace(/\u25B6/g, "\t")
  
    @program.scaleTutorial =
      """
      // you can make an object bigger
      // or smaller by using 'scale'
      
      rotate 3
      box
      move 1
      scale 2
      box
      
      // try to use scale or move before
      // the first box to see how the
      // scene changes.
      // next-tutorial:times
      """.replace(/\u25B6/g, "\t")
  
    @program.timesTutorial =
      """
      // 'times' (not to be confused with
      // 'time'!) can be used to
      // repeat operations like so:
      
      rotate 1
      3 times ->
      ▶move 0.2,0.2,0.2
      ▶box
      
      // note how the tabs indicate
      // exactly the block of code
      // to be repeated.
      // next-tutorial:fill
      """.replace(/\u25B6/g, "\t")
  
    @program.fillTutorial =
      """
      // 'fill' changes the
      // color of all the faces:
      
      rotate 1
      fill 255,255,0
      box
      
      // the three numbers indicate 
      // red green and blue values.
      // You can also use color names such as 'indigo'
      // Try replacing the numbers with
      // 'angleColor'
      // next-tutorial:stroke
      """.replace(/\u25B6/g, "\t")
  
    @program.strokeTutorial =
      """
      // 'stroke' changes all the
      // edges:
      
      rotate 1
      strokeSize 5
      stroke 255,255,255
      box
      
      // the three numbers are RGB
      // but you can also use the color names
      // or the special color 'angleColor'
      // Also you can use 'strokeSize'
      // to specify the thickness.
      // next-tutorial:color_names
      """.replace(/\u25B6/g, "\t")
  
    @program.colornamesTutorial =
      """
      // you can call colors by name
      // try to un-comment one line:
      //fill greenyellow
      //fill indigo
      //fill lemonchiffon // whaaaat?
      
      rotate 1
      box
      
      // more color names here:
      // http://html-color-codes.info/color-names/
      // (just use them in lower case)
      // next-tutorial:lights
      """.replace(/\u25B6/g, "\t")
  
    @program.lightsTutorial =
      """
      // 'ambientLight' creates an
      // ambient light so things have
      // some sort of shading:
      
      ambientLight 0,255,255
      rotate time/1000
      box
      
      // you can turn that light on and 
      // off while you build the scene
      // by using 'lights' and 'noLights'
      // next-tutorial:background
      """.replace(/\u25B6/g, "\t")
  
    @program.backgroundTutorial =
      """
      // 'background' creates a
      // solid background:
      
      background 0,0,255
      rotate time/1000
      box
      
      // next-tutorial:gradient
      """.replace(/\u25B6/g, "\t")
  
    @program.gradientTutorial =
      """
      // even nicer, you can paint a
      // background gradient:
      
      simpleGradient color(190,10,10),color(30,90,100),color(0)
      rotate time/1000
      box
      
      // next-tutorial:line
      """.replace(/\u25B6/g, "\t")
  
    @program.lineTutorial =
      """
      // draw lines like this:
      
      20 times ->
      ▶rotate time/9000
      ▶line
      
      // next-tutorial:ball
      """.replace(/\u25B6/g, "\t")
  
    @program.ballTutorial =
      """
      // draw balls like this:
      
      ballDetail 10
      3 times ->
      ▶move 0.2,0.2,0.2
      ▶ball
      
      // ('ballDetail' is optional)
      // next-tutorial:pushpopMatrix
      """.replace(/\u25B6/g, "\t")
  
    @program.pushpopMatrixTutorial =
      """
      // pushMatrix creates a bookmark of
      // the position, which you can
      // return to later by using popMatrix.
      // You can reset using 'resetMatrix'.
      
      rotate time/1000
      pushMatrix // bookmark the position after the rotation
      line
      move 0.5,0,0
      line
      popMatrix // go back to the bookmarked position
      move -0.5,0,0
      line
      resetMatrix // resets the position
      line // not affected by initial rotation
      // next-tutorial:animation_style
      """.replace(/\u25B6/g, "\t")
  
    @program.animationstyleTutorial =
      """
      // try uncommenting either line
      // with the animationStyle
      
      background 255
      //animationStyle motionBlur
      //animationStyle paintOver
      rotate frame/10
      box
      
      // next-tutorial:do_once
      """.replace(/\u25B6/g, "\t")
  
    @program.doonceTutorial =
      """
      // delete either check mark below
      
      rotate time/1000
      ✓doOnce ->
      ▶background 255
      ▶fill 255,0,0
      ✓doOnce -> ball
      box
      
      // ...the line or block of code
      // are ran one time only, after that the
      // check marks immediately re-appear
      // P.S. keep hitting the delete button
      // on that first check mark for seizures.
      // next-tutorial:conditionals
      """.replace(/\u25B6/g, "\t")
  
    @program.conditionalsTutorial =
      """
      // you can draw different things
      // (or in general do different things)
      // based on any
      // test condition you want:
      
      rotate
      if frame%3 == 0
      ▶box
      else if frame%3 == 1
      ▶ball
      else
      ▶peg
      
      // next-tutorial:autocode
      """.replace(/\u25B6/g, "\t")
  
    @program.autocodeTutorial =
      """
      // the Autocode button invents random
      // variations for you.
      
      // You can interrupt the Autocoder at
      // any time by pressing the button again,
      // or you can press CTRL-Z
      // (or CMD-Z on Macs) to undo (or re-do) some of
      // the steps even WHILE the autocoder is running,
      // if you see that things got
      // boring down a particular path of changes.
      """.replace(/\u25B6/g, "\t")

  loadDemoOrTutorial: (demoName) ->
    if (not Detector.webgl or @liveCodeLabCoreInstance.ThreeJsSystem.forceCanvasRenderer) \
        and not userWarnedAboutWebglExamples and demoName.indexOf("webgl") is 0
      userWarnedAboutWebglExamples = true
      $("#exampleNeedsWebgl").modal()
      $("#simplemodal-container").height 200
    # set the demo as a hash state
    # so that ideally people can link directly to
    # a specific demo they like.
    @eventRouter.trigger "set-url-hash", "bookmark=" + demoName
    @eventRouter.trigger "big-cursor-hide"
    @eventRouter.trigger "editor-undim"
    @liveCodeLabCoreInstance.GraphicsCommands.doTheSpinThingy = false
    prependMessage = ""
    if (not Detector.webgl or @liveCodeLabCoreInstance.ThreeJsSystem.forceCanvasRenderer) \
        and demoName.indexOf("webgl") is 0
      prependMessage =
      """
      // This drawing makes much more sense
      // in a WebGL-enabled browser.
      
      
      """.replace(/\u25B6/g, "\t")

    # Note that setting the value of the texteditor (texteditor.setValue below) triggers the
    # codeMirror onChange callback, which registers the new code - so the next draw()
    # will run the new demo code. But before doing that will happen (when the timer
    # for the next frame triggers), we'll have cleared the screen with the code
    # below.
    if @program[demoName]
      @texteditor.setValue prependMessage + @program[demoName]
      # clear history. Why? Because we want to avoid the follwing:
      # user opens an example. User opens another example.
      # User performs undo. Result: previous example is open, but the hashtag
      # doesn't match the example. It's just confusing - we assume here that is
      # the user selects another tutorial and example then she is not expecting
      # the undo history to bring her back to previous demos/examples.
      # Note that, again, this is quite common in CodeMirror, the clearHistory
      # invokation below only works if slightly postponed. Not sure why.
      setTimeout((()=>@texteditor.clearHistory()),30)

    # bring the cursor to the top
    @texteditor.setCursor 0, 0

    # we want to avoid that the selected example
    # or tutorial when started paints over a screen with a previous drawing
    # of the previous code.
    # So basically we draw an empty frame.
    #   a) make sure that animationStyle is "normal"    
    #   b) apply the potentially new animationStyle    
    #   render the empty frame
    BlendControls = @liveCodeLabCoreInstance.BlendControls
    BlendControls.animationStyle BlendControls.animationStyles.normal
    BlendControls.animationStyleUpdateIfChanged()
    @liveCodeLabCoreInstance.Renderer.render @liveCodeLabCoreInstance.GraphicsCommands

  loadAppropriateDemoOrTutorialBasedOnHash: (hash) ->
    matched = hash.match(/bookmark=(.*)/)
    
    if matched
      @loadDemoOrTutorial matched[1]
    else
      # user in on the root page without any hashes
      @texteditor.setValue ""
  
  # this paragraph from http://stackoverflow.com/a/629817
  # there are more elegant ways to track back/forward history
  # but they are more complex than this. I don't mind having a bit of
  # polling for this, not too big of a problem.
  pollHash: ->
    if @lastHash isnt location.hash
      @lastHash = location.hash
      
      # hash has changed, so do stuff:
      @loadAppropriateDemoOrTutorialBasedOnHash @lastHash


