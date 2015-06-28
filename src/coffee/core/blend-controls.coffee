###
## BlendControls manages the three different blending styles.
## One can decide for either 'normal' (e.g. next frame completely
## replaces the previous one) or 'paintOver' (new frame is painted
## over the previous one, meaning that the previous frame shows through
## the transparent bits of the new frame) or 'motionBlur'
## (previous frame is shown faintly below the current one so to give
## a vague effect of motion blur).
###

class BlendControls
  
  previousanimationStyleValue: 0
  animationStyleValue: 0
  # Just an object to hold the animation style variables
  animationStyles: {}
  # Used for setting how much blending there is between frames
  blendAmount: 0
  
  constructor: (@usingWebGL, @threeJsSystem) ->
    @animationStyles.normal = 0
    @animationStyles.paintOver = 1
    @animationStyles.motionBlur = 2

  addToScope: (scope) ->
    scope.add('normal',         @animationStyles.normal)
    scope.add('paintOver',      @animationStyles.paintOver)
    scope.add('motionBlur',     @animationStyles.motionBlur)
    scope.add('animationStyle', (a) => @animationStyle(a))

  animationStyle: (a) ->
    # turns out when you type normal that the first two letters "no"
    # are sent as "false"
    return  if a is false or not a?
    @animationStyleValue = a

  animationStyleUpdateIfChanged: ->
    # Animation Style hasn't changed so we don't need to do anything
    return  if @animationStyleValue is @previousanimationStyleValue
    @previousanimationStyleValue = @animationStyleValue

    # defining a couple of shorthands to avoid super-long lines
    @animationStyles = @animationStyles

    if @usingWebGL and @animationStyleValue is @animationStyles.motionBlur
      @threeJsSystem.effectBlend.uniforms.mixRatio.value = 0.4
    else if not @usingWebGL and @animationStyleValue is @animationStyles.motionBlur
      @blendAmount = 0.6

    if @usingWebGL and @animationStyleValue is @animationStyles.paintOver
      @threeJsSystem.effectBlend.uniforms.mixRatio.value = 1.0
    else if not @usingWebGL and @animationStyleValue is @animationStyles.paintOver
      @blendAmount = 1

    if @usingWebGL and @animationStyleValue is @animationStyles.normal
      @threeJsSystem.effectBlend.uniforms.mixRatio.value = 0
    else if not @usingWebGL and @animationStyleValue is @animationStyles.normal
      @blendAmount = 0

module.exports = BlendControls

