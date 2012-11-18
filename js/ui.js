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
