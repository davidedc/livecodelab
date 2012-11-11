/**
 * extend the Number prototype
 * @param func
 * @param scope [optional]
 */
Number.prototype.times = function(func, scope) {
  var v = this.valueOf();
  for (var i = 0; i < v; i++) {
    func.call(scope || window, i);
  }
};

function checkErrorAndReport(e) {
    $('#dangerSignText').css('color', 'red');
    var errorMessage = "" + e;
    if (errorMessage.indexOf("Unexpected 'INDENT'") > -1) {
      errorMessage = "weird indentation";
    } else if (errorMessage.indexOf("Unexpected 'TERMINATOR'") > -1) {
      errorMessage = "line not complete";
    } else if (errorMessage.indexOf("Unexpected 'CALL_END'") > -1) {
      errorMessage = "line not complete";
    } else if (errorMessage.indexOf("Unexpected '}'") > -1) {
      errorMessage = "something wrong";
    } else if (errorMessage.indexOf("Unexpected 'MATH'") > -1) {
      errorMessage = "weird arithmetic there";
    } else if (errorMessage.indexOf("Unexpected 'LOGIC'") > -1) {
      errorMessage = "odd expression thingy";
    } else if (errorMessage.indexOf("Unexpected 'NUMBER'") > -1) {
      errorMessage = "lost number?";
    } else if (errorMessage.indexOf("Unexpected 'NUMBER'") > -1) {
      errorMessage = "lost number?";
    } else if (errorMessage.indexOf("ReferenceError") > -1) {
      errorMessage = errorMessage.replace(/ReferenceError:\s/gm, "");;
    }

    $('#errorMessageText').text(errorMessage);

}

