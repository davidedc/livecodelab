/*jslint browser: true, maxerr: 100 */
/*global LiveCodeLab, $, autocoder, BackgroundPainter, initThreeJs, buzz */

var isCanvasSupported = function () {
    var elem = document.createElement('canvas');
    return !!(elem.getContext && elem.getContext('2d'));
};

var startEnvironment = function (canvasElementForThreeJS, canvasForBackground, forceCanvasRenderer) {

    'use strict';

    // Used by Three.js
    // add Stats.js - https://github.com/mrdoob/stats.js
    var stats = new Stats(); //no
    
    /*
    createLiveCodeLab(
      createEventRouter(),
      forceCanvasRenderer,
      createTimeKeeper(),
      canvasElementForThreeJS,
      canvasForBackground,
    );
    */


    var eventRouter = createEventRouter(); //yes
    //no
    if (forceCanvasRenderer === undefined) {
    	forceCanvasRenderer = false;
    }
    if (forceCanvasRenderer === null) {
    	forceCanvasRenderer = false;
    }

    UrlRouter = createUrlRouter(eventRouter); //no
    // TODO for some weird reason this actually cannot be moved further down
    ColourNames = createColours(); //no

    TimeKeeper = createTimeKeeper(); //yes
    MatrixCommands = createMatrixCommands(THREE, TimeKeeper); //yes

    ThreeJs = createThreeJs(Detector, THREE, THREEx, canvasElementForThreeJS, forceCanvasRenderer); //yes
    document.getElementById('container').appendChild(ThreeJs.sceneRenderingCanvas); //no
    
    if (!canvasForBackground) {
      canvasForBackground = document.createElement('canvas'); //no
    }
    LiveCodeLab.canvasForBackground = canvasForBackground; //yes
    // the canvas background for the time being is only going to contain
    // gradients, so we can get away with creating a really tiny canvas and
    // stretch it. The advantage is that the fill operations are a lot faster.
    // We should try to use CSS instead of canvas, as in some browsers canvas
    // is not accelerated just as well as CSS.
    // backGroundFraction specifies what fraction of the window the background canvas
    // is going to be.
    var backGroundFraction = 1/15; //no
    LiveCodeLab.canvasForBackground.width = Math.floor(window.innerWidth * backGroundFraction); //yes
    LiveCodeLab.canvasForBackground.height = Math.floor(window.innerHeight * backGroundFraction); //yes
    LiveCodeLab.backgroundSceneContext = LiveCodeLab.canvasForBackground.getContext('2d'); //yes



    BlendControls = createBlendControls(ThreeJs); //yes
    Bowser = createBowser(); //yes
    SampleBank = createSampleBank(buzz); //yes
    SoundSystem = createSoundSystem(buzz, Bowser, SampleBank); // $ //yes
    BigCursor = createBigCursor(eventRouter); // $ //no
    ColourFunctions = createColourFunctions(); //yes
    BackgroundPainter = createBackgroundPainter(eventRouter, ThreeJs, ColourFunctions); // $ //yes


    // There's a tricky cyclic dependency here between LightSystem and GraphicsCommands
    GraphicsCommands = createGraphicsCommands(ColourFunctions); // THREE, color, LightSystem, MatrixCommands, ThreeJs, colorModeA, redF, greenF, blueF, alphaZeroToOne //yes
    LightSystem = createLightSystem(ThreeJs, THREE, MatrixCommands, GraphicsCommands, ColourFunctions); //yes




    editor = createEditor(eventRouter, CodeMirror); //no

    DrawFunctionRunner = createDrawFunctionRunner(); //yes

    CodeTransformer = createCodeTransformer(DrawFunctionRunner, editor, eventRouter, CoffeeScript, GraphicsCommands); // autocoder //yes

    Renderer = createRenderer(ThreeJs, BlendControls); //yes

    AnimationLoop = createAnimationLoop(editor, DrawFunctionRunner, eventRouter, CodeTransformer, Renderer, TimeKeeper, GraphicsCommands, stats, MatrixCommands, SoundSystem, LightSystem, BlendControls, BackgroundPainter); //yes

    autocoder = createAutocoder(eventRouter, editor, ColourNames); // McLexer //no

    // EditorDimmer functions should probablly be rolled into the editor itself
    EditorDimmer = createEditorDimmer(eventRouter); // $ //no

    ProgramLoader = createProgramLoader(eventRouter, editor, AnimationLoop, ThreeJs, Renderer, GraphicsCommands); // $, Detector, BlendControls //no

    Ui = createUi(eventRouter, stats); // $ //no


    BackgroundPainter.pickRandomDefaultGradient(); //yes
    SoundSystem.loadAndTestAllTheSounds(Ui.soundSystemOk); //yes

    if (ThreeJs) {
        AnimationLoop.animate(editor); //yes
    }

    //no
    if (!Detector.webgl || forceCanvasRenderer) {
        $('#noWebGLMessage').modal({
            onClose: SoundSystem.closeAndCheckAudio
        });
        $('#simplemodal-container').height(200);
    }

    BackgroundPainter.resetGradientStack(); //yes
    BackgroundPainter.simpleGradientUpdateIfChanged(); //yes

    editor.focus(); //no

    // check if the url points to a particular demo,
    // in which case we load the demo directly.
    // otherwise we do as usual.
    //no
    if (!UrlRouter.checkUrl()) {
        setTimeout(SoundSystem.playStartupSound, 650);
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

    startEnvironment(null, document.getElementById('backGroundCanvas'), false);

});
