###
## Sets up canvas or webgl Threejs renderer based on browser capabilities
## and flags passed in the constructor. Sets up all the post-filtering steps.
###

define [
  'ui/ui'
], (
  Ui
) ->

  class ThreeJsSystem

    @isWebGLUsed: false
    @composer: null
    @timesInvoked: false

    @attachEffectsAndSizeTheirBuffers: (thrsystem, renderer) ->

      liveCodeLabCore_three = thrsystem.liveCodeLabCore_three
      blendedThreeJsSceneCanvas = thrsystem.blendedThreeJsSceneCanvas
      renderTargetParameters = thrsystem.renderTargetParameters
      camera = thrsystem.camera
      scene = thrsystem.scene

      #debugger
      multiplier = 1


      sx = Math.floor((window.innerWidth + 40) / Ui.foregroundCanvasScale)
      sy = Math.floor((window.innerHeight + 40) / Ui.foregroundCanvasScale)


      # dimension on screen
      blendedThreeJsSceneCanvas.style.width = sx + "px"
      blendedThreeJsSceneCanvas.style.height = sy + "px"

      # buffer size
      blendedThreeJsSceneCanvas.width = 2 * sx
      blendedThreeJsSceneCanvas.height = 2 * sy
      #debugger


      multiplier = 2

      if thrsystem.renderTarget?
        thrsystem.renderTarget.dispose()

      renderTarget = new liveCodeLabCore_three.WebGLRenderTarget(
        sx * multiplier,
        sy * multiplier,
        renderTargetParameters)


      console.log "renderTarget width: " + renderTarget.width

      if thrsystem.effectSaveTarget?
        thrsystem.effectSaveTarget.renderTarget.dispose()

      effectSaveTarget = new liveCodeLabCore_three.SavePass(
        new liveCodeLabCore_three.WebGLRenderTarget(
          sx * multiplier,
          sy * multiplier,
          { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: true }
        )
      )

      console.log "effectSaveTarget width: " + effectSaveTarget.width

      effectSaveTarget.clear = false
      
      # Uncomment the three lines containing "fxaaPass" below to try a fast
      # antialiasing filter. Commented below because of two reasons:
      # a) it's slow
      # b) it blends in some black pixels, so it only looks good
      #     in dark backgrounds
      # The problem of blending with black pixels is the same problem of the
      # motionBlur leaving a black trail - tracked in github with
      # https://github.com/davidedc/livecodelab/issues/22
      
      #fxaaPass = new liveCodeLabCore_three.ShaderPass(liveCodeLabCore_three.ShaderExtras.fxaa);
      #fxaaPass.uniforms.resolution.value.set(1 / window.innerWidth, 1 / window.innerHeight);

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
      setTimeout (()=>thrsystem.effectBlend.uniforms.mixRatio.value = mixR), 1

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

    @sizeTheForegroundCanvas: (renderer, camera, scale) ->
      # notify the renderer of the size change
      console.log "windowResize called scale: " + scale + " @composer: " + @composerinner

      # update the camera
      camera.aspect = (window.innerWidth+40) / (window.innerHeight+40)
      camera.updateProjectionMatrix()

      renderer.setSize Math.floor((window.innerWidth+40) / scale), Math.floor((window.innerHeight+40) / scale)
      console.log "renderer new context width: " + renderer.context.drawingBufferWidth

        

    @windowResize: (thrsystem, renderer, camera, scale) ->
      callback = =>
        @sizeTheForegroundCanvas(renderer, camera, scale)
        [thrsystem.renderTarget, thrsystem.effectSaveTarget, thrsystem.effectBlend, thrsystem.composer] = ThreeJsSystem.attachEffectsAndSizeTheirBuffers(thrsystem, renderer)

      
      # bind the resize event
      window.addEventListener "resize", callback, false
      
      # return .stop() the function to stop watching window resize
      
      ###*
      Stop watching window resize
      ###
      stop: ->
        window.removeEventListener "resize", callback
        return

    @bind: (thrsystem, renderer, camera) ->
      @windowResize thrsystem, renderer, camera, Ui.foregroundCanvasScale

    constructor: ( \
      Detector, \
        # THREEx, \
        @blendedThreeJsSceneCanvas, \
        @forceCanvasRenderer, \
        testMode, \
        liveCodeLabCore_three ) ->

      # if we've not been passed a canvas, then create a new one and make it
      # as big as the browser window content.
      unless @blendedThreeJsSceneCanvas
        @blendedThreeJsSceneCanvas = document.createElement("canvas")
        @blendedThreeJsSceneCanvas.width = window.innerWidth
        @blendedThreeJsSceneCanvas.height = window.innerHeight
    
    
      if not @forceCanvasRenderer and Detector.webgl
        # Webgl init.
        # We allow for a bigger ball detail.
        # Also the WebGL context allows us to use the Three JS composer and the
        # postprocessing effects, which use shaders.
        @ballDefaultDetLevel = 16
        @blendedThreeJsSceneCanvasContext =
          @blendedThreeJsSceneCanvas.getContext("experimental-webgl")
        
        # see http://mrdoob.github.com/three.js/docs/53/#Reference/Renderers/WebGLRenderer
        @liveCodeLabCore_three = liveCodeLabCore_three
        @renderer = new liveCodeLabCore_three.WebGLRenderer(
          canvas: @blendedThreeJsSceneCanvas
          #preserveDrawingBuffer: testMode # to allow screenshot
          antialias: false
          premultipliedAlpha: false
        )
        @isWebGLUsed = true

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
        
        currentFrameThreeJsSceneCanvas.width = @blendedThreeJsSceneCanvas.width
        currentFrameThreeJsSceneCanvas.height = @blendedThreeJsSceneCanvas.height


        @currentFrameThreeJsSceneCanvasContext =
          currentFrameThreeJsSceneCanvas.getContext("2d")
        
        @previousFrameThreeJSSceneRenderForBlendingCanvas =
          document.createElement("canvas")
        # some shorthands
        previousFrameThreeJSSceneRenderForBlendingCanvas =
          @previousFrameThreeJSSceneRenderForBlendingCanvas
        previousFrameThreeJSSceneRenderForBlendingCanvas.width =
          @blendedThreeJsSceneCanvas.width
        previousFrameThreeJSSceneRenderForBlendingCanvas.height =
          @blendedThreeJsSceneCanvas.height
        
        @previousFrameThreeJSSceneRenderForBlendingCanvasContext =
          @previousFrameThreeJSSceneRenderForBlendingCanvas.getContext("2d")
        @blendedThreeJsSceneCanvasContext =
          @blendedThreeJsSceneCanvas.getContext("2d")
        
        # see http://mrdoob.github.com/three.js/docs/53/#Reference/Renderers/CanvasRenderer
        @renderer = new liveCodeLabCore_three.CanvasRenderer(
          canvas: currentFrameThreeJsSceneCanvas
          antialias: false # to get smoother output
          preserveDrawingBuffer: testMode # to allow screenshot
          # todo figure out why this works. this parameter shouldn't
          # be necessary, as per https://github.com/mrdoob/three.js/issues/2833 and
          # https://github.com/mrdoob/three.js/releases this parameter
          # should not be needed. If we don't pass it, the canvas is all off, the
          # unity box is painted centerd in the bottom right corner
          devicePixelRatio: 1
        )
        
      #@renderer.setSize @blendedThreeJsSceneCanvas.width, \
      #  @blendedThreeJsSceneCanvas.height
      #@renderer.setViewport( 0, 0, @blendedThreeJsSceneCanvas.width, @blendedThreeJsSceneCanvas.height )

      console.log "renderer width: " + @renderer.width + " context width: " + @renderer.context.drawingBufferWidth
      @scene = new liveCodeLabCore_three.Scene()
      @scene.matrixAutoUpdate = false
      
      # put a camera in the scene
      @camera = new liveCodeLabCore_three.PerspectiveCamera(35, \
        @blendedThreeJsSceneCanvas.width / \
        @blendedThreeJsSceneCanvas.height, 1, 10000)
      console.log "camera width: " + @camera.width
      @camera.position.set 0, 0, 5
      @scene.add @camera
      

      # transparently support window resize
      @constructor.bind @, @renderer, @camera
      
      if @isWebGLUsed
        @renderTargetParameters = undefined
        @renderTarget = undefined
        @effectSaveTarget = undefined
        fxaaPass = undefined
        screenPass = undefined
        renderModel = undefined
        @renderTargetParameters =
          format: liveCodeLabCore_three.RGBAFormat
          stencilBuffer: true
      
        # these are the two buffers.
        @constructor.sizeTheForegroundCanvas(@renderer, @camera, Ui.foregroundCanvasScale)

        [@renderTarget, @effectSaveTarget, @effectBlend, @composer] = @constructor.attachEffectsAndSizeTheirBuffers(@, @renderer)



  ThreeJsSystem

