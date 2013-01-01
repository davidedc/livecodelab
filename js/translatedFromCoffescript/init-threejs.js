var createThreeJsSystem;

createThreeJsSystem = function(Detector, THREEx, blendedThreeJsSceneCanvas, forceCanvasRenderer, testMode, liveCodeLabCore_THREE) {
  "use strict";

  var ThreeJsSystem, currentFrameThreeJsSceneCanvas, pointLight, previousFrameThreeJSSceneRenderForBlendingCanvas;
  ThreeJsSystem = {};
  pointLight = void 0;
  ThreeJsSystem.isWebGLUsed = false;
  ThreeJsSystem.composer = {};
  ThreeJsSystem.forceCanvasRenderer = forceCanvasRenderer;
  if (!blendedThreeJsSceneCanvas) {
    blendedThreeJsSceneCanvas = document.createElement("canvas");
    blendedThreeJsSceneCanvas.width = window.innerWidth;
    blendedThreeJsSceneCanvas.height = window.innerHeight;
  }
  ThreeJsSystem.blendedThreeJsSceneCanvas = blendedThreeJsSceneCanvas;
  if (!ThreeJsSystem.forceCanvasRenderer && Detector.webgl) {
    ThreeJsSystem.ballDefaultDetLevel = 16;
    ThreeJsSystem.blendedThreeJsSceneCanvasContext = blendedThreeJsSceneCanvas.getContext("experimental-webgl");
    ThreeJsSystem.renderer = new liveCodeLabCore_THREE.WebGLRenderer({
      canvas: ThreeJsSystem.blendedThreeJsSceneCanvas,
      preserveDrawingBuffer: testMode,
      antialias: false,
      premultipliedAlpha: false
    });
    ThreeJsSystem.isWebGLUsed = true;
  } else {
    ThreeJsSystem.ballDefaultDetLevel = 6;
    ThreeJsSystem.currentFrameThreeJsSceneCanvas = document.createElement("canvas");
    currentFrameThreeJsSceneCanvas = ThreeJsSystem.currentFrameThreeJsSceneCanvas;
    currentFrameThreeJsSceneCanvas.width = ThreeJsSystem.blendedThreeJsSceneCanvas.width;
    currentFrameThreeJsSceneCanvas.height = ThreeJsSystem.blendedThreeJsSceneCanvas.height;
    ThreeJsSystem.currentFrameThreeJsSceneCanvasContext = currentFrameThreeJsSceneCanvas.getContext("2d");
    ThreeJsSystem.previousFrameThreeJSSceneRenderForBlendingCanvas = document.createElement("canvas");
    previousFrameThreeJSSceneRenderForBlendingCanvas = ThreeJsSystem.previousFrameThreeJSSceneRenderForBlendingCanvas;
    previousFrameThreeJSSceneRenderForBlendingCanvas.width = ThreeJsSystem.blendedThreeJsSceneCanvas.width;
    previousFrameThreeJSSceneRenderForBlendingCanvas.height = ThreeJsSystem.blendedThreeJsSceneCanvas.height;
    ThreeJsSystem.previousFrameThreeJSSceneRenderForBlendingCanvasContext = ThreeJsSystem.previousFrameThreeJSSceneRenderForBlendingCanvas.getContext("2d");
    ThreeJsSystem.blendedThreeJsSceneCanvasContext = ThreeJsSystem.blendedThreeJsSceneCanvas.getContext("2d");
    ThreeJsSystem.renderer = new liveCodeLabCore_THREE.CanvasRenderer({
      canvas: currentFrameThreeJsSceneCanvas,
      antialias: true,
      preserveDrawingBuffer: testMode
    });
  }
  ThreeJsSystem.renderer.setSize(ThreeJsSystem.blendedThreeJsSceneCanvas.width, ThreeJsSystem.blendedThreeJsSceneCanvas.height);
  ThreeJsSystem.scene = new liveCodeLabCore_THREE.Scene();
  ThreeJsSystem.scene.matrixAutoUpdate = false;
  ThreeJsSystem.camera = new liveCodeLabCore_THREE.PerspectiveCamera(35, ThreeJsSystem.blendedThreeJsSceneCanvas.width / ThreeJsSystem.blendedThreeJsSceneCanvas.height, 1, 10000);
  ThreeJsSystem.camera.position.set(0, 0, 5);
  ThreeJsSystem.scene.add(ThreeJsSystem.camera);
  THREEx.WindowResize.bind(ThreeJsSystem.renderer, ThreeJsSystem.camera);
  ThreeJsSystem.buildPostprocessingChain = function() {
    var effectSaveTarget, fxaaPass, renderModel, renderTarget, renderTargetParameters, screenPass;
    renderTargetParameters = void 0;
    renderTarget = void 0;
    effectSaveTarget = void 0;
    fxaaPass = void 0;
    screenPass = void 0;
    renderModel = void 0;
    renderTargetParameters = {
      format: liveCodeLabCore_THREE.RGBAFormat,
      stencilBuffer: true
    };
    renderTarget = new liveCodeLabCore_THREE.WebGLRenderTarget(ThreeJsSystem.blendedThreeJsSceneCanvas.width, ThreeJsSystem.blendedThreeJsSceneCanvas.height, renderTargetParameters);
    effectSaveTarget = new liveCodeLabCore_THREE.SavePass(new liveCodeLabCore_THREE.WebGLRenderTarget(ThreeJsSystem.blendedThreeJsSceneCanvas.width, ThreeJsSystem.blendedThreeJsSceneCanvas.height, renderTargetParameters));
    effectSaveTarget.clear = false;
    ThreeJsSystem.effectBlend = new liveCodeLabCore_THREE.ShaderPass(liveCodeLabCore_THREE.ShaderExtras.blend, "tDiffuse1");
    screenPass = new liveCodeLabCore_THREE.ShaderPass(liveCodeLabCore_THREE.ShaderExtras.screen);
    ThreeJsSystem.effectBlend.uniforms.tDiffuse2.value = effectSaveTarget.renderTarget;
    ThreeJsSystem.effectBlend.uniforms.mixRatio.value = 0;
    renderModel = new liveCodeLabCore_THREE.RenderPass(ThreeJsSystem.scene, ThreeJsSystem.camera);
    ThreeJsSystem.composer = new liveCodeLabCore_THREE.EffectComposer(ThreeJsSystem.renderer, renderTarget);
    ThreeJsSystem.composer.addPass(renderModel);
    ThreeJsSystem.composer.addPass(ThreeJsSystem.effectBlend);
    ThreeJsSystem.composer.addPass(effectSaveTarget);
    ThreeJsSystem.composer.addPass(screenPass);
    return screenPass.renderToScreen = true;
  };
  if (ThreeJsSystem.isWebGLUsed) {
    ThreeJsSystem.buildPostprocessingChain();
  }
  return ThreeJsSystem;
};
