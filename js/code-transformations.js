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

    var doesProgramContainStringsOrComments = function (updatedCodeAsString) {
            // make a copy of the string because we are going to
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

    CodeTransformer.stripCommentsAndCheckBasicSyntax = function (updatedCodeAsString) { // was a standalone function
			var codeWithoutComments, codeWithoutStringsOrComments;
			
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

					codeWithoutComments = updatedCodeAsString;
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


					return null;
			}

			// no comments or strings were found, just return the same string
			// that was passed
			return updatedCodeAsString

    }

    CodeTransformer.addTracingInstructionsToDoOnceBlocks = function (updatedCodeAsString) { // was a standalone function
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




    return CodeTransformer;

};
