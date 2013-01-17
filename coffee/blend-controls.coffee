#jslint browser: true 

class BlendControls
  "use strict"
  
  previousanimationStyleValue: 0
  animationStyleValue: 0
  # Just an object to hold the animation style variables
  animationStyles: {}
  # Used for setting how much blending there is between frames
  blendAmount: 0
  
  constructor: (@liveCodeLabCoreInstance) ->
    # These all need to be made global so they can be used by sketches
    window.normal = @animationStyles.normal = 0
    window.paintOver = @animationStyles.paintOver = 1
    window.motionBlur = @animationStyles.motionBlur = 2
    window.animationStyle = (a) => @animationStyle(a)

  animationStyle: (a) ->
    # turns out when you type normal that the first two letters "no"
    # are sent as "false"
    return  if a is false or a is `undefined`
    @animationStyleValue = a

  animationStyleUpdateIfChanged: ->
    # Animation Style hasn't changed so we don't need to do anything
    return  if @animationStyleValue is @previousanimationStyleValue
    @previousanimationStyleValue = @animationStyleValue

    # defining a couple of shorthands to avoid super-long lines
    isWebGLUsed = @liveCodeLabCoreInstance.threeJsSystem.isWebGLUsed
    @animationStyles = @animationStyles

    if isWebGLUsed and @animationStyleValue is @animationStyles.motionBlur
      @liveCodeLabCoreInstance.threeJsSystem.effectBlend.uniforms.mixRatio.value = 0.7
    else if not isWebGLUsed and @animationStyleValue is @animationStyles.motionBlur
      @blendAmount = 0.6

    if isWebGLUsed and @animationStyleValue is @animationStyles.paintOver
      @liveCodeLabCoreInstance.threeJsSystem.effectBlend.uniforms.mixRatio.value = 1
    else if not isWebGLUsed and @animationStyleValue is @animationStyles.paintOver
      @blendAmount = 1

    if isWebGLUsed and @animationStyleValue is @animationStyles.normal
      @liveCodeLabCoreInstance.threeJsSystem.effectBlend.uniforms.mixRatio.value = 0
    else if not isWebGLUsed and @animationStyleValue is @animationStyles.normal
      @blendAmount = 0
