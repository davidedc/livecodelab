/*jslint browser: true, devel: true */
/*global $ */

var createBigCursor = function (eventRouter) {

    'use strict';

    var BigCursor = {},
        startBigCursorBlinkingAnimation,
        fakeCursorInterval,
        shrinkBigCursor,
        unshrinkBigCursor;

    // Do we show the big cursor or not
    // If there's any text in the editor
    // then we shouldn't be showing it
    BigCursor.isShowing = true;

    startBigCursorBlinkingAnimation = function () {
        $("#fakeStartingBlinkingCursor").animate({
            opacity: 0.2
        }, "fast", "swing").animate({
            opacity: 1
        }, "fast", "swing");
    };

    BigCursor.toggleBlink = function (active) {
        if (active) {
        		//avoid setting the animation twice, which causes
        		// the cursor to start blinking twice as fast.
        		if (!fakeCursorInterval){
            	fakeCursorInterval = setInterval(startBigCursorBlinkingAnimation, 800);
            }
        } else {
            clearTimeout(fakeCursorInterval);
            fakeCursorInterval = null;
        }
    };

    shrinkBigCursor = function () {
        var currentCaption, shorterCaption;
        if (BigCursor.isShowing) {
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
            BigCursor.isShowing = false;
            BigCursor.toggleBlink(false);
        }
    };

    unshrinkBigCursor = function () {
        if (!BigCursor.isShowing) {
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
            BigCursor.isShowing = true;
            BigCursor.toggleBlink(true);
        }
    };


    // Setup Event Listeners
    eventRouter.bind('big-cursor-show', function () {
        unshrinkBigCursor();
    });

    eventRouter.bind('big-cursor-hide', function () {
        shrinkBigCursor();
    });



    return BigCursor;

};
