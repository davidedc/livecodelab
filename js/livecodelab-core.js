var createLiveCodeLabCore = function (blendedThreeJsSceneCanvas, canvasForBackground, forceCanvasRenderer, eventRouter, stats ) {

    'use strict';

    var liveCodeLabCoreInstance = {};

    liveCodeLabCoreInstance.TimeKeeper = createTimeKeeper();
    // THREE is a global defined in three.min.js and used in ShaderPass, ShaderExtras, SavePass, RenderPass, MaskPass
    // The difference between THREE and the ThreeJsSystem initialised later is that
    // a) THREE is the raw Three.js system without for example the blend options.
    // b) ThreeJsSystem contains some convenience fields and abstractions, for example
    //    it keeps the renderer (whether it's canvas-based or WebGL based) in a
    //    "renderer" field.
    // Several fields/methids in ThreeJsSystem are just conveniency mappings into
    // the raw THREE object.
    // But often in LiveCodeLab there are direct reference to THREE fields/methods.
    // So, ThreeJsSystem provides some abstraction without attempting to be a complete
    // abstraction layer.
    liveCodeLabCoreInstance.THREE = THREE;
    liveCodeLabCoreInstance.ThreeJsSystem = createThreeJsSystem(Detector, THREEx, blendedThreeJsSceneCanvas, forceCanvasRenderer, liveCodeLabCoreInstance.THREE);
    // this one below also uses TimeKeeper at runtime
    liveCodeLabCoreInstance.MatrixCommands = createMatrixCommands(liveCodeLabCoreInstance.THREE, liveCodeLabCoreInstance);
    // this one below also uses ThreeJsSystem at runtime
    liveCodeLabCoreInstance.BlendControls = createBlendControls(liveCodeLabCoreInstance); 
    liveCodeLabCoreInstance.SoundSystem = createSoundSystem(eventRouter, buzz, createBowser(), createSampleBank(buzz)); // $ 
    liveCodeLabCoreInstance.ColourFunctions = createColourFunctions(); 
    // this one below also uses ColourFunctions at runtime
    liveCodeLabCoreInstance.BackgroundPainter = createBackgroundPainter(eventRouter, liveCodeLabCoreInstance); // $ 
    // this one below also uses ColourFunctions, LightSystem at runtime
    liveCodeLabCoreInstance.GraphicsCommands = createGraphicsCommands(liveCodeLabCoreInstance.THREE, liveCodeLabCoreInstance); // color, LightSystem, MatrixCommands, ThreeJsSystem, colorModeA, redF, greenF, blueF, alphaZeroToOne 
    // this one below also uses MatrixCommands, ThreeJsSystem, ColourFunctions at runtime
    liveCodeLabCoreInstance.LightSystem = createLightSystem(liveCodeLabCoreInstance.GraphicsCommands, liveCodeLabCoreInstance); 
    liveCodeLabCoreInstance.DrawFunctionRunner = createDrawFunctionRunner(eventRouter, liveCodeLabCoreInstance); 
    liveCodeLabCoreInstance.CodeTransformer = createCodeTransformer(eventRouter, CoffeeScript, liveCodeLabCoreInstance); // autocoder 
    // this one below also uses BlendControls at runtime
    liveCodeLabCoreInstance.Renderer = createRenderer(liveCodeLabCoreInstance); 
    // this one below also uses TimeKeeper, MatrixCommands, BlendControls, SoundSystem,
    //    BackgroundPainter, GraphicsCommands, LightSystem, DrawFunctionRunner,
    //    CodeTransformer, Renderer
    // ...at runtime
    liveCodeLabCoreInstance.AnimationLoop = createAnimationLoop(eventRouter, stats, liveCodeLabCoreInstance); 

    if (!canvasForBackground) {
      canvasForBackground = document.createElement('canvas'); 
    }
    liveCodeLabCoreInstance.canvasForBackground = canvasForBackground; //yes
    // the canvas background for the time being is only going to contain
    // gradients, so we can get away with creating a really tiny canvas and
    // stretch it. The advantage is that the fill operations are a lot faster.
    // We should try to use CSS instead of canvas, as in some browsers canvas
    // is not accelerated just as well as CSS.
    // backGroundFraction specifies what fraction of the window the background canvas
    // is going to be.
    var backGroundFraction = 1/15; 
    liveCodeLabCoreInstance.canvasForBackground.width = Math.floor(window.innerWidth * backGroundFraction); //yes
    liveCodeLabCoreInstance.canvasForBackground.height = Math.floor(window.innerHeight * backGroundFraction); //yes
    liveCodeLabCoreInstance.backgroundSceneContext = liveCodeLabCoreInstance.canvasForBackground.getContext('2d'); //yes


    liveCodeLabCoreInstance.paintARandomBackground = function(){
      liveCodeLabCoreInstance.BackgroundPainter.paintARandomBackground();
    };

    liveCodeLabCoreInstance.startAnimationLoop = function(){
     // there is nothing special about starting the animation loop,
     // it's just a call to animate(), which then creates its own request
     // for the next frame. Abstracting a bit though, it's clearer this way.
     liveCodeLabCoreInstance.AnimationLoop.animate();
    };
    
    liveCodeLabCoreInstance.runLastWorkingDrawFunction = function() {
      liveCodeLabCoreInstance.DrawFunctionRunner.reinstateLastWorkingDrawFunction();
    };

    liveCodeLabCoreInstance.loadAndTestAllTheSounds = function() {
      liveCodeLabCoreInstance.SoundSystem.loadAndTestAllTheSounds();
    };
    
    liveCodeLabCoreInstance.playStartupSound = function() {
      liveCodeLabCoreInstance.SoundSystem.playStartupSound();
    };
    
    liveCodeLabCoreInstance.isAudioSupported = function() {
      liveCodeLabCoreInstance.SoundSystem.isAudioSupported();
    };

    liveCodeLabCoreInstance.updateCode = function(updatedCode){
       //alert('updatedCode: ' + updatedCode);
       liveCodeLabCoreInstance.CodeTransformer.updateCode(updatedCode);
        if (updatedCode !== '' && liveCodeLabCoreInstance.dozingOff) {
					liveCodeLabCoreInstance.dozingOff = false;
					liveCodeLabCoreInstance.AnimationLoop.animate();
					//console.log('waking up');
					eventRouter.trigger('livecodelab-waking-up');
        }
    }

    return liveCodeLabCoreInstance;
};
