#jslint browser: true, devel: true 

createThreeJsSystem = ( \
    Detector, \
	  THREEx, \
	  blendedThreeJsSceneCanvas, \
	  forceCanvasRenderer, \
	  testMode, \
	  liveCodeLabCore_THREE ) ->

  "use strict"
  ThreeJsSystem = {}
  pointLight = undefined
  ThreeJsSystem.isWebGLUsed = false
  ThreeJsSystem.composer = {}
  ThreeJsSystem.forceCanvasRenderer = forceCanvasRenderer
  
  # if we've not been passed a canvas, then create a new one and make it
  # as big as the browser window content.
  unless blendedThreeJsSceneCanvas
    blendedThreeJsSceneCanvas = document.createElement("canvas")
    blendedThreeJsSceneCanvas.width = window.innerWidth
    blendedThreeJsSceneCanvas.height = window.innerHeight

  ThreeJsSystem.blendedThreeJsSceneCanvas = blendedThreeJsSceneCanvas

  if not ThreeJsSystem.forceCanvasRenderer and Detector.webgl    
    # Webgl init.
    # We allow for a bigger ball detail.        
    # Also the WebGL context allows us to use the Three JS composer and the
    # postprocessing effects, which use shaders.
    ThreeJsSystem.ballDefaultDetLevel = 16
    ThreeJsSystem.blendedThreeJsSceneCanvasContext =
      blendedThreeJsSceneCanvas.getContext("experimental-webgl")
    
    # see http://mrdoob.github.com/three.js/docs/53/#Reference/Renderers/WebGLRenderer
    ThreeJsSystem.renderer = new liveCodeLabCore_THREE.WebGLRenderer(
      canvas: ThreeJsSystem.blendedThreeJsSceneCanvas
      preserveDrawingBuffer: testMode # to allow screenshot
      antialias: false
      premultipliedAlpha: false
    )
    ThreeJsSystem.isWebGLUsed = true

  else    
    # Canvas init.
    # Note that the canvas init requires two extra canvases in order to achieve
    # the motion blur (as we need to keep the previous frame). Basically we have
    # to do manually what the WebGL solution achieves through the Three.js composer
    # and postprocessing/shaders.
    ThreeJsSystem.ballDefaultDetLevel = 6
    ThreeJsSystem.currentFrameThreeJsSceneCanvas = document.createElement("canvas")
    
    # some shorthands
    currentFrameThreeJsSceneCanvas = ThreeJsSystem.currentFrameThreeJsSceneCanvas
    
    currentFrameThreeJsSceneCanvas.width = ThreeJsSystem.blendedThreeJsSceneCanvas.width
    currentFrameThreeJsSceneCanvas.height = ThreeJsSystem.blendedThreeJsSceneCanvas.height

    ThreeJsSystem.currentFrameThreeJsSceneCanvasContext =
      currentFrameThreeJsSceneCanvas.getContext("2d")

    ThreeJsSystem.previousFrameThreeJSSceneRenderForBlendingCanvas =
      document.createElement("canvas")
    # some shorthands
    previousFrameThreeJSSceneRenderForBlendingCanvas =
      ThreeJsSystem.previousFrameThreeJSSceneRenderForBlendingCanvas
    previousFrameThreeJSSceneRenderForBlendingCanvas.width =
      ThreeJsSystem.blendedThreeJsSceneCanvas.width
    previousFrameThreeJSSceneRenderForBlendingCanvas.height =
      ThreeJsSystem.blendedThreeJsSceneCanvas.height

    ThreeJsSystem.previousFrameThreeJSSceneRenderForBlendingCanvasContext =
      ThreeJsSystem.previousFrameThreeJSSceneRenderForBlendingCanvas.getContext("2d")
    ThreeJsSystem.blendedThreeJsSceneCanvasContext =
      ThreeJsSystem.blendedThreeJsSceneCanvas.getContext("2d")
    
    # see http://mrdoob.github.com/three.js/docs/53/#Reference/Renderers/CanvasRenderer
    ThreeJsSystem.renderer = new liveCodeLabCore_THREE.CanvasRenderer(
      canvas: currentFrameThreeJsSceneCanvas
      antialias: true # to get smoother output
      preserveDrawingBuffer: testMode # to allow screenshot
    )

  ThreeJsSystem.renderer.setSize ThreeJsSystem.blendedThreeJsSceneCanvas.width, \
    ThreeJsSystem.blendedThreeJsSceneCanvas.height
  ThreeJsSystem.scene = new liveCodeLabCore_THREE.Scene()
  ThreeJsSystem.scene.matrixAutoUpdate = false
  
  # put a camera in the scene
  ThreeJsSystem.camera = new liveCodeLabCore_THREE.PerspectiveCamera(35, \
    ThreeJsSystem.blendedThreeJsSceneCanvas.width / \
    ThreeJsSystem.blendedThreeJsSceneCanvas.height, 1, 10000)
  ThreeJsSystem.camera.position.set 0, 0, 5
  ThreeJsSystem.scene.add ThreeJsSystem.camera
  
  # transparently support window resize
  THREEx.WindowResize.bind ThreeJsSystem.renderer, ThreeJsSystem.camera
  ThreeJsSystem.buildPostprocessingChain = ->
    renderTargetParameters = undefined
    renderTarget = undefined
    effectSaveTarget = undefined
    fxaaPass = undefined
    screenPass = undefined
    renderModel = undefined
    renderTargetParameters =
      format: liveCodeLabCore_THREE.RGBAFormat
      stencilBuffer: true

    renderTarget = new liveCodeLabCore_THREE.WebGLRenderTarget(
      ThreeJsSystem.blendedThreeJsSceneCanvas.width,
      ThreeJsSystem.blendedThreeJsSceneCanvas.height,
      renderTargetParameters)
    effectSaveTarget = new liveCodeLabCore_THREE.SavePass(
      new liveCodeLabCore_THREE.WebGLRenderTarget(
        ThreeJsSystem.blendedThreeJsSceneCanvas.width,
        ThreeJsSystem.blendedThreeJsSceneCanvas.height,
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
    
    #fxaaPass = new liveCodeLabCore_THREE.ShaderPass(liveCodeLabCore_THREE.ShaderExtras.fxaa);
    #fxaaPass.uniforms.resolution.value.set(1 / window.innerWidth, 1 / window.innerHeight);
    ThreeJsSystem.effectBlend = new liveCodeLabCore_THREE.ShaderPass(
      liveCodeLabCore_THREE.ShaderExtras.blend, "tDiffuse1")
    screenPass = new liveCodeLabCore_THREE.ShaderPass(
      liveCodeLabCore_THREE.ShaderExtras.screen)
    
    # motion blur
    ThreeJsSystem.effectBlend.uniforms.tDiffuse2.value = effectSaveTarget.renderTarget
    ThreeJsSystem.effectBlend.uniforms.mixRatio.value = 0
    renderModel = new liveCodeLabCore_THREE.RenderPass(
      ThreeJsSystem.scene, ThreeJsSystem.camera)
    ThreeJsSystem.composer = new liveCodeLabCore_THREE.EffectComposer(
      ThreeJsSystem.renderer, renderTarget)
    ThreeJsSystem.composer.addPass renderModel
    
    #ThreeJsSystem.composer.addPass(fxaaPass);
    ThreeJsSystem.composer.addPass ThreeJsSystem.effectBlend
    ThreeJsSystem.composer.addPass effectSaveTarget
    ThreeJsSystem.composer.addPass screenPass
    screenPass.renderToScreen = true

  ThreeJsSystem.buildPostprocessingChain()  if ThreeJsSystem.isWebGLUsed
  ThreeJsSystem