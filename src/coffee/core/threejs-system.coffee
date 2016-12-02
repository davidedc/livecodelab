###
## Sets up webgl Threejs renderer based on browser capabilities
## and flags passed in the constructor. Sets up all the post-filtering steps.
###

_  = require 'underscore'

require '../../js/threejs/shaders/CopyShader'
require '../../js/threejs/shaders/LCLBlendShader'

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



helpers.sizeRendererAndCamera = (renderer, camera) ->
  # update the camera
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  {width: width, height: height} = helpers.getBestBufferSize()
  # resizes canvas buffer and sets the viewport to
  # exactly the dimension passed. No multiplications going
  # on due to devicePixelRatio because we set that to 1
  # when we created the renderer.
  renderer.setSize width, height, false


class ThreeJsSystem

  renderTarget: undefined # used by effects
  effectSaveTarget: undefined # used by effects

  effectBlend: undefined # used by blend-controls
  composer: undefined # used by renderer
  scene: undefined # used by renderer, graphics commands and light commands

  constructor: (canvas, threejs) ->

    @canvasContext = canvas.getContext("experimental-webgl")

    # https://threejs.org/docs/index.html#Reference/Renderers/WebGLRenderer
    @renderer = new threejs.WebGLRenderer({
      canvas: canvas,
      antialias: false,
      premultipliedAlpha: false,
      # we need to force the devicePixelRatio to 1
      # here because we find it useful to use the
      # setSize method of the renderer.
      # BUT setSize would duplicate the canvas
      # buffer on retina displays which is
      # somehing we want to control manually.
      devicePixelRatio: 1
    })

    # https://threejs.org/docs/index.html#Reference/Scenes/Scene
    @scene = new threejs.Scene()
    @scene.matrixAutoUpdate = false

    # https://threejs.org/docs/index.html#Reference/Cameras/PerspectiveCamera
    @camera = new threejs.PerspectiveCamera(
      35,
      canvas.width / canvas.height, 1, 10000
    )
    @camera.position.set 0, 0, 5
    @scene.add @camera

    # Set the correct size and scaling for the canvas
    helpers.sizeTheForegroundCanvas canvas

    # Set correct aspect ration and renderer size
    helpers.sizeRendererAndCamera(@renderer, @camera)

    @createEffectsPipeline(threejs)
    @handleResizing(canvas, threejs)

  createEffectsPipeline: (threejs) ->

    {width: width, height: height} = helpers.getBestBufferSize()
    console.log(width, height);

    # If we're re-creating the effects pipeline then we need a new,
    # correctly sized renderTarget
    if @renderTarget?
        @renderTarget.dispose()

    # Render a copy of the scene
    # https://threejs.org/docs/?q=render#Reference/Renderers/WebGLRenderTarget
    @renderTarget = new threejs.WebGLRenderTarget(width, height)


    # If we're re-creating the effects pipeline then we need a new,
    # correctly sized effectSaveTarget
    if @effectSaveTarget?
        @effectSaveTarget.renderTarget.dispose()

    # The rendering pipeline that's going to combine all the effects
    @composer = new threejs.EffectComposer(@renderer, @renderTarget)


    # Render the scene into the start of the effects chain
    @renderPass = new threejs.RenderPass(@scene, @camera)
    @composer.addPass(@renderPass)


    # This is where a copy of the rendered scene is going to be saved.
    # Essentially this is the last frame with all the effects.
    @effectSaveTarget = new threejs.SavePass(
        new threejs.WebGLRenderTarget(width, height)
    )

    # This is the effect that blends two buffers together for motion blur.
    # It's going to blend a copy of the previous buffer (effectSaveTarget)
    # with the  new rendered buffer

    # If we're recreating the rendering pipeline (because the screen has been
    # resized for example) then we want to make sure that the mixRatio
    # doesn't change
    if @effectBlend?
        mixRatio = @effectBlend.uniforms.mixRatio.value
    else
        mixRatio = 0

    # Blend using the previously saved buffer and a mixRatio
    @effectBlend = new threejs.ShaderPass(threejs.LCLBlendShader, "tDiffuse1")
    @effectBlend.uniforms.tDiffuse2.value = @effectSaveTarget.renderTarget.texture
    @effectBlend.uniforms.mixRatio.value = mixRatio

    # Add the blending into the effects pipeline
    @composer.addPass(@effectBlend)

    # Save a copy of the output to the effectSaveTarget
    @composer.addPass(@effectSaveTarget)

    # Render everything to the screen
    @screenPass = new threejs.ShaderPass(threejs.CopyShader)
    @screenPass.renderToScreen = true
    @composer.addPass(@screenPass)

  handleResizing: (canvas, threejs) ->

    callback = () =>
      helpers.sizeTheForegroundCanvas canvas
      helpers.sizeRendererAndCamera @renderer, @camera
      @createEffectsPipeline(threejs)

    # Don't want to rebuild the rendering pipeline too quickly when
    # the window is resized.
    debouncedCallback = _.debounce(callback, 250)

    # bind the resize event
    window.addEventListener "resize", debouncedCallback, false


  render: (graphics) ->
    @combDisplayList graphics
    @composer.render()


  # By doing some profiling it is apparent that
  # adding and removing objects has a big cost.
  # So instead of adding/removing objects every frame,
  # objects are only added at creation and they are
  # never removed from the scene. They are
  # only made invisible. This routine combs the
  # scene and finds the objects that need to be visible and
  # those that need to be hidden.
  # This is a scenario of how it works:
  #   frame 1: 3 boxes invoked. effect: 3 cubes are created in the scene
  #   frame 2: 1 box invoked. effect: 1st cube is updated with new
  #            scale/matrix/material and the other 2 boxes are set to hidden
  # So there is a pool of objects for each primitive. It starts empty, new
  # objects are added to the scene only if the ones available from previous
  # draws are not sufficient.
  # In theory we could be smarter, instead of combing the whole scene
  # we could pack all the similar primitives together (the order in the
  # display list doesn't matter, because there are no "matrix" nodes, each
  # primitive contains a fully calculated matrix) and keep indexes for each
  # group, so we could for example have 100 boxes and 100 balls, and we could
  # scan the first two boxes and set those visible, then jump to the balls to
  # avoid scaning all the other 98 boxes, and set the correct amount of balls
  # visible. In practice, it's not clear whether a lot of time is spent in
  # this function, so that should be determined first.
  # TODO a way to shrink the scene and delete from the scene objects that have
  # not been used for a long time.
  # Note: Mr Doob said that the new scene destruction/creation primitives of
  #       Three.js are much faster. Also the objects of the scene are harder
  #       to reach, so it could be the case that this mechanism is not
  #       needed anymore.
  combDisplayList: (graphics) ->
    i = undefined
    sceneObject = undefined
    primitiveType = undefined

    # some shorthands
    objectsUsedInFrameCounts = graphics.objectsUsedInFrameCounts

    # scan all the objects in the display list
    for sceneObject in @scene.children
      # check the type of object. Each type has one pool. Go through each
      # object in the pool and set to visible the number of used objects in
      # this frame, set the others to hidden.
      # Only tiny exception is that the ball has one pool per detail level.

      # set the first "used*****" objects to visible...
      if objectsUsedInFrameCounts[sceneObject.primitiveType + sceneObject.detailLevel] > 0
        sceneObject.visible = true
        objectsUsedInFrameCounts[sceneObject.primitiveType + sceneObject.detailLevel] -= 1
      else

        # ... and the others to invisible
        sceneObject.visible = false

  # we keep track of where each type of primitive was last drawn
  # and how many of them were overlapping. Clean that data for
  # each frame.
  resetExclusionPrincipleWobbleDataIfNeeded: (graphics) ->
    # resets the place where we recall where
    # each type of primitive was placed last
    if graphics.exclusionPrincipleWobble
      for i in [0...graphics.lastPositionOfPrimitiveType.length]
        graphics.lastPositionOfPrimitiveType[i].set(
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
        )
        graphics.numberOfOverlappingPrimitives[i] = 0


module.exports = ThreeJsSystem

