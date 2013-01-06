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

    var doesProgramContainStringsOrComments = function (updatedCodeAsString) {
            // keep a copy of the string because we are going to
            // slice it in the process.
            var copyOfUpdatedCodeAsString = updatedCodeAsString;
            var characterBeingExamined, nextCharacterBeingExamined;
            while (copyOfUpdatedCodeAsString.length) {
                characterBeingExamined = copyOfUpdatedCodeAsString.charAt(0);
                nextCharacterBeingExamined = copyOfUpdatedCodeAsString.charAt(1);
                if (characterBeingExamined === "'" || characterBeingExamined === '"' || (characterBeingExamined === "/" &&
                        (nextCharacterBeingExamined === "*" || nextCharacterBeingExamined === "/"))
                        ) {
                    return true;
                }
                copyOfUpdatedCodeAsString = copyOfUpdatedCodeAsString.slice(1);
            }
    }

    var basicSyntaxChecksFail = function (updatedCodeAsString) {
			var codeWithoutStringsOrComments;
			
			// check whether the program potentially
			// contains strings or comments
			// if it doesn't then we can do some
			// simple syntactic checks that are likely
			// to be much faster than attempting a
			// coffescript to javascript translation


			// let's do a quick check:
			// these groups of characters should be in even number:
			// ", ', (), {}, []
			// Note that this doesn't check nesting, so for example
			// [{]} does pass the test.
			if (doesProgramContainStringsOrComments(updatedCodeAsString)) {
					// OK the program contains comments and/or strings
					// so this is what we are going to do:
					// first we remove all the comments for good
					// then we create a version without the strings
					// so we can perform some basic syntax checking.
					// Note that when we remove the comments we also need to
					// take into account strings because otherwise we mangle a line like
					// print "frame/100 //"
					// where we need to now that that single comment is actually the content
					// of a string.
					// modified from Processing.js (search for: "masks strings and regexs")
					// this is useful to remove all comments but keeping all the strings
					// the difference is that here I don't treat regular expressions.
					// Note that string take precedence over comments i.e.
					// is a string, not half a string with a quote in a comment
					// get rid of the comments for good.
					updatedCodeAsString = updatedCodeAsString.replace(/("(?:[^"\\\n]|\\.)*")|('(?:[^'\\\n]|\\.)*')|(\/\/[^\n]*\n)|(\/\*(?:(?!\*\/)(?:.|\n))*\*\/)/g,
					
					  function (all, quoted, aposed, singleComment, comment) {
							var numberOfLinesInMultilineComment,
									rebuiltNewLines,
									cycleToRebuildNewLines;
							// strings are kept as they are
							if (quoted) {
									return quoted;
							}
							if (aposed) {
									return aposed;
							}
							if (singleComment) {
									// preserve the line because
									// the doOnce mechanism needs to retrieve
									// the line where it was
									return "\n";
							}
							// eliminate multiline comments preserving the lines
							numberOfLinesInMultilineComment = comment.split("\n").length - 1;
							rebuiltNewLines = '';
							for (cycleToRebuildNewLines = 0; cycleToRebuildNewLines < numberOfLinesInMultilineComment; cycleToRebuildNewLines += 1) {
									rebuiltNewLines = rebuiltNewLines + "\n";
							}
							return rebuiltNewLines;
					});

					// ok now in the version we use for syntax checking we delete all the strings
					codeWithoutStringsOrComments = updatedCodeAsString.replace(/("(?:[^"\\\n]|\\.)*")|('(?:[^'\\\n]|\\.)*')/g, "");

			} else {
					codeWithoutStringsOrComments = updatedCodeAsString;
			}

			var aposCount = 0;
			var quoteCount = 0;
			var roundBrackCount = 0;
			var curlyBrackCount = 0;
			var squareBrackCount = 0;
			var characterBeingExamined;
			var reasonOfBasicError;

			while (codeWithoutStringsOrComments.length) {
					characterBeingExamined = codeWithoutStringsOrComments.charAt(0);

					if (characterBeingExamined === "'") {
							aposCount += 1;
					} else if (characterBeingExamined === '"') {
							quoteCount += 1;
					} else if (characterBeingExamined === '(' || characterBeingExamined === ')') {
							roundBrackCount += 1;
					} else if (characterBeingExamined === '{' || characterBeingExamined === '}') {
							curlyBrackCount += 1;
					} else if (characterBeingExamined === '[' || characterBeingExamined === ']') {
							squareBrackCount += 1;
					}
					codeWithoutStringsOrComments = codeWithoutStringsOrComments.slice(1);
			}

			// according to jsperf, the fastest way to check if number is even/odd
			if (aposCount & 1 || quoteCount & 1 || roundBrackCount & 1 || curlyBrackCount & 1 || squareBrackCount & 1) {

					programHasBasicError = true;

					if (aposCount & 1) {
							reasonOfBasicError = "Missing '";
					}
					if (quoteCount & 1) {
							reasonOfBasicError = 'Missing "';
					}
					if (roundBrackCount & 1) {
							reasonOfBasicError = "Unbalanced ()";
					}
					if (curlyBrackCount & 1) {
							reasonOfBasicError = "Unbalanced {}";
					}
					if (squareBrackCount & 1) {
							reasonOfBasicError = "Unbalanced []";
					}

					eventRouter.trigger('compile-time-error-thrown', reasonOfBasicError);


					return true;
			}

    }

    var addTracingInstructionsToDoOnceBlocks = function (updatedCodeAsString) {
            // ADDING TRACING INSTRUCTION TO THE DOONCE BLOCKS
            // each doOnce block is made to start with an instruction that traces whether
            // the block has been run or not. This allows us to put back the tick where
            // necessary, so the doOnce block is not run again.
            // Example - let's say one pastes in this code:
            //      doOnce ->
            //        background 255
            //        fill 255,0,0
            //
            //      doOnce -> ball
            //
            // it becomes:
            //      (1+0).times ->
            //        addDoOnce(1); background 255
            //        fill 255,0,0
            //
            //      ;addDoOnce(4);
            //      (1+0).times -> ball
            //    
            // So: if there is at least one doOnce
            //   split the source in lines
            //   add line numbers tracing instructions so we can track which ones have been run
            //   regroup the lines into a single string again
            //
            var elaboratedSourceByLine, iteratingOverSource;
            if (updatedCodeAsString.indexOf('doOnce') > -1) {
                //alert("a doOnce is potentially executable");
                elaboratedSourceByLine = updatedCodeAsString.split("\n");
                //alert('splitting: ' + elaboratedSourceByLine.length );
                for (iteratingOverSource = 0; iteratingOverSource < elaboratedSourceByLine.length; iteratingOverSource += 1) {
                    //alert('iterating: ' + iteratingOverSource );

                    // add the line number tracing instruction to inline case
                    elaboratedSourceByLine[iteratingOverSource] = elaboratedSourceByLine[iteratingOverSource].replace(/^(\s*)doOnce[ ]*\->[ ]*(.+)$/gm, "$1;addDoOnce(" + iteratingOverSource + "); (1+0).times -> $2");

                    // add the line number tracing instruction to multiline case
                    if (elaboratedSourceByLine[iteratingOverSource].match(/^(\s*)doOnce[ ]*\->[ ]*$/gm)) {
                        //alert('doOnce multiline!');
                        elaboratedSourceByLine[iteratingOverSource] = elaboratedSourceByLine[iteratingOverSource].replace(/^(\s*)doOnce[ ]*\->[ ]*$/gm, "$1(1+0).times ->");
                        elaboratedSourceByLine[iteratingOverSource + 1] = elaboratedSourceByLine[iteratingOverSource + 1].replace(/^(\s*)(.+)$/gm, "$1;addDoOnce(" + iteratingOverSource + "); $2");
                    }

                }
                updatedCodeAsString = elaboratedSourceByLine.join("\n");
                //alert('soon after replacing doOnces'+updatedCodeAsString);
            }
            return updatedCodeAsString;
    }

    CodeTransformer.updateCode = function (updatedCodeAsString) {

        var elaboratedSource,
        	errResults,
        	characterBeingExamined,
        	nextCharacterBeingExamined,
        	aposCount,
        	quoteCount,
        	roundBrackCount,
        	curlyBrackCount,
        	squareBrackCount,
        	elaboratedSourceByLine,
        	iteratingOverSource,
        	reasonOfBasicError;

        CodeTransformer.currentCodeString = updatedCodeAsString;
        
        if (CodeTransformer.currentCodeString === ''){
					liveCodeLabCoreInstance.GraphicsCommands.resetTheSpinThingy = true;
					programHasBasicError = false;
					eventRouter.trigger('clear-error');	
					liveCodeLabCoreInstance.DrawFunctionRunner.consecutiveFramesWithoutRunTimeError = 0;
					var functionFromCompiledCode = new Function('');
					liveCodeLabCoreInstance.DrawFunctionRunner.setDrawFunction(null);
					liveCodeLabCoreInstance.DrawFunctionRunner.lastStableDrawFunction = null;
					return functionFromCompiledCode;
        }


        updatedCodeAsString = preprocessingFunctions.removeTickedDoOnce(updatedCodeAsString);

//////////////////// Newer code checks
        /**
         * The CodeChecker will check for unbalanced brackets
         * and unfinished strings
         *
         * If any errors are found then we quit compilation here
         * and display an error message
         */

        /*
        errResults = CodeChecker.parse(updatedCodeAsString);

        if (errResults.err === true) {
            eventRouter.trigger('compile-time-error-thrown', errResults.message);
            return;
        }


        elaboratedSource = updatedCodeAsString;

        elaboratedSource = preprocessingFunctions.postfixNotation(elaboratedSource);

        elaboratedSource = preprocessingFunctions.fixTimesFunctions(elaboratedSource);

        elaboratedSource = preprocessingFunctions.addDoOnceTracing(elaboratedSource);
				*/
//////////////////////////////////////

////////////////// Older code checks
            
            // according to jsperf, this is the fastest way to count for
            // occurrences of a character. We count apostrophes

            if (basicSyntaxChecksFail(updatedCodeAsString)) return;

            elaboratedSource = updatedCodeAsString;

            // we make it so some common command forms can be used in postfix notation, e.g.
            //   60 bpm
            //   red fill
            //   yellow stroke
            //   black background
            updatedCodeAsString = updatedCodeAsString.replace(/(\d+)[ ]+bpm(\s)/g, "bpm $1$2");
            updatedCodeAsString = updatedCodeAsString.replace(/([a-zA-Z]+)[ ]+fill(\s)/g, "fill $1$2");
            updatedCodeAsString = updatedCodeAsString.replace(/([a-zA-Z]+)[ ]+stroke(\s)/g, "stroke $1$2");
            updatedCodeAsString = updatedCodeAsString.replace(/([a-zA-Z]+)[ ]+background(\s)/g, "background $1$2");

            // little trick. This is mangled up in the translation from coffeescript
            // (1).times ->
            // But this isn't:
            // (1+0).times ->
            // So here is the little replace.
            // TODO: you should be a little smarter about the substitution of the draw method
            // You can tell a method declaration because the line below is indented
            // so you should check that.

            //updatedCodeAsString =  updatedCodeAsString.replace(/^([a-z]+[a-zA-Z0-9]+)\s*$/gm, "$1 = ->" );
            // some replacements add a semicolon for the
            // following reason: coffeescript allows you to split arguments
            // over multiple lines.
            // So if you have:
            //   rotate 0,0,1
            //   box
            // and you want to add a scale like so:
            //   scale 2,2,2
            //   rotate 0,0,1
            //   box
            // What happens is that as you are in the middle of typing:
            //   scale 2,
            //   rotate 0,0,1
            //   box
            // coffeescript takes the rotate as the second argument of scale
            // causing mayhem.
            // Instead, all is good if rotate is prepended with a semicolon.

            updatedCodeAsString = updatedCodeAsString.replace(/(\d+)\s+times[ ]*\->/g, ";( $1 + 0).times ->");

            updatedCodeAsString = addTracingInstructionsToDoOnceBlocks(updatedCodeAsString);

        updatedCodeAsString = updatedCodeAsString.replace(/^(\s*)([a-z]+[a-zA-Z0-9]*)[ ]*$/gm, "$1;$2()");

        // this takes care of when a token that it's supposed to be
        // a function is inlined with something else e.g.
        // doOnce frame = 0; box
        // 2 times -> box
        updatedCodeAsString = updatedCodeAsString.replace(/;\s*([a-z]+[a-zA-Z0-9]*)[ ]*([;\n]+)/g, ";$1()$2");
        // this takes care of when a token that it's supposed to be
        // a function is inlined like so:
        // 2 times -> box
        updatedCodeAsString = updatedCodeAsString.replace(/\->\s*([a-z]+[a-zA-Z0-9]*)[ ]*([;\n]+)/g, ";$1()$2");

        // draw() could just be called by mistake and it's likely
        // to be disastrous. User doesn't even have visibility of such method,
        // why should he/she call it?
        // TODO: call draw() something else that the user is not
        // likely to use by mistake and take away this check.
        if (updatedCodeAsString.match(/[\s\+\;]+draw\s*\(/) || false) {
            programHasBasicError = true;
            eventRouter.trigger('compile-time-error-thrown', "You can't call draw()");
            return;
        }


        // we don't want if and for to undergo the same tratment as, say, box
        // so put those back to normal.
        updatedCodeAsString = updatedCodeAsString.replace(/;(if)\(\)/g, ";$1");
        updatedCodeAsString = updatedCodeAsString.replace(/;(else)\(\)/g, ";$1");
        updatedCodeAsString = updatedCodeAsString.replace(/;(for)\(\)/g, ";$1");

        updatedCodeAsString = updatedCodeAsString.replace(/\/\//g, "#");
        // Why do we have to match a non-digit non-letter?
        // because we have to make sure that the keyword is "on its own"
        // otherwise for example we interfere the replacements of "background" and "round"
        // Checking whether the keyword is "on its own" avoid those interferences.
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(scale)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(rotate)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(move)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(rect)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(line)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(bpm)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(play)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(pushMatrix)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(popMatrix)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(resetMatrix)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(fill)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(noFill)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(stroke)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(noStroke)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(strokeSize)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(animationStyle)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(simpleGradient)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(background)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(color)(\s)+/g, "$1;$2$3");
        //updatedCodeAsString =  updatedCodeAsString.replace(/([^a-zA-Z0-9])(ambient)(\s)+/g, "$1;$2$3" );
        //updatedCodeAsString =  updatedCodeAsString.replace(/([^a-zA-Z0-9])(reflect)(\s)+/g, "$1;$2$3" );
        //updatedCodeAsString =  updatedCodeAsString.replace(/([^a-zA-Z0-9])(refract)(\s)+/g, "$1;$2$3" );
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(lights)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(noLights)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(ambientLight)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(pointLight)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(ball)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(ballDetail)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(peg)(\s)+/g, "$1;$2$3");

        // Calculation
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(abs)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(ceil)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(constrain)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(dist)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(exp)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(floor)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(lerp)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(log)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(mag)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(map)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(max)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(min)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(norm)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(pow)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(round)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(sq)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(sqrt)(\s)+/g, "$1;$2$3");
        // Trigonometry
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(acos)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(asin)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(atan)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(atan2)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(cos)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(degrees)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(radians)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(sin)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(tan)(\s)+/g, "$1;$2$3");
        // Random
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(random)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(randomSeed)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(noise)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(noiseDetail)(\s)+/g, "$1;$2$3");
        updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(noiseSeed)(\s)+/g, "$1;$2$3");


        // you'd think that semicolons are OK anywhere before any command
        // but coffee-script doesn't like some particular configurations - fixing those:
        // the semicolon mangles the first line of the function definitions:
        updatedCodeAsString = updatedCodeAsString.replace(/->(\s+);/g, "->$1");
        // the semicolon mangles the first line of if statements
        updatedCodeAsString = updatedCodeAsString.replace(/(\sif\s*.*\s*);/g, "$1");
        // the semicolon mangles the first line of else if statements
        updatedCodeAsString = updatedCodeAsString.replace(/(\s);(else\s*if\s*.*\s*);/g, "$1$2");
        // the semicolon mangles the first line of else statements
        updatedCodeAsString = updatedCodeAsString.replace(/(\s);(else.*\s*);/g, "$1$2");

        try {
            compiledOutput = CodeTransformer.compiler.compile(updatedCodeAsString, {
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
        liveCodeLabCoreInstance.DrawFunctionRunner.consecutiveFramesWithoutRunTimeError = 0;

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
        liveCodeLabCoreInstance.DrawFunctionRunner.setDrawFunction(functionFromCompiledCode);
        return functionFromCompiledCode;

    };

    // this function is used externally after the code has been
    // run, so we need to attach it to the CodeTransformer object.
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
