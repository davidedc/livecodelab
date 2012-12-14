/*jslint browser: true, maxerr: 100 */
/*global LiveCodeLab, $, autocoder, BackgroundPainter, initThreeJs, buzz */

var isCanvasSupported = function () {
    var elem = document.createElement('canvas');
    return !!(elem.getContext && elem.getContext('2d'));
};

var startEnvironment = function () {

    'use strict';

    // Used by Three.js
    // add Stats.js - https://github.com/mrdoob/stats.js
    var stats = new Stats();


    LiveCodeLab.events = createEventRouter();

    UrlRouter = createUrlRouter(LiveCodeLab.events);

    ColourNames = createColours();
    ColourFunctions = createColourFunctions();
    TimeKeeper = createTimeKeeper();
    MatrixCommands = createMatrixCommands(THREE, TimeKeeper);

    ThreeJs = createThreeJs(Detector, THREE, THREEx);
    BlendControls = createBlendControls(ThreeJs);
    Bowser = createBowser();
    SampleBank = createSampleBank(buzz);
    SoundSystem = createSoundSystem(buzz, Bowser, SampleBank); // $
    BigCursor = createBigCursor(LiveCodeLab.events); // $
    BackgroundPainter = createBackgroundPainter(LiveCodeLab.events, ThreeJs, ColourFunctions); // $


    // There's a tricky cyclic dependency here between LightSystem and GraphicsCommands
    GraphicsCommands = createGraphicsCommands(ColourFunctions); // THREE, color, LightSystem, MatrixCommands, ThreeJs, colorModeA, redF, greenF, blueF, alphaZeroToOne
    LightSystem = createLightSystem(ThreeJs, THREE, MatrixCommands, GraphicsCommands, ColourFunctions);




    CodeTransformer = createCodeTransformer(LiveCodeLab.events, CoffeeScript, GraphicsCommands); // autocoder

    AnimationLoop = createAnimationLoop(LiveCodeLab.events, CodeTransformer, ThreeJs, TimeKeeper, GraphicsCommands, stats, MatrixCommands, SoundSystem, LightSystem, BlendControls, BackgroundPainter);
    editor = createEditor(LiveCodeLab.events, CodeMirror);

    autocoder = createAutocoder(LiveCodeLab.events, editor, ColourNames); // McLexer

    // EditorDimmer functions should probablly be rolled into the editor itself
    EditorDimmer = createEditorDimmer(LiveCodeLab.events); // $

    ProgramLoader = createProgramLoader(LiveCodeLab.events, editor, AnimationLoop, ThreeJs, GraphicsCommands); // $, Detector, BlendControls

    Ui = createUi(LiveCodeLab.events, stats); // $


    BackgroundPainter.pickRandomDefaultGradient();
    SoundSystem.loadAndTestAllTheSounds(Ui.soundSystemOk);

    if (ThreeJs) {
        AnimationLoop.animate(editor);
    }

    if (!Detector.webgl || ThreeJs.forceCanvasRenderer) {
        $('#noWebGLMessage').modal({
            onClose: SoundSystem.closeAndCheckAudio
        });
        $('#simplemodal-container').height(200);
    }

    BackgroundPainter.resetGradientStack();
    BackgroundPainter.simpleGradientUpdateIfChanged();

    editor.focus();

    // check if the url points to a particular demo,
    // in which case we load the demo directly.
    // otherwise we do as usual.
    if (!UrlRouter.checkUrl()) {
        setTimeout(SoundSystem.playStartupSound, 650);
    }

    BigCursor.toggleBlink(true);

    // Turn dimming on by default
    LiveCodeLab.events.trigger('editor-toggle-dim', true);

    Ui.setup();

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

    startEnvironment();

});
