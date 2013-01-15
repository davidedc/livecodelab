"use strict";

var LiveCodeLabCore;

LiveCodeLabCore = (function() {

  function LiveCodeLabCore(paramsObject) {
    this.paramsObject = paramsObject;
    this.three = THREE;
    this.timeKeeper = new TimeKeeper();
    this.blendControls = new BlendControls(this);
    this.colourFunctions = createColourFunctions();
    this.renderer = new Renderer(this);
    this.soundSystem = createSoundSystem(this.paramsObject.eventRouter, buzz, createBowser(), createSampleBank(buzz));
    this.backgroundPainter = new BackgroundPainter(this.paramsObject.canvasForBackground, this);
    this.drawFunctionRunner = new DrawFunctionRunner(this.paramsObject.eventRouter, this);
    this.codeTransformer = new CodeTransformer(this.paramsObject.eventRouter, CoffeeScript, this);
    this.animationLoop = new AnimationLoop(this.paramsObject.eventRouter, this.paramsObject.statsWidget, this);
    this.threeJsSystem = new ThreeJsSystem(Detector, THREEx, this.paramsObject.blendedThreeJsSceneCanvas, this.paramsObject.forceCanvasRenderer, this.paramsObject.testMode, this.three);
    this.matrixCommands = new MatrixCommands(this.three, this);
    this.graphicsCommands = new GraphicsCommands(this.three, this);
    this.lightSystem = new LightSystem(this.graphicsCommands, this);
  }

  LiveCodeLabCore.prototype.paintARandomBackground = function() {
    return this.backgroundPainter.paintARandomBackground();
  };

  LiveCodeLabCore.prototype.startAnimationLoop = function() {
    return this.animationLoop.animate();
  };

  LiveCodeLabCore.prototype.runLastWorkingDrawFunction = function() {
    return this.drawFunctionRunner.reinstateLastWorkingDrawFunction();
  };

  LiveCodeLabCore.prototype.loadAndTestAllTheSounds = function() {
    return this.soundSystem.loadAndTestAllTheSounds();
  };

  LiveCodeLabCore.prototype.playStartupSound = function() {
    return this.soundSystem.playStartupSound();
  };

  LiveCodeLabCore.prototype.isAudioSupported = function() {
    return this.soundSystem.isAudioSupported();
  };

  LiveCodeLabCore.prototype.updateCode = function(updatedCode) {
    this.codeTransformer.updateCode(updatedCode);
    if (updatedCode !== "" && this.dozingOff) {
      this.dozingOff = false;
      this.animationLoop.animate();
      return this.paramsObject.eventRouter.trigger("livecodelab-waking-up");
    }
  };

  LiveCodeLabCore.prototype.getForeground3DSceneImage = function(backgroundColor) {
    var blendedThreeJsSceneCanvas, ctx, ctxContext, img;
    blendedThreeJsSceneCanvas = this.threeJsSystem.blendedThreeJsSceneCanvas;
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

  return LiveCodeLabCore;

})();
