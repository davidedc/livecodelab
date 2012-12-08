/*jslint devel: true */
/*global LiveCodeLab, $, autocoder, logger, BackgroundPainter, initThreeJs, buzz */

var isCanvasSupported = function () {
    var elem = document.createElement('canvas');
    return !!(elem.getContext && elem.getContext('2d'));
};

var startEnvironment = function () {

    'use strict';

    LiveCodeLab.events = createEventRouter();

    ColourNames = createColours(); // no global dependencies
    TimeKeeper = createTimeKeeper(); // no global dependencies
    MatrixCommands = createMatrixCommands(THREE, TimeKeeper);  // no global dependencies

    ThreeJs = createThreeJs(Detector, THREE, THREEx); // no global dependencies
    BlendControls = createBlendControls(ThreeJs);  // logger
    SoundSystem = createSoundSystem(buzz); // $, logger, createSoundDef
    BigCursor = createBigCursor(); // $
    BackgroundPainter = createBackgroundPainter(ThreeJs); // $, color, logger


    // There's a tricky cyclic dependency here between LightSystem and GraphicsCommands
    GraphicsCommands = createGraphicsCommands(); // THREE, logger, color, LightSystem, MatrixCommands, ThreeJs, colorModeA, redF, greenF, blueF, alphaZeroToOne
    LightSystem = createLightSystem(ThreeJs, THREE, MatrixCommands, GraphicsCommands); // logger, color




    CodeTransformer = createCodeTransformer(CoffeeScript, BigCursor, GraphicsCommands); // $, logger, autocoder, Ui

    AnimationController = createAnimationController(LiveCodeLab.events, CodeTransformer, ThreeJs, TimeKeeper, GraphicsCommands); // $, MatrixCommands, SoundSystem, LightSystem, autocoder, BlendControls, BackgroundPainter, Ui
    editor = createEditor(LiveCodeLab.events, CodeMirror, BigCursor); // EditorDimmer

    autocoder = createAutocoder(LiveCodeLab.events, editor, ColourNames); // $, editor, McLexer

    ProgramLoader = createProgramLoader(LiveCodeLab.events, editor, BigCursor, AnimationController, ThreeJs, GraphicsCommands); // $, Detector, BlendControls, EditorDimmer

    // EditorDimmer functions should probablly be rolled into the editor itself
    EditorDimmer = createEditorDimmer(editor, ProgramLoader, BigCursor); // $

    Ui = createUi(LiveCodeLab.events, autocoder, BackgroundPainter, editor, EditorDimmer); // $, Stats




    BackgroundPainter.pickRandomDefaultGradient();
    SoundSystem.loadAndTestAllTheSounds(Ui.soundSystemOk);

    logger("startEnvironment");
    if (ThreeJs) {
        AnimationController.animate(editor);
    }

    if (!Detector.webgl || ThreeJs.forceCanvasRenderer) {
        //$('#noWebGLMessage').modal()
        $('#noWebGLMessage').modal({
            onClose: SoundSystem.closeAndCheckAudio
        });
        $('#simplemodal-container').height(200);
    }

    Ui.fullscreenify('#backGroundCanvas');

    BackgroundPainter.resetGradientStack();
    BackgroundPainter.simpleGradientUpdateIfChanged();

    $('#startingCourtainScreen').fadeOut();
    $("#formCode").css('opacity', 0);

    editor.focus();
    Ui.adjustCodeMirrorHeight();

    // check if the url points to a particular demo,
    // in which case we load the demo directly.
    // otherwise we do as usual.
    if (window.location.hash.indexOf("bookmark") !== -1) {
        var demoToLoad = window.location.hash.substring("bookmark".length + 2);
        LiveCodeLab.events.trigger('load-program', demoToLoad);
    } else {
        var startingSound = new buzz.sound("./sound/audioFiles/start_bing", {
            formats: ["ogg", "mp3"]
        });

        setTimeout(function () {
            startingSound.play();
        }, 650);
    }
    BigCursor.toggleBlink(true);


    // Init of the dim code toggle.
    // set it to false, then immediatly toggle it to true with the managing function
    // that way we can easily invert the default: just change false to true -- julien
    EditorDimmer.dimCodeOn = false;
    EditorDimmer.toggleDimCode();

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
