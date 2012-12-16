var createLiveCodeLabCore = function (blendedThreeJsSceneCanvas, forceCanvasRenderer, eventRouter, stats ) {

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
    LiveCodeLabCore.SoundSystem = createSoundSystem(buzz, createBowser(), createSampleBank(buzz)); // $ 
    LiveCodeLabCore.ColourFunctions = createColourFunctions(); 
    // this one below also uses ColourFunctions at runtime
    LiveCodeLabCore.BackgroundPainter = createBackgroundPainter(eventRouter); // $ 
    // this one below also uses ColourFunctions, LightSystem at runtime
    LiveCodeLabCore.GraphicsCommands = createGraphicsCommands(LiveCodeLabCore.THREE, LiveCodeLabCore.ThreeJsSystem); // color, LightSystem, MatrixCommands, ThreeJsSystem, colorModeA, redF, greenF, blueF, alphaZeroToOne 
    // this one below also uses MatrixCommands, ThreeJsSystem, ColourFunctions at runtime
    LiveCodeLabCore.LightSystem = createLightSystem(LiveCodeLabCore.THREE, LiveCodeLabCore.GraphicsCommands); 
    LiveCodeLabCore.DrawFunctionRunner = createDrawFunctionRunner(); 
    LiveCodeLabCore.CodeTransformer = createCodeTransformer(eventRouter, CoffeeScript); // autocoder 
    // this one below also uses BlendControls at runtime
    LiveCodeLabCore.Renderer = createRenderer(); 
    // this one below also uses TimeKeeper, MatrixCommands, BlendControls, SoundSystem,
    //    BackgroundPainter, GraphicsCommands, LightSystem, DrawFunctionRunner,
    //    CodeTransformer, Renderer
    // ...at runtime
    LiveCodeLabCore.AnimationLoop = createAnimationLoop(eventRouter, stats); 


    LiveCodeLabCore.paintARandomBackground = function(){
      LiveCodeLabCore.BackgroundPainter.paintARandomBackground();
    }

    return LiveCodeLabCore;
};
