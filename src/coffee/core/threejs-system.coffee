###
## Sets up canvas or webgl Threejs renderer based on browser capabilities
## and flags passed in the constructor. Sets up all the post-filtering steps.
###

Ui = require '../ui/ui'
_  = require 'underscore'
require '../../js/threejs/CanvasRenderer' # needed for the CanvasRenderer
require '../../js/threejs/Projector'      # needed for the CanvasRenderer
require '../../js/threejs/ShaderExtras'
require '../../js/threejs/postprocessing/EffectComposer'
require '../../js/threejs/postprocessing/MaskPass'
require '../../js/threejs/postprocessing/RenderPass'
require '../../js/threejs/postprocessing/SavePass'
require '../../js/threejs/postprocessing/ShaderPass'

helpers = {}

helpers.sizeIsLessThan = (sizeX, sizeY, comparisonSize) ->
  comparisonSizeX = comparisonSize[0]
  comparisonSizeY = comparisonSize[1]
  return (sizeX <= comparisonSizeX and sizeY <= comparisonSizeY)

helpers.maximumBufferSizeAtFullDpiCapability = () ->
  multiplier = window.devicePixelRatio
  sx = Math.floor(window.innerWidth + 40)
  sy = Math.floor(window.innerHeight + 40)
  return [sx * multiplier,sy * multiplier]

helpers.sizeMinimums = (a, b) -> [Math.min(a[0],b[0]), Math.min(a[1],b[1])]

helpers.sizeTheForegroundCanvas = (canvas) ->
  multiplier = 1
  [sx,sy,correction] = helpers.getBestBufferSize()

  Ui.sizeForegroundCanvas canvas, {
    x: Ui.foregroundCanvasMaxScaleUpFactor - correction,
    y: Ui.foregroundCanvasMaxScaleUpFactor - correction
  }

  canvas.width = multiplier * sx
  canvas.height = multiplier * sy

  # dimension on screen
  canvas.style.width = sx + "px"
  canvas.style.height = sy + "px"

helpers.getBestBufferSize = () ->
  multiplier = 1

  correction = -0.1
  blendedThreeJsSceneCanvasWidth = 0
  blendedThreeJsSceneCanvasHeight = 0

  previousCorrection = 0

  # this is the minimum size of the buffer that we'd accept to use
  # given the size of this screen. Basically this is the buffer that
  # would give us the maximum blurryness that we can accept.
  # if this buffer is below a certain size though, we'll increase it.
  sx = Math.floor(
    (window.innerWidth + 40) / (Ui.foregroundCanvasMaxScaleUpFactor)
  )
  sy = Math.floor(
    (window.innerHeight + 40) / (Ui.foregroundCanvasMaxScaleUpFactor)
  )

  # it's useful to be conservative and use a small buffer when the screen
  # or window are big (i.e. buffer will have to show as somewhat blurry),
  # but when the screen / window are small we can afford to fill them
  # a bit better: there is no point in using for the buffer a fraction of
  # the window size when the window size is small and we can afford to fill
  # all of it (or a good fraction of it).

  # there is no point showing blurry buffers if they are less than
  # 880x720. That size is easily managed by modern graphic cards
  # (the PS Vita can). So below 880x720 we show graphics as more
  # crisp instead of scaling it. At the same time, we don't want to use
  # buffers bigger than the maximum size we need for the window,
  # so we curtail the buffer to the maximum we need. This is so
  # we don't waste buffer in case of small windows.
  maximumBufferSizeBelowConstraintWorthShowing = helpers.sizeMinimums(
    [880,720],
    helpers.maximumBufferSizeAtFullDpiCapability()
  )


  # So here we proceed to optimally size the buffers and scale the canvas.
  # If we see that the buffer needed to achieve the maximum acceptable
  # scaling (so we are within a maximum acceptable blurryness)
  # exceeds our allowance for crisp buffer, then we exit the loop and
  # we'll have to settle for having a bigger canvas than ideal in order
  # to satisfy the maximum acceptable blurryness.
  # Otherwise, it means that we can use our allowance for crisp buffer:
  # we just correct the scale of the canvas until we fall below that
  # allowance.
  # So basically: we decrease our "maximum scaling" of the canvas until
  # the buffer size falls within our allowance.
  while helpers.sizeIsLessThan(
    blendedThreeJsSceneCanvasWidth,
    blendedThreeJsSceneCanvasHeight,
    maximumBufferSizeBelowConstraintWorthShowing
  )

    previousCorrection = correction
    previousSx = sx
    previousSy = sy

    # if we are here it means we can get away with scale-up
    # the canvas a bit less
    correction += 0.1
    # calculate the size of the buffer at the maximum blur we can accept
    sx = Math.floor(
      (window.innerWidth + 40) / (Ui.foregroundCanvasMaxScaleUpFactor - correction)
    )
    sy = Math.floor(
      (window.innerHeight + 40) / (Ui.foregroundCanvasMaxScaleUpFactor - correction)
    )

    # buffer size
    blendedThreeJsSceneCanvasWidth = multiplier * sx
    blendedThreeJsSceneCanvasHeight = multiplier * sy

  return [previousSx, previousSy, previousCorrection]


