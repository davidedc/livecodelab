#jslint browser: true 

createBlendControls = (liveCodeLabCoreInstance) ->
  "use strict"
  BlendControls = {}
  previousanimationStyleValue = 0
  animationStyleValue = 0
  
  # Used for setting how much blending there is between frames
  BlendControls.blendAmount = 0
  
  # Just an object to hold the animation style variables
  BlendControls.animationStyles = {}
  
  # These all need to be made global so they can be used by sketches
  window.normal = BlendControls.animationStyles.normal = 0
  window.paintOver = BlendControls.animationStyles.paintOver = 1
  window.motionBlur = BlendControls.animationStyles.motionBlur = 2
  window.animationStyle = BlendControls.animationStyle = (a) ->
    
    # turns out when you type normal that the first two letters "no"
    # are sent as "false"
    return  if a is false or a is `undefined`
    animationStyleValue = a

  BlendControls.animationStyleUpdateIfChanged = ->
    
    # Animation Style hasn't changed so we don't need to do anything
    return  if animationStyleValue is previousanimationStyleValue
    previousanimationStyleValue = animationStyleValue

    # defining a couple of shorthands to avoid super-long lines
    isWebGLUsed = liveCodeLabCoreInstance.ThreeJsSystem.isWebGLUsed
    animationStyles = BlendControls.animationStyles

    if isWebGLUsed and animationStyleValue is animationStyles.motionBlur
      liveCodeLabCoreInstance.ThreeJsSystem.effectBlend.uniforms.mixRatio.value = 0.7
    else if not isWebGLUsed and animationStyleValue is animationStyles.motionBlur
      BlendControls.blendAmount = 0.6

    if isWebGLUsed and animationStyleValue is animationStyles.paintOver
      liveCodeLabCoreInstance.ThreeJsSystem.effectBlend.uniforms.mixRatio.value = 1
    else if not isWebGLUsed and animationStyleValue is animationStyles.paintOver
      BlendControls.blendAmount = 1

    if isWebGLUsed and animationStyleValue is animationStyles.normal
      liveCodeLabCoreInstance.ThreeJsSystem.effectBlend.uniforms.mixRatio.value = 0
    else if not isWebGLUsed and animationStyleValue is animationStyles.normal
      BlendControls.blendAmount = 0

  BlendControls