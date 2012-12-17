var createLiveCodeLabCore = function (blendedThreeJsSceneCanvas, canvasForBackground, forceCanvasRenderer, eventRouter, stats ) {

    'use strict';

    var LiveCodeLabCore = {};

    LiveCodeLabCore.TimeKeeper = createTimeKeeper();
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
    LiveCodeLabCore.THREE = THREE;
    LiveCodeLabCore.ThreeJsSystem = createThreeJsSystem(Detector, THREEx, blendedThreeJsSceneCanvas, forceCanvasRenderer, LiveCodeLabCore.THREE);
    // this one below also uses TimeKeeper at runtime
    LiveCodeLabCore.MatrixCommands = createMatrixCommands(LiveCodeLabCore.THREE);
    // this one below also uses ThreeJsSystem at runtime
    LiveCodeLabCore.BlendControls = createBlendControls(); 
    LiveCodeLabCore.SoundSystem = createSoundSystem(eventRouter, buzz, createBowser(), createSampleBank(buzz)); // $ 
    LiveCodeLabCore.ColourFunctions = createColourFunctions(); 
    // this one below also uses ColourFunctions at runtime
    LiveCodeLabCore.BackgroundPainter = createBackgroundPainter(eventRouter); // $ 
    // this one below also uses ColourFunctions, LightSystem at runtime
    LiveCodeLabCore.GraphicsCommands = createGraphicsCommands(LiveCodeLabCore.THREE); // color, LightSystem, MatrixCommands, ThreeJsSystem, colorModeA, redF, greenF, blueF, alphaZeroToOne 
    // this one below also uses MatrixCommands, ThreeJsSystem, ColourFunctions at runtime
    LiveCodeLabCore.LightSystem = createLightSystem(LiveCodeLabCore.GraphicsCommands); 
    LiveCodeLabCore.DrawFunctionRunner = createDrawFunctionRunner(eventRouter); 
    LiveCodeLabCore.CodeTransformer = createCodeTransformer(eventRouter, CoffeeScript); // autocoder 
    // this one below also uses BlendControls at runtime
    LiveCodeLabCore.Renderer = createRenderer(); 
    // this one below also uses TimeKeeper, MatrixCommands, BlendControls, SoundSystem,
    //    BackgroundPainter, GraphicsCommands, LightSystem, DrawFunctionRunner,
    //    CodeTransformer, Renderer
    // ...at runtime
    LiveCodeLabCore.AnimationLoop = createAnimationLoop(eventRouter, stats); 

    if (!canvasForBackground) {
      canvasForBackground = document.createElement('canvas'); 
    }
    LiveCodeLabCore.canvasForBackground = canvasForBackground; //yes
    // the canvas background for the time being is only going to contain
    // gradients, so we can get away with creating a really tiny canvas and
    // stretch it. The advantage is that the fill operations are a lot faster.
    // We should try to use CSS instead of canvas, as in some browsers canvas
    // is not accelerated just as well as CSS.
    // backGroundFraction specifies what fraction of the window the background canvas
    // is going to be.
    var backGroundFraction = 1/15; 
    LiveCodeLabCore.canvasForBackground.width = Math.floor(window.innerWidth * backGroundFraction); //yes
    LiveCodeLabCore.canvasForBackground.height = Math.floor(window.innerHeight * backGroundFraction); //yes
    LiveCodeLabCore.backgroundSceneContext = LiveCodeLabCore.canvasForBackground.getContext('2d'); //yes


    LiveCodeLabCore.paintARandomBackground = function(){
      LiveCodeLabCore.BackgroundPainter.paintARandomBackground();
    };

    LiveCodeLabCore.startAnimationLoop = function(){
     // there is nothing special about starting the animation loop,
     // it's just a call to animate(), which then creates its own request
     // for the next frame. Abstracting a bit though, it's clearer this way.
     LiveCodeLabCore.AnimationLoop.animate();
    };
    
    LiveCodeLabCore.runLastWorkingDrawFunction = function() {
      LiveCodeLabCore.DrawFunctionRunner.reinstateLastWorkingDrawFunction();
    };

    LiveCodeLabCore.loadAndTestAllTheSounds = function() {
      LiveCodeLabCore.SoundSystem.loadAndTestAllTheSounds();
    };
    
    LiveCodeLabCore.playStartupSound = function() {
      LiveCodeLabCore.SoundSystem.playStartupSound();
    };
    
    LiveCodeLabCore.isAudioSupported = function() {
      LiveCodeLabCore.SoundSystem.isAudioSupported();
    };

    LiveCodeLabCore.updateCode = function(updatedCode){
       //alert('updatedCode: ' + updatedCode);
       LiveCodeLabCore.CodeTransformer.updateCode(updatedCode);
        if (updatedCode !== '' && LiveCodeLabCore.dozingOff) {
					LiveCodeLabCore.dozingOff = false;
					LiveCodeLabCore.AnimationLoop.animate();
					//console.log('waking up');
					eventRouter.trigger('livecodelab-waking-up');
        }
    }

    return LiveCodeLabCore;
};
