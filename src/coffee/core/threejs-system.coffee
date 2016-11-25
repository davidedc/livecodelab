###
## Sets up webgl Threejs renderer based on browser capabilities
## and flags passed in the constructor. Sets up all the post-filtering steps.
###

Ui = require '../ui/ui'
_  = require 'underscore'
require '../../js/threejs/ShaderExtras'
require '../../js/threejs/postprocessing/EffectComposer'
require '../../js/threejs/postprocessing/MaskPass'
require '../../js/threejs/postprocessing/RenderPass'
require '../../js/threejs/postprocessing/SavePass'
require '../../js/threejs/postprocessing/ShaderPass'

# This resolution is easily managed by modern graphic cards (the PS Vita can).
IDEAL_RESOLUTION = {width: 880, height: 720}
MAX_CANVAS_SCALING = 2
SCALE_DELTA = 0.1


helpers = {}

helpers.currentMaxBufferSize = () ->
  multiplier = window.devicePixelRatio
  return {
    width: Math.floor(window.innerWidth * multiplier),
    height: Math.floor(window.innerHeight * multiplier)
  }

helpers.calculateMaxUnscaledBuffer = (a, b) ->
  {
    width: Math.min(a.width, b.width),
    height: Math.min(a.height, b.height)
  }

helpers.sizeTheForegroundCanvas = (canvas) ->
  {width: width, height: height, scaling: scaling} = helpers.getBestBufferSize()

  canvas.width = window.innerWidth / scaling
  canvas.height = window.innerHeight / scaling

  canvas.style.width = width + "px"
  canvas.style.height = height + "px"

  scaleString = scaling + ", " + scaling

  $(canvas).css("-ms-transform-origin", "0% 0%")
           .css("-webkit-transform-origin", "0% 0%")
           .css("-moz-transform-origin", "0% 0%")
           .css("-o-transform-origin", "0% 0%")
           .css("transform-origin", "0% 0%")
           .css("-ms-transform", "scale(" + scaleString + ")")
           .css("-webkit-transform", "scale3d(" + scaleString + ", 1)")
           .css("-moz-transform", "scale(" + scaleString + ")")
           .css("-o-transform", "scale(" + scaleString + ")")
           .css "transform", "scale(" + scaleString + ")"


# To improve the performance of LiveCodeLab, the canvas resolution can
# be scaled down. There is a maximum amount of scaling allowed so that
# the graphics won't get too blurry, and the scaling factor adaptive,
# transitioning between no scaling and the maximum.

# This function calculates the best size for the current canvas buffer,
# based on the current resolution, the devide pixel ratio and the
# maximum amount of scaling allowed.
helpers.getBestBufferSize = () ->

  # Displays with the ideal resolution or less should not be scaled.
  # So below the ideal resolution we show graphics on the canvas at 1 to 1.
  # At the same time, we don't want to use buffers that are bigger
  # than necessary, so we limit the buffer to the maximum we need.
  maxUnscaledBuffer = helpers.calculateMaxUnscaledBuffer(
    IDEAL_RESOLUTION,
    helpers.currentMaxBufferSize()
  )

  # This is the minimum size buffer based on how much we're willing to scale.
  # Basically this is the buffer that would give us the maximum blurryness
  # that we can accept.
  # If this buffer is bigger than the ideal resolution maximally scaled then
  # this is what will be used.
  scaledCanvasWidth = Math.floor(window.innerWidth / MAX_CANVAS_SCALING)
  scaledCanvasHeight = Math.floor(window.innerHeight / MAX_CANVAS_SCALING)

  # Starting with maximum scaling, check if that buffer resolution is within
  # the acceptable limits. If it is then decrease the scaling factor and carry
  # on checking. If it's not then exit the loop and use the last acceptable
  # buffer size.
  scaling = MAX_CANVAS_SCALING
  while (scaling > 1)

    sW = Math.floor(window.innerWidth / (scaling - SCALE_DELTA))
    sH = Math.floor(window.innerHeight / (scaling - SCALE_DELTA))

    if (sW > maxUnscaledBuffer.width ||
        sH > maxUnscaledBuffer.height)
         break

    scaledCanvasWidth = sW
    scaledCanvasHeight = sH
    scaling -= SCALE_DELTA;

  return {
    width: scaledCanvasWidth,
    height: scaledCanvasHeight
    scaling: scaling
  }


helpers.attachEffectsAndSizeTheirBuffers = (thrsystem, renderer) ->

  liveCodeLabCore_three = thrsystem.threejs
  renderTargetParameters = thrsystem.renderTargetParameters
  camera = thrsystem.camera
  scene = thrsystem.scene

  multiplier = 1
  {width: sx, height: sy} = helpers.getBestBufferSize()

  #debugger
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



helpers.sizeRendererAndCamera = (renderer, camera, scale) ->
  # update the camera
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  multiplier = 1
  {width: sx, height: sy} = helpers.getBestBufferSize()

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

  constructor: (@canvas, @threejs) ->

    @canvasContext = @canvas.getContext("experimental-webgl")

    # https://threejs.org/docs/index.html#Reference/Renderers/WebGLRenderer
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

    # https://threejs.org/docs/index.html#Reference/Scenes/Scene
    @scene = new @threejs.Scene()
    @scene.matrixAutoUpdate = false

    # https://threejs.org/docs/index.html#Reference/Cameras/PerspectiveCamera
    @camera = new @threejs.PerspectiveCamera(
      35,
      @canvas.width / @canvas.height, 1, 10000
    )
    @camera.position.set 0, 0, 5
    @scene.add @camera

    # Handle resizing of browser window
    helpers.attachResizingBehaviourToResizeEvent @, @renderer, @camera

    # Set the correct size and scaling for the canvas
    helpers.sizeTheForegroundCanvas @canvas

    helpers.sizeRendererAndCamera(
      @renderer,
      @camera,
      Ui.foregroundCanvasMaxScaleUpFactor
    )

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

