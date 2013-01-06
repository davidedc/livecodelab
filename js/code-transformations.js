/*jslint maxerr: 200, browser: true, regexp: true, bitwise: true */
/*global autocoder, createCodeChecker */


var createCodeTransformer = function (eventRouter, CoffeeCompiler, liveCodeLabCoreInstance) {

    'use strict';

    var CodeTransformer = {},
        programHasBasicError = false,
        compiledOutput,
        listOfPossibleFunctions,
        preprocessingFunctions = {},
        CodeChecker = createCodeChecker();


    CodeTransformer.compiler = CoffeeCompiler;

    listOfPossibleFunctions = [
        "function",
        "alert",
        // Geometry
        "rect",
        "line",
        "box",
        "ball",
        "ballDetail",
        "peg",
        // Matrix manipulation
        "rotate",
        "move",
        "scale",
        "pushMatrix",
        "popMatrix",
        "resetMatrix",
        // Sound
        "bpm",
        "play",
        // Color and drawing styles
        "fill",
        "noFill",
        "stroke",
        "noStroke",
        "strokeSize",
        "animationStyle",
        "background",
        "simpleGradient",
        "color",
        // Lighting
        /*"ambient","reflect", "refract", */
        "lights",
        "noLights",
        "ambientLight",
        "pointLight",
        // Calculations
        "abs",
        "ceil",
        "constrain",
        "dist",
        "exp",
        "floor",
        "lerp",
        "log",
        "mag",
        "map",
        "max",
        "min",
        "norm",
        "pow",
        "round",
        "sq",
        "sqrt",
        // Trigonometry
        "acos",
        "asin",
        "atan",
        "atan2",
        "cos",
        "degrees",
        "radians",
        "sin",
        "tan",
        // Random
        "random",
        "randomSeed",
        "noise",
        "noiseDetail",
        "noiseSeed",
        // do once
        "addDoOnce",
        ""];









    return CodeTransformer;

};
