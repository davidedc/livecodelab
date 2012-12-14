/*jslint maxerr: 200, browser: true, devel: true, bitwise: true */


var createDrawFunctionRunner = function () {

    'use strict';

    var DrawFunctionRunner = {};

    DrawFunctionRunner.drawFunction = "";
    DrawFunctionRunner.consecutiveFramesWithoutRunTimeError = 0;
    DrawFunctionRunner.lastStableProgram = "";

    DrawFunctionRunner.setDrawFunction = function (drawFunc) {
        if (drawFunc) {
        	DrawFunctionRunner.drawFunction = drawFunc;
        }
    };

    DrawFunctionRunner.reinstateLastWorkingProgram = function () {
            // mark the program as flawed and register the previous stable one.
            DrawFunctionRunner.consecutiveFramesWithoutRunTimeError = 0;
            DrawFunctionRunner.drawFunction = DrawFunctionRunner.lastStableProgram;
    }



    return DrawFunctionRunner;

};
