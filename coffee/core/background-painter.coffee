###
## The user can issue multiple solid fill and gradient fill commands
## and they are all painted on top of each other according to the
## order they have been issued in.
## So for example you can have one gradient and then
## a second one painted over it that uses some transparency.
##
## This is why solid and gradient fills are all kept in an array
## and each time the user issues one of the two commands, an
## element is added to the array.
##
## Both solid and gradient fills are stored as elements in the
## array, all elements are the same and accommodate for a description
## that either case (solid/gradient).
##
## The background/gradients are drawn on a separate canvas or div.
## In case of a div we use normal CSS transforms - only when
## painting commands change the state of
## the background (i.e. colors of their
## arguments and the order of the commands) across frames.
## In case of canvas we use the normal gradient-painting
## primitives.
##
## For quickly determining whether the order/content of the commands
## has changed across frames,
## a string is kept that represents the whole stack of commands
## issued in the current frame, and similarly the "previous frame"
## string representation is also kept.
## So it's kind of like a simplified JSON representation if you will.
##
## If the strings are the same across frames, then the no
## new CSS transforms are applied for the background
## (or new gradient-painting to do in case of the canvas
#  implementation)
## , otherwise the array is iterated
## and new background/gradient transform is applied.
##
## Note that a fill (flat or gradient) made with solid colors
## invalidates the contents of the previous
## elements of the array, so we discard those when such
## a command is issued.
###

# Detect which browser prefix to use for the specified CSS value
# (e.g., background-image: -moz-linear-gradient(...);
#        background-image:   -o-linear-gradient(...); etc).
#
getCssValuePrefix = (name, value) ->
  prefixes = ["", "-o-", "-ms-", "-moz-", "-webkit-"]
  
  # Create a temporary DOM object for testing
  dom = document.createElement("div")
  i = 0

  while i < prefixes.length
    
    # Attempt to set the style
    dom.style[name] = prefixes[i] + value
    
    # Detect if the style was successfully set
    return prefixes[i]  if dom.style[name]
    dom.style[name] = "" # Reset the style
    i++