helpers.attachEffectsAndSizeTheirBuffers = (thrsystem, renderer) ->

  liveCodeLabCore_three = thrsystem.threejs
  renderTargetParameters = thrsystem.renderTargetParameters
  camera = thrsystem.camera
  scene = thrsystem.scene

  multiplier = 1
  [sx,sy,unused] = helpers.getBestBufferSize()

  #debugger
  if thrsystem.usingWebGL
    if thrsystem.renderTarget?
      thrsystem.renderTarget.dispose()

    renderTarget = new liveCodeLabCore_three.WebGLRenderTarget(
      sx * multiplier,
      sy * multiplier,
      renderTargetParameters)

    if thrsystem.effectSaveTarget?
      thrsystem.effectSaveTarget.renderTarget.dispose()

    effectSaveTarget = new liveCodeLabCore_three.SavePass(
      new liveCodeLabCore_three.WebGLRenderTarget(
        sx * multiplier,
        sy * multiplier,
        {
          minFilter: liveCodeLabCore_three.LinearFilter,
          magFilter: liveCodeLabCore_three.LinearFilter,
          format: liveCodeLabCore_three.RGBAFormat,
          stencilBuffer: true
        }
      )
    )

    effectSaveTarget.clear = false

    # Uncomment the three lines containing "fxaaPass" below to try a fast
    # antialiasing filter. Commented below because of two reasons:
    # a) it's slow
    # b) it blends in some black pixels, so it only looks good
    #     in dark backgrounds
    # The problem of blending with black pixels is the same problem of the
    # motionBlur leaving a black trail - tracked in github with
    # https://github.com/davidedc/livecodelab/issues/22

    #fxaaPass = new liveCodeLabCore_three.ShaderPass(
    #  liveCodeLabCore_three.ShaderExtras.fxaa
    #);
    #fxaaPass.uniforms.resolution.value.set(
    #  1 / window.innerWidth,
    #  1 / window.innerHeight
    #);

    # this is the place where everything is mixed together
    composer = new liveCodeLabCore_three.EffectComposer(
      renderer, renderTarget)


    # this is the effect that blends two buffers together
    # for motion blur.
    # it's going to blend the previous buffer that went to
    # screen and the new rendered buffer
    if thrsystem.effectBlend?
      mixR = thrsystem.effectBlend.uniforms.mixRatio.value
    else
      mixR = 0


    effectBlend = new liveCodeLabCore_three.ShaderPass(
      liveCodeLabCore_three.ShaderExtras.blend, "tDiffuse1")
    effectBlend.uniforms.tDiffuse2.value = effectSaveTarget.renderTarget
    effectBlend.uniforms.mixRatio.value = 0

    # one of those weird things, it appears that we
    # temporarily need to set this blending value to
    # zero, and only afterwards we can set to the proper
    # value, otherwise the background gets painted
    # all black. Unclear why. Maybe it needs to render
    # once with value zero, then it can render with
    # the proper value? But why?

    setTimeout (() ->
      thrsystem.effectBlend.uniforms.mixRatio.value = 0
    ), 1
    setTimeout (() ->
      thrsystem.effectBlend.uniforms.mixRatio.value = mixR
    ), 90

    screenPass = new liveCodeLabCore_three.ShaderPass(
      liveCodeLabCore_three.ShaderExtras.screen)

    renderModel = new liveCodeLabCore_three.RenderPass(
      scene, camera)


    # first thing, render the model
    composer.addPass renderModel
    # then apply some fake post-processed antialiasing
    #composer.addPass(fxaaPass);
    # then blend using the previously saved buffer and a mixRatio
    composer.addPass effectBlend
    # the result is saved in a copy: @effectSaveTarget.renderTarget
    composer.addPass effectSaveTarget
    # last pass is the one that is put to screen
    composer.addPass screenPass
    screenPass.renderToScreen = true
    #debugger
    ThreeJsSystem.timesInvoked = true

    return [renderTarget, effectSaveTarget, effectBlend, composer]

  else # if !@usingWebGL
    thrsystem.currentFrameThreeJsSceneCanvas.width = multiplier * sx
    thrsystem.currentFrameThreeJsSceneCanvas.height = multiplier * sy

    thrsystem.previousFrameThreeJSSceneRenderForBlendingCanvas.width = multiplier * sx
    thrsystem.previousFrameThreeJSSceneRenderForBlendingCanvas.height = multiplier * sy


helpers.sizeRendererAndCamera = (renderer, camera, scale) ->
  # update the camera
  camera.aspect = (window.innerWidth+40) / (window.innerHeight+40)
  camera.updateProjectionMatrix()

  multiplier = 1
  [sx,sy,unused] = helpers.getBestBufferSize()

  # resizes canvas buffer and sets the viewport to
  # exactly the dimension passed. No multilications going
  # on due to devicePixelRatio because we set that to 1
  # when we created the renderer
  renderer.setSize sx * multiplier, sy * multiplier, false


