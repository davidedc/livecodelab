/*jslint browser: true, devel: true */
/*global $, color, logger, backgroundSceneContext, scaledBackgroundHeight, scaledBackgroundWidth */

var createBackgroundPainter = function () {

    'use strict';

    var gradStack = [],
        defaultGradientColor1 = orange,
        defaultGradientColor2 = red,
        defaultGradientColor3 = black,
        whichDefaultBackground,
        currentGradientStackValue = '',
        previousGradientStackValue = 0,
        BackgroundPainter = {};

    // This needs to be global so it can be run by the draw function
    BackgroundPainter.simpleGradient = function (a, b, c, d) {

        currentGradientStackValue = currentGradientStackValue + " " + a + "" + b + "" + c + "" + d + "null ";
        gradStack.push({
            gradStacka: a,
            gradStackb: b,
            gradStackc: c,
            gradStackd: d,
            solid: null
        });

    };

    // This needs to be global so it can be run by the draw function
    BackgroundPainter.background = function () {

        // [todo] should the screen be cleared when you invoke
        // the background command? (In processing it's not)

        var a = color(arguments[0], arguments[1], arguments[2], arguments[3]);
        //  logger("adding solid background to stack");
        //if (a===undefined) a = color(0);
        currentGradientStackValue = currentGradientStackValue + " null null null null " + a + " ";
        gradStack.push({
            gradStacka: undefined,
            gradStackb: undefined,
            gradStackc: undefined,
            gradStackd: undefined,
            solid: a
        });
    };

    BackgroundPainter.pickRandomDefaultGradient = function () {

        if (whichDefaultBackground === undefined) {
            whichDefaultBackground = Math.floor(Math.random() * 5);
        } else {
            whichDefaultBackground = (whichDefaultBackground + 1) % 5;
        }

        if (whichDefaultBackground === 0) {
            defaultGradientColor1 = orange;
            defaultGradientColor2 = red;
            defaultGradientColor3 = black;
            $("#fakeStartingBlinkingCursor").css('color', 'white');
        } else if (whichDefaultBackground === 1) {
            defaultGradientColor1 = white;
            defaultGradientColor2 = khaki;
            defaultGradientColor3 = peachpuff;
            $("#fakeStartingBlinkingCursor").css('color', 'LightPink');
        } else if (whichDefaultBackground === 2) {
            defaultGradientColor1 = lightsteelblue;
            defaultGradientColor2 = lightcyan;
            defaultGradientColor3 = paleturquoise;
            $("#fakeStartingBlinkingCursor").css('color', 'CadetBlue');
        } else if (whichDefaultBackground === 3) {
            defaultGradientColor1 = silver;
            defaultGradientColor2 = lightgrey;
            defaultGradientColor3 = gainsboro;
            $("#fakeStartingBlinkingCursor").css('color', 'white');
        } else if (whichDefaultBackground === 4) {
            defaultGradientColor1 = color(155, 255, 155);
            defaultGradientColor2 = color(155, 255, 155);
            defaultGradientColor3 = color(155, 255, 155);
            $("#fakeStartingBlinkingCursor").css('color', 'DarkOliveGreen');
        }
    };

    BackgroundPainter.resetGradientStack = function () {

        currentGradientStackValue = "";
        // we could be more efficient and
        // reuse the previous stack elements
        // but I don't think it matters here
        gradStack = [];

        BackgroundPainter.simpleGradient(defaultGradientColor1, defaultGradientColor2, defaultGradientColor3);
    };

    BackgroundPainter.simpleGradientUpdateIfChanged = function () {

        var diagonal, radgrad, scanningGradStack;
        if ((currentGradientStackValue !== previousGradientStackValue)) {

            previousGradientStackValue = currentGradientStackValue;
            logger('repainting background');
            diagonal = Math.sqrt(Math.pow(scaledBackgroundWidth / 2, 2) + Math.pow(scaledBackgroundHeight / 2, 2));

            for (scanningGradStack = 0; scanningGradStack < gradStack.length; scanningGradStack++) {

                if (gradStack[scanningGradStack].gradStacka !== undefined) {
                    radgrad = backgroundSceneContext.createLinearGradient(scaledBackgroundWidth / 2, 0, scaledBackgroundWidth / 2, scaledBackgroundHeight);
                    radgrad.addColorStop(0, color.toString(gradStack[scanningGradStack].gradStacka));
                    radgrad.addColorStop(0.5, color.toString(gradStack[scanningGradStack].gradStackb));
                    radgrad.addColorStop(1, color.toString(gradStack[scanningGradStack].gradStackc));

                    backgroundSceneContext.globalAlpha = 1.0;
                    backgroundSceneContext.fillStyle = radgrad;
                    backgroundSceneContext.fillRect(0, 0, scaledBackgroundWidth, scaledBackgroundHeight);
                } else {
                    logger("solid background: " + gradStack[scanningGradStack].solid);
                    backgroundSceneContext.globalAlpha = 1.0;
                    backgroundSceneContext.fillStyle = color.toString(gradStack[scanningGradStack].solid);
                    backgroundSceneContext.fillRect(0, 0, scaledBackgroundWidth, scaledBackgroundHeight);
                }
            }
        }

    };

    return BackgroundPainter;

};

var BackgroundPainter = createBackgroundPainter();

// This needs to be global so it can be run by the draw function
var simpleGradient = BackgroundPainter.simpleGradient;

// This needs to be global so it can be run by the draw function
var background = BackgroundPainter.background;