define () ->

  class BackgroundPainter

    @canvasForBackground: null
    @backgroundViaCanvas: false

    constructor: (@backgroundCanvasOrDiv, @liveCodeLabCoreInstance, @colourLiterals, @backgroundViaCanvas = false) ->
      @gradStack = []
      @defaultGradientColor1 = 0
      @defaultGradientColor2 = 0
      @defaultGradientColor3 = 0
      @whichDefaultBackground = undefined
      @currentGradientStackValue = ""
      @previousGradientStackValue = 0
      if @backgroundViaCanvas
        @canvasForBackground = @backgroundCanvasOrDiv
        # the canvas background for the time being is only going to contain
        # gradients, so we can get away with creating a really tiny canvas and
        # stretch it. The advantage is that the fill operations are a lot faster.
        # We should try to use CSS instead of canvas, as in some browsers canvas
        # is not accelerated just as well as CSS.
        # backGroundFraction specifies what fraction of the window the
        # background canvas is going to be.
        backGroundFraction = 1 / 100
        @canvasForBackground.width = Math.floor(window.innerWidth * backGroundFraction)
        @canvasForBackground.height = Math.floor(window.innerHeight * backGroundFraction)
        @backgroundSceneContext = @canvasForBackground.getContext("2d")
      else
        @gradientPrefix = getCssValuePrefix 'background', 'linear-gradient(left, #fff, #fff)'


    addToScope: (scope) ->

      scope.add('simpleGradient', (a,b,c) => @simpleGradient(a,b,c))
      scope.add('background', (a,b,c) => @background(a,b,c))

    # This needs to be global so it can be run by the draw function
    simpleGradient: (a, b, c, d) ->
      @currentGradientStackValue =
        @currentGradientStackValue + " " + a + "" + b + "" + c + "" + d + "null "
      @gradStack.push
        gradStacka: @liveCodeLabCoreInstance.colourFunctions.color(a)
        gradStackb: @liveCodeLabCoreInstance.colourFunctions.color(b)
        gradStackc: @liveCodeLabCoreInstance.colourFunctions.color(c)
        gradStackd: @liveCodeLabCoreInstance.colourFunctions.color(d)
        solid: null


    
    # This needs to be global so it can be run by the draw function
    background: ->
      
      # [todo] should the screen be cleared when you invoke
      # the background command? (In processing it's not)
      a = @liveCodeLabCoreInstance.colourFunctions.color(
        arguments[0], arguments[1], arguments[2], arguments[3])
      @currentGradientStackValue =
        @currentGradientStackValue + " null null null null " + a + " "
      @gradStack.push
        solid: a
        gradStacka: undefined
        gradStackb: undefined
        gradStackc: undefined
        gradStackd: undefined


    paintARandomBackground: ->
      if not @whichDefaultBackground?
        @whichDefaultBackground = Math.floor(Math.random() * 5)
      else
        @whichDefaultBackground = (@whichDefaultBackground + 1) % 5
      switch @whichDefaultBackground
        when 0
          @defaultGradientColor1 = @colourLiterals.getColour('orange')
          @defaultGradientColor2 = @colourLiterals.getColour('red')
          @defaultGradientColor3 = @colourLiterals.getColour('black')
          $("#fakeStartingBlinkingCursor").css "color", "white"
        when 1
          @defaultGradientColor1 = @colourLiterals.getColour('white')
          @defaultGradientColor2 = @colourLiterals.getColour('khaki')
          @defaultGradientColor3 = @colourLiterals.getColour('peachpuff')
          $("#fakeStartingBlinkingCursor").css "color", "LightPink"
        when 2
          @defaultGradientColor1 = @colourLiterals.getColour('lightsteelblue')
          @defaultGradientColor2 = @colourLiterals.getColour('lightcyan')
          @defaultGradientColor3 = @colourLiterals.getColour('paleturquoise')
          $("#fakeStartingBlinkingCursor").css "color", "CadetBlue"
        when 3
          @defaultGradientColor1 = @colourLiterals.getColour('silver')
          @defaultGradientColor2 = @colourLiterals.getColour('lightgrey')
          @defaultGradientColor3 = @colourLiterals.getColour('gainsboro')
          $("#fakeStartingBlinkingCursor").css "color", "white"
        when 4
          @defaultGradientColor1 = @liveCodeLabCoreInstance.colourFunctions.color(155,255,155)
          @defaultGradientColor2 = @liveCodeLabCoreInstance.colourFunctions.color(155,255,155)
          @defaultGradientColor3 = @liveCodeLabCoreInstance.colourFunctions.color(155,255,155)
          $("#fakeStartingBlinkingCursor").css "color", "DarkOliveGreen"
      
      # in theory we should wait for the next frame to repaing the background,
      # but there would be a problem with that: livecodelab goes to sleep when
      # the program is empty and the big cursor blinks. And yet, when the
      # user clicks the reset button, we want the background to change randomly
      # so we make an exceptio to the rule here and we update the background
      # right now without waiting for the next frame.
      # Note this is not wasted time anyways because the repaint won't happen
      # again later if the background hasn't changed.
      @resetGradientStack()
      @simpleGradientUpdateIfChanged()

    resetGradientStack: ->
      @currentGradientStackValue = ""
      
      # we could be more efficient and
      # reuse the previous stack elements
      # but I don't think it matters here
      @gradStack = []
      @simpleGradient \
        @defaultGradientColor1, @defaultGradientColor2, @defaultGradientColor3

    simpleGradientUpdateIfChanged: ->

      # some shorthands
      color = @liveCodeLabCoreInstance.colourFunctions.color

      if @currentGradientStackValue isnt @previousGradientStackValue
        #alert('repainting the background');
        @previousGradientStackValue = @currentGradientStackValue

        if @backgroundViaCanvas
          diagonal =
            Math.sqrt(Math.pow(@canvasForBackground.width / 2, 2) +
            Math.pow(@canvasForBackground.height / 2, 2))
          #console.log "canvas width and height in simpleGradientUpdateIfChanged: " + @canvasForBackground.width + " " + @canvasForBackground.height
        else
          cssStringPreamble = 'position: absolute; z-index:-3; top: 0px; left: 0px; width:10%; height:10%; '+@gradientPrefix+'transform-origin: 0% 0%; '+@gradientPrefix+'transform: scale(10,10);'
          cssStringPreamble = cssStringPreamble + 'background:'
          cssString = ''

        for scanningGradStack in @gradStack
          if scanningGradStack.gradStacka?
            if @backgroundViaCanvas
              radgrad = @backgroundSceneContext.createLinearGradient(
                @canvasForBackground.width / 2,
                0,
                @canvasForBackground.width / 2,
                @canvasForBackground.height)
              radgrad.addColorStop 0, color.toString(scanningGradStack.gradStacka)
              radgrad.addColorStop 0.5,color.toString(scanningGradStack.gradStackb)
              radgrad.addColorStop 1, color.toString(scanningGradStack.gradStackc)
              @backgroundSceneContext.globalAlpha = 1.0
              @backgroundSceneContext.fillStyle = radgrad
              @backgroundSceneContext.fillRect \
                0, 0, @canvasForBackground.width, @canvasForBackground.height
            else
              cssString = @gradientPrefix+"linear-gradient(top,  "+color.toString(scanningGradStack.gradStacka)+" 0%,"+color.toString(scanningGradStack.gradStackb)+" 50%,"+color.toString(scanningGradStack.gradStackc)+" 100%)," + cssString
          else
            if @backgroundViaCanvas
              @backgroundSceneContext.globalAlpha = 1.0
              @backgroundSceneContext.fillStyle =
                color.toString(scanningGradStack.solid)
              @backgroundSceneContext.fillRect \
                0, 0, @canvasForBackground.width , @canvasForBackground.height 
            else
              cssString = @gradientPrefix + "linear-gradient(top,  "+color.toString(scanningGradStack.solid)+" 0%,"+color.toString(scanningGradStack.solid)+" 100%)," + cssString

        if !@backgroundViaCanvas
          cssString = cssString.substring(0, cssString.length - 1);
          cssString = cssStringPreamble + cssString + ";"
          if (document.getElementById("backgroundCanvasOrDiv"))
            document.getElementById("backgroundCanvasOrDiv").style.cssText = cssString
          #console.log cssString

  BackgroundPainter