function registerCode() {


  try {

    var editorContent = editor.getValue();

    if (editorContent !== '' && fakeText === true) {
      shrinkFakeText();
    }

    if (editorContent === '' && !fakeText) {
      resetTheSpinThingy = true;
      fakeText = true;
      window.location.hash = '';

      $("#formCode").animate({
        opacity: 0
      }, "fast");
      //$("#formCode").css('opacity',0);
      //setTimeout('if (editor.getValue() !== "") $("#formCode").css("opacity",0);',10);
      log('unshrinking');
      $("#justForFakeCursor").show();
      $("#toMove").show();
      $('#caption').html('|');


      $("#toMove").animate({
        opacity: 1,
        margin: 0,
        fontSize: 350,
        left: 0
      }, "fast", function() {
        $('#caption').html('');
        $('#fakeStartingBlinkingCursor').html('|');
        //fakeCursorInterval = setInterval ( "fakeCursorBlinking()", 800 );
      });

    }

    var copyOfEditorContent;
    var programIsMangled = false;
    var programContainsStringsOrComments = false;
    var characterBeingExamined;
    var nextCharacterBeingExamined;

    if (frenchVersion) {
      editorContent = editorContent.replace(/é/g, "e");
      editorContent = editorContent.replace(/ê/g, "e");
      editorContent = editorContent.replace(/temps/g, "time");
      editorContent = editorContent.replace(/uneFois/g, "doOnce");
      editorContent = editorContent.replace(/boite/g, "box");
      editorContent = editorContent.replace(/balle/g, "ball");
      editorContent = editorContent.replace(/rectangle/g, "rect");
      editorContent = editorContent.replace(/ligne/g, "line");
      editorContent = editorContent.replace(/deplace/g, "move");
      editorContent = editorContent.replace(/tourne/g, "rotate");
      editorContent = editorContent.replace(/changeTaille/g, "scale");
      editorContent = editorContent.replace(/tailleTrait/g, "strokeSize");
      editorContent = editorContent.replace(/taille/g, "scale");
      editorContent = editorContent.replace(/fond/g, "background");
      editorContent = editorContent.replace(/degradeSimple/g, "simpleGradient");
      editorContent = editorContent.replace(/styleAnimation/g, "animationStyle");
      editorContent = editorContent.replace(/flouMouvement/g, "motionBlur");
      editorContent = editorContent.replace(/peindreAudessus/g, "paintOver");
      editorContent = editorContent.replace(/peindreAuDessus/g, "paintOver");

      editorContent = editorContent.replace(/sauveMatrice/g, "pushMatrix");
      editorContent = editorContent.replace(/sauveMatrix/g, "pushMatrix");
      editorContent = editorContent.replace(/pushMatrice/g, "pushMatrix");
      editorContent = editorContent.replace(/restaureMatrice/g, "popMatrix");
      editorContent = editorContent.replace(/restaureMatrix/g, "popMatrix");
      editorContent = editorContent.replace(/popMatrice/g, "popMatrix");
      editorContent = editorContent.replace(/effaceMatrice/g, "resetMatrix");
      editorContent = editorContent.replace(/effaceMatrix/g, "resetMatrix");
      editorContent = editorContent.replace(/resetMatrice/g, "resetMatrix");

      editorContent = editorContent.replace(/sansRemplissage/g, "noFill");
      editorContent = editorContent.replace(/remplissage/g, "fill");
      editorContent = editorContent.replace(/trait/g, "stroke");
      editorContent = editorContent.replace(/couleur/g, "color");
      editorContent = editorContent.replace(/eclairageAmbiant/g, "ambientLight");
      editorContent = editorContent.replace(/sansEclairage/g, "noLights");
      editorContent = editorContent.replace(/eclairage/g, "lights");
      editorContent = editorContent.replace(/ajouteSon/g, "play");
      editorContent = editorContent.replace(/fois/g, "times");
      editorContent = editorContent.replace(/image/g, "frame");

      editorContent = editorContent.replace(/couleurAngle/g, "angleColor");
      editorContent = editorContent.replace(/noire/g, "black");
      editorContent = editorContent.replace(/noir/g, "black");
      editorContent = editorContent.replace(/blanche/g, "white");
      editorContent = editorContent.replace(/blanc/g, "white");
      editorContent = editorContent.replace(/grise/g, "gray");
      editorContent = editorContent.replace(/gris/g, "gray");
      editorContent = editorContent.replace(/rouge/g, "red");
      editorContent = editorContent.replace(/bleue/g, "blue");
      editorContent = editorContent.replace(/bleu/g, "blue");
      editorContent = editorContent.replace(/jaune/g, "yellow");
      editorContent = editorContent.replace(/verte/g, "green");
      editorContent = editorContent.replace(/vert/g, "green");
      editorContent = editorContent.replace(/violet/g, "purple");
      editorContent = editorContent.replace(/marron/g, "brown");
      editorContent = editorContent.replace(/rose/g, "pink");
      editorContent = editorContent.replace(/peche/g, "peachpuff");


    }


    // a check mark is added to the left of
    // doOnce statements that have been executed
    // but in reality those check marks
    // are just single-line comments, so replace here.
    editorContent = editorContent.replace(/^(\s)*✓[ ]*doOnce[ ]*\-\>[ ]*$/gm, "$1if false");
    editorContent = editorContent.replace("\u2713", "//");

    // according to jsperf, this is the fastest way to count for
    // occurrences of a character. We count apostrophes

    // check whether the program potentially
    // contains strings or comments
    // if it doesn't then we can do some
    // simple syntactic checks that are likely
    // to be much faster than attempting a
    // coffescript to javascript translation
    copyOfEditorContent = editorContent;

    /*
        if (chromeHackUncaughtReferenceNames !== []) {
      //alert("there is at least one undefined, actually: " + chromeHackUncaughtReferenceNames.length);

      var lengthToCheck = chromeHackUncaughtReferenceNames.length;
      for (var iteratingOverSource = 0; iteratingOverSource < lengthToCheck; iteratingOverSource++) {
            copyOfEditorContent = copyOfEditorContent.replace(new RegExp( '\\s+'+chromeHackUncaughtReferenceNames[iteratingOverSource]+'\\s+', "g" ),"ERROR");
      }
  
      if (copyOfEditorContent.indexOf('ERROR') > -1) {
        alert("found some old undefineds");
        return;
      }
      
      // if we are here it means that
      // all the previous undefineds are not
      // found anymore
      // TODO this wouldn't work if one uses a function name
      // and then one defines it. We should also check
      // whether there is a function definition
      chromeHackUncaughtReferenceNames = [];

    }
    */


    while (copyOfEditorContent.length) {
      characterBeingExamined = copyOfEditorContent.charAt(0);
      nextCharacterBeingExamined = copyOfEditorContent.charAt(1);
      if (characterBeingExamined === "'" || characterBeingExamined === '"' || (characterBeingExamined === "/" && (
      nextCharacterBeingExamined === "*" || nextCharacterBeingExamined === "/"))) {
        programContainsStringsOrComments = true;
        //alert('program contains strings or comments');
        break;
      }
      copyOfEditorContent = copyOfEditorContent.slice(1);
    }

    // let's do a quick check:
    // these groups of characters should be in even number:
    // ", ', (), {}, []
    if (programContainsStringsOrComments) {
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
      editorContent = editorContent.replace(/("(?:[^"\\\n]|\\.)*")|('(?:[^'\\\n]|\\.)*')|(\/\/[^\n]*\n)|(\/\*(?:(?!\*\/)(?:.|\n))*\*\/)/g, function(all, quoted, aposed, singleComment, comment) {
        // strings are kept as they are
        if (quoted) {
          return quoted;
        } else if (aposed) {
          return aposed;
        } else if (singleComment) {
          // preserve the line because
          // the doOnce mechanism needs to retrieve
          // the line where it was
          return "\n";
        }
        // eliminate multiline comments preserving the lines
        else {
          var numberOfLinesInMultilineComment = comment.split("\n").length - 1;
          //alert('rebuilding multilines: '+ numberOfLinesInMultilineComment);
          var rebuiltNewLines = '';
          for (var cycleToRebuildNewLines = 0; cycleToRebuildNewLines < numberOfLinesInMultilineComment; cycleToRebuildNewLines++) {
            rebuiltNewLines = rebuiltNewLines + "\n";
          }
          //alert('rebuilding multilines: '+ rebuiltNewLines);
          return rebuiltNewLines;
        }
      });

      // ok now in the version we use for syntax checking we delete all the strings
      copyOfEditorContent = editorContent.replace(/("(?:[^"\\\n]|\\.)*")|('(?:[^'\\\n]|\\.)*')/g, "");

    } else {
      copyOfEditorContent = editorContent;
    }

    var aposCount = 0;
    var quoteCount = 0;
    var roundBrackCount = 0;
    var curlyBrackCount = 0;
    var squareBrackCount = 0;

    while (copyOfEditorContent.length) {
      characterBeingExamined = copyOfEditorContent.charAt(0);

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
      copyOfEditorContent = copyOfEditorContent.slice(1);
    }

    // according to jsperf, the fastest way to check if number is even/odd
    if (
    aposCount & 1 || quoteCount & 1 || roundBrackCount & 1 || curlyBrackCount & 1 || squareBrackCount & 1) {
      if (autocodeOn) {
        editor.undo();
        //alert("did an undo");
        return;
      }

      programHasBasicError = true;
      //alert("basic error");
      //alert("p:" + $('#dangerSignText').css('color'));
      $('#dangerSignText').css('color', 'red');

      if (aposCount & 1) reasonOfBasicError = "Missing '";
      if (quoteCount & 1) reasonOfBasicError = 'Missing "';
      if (roundBrackCount & 1) reasonOfBasicError = "Unbalanced ()";
      if (curlyBrackCount & 1) reasonOfBasicError = "Unbalanced {}";
      if (squareBrackCount & 1) reasonOfBasicError = "Unbalanced []";

      $('#errorMessageText').text(reasonOfBasicError);


      return;
    }


    // indent the code
    var elaboratedSource = "\t" + editorContent.replace(
    new RegExp("\\n", "g"), "\n\t");
    elaboratedSource = "draw = ->\n" + elaboratedSource;

    // we make it so some common command forms can be used in postfix notation, e.g.
    //   60 bpm
    //   red fill
    //   yellow stroke
    //   black background
    elaboratedSource = elaboratedSource.replace(/(\d+)[ ]+bpm(\s)/g, "bpm $1$2");
    elaboratedSource = elaboratedSource.replace(/([a-zA-Z]+)[ ]+fill(\s)/g, "fill $1$2");
    elaboratedSource = elaboratedSource.replace(/([a-zA-Z]+)[ ]+stroke(\s)/g, "stroke $1$2");
    elaboratedSource = elaboratedSource.replace(/([a-zA-Z]+)[ ]+background(\s)/g, "background $1$2");

    // little trick. This is mangled up in the translation from coffeescript
    // (1).times ->
    // But this isn't:
    // (1+0).times ->
    // So here is the little replace.
    // TODO: you should be a little smarter about the substitution of the draw method
    // You can tell a method declaration because the line below is indented
    // so you should check that.

    //elaboratedSource =  elaboratedSource.replace(/^([a-z]+[a-zA-Z0-9]+)\s*$/gm, "$1 = ->" );
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

    elaboratedSource = elaboratedSource.replace(/(\d+)\s+times[ ]*\->/g, ";( $1 + 0).times ->");


    // if there is at least one doOnce:
    // split the source in lines
    // add all the line numbers info
    // regroup the lines into a single string again
    //alert('soon before replacing doOnces'+elaboratedSource);
    if (elaboratedSource.indexOf('doOnce') > -1) {
      //alert("a doOnce is potentially executable");
      var elaboratedSourceByLine = elaboratedSource.split("\n");
      //alert('splitting: ' + elaboratedSourceByLine.length );
      for (var iteratingOverSource = 0; iteratingOverSource < elaboratedSourceByLine.length; iteratingOverSource++) {
        //alert('iterating: ' + iteratingOverSource );
        elaboratedSourceByLine[iteratingOverSource] = elaboratedSourceByLine[iteratingOverSource].replace(/^(\s*)doOnce[ ]*\->[ ]*(.+)$/gm, "$1;doLNOnce.push(" + (iteratingOverSource - 1) + "); (1+0).times -> $2");

        if (elaboratedSourceByLine[iteratingOverSource].match(/^(\s*)doOnce[ ]*\->[ ]*$/gm)) {
          //alert('doOnce multiline!');
          elaboratedSourceByLine[iteratingOverSource] = elaboratedSourceByLine[iteratingOverSource].replace(/^(\s*)doOnce[ ]*\->[ ]*$/gm, "$1(1+0).times ->");
          elaboratedSourceByLine[iteratingOverSource + 1] = elaboratedSourceByLine[iteratingOverSource + 1].replace(/^(\s*)(.+)$/gm, "$1;doLNOnce.push(" + (iteratingOverSource - 1) + "); $2");
        }

      }
      elaboratedSource = elaboratedSourceByLine.join("\n");
      //alert('soon after replacing doOnces'+elaboratedSource);
    }



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
    if (
    elaboratedSource.match(/[\s\+\;]+draw\s*\(/) || false) {
      if (autocodeOn) {
        editor.undo();
        //alert("did an undo");
        return;
      }
      programHasBasicError = true;
      $('#dangerSignText').css('color', 'red');
      $('#errorMessageText').text("You can't call draw()");
      return;
    }


    // we don't want if and for to undergo the same tratment as, say, box
    // so put those back to normal.
    elaboratedSource = elaboratedSource.replace(/;if\(\)/g, ";if");
    elaboratedSource = elaboratedSource.replace(/;else\(\)/g, ";else");
    elaboratedSource = elaboratedSource.replace(/;for\(\)/g, ";for");

    elaboratedSource = elaboratedSource.replace(/\/\//g, "#");
    elaboratedSource = elaboratedSource.replace(/scale(\s)+/g, ";scale$1");
    elaboratedSource = elaboratedSource.replace(/rotate(\s)+/g, ";rotate$1");
    elaboratedSource = elaboratedSource.replace(/move(\s)+/g, ";move$1");
    elaboratedSource = elaboratedSource.replace(/rect(\s)+/g, ";rect$1");
    elaboratedSource = elaboratedSource.replace(/line(\s)+/g, ";line$1");
    elaboratedSource = elaboratedSource.replace(/bpm(\s)+/g, ";bpm$1");
    elaboratedSource = elaboratedSource.replace(/play(\s)+/g, ";play$1");
    elaboratedSource = elaboratedSource.replace(/pushMatrix(\s)+/g, ";pushMatrix$1");
    elaboratedSource = elaboratedSource.replace(/popMatrix(\s)+/g, ";popMatrix$1");
    elaboratedSource = elaboratedSource.replace(/resetMatrix(\s)+/g, ";resetMatrix$1");
    elaboratedSource = elaboratedSource.replace(/fill(\s)+/g, ";fill$1");
    elaboratedSource = elaboratedSource.replace(/noFill(\s)+/g, ";noFill$1");
    elaboratedSource = elaboratedSource.replace(/stroke(\s)+/g, ";stroke$1");
    elaboratedSource = elaboratedSource.replace(/noStroke(\s)+/g, ";noStroke$1");
    elaboratedSource = elaboratedSource.replace(/strokeSize(\s)+/g, ";strokeSize$1");
    elaboratedSource = elaboratedSource.replace(/animationStyle(\s)+/g, ";animationStyle$1");
    elaboratedSource = elaboratedSource.replace(/simpleGradient(\s)+/g, ";simpleGradient$1");
    elaboratedSource = elaboratedSource.replace(/background(\s)+/g, ";background$1");
    elaboratedSource = elaboratedSource.replace(/color(\s)+/g, ";color$1");
    //elaboratedSource =  elaboratedSource.replace(/ambient(\s)+/g, ";ambient$1" );
    //elaboratedSource =  elaboratedSource.replace(/reflect(\s)+/g, ";reflect$1" );
    //elaboratedSource =  elaboratedSource.replace(/refract(\s)+/g, ";refract$1" );
    elaboratedSource = elaboratedSource.replace(/lights(\s)+/g, ";lights$1");
    elaboratedSource = elaboratedSource.replace(/noLights(\s)+/g, ";noLights$1");
    elaboratedSource = elaboratedSource.replace(/ambientLight(\s)+/g, ";ambientLight$1");
    elaboratedSource = elaboratedSource.replace(/pointLight(\s)+/g, ";pointLight$1");
    elaboratedSource = elaboratedSource.replace(/ball(\s)+/g, ";ball$1");
    elaboratedSource = elaboratedSource.replace(/ballDetail(\s)+/g, ";ballDetail$1");
    elaboratedSource = elaboratedSource.replace(/peg(\s)+/g, ";peg$1");

    // you'd think that semicolons are OK anywhere before any command
    // but coffee-script doesn't like some particular configurations - fixing those:
    // the semicolon mangles the first line of the function definitions:
    elaboratedSource = elaboratedSource.replace(/->(\s+);/g, "->$1");
    // the semicolon mangles the first line of if statements
    elaboratedSource = elaboratedSource.replace(/(\s)if\s*(.*)(\s*);/g, "$1if $2$3");
    // the semicolon mangles the first line of else if statements
    elaboratedSource = elaboratedSource.replace(/(\s);else\s*if\s*(.*)(\s*);/g, "$1else if $2$3");
    // the semicolon mangles the first line of else statements
    elaboratedSource = elaboratedSource.replace(/(\s);else(.*)(\s*);/g, "$1else$2$3");


    //alert(elaboratedSource );
    out = CoffeeScript.compile(elaboratedSource, {
      bare: "on"
    });
    log("in javascript: " + out);
  } catch (e) {

    if (autocodeOn) {
      editor.undo();
      //alert("did an undo");
      return;
    }
    
    checkErrorAndReport(e);
    
    return;
  }


  // FINDS USED METHODS WHICH ARE NOT DECLARED
  var matchDeclaredMethod = /([a-z]+[a-zA-Z0-9]*) = function/;
  var declaredMethods = [];
  var mc;
  var copyOfOut = out;
  while ((mc = copyOfOut.match(matchDeclaredMethod))) {
    declaredMethods.push(mc[1]);
    copyOfOut = RegExp.rightContext;
  }
  //alert("found declared methods " + declaredMethods.length);
  //alert("out:"+out)

  var usedMethods = [];
  var md;
  copyOfOut = out;
  while ((md = copyOfOut.match(/\s([a-z]+[a-zA-Z0-9]*)\(/))) {
    usedMethods.push(md[1]);
    copyOfOut = RegExp.rightContext;
  }
  //alert("found used methods " + usedMethods.length);
  var error = false;
  for (var scanningUsedMethods = 0; scanningUsedMethods < usedMethods.length; scanningUsedMethods++) {
    if (
    usedMethods[scanningUsedMethods] === "function" || usedMethods[scanningUsedMethods] === "rotate" || usedMethods[scanningUsedMethods] === "rect" || usedMethods[scanningUsedMethods] === "line" || usedMethods[scanningUsedMethods] === "box" || usedMethods[scanningUsedMethods] === "move" || usedMethods[scanningUsedMethods] === "scale" || usedMethods[scanningUsedMethods] === "alert" || usedMethods[scanningUsedMethods] === "bpm" || usedMethods[scanningUsedMethods] === "play" || usedMethods[scanningUsedMethods] === "pushMatrix" || usedMethods[scanningUsedMethods] === "popMatrix" || usedMethods[scanningUsedMethods] === "resetMatrix" || usedMethods[scanningUsedMethods] === "fill" || usedMethods[scanningUsedMethods] === "noFill" || usedMethods[scanningUsedMethods] === "stroke" || usedMethods[scanningUsedMethods] === "noStroke" || usedMethods[scanningUsedMethods] === "strokeSize" || usedMethods[scanningUsedMethods] === "animationStyle" || usedMethods[scanningUsedMethods] === "background" || usedMethods[scanningUsedMethods] === "simpleGradient" || usedMethods[scanningUsedMethods] === "color" ||
    //usedMethods[scanningUsedMethods] === "ambient" ||
    //usedMethods[scanningUsedMethods] === "reflect" ||
    //usedMethods[scanningUsedMethods] === "refract" ||
    usedMethods[scanningUsedMethods] === "lights" || usedMethods[scanningUsedMethods] === "noLights" || usedMethods[scanningUsedMethods] === "ambientLight" || usedMethods[scanningUsedMethods] === "pointLight" || usedMethods[scanningUsedMethods] === "ball" || usedMethods[scanningUsedMethods] === "ballDetail" || usedMethods[scanningUsedMethods] === "peg" || false) {
      continue;
    }
    if (declaredMethods.length === 0) {
      error = true;
      //alert("used method not declared: " + usedMethods[scanningUsedMethods]);
      $('#dangerSignText').css('color', 'red');
      $('#errorMessageText').text(usedMethods[scanningUsedMethods] + " doesn't exist");
      return;
    }
    for (var scanningDeclaredMethods = 0; scanningDeclaredMethods < declaredMethods.length; scanningDeclaredMethods++) {
      //alert ("comparing >" + usedMethods[scanningUsedMethods]  + "< , >" + declaredMethods[scanningDeclaredMethods] +"<");
      if (usedMethods[scanningUsedMethods] === declaredMethods[scanningDeclaredMethods]) {
        break;
      } else if (scanningDeclaredMethods == declaredMethods.length - 1) {
        error = true;
        //alert("used method not declared: " + usedMethods[scanningUsedMethods]);
        $('#dangerSignText').css('color', 'red');
        $('#errorMessageText').text(usedMethods[scanningUsedMethods] + " doesn't exist");
        return;
      }
    }
  }


  programHasBasicError = false;
  reasonOfBasicError = "";
  $('#dangerSignText').css('color', '#000000');
  $('#errorMessageText').text(reasonOfBasicError);

  // see here for the deepest examination ever of "eval"
  // http://perfectionkills.com/global-eval-what-are-the-options/
  // note that exceptions are caught by the window.onerror callback
  consecutiveFramesWithoutRunTimeError = 0;

  // so it turns out that when you ASSIGN to the frame variable inside
  // the coffeescript, it declares a local one, which makes changing
  // it impossible.
  // TODO: There must be a way to tell coffeescript to accept
  // some variables as global, for the time being let's put
  // the cheap hack in place.
  out = out.replace(/var frame/, ";");

  //alert("out:"+out);
  window.eval(out);


}
