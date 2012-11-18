/*jslint browser: true, devel: true */
/*global $, autocoder, pickRandomDefaultGradient, toggleAutocodeAndUpdateButtonAndBlinking, editor, loadDemoOrTutorial, toggleDimCode */

var triggerReset = function () {

    'use strict';

    pickRandomDefaultGradient();
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

    console.log("hello");
    console.log(e);

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
