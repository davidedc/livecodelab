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

class BackgroundPainter

  constructor: (
    @backgroundDiv,
    @colourFunctions,
    @colourLiterals,
  ) ->
    @gradStack = []
    @defaultGradientColor1 = 0
    @defaultGradientColor2 = 0
    @defaultGradientColor3 = 0
    @whichDefaultBackground = undefined
    @currentGradientStackValue = ""
    @previousGradientStackValue = 0
    @gradientPrefix = getCssValuePrefix(
      'background', 'linear-gradient(left, #fff, #fff)'
    )


  addToScope: (scope) ->

    scope.add('simpleGradient', (a,b,c) => @simpleGradient(a,b,c))
    scope.add('background', (a,b,c) => @background(a,b,c))

  # This needs to be global so it can be run by the draw function
  simpleGradient: (a, b, c, d) ->
    @currentGradientStackValue =
      @currentGradientStackValue + " " + a + "" + b + "" + c + "" + d + "null "

    # if all colors of a gradient are opaque then
    # you can flush the command list.
    if (@colourFunctions.alpha(a) == 255 and
      @colourFunctions.alpha(b) == 255 and
      @colourFunctions.alpha(c) == 255 and
      @colourFunctions.alpha(d) == 255
    )
      @gradStack = []
      @currentGradientStackValue = ""


    @gradStack.push
      gradStacka: @colourFunctions.color(a)
      gradStackb: @colourFunctions.color(b)
      gradStackc: @colourFunctions.color(c)
      gradStackd: @colourFunctions.color(d)
      solid: null


  
  # This needs to be global so it can be run by the draw function
  background: ->
    
    # [todo] should the screen be cleared when you invoke
    # the background command? (In processing it's not)
    a = @colourFunctions.color(
      arguments[0], arguments[1], arguments[2], arguments[3])

    # if the fill color is opaque then
    # you can flush the command list.
    if @colourFunctions.alpha(a) == 255
      @gradStack = []
      @currentGradientStackValue = ""


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
        @defaultGradientColor1 = @colourFunctions.color(155,255,155)
        @defaultGradientColor2 = @colourFunctions.color(155,255,155)
        @defaultGradientColor3 = @colourFunctions.color(155,255,155)
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
    @simpleGradient(
      @defaultGradientColor1,
      @defaultGradientColor2,
      @defaultGradientColor3
    )

  simpleGradientUpdateIfChanged: ->

    # some shorthands
    color = @colourFunctions.color

    if @currentGradientStackValue isnt @previousGradientStackValue
      @previousGradientStackValue = @currentGradientStackValue

      sx = Math.floor((window.innerWidth + 40) / 10)
      sy = Math.floor((window.innerHeight + 40) / 10)
      cssStringPreamble = "position: absolute; z-index:-3; top: 0px; left: 0px; width:#{sx}px; height:#{sy}px; "+@gradientPrefix+"transform-origin: 0% 0%; "+@gradientPrefix+"transform: scale(10,10);"
      cssStringPreamble = cssStringPreamble + "background:"
      cssString = ""

      for scanningGradStack in @gradStack
        if scanningGradStack.gradStacka?
          cssString = @gradientPrefix+"linear-gradient(top,  "+color.toString(scanningGradStack.gradStacka)+" 0%,"+color.toString(scanningGradStack.gradStackb)+" 50%,"+color.toString(scanningGradStack.gradStackc)+" 100%)," + cssString
        else
          cssString = @gradientPrefix + "linear-gradient(top,  "+color.toString(scanningGradStack.solid)+" 0%,"+color.toString(scanningGradStack.solid)+" 100%)," + cssString

      cssString = cssString.substring(0, cssString.length - 1);
      cssString = cssStringPreamble + cssString + ";"
      @backgroundDiv.style.cssText = cssString

module.exports = BackgroundPainter

