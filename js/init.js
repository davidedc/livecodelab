/*jslint devel: true */
/*global $, autocoder, logger, BackgroundPainter, initThreeJs, buzz */

var startingSound;

var startEnvironment = function () {

    'use strict';

    BackgroundPainter.pickRandomDefaultGradient();

    logger("startEnvironment");
    if (!initThreeJs()) animate();

    if (!Detector.webgl || forceCanvasRenderer) {
        //$('#noWebGLMessage').modal()
        $('#noWebGLMessage').modal({
            onClose: closeAndCheckAudio
        });
        $('#simplemodal-container').height(200);
    }

    //alert('resizing canvas');
    var canvas = document.getElementById('backGroundCanvas');

    if (fullScreenifyBackground) {
        fullscreenify(canvas);
    }
    BackgroundPainter.resetGradientStack();
    BackgroundPainter.simpleGradientUpdateIfChanged();

    $('#startingCourtainScreen').fadeOut();
    $("#formCode").css('opacity', 0);

    editor = createEditor();

    editor.focus();
    adjustCodeMirrorHeight();

    //create autocoder here
    autocoder = createAutocoder(editor);

    // check if the url points to a particular demo,
    // in which case we load the demo directly.
    // otherwise we do as usual.
    if (window.location.hash.indexOf("bookmark") !== -1) {
        var demoToLoad = window.location.hash.substring("bookmark".length + 2);
        //setTimeout ( "loadDemoOrTutorial('"+demoToLoad+"');",500);
        loadDemoOrTutorial(demoToLoad);
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
    dimcodeOn = false;
    toggleDimCode();

}

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
