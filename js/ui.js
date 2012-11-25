/*jslint browser: true, devel: true */
/*global $, autocoder, pickRandomDefaultGradient, toggleAutocodeAndUpdateButtonAndBlinking, editor, loadDemoOrTutorial, toggleDimCode */


var isCanvasSupported = function () {
    'use strict';
    var elem = document.createElement('canvas');
    return !!(elem.getContext && elem.getContext('2d'));
};

var triggerReset = function () {

    'use strict';

    BackgroundPainter.pickRandomDefaultGradient();
    if (autocoder.active) {
        toggleAutocodeAndUpdateButtonAndBlinking();
    }
    editor.setValue('');
    $("#resetButtonContainer").css("background-color", '#FF0000');
    setTimeout(function () {
        $("#resetButtonContainer").css("background-color", "");
    }, 200);
};

var checkErrorAndReport = function (e) {

    'use strict';

    $('#dangerSignText').css('color', 'red');

    // don't need to convert entire object to string
    // can just get the message, or a blank string if there is no message
    var errorMessage = e.message || "";

    if (errorMessage.indexOf("Unexpected 'INDENT'") > -1) {
        errorMessage = "weird indentation";
    } else if (errorMessage.indexOf("Unexpected 'TERMINATOR'") > -1) {
        errorMessage = "line not complete";
    } else if (errorMessage.indexOf("Unexpected 'CALL_END'") > -1) {
        errorMessage = "line not complete";
    } else if (errorMessage.indexOf("Unexpected '}'") > -1) {
        errorMessage = "something wrong";
    } else if (errorMessage.indexOf("Unexpected 'MATH'") > -1) {
        errorMessage = "weird arithmetic there";
    } else if (errorMessage.indexOf("Unexpected 'LOGIC'") > -1) {
        errorMessage = "odd expression thingy";
    } else if (errorMessage.indexOf("Unexpected 'NUMBER'") > -1) {
        errorMessage = "lost number?";
    } else if (errorMessage.indexOf("Unexpected 'NUMBER'") > -1) {
        errorMessage = "lost number?";
    } else if (errorMessage.indexOf("ReferenceError") > -1) {
        errorMessage = errorMessage.replace(/ReferenceError:\s/gm, "");
    }

    $('#errorMessageText').text(errorMessage);

};


// resizing the text area is necessary otherwise
// as the user types to the end of it, instead of just scrolling
// the content leaving all the other parts of the page where
// they are, it expands and it pushes down
// the view of the page, meaning that the canvas goes up and
// the menu disappears
// so we have to resize it at launch and also every time the window
// is resized.

var adjustCodeMirrorHeight = function () {

    'use strict';

    $('.CodeMirror-scroll').css('height', window.innerHeight - $('#theMenu').height());
};


var resizeCanvas = function (canvas, style) {

    'use strict';

    var scale = {
        x: 1,
        y: 1
    };
    scale.x = (window.innerWidth + 40) / canvas.width;
    scale.y = (window.innerHeight + 40) / canvas.height;

    scale = scale.x + ', ' + scale.y;

    // this code below is if one wants to keep the aspect ratio
    // but I mean one doesn't necessarily resize the window
    // keeping the same aspect ratio.

    // if (scale.x < 1 || scale.y < 1) {
    //     scale = '1, 1';
    // } else if (scale.x < scale.y) {
    //     scale = scale.x + ', ' + scale.x;
    // } else {
    //     scale = scale.y + ', ' + scale.y;
    // }

    canvas.setAttribute('style', style + ' ' + '-ms-transform-origin: left top; -webkit-transform-origin: left top; -moz-transform-origin: left top; -o-transform-origin: left top; transform-origin: left top; -ms-transform: scale(' + scale + '); -webkit-transform: scale3d(' + scale + ', 1); -moz-transform: scale(' + scale + '); -o-transform: scale(' + scale + '); transform: scale(' + scale + ');');

    // TODO In theory we want to re-draw the background because the
    // aspect ration might have changed.
    // But for the time being we only have vertical
    // gradients so that's not going to be a problem.
};


var fullscreenify = function (canvas) {

    'use strict';

    var style = canvas.getAttribute('style') || '';
    window.addEventListener('resize', function () {
        adjustCodeMirrorHeight();
        resizeCanvas(canvas, style);
    }, false);

    resizeCanvas(canvas, style);
};

$(document).ready(function () {

    'use strict';

    $('#aboutMenu').click(function () {

        $('#aboutWindow').modal();
        $('#simplemodal-container').height(250);

        return false;
    });


    $('#demos li a').click(function () {
        loadDemoOrTutorial($(this).attr('id'));
        return false;
    });

    $('#tutorials li a').click(function () {
        loadDemoOrTutorial($(this).attr('id'));
        return false;
    });



    $('#autocodeIndicatorContainer').click(function () {
        autocoder.toggle();
        return false;
    });

    $('#dimCodeButtonContainer').click(function () {
        toggleDimCode();
        return false;
    });

    $('#resetButtonContainer').click(function () {
        triggerReset();
        return false;
    });


});
