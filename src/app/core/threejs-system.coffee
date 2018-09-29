###
## Sets up webgl Threejs renderer based on browser capabilities
## and flags passed in the constructor. Sets up all the post-filtering steps.
###

_  = require 'underscore'

require '../lib/threejs/shaders/CopyShader'
require '../lib/threejs/shaders/LCLBlendShader'

require '../lib/threejs/postprocessing/EffectComposer'
require '../lib/threejs/postprocessing/MaskPass'
require '../lib/threejs/postprocessing/RenderPass'
require '../lib/threejs/postprocessing/SavePass'
require '../lib/threejs/postprocessing/ShaderPass'


class ThreeJsSystem

  renderTarget: undefined # used by effects
  effectSaveTarget: undefined # used by effects

  effectBlend: undefined # used by blend-controls
  composer: undefined # used by renderer
  scene: undefined # used by renderer, graphics commands and light commands

  constructor: (canvas) ->

    @canvasContext = canvas.getDOMElement().getContext("experimental-webgl")

    # https://threejs.org/docs/index.html#Reference/Renderers/WebGLRenderer
    @renderer = new THREE.WebGLRenderer({
      canvas: canvas.getDOMElement(),
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
    @scene = new THREE.Scene()
    @scene.matrixAutoUpdate = false

    # https://threejs.org/docs/index.html#Reference/Cameras/PerspectiveCamera
    @camera = new THREE.PerspectiveCamera(35, canvas.getAspectRatio(), 1, 10000)
    @camera.position.set 0, 0, 5
    @scene.add @camera

    # Set correct aspect ration and renderer size
    bufferSize = canvas.getBestBufferSize()
    @sizeRendererAndCamera(bufferSize)
    @createEffectsPipeline(bufferSize)
    canvas.onResize((bufferSize) => 
      @sizeRendererAndCamera(bufferSize)
      @createEffectsPipeline(bufferSize)
    )

  createEffectsPipeline: ({width, height}) ->

    # If we're re-creating the effects pipeline then we need a new,
    # correctly sized renderTarget
    if @renderTarget?
        @renderTarget.dispose()

    # Render a copy of the scene
    # https://threejs.org/docs/?q=render#Reference/Renderers/WebGLRenderTarget
    @renderTarget = new THREE.WebGLRenderTarget(width, height)


    # If we're re-creating the effects pipeline then we need a new,
    # correctly sized effectSaveTarget
    if @effectSaveTarget?
        @effectSaveTarget.renderTarget.dispose()

    # The rendering pipeline that's going to combine all the effects
    @composer = new THREE.EffectComposer(@renderer, @renderTarget)


    # Render the scene into the start of the effects chain
    @renderPass = new THREE.RenderPass(@scene, @camera)
    @composer.addPass(@renderPass)


    # This is where a copy of the rendered scene is going to be saved.
    # Essentially this is the last frame with all the effects.
    @effectSaveTarget = new THREE.SavePass(
        new THREE.WebGLRenderTarget(width, height)
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
    @effectBlend = new THREE.ShaderPass(THREE.LCLBlendShader, "tDiffuse1")
    @effectBlend.uniforms.tDiffuse2.value = @effectSaveTarget.renderTarget.texture
    @effectBlend.uniforms.mixRatio.value = mixRatio

    # Add the blending into the effects pipeline
    @composer.addPass(@effectBlend)

    # Save a copy of the output to the effectSaveTarget
    @composer.addPass(@effectSaveTarget)

    # Render everything to the screen
    @screenPass = new THREE.ShaderPass(THREE.CopyShader)
    @screenPass.renderToScreen = true
    @composer.addPass(@screenPass)

  sizeRendererAndCamera: ({width, height}) ->
    @camera.aspect = width / height
    @camera.updateProjectionMatrix()
    @renderer.setSize(width, height, false)


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


module.exports = ThreeJsSystem

