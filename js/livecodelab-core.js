// a LiveCodeLabCore instance packs together the following parts:
//
// - THREE
// - MatrixCommands
// - SoundSystem
// - BackgroundPainter
// - LightSystem 
// - CodeTransformer
// - Renderer
// - AnimationLoop
//
// LiveCodeLab is built one part at a time, and the arguments in the constructor
// tell how they depend on each other at construction time and how they
// interact at runtime.
//
// - _A constructor with no arguments_ (or where the arguments are just passed
//   by the caller of the very createLiveCodeLabCore function we are in),
//   with any of the other pieces at run time.
//   such as createColourFunctions, is a part
//   that does not need any other part at construction time and it doesn't interact
//   with any of the other parts at run time.
// - _A constructor with arguments other than "liveCodeLabCoreInstance"_
//   (such as ThreeJsSystem) only needs the parts passed at construction time for its
//   own construction, and it can only interact with such parts at runtime.
// - _A constructor which contains the "liveCodeLabCoreInstance" argument_, such as
//   CodeTransformer, might or might not need other parts for its own construction
//   (if they are passed as arguments in addition to the "liveCodeLabCoreInstance" argument)
//   but it does interact at runtime with other parts not passed in the constructor
//   argument.
//
// So, for determining the order of the constructors, one can just look at the
// dependencies dictated by the arguments other than the "liveCodeLabCoreInstance"
// argument. The "liveCodeLabCoreInstance" parameter
// doesn't create dependencies at creation time,
// it's just used by the parts to reference other parts that they need to interact to
// at runtime.
//
// It might well be that at runtime part A interacts with part B and viceversa.
// This is why runtime interactions are not restricted to parts passed
// as arguments at construction
// time, because one would need to pass constructed part A to the constructor of part B
// and viceversa, which is obviously impossible. This is why the runtime interactions
// happen through the mother of all parts, i.e. "liveCodeLabCoreInstance" itself.
//
// To determine which parts any single part interacts with at runtime, one
// has to check all the parameters passed to the constructor. The passed parts are likely
// to mean that there is an interaction at runtime. If the "mother"
// "liveCodeLabCoreInstance" is passed to the constructor, then one case to look for
// all "liveCodeLabCoreInstance" occurrences and see which of its children are
// accessed.

var createLiveCodeLabCore = function (blendedThreeJsSceneCanvas, canvasForBackground, forceCanvasRenderer, eventRouter, stats ) {

    'use strict';

    var liveCodeLabCoreInstance = {};

    ////////////////////////////////////////////////
    //
    // ### Phase 1
    // initialise all the fields first
    //
    ////////////////////////////////////////////////

      canvasForBackground = document.createElement('canvas'); 
    var backGroundFraction = 1/15; 

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

    ////////////////////////////////////////////////
    //
    // ### Phase 2
    // initialise all the parts that don't
    // have any dependencies for construction
    // note that the "liveCodeLabCoreInstance" doesn't
    // count because it's only used for interactions at
    // runtime. Same for the arguments that come
    // directly from the caller of this createLiveCodeLabCore
    // function we are in.
    //
    ////////////////////////////////////////////////

    liveCodeLabCoreInstance.TimeKeeper = createTimeKeeper();

    // this one also interacts with ThreeJsSystem at runtime
    liveCodeLabCoreInstance.BlendControls = createBlendControls(liveCodeLabCoreInstance); 

    liveCodeLabCoreInstance.ColourFunctions = createColourFunctions(); 

    // this one also interacts with ThreeJsSystem and BlendControls at runtime
    liveCodeLabCoreInstance.Renderer = createRenderer(liveCodeLabCoreInstance); 

    liveCodeLabCoreInstance.SoundSystem = createSoundSystem(eventRouter, buzz, createBowser(), createSampleBank(buzz)); // $ 

    // this one also interacts with ColourFunctions, backgroundSceneContext,
    // canvasForBackground at runtime
    liveCodeLabCoreInstance.BackgroundPainter = createBackgroundPainter(eventRouter, liveCodeLabCoreInstance); // $ 

    // this one also interacts with CodeTransformer at runtime.
    liveCodeLabCoreInstance.DrawFunctionRunner = createDrawFunctionRunner(eventRouter, liveCodeLabCoreInstance); 

    // this one also interacts with GraphicsCommands, DrawFunctionRunner at runtime.
    liveCodeLabCoreInstance.CodeTransformer = createCodeTransformer(eventRouter, CoffeeScript, liveCodeLabCoreInstance); // autocoder 

    // this one also interacts with TimeKeeper, MatrixCommands, BlendControls,
    //    SoundSystem,
    //    BackgroundPainter, GraphicsCommands, LightSystem, DrawFunctionRunner,
    //    CodeTransformer, Renderer
    // ...at runtime
    liveCodeLabCoreInstance.AnimationLoop = createAnimationLoop(eventRouter, stats, liveCodeLabCoreInstance); 

    ////////////////////////////////////////////////
    //
    // ### Phase 3
    // initialise all the parts that do
    // have dependencies with other parts
    // for their construction.
    // Note again that the "liveCodeLabCoreInstance" doesn't
    // count because it's only used for interactions at
    // runtime.
    // If the other dependencies forms a cycle, something
    // is wrong.
    //
    ////////////////////////////////////////////////

    // this one doesn't interact with any other part at runtime.
    liveCodeLabCoreInstance.ThreeJsSystem = createThreeJsSystem(Detector, THREEx, blendedThreeJsSceneCanvas, forceCanvasRenderer, liveCodeLabCoreInstance.THREE);

    // this one interacts with TimeKeeper at runtime
    liveCodeLabCoreInstance.MatrixCommands = createMatrixCommands(liveCodeLabCoreInstance.THREE, liveCodeLabCoreInstance);

    // this one also interacts with ColourFunctions, LightSystem, MatrixCommands
    // ThreeJsSystem at runtime
    liveCodeLabCoreInstance.GraphicsCommands = createGraphicsCommands(liveCodeLabCoreInstance.THREE, liveCodeLabCoreInstance); // color, LightSystem, MatrixCommands, ThreeJsSystem, colorModeA, redF, greenF, blueF, alphaZeroToOne 

    // this one also interacts with THREE,
    // ThreeJsSystem, ColourFunctions at runtime
    liveCodeLabCoreInstance.LightSystem = createLightSystem(liveCodeLabCoreInstance.GraphicsCommands, liveCodeLabCoreInstance); 

    ////////////////////////////////////////////////
    //
    // ### Phase 4
    // Grouped together here all the
    // methods. Most of the time they just delegate
    // to another part.
    //
    ////////////////////////////////////////////////

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
       /* alert('updatedCode: ' + updatedCode); */
       liveCodeLabCoreInstance.CodeTransformer.updateCode(updatedCode);
        if (updatedCode !== '' && liveCodeLabCoreInstance.dozingOff) {
					liveCodeLabCoreInstance.dozingOff = false;
					liveCodeLabCoreInstance.AnimationLoop.animate();
					/* console.log('waking up'); */
					eventRouter.trigger('livecodelab-waking-up');
        }
    }

    return liveCodeLabCoreInstance;
};
