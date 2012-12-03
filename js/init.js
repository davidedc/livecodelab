/*jslint devel: true */
/*global $, autocoder, logger, BackgroundPainter, initThreeJs, buzz */

var startingSound;


var isCanvasSupported = function () {
    var elem = document.createElement('canvas');
    return !!(elem.getContext && elem.getContext('2d'));
};

var startEnvironment = function () {

    'use strict';


    ThreeJs = createThreeJs(Detector, THREE, THREEx);
    BigCursor = createBigCursor();
    TimeKeeper = createTimeKeeper();

    GraphicsCommands = createGraphicsCommands();

    MatrixCommands = createMatrixCommands(THREE, TimeKeeper);

    BlendControls = createBlendControls(ThreeJs);
    LightSystem = createLightSystem(ThreeJs, THREE, MatrixCommands, GraphicsCommands);

    BackgroundPainter = createBackgroundPainter(ThreeJs);

    BackgroundPainter.pickRandomDefaultGradient();

    CodeTransformer = createCodeTransformer(CoffeeScript, BigCursor, GraphicsCommands);
    editor = createEditor(CodeMirror, CodeTransformer, EditorDimmer);

    autocoder = createAutocoder(editor);

    LiveCodeLab = createLiveCodeLab(CodeTransformer, ThreeJs, TimeKeeper, GraphicsCommands);

    ProgramLoader = createProgramLoader(editor, BigCursor, LiveCodeLab, ThreeJs, GraphicsCommands);

    EditorDimmer = createEditorDimmer(editor, ProgramLoader, BigCursor);

    Ui = createUi();


    logger("startEnvironment");
    if (ThreeJs) {
        LiveCodeLab.animate();
    }

    if (!Detector.webgl || ThreeJs.forceCanvasRenderer) {
        //$('#noWebGLMessage').modal()
        $('#noWebGLMessage').modal({
            onClose: closeAndCheckAudio
        });
        $('#simplemodal-container').height(200);
    }

    //alert('resizing canvas');
    var canvas = document.getElementById('backGroundCanvas');

    Ui.fullscreenify(canvas);

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
        ProgramLoader.loadDemoOrTutorial(demoToLoad);
    } else {
        startingSound = new buzz.sound("./sound/audioFiles/start_bing", {
            formats: ["ogg", "mp3"]
        });

        setTimeout("startingSound.play();", 650);
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
    logger("document ready");
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

    // pass startEnvironment function in to be used as a callback
    // once the sounds are loaded it's fire and starts the app up
    loadAndTestAllTheSounds(startEnvironment);

});
