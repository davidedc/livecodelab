/*jslint browser: true, devel: true */
/*global $, editor */

var createBigCursor = function () {

    'use strict';

    var BigCursor = {};

    // Do we show the big cursor or not
    // If there's any text in the editor
    // then we shouldn't be showing it
    BigCursor.show = true;

    BigCursor.fakeCursorInterval = -1;

    document.onkeypress = function (e) {
        if (BigCursor.show && editor.getValue() !== "") {
            BigCursor.shrinkFakeText(e);
        }
    };

    BigCursor.shrinkFakeText = function (e) {
        var theEvent, key, currentCaption, shorterCaption;

        if (e !== undefined) {
            theEvent = e || window.event;
            key = theEvent.keyCode || theEvent.which;
            key = String.fromCharCode(key);
        } else {
            key = '';
        }

        currentCaption = $('#caption').html();
        shorterCaption = currentCaption.substring(0, currentCaption.length - 1);
        $('#caption').html(shorterCaption + key + "|");
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

    };

    BigCursor.fakeCursorBlinking = function () {
        $("#fakeStartingBlinkingCursor").animate({
            opacity: 0.2
        }, "fast", "swing").animate({
            opacity: 1
        }, "fast", "swing");
    };

    BigCursor.toggleBlink = function (active) {
        if (active) {
            BigCursor.fakeCursorInterval = setInterval(BigCursor.fakeCursorBlinking, 800);
        } else {
            clearTimeout(BigCursor.fakeCursorInterval);
        }
    };

    return BigCursor;

};
