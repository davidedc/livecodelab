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

    DrawFunctionRunner.runDrawFunction = function () {
				 try {
				  DrawFunctionRunner.drawFunction();
				 } catch (e) {
						 // we caught a runtime error.
						 // This should only be because a referenced variable doesn't exist.
						 return e;
				 }

				DrawFunctionRunner.consecutiveFramesWithoutRunTimeError += 1;
				if (DrawFunctionRunner.consecutiveFramesWithoutRunTimeError === 5) {
						DrawFunctionRunner.lastStableProgram = DrawFunctionRunner.drawFunction;
				}

    };


    DrawFunctionRunner.reinstateLastWorkingProgram = function () {
            // mark the program as flawed and register the previous stable one.
            DrawFunctionRunner.consecutiveFramesWithoutRunTimeError = 0;
            DrawFunctionRunner.drawFunction = DrawFunctionRunner.lastStableProgram;
    }



    return DrawFunctionRunner;

};
