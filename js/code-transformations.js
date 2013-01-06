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

    /**
     * The preprocessing functions are used to process the
     * code before it is sent through the coffee script
     * compiler
     *
     * Note
     * some replacements add a semicolon for the following reason:
     * coffeescript allows you to split arguments over multiple lines.
     * So if you have:
     *     rotate 0,0,1
     *     box
     * and you want to add a scale like so:
     *     scale 2,2,2
     *     rotate 0,0,1
     *     box
     * What happens is that as you are in the middle of typing:
     *     scale 2,
     *     rotate 0,0,1
     *     box
     * coffeescript takes the rotate as the second argument of scale
     * causing mayhem.
     * Instead, all is good if rotate is prepended with a semicolon.
     */


    /**
     * Some of the functions can be used with postfix notation
     *
     * e.g.
     *
     *      60 bpm
     *      red fill
     *      yellow stroke
     *      black background
     *
     * We need to switch this round before coffee script compilation
     */
    preprocessingFunctions.postfixNotation = function (code) {
        var elaboratedSource;
        elaboratedSource = code.replace(/(\d+)[ ]+bpm(\s)/g, "bpm $1$2");
        elaboratedSource = elaboratedSource.replace(/([a-zA-Z]+)[ ]+fill(\s)/g, "fill $1$2");
        elaboratedSource = elaboratedSource.replace(/([a-zA-Z]+)[ ]+stroke(\s)/g, "stroke $1$2");
        elaboratedSource = elaboratedSource.replace(/([a-zA-Z]+)[ ]+background(\s)/g, "background $1$2");
        return elaboratedSource;
    };

    /**
     * The times function is mangled by coffeescript
     *     (1).times ->
     * But this isn't:
     *     (1+0).times ->
     * So here is the little replace.
     *
     * TODO: you should be a little smarter about the substitution of the draw method
     * You can tell a method declaration because the line below is indented
     * so you should check that.
     *
     */
    preprocessingFunctions.fixTimesFunctions = function (code) {
        return code.replace(/(\d+)\s+times[ ]*\->/g, ";( $1 + 0).times ->");
    };

    /**
     * Each doOnce block is made to start with an instruction that traces whether
     * the block has been run or not. This allows us to put back the tick where
     * necessary, so the doOnce block is not run again.
     * Example - let's say one pastes in this code:
     *     doOnce ->
     *         background 255
     *         fill 255,0,0
     *
     *     doOnce -> ball
     *
     * it becomes:
     *     (1+0).times ->
     *         addDoOnce(1); background 255
     *         fill 255,0,0
     *
     *     ;addDoOnce(4);
     *     (1+0).times -> ball
     *    
     * So: if there is at least one doOnce
     *     split the source in lines
     *     add line numbers tracing instructions so we can track which ones have been run
     *     regroup the lines into a single string again
     *
     */
    preprocessingFunctions.addDoOnceTracing = function (source) {
        var sourceLines, i;
        if (source.indexOf('doOnce') > -1) {
            sourceLines = source.split("\n");
            for (i = 0; i < sourceLines.length; i += 1) {

                // add the line number tracing instruction to inline case
                sourceLines[i] = sourceLines[i].replace(/^(\s*)doOnce[ ]*\->[ ]*(.+)$/gm, "$1;addDoOnce(" + i + "); (1+0).times -> $2");

                // add the line number tracing instruction to multiline case
                if (sourceLines[i].match(/^(\s*)doOnce[ ]*\->[ ]*$/gm)) {
                    sourceLines[i] = sourceLines[i].replace(/^(\s*)doOnce[ ]*\->[ ]*$/gm, "$1(1+0).times ->");
                    sourceLines[i + 1] = sourceLines[i + 1].replace(/^(\s*)(.+)$/gm, "$1;addDoOnce(" + i + "); $2");
                }

            }
            source = sourceLines.join("\n");
        }
        return source;
    };









    return CodeTransformer;

};
