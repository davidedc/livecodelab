/*jslint browser: true, maxerr: 100 */
/*global LiveCodeLabCore, $, autocoder, initThreeJs, buzz */

var isCanvasSupported = function () {
    var elem = document.createElement('canvas');
    return !!(elem.getContext && elem.getContext('2d'));
};

var startEnvironment = function (blendedThreeJsSceneCanvas, canvasForBackground, forceCanvasRenderer, bubbleUpErrorsForDebugging) {

    'use strict';

    
    /*
    createLiveCodeLabCore(
      eventRouter,
      forceCanvasRenderer,
      createTimeKeeper(),
      blendedThreeJsSceneCanvas,
      canvasForBackground,
    );
    */
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
    // needs THREE
    LiveCodeLabCore.ThreeJsSystem = createThreeJsSystem(Detector, THREEx, blendedThreeJsSceneCanvas, forceCanvasRenderer); //yes
    LiveCodeLabCore.MatrixCommands = createMatrixCommands(); // needs TimeKeeper and THREE
    LiveCodeLabCore.ColourNames = createColours(); //no
    // requires ThreeJsSystem
    LiveCodeLabCore.BlendControls = createBlendControls(); //yes
    LiveCodeLabCore.SoundSystem = createSoundSystem(buzz, createBowser(), createSampleBank(buzz)); // $ //yes
    LiveCodeLabCore.ColourFunctions = createColourFunctions(); //yes
    // requires ColourFunctions
    LiveCodeLabCore.BackgroundPainter = createBackgroundPainter(eventRouter); // $ //yes
    // requires ThreeJsSystem, ColourFunctions, LightSystem, THREE
    LiveCodeLabCore.GraphicsCommands = createGraphicsCommands(); // THREE, color, LightSystem, MatrixCommands, ThreeJsSystem, colorModeA, redF, greenF, blueF, alphaZeroToOne //yes
    // requires MatrixCommands, ThreeJsSystem, ColourFunctions, GraphicsCommands
    // needs THREE
    LiveCodeLabCore.LightSystem = createLightSystem(); //yes
    LiveCodeLabCore.DrawFunctionRunner = createDrawFunctionRunner(); //yes

    var eventRouter = createEventRouter();
    
    ///////////////////////////
    // Setup Event Listeners
    ///////////////////////////
    eventRouter.bind('reset', LiveCodeLabCore.BackgroundPainter.pickRandomDefaultGradient);

    //no
    if (forceCanvasRenderer === undefined) {
    	forceCanvasRenderer = false;
    }
    if (forceCanvasRenderer === null) {
    	forceCanvasRenderer = false;
    }

    UrlRouter = createUrlRouter(eventRouter); //no

    //document.getElementById('container').appendChild(LiveCodeLabCore.ThreeJsSystem.blendedThreeJsSceneCanvas); //no
    
    if (!canvasForBackground) {
      canvasForBackground = document.createElement('canvas'); //no
    }
    LiveCodeLabCore.canvasForBackground = canvasForBackground; //yes
    // the canvas background for the time being is only going to contain
    // gradients, so we can get away with creating a really tiny canvas and
    // stretch it. The advantage is that the fill operations are a lot faster.
    // We should try to use CSS instead of canvas, as in some browsers canvas
    // is not accelerated just as well as CSS.
    // backGroundFraction specifies what fraction of the window the background canvas
    // is going to be.
    var backGroundFraction = 1/15; //no
    LiveCodeLabCore.canvasForBackground.width = Math.floor(window.innerWidth * backGroundFraction); //yes
    LiveCodeLabCore.canvasForBackground.height = Math.floor(window.innerHeight * backGroundFraction); //yes
    LiveCodeLabCore.backgroundSceneContext = LiveCodeLabCore.canvasForBackground.getContext('2d'); //yes



    BigCursor = createBigCursor(eventRouter); // $ //no


    




    editor = createEditor(eventRouter, CodeMirror); //no

    // requires DrawFunctionRunner
    CodeTransformer = createCodeTransformer(eventRouter, CoffeeScript); // autocoder //yes

    // requires BlendControls
    Renderer = createRenderer(); //yes

    // Used by Three.js
    // add Stats.js - https://github.com/mrdoob/stats.js
    var stats = new Stats();
    //console.log('creating stats');
    Ui = createUi(eventRouter, stats); // $ //no
    Ui.hideStatsWidget();

    // requires: TimeKeeper, MatrixCommands, BlendControls, SoundSystem, BackgroundPainter, GraphicsCommands, LightSystem, DrawFunctionRunner
    AnimationLoop = createAnimationLoop(eventRouter, CodeTransformer, Renderer, stats); //yes

    // requires: ColourNames
    autocoder = createAutocoder(eventRouter, editor); // McLexer //no

    // EditorDimmer functions should probablly be rolled into the editor itself
    EditorDimmer = createEditorDimmer(eventRouter, BigCursor); // $ //no

    // requires ThreeJsSystem, BlendControls, GraphicsCommands
    ProgramLoader = createProgramLoader(eventRouter, editor, AnimationLoop, Renderer); // $, Detector, BlendControls //no

    
    LiveCodeLabCore.updateCode = function(updatedCode){
       //alert('updatedCode: ' + updatedCode);
       CodeTransformer.updateCode(updatedCode);
        if ((updatedCode !== '') && LiveCodeLabCore.DrawFunctionRunner.dozingOff) {
					LiveCodeLabCore.DrawFunctionRunner.dozingOff = false;
					AnimationLoop.animate();
					Ui.showStatsWidget();
					//console.log('waking up');
        }
    }
    eventRouter.bind('code_changed',
        function(updatedCodeAsString) {
					if (updatedCodeAsString !== '') {
							eventRouter.trigger('big-cursor-hide');
					}
					else {
							LiveCodeLabCore.GraphicsCommands.resetTheSpinThingy = true;
	
							eventRouter.trigger('set-url-hash', '');
	
							eventRouter.trigger('big-cursor-show');
							Ui.hideStatsWidget();
					}
					LiveCodeLabCore.updateCode(updatedCodeAsString);
        }
    );

    ///////////////////////////////////////////////////////
    // runtime and compile-time error management
    ///////////////////////////////////////////////////////
    // Two different types of errors are managed in
    // two slightly different ways.
    //
    // Compile-time errors are the errors such as an extra
    // comma being added, or an unbalanced parenthesis, or
    // in general any of the syntactic problems.
    // These errors are just reported and the
    // new borked program does *not* result in a new
    // draw Function, so the previous syntactically correct
    // program is kept as the draw Function. The editor
    // content is kept the same as the user is probably just
    // finishing to type something.
    // If the autocoder is active, the editor
    // undoes the change, which triggers in a recompilation.
    // So this undo/recompilation cycle results in eventually
    // a syntactically correct program being set as
    // the draw Function.
    //
    // Runtime errors are things such as calling a function
    // with invalid parameters, accessing a non-existing
    // field of an object, accessing a null or an undefined,
    // accessing a variable that is not defined anywhere.
    // Runtime errors cannot be caught at compile time (not in
    // general anyways) because they are syntactically correct
    // and doing analysis on runtime behaviour at compile time
    // is extremely difficult if not outright impossible.
    // For example one might want to try to figure out whether
    // all the called functions and all the referenced variables
    // actually exist. In practice though one might create
    // those variables at runtime depending on complex tests
    // on state of the system, so one cannot really figure out
    // at compile time whether all functions and variables will
    // actually be in place when the program runs. One could
    // carry out some clever checks in particular cases, but *in
    // general* it's an impossible thing to do.
    // So an "unstable" program might often pass the compile checks
    // and be turned into a new draw Function.
    // When the next frame runs (or at some point in one of the
    // next frames), the draw Function is run and
    // a runtime error is thrown. At this point what we just
    // want to do is to keep the editor contents the same (because
    // user might be just finishing to type something) and we
    // just swap the current draw Function with a previous draw
    // Function that seemed to be stable, so that the animation
    // in the background doesn't stop. Note again that there is no
    // guarantee that just because a function was stable in the
    // past that it might still be stable now. For example the old
    // stable function might do silly things in the new state
    // that has been changed/borked in the meantime.
    // Or just simply a stable Function might
    // eventually do some silly things on its own, for example
    // it might do an out-of bounds array reference as the frame
    // count is incremented. Since at the moment we keep
    // track of only one stable function at the time (rather than
    // a stack of the) in general one cannot guarantee
    // that the animation will keep going no matter what. It probably
    // will in most normal cases though.
    // When the autocoder is active, a runtime error *does not* swap
    // the current function for an old stable one. Doing so
    // causes some bad interactions with the undoing of the
    // editor. Rather, the editor "undoes" its content,
    // which causes old content to be recompiled, and this
    // undo/recompile cycle carries on until a
    // syntactically-correct version of the program can be
    // established as the draw Function. If this new version still
    // throws a runtime error, the editor "undoes" again, until a
    // program that is both syntactically correct and stable
    // is found.
    eventRouter.bind('runtime-error-thrown',
      function(e) {
				eventRouter.trigger('report-runtime-or-compile-time-error',e);
				if (autocoder.active) {
						//alert('editor: ' + editor);
						editor.undo();
						//alert('undoing');
				}
				else {
						 LiveCodeLabCore.DrawFunctionRunner.reinstateLastWorkingDrawFunction();
				}
				// re-throw the error so that the top-level debuggers
				// (firebug, built-in, whathaveyous) can properly
				// catch the error and let the user inspect things.
				if (bubbleUpErrorsForDebugging) {
				  throw(e)
				}
      }
    );
    eventRouter.bind('compile-time-error-thrown',
      function(e) {
				eventRouter.trigger('report-runtime-or-compile-time-error',e);
				if (autocoder.active) {
						editor.undo();
				}
      }
    );

    eventRouter.bind('clear-error', Ui.clearError, Ui);


    LiveCodeLabCore.BackgroundPainter.pickRandomDefaultGradient(); //yes
    LiveCodeLabCore.SoundSystem.loadAndTestAllTheSounds(Ui.soundSystemOk); //yes


    if (LiveCodeLabCore.ThreeJsSystem) {
        AnimationLoop.animate(); //yes
    }

    //no
    if (!Detector.webgl || forceCanvasRenderer) {
        $('#noWebGLMessage').modal({
            onClose: LiveCodeLabCore.SoundSystem.closeAndCheckAudio
        });
        $('#simplemodal-container').height(200);
    }

    LiveCodeLabCore.BackgroundPainter.resetGradientStack(); //yes
    LiveCodeLabCore.BackgroundPainter.simpleGradientUpdateIfChanged(); //yes

    editor.focus(); //no

    // check if the url points to a particular demo,
    // in which case we load the demo directly.
    // otherwise we do as usual.
    //no
    if (!UrlRouter.checkUrl()) {
        setTimeout(LiveCodeLabCore.SoundSystem.playStartupSound, 650);
    }

    BigCursor.toggleBlink(true); //no

    // Turn dimming on by default
    eventRouter.trigger('editor-toggle-dim', true); //yes

    Ui.setup(); //no

};

$(document).ready(function () {


    if (!isCanvasSupported) {

        $('#noCanvasMessage').modal({
            onClose: function () {
                $('#loading').text('sorry :-(');
                $.modal.close();
            }
        });

        $('#simplemodal-container').height(200);
        return;
    }

    // arguments: (blendedThreeJsSceneCanvas, canvasForBackground, forceCanvasRenderer, bubbleUpErrorsForDebugging)
    startEnvironment(document.getElementById('blendedThreeJsSceneCanvas'), document.getElementById('backGroundCanvas'), false, false);

});
