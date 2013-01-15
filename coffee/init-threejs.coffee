#jslint browser: true, devel: true 

"use strict"
class ThreeJsSystem
  @isWebGLUsed: false
  @composer: {}
  constructor: ( \
    Detector, \
	  THREEx, \
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
      @renderer = new liveCodeLabCore_three.WebGLRenderer(
        canvas: @blendedThreeJsSceneCanvas
        preserveDrawingBuffer: testMode # to allow screenshot
        antialias: false
        premultipliedAlpha: false
      )
      @isWebGLUsed = true

    else    
      # Canvas init.
      # Note that the canvas init requires two extra canvases in order to achieve
      # the motion blur (as we need to keep the previous frame). Basically we have
      # to do manually what the WebGL solution achieves through the Three.js composer
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
        antialias: true # to get smoother output
        preserveDrawingBuffer: testMode # to allow screenshot
      )
      
    @renderer.setSize @blendedThreeJsSceneCanvas.width, \
      @blendedThreeJsSceneCanvas.height
    @scene = new liveCodeLabCore_three.Scene()
    @scene.matrixAutoUpdate = false
    
    # put a camera in the scene
    @camera = new liveCodeLabCore_three.PerspectiveCamera(35, \
      @blendedThreeJsSceneCanvas.width / \
      @blendedThreeJsSceneCanvas.height, 1, 10000)
    @camera.position.set 0, 0, 5
    @scene.add @camera
    
    # transparently support window resize
    THREEx.WindowResize.bind @renderer, @camera
    
    if @isWebGLUsed
      renderTargetParameters = undefined
      renderTarget = undefined
      effectSaveTarget = undefined
      fxaaPass = undefined
      screenPass = undefined
      renderModel = undefined
      renderTargetParameters =
        format: liveCodeLabCore_three.RGBAFormat
        stencilBuffer: true
    
      renderTarget = new liveCodeLabCore_three.WebGLRenderTarget(
        @blendedThreeJsSceneCanvas.width,
        @blendedThreeJsSceneCanvas.height,
        renderTargetParameters)
      effectSaveTarget = new liveCodeLabCore_three.SavePass(
        new liveCodeLabCore_three.WebGLRenderTarget(
          @blendedThreeJsSceneCanvas.width,
          @blendedThreeJsSceneCanvas.height,
          renderTargetParameters
        )
      )
      effectSaveTarget.clear = false
      
      # Uncomment the three lines containing "fxaaPass" below to try a fast
      # antialiasing filter. Commented below because of two reasons: a) it's slow
      # b) it blends in some black pixels, so it only looks good in dark backgrounds
      # The problem of blending with black pixels is the same problem of the
      # motionBlur leaving a black trail - tracked in github with
      # https://github.com/davidedc/livecodelab/issues/22
      
      #fxaaPass = new liveCodeLabCore_three.ShaderPass(liveCodeLabCore_three.ShaderExtras.fxaa);
      #fxaaPass.uniforms.resolution.value.set(1 / window.innerWidth, 1 / window.innerHeight);
      @effectBlend = new liveCodeLabCore_three.ShaderPass(
        liveCodeLabCore_three.ShaderExtras.blend, "tDiffuse1")
      screenPass = new liveCodeLabCore_three.ShaderPass(
        liveCodeLabCore_three.ShaderExtras.screen)
      
      # motion blur
      @effectBlend.uniforms.tDiffuse2.value = effectSaveTarget.renderTarget
      @effectBlend.uniforms.mixRatio.value = 0
      renderModel = new liveCodeLabCore_three.RenderPass(
        @scene, @camera)
      @composer = new liveCodeLabCore_three.EffectComposer(
        @renderer, renderTarget)
      @composer.addPass renderModel
      
      #@composer.addPass(fxaaPass);
      @composer.addPass @effectBlend
      @composer.addPass effectSaveTarget
      @composer.addPass screenPass
      screenPass.renderToScreen = true