helpers.attachResizingBehaviourToResizeEvent = (thrsystem, renderer, camera) ->
  scale = Ui.foregroundCanvasMaxScaleUpFactor
  callback = () ->
    helpers.sizeTheForegroundCanvas thrsystem.canvas
    helpers.sizeRendererAndCamera renderer, camera, scale
    [
      thrsystem.renderTarget,
      thrsystem.effectSaveTarget,
      thrsystem.effectBlend,
      thrsystem.composer
    ] = helpers.attachEffectsAndSizeTheirBuffers(thrsystem, renderer)

  # it's not healthy to rebuild/resize the
  # rendering pipeline in realtime as the
  # window is resized, it bothers the browser.
  # So giving it some slack and doing it when "at rest"
  # rather than multiple times consecutively during the
  # resizing.
  debouncedCallback = _.debounce(callback, 250)

  # bind the resize event
  window.addEventListener "resize", debouncedCallback, false

  # return .stop() the function to stop watching window resize

  ###*
  Stop watching window resize
  ###
  stop: ->
    window.removeEventListener "resize", callback
    return


class ThreeJsSystem

  @composer: null
  @timesInvoked: false

  constructor: (
    @usingWebGL,
    @canvas,
    @testMode,
    @threejs
  ) ->

    if @usingWebGL
      # Webgl init.
      # We allow for a bigger ball detail.
      # Also the WebGL context allows us to use the Three JS composer and the
      # postprocessing effects, which use shaders.
      @ballDefaultDetLevel = 16
      @canvasContext = @canvas.getContext("experimental-webgl")

      # see:
      #  http://mrdoob.github.io/three.js/docs/#Reference/Renderers/WebGLRenderer
      @renderer = new @threejs.WebGLRenderer(
        canvas: @canvas
        antialias: false
        premultipliedAlpha: false
        # we need to force the devicePixelRatio to 1
        # here because we find it useful to use the
        # setSize method of the renderer.
        # BUT setSize would duplicate the canvas
        # buffer on retina displays which is
        # somehing we want to control manually.
        devicePixelRatio: 1

      )

    else
      # Canvas init.
      # Note that the canvas init requires two extra canvases in
      # order to achieve the motion blur (as we need to keep the
      # previous frame). Basically we have to do manually what the
      # WebGL solution achieves through the Three.js composer
      # and postprocessing/shaders.
      @ballDefaultDetLevel = 6
      @currentFrameThreeJsSceneCanvas = document.createElement("canvas")

      # some shorthands
      currentFrameThreeJsSceneCanvas = @currentFrameThreeJsSceneCanvas

      currentFrameThreeJsSceneCanvas.width = @canvas.width
      currentFrameThreeJsSceneCanvas.height = @canvas.height


      @currentFrameThreeJsSceneCanvasContext =
        currentFrameThreeJsSceneCanvas.getContext("2d")

      @previousFrameThreeJSSceneRenderForBlendingCanvas =
        document.createElement("canvas")
      # some shorthands
      previousFrameThreeJSSceneRenderForBlendingCanvas =
        @previousFrameThreeJSSceneRenderForBlendingCanvas
      previousFrameThreeJSSceneRenderForBlendingCanvas.width =
        @canvas.width
      previousFrameThreeJSSceneRenderForBlendingCanvas.height =
        @canvas.height

      @previousFrameThreeJSSceneRenderForBlendingCanvasContext =
        @previousFrameThreeJSSceneRenderForBlendingCanvas.getContext("2d")
      @canvasContext = @canvas.getContext("2d")

      @renderer = new @threejs.CanvasRenderer(
        canvas: currentFrameThreeJsSceneCanvas
        antialias: false # to get smoother output
        preserveDrawingBuffer: @testMode # to allow screenshot
        # todo figure out why this works. this parameter shouldn't
        # be necessary, as per
        # https://github.com/mrdoob/three.js/issues/2833 and
        # https://github.com/mrdoob/three.js/releases this parameter
        # should not be needed. If we don't pass it,
        # the canvas is all off, the unity box is painted centerd in
        # the bottom right corner
        devicePixelRatio: 1
      )

    @scene = new @threejs.Scene()
    @scene.matrixAutoUpdate = false

    # put a camera in the scene
    @camera = new @threejs.PerspectiveCamera(
      35,
      @canvas.width / @canvas.height, 1, 10000
    )
    @camera.position.set 0, 0, 5
    @scene.add @camera

    helpers.attachResizingBehaviourToResizeEvent @, @renderer, @camera

    helpers.sizeTheForegroundCanvas @canvas

    helpers.sizeRendererAndCamera(
      @renderer,
      @camera,
      Ui.foregroundCanvasMaxScaleUpFactor
    )

    if @usingWebGL
      @renderTargetParameters = undefined
      @renderTarget = undefined
      @effectSaveTarget = undefined
      @renderTargetParameters =
        format: @threejs.RGBAFormat
        stencilBuffer: true

      [
        @renderTarget,
        @effectSaveTarget,
        @effectBlend,
        @composer
      ] = helpers.attachEffectsAndSizeTheirBuffers(@, @renderer)

module.exports = ThreeJsSystem

