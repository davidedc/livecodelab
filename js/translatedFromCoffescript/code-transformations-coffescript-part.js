var addCoffescriptPartToCodeTransformer;

addCoffescriptPartToCodeTransformer = function(CodeTransformer, eventRouter, CoffeeCompiler, liveCodeLabCoreInstance) {
  CodeTransformer.updateCode = function(updatedCodeAsString) {
    var aposCount, characterBeingExamined, compiledOutput, curlyBrackCount, elaboratedSource, elaboratedSourceByLine, errResults, functionFromCompiledCode, iteratingOverSource, nextCharacterBeingExamined, programHasBasicError, quoteCount, reasonOfBasicError, roundBrackCount, squareBrackCount;
    elaboratedSource = void 0;
    errResults = void 0;
    characterBeingExamined = void 0;
    nextCharacterBeingExamined = void 0;
    aposCount = void 0;
    quoteCount = void 0;
    roundBrackCount = void 0;
    curlyBrackCount = void 0;
    squareBrackCount = void 0;
    elaboratedSourceByLine = void 0;
    iteratingOverSource = void 0;
    reasonOfBasicError = void 0;
    CodeTransformer.currentCodeString = updatedCodeAsString;
    if (CodeTransformer.currentCodeString === "") {
      liveCodeLabCoreInstance.GraphicsCommands.resetTheSpinThingy = true;
      programHasBasicError = false;
      eventRouter.trigger("clear-error");
      liveCodeLabCoreInstance.DrawFunctionRunner.consecutiveFramesWithoutRunTimeError = 0;
      functionFromCompiledCode = new Function("");
      liveCodeLabCoreInstance.DrawFunctionRunner.setDrawFunction(null);
      liveCodeLabCoreInstance.DrawFunctionRunner.lastStableDrawFunction = null;
      return functionFromCompiledCode;
    }
    updatedCodeAsString = CodeTransformer.removeTickedDoOnce(updatedCodeAsString);
    /*
      	The CodeChecker will check for unbalanced brackets
      	and unfinished strings
      	
      	If any errors are found then we quit compilation here
      	and display an error message
    */

    updatedCodeAsString = CodeTransformer.stripCommentsAndCheckBasicSyntax(updatedCodeAsString);
    if (updatedCodeAsString === null) {
      return;
    }
    elaboratedSource = updatedCodeAsString;
    updatedCodeAsString = updatedCodeAsString.replace(/(\d+)[ ]+bpm(\s)/g, "bpm $1$2");
    updatedCodeAsString = updatedCodeAsString.replace(/([a-zA-Z]+)[ ]+fill(\s)/g, "fill $1$2");
    updatedCodeAsString = updatedCodeAsString.replace(/([a-zA-Z]+)[ ]+stroke(\s)/g, "stroke $1$2");
    updatedCodeAsString = updatedCodeAsString.replace(/([a-zA-Z]+)[ ]+background(\s)/g, "background $1$2");
    updatedCodeAsString = updatedCodeAsString.replace(/(\d+)\s+times[ ]*\->/g, ";( $1 + 0).times ->");
    updatedCodeAsString = CodeTransformer.addTracingInstructionsToDoOnceBlocks(updatedCodeAsString);
    updatedCodeAsString = updatedCodeAsString.replace(/^(\s*)([a-z]+[a-zA-Z0-9]*)[ ]*$/gm, "$1;$2()");
    updatedCodeAsString = updatedCodeAsString.replace(/;\s*([a-z]+[a-zA-Z0-9]*)[ ]*([;\n]+)/g, ";$1()$2");
    updatedCodeAsString = updatedCodeAsString.replace(/\->\s*([a-z]+[a-zA-Z0-9]*)[ ]*([;\n]+)/g, ";$1()$2");
    if (updatedCodeAsString.match(/[\s\+\;]+draw\s*\(/) || false) {
      programHasBasicError = true;
      eventRouter.trigger("compile-time-error-thrown", "You can't call draw()");
      return;
    }
    updatedCodeAsString = updatedCodeAsString.replace(/;(if)\(\)/g, ";$1");
    updatedCodeAsString = updatedCodeAsString.replace(/;(else)\(\)/g, ";$1");
    updatedCodeAsString = updatedCodeAsString.replace(/;(for)\(\)/g, ";$1");
    updatedCodeAsString = updatedCodeAsString.replace(/\/\//g, "#");
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
    updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(lights)(\s)+/g, "$1;$2$3");
    updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(noLights)(\s)+/g, "$1;$2$3");
    updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(ambientLight)(\s)+/g, "$1;$2$3");
    updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(pointLight)(\s)+/g, "$1;$2$3");
    updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(ball)(\s)+/g, "$1;$2$3");
    updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(ballDetail)(\s)+/g, "$1;$2$3");
    updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(peg)(\s)+/g, "$1;$2$3");
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
    updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(acos)(\s)+/g, "$1;$2$3");
    updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(asin)(\s)+/g, "$1;$2$3");
    updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(atan)(\s)+/g, "$1;$2$3");
    updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(atan2)(\s)+/g, "$1;$2$3");
    updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(cos)(\s)+/g, "$1;$2$3");
    updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(degrees)(\s)+/g, "$1;$2$3");
    updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(radians)(\s)+/g, "$1;$2$3");
    updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(sin)(\s)+/g, "$1;$2$3");
    updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(tan)(\s)+/g, "$1;$2$3");
    updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(random)(\s)+/g, "$1;$2$3");
    updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(randomSeed)(\s)+/g, "$1;$2$3");
    updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(noise)(\s)+/g, "$1;$2$3");
    updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(noiseDetail)(\s)+/g, "$1;$2$3");
    updatedCodeAsString = updatedCodeAsString.replace(/([^a-zA-Z0-9])(noiseSeed)(\s)+/g, "$1;$2$3");
    updatedCodeAsString = updatedCodeAsString.replace(/->(\s+);/g, "->$1");
    updatedCodeAsString = updatedCodeAsString.replace(/(\sif\s*.*\s*);/g, "$1");
    updatedCodeAsString = updatedCodeAsString.replace(/(\s);(else\s*if\s*.*\s*);/g, "$1$2");
    updatedCodeAsString = updatedCodeAsString.replace(/(\s);(else.*\s*);/g, "$1$2");
    try {
      compiledOutput = CodeTransformer.compiler.compile(updatedCodeAsString, {
        bare: "on"
      });
    } catch (e) {
      eventRouter.trigger("compile-time-error-thrown", e);
      return;
    }
    programHasBasicError = false;
    eventRouter.trigger("clear-error");
    liveCodeLabCoreInstance.DrawFunctionRunner.consecutiveFramesWithoutRunTimeError = 0;
    compiledOutput = compiledOutput.replace(/var frame/, ";");
    functionFromCompiledCode = new Function(compiledOutput);
    liveCodeLabCoreInstance.DrawFunctionRunner.setDrawFunction(functionFromCompiledCode);
    return functionFromCompiledCode;
  };
  CodeTransformer.addCheckMarksAndUpdateCodeAndNotifyChange = function(CodeTransformer, doOnceOccurrencesLineNumbers) {
    var drawFunction, elaboratedSource, elaboratedSourceByLine, iteratingOverSource;
    elaboratedSource = void 0;
    elaboratedSourceByLine = void 0;
    iteratingOverSource = void 0;
    drawFunction = void 0;
    elaboratedSource = CodeTransformer.currentCodeString;
    elaboratedSourceByLine = elaboratedSource.split("\n");
    iteratingOverSource = 0;
    while (iteratingOverSource < doOnceOccurrencesLineNumbers.length) {
      elaboratedSourceByLine[doOnceOccurrencesLineNumbers[iteratingOverSource]] = elaboratedSourceByLine[doOnceOccurrencesLineNumbers[iteratingOverSource]].replace(/^(\s*)doOnce([ ]*\->[ ]*.*)$/gm, "$1✓doOnce$2");
      iteratingOverSource += 1;
    }
    elaboratedSource = elaboratedSourceByLine.join("\n");
    eventRouter.trigger("code-updated-by-livecodelab", elaboratedSource);
    drawFunction = CodeTransformer.updateCode(elaboratedSource);
    return drawFunction;
  };
  return CodeTransformer;
};
