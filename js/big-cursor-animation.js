/*jslint browser: true, devel: true */
/*global $ */

var createBigCursor = function (events) {

    'use strict';

    var BigCursor = {},
        fakeCursorBlinking,
        fakeCursorInterval,
        shrinkFakeText,
        showFakeText;

    // Do we show the big cursor or not
    // If there's any text in the editor
    // then we shouldn't be showing it
    BigCursor.show = true;

    fakeCursorBlinking = function () {
        $("#fakeStartingBlinkingCursor").animate({
            opacity: 0.2
        }, "fast", "swing").animate({
            opacity: 1
        }, "fast", "swing");
    };

    BigCursor.toggleBlink = function (active) {
        if (active) {
            fakeCursorInterval = setInterval(fakeCursorBlinking, 800);
        } else {
            clearTimeout(fakeCursorInterval);
        }
    };

    shrinkFakeText = function () {
        var currentCaption, shorterCaption;
        if (BigCursor.show) {
            currentCaption = $('#caption').html();
            shorterCaption = currentCaption.substring(0, currentCaption.length - 1);
            $('#caption').html(shorterCaption + "|");
            $('#fakeStartingBlinkingCursor').html('');

            $("#toMove").animate({
                opacity: 0,
                margin: -100,
                fontSize: 300,
                left: 0
            }, "fast");

            setTimeout('$("#formCode").animate({opacity: 1}, "fast");', 120);
            setTimeout('$("#justForFakeCursor").hide();', 200);
            setTimeout('$("#toMove").hide();', 200);
            BigCursor.show = false;
            BigCursor.toggleBlink(false);
        }
    };

    showFakeText = function () {
        if (!BigCursor.show) {
            $("#formCode").animate({
                opacity: 0
            }, "fast");

            $("#justForFakeCursor").show();
            $("#toMove").show();
            $('#caption').html('|');


            $("#toMove").animate({
                opacity: 1,
                margin: 0,
                fontSize: 350,
                left: 0
            }, "fast", function () {
                $('#caption').html('');
                $('#fakeStartingBlinkingCursor').html('|');
            });
            BigCursor.show = true;
            BigCursor.toggleBlink(true);
        }
    };


    // Setup Event Listeners
    events.bind('cursor-show', function () {
        showFakeText();
    });

    events.bind('cursor-hide', function () {
        shrinkFakeText();
    });



    return BigCursor;

};
