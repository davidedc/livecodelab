/*
## A LiveCodeLabCore instance packs together the following parts:
## 
##  - timeKeeper
##  - three
##  - threeJsSystem
##  - matrixCommands
##  - blendControls
##  - soundSystem
##  - colourFunctions
##  - backgroundPainter
##  - graphicsCommands
##  - lightSystem 
##  - drawFunctionRunner
##  - codeTransformer
##  - renderer
##  - animationLoop
## 
##  LiveCodeLab is built one part at a time, and the arguments in the constructor
##  tell how they depend on each other at construction time and how they
##  interact at runtime.
## 
##  - _A constructor with no arguments_ (or where the arguments are just passed
##    by the caller of the very createLiveCodeLabCore function we are in),
##    such as createColourFunctions, is a part
##    that does not need any other part at construction time and it doesn't interact
##    with any of the other parts at run time.
##  - _A constructor with arguments other than "liveCodeLabCoreInstance"_
##    (such as threeJsSystem) only needs the parts passed at construction time for its
##    own construction, and it can only interact with such parts at runtime.
##  - _A constructor which contains the "liveCodeLabCoreInstance" argument_, such as
##    codeTransformer, might or might not need other parts for its own construction
##    (if they are passed as arguments in addition to the "liveCodeLabCoreInstance" argument)
##    but it does interact at runtime with other parts not passed in the constructor
##    argument.
## 
##  So, for determining the order of the constructors, one can just look at the
##  dependencies dictated by the arguments other than the "liveCodeLabCoreInstance"
##  argument. The "liveCodeLabCoreInstance" parameter
##  doesn't create dependencies at creation time,
##  it's just used by the parts to reference other parts that they need to interact to
##  at runtime.
## 
##  It might well be that at runtime part A interacts with part B and viceversa.
##  This is why runtime interactions are not restricted to parts passed
##  as arguments at construction
##  time, because one would need to pass constructed part A to the constructor of part B
##  and viceversa, which is obviously impossible. This is why the runtime interactions
##  happen through the mother of all parts, i.e. "liveCodeLabCoreInstance" itself.
## 
##  To determine which parts any single part interacts with at runtime, one
##  has to check all the parameters passed to the constructor. The passed parts are likely
##  to mean that there is an interaction at runtime. If the "mother"
##  "liveCodeLabCoreInstance" is passed to the constructor, then one case to look for
##  all "liveCodeLabCoreInstance" occurrences and see which of its children are
##  accessed.
*/

var LiveCodeLabCore;

LiveCodeLabCore = (function() {
  "use strict";  function LiveCodeLabCore(paramsObject) {
    this.paramsObject = paramsObject;
    this.three = THREE;
    this.timeKeeper = new TimeKeeper();
    this.blendControls = new BlendControls(this);
    this.colourFunctions = new ColourFunctions();
    this.renderer = new Renderer(this);
    this.soundSystem = new SoundSystem(this.paramsObject.eventRouter, buzz, createBowser(), new SampleBank(buzz));
    this.backgroundPainter = new BackgroundPainter(this.paramsObject.canvasForBackground, this);
    this.drawFunctionRunner = new ProgramRunner(this.paramsObject.eventRouter, this);
    this.codeTransformer = new CodeTransformer(this.paramsObject.eventRouter, CoffeeScript, this);
    this.animationLoop = new AnimationLoop(this.paramsObject.eventRouter, this.paramsObject.statsWidget, this);
    this.threeJsSystem = new ThreeJsSystem(Detector, THREEx, this.paramsObject.blendedThreeJsSceneCanvas, this.paramsObject.forceCanvasRenderer, this.paramsObject.testMode, this.three);
    this.matrixCommands = new MatrixCommands(this.three, this);
    this.graphicsCommands = new GraphicsCommands(this.three, this);
    this.lightSystem = new LightsCommands(this.graphicsCommands, this);
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
