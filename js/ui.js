/*jslint browser: true */
/*global $ */

var createUi = function (eventRouter, stats) {

    'use strict';

    var Ui = {},
        resizeCanvas,
        adjustCodeMirrorHeight;

    resizeCanvas = function (canvasId) {
        var canvas, scale;

        canvas = $(canvasId);

        scale = {
            x: 1,
            y: 1
        };

        scale.x = (window.innerWidth + 40) / canvas.width();
        scale.y = (window.innerHeight + 40) / canvas.height();

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

        canvas.css('-ms-transform-origin', 'left top')
              .css('-webkit-transform-origin', 'left top')
              .css('-moz-transform-origin', 'left top')
              .css('-o-transform-origin', 'left top')
              .css('transform-origin', 'left top')
              .css('-ms-transform', 'scale(' + scale + ')')
              .css('-webkit-transform', 'scale3d(' + scale + ', 1)')
              .css('-moz-transform', 'scale(' + scale + ')')
              .css('-o-transform', 'scale(' + scale + ')')
              .css('transform', 'scale(' + scale + ')');

        // TODO In theory we want to re-draw the background because the
        // aspect ration might have changed.
        // But for the time being we only have vertical
        // gradients so that's not going to be a problem.
    };

    Ui.adjustCodeMirrorHeight = function () {
        $('.CodeMirror-scroll').css('height', window.innerHeight - $('#theMenu').height());
    };


    // resizing the text area is necessary otherwise
    // as the user types to the end of it, instead of just scrolling
    // the content leaving all the other parts of the page where
    // they are, it expands and it pushes down
    // the view of the page, meaning that the canvas goes up and
    // the menu disappears
    // so we have to resize it at launch and also every time the window
    // is resized.

    Ui.fullscreenify = function (canvasId) {
        window.addEventListener('resize', function () {
            Ui.adjustCodeMirrorHeight();
            resizeCanvas(canvasId);
        }, false);

        resizeCanvas(canvasId);
    };



    Ui.checkErrorAndReport = function (e) {

        $('#dangerSignText').css('color', 'red');

        // if the object is an exception then get the message
        // otherwise e should just be a string
        var errorMessage = e.message || e;

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

    Ui.clearError = function () {
        $('#dangerSignText').css('color', '#000000');
        $('#errorMessageText').text("");
    };

    Ui.soundSystemOk = function () {
        $("#soundSystemStatus").text("Sound System On").removeClass('off').addClass('on');
    };



    Ui.setup = function () {

        $(document).ready(function () {

            $('#aboutMenu').click(function () {

                $('#aboutWindow').modal();
                $('#simplemodal-container').height(250);

                return false;
            });

            $('#demos li a').click(function () {
                eventRouter.trigger('load-program', $(this).attr('id'));
                return false;
            });

            $('#tutorials li a').click(function () {
                eventRouter.trigger('load-program', $(this).attr('id'));
                return false;
            });

            $('#autocodeIndicatorContainer').click(function () {
                eventRouter.trigger('toggle-autocoder');
                return false;
            });

            $('#dimCodeButtonContainer').click(function () {
                eventRouter.trigger('editor-toggle-dim');
                return false;
            });

            $('#resetButtonContainer').click(function () {
                eventRouter.trigger('reset');
                $(this).stop().fadeOut(100).fadeIn(100);
                return false;
            });

            // Align bottom-left
            stats.getDomElement().style.position = 'absolute';
            stats.getDomElement().style.right = '0px';
            stats.getDomElement().style.top = '0px';
            document.body.appendChild(stats.getDomElement());

            $('#startingCourtainScreen').fadeOut();
            $("#formCode").css('opacity', 0);

            Ui.fullscreenify('#backGroundCanvas');

            Ui.adjustCodeMirrorHeight();

        });
    };


    // Setup Event Listeners
    eventRouter.bind('display-error', Ui.checkErrorAndReport, Ui);
    eventRouter.bind('clear-error', Ui.clearError, Ui);

    eventRouter.bind('autocoder-state', function (state) {
        if (state === true) {
            $("#autocodeIndicator").html("Autocode: on").css("background-color", '#FF0000');
        } else {
            $("#autocodeIndicator").html("Autocode: off").css("background-color", '');
        }
    });

    eventRouter.bind('autocoderbutton-flash', function () {
        $("#autocodeIndicator").fadeOut(100).fadeIn(100);
    });

    eventRouter.bind('editor-dimmer-state', function (state) {
        if (state === true) {
            $("#dimCodeIndicator").html("Hide Code: on");
        } else {
            $("#dimCodeIndicator").html("Hide Code: off");
        }
    });


    return Ui;
};
