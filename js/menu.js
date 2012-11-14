/*jslint devel: true */
/*global*/

$(document).ready(function() {

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
        toggleAutocodeAndUpdateButtonAndBlinking();
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

