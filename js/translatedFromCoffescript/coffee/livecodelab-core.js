var createLiveCodeLabCore;

createLiveCodeLabCore = function(paramsObject) {
  "use strict";

  var liveCodeLabCoreInstance;
  liveCodeLabCoreInstance = {};
  liveCodeLabCoreInstance.THREE = THREE;
  liveCodeLabCoreInstance.TimeKeeper = new TimeKeeper();
  liveCodeLabCoreInstance.BlendControls = new BlendControls(liveCodeLabCoreInstance);
  liveCodeLabCoreInstance.ColourFunctions = createColourFunctions();
  liveCodeLabCoreInstance.Renderer = new Renderer(liveCodeLabCoreInstance);
  liveCodeLabCoreInstance.SoundSystem = createSoundSystem(paramsObject.eventRouter, buzz, createBowser(), createSampleBank(buzz));
  liveCodeLabCoreInstance.BackgroundPainter = new BackgroundPainter(paramsObject.canvasForBackground, liveCodeLabCoreInstance);
  liveCodeLabCoreInstance.DrawFunctionRunner = new DrawFunctionRunner(paramsObject.eventRouter, liveCodeLabCoreInstance);
  liveCodeLabCoreInstance.CodeTransformer = new CodeTransformer(paramsObject.eventRouter, CoffeeScript, liveCodeLabCoreInstance);
  liveCodeLabCoreInstance.AnimationLoop = new AnimationLoop(paramsObject.eventRouter, paramsObject.statsWidget, liveCodeLabCoreInstance);
  liveCodeLabCoreInstance.ThreeJsSystem = new ThreeJsSystem(Detector, THREEx, paramsObject.blendedThreeJsSceneCanvas, paramsObject.forceCanvasRenderer, paramsObject.testMode, liveCodeLabCoreInstance.THREE);
  liveCodeLabCoreInstance.MatrixCommands = new MatrixCommands(liveCodeLabCoreInstance.THREE, liveCodeLabCoreInstance);
  liveCodeLabCoreInstance.GraphicsCommands = new GraphicsCommands(liveCodeLabCoreInstance.THREE, liveCodeLabCoreInstance);
  liveCodeLabCoreInstance.LightSystem = new LightSystem(liveCodeLabCoreInstance.GraphicsCommands, liveCodeLabCoreInstance);
  liveCodeLabCoreInstance.paintARandomBackground = function() {
    return liveCodeLabCoreInstance.BackgroundPainter.paintARandomBackground();
  };
  liveCodeLabCoreInstance.startAnimationLoop = function() {
    return liveCodeLabCoreInstance.AnimationLoop.animate();
  };
  liveCodeLabCoreInstance.runLastWorkingDrawFunction = function() {
    return liveCodeLabCoreInstance.DrawFunctionRunner.reinstateLastWorkingDrawFunction();
  };
  liveCodeLabCoreInstance.loadAndTestAllTheSounds = function() {
    return liveCodeLabCoreInstance.SoundSystem.loadAndTestAllTheSounds();
  };
  liveCodeLabCoreInstance.playStartupSound = function() {
    return liveCodeLabCoreInstance.SoundSystem.playStartupSound();
  };
  liveCodeLabCoreInstance.isAudioSupported = function() {
    return liveCodeLabCoreInstance.SoundSystem.isAudioSupported();
  };
  liveCodeLabCoreInstance.updateCode = function(updatedCode) {
    liveCodeLabCoreInstance.CodeTransformer.updateCode(updatedCode);
    if (updatedCode !== "" && liveCodeLabCoreInstance.dozingOff) {
      liveCodeLabCoreInstance.dozingOff = false;
      liveCodeLabCoreInstance.AnimationLoop.animate();
      return paramsObject.eventRouter.trigger("livecodelab-waking-up");
    }
  };
  liveCodeLabCoreInstance.getForeground3DSceneImage = function(backgroundColor) {
    var blendedThreeJsSceneCanvas, ctx, ctxContext, img;
    blendedThreeJsSceneCanvas = liveCodeLabCoreInstance.ThreeJsSystem.blendedThreeJsSceneCanvas;
    img = new Image;
    img.src = blendedThreeJsSceneCanvas.toDataURL();
    if (backgroundColor) {
      ctx = document.createElement("canvas");
      ctx.width = blendedThreeJsSceneCanvas.width;
      ctx.height = blendedThreeJsSceneCanvas.height;
      ctxContext = ctx.getContext("2d");
      ctxContext.drawImage(img, 0, 0);
      ctxContext.globalCompositeOperation = "destination-over";
      ctxContext.fillStyle = backgroundColor;
      ctxContext.fillRect(0, 0, blendedThreeJsSceneCanvas.width, blendedThreeJsSceneCanvas.height);
      img = new Image;
      img.src = ctx.toDataURL();
    }
    return img;
  };
  return liveCodeLabCoreInstance;
};
