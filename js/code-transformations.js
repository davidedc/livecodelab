/*jslint maxerr: 200, browser: true, regexp: true, bitwise: true */
/*global autocoder, createCodeChecker */


var createCodeTransformer = function (eventRouter, CoffeeCompiler) {

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
     * Stops ticked doOnce blocks from running
     *
     * doOnce statements which have a tick mark next to them
     * are not run. This is achieved by replacing the line with
     * the "doOnce" with "if false" or "//" depending on whether
     * the doOnce is a multiline or an inline one, like so:
     *      ✓doOnce ->
     *        background 255
     *        fill 255,0,0
     *      ✓doOnce -> ball
     * becomes:
     *      if false ->
     *        background 255
     *        fill 255,0,0
     *      //doOnce -> ball
     *
     * @param {string} code    the code to re-write
     *
     * @returns {string}
     */
    preprocessingFunctions.removeTickedDoOnce = function (code) {
        var newCode;
        newCode = code.replace(/^(\s)*✓[ ]*doOnce[ ]*\-\>[ ]*$/gm, "$1if false");
        newCode = newCode.replace(/\u2713/g, "//");
        return newCode;
    };

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


    CodeTransformer.updateCode = function (updatedCodeAsString) {

        var elaboratedSource, errResults;

        CodeTransformer.currentCodeString = updatedCodeAsString;
        
        if (CodeTransformer.currentCodeString === ''){
					programHasBasicError = false;
					eventRouter.trigger('clear-error');	
					LiveCodeLabCore.DrawFunctionRunner.consecutiveFramesWithoutRunTimeError = 0;
					var functionFromCompiledCode = new Function('');
					LiveCodeLabCore.DrawFunctionRunner.setDrawFunction(null);
					LiveCodeLabCore.DrawFunctionRunner.lastStableDrawFunction = null;
					return functionFromCompiledCode;
        }


        updatedCodeAsString = preprocessingFunctions.removeTickedDoOnce(updatedCodeAsString);

        /**
         * The CodeChecker will check for unbalanced brackets
         * and unfinished strings
         *
         * If any errors are found then we quit compilation here
         * and display an error message
         */

        errResults = CodeChecker.parse(updatedCodeAsString);

        if (errResults.err === true) {
            eventRouter.trigger('compile-time-error-thrown', errResults.message);
            return;
        }


        elaboratedSource = updatedCodeAsString;

        elaboratedSource = preprocessingFunctions.postfixNotation(elaboratedSource);

        elaboratedSource = preprocessingFunctions.fixTimesFunctions(elaboratedSource);

        elaboratedSource = preprocessingFunctions.addDoOnceTracing(elaboratedSource);


        elaboratedSource = elaboratedSource.replace(/^(\s*)([a-z]+[a-zA-Z0-9]*)[ ]*$/gm, "$1;$2()");

        // this takes care of when a token that it's supposed to be
        // a function is inlined with something else e.g.
        // doOnce frame = 0; box
        // 2 times -> box
        elaboratedSource = elaboratedSource.replace(/;\s*([a-z]+[a-zA-Z0-9]*)[ ]*([;\n]+)/g, ";$1()$2");
        // this takes care of when a token that it's supposed to be
        // a function is inlined like so:
        // 2 times -> box
        elaboratedSource = elaboratedSource.replace(/\->\s*([a-z]+[a-zA-Z0-9]*)[ ]*([;\n]+)/g, ";$1()$2");

        // draw() could just be called by mistake and it's likely
        // to be disastrous. User doesn't even have visibility of such method,
        // why should he/she call it?
        // TODO: call draw() something else that the user is not
        // likely to use by mistake and take away this check.
        if (elaboratedSource.match(/[\s\+\;]+draw\s*\(/) || false) {
            programHasBasicError = true;
            eventRouter.trigger('compile-time-error-thrown', "You can't call draw()");
            return;
        }


        // we don't want if and for to undergo the same tratment as, say, box
        // so put those back to normal.
        elaboratedSource = elaboratedSource.replace(/;(if)\(\)/g, ";$1");
        elaboratedSource = elaboratedSource.replace(/;(else)\(\)/g, ";$1");
        elaboratedSource = elaboratedSource.replace(/;(for)\(\)/g, ";$1");

        elaboratedSource = elaboratedSource.replace(/\/\//g, "#");
        // Why do we have to match a non-digit non-letter?
        // because we have to make sure that the keyword is "on its own"
        // otherwise for example we interfere the replacements of "background" and "round"
        // Checking whether the keyword is "on its own" avoid those interferences.
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(scale)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(rotate)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(move)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(rect)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(line)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(bpm)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(play)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(pushMatrix)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(popMatrix)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(resetMatrix)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(fill)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(noFill)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(stroke)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(noStroke)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(strokeSize)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(animationStyle)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(simpleGradient)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(background)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(color)(\s)+/g, "$1;$2$3");
        //elaboratedSource =  elaboratedSource.replace(/([^a-zA-Z0-9])(ambient)(\s)+/g, "$1;$2$3" );
        //elaboratedSource =  elaboratedSource.replace(/([^a-zA-Z0-9])(reflect)(\s)+/g, "$1;$2$3" );
        //elaboratedSource =  elaboratedSource.replace(/([^a-zA-Z0-9])(refract)(\s)+/g, "$1;$2$3" );
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(lights)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(noLights)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(ambientLight)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(pointLight)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(ball)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(ballDetail)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(peg)(\s)+/g, "$1;$2$3");

        // Calculation
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(abs)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(ceil)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(constrain)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(dist)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(exp)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(floor)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(lerp)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(log)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(mag)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(map)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(max)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(min)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(norm)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(pow)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(round)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(sq)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(sqrt)(\s)+/g, "$1;$2$3");
        // Trigonometry
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(acos)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(asin)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(atan)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(atan2)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(cos)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(degrees)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(radians)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(sin)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(tan)(\s)+/g, "$1;$2$3");
        // Random
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(random)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(randomSeed)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(noise)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(noiseDetail)(\s)+/g, "$1;$2$3");
        elaboratedSource = elaboratedSource.replace(/([^a-zA-Z0-9])(noiseSeed)(\s)+/g, "$1;$2$3");


        // you'd think that semicolons are OK anywhere before any command
        // but coffee-script doesn't like some particular configurations - fixing those:
        // the semicolon mangles the first line of the function definitions:
        elaboratedSource = elaboratedSource.replace(/->(\s+);/g, "->$1");
        // the semicolon mangles the first line of if statements
        elaboratedSource = elaboratedSource.replace(/(\sif\s*.*\s*);/g, "$1");
        // the semicolon mangles the first line of else if statements
        elaboratedSource = elaboratedSource.replace(/(\s);(else\s*if\s*.*\s*);/g, "$1$2");
        // the semicolon mangles the first line of else statements
        elaboratedSource = elaboratedSource.replace(/(\s);(else.*\s*);/g, "$1$2");

        try {
            compiledOutput = CodeTransformer.compiler.compile(elaboratedSource, {
                bare: "on"
            });
        } catch (e) {
            // coffescript compiler has caught a syntax error.
            // we are going to display the error and we WON'T register
            // the new code
            eventRouter.trigger('compile-time-error-thrown', e);
            return;
        }

        programHasBasicError = false;
        eventRouter.trigger('clear-error');

        // see here for the deepest examination ever of "eval"
        // http://perfectionkills.com/global-eval-what-are-the-options/
        // note that exceptions are caught by the window.onerror callback
        LiveCodeLabCore.DrawFunctionRunner.consecutiveFramesWithoutRunTimeError = 0;

        // You might want to change the frame count from the program
        // just like you can in Processing, but it turns out that when
        // you ASSIGN a value to the frame variable inside
        // the coffeescript code, the coffeescript to javascript translator
        // declares a *local* frame variable, so changes to the frame
        // count get lost from one frame to the next.
        // TODO: There must be a way to tell coffeescript to accept
        // some variables as global, for the time being let's put
        // the cheap hack in place i.e. remove any local declaration that the
        // coffeescript to javascript translator inserts.
        compiledOutput = compiledOutput.replace(/var frame/, ";");

        var functionFromCompiledCode = new Function(compiledOutput);
        LiveCodeLabCore.DrawFunctionRunner.setDrawFunction(functionFromCompiledCode);
        return functionFromCompiledCode;

    };

    CodeTransformer.addCheckMarksAndUpdateCodeAndNotifyChange = function (CodeTransformer, doOnceOccurrencesLineNumbers) {

        var elaboratedSource,
            elaboratedSourceByLine,
            iteratingOverSource,
            drawFunction;

        // if we are here, the following has happened: someone has added an element
        // to the doOnceOccurrencesLineNumbers array. This can only have happened
        // when a doOnce block is run, because we manipulate each doOnce block
        // so that in its first line the line number of the block is pushed into
        // the doOnceOccurrencesLineNumbers array.
        // So, the doOnceOccurrencesLineNumbers array contains all and only the lines
        // of each doOnce block that has been run. Which could be more than one, because
        // when we start the program we could have more than one doOnce that has
        // to run.

        elaboratedSource = CodeTransformer.currentCodeString;

        // we know the line number of each doOnce block that has been run
        // so we go there and add a tick next to each doOnce to indicate
        // that it has been run.
        elaboratedSourceByLine = elaboratedSource.split("\n");
        for (iteratingOverSource = 0; iteratingOverSource < doOnceOccurrencesLineNumbers.length; iteratingOverSource += 1) {
            elaboratedSourceByLine[doOnceOccurrencesLineNumbers[iteratingOverSource]] = elaboratedSourceByLine[doOnceOccurrencesLineNumbers[iteratingOverSource]].replace(/^(\s*)doOnce([ ]*\->[ ]*.*)$/gm, "$1\u2713doOnce$2");
        }
        elaboratedSource = elaboratedSourceByLine.join("\n");

        // puts the new code (where the doOnce that have been executed have
        // tickboxes put back) in the editor. Which will trigger a re-registration
        // of the new code.
        eventRouter.trigger('code-updated-by-livecodelab', elaboratedSource);

        // we want to avoid that another frame is run with the old
        // code, as this would mean that the
        // runOnce code is run more than once,
        // so we need to register the new code.
        // TODO: ideally we don't want to register the
        // new code by getting the code from codemirror again
        // because we don't know what that entails. We should
        // just pass the code we already have.
        // Also updateCode() may split the source code by line, so we can
        // avoid that since we've just split it, we could pass
        // the already split code.
        drawFunction = CodeTransformer.updateCode(elaboratedSource);
        return drawFunction;
    };

    return CodeTransformer;

};
