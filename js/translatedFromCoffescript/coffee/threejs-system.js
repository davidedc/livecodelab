/*
## Sets up canvas or webgl Threejs renderer based on browser capabilities and flags passed
## in the constructor. Sets up all the post-filtering steps.
*/

var ThreeJsSystem;

ThreeJsSystem = (function() {
  "use strict";  ThreeJsSystem.isWebGLUsed = false;

  ThreeJsSystem.composer = {};

  function ThreeJsSystem(Detector, THREEx, blendedThreeJsSceneCanvas, forceCanvasRenderer, testMode, liveCodeLabCore_three) {
    var currentFrameThreeJsSceneCanvas, effectSaveTarget, fxaaPass, previousFrameThreeJSSceneRenderForBlendingCanvas, renderModel, renderTarget, renderTargetParameters, screenPass;

    this.blendedThreeJsSceneCanvas = blendedThreeJsSceneCanvas;
    this.forceCanvasRenderer = forceCanvasRenderer;
    if (!this.blendedThreeJsSceneCanvas) {
      this.blendedThreeJsSceneCanvas = document.createElement("canvas");
      this.blendedThreeJsSceneCanvas.width = window.innerWidth;
      this.blendedThreeJsSceneCanvas.height = window.innerHeight;
    }
    if (!this.forceCanvasRenderer && Detector.webgl) {
      this.ballDefaultDetLevel = 16;
      this.blendedThreeJsSceneCanvasContext = this.blendedThreeJsSceneCanvas.getContext("experimental-webgl");
      this.renderer = new liveCodeLabCore_three.WebGLRenderer({
        canvas: this.blendedThreeJsSceneCanvas,
        preserveDrawingBuffer: testMode,
        antialias: false,
        premultipliedAlpha: false
      });
      this.isWebGLUsed = true;
    } else {
      this.ballDefaultDetLevel = 6;
      this.currentFrameThreeJsSceneCanvas = document.createElement("canvas");
      currentFrameThreeJsSceneCanvas = this.currentFrameThreeJsSceneCanvas;
      currentFrameThreeJsSceneCanvas.width = this.blendedThreeJsSceneCanvas.width;
      currentFrameThreeJsSceneCanvas.height = this.blendedThreeJsSceneCanvas.height;
      this.currentFrameThreeJsSceneCanvasContext = currentFrameThreeJsSceneCanvas.getContext("2d");
      this.previousFrameThreeJSSceneRenderForBlendingCanvas = document.createElement("canvas");
      previousFrameThreeJSSceneRenderForBlendingCanvas = this.previousFrameThreeJSSceneRenderForBlendingCanvas;
      previousFrameThreeJSSceneRenderForBlendingCanvas.width = this.blendedThreeJsSceneCanvas.width;
      previousFrameThreeJSSceneRenderForBlendingCanvas.height = this.blendedThreeJsSceneCanvas.height;
      this.previousFrameThreeJSSceneRenderForBlendingCanvasContext = this.previousFrameThreeJSSceneRenderForBlendingCanvas.getContext("2d");
      this.blendedThreeJsSceneCanvasContext = this.blendedThreeJsSceneCanvas.getContext("2d");
      this.renderer = new liveCodeLabCore_three.CanvasRenderer({
        canvas: currentFrameThreeJsSceneCanvas,
        antialias: true,
        preserveDrawingBuffer: testMode
      });
    }
    this.renderer.setSize(this.blendedThreeJsSceneCanvas.width, this.blendedThreeJsSceneCanvas.height);
    this.scene = new liveCodeLabCore_three.Scene();
    this.scene.matrixAutoUpdate = false;
    this.camera = new liveCodeLabCore_three.PerspectiveCamera(35, this.blendedThreeJsSceneCanvas.width / this.blendedThreeJsSceneCanvas.height, 1, 10000);
    this.camera.position.set(0, 0, 5);
    this.scene.add(this.camera);
    THREEx.WindowResize.bind(this.renderer, this.camera);
    if (this.isWebGLUsed) {
      renderTargetParameters = void 0;
      renderTarget = void 0;
      effectSaveTarget = void 0;
      fxaaPass = void 0;
      screenPass = void 0;
      renderModel = void 0;
      renderTargetParameters = {
        format: liveCodeLabCore_three.RGBAFormat,
        stencilBuffer: true
      };
      renderTarget = new liveCodeLabCore_three.WebGLRenderTarget(this.blendedThreeJsSceneCanvas.width, this.blendedThreeJsSceneCanvas.height, renderTargetParameters);
      effectSaveTarget = new liveCodeLabCore_three.SavePass(new liveCodeLabCore_three.WebGLRenderTarget(this.blendedThreeJsSceneCanvas.width, this.blendedThreeJsSceneCanvas.height, renderTargetParameters));
      effectSaveTarget.clear = false;
      this.effectBlend = new liveCodeLabCore_three.ShaderPass(liveCodeLabCore_three.ShaderExtras.blend, "tDiffuse1");
      screenPass = new liveCodeLabCore_three.ShaderPass(liveCodeLabCore_three.ShaderExtras.screen);
      this.effectBlend.uniforms.tDiffuse2.value = effectSaveTarget.renderTarget;
      this.effectBlend.uniforms.mixRatio.value = 0;
      renderModel = new liveCodeLabCore_three.RenderPass(this.scene, this.camera);
      this.composer = new liveCodeLabCore_three.EffectComposer(this.renderer, renderTarget);
      this.composer.addPass(renderModel);
      this.composer.addPass(this.effectBlend);
      this.composer.addPass(effectSaveTarget);
      this.composer.addPass(screenPass);
      screenPass.renderToScreen = true;
    }
  }

  return ThreeJsSystem;

})();
