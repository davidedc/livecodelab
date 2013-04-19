/*
## Although LiveCodeLab is ultimately running Javascript code behind the scenes,
## the user uses a simpler syntax which is basically coffeescript with a little bit of
## extra sugar. CodeTransformer takes care of translating this simplified syntax to
## Javascript. Also note that CodeTransformer might return a program that substituted
## the program passed as input. This is because doOnce statements get transformed by
## pre-prending a tick once they are run, which prevents them from being run again.
*/

var CodeTransformer;

CodeTransformer = (function() {
  CodeTransformer.prototype.currentCodeString = null;

  function CodeTransformer(eventRouter, CoffeeCompiler, liveCodeLabCoreInstance) {
    var listOfPossibleFunctions;

    this.eventRouter = eventRouter;
    this.CoffeeCompiler = CoffeeCompiler;
    this.liveCodeLabCoreInstance = liveCodeLabCoreInstance;
    listOfPossibleFunctions = ["function", "alert", "rect", "line", "box", "ball", "ballDetail", "peg", "rotate", "move", "scale", "pushMatrix", "popMatrix", "resetMatrix", "bpm", "play", "fill", "noFill", "stroke", "noStroke", "strokeSize", "animationStyle", "background", "simpleGradient", "colorMode", "color", "lights", "noLights", "ambientLight", "pointLight", "abs", "ceil", "constrain", "dist", "exp", "floor", "lerp", "log", "mag", "map", "max", "min", "norm", "pow", "round", "sq", "sqrt", "acos", "asin", "atan", "atan2", "cos", "degrees", "radians", "sin", "tan", "random", "randomSeed", "noise", "noiseDetail", "noiseSeed", "addDoOnce"];
  }

  /*
  ## Stops ticked doOnce blocks from running
  ## 
  ## doOnce statements which have a tick mark next to them
  ## are not run. This is achieved by replacing the line with
  ## the "doOnce" with "if false" or "//" depending on whether
  ## the doOnce is a multiline or an inline one, like so:
  ## 
  ##      ✓doOnce ->
  ##      background 255
  ##      fill 255,0,0
  ##      ✓doOnce -> ball
  ##      becomes:
  ##      if false ->
  ##      background 255
  ##      fill 255,0,0
  ##      //doOnce -> ball
  ## 
  ## @param {string} code    the code to re-write
  ## 
  ## @returns {string}
  */


  CodeTransformer.prototype.removeTickedDoOnce = function(code) {
    var newCode;

    newCode = void 0;
    newCode = code.replace(/^(\s)*✓[ ]*doOnce[ ]*\-\>[ ]*$/gm, "$1if false");
    newCode = newCode.replace(/\u2713/g, "//");
    return newCode;
  };

  CodeTransformer.prototype.addTracingInstructionsToDoOnceBlocks = function(code) {
    var elaboratedSourceByLine, iteratingOverSource, _i, _ref;

    elaboratedSourceByLine = void 0;
    iteratingOverSource = void 0;
    if (code.indexOf("doOnce") > -1) {
      elaboratedSourceByLine = code.split("\n");
      for (iteratingOverSource = _i = 0, _ref = elaboratedSourceByLine.length; 0 <= _ref ? _i < _ref : _i > _ref; iteratingOverSource = 0 <= _ref ? ++_i : --_i) {
        elaboratedSourceByLine[iteratingOverSource] = elaboratedSourceByLine[iteratingOverSource].replace(/^(\s*)doOnce[ ]*\->[ ]*(.+)$/g, "$1;addDoOnce(" + iteratingOverSource + "); (1+0).times -> $2");
        if (elaboratedSourceByLine[iteratingOverSource].match(/^(\s*)doOnce[ ]*\->[ ]*$/g)) {
          elaboratedSourceByLine[iteratingOverSource] = elaboratedSourceByLine[iteratingOverSource].replace(/^(\s*)doOnce[ ]*\->[ ]*$/g, "$1(1+0).times ->");
          elaboratedSourceByLine[iteratingOverSource + 1] = elaboratedSourceByLine[iteratingOverSource + 1].replace(/^(\s*)(.+)$/g, "$1;addDoOnce(" + iteratingOverSource + "); $2");
        }
      }
      code = elaboratedSourceByLine.join("\n");
    }
    return code;
  };

  CodeTransformer.prototype.doesProgramContainStringsOrComments = function(code) {
    var characterBeingExamined, copyOfcode, nextCharacterBeingExamined;

    copyOfcode = code;
    characterBeingExamined = void 0;
    nextCharacterBeingExamined = void 0;
    while (copyOfcode.length) {
      characterBeingExamined = copyOfcode.charAt(0);
      nextCharacterBeingExamined = copyOfcode.charAt(1);
      if (characterBeingExamined === "'" || characterBeingExamined === "\"" || (characterBeingExamined === "/" && (nextCharacterBeingExamined === "*" || nextCharacterBeingExamined === "/"))) {
        return true;
      }
      copyOfcode = copyOfcode.slice(1);
    }
  };

  CodeTransformer.prototype.stripCommentsAndCheckBasicSyntax = function(code) {
    var aposCount, characterBeingExamined, codeWithoutComments, codeWithoutStringsOrComments, curlyBrackCount, programHasBasicError, quoteCount, reasonOfBasicError, roundBrackCount, squareBrackCount;

    codeWithoutComments = void 0;
    codeWithoutStringsOrComments = void 0;
    if (this.doesProgramContainStringsOrComments(code)) {
      code = code.replace(/("(?:[^"\\\n]|\\.)*")|('(?:[^'\\\n]|\\.)*')|(\/\/[^\n]*\n)|(\/\*(?:(?!\*\/)(?:.|\n))*\*\/)/g, function(all, quoted, aposed, singleComment, comment) {
        var cycleToRebuildNewLines, numberOfLinesInMultilineComment, rebuiltNewLines, _i;

        numberOfLinesInMultilineComment = void 0;
        rebuiltNewLines = void 0;
        cycleToRebuildNewLines = void 0;
        if (quoted) {
          return quoted;
        }
        if (aposed) {
          return aposed;
        }
        if (singleComment) {
          return "\n";
        }
        numberOfLinesInMultilineComment = comment.split("\n").length - 1;
        rebuiltNewLines = "";
        for (cycleToRebuildNewLines = _i = 0; 0 <= numberOfLinesInMultilineComment ? _i < numberOfLinesInMultilineComment : _i > numberOfLinesInMultilineComment; cycleToRebuildNewLines = 0 <= numberOfLinesInMultilineComment ? ++_i : --_i) {
          rebuiltNewLines = rebuiltNewLines + "\n";
        }
        return rebuiltNewLines;
      });
      codeWithoutComments = code;
      codeWithoutStringsOrComments = code.replace(/("(?:[^"\\\n]|\\.)*")|('(?:[^'\\\n]|\\.)*')/g, "");
    } else {
      codeWithoutStringsOrComments = code;
    }
    aposCount = 0;
    quoteCount = 0;
    roundBrackCount = 0;
    curlyBrackCount = 0;
    squareBrackCount = 0;
    characterBeingExamined = void 0;
    reasonOfBasicError = void 0;
    while (codeWithoutStringsOrComments.length) {
      characterBeingExamined = codeWithoutStringsOrComments.charAt(0);
      if (characterBeingExamined === "'") {
        aposCount += 1;
      } else if (characterBeingExamined === "\"") {
        quoteCount += 1;
      } else if (characterBeingExamined === "(" || characterBeingExamined === ")") {
        roundBrackCount += 1;
      } else if (characterBeingExamined === "{" || characterBeingExamined === "}") {
        curlyBrackCount += 1;
      } else if (characterBeingExamined === "[" || characterBeingExamined === "]") {
        squareBrackCount += 1;
      }
      codeWithoutStringsOrComments = codeWithoutStringsOrComments.slice(1);
    }
    if (aposCount & 1 || quoteCount & 1 || roundBrackCount & 1 || curlyBrackCount & 1 || squareBrackCount & 1) {
      programHasBasicError = true;
      if (aposCount & 1) {
        reasonOfBasicError = "Missing '";
      }
      if (quoteCount & 1) {
        reasonOfBasicError = "Missing \"";
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
      this.eventRouter.trigger("compile-time-error-thrown", reasonOfBasicError);
      return null;
    }
    return code;
  };

  /*
  ## Some of the functions can be used with postfix notation
  ## 
  ## e.g.
  ## 
  ##      60 bpm
  ##      red fill
  ##      yellow stroke
  ##      black background
  ## 
  ## We need to switch this round before coffee script compilation
  */


  CodeTransformer.prototype.adjustPostfixNotations = function(code) {
    var elaboratedSource;

    elaboratedSource = void 0;
    elaboratedSource = code.replace(/(\d+)[ ]+bpm(\s)/g, "bpm $1$2");
    elaboratedSource = elaboratedSource.replace(/([a-zA-Z]+)[ ]+fill(\s)/g, "fill $1$2");
    elaboratedSource = elaboratedSource.replace(/([a-zA-Z]+)[ ]+stroke(\s)/g, "stroke $1$2");
    elaboratedSource = elaboratedSource.replace(/([a-zA-Z]+)[ ]+background(\s)/g, "background $1$2");
    return elaboratedSource;
  };

  CodeTransformer.prototype.updateCode = function(code) {
    var aposCount, characterBeingExamined, compiledOutput, curlyBrackCount, e, elaboratedSource, elaboratedSourceByLine, errResults, functionFromCompiledCode, iteratingOverSource, nextCharacterBeingExamined, programHasBasicError, quoteCount, reasonOfBasicError, roundBrackCount, squareBrackCount;

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
    this.currentCodeString = code;
    if (this.currentCodeString === "") {
      this.liveCodeLabCoreInstance.graphicsCommands.resetTheSpinThingy = true;
      programHasBasicError = false;
      this.eventRouter.trigger("clear-error");
      this.liveCodeLabCoreInstance.drawFunctionRunner.consecutiveFramesWithoutRunTimeError = 0;
      functionFromCompiledCode = new Function("");
      this.liveCodeLabCoreInstance.drawFunctionRunner.setDrawFunction(null);
      this.liveCodeLabCoreInstance.drawFunctionRunner.lastStableDrawFunction = null;
      return functionFromCompiledCode;
    }
    code = this.removeTickedDoOnce(code);
    /*
      	## The CodeChecker will check for unbalanced brackets
      	## and unfinished strings
      	## 
      	## If any errors are found then we quit compilation here
      	## and display an error message
    */

    code = this.stripCommentsAndCheckBasicSyntax(code);
    if (code === null) {
      return;
    }
    elaboratedSource = code;
    code = this.adjustPostfixNotations(code);
    code = code.replace(/(\d+)\s+times[ ]*\->/g, ";( $1 + 0).times ->");
    code = this.addTracingInstructionsToDoOnceBlocks(code);
    code = code.replace(/^(\s*)([a-z]+[a-zA-Z0-9]*)[ ]*$/gm, "$1;$2()");
    code = code.replace(/;\s*([a-z]+[a-zA-Z0-9]*)[ ]*([;\n]+)/g, ";$1()$2");
    code = code.replace(/\->\s*([a-z]+[a-zA-Z0-9]*)[ ]*([;\n]+)/g, ";$1()$2");
    if (code.match(/[\s\+\;]+draw\s*\(/) || false) {
      programHasBasicError = true;
      this.eventRouter.trigger("compile-time-error-thrown", "You can't call draw()");
      return;
    }
    code = code.replace(/;(if)\(\)/g, ";$1");
    code = code.replace(/;(else)\(\)/g, ";$1");
    code = code.replace(/;(for)\(\)/g, ";$1");
    code = code.replace(/\/\//g, "#");
    code = code.replace(/([^a-zA-Z0-9])(scale)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(rotate)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(move)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(rect)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(line)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(bpm)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(play)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(pushMatrix)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(popMatrix)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(resetMatrix)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(fill)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(noFill)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(stroke)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(noStroke)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(strokeSize)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(animationStyle)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(simpleGradient)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(background)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(colorMode)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(color)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(lights)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(noLights)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(ambientLight)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(pointLight)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(ball)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(ballDetail)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(peg)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(abs)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(ceil)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(constrain)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(dist)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(exp)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(floor)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(lerp)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(log)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(mag)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(map)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(max)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(min)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(norm)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(pow)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(round)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(sq)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(sqrt)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(acos)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(asin)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(atan)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(atan2)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(cos)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(degrees)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(radians)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(sin)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(tan)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(random)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(randomSeed)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(noise)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(noiseDetail)(\s)+/g, "$1;$2$3");
    code = code.replace(/([^a-zA-Z0-9])(noiseSeed)(\s)+/g, "$1;$2$3");
    code = code.replace(/->(\s+);/g, "->$1");
    code = code.replace(/(\sif\s*.*\s*);/g, "$1");
    code = code.replace(/(\s);(else\s*if\s*.*\s*);/g, "$1$2");
    code = code.replace(/(\s);(else.*\s*);/g, "$1$2");
    try {
      compiledOutput = this.CoffeeCompiler.compile(code, {
        bare: "on"
      });
    } catch (_error) {
      e = _error;
      this.eventRouter.trigger("compile-time-error-thrown", e);
      return;
    }
    programHasBasicError = false;
    this.eventRouter.trigger("clear-error");
    this.liveCodeLabCoreInstance.drawFunctionRunner.consecutiveFramesWithoutRunTimeError = 0;
    compiledOutput = compiledOutput.replace(/var frame/, ";");
    functionFromCompiledCode = new Function(compiledOutput);
    this.liveCodeLabCoreInstance.drawFunctionRunner.setDrawFunction(functionFromCompiledCode);
    return functionFromCompiledCode;
  };

  CodeTransformer.prototype.addCheckMarksAndUpdateCodeAndNotifyChange = function(CodeTransformer, doOnceOccurrencesLineNumbers) {
    var drawFunction, elaboratedSource, elaboratedSourceByLine, iteratingOverSource, _i, _len;

    elaboratedSource = void 0;
    elaboratedSourceByLine = void 0;
    iteratingOverSource = void 0;
    drawFunction = void 0;
    elaboratedSource = this.currentCodeString;
    elaboratedSourceByLine = elaboratedSource.split("\n");
    for (_i = 0, _len = doOnceOccurrencesLineNumbers.length; _i < _len; _i++) {
      iteratingOverSource = doOnceOccurrencesLineNumbers[_i];
      elaboratedSourceByLine[iteratingOverSource] = elaboratedSourceByLine[iteratingOverSource].replace(/^(\s*)doOnce([ ]*\->[ ]*.*)$/gm, "$1✓doOnce$2");
    }
    elaboratedSource = elaboratedSourceByLine.join("\n");
    this.eventRouter.trigger("code-updated-by-livecodelab", elaboratedSource);
    drawFunction = this.updateCode(elaboratedSource);
    return drawFunction;
  };

  return CodeTransformer;

})();
