// init the scene


buildPostprocessingChain = function() {
  renderTargetParameters = {
    format: THREE.RGBAFormat,
    stencilBuffer: true
  };

  renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters);
  effectSaveTarget = new THREE.SavePass(new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters));
  effectSaveTarget.clear = false;

  fxaaPass = new THREE.ShaderPass(THREE.ShaderExtras["fxaa"]);
  fxaaPass.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);

  effectBlend = new THREE.ShaderPass(THREE.ShaderExtras["blend"], "tDiffuse1");
  screenPass = new THREE.ShaderPass(THREE.ShaderExtras["screen"]);

  // motion blur
  effectBlend.uniforms['tDiffuse2'].texture = effectSaveTarget.renderTarget;
  effectBlend.uniforms['mixRatio'].value = 0;

  var renderModel = new THREE.RenderPass(scene, camera);

  composer = new THREE.EffectComposer(renderer, renderTarget);

  composer.addPass(renderModel);
  //composer.addPass( fxaaPass );
  composer.addPass(effectBlend);
  composer.addPass(effectSaveTarget);
  composer.addPass(screenPass);
  screenPass.renderToScreen = true;
}



function render() {


  /*
      // need a light for the meshlambert material
      var light = new THREE.PointLight( 0xFFFFFF );
      light.position.set( 10, 0, 10 );
      scene.add( light );
      */



  ////////////////////////
  if (isWebGLUsed) {
    composer.render();
    //renderer.render(scene,camera);
  } else {


    // the renderer draws into an offscreen canvas called sceneRenderingCanvas
    renderer.render(scene, camera);

    // clear the final render context
    finalRenderWithSceneAndBlendContext.globalAlpha = 1.0;
    finalRenderWithSceneAndBlendContext.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // draw the rendering of the scene on the final render
    // clear the final render context
    finalRenderWithSceneAndBlendContext.globalAlpha = blendAmount;
    finalRenderWithSceneAndBlendContext.drawImage(previousRenderForBlending, 0, 0);

    finalRenderWithSceneAndBlendContext.globalAlpha = 1.0;
    finalRenderWithSceneAndBlendContext.drawImage(sceneRenderingCanvas, 0, 0);

    //previousRenderForBlendingContext.clearRect(0, 0, window.innerWidth,window.innerHeight)
    previousRenderForBlendingContext.globalCompositeOperation = 'copy';
    previousRenderForBlendingContext.drawImage(finalRenderWithSceneAndBlend, 0, 0);

    // clear the renderer's canvas to transparent black
    sceneRenderingCanvasContext.clearRect(0, 0, window.innerWidth, window.innerHeight);



  }


}


var drawLoopTimer = null;
var frame = 0;
var doLNOnce = [];


// By doing some profiling it is apparent that
// adding and removing objects has a big cost.
// So instead of adding/removing objects every frame,
// objects are only added at creation and they are
// never removed from the scene. They are
// only made invisible. This routine combs the
// scene and finds the objects that.
// TODO a way to shrink the scene if it's been a
// long time that only a handful of lines/meshes
// have been used.

function combDisplayList() {

  for (var i = 0; i < scene.objects.length; ++i) {
    var sceneObject = scene.objects[i];
    if (sceneObject.isLine) {
      if (usedLines > 0) {
        sceneObject.visible = true;
        usedLines--;
      } else {
        sceneObject.visible = false;
      }
    } else if (sceneObject.isRectangle) {
      if (usedRectangles > 0) {
        sceneObject.visible = true;
        usedRectangles--;
      } else {
        sceneObject.visible = false;
      }
    } else if (sceneObject.isBox) {
      if (usedBoxes > 0) {
        sceneObject.visible = true;
        usedBoxes--;
      } else {
        sceneObject.visible = false;
      }
    } else if (sceneObject.isCylinder) {
      if (usedCylinders > 0) {
        sceneObject.visible = true;
        usedCylinders--;
      } else {
        sceneObject.visible = false;
      }
    } else if (sceneObject.isAmbientLight) {
      if (usedAmbientLights > 0) {
        sceneObject.visible = true;
        usedAmbientLights--;
      } else {
        sceneObject.visible = false;
      }
    } else if (sceneObject.isSphere !== 0) {
      if (usedSpheres['' + sceneObject.isSphere] > 0) {
        sceneObject.visible = true;
        usedSpheres['' + sceneObject.isSphere] = usedSpheres['' + sceneObject.isSphere] - 1;
      } else {
        sceneObject.visible = false;
      }
    }
  }
}


function clearDisplayList() {
  /*
  for(var i = 0; i < scene.objects.length; ++i) {
      scene.remove(scene.objects[i]);
      i--;
  }
  */
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
      console.log('unshrinking');
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
      editorContent = editorContent.replace(/ajouteSon/g, "addSound");
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
      elaboratedSourceByLine = elaboratedSource.split("\n");
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



    elaboratedSource = elaboratedSource.replace(/^(\s*)([a-z]+[a-zA-Z0-9]+)[ ]*$/gm, "$1;$2()");

    // this takes care of when a token that it's supposed to be
    // a function is inlined with something else e.g.
    // doOnce frame = 0; box
    // 2 times -> box
    elaboratedSource = elaboratedSource.replace(/;\s*([a-z]+[a-zA-Z0-9]+)[ ]*([;\n]+)/g, ";$1()$2");
    // this takes care of when a token that it's supposed to be
    // a function is inlined like so:
    // 2 times -> box
    elaboratedSource = elaboratedSource.replace(/\->\s*([a-z]+[a-zA-Z0-9]+)[ ]*([;\n]+)/g, ";$1()$2");

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
    elaboratedSource = elaboratedSource.replace(/;for\(\)/g, ";for");

    elaboratedSource = elaboratedSource.replace(/\/\//g, "#");
    elaboratedSource = elaboratedSource.replace(/scale(\s)+/g, ";scale$1");
    elaboratedSource = elaboratedSource.replace(/rotate(\s)+/g, ";rotate$1");
    elaboratedSource = elaboratedSource.replace(/move(\s)+/g, ";move$1");
    elaboratedSource = elaboratedSource.replace(/rect(\s)+/g, ";rect$1");
    elaboratedSource = elaboratedSource.replace(/line(\s)+/g, ";line$1");
    elaboratedSource = elaboratedSource.replace(/bpm(\s)+/g, ";bpm$1");
    elaboratedSource = elaboratedSource.replace(/addSound(\s)+/g, ";addSound$1");
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

    // the semicolon mangles the first line of the function definitions
    // coffeescript doesn't like that
    elaboratedSource = elaboratedSource.replace(/->(\s+);/g, "->$1");

    // the semicolon mangles the first line of if statements
    // coffeescript doesn't like that
    elaboratedSource = elaboratedSource.replace(/(\s)if\s*([a-zA-Z0-9]*)(\s*);/g, "$1if $2$3");


    console.log(elaboratedSource );
    out = CoffeeScript.compile(elaboratedSource, {
      bare: "on"
    });
    console.log("in javascript: " + out);
  } catch (e) {

    if (autocodeOn) {
      editor.undo();
      //alert("did an undo");
      return;
    }

    $('#dangerSignText').css('color', 'red');
    var coffeeScriptErrorMessage = "" + e;
    if (coffeeScriptErrorMessage.indexOf("Unexpected 'INDENT'") > -1) {
      coffeeScriptErrorMessage = "weird indentation";
    } else if (coffeeScriptErrorMessage.indexOf("Unexpected 'TERMINATOR'") > -1) {
      coffeeScriptErrorMessage = "line not complete";
    } else if (coffeeScriptErrorMessage.indexOf("Unexpected 'CALL_END'") > -1) {
      coffeeScriptErrorMessage = "line not complete";
    } else if (coffeeScriptErrorMessage.indexOf("Unexpected '}'") > -1) {
      coffeeScriptErrorMessage = "something wrong";
    } else if (coffeeScriptErrorMessage.indexOf("Unexpected 'MATH'") > -1) {
      coffeeScriptErrorMessage = "weird arithmetic there";
    } else if (coffeeScriptErrorMessage.indexOf("Unexpected 'LOGIC'") > -1) {
      coffeeScriptErrorMessage = "odd expression thingy";
    } else if (coffeeScriptErrorMessage.indexOf("Unexpected 'NUMBER'") > -1) {
      coffeeScriptErrorMessage = "lost number?";
    }
    $('#errorMessageText').text(coffeeScriptErrorMessage);
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
    usedMethods[scanningUsedMethods] === "function" || usedMethods[scanningUsedMethods] === "rotate" || usedMethods[scanningUsedMethods] === "rect" || usedMethods[scanningUsedMethods] === "line" || usedMethods[scanningUsedMethods] === "box" || usedMethods[scanningUsedMethods] === "move" || usedMethods[scanningUsedMethods] === "scale" || usedMethods[scanningUsedMethods] === "alert" || usedMethods[scanningUsedMethods] === "bpm" || usedMethods[scanningUsedMethods] === "addSound" || usedMethods[scanningUsedMethods] === "pushMatrix" || usedMethods[scanningUsedMethods] === "popMatrix" || usedMethods[scanningUsedMethods] === "resetMatrix" || usedMethods[scanningUsedMethods] === "fill" || usedMethods[scanningUsedMethods] === "noFill" || usedMethods[scanningUsedMethods] === "stroke" || usedMethods[scanningUsedMethods] === "noStroke" || usedMethods[scanningUsedMethods] === "strokeSize" || usedMethods[scanningUsedMethods] === "animationStyle" || usedMethods[scanningUsedMethods] === "background" || usedMethods[scanningUsedMethods] === "simpleGradient" || usedMethods[scanningUsedMethods] === "color" ||
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

//var chromeHackUncaughtReferenceName = '';
//var chromeHackUncaughtReferenceNames = [];

// swap the two lines below in case one needs to
// debug the environment, otherwise all errors are
// caught and not bubbled up to the browser debugging tool.
// var foo = function(msg, url, linenumber) {
window.onerror = function(msg, url, linenumber) {

  if (autocodeOn) {
    editor.undo();
    //alert("did an undo");
    return;
  }

  if (msg.indexOf("Uncaught ReferenceError: ") > -1) {
    msg = msg.substring(25);
  }

  $('#dangerSignText').css('color', 'red');
  $('#errorMessageText').text(msg);

  // ok so this is kind of a hack that we need to put
  // in place for Chrome (both Windows and Mac)
  // what Chrome does is: when there is a function call,
  // it evaluates the arguments
  // of a function even if the function is undefined
  // so for example
  // doO alert "miao"
  // alerts a miao, because it's translated into
  // doO(alert("miao))
  // and even if doO is undefined, the argumen is evaluated
  // This is a problem because doOnce would encourage
  // the following use: misspell doOnce until the rest of the
  // line is finished, then correct the mispell to actually
  // run the line once.
  // But unfortunately because of the quirk described above,
  // that wouldn't work in Chrome.
  /*
 if (msg.indexOf("Uncaught ReferenceError") > -1) {
  chromeHackUncaughtReferenceName = msg.split(' ')[2];

  var lengthToCheck = chromeHackUncaughtReferenceNames.length;
  if (lengthToCheck == 0){
    chromeHackUncaughtReferenceNames.push(chromeHackUncaughtReferenceName);
  }
  else {
    for (var iteratingOverSource = 0; iteratingOverSource < lengthToCheck; iteratingOverSource++) {
      if (chromeHackUncaughtReferenceNames[iteratingOverSource].indexOf(chromeHackUncaughtReferenceName) > -1) {
        break;
      }
      else if (iteratingOverSource == lengthToCheck-1) {
       // if we are here it means that the variable is not in the array
       chromeHackUncaughtReferenceNames.push(chromeHackUncaughtReferenceName);
      }
    }
  }
 }
 */

  // we set this to 6 because we save it as stable
  // when it's 5, so we avoid re-saving.
  consecutiveFramesWithoutRunTimeError = 6;
  window.eval(lastStableProgram);

  return true;
}

function background(r, g, b) {

  clearDisplayList();

  // canvas renderer
  theColor = new THREE.Color();
  theColor.setRGB(r, g, b);
  //renderer.setClearColor(theColor,1);


}

// animation loop
var loopInterval;
var time;
var timeAtStart;

function animate() {

  // loop on request animation loop
  // - it has to be at the begining of the function
  // - see details at http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
  // requestAnimationFrame seems to only do 60 fps, which in my case is too much,
  // I rather prefer to have a slower framerate but steadier.
  if (useRequestAnimationFrame) {
    if (wantedFramesPerSecond === -1) {
      requestAnimationFrame(animate);
    } else {
      //setTimeout("window.requestAnimationFrame(animate)",
      //       1000 / wantedFramesPerSecond);
      if (loopInterval === undefined) {
        loopInterval = setInterval("window.requestAnimationFrame(animate)", 1000 / wantedFramesPerSecond);
      }
    }
  } else {
    setTimeout('animate();', 1000 / wantedFramesPerSecond);
  }

  //clearDisplayList();
  matrixStack = [];
  worldMatrix.identity();

  // the sound list needs to be cleaned
  // and the beatsPerMinute set to zero
  // so that the user program can create its own from scratch
  beatsPerMinute = 0;
  soundLoops.soundIDs = [];
  soundLoops.beatStrings = [];


  //rootObject = new THREE.Object3D();
  //scene.add(rootObject);
  //parentObject = rootObject;
  if (typeof(draw) != "undefined") {
    var d = new Date();
    if (frame === 0) {
      timeAtStart = d.getTime();
      time = 0;
    } else {
      time = d.getTime() - timeAtStart;
    }
    doLNOnce = [];
    fill(0xFFFFFFFF);
    stroke(0xFF000000);
    currentStrokeSize = 1;
    defaultNormalFill = true;
    defaultNormalStroke = true;
    ballDetLevel = ballDefaultDetLevel;
    noLights();
    usedLines = 0;
    usedRectangles = 0;
    usedBoxes = 0;
    usedAmbientLights = 0;
    usedPointLights = 0;
    // In theory there is no need to chuck away the
    // counter altogether, you could go through
    // the existing counters contained in this object
    // (one for each ball detail ever used)
    // and set it to zero. That would maybe save
    // some garbage collection time.
    // But it's probably not worth it...
    usedSpheres = {};
    animationStyleValue = normal;
    resetGradientStack();
    //bpm(0);
    draw();
    // we have to repeat this check because in the case
    // the user has set frame = 0,
    // then we have to catch that case here
    // after the program has executed
    if (frame === 0) {
      timeAtStart = d.getTime();
      time = 0;
    }
    animationStyleUpdateIfChanged();
    simpleGradientUpdateIfChanged();
    updateBpmIfChanged();
    frame++;
    consecutiveFramesWithoutRunTimeError++;
    if (consecutiveFramesWithoutRunTimeError == 5) {
      lastStableProgram = out;
      //chromeHackUncaughtReferenceName = '';
    }
  }

  // do the render
  combDisplayList();
  render();
  //clearDisplayList();
  // update stats
  stats.update();


  if (doLNOnce.length !== 0) {
    //alert("a doOnce has been ran");
    elaboratedSource = editor.getValue();

    if (frenchVersion) {
      elaboratedSource = elaboratedSource.replace(/uneFois/g, "doOnce");
    }

    elaboratedSourceByLine = elaboratedSource.split("\n");
    //alert('splitting: ' + elaboratedSourceByLine.length );
    for (var iteratingOverSource = 0; iteratingOverSource < doLNOnce.length; iteratingOverSource++) {
      //alert('iterating: ' + iteratingOverSource );
      elaboratedSourceByLine[doLNOnce[iteratingOverSource]] = elaboratedSourceByLine[doLNOnce[iteratingOverSource]].replace(/^(\s*)doOnce([ ]*\->[ ]*.+)$/gm, "$1\u2713doOnce$2");
      elaboratedSourceByLine[doLNOnce[iteratingOverSource]] = elaboratedSourceByLine[doLNOnce[iteratingOverSource]].replace(/^(\s*)doOnce([ ]*\->[ ]*)$/gm, "$1\u2713doOnce$2");
    }
    elaboratedSource = elaboratedSourceByLine.join("\n");

    var cursorPositionBeforeAddingCheckMark = editor.getCursor();
    cursorPositionBeforeAddingCheckMark.ch = cursorPositionBeforeAddingCheckMark.ch + 1;

    if (frenchVersion) {
      elaboratedSource = elaboratedSource.replace(/doOnce/g, "uneFois");
    }

    editor.setValue(elaboratedSource);
    editor.setCursor(cursorPositionBeforeAddingCheckMark);

    // we want to avoid that another frame is run with the old
    // code, as this would mean that the
    // runOnce code is run more than once,
    // so we need to register the new code.
    // TODO: ideally we don't want to register the
    // new code by getting the code from codemirror again
    // because we don't know what that entails. We should
    // just pass the code we already have.
    // Also registerCode() may split the source code by line, so we can
    // avoid that since we've just split it, we could pass
    // the already split code.
    registerCode();
  }


}

var lastkey = 0;
var fakeText = true;
document.onkeypress = function(e) {

  if (fakeText && editor.getValue() !== "") shrinkFakeText(e);

}

var shrinkFakeText = function(e) {

    if (e !== undefined) {
      var theEvent = e || window.event;
      var key = theEvent.keyCode || theEvent.which;
      key = String.fromCharCode(key);
    } else key = '';

    var currentCaption = $('#caption').html();
    var shorterCaption = currentCaption.substring(0, currentCaption.length - 1);
    $('#caption').html(shorterCaption + key + "|");
    $('#fakeStartingBlinkingCursor').html('');

    $("#toMove").animate({
      opacity: 0,
      margin: -100,
      fontSize: 300,
      left: 0
    }, "fast");

    setTimeout('$("#formCode").animate({opacity: 1}, "fast");', 120);
    setTimeout('$("#justForFakeCursor").hide();', 200);
    setTimeout('$("#toMove").hide();', 200);
    //setTimeout('clearTimeout(fakeCursorInterval);',200);
    fakeText = false;

  }


var parentObject, rootObject, rotate, move;
parentObject = 0;
rootObject = 0;
var currentObject;


var matrixStack = [];
pushMatrix = function() {
  matrixStack.push(worldMatrix);
  worldMatrix = (new THREE.Matrix4()).copy(worldMatrix);
}

popMatrix = function() {
  if (matrixStack.length !== 0) worldMatrix = matrixStack.pop();
  else worldMatrix.identity();
}

resetMatrix = function() {
  worldMatrix.identity();
}

move = function(a, b, c) {
  if (arguments.length === 0) {
    a = Math.sin(time / 500);
    b = Math.cos(time / 500);
    c = a;
  } else if (arguments.length == 1) {
    b = a;
    c = a;
  } else if (arguments.length == 2) {
    c = 0;
  }

  /*
  currentObject = new THREE.Object3D();
  currentObject.position.x = a;
  currentObject.position.y = b;
  currentObject.position.z = c;
  parentObject.add(currentObject);
  parentObject = currentObject;
  */
  worldMatrix.translate(new THREE.Vector3(a, b, c));
};

rotate = function(a, b, c) {

  if (arguments.length === 0) {
    a = time / 1000;
    b = a;
    c = a;
  } else if (arguments.length == 1) {
    b = a;
    c = a;
  } else if (arguments.length == 2) {
    c = 0;
  }

  /*
  currentObject = new THREE.Object3D();
  currentObject.rotation.x = a;
  currentObject.rotation.y = b;
  currentObject.rotation.z = c;
  parentObject.add(currentObject);
  parentObject = currentObject;
  */
  //worldMatrix.setRotationFromEuler(new THREE.Vector3(a,b,c));
  worldMatrix.rotateX(a).rotateY(b).rotateZ(c);

};

scale = function(a, b, c) {
  if (arguments.length === 0) {
    a = 1 + Math.sin(time / 500) / 4;
    b = a;
    c = a;
  } else if (arguments.length == 1) {
    b = a;
    c = a;
  } else if (arguments.length == 2) {
    c = 1;
  }

  // odd things happen setting scale to zero
  if (a > -0.000000001 && a < 0.000000001) a = 0.000000001;
  if (b > -0.000000001 && b < 0.000000001) b = 0.000000001;
  if (c > -0.000000001 && c < 0.000000001) c = 0.000000001;

  /*
  currentObject = new THREE.Object3D();
  currentObject.scale.x = a;
  currentObject.scale.y = b;
  currentObject.scale.z = c;
  parentObject.add(currentObject);
  parentObject = currentObject;
  */
  worldMatrix.scale(new THREE.Vector3(a, b, c));

};


// TODO Note that lines have a "solid fill" mode
// and something similar to the normalMaterial mode
// but there is no equivalent to the lambert material
// mode.
// That could be done by somehow mixing the color of
// an ambient light to the color of the stroke
// (although which ambient light do you pick if there
// is more than one?)
line = function(a) {

  if (!doStroke) {
    return;
  }

  if (a === undefined) {
    a = 1;
  }


  var mesh = linesPool[usedLines];
  if (mesh === undefined) {
    var lineBasicMaterialCOL = new THREE.LineBasicMaterial({
      //color: currentStrokeColor,
      opacity: currentStrokeAlpha,
      linewidth: currentStrokeSize
    });

    mesh = new THREE.Line(lineGeometry, lineBasicMaterialCOL);
    mesh.isLine = true;
    mesh.isRectangle = false;
    mesh.isBox = false;
    mesh.isCylinder = false;
    mesh.isAmbientLight = false;
    mesh.isPointLight = false;
    mesh.isSphere = 0;
    linesPool.push(mesh);
    scene.add(mesh);
  } else {
    //mesh.geometry = lineGeometry;
    //mesh.material = lineBasicMaterialCOL;
    //mesh.material.color.setHex(currentStrokeColor);
    mesh.material.opacity = currentStrokeAlpha;
    mesh.material.linewidth = currentStrokeSize;
  }
  usedLines++;

  // old unpooled mechanism
  //var mesh = new THREE.Line(lineGeometry, lineBasicMaterialCOL);
  mesh.matrixAutoUpdate = false;
  mesh.matrix.copy(worldMatrix);
  mesh.matrixWorldNeedsUpdate = true;
  if (a !== 1) {
    mesh.matrix.scale(new THREE.Vector3(1, a, 1));
    // in theory the docs say that we should change the boundradius
    // but I don't think that we need it...
    //mesh.boundRadiusScale = Math.max(a,b,c);
  }

  // setting the color after the geometry has been dealt with
  // because in case we use the angleColor then we
  // need to know the geometry.
  if (currentStrokeColor === angleColor || defaultNormalStroke) {
    var sasaas = mesh.matrix.multiplyVector3(new THREE.Vector3(0, 1, 0)).normalize();
    console.log(sasaas.x+ " " + sasaas.y + " " + sasaas.z);
    mesh.material.color.setHex(color(((sasaas.x + 1) / 2) * 255, ((sasaas.y + 1) / 2) * 255, ((sasaas.z + 1) / 2) * 255));
  } else {
    mesh.material.color.setHex(currentStrokeColor);
  }

}

// ambientColor is always white
// because it needs to reflect what the
// ambient light color is
// I tried to set the ambientColor directly
// but it doesn't work. It needs to be white so
// that the tint of the ambientLight is shown. 
var ambientColor = color(255, 255, 255);
//ambient = function(a) {
//ambientColor = a;
//}
var reflectValue = 1;
//reflect = function(a) {
//  reflectValue = a;
//}
var refractValue = 0.98;
//refract = function(a) {
//  refractValue = a;
//}
var lightsAreOn = false;
lights = function() {
  lightsAreOn = true;
}
noLights = function() {
  lightsAreOn = false;
}

rect = function(a, b) {

  // simple case - if there is no fill and
  // no stroke then there is nothing to do.
  var startIndex = 0;
  var endIndex = 0;

  if (!doFill && !doStroke) {
    return;
  }
  // if the wireframe is not going to be visible on top of the
  // fill then don't draw it
  else if ((doFill && (currentStrokeSize === 0 || !doStroke || (currentStrokeSize <= 1 && !defaultNormalFill && !defaultNormalStroke && currentStrokeColor === currentFillColor && currentFillAlpha === 1 && currentStrokeAlpha === 1))) || (currentStrokeSize <= 1 && defaultNormalFill && defaultNormalStroke)) {
    //if (doStroke) console.log('smart optimisation, was supposed to do the stroke but not doing it!!');
    startIndex = 0;
    endIndex = 1;
  } else if (!doFill && doStroke) {
    startIndex = 1;
    endIndex = 2;
  } else {
    startIndex = 0;
    endIndex = 2;
  }
  console.log("si: " + startIndex + " endI: " + endIndex );
  if (a === undefined) {
    a = 1;
    b = 1;
  } else if (arguments.length === 1) {
    b = a;
  }

  var strokeTime = false;
  var colorToBeUsed;
  var alphaToBeUsed;
  var newRectCreated = false;

  // this is to run the code twice. This should be neater
  // and turned into a function call really.
  for (var fillAndStroke = startIndex; fillAndStroke < endIndex; fillAndStroke++) {
    if (fillAndStroke === 1) {
      strokeTime = true;
      colorToBeUsed = currentStrokeColor;
      alphaToBeUsed = currentStrokeAlpha;
    } else {
      colorToBeUsed = currentFillColor;
      alphaToBeUsed = currentFillAlpha;
    }
    var pooledRectangle = rectanglesPool[usedRectangles];
    if (pooledRectangle === undefined) {
      // each pooled rectangle contains a geometry,
      // a basic material and a lambert material.
      pooledRectangle = {
        basicMaterial: undefined,
        lambertMaterial: undefined,
        normalMaterial: undefined,
        // the first time we render a mesh we need to
        // render it with the material that takes the
        // bigger buffer space, otherwise the
        // more complicated materials won't show
        // up, see:
        // https://github.com/mrdoob/three.js/issues/1051
        // so we always need to create a normalmaterial
        // and render that material first, in case
        // the user will ever want to use it.
        // Another workaround would be to create a mesh
        // for each different type of material
        neverUsed: true,
        mesh: undefined
      };
      newRectCreated = true;
      rectanglesPool.push(pooledRectangle);
    }
    var applyDefaultNormalColor = false;
    if (!strokeTime) {
      if (defaultNormalFill) {
        applyDefaultNormalColor = true;
      } else {
        applyDefaultNormalColor = false;
      }
    } else {
      if (defaultNormalStroke) {
        applyDefaultNormalColor = true;
      } else {
        applyDefaultNormalColor = false;
      }
    }
    console.log("rect: default normal color: " + applyDefaultNormalColor);
    console.log("rect: alphaToBeUsed: " + alphaToBeUsed);
    if (pooledRectangle.neverUsed || (colorToBeUsed === angleColor || applyDefaultNormalColor)) {
      // the first time we render a mesh we need to
      // render it with the material that takes the
      // bigger buffer space, see:
      // https://github.com/mrdoob/three.js/issues/1051
      // Another workaround would be to create a mesh
      // for each different type of material
      pooledRectangle.neverUsed = false;
      if (pooledRectangle.normalMaterial === undefined) {
        console.log("creating normal material");
        pooledRectangle.normalMaterial = new THREE.MeshNormalMaterial({
          opacity: alphaToBeUsed,
          wireframe: strokeTime,
          wireframeLinewidth: currentStrokeSize
        });
      } else {
        pooledRectangle.normalMaterial.opacity = alphaToBeUsed;
        pooledRectangle.normalMaterial.wireframe = strokeTime;
        pooledRectangle.normalMaterial.doubleSided = true;
        pooledRectangle.normalMaterial.wireframeLinewidth = currentStrokeSize;
      }
      if (pooledRectangle.mesh === undefined) {
        pooledRectangle.mesh = new THREE.Mesh(planeGeometry, pooledRectangle.normalMaterial);
        pooledRectangle.startCountdown = SPINFRAMES;
      } else {
        console.log("associating normal material to existing mesh");
        pooledRectangle.mesh.material = pooledRectangle.normalMaterial;
      }
    } else if (!lightsAreOn) {
      console.log("rect: lights are not on");
      if (pooledRectangle.basicMaterial === undefined) {
        pooledRectangle.basicMaterial = new THREE.MeshBasicMaterial({
          color: colorToBeUsed,
          opacity: alphaToBeUsed,
          wireframe: strokeTime,
          wireframeLinewidth: currentStrokeSize
        });
      } else {
        pooledRectangle.basicMaterial.color.setHex(colorToBeUsed);
        pooledRectangle.basicMaterial.opacity = alphaToBeUsed;
        pooledRectangle.basicMaterial.wireframe = strokeTime;
        pooledRectangle.basicMaterial.doubleSided = true;
        pooledRectangle.basicMaterial.wireframeLinewidth = currentStrokeSize;
      }
      if (pooledRectangle.mesh === undefined) {
        pooledRectangle.mesh = new THREE.Mesh(planeGeometry, pooledRectangle.basicMaterial);
        pooledRectangle.startCountdown = SPINFRAMES;
      } else {
        pooledRectangle.mesh.material = pooledRectangle.basicMaterial;
      }

    }
    // lights are on
    else {
      console.log("rect: lights are on");
      if (pooledRectangle.lambertMaterial === undefined) {
        console.log("creating lambert:"+currentFillColor+" "+currentFillAlpha+" "+ambientColor+" "+reflectValue+" "+refractValue);
        pooledRectangle.lambertMaterial = new THREE.MeshLambertMaterial({
          color: colorToBeUsed,
          opacity: alphaToBeUsed,
          ambient: ambientColor,
          reflectivity: reflectValue,
          refractionRatio: refractValue,
          wireframe: strokeTime,
          wireframeLinewidth: currentStrokeSize
        });
      } else {
        pooledRectangle.lambertMaterial.color.setHex(colorToBeUsed);
        pooledRectangle.lambertMaterial.opacity = alphaToBeUsed;
        pooledRectangle.lambertMaterial.wireframe = strokeTime;
        pooledRectangle.lambertMaterial.wireframeLinewidth = currentStrokeSize;
        pooledRectangle.lambertMaterial.doubleSided = true;
        pooledRectangle.lambertMaterial.ambient.setHex(ambientColor);
        pooledRectangle.lambertMaterial.reflectivity = reflectValue;
        pooledRectangle.lambertMaterial.refractionRatio = refractValue;
      }
      if (pooledRectangle.mesh === undefined) {
        pooledRectangle.mesh = new THREE.Mesh(planeGeometry, pooledRectangle.lambertMaterial);
        pooledRectangle.startCountdown = SPINFRAMES;
      } else {
        pooledRectangle.mesh.material = pooledRectangle.lambertMaterial;
      }
    }

    if (resetTheSpinThingy) {
      pooledRectangle.startCountdown = SPINFRAMES;
      resetTheSpinThingy = false;
      doTheSpinThingy = true;
    }
    if (doTheSpinThingy) pooledRectangle.startCountdown--;
    if (pooledRectangle.startCountdown === -1) doTheSpinThingy = false;

    pooledRectangle.mesh.isLine = false;
    pooledRectangle.mesh.isRectangle = true;
    pooledRectangle.mesh.isBox = false;
    pooledRectangle.mesh.isCylinder = false;
    pooledRectangle.mesh.isAmbientLight = false;
    pooledRectangle.mesh.isPointLight = false;
    pooledRectangle.mesh.isSphere = 0;
    pooledRectangle.mesh.doubleSided = true;


    usedRectangles++;

    if (doTheSpinThingy && pooledRectangle.startCountdown > 0) {
      pushMatrix();
      rotate(pooledRectangle.startCountdown / 50);
      console.log(""+pooledRectangle.startCountdown);
    }

    pooledRectangle.mesh.matrixAutoUpdate = false;
    pooledRectangle.mesh.matrix.copy(worldMatrix);
    pooledRectangle.mesh.matrixWorldNeedsUpdate = true;

    if (doTheSpinThingy && pooledRectangle.startCountdown > 0) {
      popMatrix();
    }

    if (a !== 1 || b !== 1) {
      pooledRectangle.mesh.matrix.scale(new THREE.Vector3(a, b, 1));
    }

    if (newRectCreated) scene.add(pooledRectangle.mesh);

  }

}

ambientLight = function() {

  var colorToBeUsed;
  if (arguments[0] === undefined) {
    // empty arguments gives some sort
    // of grey ambient light.
    // black is too stark and white
    // doesn't show the effect with the
    // default white fill
    colorToBeUsed = color$1(125);
  } else {
    colorToBeUsed = color(arguments[0], arguments[1], arguments[2], arguments[3]);
  }

  var newLightCreated = false;
  lightsAreOn = true;
  defaultNormalFill = false;
  defaultNormalStroke = false;

  var pooledAmbientLight = ambientLightsPool[usedAmbientLights];
  if (pooledAmbientLight === undefined) {
    console.log('no ambientLight in pool, creating one');
    pooledAmbientLight = new THREE.AmbientLight(colorToBeUsed);
    newLightCreated = true;
    ambientLightsPool.push(pooledAmbientLight);
  } else {
    pooledAmbientLight.color.setHex(colorToBeUsed);
    console.log('existing ambientLight in pool, setting color: ' + pooledAmbientLight.color.r + ' ' + pooledAmbientLight.color.g + ' ' + pooledAmbientLight.color.b);
  }


  pooledAmbientLight.isLine = false;
  pooledAmbientLight.isRectangle = false;
  pooledAmbientLight.isBox = false;
  pooledAmbientLight.isCylinder = false;
  pooledAmbientLight.isAmbientLight = true;
  pooledAmbientLight.isPointLight = false;
  pooledAmbientLight.isSphere = 0;


  usedAmbientLights++;
  pooledAmbientLight.matrixAutoUpdate = false;
  pooledAmbientLight.matrix.copy(worldMatrix);
  pooledAmbientLight.matrixWorldNeedsUpdate = true;

  if (newLightCreated) scene.add(pooledAmbientLight);


}

var gradStack = [];
var defaultGradientColor1 = orange;
var defaultGradientColor2 = red;
var defaultGradientColor3 = black;
var whichDefaultBackground;

var pickRandomDefaultGradient = function() {
  if (whichDefaultBackground === undefined) {
    whichDefaultBackground = Math.floor(Math.random() * 5);
  } else {
    whichDefaultBackground = (whichDefaultBackground + 1) % 5;
  }

  if (whichDefaultBackground === 0) {
    defaultGradientColor1 = orange;
    defaultGradientColor2 = red;
    defaultGradientColor3 = black;
    $("#fakeStartingBlinkingCursor").css('color', 'white');
  } else if (whichDefaultBackground === 1) {
    defaultGradientColor1 = white;
    defaultGradientColor2 = khaki;
    defaultGradientColor3 = peachpuff;
    $("#fakeStartingBlinkingCursor").css('color', 'LightPink');
  } else if (whichDefaultBackground === 2) {
    defaultGradientColor1 = lightsteelblue;
    defaultGradientColor2 = lightcyan;
    defaultGradientColor3 = paleturquoise;
    $("#fakeStartingBlinkingCursor").css('color', 'CadetBlue');
  } else if (whichDefaultBackground === 3) {
    defaultGradientColor1 = silver;
    defaultGradientColor2 = lightgrey;
    defaultGradientColor3 = gainsboro;
    $("#fakeStartingBlinkingCursor").css('color', 'white');
  } else if (whichDefaultBackground === 4) {
    defaultGradientColor1 = color(155, 255, 155);
    defaultGradientColor2 = color(155, 255, 155);
    defaultGradientColor3 = color(155, 255, 155);
    $("#fakeStartingBlinkingCursor").css('color', 'DarkOliveGreen');
  }
}

resetGradientStack = function() {
  currentGradientStackValue = "";
  // we could be more efficient and
  // reuse the previous stack elements
  // but I don't think it matters here
  gradStack = [];

  //simpleGradient(color(70),color(30),color(0),1);
  simpleGradient(defaultGradientColor1, defaultGradientColor2, defaultGradientColor3);

}

background = function() {
  var a = color(arguments[0], arguments[1], arguments[2], arguments[3]);
  console.log("adding solid background to stack");
  //if (a===undefined) a = color(0);
  currentGradientStackValue = currentGradientStackValue + " null null null null " + a + " ";
  gradStack.push({
    gradStacka: undefined,
    gradStackb: undefined,
    gradStackc: undefined,
    gradStackd: undefined,
    solid: a
  });
}

simpleGradient = function(a, b, c, d) {
  currentGradientStackValue = currentGradientStackValue + " " + a + "" + b + "" + c + "" + d + "null ";
  gradStack.push({
    gradStacka: a,
    gradStackb: b,
    gradStackc: c,
    gradStackd: d,
    solid: null
  });

}

var simpleGradientUpdateIfChanged = function() {

    //alert('simpleGradientUpdateIfChanged curr '+currentGradientStackValue + " prev " +previousGradientStackValue );
    if ((currentGradientStackValue === previousGradientStackValue)) {
      return;
    } else {

      previousGradientStackValue = currentGradientStackValue;
      console.log('repainting background');
      var diagonal = Math.sqrt(Math.pow(scaledBackgroundWidth / 2, 2) + Math.pow(scaledBackgroundHeight / 2, 2));
      var radgrad;
      for (var scanningGradStack = 0; scanningGradStack < gradStack.length; scanningGradStack++) {

        if (gradStack[scanningGradStack].gradStacka !== undefined) {
          radgrad = backgroundSceneContext.createLinearGradient(scaledBackgroundWidth / 2, 0, scaledBackgroundWidth / 2, scaledBackgroundHeight);
          radgrad.addColorStop(0, color.toString(gradStack[scanningGradStack].gradStacka));
          radgrad.addColorStop(0.5, color.toString(gradStack[scanningGradStack].gradStackb));
          radgrad.addColorStop(1, color.toString(gradStack[scanningGradStack].gradStackc));

          backgroundSceneContext.globalAlpha = 1.0;
          backgroundSceneContext.fillStyle = radgrad;
          backgroundSceneContext.fillRect(0, 0, scaledBackgroundWidth, scaledBackgroundHeight);
        } else {
          console.log("solid background: "+ gradStack[scanningGradStack].solid);
          backgroundSceneContext.globalAlpha = 1.0;
          backgroundSceneContext.fillStyle = color.toString(gradStack[scanningGradStack].solid);
          backgroundSceneContext.fillRect(0, 0, scaledBackgroundWidth, scaledBackgroundHeight);
        }
      }
    }

  }


animationStyle = function(a) {
  // turns out when you type normal that the first two letters "no"
  // are sent as "false"
  if (a === false) return;
  if (a === undefined) return;
  animationStyleValue = a;
}


animationStyleUpdateIfChanged = function() {
  //alert("actual called " + a);
  if ((animationStyleValue !== previousanimationStyleValue)) {
    //alert("actual changed!");
  } else {
    //alert("no change");
    return;
  }

  previousanimationStyleValue = animationStyleValue;

  if (isWebGLUsed && animationStyleValue === motionBlur) {
    effectBlend.uniforms['mixRatio'].value = 0.7;
  } else if (!isWebGLUsed && animationStyleValue === motionBlur) {
    blendAmount = 0.6;
    //alert('motion blur canvas');
  }

  if (isWebGLUsed && animationStyleValue === paintOver) {
    effectBlend.uniforms['mixRatio'].value = 1;
  } else if (!isWebGLUsed && animationStyleValue === paintOver) {
    blendAmount = 1;
    //alert('paintOver canvas');
  }

  if (isWebGLUsed && animationStyleValue === normal) {
    effectBlend.uniforms['mixRatio'].value = 0;
  } else if (!isWebGLUsed && animationStyleValue === normal) {
    blendAmount = 0;
    //alert('normal canvas');
  }

}


box = function(a, b, c) {
  // simple case - if there is no fill and
  // no stroke then there is nothing to do.
  var startIndex = 0;
  var endIndex = 0;

  if (!doFill && !doStroke) {
    return;
  }
  // if the wireframe is not going to be visible on top of the
  // fill then don't draw it
  else if ((doFill && (currentStrokeSize === 0 || !doStroke || (currentStrokeSize <= 1 && !defaultNormalFill && !defaultNormalStroke && currentStrokeColor === currentFillColor && currentFillAlpha === 1 && currentStrokeAlpha === 1))) || (currentStrokeSize <= 1 && defaultNormalFill && defaultNormalStroke)) {
    //if (doStroke) console.log('smart optimisation, was supposed to do the stroke but not doing it!!');
    startIndex = 0;
    endIndex = 1;
  } else if (!doFill && doStroke) {
    startIndex = 1;
    endIndex = 2;
  } else {
    startIndex = 0;
    endIndex = 2;
  }
  console.log("si: " + startIndex + " endI: " + endIndex );
  if (a === undefined) {
    //alert('cube!')
    a = 1;
    b = 1;
    c = 1;
  } else if (arguments.length === 1) {
    b = a;
    c = a;
  }

  var strokeTime = false;
  var colorToBeUsed;
  var alphaToBeUsed;
  var newBoxCreated = false;


  // this is to run the code twice. This should be neater
  // and turned into a function call really.
  for (var fillAndStroke = startIndex; fillAndStroke < endIndex; fillAndStroke++) {
    if (fillAndStroke === 1) {
      strokeTime = true;
      colorToBeUsed = currentStrokeColor;
      alphaToBeUsed = currentStrokeAlpha;
    } else {
      colorToBeUsed = currentFillColor;
      alphaToBeUsed = currentFillAlpha;
    }
    var pooledBox = boxesPool[usedBoxes];
    if (pooledBox === undefined) {
      // each pooled box contains a geometry,
      // a basic material and a lambert material.
      pooledBox = {
        basicMaterial: undefined,
        lambertMaterial: undefined,
        normalMaterial: undefined,
        // the first time we render a mesh we need to
        // render it with the material that takes the
        // bigger buffer space, otherwise the
        // more complicated materials won't show
        // up, see:
        // https://github.com/mrdoob/three.js/issues/1051
        // so we always need to create a normalmaterial
        // and render that material first, in case
        // the user will ever want to use it.
        // Another workaround would be to create a mesh
        // for each different type of material
        neverUsed: true,
        mesh: undefined
      };
      newBoxCreated = true;
      boxesPool.push(pooledBox);
    }
    var applyDefaultNormalColor = false;
    if (!strokeTime) {
      if (defaultNormalFill) {
        applyDefaultNormalColor = true;
      } else {
        applyDefaultNormalColor = false;
      }
    } else {
      if (defaultNormalStroke) {
        applyDefaultNormalColor = true;
      } else {
        applyDefaultNormalColor = false;
      }
    }
    if (pooledBox.neverUsed || (colorToBeUsed === angleColor || applyDefaultNormalColor)) {
      // the first time we render a mesh we need to
      // render it with the material that takes the
      // bigger buffer space, see:
      // https://github.com/mrdoob/three.js/issues/1051
      // Another workaround would be to create a mesh
      // for each different type of material
      pooledBox.neverUsed = false;
      if (pooledBox.normalMaterial === undefined) {
        console.log("creating normal material");
        pooledBox.normalMaterial = new THREE.MeshNormalMaterial({
          opacity: alphaToBeUsed,
          wireframe: strokeTime,
          wireframeLinewidth: currentStrokeSize
        });
      } else {
        pooledBox.normalMaterial.opacity = alphaToBeUsed;
        pooledBox.normalMaterial.wireframe = strokeTime;
        pooledBox.normalMaterial.wireframeLinewidth = currentStrokeSize;
        pooledBox.normalMaterial.doubleSided = false;
      }
      if (pooledBox.mesh === undefined) {
        pooledBox.mesh = new THREE.Mesh(cubeGeometry, pooledBox.normalMaterial);
        pooledBox.startCountdown = SPINFRAMES;
      } else {
        console.log("associating normal material to existing mesh");
        pooledBox.mesh.material = pooledBox.normalMaterial;
      }
    } else if (!lightsAreOn) {
      if (pooledBox.basicMaterial === undefined) {
        pooledBox.basicMaterial = new THREE.MeshBasicMaterial({
          color: colorToBeUsed,
          opacity: alphaToBeUsed,
          wireframe: strokeTime,
          wireframeLinewidth: currentStrokeSize
        });
      } else {
        pooledBox.basicMaterial.color.setHex(colorToBeUsed);
        pooledBox.basicMaterial.opacity = alphaToBeUsed;
        pooledBox.basicMaterial.wireframe = strokeTime;
        pooledBox.basicMaterial.wireframeLinewidth = currentStrokeSize;
        pooledBox.basicMaterial.doubleSided = false;
      }
      if (pooledBox.mesh === undefined) {
        pooledBox.mesh = new THREE.Mesh(cubeGeometry, pooledBox.basicMaterial);
        pooledBox.startCountdown = SPINFRAMES;
      } else {
        pooledBox.mesh.material = pooledBox.basicMaterial;
      }

    }
    // lights are on
    else {
      if (pooledBox.lambertMaterial === undefined) {
        console.log("creating lambert:"+currentFillColor+" "+currentFillAlpha+" "+ambientColor+" "+reflectValue+" "+refractValue);
        pooledBox.lambertMaterial = new THREE.MeshLambertMaterial({
          color: colorToBeUsed,
          opacity: alphaToBeUsed,
          ambient: ambientColor,
          reflectivity: reflectValue,
          refractionRatio: refractValue,
          wireframe: strokeTime,
          wireframeLinewidth: currentStrokeSize
        });
      } else {
        pooledBox.lambertMaterial.color.setHex(colorToBeUsed);
        pooledBox.lambertMaterial.opacity = alphaToBeUsed;
        pooledBox.lambertMaterial.wireframe = strokeTime;
        pooledBox.lambertMaterial.wireframeLinewidth = currentStrokeSize;
        pooledBox.lambertMaterial.doubleSided = false;
        pooledBox.lambertMaterial.ambient.setHex(ambientColor);
        pooledBox.lambertMaterial.reflectivity = reflectValue;
        pooledBox.lambertMaterial.refractionRatio = refractValue;
      }
      if (pooledBox.mesh === undefined) {
        pooledBox.mesh = new THREE.Mesh(cubeGeometry, pooledBox.lambertMaterial);
        pooledBox.startCountdown = SPINFRAMES;
      } else {
        pooledBox.mesh.material = pooledBox.lambertMaterial;
      }
    }

    if (resetTheSpinThingy) {
      pooledBox.startCountdown = SPINFRAMES;
      resetTheSpinThingy = false;
      doTheSpinThingy = true;
    }
    if (doTheSpinThingy) pooledBox.startCountdown--;
    if (pooledBox.startCountdown === -1) doTheSpinThingy = false;

    pooledBox.mesh.isLine = false;
    pooledBox.mesh.isRectangle = false;
    pooledBox.mesh.isBox = true;
    pooledBox.mesh.isCylinder = false;
    pooledBox.mesh.isAmbientLight = false;
    pooledBox.mesh.isPointLight = false;
    pooledBox.mesh.isSphere = 0;
    pooledBox.mesh.doubleSided = false;


    usedBoxes++;

    if (doTheSpinThingy && pooledBox.startCountdown > 0) {
      pushMatrix();
      rotate(pooledBox.startCountdown / 50);
      console.log(""+pooledBox.startCountdown);
    }

    pooledBox.mesh.matrixAutoUpdate = false;
    pooledBox.mesh.matrix.copy(worldMatrix);
    pooledBox.mesh.matrixWorldNeedsUpdate = true;

    if (doTheSpinThingy && pooledBox.startCountdown > 0) {
      popMatrix();
    }

    // TODO: meshes should be built from geometries that are
    // ever so slight larger than the "fill" mesh so there
    // is no z-fighting...
    // constant 0.001 below is to avoid z-fighting
    if (a !== 1 || b !== 1 || c !== 1) {
      if (!strokeTime) pooledBox.mesh.matrix.scale(new THREE.Vector3(a, b, c));
      else pooledBox.mesh.matrix.scale(new THREE.Vector3(a + 0.001, b + 0.001, c + 0.001));
    }

    if (newBoxCreated) scene.add(pooledBox.mesh);
  }


}


peg = function(a, b, c) {
  // simple case - if there is no fill and
  // no stroke then there is nothing to do.
  var startIndex = 0;
  var endIndex = 0;

  if (!doFill && !doStroke) {
    return;
  }
  // if the wireframe is not going to be visible on top of the
  // fill then don't draw it
  else if ((doFill && (currentStrokeSize === 0 || !doStroke || (currentStrokeSize <= 1 && !defaultNormalFill && !defaultNormalStroke && currentStrokeColor === currentFillColor && currentFillAlpha === 1 && currentStrokeAlpha === 1))) || (currentStrokeSize <= 1 && defaultNormalFill && defaultNormalStroke)) {
    //if (doStroke) console.log('smart optimisation, was supposed to do the stroke but not doing it!!');
    startIndex = 0;
    endIndex = 1;
  } else if (!doFill && doStroke) {
    startIndex = 1;
    endIndex = 2;
  } else {
    startIndex = 0;
    endIndex = 2;
  }
  console.log("si: " + startIndex + " endI: " + endIndex );
  if (a === undefined) {
    //alert('cube!')
    a = 1;
    b = 1;
    c = 1;
  } else if (arguments.length === 1) {
    b = a;
    c = a;
  }

  var strokeTime = false;
  var colorToBeUsed;
  var alphaToBeUsed;
  var newCylinderCreated = false;


  // this is to run the code twice. This should be neater
  // and turned into a function call really.
  for (var fillAndStroke = startIndex; fillAndStroke < endIndex; fillAndStroke++) {
    if (fillAndStroke === 1) {
      strokeTime = true;
      colorToBeUsed = currentStrokeColor;
      alphaToBeUsed = currentStrokeAlpha;
    } else {
      colorToBeUsed = currentFillColor;
      alphaToBeUsed = currentFillAlpha;
    }
    var pooledCylinder = cylindersPool[usedCylinders];
    if (pooledCylinder === undefined) {
      // each pooled cylinder contains a geometry,
      // a basic material and a lambert material.
      pooledCylinder = {
        basicMaterial: undefined,
        lambertMaterial: undefined,
        normalMaterial: undefined,
        // the first time we render a mesh we need to
        // render it with the material that takes the
        // bigger buffer space, otherwise the
        // more complicated materials won't show
        // up, see:
        // https://github.com/mrdoob/three.js/issues/1051
        // so we always need to create a normalmaterial
        // and render that material first, in case
        // the user will ever want to use it.
        // Another workaround would be to create a mesh
        // for each different type of material
        neverUsed: true,
        mesh: undefined
      };
      newCylinderCreated = true;
      cylindersPool.push(pooledCylinder);
    }
    var applyDefaultNormalColor = false;
    if (!strokeTime) {
      if (defaultNormalFill) {
        applyDefaultNormalColor = true;
      } else {
        applyDefaultNormalColor = false;
      }
    } else {
      if (defaultNormalStroke) {
        applyDefaultNormalColor = true;
      } else {
        applyDefaultNormalColor = false;
      }
    }
    if (pooledCylinder.neverUsed || (colorToBeUsed === angleColor || applyDefaultNormalColor)) {
      // the first time we render a mesh we need to
      // render it with the material that takes the
      // bigger buffer space, see:
      // https://github.com/mrdoob/three.js/issues/1051
      // Another workaround would be to create a mesh
      // for each different type of material
      pooledCylinder.neverUsed = false;
      if (pooledCylinder.normalMaterial === undefined) {
        console.log("creating normal material");
        pooledCylinder.normalMaterial = new THREE.MeshNormalMaterial({
          opacity: alphaToBeUsed,
          wireframe: strokeTime,
          wireframeLinewidth: currentStrokeSize,
        });
      } else {
        pooledCylinder.normalMaterial.opacity = alphaToBeUsed;
        pooledCylinder.normalMaterial.wireframe = strokeTime;
        pooledCylinder.normalMaterial.wireframeLinewidth = currentStrokeSize;
        pooledCylinder.normalMaterial.doubleSided = false;
      }
      if (pooledCylinder.mesh === undefined) {
        pooledCylinder.mesh = new THREE.Mesh(cylinderGeometry, pooledCylinder.normalMaterial);
        pooledCylinder.startCountdown = SPINFRAMES;
      } else {
        console.log("associating normal material to existing mesh");
        pooledCylinder.mesh.material = pooledCylinder.normalMaterial;
      }
    } else if (!lightsAreOn) {
      if (pooledCylinder.basicMaterial === undefined) {
        pooledCylinder.basicMaterial = new THREE.MeshBasicMaterial({
          color: colorToBeUsed,
          opacity: alphaToBeUsed,
          wireframe: strokeTime,
          wireframeLinewidth: currentStrokeSize,
        });
      } else {
        pooledCylinder.basicMaterial.color.setHex(colorToBeUsed);
        pooledCylinder.basicMaterial.opacity = alphaToBeUsed;
        pooledCylinder.basicMaterial.wireframe = strokeTime;
        pooledCylinder.basicMaterial.wireframeLinewidth = currentStrokeSize;
        pooledCylinder.basicMaterial.doubleSided = false;
      }
      if (pooledCylinder.mesh === undefined) {
        pooledCylinder.mesh = new THREE.Mesh(cylinderGeometry, pooledCylinder.basicMaterial);
        pooledCylinder.startCountdown = SPINFRAMES;
      } else {
        pooledCylinder.mesh.material = pooledCylinder.basicMaterial;
      }

    }
    // lights are on
    else {
      if (pooledCylinder.lambertMaterial === undefined) {
        console.log("creating lambert:"+currentFillColor+" "+currentFillAlpha+" "+ambientColor+" "+reflectValue+" "+refractValue);
        pooledCylinder.lambertMaterial = new THREE.MeshLambertMaterial({
          color: colorToBeUsed,
          opacity: alphaToBeUsed,
          ambient: ambientColor,
          reflectivity: reflectValue,
          refractionRatio: refractValue,
          wireframe: strokeTime,
          wireframeLinewidth: currentStrokeSize,
        });
      } else {
        pooledCylinder.lambertMaterial.color.setHex(colorToBeUsed);
        pooledCylinder.lambertMaterial.opacity = alphaToBeUsed;
        pooledCylinder.lambertMaterial.wireframe = strokeTime;
        pooledCylinder.lambertMaterial.wireframeLinewidth = currentStrokeSize;
        pooledCylinder.lambertMaterial.doubleSided = false;
        pooledCylinder.lambertMaterial.ambient.setHex(ambientColor);
        pooledCylinder.lambertMaterial.reflectivity = reflectValue;
        pooledCylinder.lambertMaterial.refractionRatio = refractValue;
      }
      if (pooledCylinder.mesh === undefined) {
        pooledCylinder.mesh = new THREE.Mesh(cylinderGeometry, pooledCylinder.lambertMaterial);
        pooledCylinder.startCountdown = SPINFRAMES;
      } else {
        pooledCylinder.mesh.material = pooledCylinder.lambertMaterial;
      }
    }

    if (resetTheSpinThingy) {
      pooledCylinder.startCountdown = SPINFRAMES;
      resetTheSpinThingy = false;
      doTheSpinThingy = true;
    }
    if (doTheSpinThingy) pooledCylinder.startCountdown--;
    if (pooledCylinder.startCountdown === -1) doTheSpinThingy = false;

    pooledCylinder.mesh.isLine = false;
    pooledCylinder.mesh.isRectangle = false;
    pooledCylinder.mesh.isBox = false;
    pooledCylinder.mesh.isCylinder = true;
    pooledCylinder.mesh.isAmbientLight = false;
    pooledCylinder.mesh.isPointLight = false;
    pooledCylinder.mesh.isSphere = 0;
    pooledCylinder.mesh.doubleSided = false;


    usedCylinders++;

    if (doTheSpinThingy && pooledCylinder.startCountdown > 0) {
      pushMatrix();
      rotate(pooledCylinder.startCountdown / 50);
      console.log(""+pooledCylinder.startCountdown);      
    }

    pooledCylinder.mesh.matrixAutoUpdate = false;
    pooledCylinder.mesh.matrix.copy(worldMatrix);
    pooledCylinder.mesh.matrixWorldNeedsUpdate = true;

    if (doTheSpinThingy && pooledCylinder.startCountdown > 0) {
      popMatrix();
    }

    // TODO: meshes should be built from geometries that are
    // ever so slight larger than the "fill" mesh so there
    // is no z-fighting...
    // constant 0.001 below is to avoid z-fighting
    if (a !== 1 || b !== 1 || c !== 1) {
      if (!strokeTime) pooledCylinder.mesh.matrix.scale(new THREE.Vector3(a, b, c));
      else pooledCylinder.mesh.matrix.scale(new THREE.Vector3(a + 0.001, b + 0.001, c + 0.001));
    }

    if (newCylinderCreated) scene.add(pooledCylinder.mesh);
  }


}


ballDetail = function(a) {
  if (a === undefined) return;
  if (a < 2) a = 2;
  if (a > 30) a = 30;
  ballDetLevel = a;
}

ball = function(a) {
  var pooledSphereGeometry;
  // simple case - if there is no fill and
  // no stroke then there is nothing to do.
  var startIndex = 0;
  var endIndex = 0;

  console.log("fill: "+doFill+" stroke: "+doStroke+" fillCol " + currentFillColor + " stroke col " + currentStrokeColor + " fill alpha " + currentFillAlpha);
  if (!doFill && !doStroke) {
    return;
  }
  // if the wireframe is not going to be visible on top of the
  // fill then don't draw it
  else if ((doFill && (currentStrokeSize === 0 || !doStroke || (currentStrokeSize <= 1 && !defaultNormalFill && !defaultNormalStroke && currentStrokeColor === currentFillColor && currentFillAlpha === 1 && currentStrokeAlpha === 1))) || (currentStrokeSize <= 1 && defaultNormalFill && defaultNormalStroke)) {
    //if (doStroke) console.log('smart optimisation, was supposed to do the stroke but not doing it!!');
    startIndex = 0;
    endIndex = 1;
  } else if (!doFill && doStroke) {
    startIndex = 1;
    endIndex = 2;
  } else {
    startIndex = 0;
    endIndex = 2;
  }
  console.log("si: " + startIndex + " endI: " + endIndex );
  if (a === undefined) {
    //alert('ball!')
    a = 1;
  }

  var strokeTime = false;
  var colorToBeUsed;
  var alphaToBeUsed;
  var newSphereCreated = false;


  // this is to run the code twice. This should be neater
  // and turned into a function call really.
  for (var fillAndStroke = startIndex; fillAndStroke < endIndex; fillAndStroke++) {
    if (fillAndStroke === 1) {
      strokeTime = true;
      colorToBeUsed = currentStrokeColor;
      alphaToBeUsed = currentStrokeAlpha;
    } else {
      colorToBeUsed = currentFillColor;
      alphaToBeUsed = currentFillAlpha;
    }
    if (spheresPool['' + ballDetLevel] === undefined) {
      spheresPool['' + ballDetLevel] = [];
      console.log('creating pool for ball det level ' + ballDetLevel);
    }
    if (usedSpheres['' + ballDetLevel] === undefined) {
      usedSpheres['' + ballDetLevel] = 0;
      console.log('creating counter for ball det level ' + ballDetLevel);
    }
    var pooledSphere = spheresPool['' + ballDetLevel][usedSpheres['' + ballDetLevel]];
    if (pooledSphere === undefined) {
      // each pooled sphere contains a geometry,
      // a basic material and a lambert material.
      pooledSphere = {
        basicMaterial: undefined,
        lambertMaterial: undefined,
        normalMaterial: undefined,
        // the first time we render a mesh we need to
        // render it with the material that takes the
        // bigger buffer space, otherwise the
        // more complicated materials won't show
        // up, see:
        // https://github.com/mrdoob/three.js/issues/1051
        // so we always need to create a normalmaterial
        // and render that material first, in case
        // the user will ever want to use it.
        // Another workaround would be to create a mesh
        // for each different type of material
        neverUsed: true,
        mesh: undefined
      };
      newSphereCreated = true;
      spheresPool['' + ballDetLevel].push(pooledSphere);
      console.log('making space for pool for sphere , size of pool for spheres of detail ' + ballDetLevel + ' is ' + spheresPool[''+ballDetLevel].length);
    }
    var applyDefaultNormalColor = false;
    if (!strokeTime) {
      if (defaultNormalFill) {
        applyDefaultNormalColor = true;
      } else {
        applyDefaultNormalColor = false;
      }
    } else {
      if (defaultNormalStroke) {
        applyDefaultNormalColor = true;
      } else {
        applyDefaultNormalColor = false;
      }
    }
    if (pooledSphere.neverUsed || (colorToBeUsed === angleColor || applyDefaultNormalColor)) {
      // the first time we render a mesh we need to
      // render it with the material that takes the
      // bigger buffer space, see:
      // https://github.com/mrdoob/three.js/issues/1051
      // Another workaround would be to create a mesh
      // for each different type of material
      pooledSphere.neverUsed = false;
      if (pooledSphere.normalMaterial === undefined) {
        console.log("creating normal material");
        pooledSphere.normalMaterial = new THREE.MeshNormalMaterial({
          opacity: alphaToBeUsed,
          wireframe: strokeTime,
          wireframeLinewidth: currentStrokeSize,
        });
      } else {
        pooledSphere.normalMaterial.opacity = alphaToBeUsed;
        pooledSphere.normalMaterial.wireframe = strokeTime;
        pooledSphere.normalMaterial.wireframeLinewidth = currentStrokeSize;
        pooledSphere.normalMaterial.doubleSided = false;
      }
      if (pooledSphere.mesh === undefined) {
        pooledSphereGeometry = sphereGeometriesPool['' + ballDetLevel];
        if (pooledSphereGeometry === undefined) {
          pooledSphereGeometry = new THREE.SphereGeometry(1, ballDetLevel, ballDetLevel);
          sphereGeometriesPool['' + ballDetLevel] = pooledSphereGeometry;
          console.log('creating ball geometry of detail ' + ballDetLevel);
        }
        pooledSphere.mesh = new THREE.Mesh(pooledSphereGeometry, pooledSphere.normalMaterial);
        pooledSphere.startCountdown = SPINFRAMES;
      } else {
        console.log("associating normal material to existing mesh");
        pooledSphere.mesh.material = pooledSphere.normalMaterial;
      }
    } else if (!lightsAreOn) {
      if (pooledSphere.basicMaterial === undefined) {
        pooledSphere.basicMaterial = new THREE.MeshBasicMaterial({
          color: colorToBeUsed,
          opacity: alphaToBeUsed,
          wireframe: strokeTime,
          wireframeLinewidth: currentStrokeSize,
        });
      } else {
        pooledSphere.basicMaterial.color.setHex(colorToBeUsed);
        pooledSphere.basicMaterial.opacity = alphaToBeUsed;
        pooledSphere.basicMaterial.wireframe = strokeTime;
        pooledSphere.basicMaterial.wireframeLinewidth = currentStrokeSize;
        pooledSphere.basicMaterial.doubleSided = false;
      }
      if (pooledSphere.mesh === undefined) {
        pooledSphereGeometry = sphereGeometriesPool['' + ballDetLevel];
        if (pooledSphereGeometry === undefined) {
          pooledSphereGeometry = new THREE.SphereGeometry(1, ballDetLevel, ballDetLevel);
          sphereGeometriesPool['' + ballDetLevel] = pooledSphereGeometry;
          console.log('creating ball geometry of detail ' + ballDetLevel);
        }
        pooledSphere.mesh = new THREE.Mesh(pooledSphereGeometry, pooledSphere.basicMaterial);
        pooledSphere.startCountdown = SPINFRAMES;
      } else {
        pooledSphere.mesh.material = pooledSphere.basicMaterial;
      }

    }
    // lights are on
    else {
      if (pooledSphere.lambertMaterial === undefined) {
        console.log("creating lambert:"+currentFillColor+" "+currentFillAlpha+" "+ambientColor+" "+reflectValue+" "+refractValue);
        pooledSphere.lambertMaterial = new THREE.MeshLambertMaterial({
          color: colorToBeUsed,
          opacity: alphaToBeUsed,
          ambient: ambientColor,
          reflectivity: reflectValue,
          refractionRatio: refractValue,
          wireframe: strokeTime,
          wireframeLinewidth: currentStrokeSize,
        });
      } else {
        pooledSphere.lambertMaterial.color.setHex(colorToBeUsed);
        pooledSphere.lambertMaterial.opacity = alphaToBeUsed;
        pooledSphere.lambertMaterial.wireframe = strokeTime;
        pooledSphere.lambertMaterial.wireframeLinewidth = currentStrokeSize;
        pooledSphere.lambertMaterial.doubleSided = false;
        pooledSphere.lambertMaterial.ambient.setHex(ambientColor);
        pooledSphere.lambertMaterial.reflectivity = reflectValue;
        pooledSphere.lambertMaterial.refractionRatio = refractValue;
      }
      if (pooledSphere.mesh === undefined) {
        pooledSphereGeometry = sphereGeometriesPool['' + ballDetLevel];
        if (pooledSphereGeometry === undefined) {
          pooledSphereGeometry = new THREE.SphereGeometry(1, ballDetLevel, ballDetLevel);
          sphereGeometriesPool['' + ballDetLevel] = pooledSphereGeometry;
          console.log('creating ball geometry of detail ' + ballDetLevel);
        }
        pooledSphere.mesh = new THREE.Mesh(pooledSphereGeometry, pooledSphere.lambertMaterial);
        pooledSphere.startCountdown = SPINFRAMES;
      } else {
        pooledSphere.mesh.material = pooledSphere.lambertMaterial;
      }
    }

    if (resetTheSpinThingy) {
      pooledSphere.startCountdown = SPINFRAMES;
      resetTheSpinThingy = false;
      doTheSpinThingy = true;
    }
    if (doTheSpinThingy) pooledSphere.startCountdown--;
    if (pooledSphere.startCountdown === -1) doTheSpinThingy = false;

    pooledSphere.mesh.isLine = false;
    pooledSphere.mesh.isRectangle = false;
    pooledSphere.mesh.isBox = false;
    pooledSphere.mesh.isCylinder = false;
    pooledSphere.mesh.isAmbientLight = false;
    pooledSphere.mesh.isPointLight = false;
    pooledSphere.mesh.isSphere = ballDetLevel;
    pooledSphere.mesh.doubleSided = false;


    usedSpheres['' + ballDetLevel] = usedSpheres['' + ballDetLevel] + 1;

    if (doTheSpinThingy && pooledSphere.startCountdown > 0) {
      pushMatrix();
      rotate(pooledSphere.startCountdown / 50);
      console.log(""+pooledSphere.startCountdown);
    }

    pooledSphere.mesh.matrixAutoUpdate = false;
    pooledSphere.mesh.matrix.copy(worldMatrix);
    pooledSphere.mesh.matrixWorldNeedsUpdate = true;

    if (doTheSpinThingy && pooledSphere.startCountdown > 0) {
      popMatrix();
    }

    // TODO: meshes should be built from geometries that are
    // ever so slight larger than the "fill" mesh so there
    // is no z-fighting...
    // constant 0.001 below is to avoid z-fighting
    if (a !== 1) {
      if (!strokeTime) pooledSphere.mesh.matrix.scale(new THREE.Vector3(a, a, a));
      else pooledSphere.mesh.matrix.scale(new THREE.Vector3(a + 0.001, a + 0.001, a + 0.001));
    }

    if (newSphereCreated) scene.add(pooledSphere.mesh);
  }


}



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


if (!frenchVersion) {

  var simpleCubeDemo = "" + "" + "// there you go!\n" + "" + "// a simple cube!\n" + "" + "\n" + "" + "background yellow\n" + "" + "rotate 0,time/2000,time/2000\n" + "" + "box";

  var webgltwocubesDemo = "" + "" + "background 155,255,255\n" + "" + "2 times ->\n" + "\t" + "rotate 0, 1, time/2000\n" + "\t" + "box";

  var cubesAndSpikes = "" + "" + "simpleGradient fuchsia,color(100,200,200),yellow\n" + "" + "scale 2.1\n" + "" + "5 times ->\n" + "\t" + "rotate 0,1,time/5000\n" + "\t" + "box 0.1,0.1,0.1\n" + "\t" + "move 0,0.1,0.1\n" + "\t" + "3 times ->\n" + "\t\t" + "rotate 0,1,1\n" + "\t\t" + "box 0.01,0.01,1";

  var webglturbineDemo = "" + "" + "background 155,55,255\n" + "" + "70 times ->\n" + "\t" + "rotate time/100000,1,time/100000\n" + "\t" + "box";

  var webglzfightartDemo = "" + "" + "// Explore the artifacts\n" + "" + "// of your GPU!\n" + "" + "// Go Z-fighting, go!\n" + "" + "scale 5\n" + "" + "rotate\n" + "" + "fill red\n" + "" + "box\n" + "" + "rotate 0.000001\n" + "" + "fill yellow\n" + "" + "box";

  var littleSpiralOfCubes = "" + "" + "background orange\n" + "" + "scale 0.1\n" + "" + "10 times ->\n" + "\t" + "rotate 0,1,time/1000\n" + "\t" + "move 1,1,1\n" + "\t" + "box";

  var tentacleDemo = "" + "" + "background 155,255,155\n" + "" + "scale 0.15\n" + "" + "3 times ->\n" + "\t" + "rotate 0,1,1\n" + "\t" + "10 times ->\n" + "\t\t" + "rotate 0,1,time/1000\n" + "\t\t" + "scale 0.9\n" + "\t\t" + "move 1,1,1\n" + "\t\t" + "box";

  var lampDemo = "" + "" + "animationStyle motionBlur\n" + "" + "simpleGradient red,yellow,color(255,0,255)\n" + "" + "//animationStyle paintOver\n" + "" + "scale 2\n" + "" + "rotate time/4000, time/4000,  time/4000\n" + "" + "90 times ->\n" + "\t" + "rotate time/200000, time/200000,  time/200000\n" + "\t" + "line\n" + "\t" + "move 0.5,0,0\n" + "\t" + "line\n" + "\t" + "move -0.5,0,0\n" + "\t" + "line\n" + "\t" + "line";

  var trillionfeathersDemo = "" + "" + "animationStyle paintOver\n" + "" + "move 2,0,0\n" + "" + "scale 2\n" + "" + "rotate\n" + "" + "20 times ->\n" + "\t" + "rotate\n" + "\t" + "move 0.25,0,0\n" + "\t" + "line\n" + "\t" + "move -0.5,0,0\n" + "\t" + "line";

  var monsterblobDemo = "" + "" + "ballDetail 6\n" + "" + "animationStyle motionBlur\n" + "" + "rotate time/5000\n" + "" + "simpleGradient fuchsia,aqua,yellow\n" + "" + "5 times ->\n" + "\t" + "rotate 0,1,time/5000\n" + "\t" + "move 0.2,0,0\n" + "\t" + "3 times ->\n" + "\t\t" + "rotate 1\n" + "\t\t" + "ball -1";

  var industrialMusicDemo = "" + "" + "bpm 350\n" + "" + "addSound 'alienBeep'  ,'zzxz zzzz zzxz zzzz'\n" + "" + "addSound 'beepC'  ,'zxzz zzzz xzzx xxxz'\n" + "" + "addSound 'beepA'  ,'zzxz zzzz zzxz zzzz'\n" + "" + "addSound 'lowFlash'  ,'zzxz zzzz zzzz zzzz'\n" + "" + "addSound 'beepB'  ,'xzzx zzzz zxzz zxzz'\n" + "" + "addSound 'voltage' ,'xzxz zxzz xzxx xzxx'\n" + "" + "addSound 'tranceKick' ,'zxzx zzzx xzzz zzxx'";

  var trySoundsDemo = "" + "" + "bpm 350\n" + "" + "// leave this one as base\n" + "" + "addSound 'tranceKick' ,'zxzx zzzx xzzz zzxx'\n" + "" + "\n" + "" + "// uncomment the sounds you want to try\n" + "" + "//addSound 'toc','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'highHatClosed','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'highHatOpen','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'toc2','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'toc3','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'toc4','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'snare','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'snare2','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'china','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'crash','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'crash2','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'crash3','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'ride','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'glass','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'glass1','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'glass2','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'glass3','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'thump','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'lowFlash','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'lowFlash2','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'tranceKick2','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'tranceKick','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'wosh','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'voltage','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'beepA','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'beepB','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'beepC','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'beepD','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'beep','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'hello','zzxz zzzz zzxz zzzz'\n" + "" + "//addSound 'alienBeep','zzxz zzzz zzxz zzzz'";

  var springysquaresDemo = "" + "" + "animationStyle motionBlur\n" + "" + "simpleGradient fuchsia,color(100,200,200),yellow\n" + "" + "scale 0.3\n" + "" + "3 times ->\n" + "\t" + "move 0,0,0.5\n" + "\t" + "5 times ->\n" + "\t\t" + "rotate time/2000\n" + "\t\t" + "move 0.7,0,0\n" + "\t\t" + "rect";

  var diceDemo = "" + "" + "animationStyle motionBlur\n" + "" + "simpleGradient color(255),moccasin,peachpuff\n" + "" + "stroke 255,100,100,255\n" + "" + "fill red,155\n" + "" + "move -0.5,0,0\n" + "" + "scale 0.3\n" + "" + "3 times ->\n" + "\t" + "move 0,0,0.5\n" + "\t" + "1 times ->\n" + "\t\t" + "rotate time/1000\n" + "\t\t" + "move 2,0,0\n" + "\t\t" + "box";

  var webglalmostvoronoiDemo = "" + "" + "scale 10\n" + "" + "2 times ->\n" + "\t" + "rotate 0,1,time/10000\n" + "\t" + "ball -1";

  var webglshardsDemo = "" + "" + "scale 10\n" + "" + "fill 0\n" + "" + "strokeSize 7\n" + "" + "5 times ->\n" + "\t" + "rotate 0,1,time/20000\n" + "\t" + "ball \n" + "\t" + "rotate 0,1,1\n" + "\t" + "ball -1.01";

  var webglredthreadsDemo = "" + "" + "scale 10.5\n" + "" + "background black\n" + "" + "stroke red\n" + "" + "noFill\n" + "" + "strokeSize 7\n" + "" + "5 times ->\n" + "\t" + "rotate time/20000\n" + "\t" + "ball\n" + "\t" + "rotate 0,1,1\n" + "\t" + "ball";

  var webglnuclearOctopusDemo = "" + "" + "simpleGradient black,color(0,0,(time/5)%255),black\n" + "" + "scale 0.2\n" + "" + "move 5,0,0\n" + "" + "animationStyle motionBlur\n" + "" + "//animationStyle paintOver\n" + "" + "stroke 255,0,0,120\n" + "" + "fill time%255,0,0\n" + "" + "pushMatrix\n" + "" + "count = 0\n" + "" + "3 times ->\n" + "\t" + "count++\n" + "\t" + "pushMatrix\n" + "\t" + "rotate count+3+time/1000,2+count + time/1000,4+count\n" + "\t" + "120 times ->\n" + "\t\t" + "scale 0.9\n" + "\t\t" + "move 1,1,0\n" + "\t\t" + "rotate time/100\n" + "\t\t" + "box\n" + "\t" + "popMatrix";
} else {
  // French demos **********************************

  var simpleCubeDemo = "" + "" + "// there you go!\n" + "" + "// a simple cube!\n" + "" + "\n" + "" + "fond jaune\n" + "" + "tourne 0,temps/2000,temps/2000\n" + "" + "boite";

  var webgltwocubesDemo = "" + "" + "fond 155,255,255\n" + "" + "2 fois ->\n" + "\t" + "tourne 0, 1, temps/2000\n" + "\t" + "boite";

  var cubesAndSpikes = "" + "" + "dégradéSimple fuchsia,couleur(100,200,200),jaune\n" + "" + "taille 2.1\n" + "" + "5 fois ->\n" + "\t" + "tourne 0,1,temps/5000\n" + "\t" + "boite 0.1,0.1,0.1\n" + "\t" + "deplace 0,0.1,0.1\n" + "\t" + "3 fois ->\n" + "\t\t" + "tourne 0,1,1\n" + "\t\t" + "boite 0.01,0.01,1";

  var webglturbineDemo = "" + "" + "fond 155,55,255\n" + "" + "70 fois ->\n" + "\t" + "tourne temps/100000,1,temps/100000\n" + "\t" + "boite";

  var webglzfightartDemo = "" + "" + "// Explore the artifacts\n" + "" + "// of your GPU!\n" + "" + "// Go Z-fighting, go!\n" + "" + "taille 5\n" + "" + "tourne\n" + "" + "remplissage rouge\n" + "" + "boite\n" + "" + "tourne 0.000001\n" + "" + "remplissage jaune\n" + "" + "boite";

  var littleSpiralOfCubes = "" + "" + "fond orange\n" + "" + "taille 0.1\n" + "" + "10 fois ->\n" + "\t" + "tourne 0,1,temps/1000\n" + "\t" + "deplace 1,1,1\n" + "\t" + "boite";

  var tentacleDemo = "" + "" + "fond 155,255,155\n" + "" + "taille 0.15\n" + "" + "3 fois ->\n" + "\t" + "tourne 0,1,1\n" + "\t" + "10 fois ->\n" + "\t\t" + "tourne 0,1,temps/1000\n" + "\t\t" + "taille 0.9\n" + "\t\t" + "deplace 1,1,1\n" + "\t\t" + "boite";

  var lampDemo = "" + "" + "styleAnimation flouMouvement\n" + "" + "dégradéSimple rouge,jaune,couleur(255,0,255)\n" + "" + "//styleAnimation peindreAuDessus\n" + "" + "taille 2\n" + "" + "tourne temps/4000, temps/4000,  temps/4000\n" + "" + "90 fois ->\n" + "\t" + "tourne temps/200000, temps/200000,  temps/200000\n" + "\t" + "ligne\n" + "\t" + "deplace 0.5,0,0\n" + "\t" + "ligne\n" + "\t" + "deplace -0.5,0,0\n" + "\t" + "ligne\n" + "\t" + "ligne";

  var trillionfeathersDemo = "" + "" + "styleAnimation peindreAuDessus\n" + "" + "deplace 2,0,0\n" + "" + "taille 2\n" + "" + "tourne\n" + "" + "20 fois ->\n" + "\t" + "tourne\n" + "\t" + "deplace 0.25,0,0\n" + "\t" + "ligne\n" + "\t" + "deplace -0.5,0,0\n" + "\t" + "ligne";

  var monsterblobDemo = "" + "" + "balleDetail 6\n" + "" + "styleAnimation flouMouvement\n" + "" + "tourne temps/5000\n" + "" + "dégradéSimple fuchsia,aqua,jaune\n" + "" + "5 fois ->\n" + "\t" + "tourne 0,1,temps/5000\n" + "\t" + "deplace 0.2,0,0\n" + "\t" + "3 fois ->\n" + "\t\t" + "tourne 1\n" + "\t\t" + "balle -1";

  var industrialMusicDemo = "" + "" + "bpm 350\n" + "" + "ajouteSon 'alienBeep'  ,'zzxz zzzz zzxz zzzz'\n" + "" + "ajouteSon 'beepC'  ,'zxzz zzzz xzzx xxxz'\n" + "" + "ajouteSon 'beepA'  ,'zzxz zzzz zzxz zzzz'\n" + "" + "ajouteSon 'lowFlash'  ,'zzxz zzzz zzzz zzzz'\n" + "" + "ajouteSon 'beepB'  ,'xzzx zzzz zxzz zxzz'\n" + "" + "ajouteSon 'voltage' ,'xzxz zxzz xzxx xzxx'\n" + "" + "ajouteSon 'tranceKick' ,'zxzx zzzx xzzz zzxx'";

  var trySoundsDemo = "" + "" + "bpm 350\n" + "" + "// leave this one as base\n" + "" + "ajouteSon 'tranceKick' ,'zxzx zzzx xzzz zzxx'\n" + "" + "\n" + "" + "// uncomment the sounds you want to try\n" + "" + "//ajouteSon 'toc','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'highHatClosed','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'highHatOpen','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'toc2','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'toc3','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'toc4','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'snare','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'snare2','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'china','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'crash','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'crash2','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'crash3','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'ride','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'glass','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'glass1','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'glass2','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'glass3','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'thump','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'lowFlash','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'lowFlash2','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'tranceKick2','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'tranceKick','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'wosh','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'voltage','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'beepA','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'beepB','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'beepC','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'beepD','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'beep','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'hello','zzxz zzzz zzxz zzzz'\n" + "" + "//ajouteSon 'alienBeep','zzxz zzzz zzxz zzzz'";

  var springysquaresDemo = "" + "" + "styleAnimation flouMouvement\n" + "" + "dégradéSimple fuchsia,couleur(100,200,200),jaune\n" + "" + "taille 0.3\n" + "" + "3 fois ->\n" + "\t" + "deplace 0,0,0.5\n" + "\t" + "5 fois ->\n" + "\t\t" + "tourne temps/2000\n" + "\t\t" + "deplace 0.7,0,0\n" + "\t\t" + "rect";

  var diceDemo = "" + "" + "styleAnimation flouMouvement\n" + "" + "dégradéSimple couleur(255),moccasin,peche\n" + "" + "trait 255,100,100,255\n" + "" + "remplissage rouge,155\n" + "" + "deplace -0.5,0,0\n" + "" + "taille 0.3\n" + "" + "3 fois ->\n" + "\t" + "deplace 0,0,0.5\n" + "\t" + "1 fois ->\n" + "\t\t" + "tourne temps/1000\n" + "\t\t" + "deplace 2,0,0\n" + "\t\t" + "boite";

  var webglalmostvoronoiDemo = "" + "" + "taille 10\n" + "" + "2 fois ->\n" + "\t" + "tourne 0,1,temps/10000\n" + "\t" + "balle -1";

  var webglshardsDemo = "" + "" + "taille 10\n" + "" + "remplissage 0\n" + "" + "traitSize 7\n" + "" + "5 fois ->\n" + "\t" + "tourne 0,1,temps/20000\n" + "\t" + "balle \n" + "\t" + "tourne 0,1,1\n" + "\t" + "balle -1.01";

  var webglredthreadsDemo = "" + "" + "taille 10.5\n" + "" + "fond noir\n" + "" + "trait rouge\n" + "" + "sansRemplissage\n" + "" + "traitSize 7\n" + "" + "5 fois ->\n" + "\t" + "tourne temps/20000\n" + "\t" + "balle\n" + "\t" + "tourne 0,1,1\n" + "\t" + "balle";

  var webglnuclearOctopusDemo = "" + "" + "dégradéSimple noir,couleur(0,0,(temps/5)%255),noir\n" + "" + "taille 0.2\n" + "" + "deplace 5,0,0\n" + "" + "styleAnimation flouMouvement\n" + "" + "//styleAnimation peindreAuDessus\n" + "" + "trait 255,0,0,120\n" + "" + "remplissage temps%255,0,0\n" + "" + "sauveMatrice\n" + "" + "count = 0\n" + "" + "3 fois ->\n" + "\t" + "count++\n" + "\t" + "sauveMatrice\n" + "\t" + "tourne count+3+temps/1000,2+count + temps/1000,4+count\n" + "\t" + "120 fois ->\n" + "\t\t" + "taille 0.9\n" + "\t\t" + "deplace 1,1,0\n" + "\t\t" + "tourne temps/100\n" + "\t\t" + "boite\n" + "\t" + "restaureMatrice";

  //*********************************************
}

if (!frenchVersion) {

  var introTutorial = "" + "" + "// Lines beginning with two\n" + "" + "// slashes (like these) are just comments.\n" + "" + '// Everything else is run\n' + "" + '// about 30 to 60 times per second\n' + "" + '// in order to create an animation.\n' + "" + "\n" + "" + "// Click the link below to start the tutorial.\n" + "" + "// next-tutorial:hello_world";

  var helloworldTutorial = "" + "" + "// type these three letters\n" + "" + "// in one of these empty lines below:\n" + "" + '// "b" and "o" and "x"\n' + "" + "\n" + "" + "\n" + "" + "\n" + "" + "// (you should then see a box facing you)\n" + "" + "// click below for the next tutorial\n" + "" + "// next-tutorial:some_notes";

  var somenotesTutorial = "" + "" + "// If this makes sense to you:\n" + "" + "// the syntax is similar to Coffeescript\n" + "" + '// and the commands are almost\n' + "" + '// like Processing.\n' + "" + "\n" + "" + "// If this doesn't make sense to you\n" + "" + "// don't worry.\n" + "" + "// next-tutorial:rotate";

  var rotateTutorial = "" + "" + "// now that we have a box\n" + "" + "// let's rotate it:\n" + "" + '// type "rotate 1" in the\n' + "" + '// line before the "box"\n' + "" + "\n" + "" + "\n" + "" + "box\n" + "" + "\n" + "" + "// click for the next tutorial:\n" + "" + "// next-tutorial:frame";

  var frameTutorial = "" + "" + "// make the box spin\n" + "" + '// by replacing "1" with "frame"\n' + "" + "\n" + "" + "rotate 1\n" + "" + "box\n" + "" + "\n" + "" + '// "frame" contains a number\n' + "" + "// always incrementing as\n" + "" + "// the screen is re-drawn.\n" + "" + '// (use "frame/100" to slow it down)\n' + "" + "// next-tutorial:time";

  var timeTutorial = "" + "" + '// "frame/100" has one problem:\n' + "" + '// faster computers will make\n' + "" + '// the cube spin too fast.\n' + "" + '// Replace it with "time/2000".\n' + "" + "\n" + "" + "rotate frame/100\n" + "" + "box\n" + "" + "\n" + "" + '// "time" counts the\n' + "" + "// number of milliseconds since\n" + "" + "// the program started, so it's\n" + "" + "// independent of how fast\n" + "" + "// the computer is at drawing.\n" + "" + "// next-tutorial:move";

  var moveTutorial = "" + "" + "// you can move any object\n" + "" + '// by using "move"\n' + "" + "\n" + "" + "box\n" + "" + "move 1,1,0\n" + "" + "box\n" + "" + "\n" + "" + '// try to use a rotate before \n' + "" + "// the first box to see how the\n" + "" + "// scene changes.\n" + "" + "// next-tutorial:scale";

  var scaleTutorial = "" + "" + "// you can make an object bigger\n" + "" + '// or smaller by using "scale"\n' + "" + "\n" + "" + "rotate 3\n" + "" + "box\n" + "" + "move 1\n" + "" + "scale 2\n" + "" + "box\n" + "" + "\n" + "" + '// try to use a rotate before \n' + "" + "// the first box to see how the\n" + "" + "// scene changes.\n" + "" + "// next-tutorial:times";

  var timesTutorial = "" + "" + '// "times" (not to be confused with\n' + "" + '// "time"!) can be used to\n' + "" + '// repeat operations like so:\n' + "" + "\n" + "" + "rotate 1\n" + "" + "3 times ->\n" + "\t" + "move 0.2,0.2,0.2\n" + "\t" + "box\n" + "" + "\n" + "" + '// note how the tabs indicate \n' + "" + "// exactly the block of code\n" + "" + "// to be repeated.\n" + "" + "// next-tutorial:fill";

  var fillTutorial = "" + "" + '// "fill" changes the\n' + "" + '// color of all the faces:\n' + "" + "\n" + "" + "fill 255,255,0\n" + "" + "box\n" + "" + "\n" + "" + '// the three numbers indicate \n' + "" + "// red green and blue values.\n" + "" + "// You can also use color names such as indigo\n" + "" + "// Try replacing the numbers with\n" + "" + '// "angleColor"\n' + "" + "// next-tutorial:stroke";

  var strokeTutorial = "" + "" + '// "stroke" changes all the\n' + "" + '// edges:\n' + "" + "\n" + "" + "rotate 1\n" + "" + "strokeSize 5\n" + "" + "stroke 255,255,255\n" + "" + "box\n" + "" + "\n" + "" + '// the three numbers are RGB\n' + "" + "// but you can also use the color names\n" + "" + '// or the special color "angleColor"\n' + "" + '// Also you can use "strokeSize"\n' + "" + '// to specify the thickness.\n' + "" + "// next-tutorial:color_names";

  var colornamesTutorial = "" + "" + '// you can call colors by name\n' + "" + '// try to un-comment one line:\n' + "" + "\n" + "" + "//fill greenyellow\n" + "" + "//fill indigo\n" + "" + "//fill lemonchiffon // whaaaat?\n" + "" + "rotate 1\n" + "" + "box\n" + "" + "\n" + "" + '// more color names here:\n' + "" + '// http://html-color-codes.info/color-names/\n' + "" + '// (just use them in lower case)\n' + "" + "// next-tutorial:lights";


  var lightsTutorial = "" + "" + '// "ambientLight" creates an\n' + "" + '// ambient light so things have\n' + "" + '// some sort of shading:\n' + "" + "\n" + "" + "ambientLight 0,255,255\n" + "" + "rotate time/1000\n" + "" + "box\n" + "" + "\n" + "" + '// you can turn that light on and \n' + "" + "// off while you build the scene\n" + "" + '// by using "lights" and "noLights"\n' + "" + "// next-tutorial:background";

  var backgroundTutorial = "" + "" + '// "background" creates a\n' + "" + '// solid background:\n' + "" + "\n" + "" + "background 0,0,255\n" + "" + "rotate time/1000\n" + "" + "box\n" + "" + "\n" + "" + "// next-tutorial:gradient";

  var gradientTutorial = "" + "" + '// even nicer, you can paint a\n' + "" + '// background gradient:\n' + "" + "\n" + "" + "simpleGradient color(190,10,10),color(30,90,100),color(0)\n" + "" + "rotate time/1000\n" + "" + "box\n" + "" + "\n" + "" + "// next-tutorial:line";

  var lineTutorial = "" + "" + '// draw lines like this:\n' + "" + "\n" + "" + "20 times ->\n" + "\t" + "rotate time/9000\n" + "\t" + "line\n" + "" + "\n" + "" + "// next-tutorial:ball";

  var ballTutorial = "" + "" + '// draw balls like this:\n' + "" + "\n" + "" + "ballDetail 10\n" + "" + "3 times ->\n" + "\t" + "move 0.2,0.2,0.2\n" + "\t" + "ball\n" + "" + "\n" + "" + '// ("ballDetail" is optional)\n' + "" + "// next-tutorial:pushpopMatrix";

  var pushpopMatrixTutorial = "" + "" + '// pushMatrix creates a bookmark of\n' + "" + '// the position, which you can\n' + "" + '// return to later by using popMatrix.\n' + "" + '// You can reset using "resetMatrix".\n' + "" + "\n" + "" + "rotate time/1000\n" + "" + 'pushMatrix // bookmark the position after the rotation\n' + "" + "line\n" + "" + "move 0.5,0,0\n" + "" + "line\n" + "" + "popMatrix // go back to the bookmarked position\n" + "" + "move -0.5,0,0\n" + "" + "line\n" + "" + "resetMatrix // resets the position\n" + "" + "line // not affected by initial rotation\n" + "" + "// next-tutorial:animation_style";

  var animationstyleTutorial = "" + "" + '// try uncommenting either line\n' + "" + '// with the animationStyle\n' + "" + "\n" + "" + "background 255\n" + "" + "//animationStyle motionBlur\n" + "" + "//animationStyle paintOver\n" + "" + "rotate frame/10\n" + "" + "box\n" + "" + "\n" + "" + "// next-tutorial:do_once";

  var doonceTutorial = "" + "" + '// delete either check mark below\n' + "" + "\n" + "" + "rotate time/1000\n" + "" + "✓doOnce ->\n" + "\t" + "background 255\n" + "\t" + "fill 255,0,0\n" + "" + "✓doOnce -> ball\n" + "" + "box\n" + "" + "\n" + "" + '// ...the line or block of code\n' + "" + '// are ran one time only, after that the\n' + "" + '// check marks immediately re-appear\n' + "" + '// P.S. keep hitting the delete button\n' + "" + '// on that first check mark for seizures.\n' + "" + "// next-tutorial:autocode";

  var autocodeTutorial = "" + "" + '// the Autocode button invents random\n' + "" + '// variations for you.\n' + "" + '\n' + "" + '// You can interrupt the Autocoder at\n' + "" + '// any time by pressing the button again,\n' + "" + '// or you can press CTRL-Z\n' + "" + '// (or CMD-Z on Macs) to undo (or re-do) some of\n' + "" + '// the steps even WHILE the autocoder is running,\n' + "" + '// if you see that things got\n' + "" + '// boring down a particular path of changes.';
} else {

  // ***************************** French tutorials
  var introTutorial = "" + "" + "// Les lignes qui commencent avec deux slashes\n" + "" + "// (comme celle-ci) sont des commentaires.\n" + "" + '// Tout le reste est lancé\n' + "" + '// entre 30 et 60 fois par seconde\n' + "" + '// pour créer une animation\n' + "" + "\n" + "" + "// Cliquez sur le lien ci-dessous pour démarrer le tutorial.\n" + "" + "// next-tutorial:hello_world";

  var helloworldTutorial = "" + "" + "// Tapez ces cinq lettres\n" + "" + "// sur une des lignes vides\n" + "" + '// b, o, i, t, e\n' + "" + "\n" + "" + "\n" + "" + "\n" + "" + "// (vous devriez voir une belle boite apparaître)\n" + "" + "// cliquez pour le prochain tutorial :\n" + "" + "// next-tutorial:some_notes";

  var somenotesTutorial = "" + "" + "// Au cas où cela vous dit quelque chose :\n" + "" + "// la syntaxe est similaire à Coffeescript\n" + "" + '// et les commandes sont presque\n' + "" + '// comme Processing.\n' + "" + "\n" + "" + "// Si cela ne veut rien dire pour vous\n" + "" + "// pas de soucis.\n" + "" + "// next-tutorial:rotate";

  var rotateTutorial = "" + "" + "// Maintenant nous avons une boite\n" + "" + "// faisons la tourner:\n" + "" + '// tapez "tourne 1" sur la ligne\n' + "" + '// au dessus de "boite"\n' + "" + "\n" + "" + "\n" + "" + "boite\n" + "" + "\n" + "" + "// cliquez pour le prochain tutorial :\n" + "" + "// next-tutorial:frame";

  var frameTutorial = "" + "" + "// faites tourner la boite\n" + "" + '// en remplaçant "1" par "image"\n' + "" + "\n" + "" + "tourne 1\n" + "" + "boite\n" + "" + "\n" + "" + '// "image" contient un nombre\n' + "" + "// qui s’incrémente au fur et à mesure\n" + "" + "// que l’écran est re-dessiné.\n" + "" + '// (utilisez "image/100" pour la ralentir)\n' + "" + "// next-tutorial:time";

  var timeTutorial = "" + "" + '// "image/100" a un problème :\n' + "" + '// les ordinateurs rapides vont faire\n' + "" + '// tourner le cube trop vite.\n' + "" + '// Remplacez le par "temps/2000".\n' + "" + "\n" + "" + "tourne image/100\n" + "" + "boite\n" + "" + "\n" + "" + '// "temps" compte le nombre de millisecondes\n' + "" + "// depuis que le programme  a démarré,\n" + "" + "// il est donc indépendent de la vitesse\n" + "" + "// à laquelle l’ordinateur dessine les images.\n" + "" + "// next-tutorial:move";

  var moveTutorial = "" + "" + "// vous pouvez déplacer n’importe quel objet\n" + "" + '// en utilisant "deplace"\n' + "" + "\n" + "" + "boite\n" + "" + "deplace 1,1,0\n" + "" + "boite\n" + "" + "\n" + "" + '// essayez d’utiliser tourne\n' + "" + "// avant la première boite pour voir\n" + "" + "// comment la scène change.\n" + "" + "// next-tutorial:scale";

  var scaleTutorial = "" + "" + "// vous pouvez changer la taille des objets\n" + "" + '// en utilisant "taille"\n' + "" + "\n" + "" + "tourne 3\n" + "" + "boite\n" + "" + "deplace 1\n" + "" + "taille 2\n" + "" + "boite\n" + "" + "\n" + "" + '// essayez d’utiliser tourne\n' + "" + "// avant la première boite pour voir\n" + "" + "// comment la scène change..\n" + "" + "// next-tutorial:times";

  var timesTutorial = "" + "" + '// "fois" peut-être utilisé\n' + "" + '// pour répéter des opérations :\n' + "" + "\n" + "" + "tourne 1\n" + "" + "3 fois ->\n" + "\t" + "deplace 0.2,0.2,0.2\n" + "\t" + "boite\n" + "" + "\n" + "" + '// notez comme les tabulations indiquent \n' + "" + "// exactement le bloc de code\n" + "" + "// qui doit être répété.\n" + "" + "// next-tutorial:fill";

  var fillTutorial = "" + "" + '// "remplissage" défini la\n' + "" + '// couleur de toutes les faces :\n' + "" + "\n" + "" + "remplissage 255,255,0\n" + "" + "boite\n" + "" + "\n" + "" + '// les trois nombres indiquent\n' + "" + "// les valeurs de rouge, vert et bleu.\n" + "" + "// Vous pouvez aussi utiliser\n" + "" + "// des noms de couleur comme indigo\n" + "" + "// Essayez de remplacer les nombres avec\n" + "" + '// "couleurAngle"\n' + "" + "// next-tutorial:stroke";

  var strokeTutorial = "" + "" + '// "trait" change la couleur\n' + "" + '// des arrêtes :\n' + "" + "\n" + "" + "tourne 1\n" + "" + "tailleTrait 5\n" + "" + "trait 255,255,255\n" + "" + "boite\n" + "" + "\n" + "" + '// les trois nombres sont les valeurs RVB\n' + "" + "// mais vous pouvez utiliser les noms des couleurs,\n" + "" + '// ou la couleur spéciale  "couleurAngle"\n' + "" + '// Vous pouvez aussi utiliser "tailleTrait"\n' + "" + '// pour préciser l’épaisseur.\n' + "" + "// next-tutorial:color_names";

  var colornamesTutorial = "" + "" + '// vous pouvez indiquer les couleurs par nom\n' + "" + '// essayer de dé-commenter une ligne :\n' + "" + "\n" + "" + "//remplissage rouge\n" + "" + "//remplissage vert\n" + "" + "//remplissage pêche\n" + "" + "tourne 1\n" + "" + "boite\n" + "" + "\n" + "" + '// plus de noms de couleurs ici :\n' + "" + '// http://html-color-codes.info/color-names/\n' + "" + '// (utilisez en minuscule, pas de majuscules)\n' + "" + "// next-tutorial:lights";


  var lightsTutorial = "" + "" + '// "eclairageAmbiant" créé un\n' + "" + '// éclairage ambiant de sorte que les objets\n' + "" + '// ont une sorte de d’ombrage:\n' + "" + "\n" + "" + "eclairageAmbiant 0,255,255\n" + "" + "tourne temps/1000\n" + "" + "boite\n" + "" + "\n" + "" + '// vous pouvez éteindre ou allumer cet éclairage\n' + "" + "// pendant que vous construisez la scène" + "" + '// en utilisant "eclairage" et "sansEclairage"\n' + "" + "// next-tutorial:background";

  var backgroundTutorial = "" + "" + '// "fond" créé un\n' + "" + '// fond de couleur :\n' + "" + "\n" + "" + "fond 0,0,255\n" + "" + "tourne temps/1000\n" + "" + "boite\n" + "" + "\n" + "" + "// next-tutorial:gradient";

  var gradientTutorial = "" + "" + '// encore plus sympa, vous pouvez\n' + "" + '// créér un fond en dégradé:\n' + "" + "\n" + "" + "degradeSimple couleur(190,10,10),couleur(30,90,100),couleur(0)\n" + "" + "tourne temps/1000\n" + "" + "boite\n" + "" + "\n" + "" + "// next-tutorial:line";

  var lineTutorial = "" + "" + '// dessinez des lignes comme ceci :\n' + "" + "\n" + "" + "20 fois ->\n" + "\t" + "tourne temps/9000\n" + "\t" + "ligne\n" + "" + "\n" + "" + "// next-tutorial:ball";

  var ballTutorial = "" + "" + '// dessinez des balles comme ceci :\n' + "" + "\n" + "" + "balleDetail 10\n" + "" + "3 fois ->\n" + "\t" + "deplace 0.2,0.2,0.2\n" + "\t" + "balle\n" + "" + "\n" + "" + '// ("balleDetail" est optionnel)\n' + "" + "// next-tutorial:pushpopMatrix";

  var pushpopMatrixTutorial = "" + "" + '// sauveMatrice mémorise\n' + "" + '// la position, et vous pouvez\n' + "" + '// y revenir plus tard avec restaureMatrice.\n' + "" + '// Vous pouvez revenir à zéro avec "effaceMatrice".\n' + "" + "\n" + "" + "tourne temps/1000\n" + "" + 'sauveMatrice // mémorise la position après la rotation\n' + "" + "ligne\n" + "" + "deplace 0.5,0,0\n" + "" + "ligne\n" + "" + "restaureMatrice // revient à la position mémorisée\n" + "" + "deplace -0.5,0,0\n" + "" + "ligne\n" + "" + "effaceMatrice // remets la position à zéro\n" + "" + "ligne // cette ligne n’est donc pas affecté par la rotation\n" + "" + "// next-tutorial:animation_style";

  var animationstyleTutorial = "" + "" + '// essayez de dé-commenter l’une ou l’autre\n' + "" + '// des deux lignes  avec styleAnimation\n' + "" + "\n" + "" + "fond 255\n" + "" + "//styleAnimation flouMouvement\n" + "" + "//styleAnimation peindreAudessus\n" + "" + "tourne image/10\n" + "" + "boite\n" + "" + "\n" + "" + "// next-tutorial:do_once";

  var doonceTutorial = "" + "" + '// effacez l’une ou l’autre des coches\n' + "" + "\n" + "" + "tourne temps/1000\n" + "" + "✓uneFois ->\n" + "\t" + "fond 255\n" + "\t" + "remplissage 255,0,0\n" + "" + "✓uneFois -> balle\n" + "" + "boite\n" + "" + "\n" + "" + '// …la ligne ou le bloc de code\n' + "" + '// n’est exécuté qu’une seule fois, et après cela\n' + "" + '// la coche réapparait immédiattement\n' + "" + '// P.S. continuez de supprimer la première coche\n' + "" + '// en continu pour provoquer un évanouissement :-)\n' + "" + "// next-tutorial:autocode";

  var autocodeTutorial = "" + "" + '// le bouton Autocode invente pour vous\n' + "" + '// des variations aléatoires du code.\n' + "" + '\n' + "" + '// vous pouvez arrêter Autocode\n' + "" + '// à tout moment en ré-appuyant sur le bouton\n' + "" + '// ou vous pouvez faire CTRL-Z\n' + "" + '// (CMD-Z sur Mac) pour annuler (or rétablir) certainesn' + "" + '// des étapes y compris PENDANT que Autocode est actif\n' + "" + '// si par exemple vous trouvez que les choses\n' + "" + '// deviennent ennuyeuse dans la direction prise par Autocode.';

}
var autocodeOn = false;
var blinkingAutocoderTimeout;
var blinkingAutocoderStatus = false;
var dimcodeOn = false;


function blinkAutocodeIndicator() {
  blinkingAutocoderStatus = !blinkingAutocoderStatus;
  if (blinkingAutocoderStatus) {
    $("#autocodeIndicatorContainer").css("background-color", '');
  } else {
    $("#autocodeIndicatorContainer").css("background-color", '#FF0000');
    mutate();
  }
}

function toggleAutocode() {
  autocodeOn = !autocodeOn;

  if (!autocodeOn) {
    if (frenchVersion) {
      $("#autocodeIndicator").html("Autocode: inactif");
    } else {
      $("#autocodeIndicator").html("Autocode: off");
    }
    clearInterval(blinkingAutocoderTimeout);
    $("#autocodeIndicatorContainer").css("background-color", '');
  } else {
    if (frenchVersion) {
      $("#autocodeIndicator").html("Autocode: actif");
    } else {
      $("#autocodeIndicator").html("Autocode: on");
    }
    blinkingAutocoderTimeout = setInterval('blinkAutocodeIndicator();', 500);
    $("#autocodeIndicatorContainer").css("background-color", '#FF0000');
    if (editor.getValue() === '' || (
    (window.location.hash.indexOf("bookmark") !== -1) && (window.location.hash.indexOf("autocodeTutorial") !== -1))

    ) loadDemoOrTutorial('cubesAndSpikes');
  }
}


function mutate() {
  var whichMutation = Math.floor(Math.random() * 5);
  if (whichMutation === 0) replaceAFloat();
  else if (whichMutation == 1) replaceAnInteger();
  else if (whichMutation == 2) replaceABoxWithABall();
  else if (whichMutation == 3) replaceABallWithABox();
  //else if (whichMutation == 4)
  //replacetimeWithAConstant();
}

function replaceAFloat() {
  var editorContent = editor.getValue();
  var rePattern = /([-+]?[0-9]*\.[0-9]+)/gi;

  var allMatches = editorContent.match(rePattern);
  if (allMatches === null) numberOfResults = 0;
  else numberOfResults = allMatches.length;
  whichOneToChange = Math.floor(Math.random() * numberOfResults) + 1;

  var countWhichOneToSwap = 0;
  editorContent = editorContent.replace(rePattern, function(match, text, urlId) {
    countWhichOneToSwap++;
    if (countWhichOneToSwap === whichOneToChange) {
      var whichOp = Math.floor(Math.random() * 12);
      if (whichOp === 0) return parseFloat(match) * 2;
      else if (whichOp == 1) return parseFloat(match) / 2;
      else if (whichOp == 2) return parseFloat(match) + 1;
      else if (whichOp == 3) return parseFloat(match) - 1;
      else if (whichOp == 4) return parseFloat(match) * 5;
      else if (whichOp == 5) return parseFloat(match) / 5;
      else if (whichOp == 6) return parseFloat(match) + 0.1;
      else if (whichOp == 7) return parseFloat(match) - 0.1;
      else if (whichOp == 8) return parseFloat(match) + 0.5;
      else if (whichOp == 9) return parseFloat(match) - 0.5;
      else if (whichOp == 10) return Math.floor(parseFloat(match));
      else if (whichOp == 11) if (!frenchVersion) {
        return 'time/1000';
      } else {
        return 'temps/1000';
      }
    }
    return match;
  });
  editor.setValue(editorContent);
}

function replaceABoxWithABall() {
  var editorContent = editor.getValue();
  var rePattern;
  if (!frenchVersion) {
    rePattern = /(box)/gi;
  } else {
    rePattern = /(boite)/gi;
  }

  var allMatches = editorContent.match(rePattern);
  if (allMatches === null) numberOfResults = 0;
  else numberOfResults = allMatches.length;
  whichOneToChange = Math.floor(Math.random() * numberOfResults) + 1;

  var countWhichOneToSwap = 0;
  editorContent = editorContent.replace(rePattern, function(match, text, urlId) {
    countWhichOneToSwap++;
    if (countWhichOneToSwap === whichOneToChange) {
      if (!frenchVersion) {
        return "ball";
      } else {
        return "balle";
      }
    }
    return match;
  });
  editor.setValue(editorContent);
}

function replaceTimeWithAConstant() {
  var editorContent = editor.getValue();
  var rePattern;
  if (!frenchVersion) {
    rePattern = /(time)/gi;
  } else {
    rePattern = /(temps)/gi;
  }

  var allMatches = editorContent.match(rePattern);
  if (allMatches === null) numberOfResults = 0;
  else numberOfResults = allMatches.length;
  whichOneToChange = Math.floor(Math.random() * numberOfResults) + 1;

  var countWhichOneToSwap = 0;
  editorContent = editorContent.replace(rePattern, function(match, text, urlId) {
    countWhichOneToSwap++;
    if (countWhichOneToSwap === whichOneToChange) {
      return '' + Math.floor(Math.random() * 20) + 1;
    }
    return match;
  });
  editor.setValue(editorContent);
}

function replaceABallWithABox() {
  var editorContent = editor.getValue();
  var rePattern;
  if (!frenchVersion) {
    rePattern = /(ball)/gi;
  } else {
    rePattern = /(balle)/gi;
  }

  var allMatches = editorContent.match(rePattern);
  if (allMatches === null) numberOfResults = 0;
  else numberOfResults = allMatches.length;
  whichOneToChange = Math.floor(Math.random() * numberOfResults) + 1;

  var countWhichOneToSwap = 0;
  editorContent = editorContent.replace(rePattern, function(match, text, urlId) {
    countWhichOneToSwap++;
    if (countWhichOneToSwap === whichOneToChange) {
      if (!frenchVersion) {
        return "box";
      } else {
        return "boite";
      }
    }
    return match;
  });
  editor.setValue(editorContent);
}

function replaceAnInteger() {
  var editorContent = editor.getValue();
  var rePattern = /([-+]?[0-9]+)/gi;

  var allMatches = editorContent.match(rePattern);
  if (allMatches === null) numberOfResults = 0;
  else numberOfResults = allMatches.length;
  whichOneToChange = Math.floor(Math.random() * numberOfResults) + 1;

  var countWhichOneToSwap = 0;
  editorContent = editorContent.replace(rePattern, function(match, text, urlId) {
    countWhichOneToSwap++;
    if (countWhichOneToSwap === whichOneToChange) {
      var whichOp = Math.floor(Math.random() * 7);
      if (whichOp === 0) return Math.floor(parseFloat(match) * 2);
      else if (whichOp == 1) return Math.floor(parseFloat(match) / 2);
      else if (whichOp == 2) return Math.floor(parseFloat(match) + 1);
      else if (whichOp == 3) return Math.floor(parseFloat(match) - 1);
      else if (whichOp == 4) return Math.floor(parseFloat(match) * 5);
      else if (whichOp == 5) return Math.floor(parseFloat(match) / 5);
      else if (whichOp == 6) if (!frenchVersion) {
        return 'Math.floor(1+time/1000)';
      } else {
        return 'Math.floor(1+temps/1000)';
      }
    }
    return match;
  });
  editor.setValue(editorContent);

}

function triggerReset() {
  pickRandomDefaultGradient();
  if (autocodeOn) toggleAutocode();
  editor.setValue('');
  $("#resetButtonContainer").css("background-color", '#FF0000');
  setTimeout('$("#resetButtonContainer").css("background-color","");', 200);
}

function loadDemoOrTutorial(whichDemo) {

  if ((!Detector.webgl || forceCanvasRenderer) && !userWarnedAboutWebglExamples && whichDemo.indexOf('webgl') === 0) {
    userWarnedAboutWebglExamples = true;
    $('#exampleNeedsWebgl').modal();
    $('#simplemodal-container').height(200);
  }


  // set the demo as a hash state
  // so that ideally people can link directly to
  // a specific demo they like.
  // (in the document.ready function we check for
  // this hash value and load the correct demo)
  window.location.hash = 'bookmark=' + whichDemo;

  if (fakeText) shrinkFakeText();
  undimEditor();

  doTheSpinThingy = false;

  var prependMessage = "";
  if ((!Detector.webgl || forceCanvasRenderer) && whichDemo.indexOf('webgl') === 0) {
    prependMessage = "" + "// this drawing makes much more sense\n" + "// in a WebGL-enabled browser\n" + "\n";
  }

  switch (whichDemo) {
  case 'simpleCubeDemo':
    editor.setValue(prependMessage + simpleCubeDemo);
    break;
  case 'webgltwocubesDemo':
    editor.setValue(prependMessage + webgltwocubesDemo);
    break;
  case 'cubesAndSpikes':
    editor.setValue(prependMessage + cubesAndSpikes);
    break;
  case 'webglturbineDemo':
    editor.setValue(prependMessage + webglturbineDemo);
    break;
  case 'webglzfightartDemo':
    editor.setValue(prependMessage + webglzfightartDemo);
    break;
  case 'littleSpiralOfCubes':
    editor.setValue(prependMessage + littleSpiralOfCubes);
    break;
  case 'tentacleDemo':
    editor.setValue(prependMessage + tentacleDemo);
    break;
  case 'lampDemo':
    editor.setValue(prependMessage + lampDemo);
    break;
  case 'trillionfeathersDemo':
    editor.setValue(prependMessage + trillionfeathersDemo);
    break;
  case 'monsterblobDemo':
    editor.setValue(prependMessage + monsterblobDemo);
    break;
  case 'industrialMusicDemo':
    editor.setValue(prependMessage + industrialMusicDemo);
    break;
  case 'trySoundsDemo':
    editor.setValue(prependMessage + trySoundsDemo);
    break;
  case 'springysquaresDemo':
    editor.setValue(prependMessage + springysquaresDemo);
    break;
  case 'diceDemo':
    editor.setValue(prependMessage + diceDemo);
    break;
  case 'webglalmostvoronoiDemo':
    editor.setValue(prependMessage + webglalmostvoronoiDemo);
    break;
  case 'webglshardsDemo':
    editor.setValue(prependMessage + webglshardsDemo);
    break;
  case 'webglredthreadsDemo':
    editor.setValue(prependMessage + webglredthreadsDemo);
    break;
  case 'webglnuclearOctopusDemo':
    editor.setValue(prependMessage + webglnuclearOctopusDemo);
    break;
  case 'introTutorial':
    editor.setValue(prependMessage + introTutorial);
    break;
  case 'helloworldTutorial':
    editor.setValue(prependMessage + helloworldTutorial);
    break;
  case 'somenotesTutorial':
    editor.setValue(prependMessage + somenotesTutorial);
    break;
  case 'rotateTutorial':
    editor.setValue(prependMessage + rotateTutorial);
    break;
  case 'frameTutorial':
    editor.setValue(prependMessage + frameTutorial);
    break;
  case 'timeTutorial':
    editor.setValue(prependMessage + timeTutorial);
    break;
  case 'moveTutorial':
    editor.setValue(prependMessage + moveTutorial);
    break;
  case 'scaleTutorial':
    editor.setValue(prependMessage + scaleTutorial);
    break;
  case 'timesTutorial':
    editor.setValue(prependMessage + timesTutorial);
    break;
  case 'fillTutorial':
    editor.setValue(prependMessage + fillTutorial);
    break;
  case 'strokeTutorial':
    editor.setValue(prependMessage + strokeTutorial);
    break;
  case 'colornamesTutorial':
    editor.setValue(prependMessage + colornamesTutorial);
    break;
  case 'lightsTutorial':
    editor.setValue(prependMessage + lightsTutorial);
    break;
  case 'backgroundTutorial':
    editor.setValue(prependMessage + backgroundTutorial);
    break;
  case 'gradientTutorial':
    editor.setValue(prependMessage + gradientTutorial);
    break;
  case 'lineTutorial':
    editor.setValue(prependMessage + lineTutorial);
    break;
  case 'ballTutorial':
    editor.setValue(prependMessage + ballTutorial);
    break;
  case 'pushpopMatrixTutorial':
    editor.setValue(prependMessage + pushpopMatrixTutorial);
    break;
  case 'animationstyleTutorial':
    editor.setValue(prependMessage + animationstyleTutorial);
    break;
  case 'doonceTutorial':
    editor.setValue(prependMessage + doonceTutorial);
    break;
  case 'autocodeTutorial':
    editor.setValue(prependMessage + autocodeTutorial);
    break;

    // bring the cursor to the top
  editor.setCursor(0, 0);
  }

  // setting the value of the editor triggers the
  // codeMirror onChange callback, and that runs
  // the demo.
}


var changesHappened = false;

var cursorActivity = true;

function selectTheme(node) {
  var theme = node.options[node.selectedIndex].innerHTML;
  editor.setOption("theme", theme);
}

// resizing the text area is necessary otherwise
// as the user types to the end of it, instead of just scrolling
// the content leaving all the other parts of the page where
// they are, it expands and it pushes down
// the view of the page, meaning that the canvas goes up and
// the menu disappears
// so we have to resize it at launch and also every time the window
// is resized.

function adjustCodeMirrorHeight() {
  //alert("code height:" + $('#code').height());
  //alert("window height:" + window.innerHeight);
  //alert("code height:" + $('.CodeMirror-scroll').css('height'));
  //alert("menu height:" + $('#theMenu').height());
  $('.CodeMirror-scroll').css('height', window.innerHeight - $('#theMenu').height());
}

var fakeCursorInterval;

function fakeCursorBlinking() {
  $("#fakeStartingBlinkingCursor").animate({
    opacity: 0.2
  }, "fast", "swing").animate({
    opacity: 1
  }, "fast", "swing");
}

///////////// START OF MOUSEWHEEL HANDLER CODE
// I couldn't quote get the exact Javascript plugin below to
// work in its original form, so I only took the
// "calculation" routine.


function wheel(event) {

  /*! Copyright (c) 2011 Brandon Aaron (http://brandonaaron.net)
   * Licensed under the MIT License (LICENSE.txt).
   *
   * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
   * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
   * Thanks to: Seamus Leahy for adding deltaX and deltaY
   *
   * Version: 3.0.6
   *
   * Requires: 1.2.2+
   */

  var orgEvent = event || window.event,
    args = [].slice.call(arguments, 1),
    delta = 0,
    returnValue = true,
    deltaX = 0,
    deltaY = 0;
  event = $.event.fix(orgEvent);
  event.type = "mousewheel";

  // Old school scrollwheel delta
  if (orgEvent.wheelDelta) {
    delta = orgEvent.wheelDelta / 120;
  }
  if (orgEvent.detail) {
    delta = -orgEvent.detail / 3;
  }

  // New school multidimensional scroll (touchpads) deltas
  deltaY = delta;

  // Gecko
  if (orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS) {
    deltaY = 0;
    deltaX = -1 * delta;
  }

  // Webkit
  if (orgEvent.wheelDeltaY !== undefined) {
    deltaY = orgEvent.wheelDeltaY / 120;
  }
  if (orgEvent.wheelDeltaX !== undefined) {
    deltaX = -1 * orgEvent.wheelDeltaX / 120;
  }

  console.log(""+deltaX+" "+deltaY);
  if (deltaY > 0.2) {
    var cursorPositio = editor.getCursor(true);
    // this is to prevent that when the cursor reaches the
    // last line, then it goes to the END of the line
    // we avoid that because of a nasty workaround
    // where we check whether the cursor is in the
    // first few characters of the line to avoid
    // following a "next-tutorial" link.
    console.log(cursorPositio.line+" "+editor.lineCount())
    if (cursorPositio.line !== editor.lineCount() - 1) {
      editor.setCursor(cursorPositio.line + 1, cursorPositio.ch);
    }
  } else if (deltaY < -0.2) {
    var cursorPositio = editor.getCursor(true);
    editor.setCursor(cursorPositio.line - 1, cursorPositio.ch);
  }
}

/* Initialization code. */
if (window.addEventListener) window.addEventListener('DOMMouseScroll', wheel, false);
window.onmousewheel = document.onmousewheel = wheel;

///////////// END OF MOUSEWHEEL HANDLER CODE
// this function is called when the cursor moves
// and we handle this in two ways
// 1) we suspend the dimming countdown
// 2) we undim the editor if it is dimmed
// 3) we check whether the user moved the cursor over a link


function suspendDimmingAndCheckIfLink() {

  // Now this is kind of a nasty hack: we check where the
  // cursor is, and if it's over a line containing the
  // link then we follow it.
  // There was no better way, for some reason some onClick
  // events are lost, so what happened is that one would click on
  // the link and nothing would happen.
  var cursorP = editor.getCursor(true);
  if (cursorP.ch > 2) {
    var currentLineContent = editor.getLine(cursorP.line);
    if (currentLineContent.indexOf('// next-tutorial:') === 0) {
      currentLineContent = currentLineContent.substring(17);
      currentLineContent = currentLineContent.replace("_", "");
      //alert(""+url);
      setTimeout('loadDemoOrTutorial("' + currentLineContent + 'Tutorial");', 200);
    }
  }

  if (fakeText || editor.getValue() === '') return;
  console.log('cursor activity! opacity: ' + $("#formCode").css('opacity'));
  cursorActivity = true;
  undimEditor();
}

function undimEditor() {
  if (fakeText || editor.getValue() === '') $("#formCode").css('opacity', 0);
  if ($("#formCode").css('opacity') < 0.99) {
    console.log('undimming the editor');
    $("#formCode").animate({
      opacity: 1
    }, "fast");
  }
}

// Now that there is a manual switch to toggle it off and on
// the dimming goes to full INvisibility
// see toggleDimCode() 
// not sure about that, want to try it on people -- julien 

function dimEditor() {
  // TODO there is a chance that the animation library
  // doesn't bring the opacity completely to zero
  // but rather to a value close to it.
  // Make the animation step to print something
  // just to make sure that this is not the case.
  if ($("#formCode").css('opacity') > 0) {
    console.log('starting fadeout animation');
    $("#formCode").animate({
      opacity: 0
    }, "slow");
  }
}

function dimIfNoCursorActivity() {
  if (fakeText || editor.getValue() === '') return;
  if (cursorActivity) {
    console.log('marking cursor activity = false. Will check again in the next interval');
    cursorActivity = false;
    return;
  } else {
    console.log('no activity in the last interval. Dimming now, starting opacity is: ' + $("#formCode").css('opacity') );
    dimEditor();
  }
}


// a function to toggle code diming on and off -- julien 

function toggleDimCode() {
  dimcodeOn = !dimcodeOn;

  if (!dimcodeOn) {
    clearInterval(dimIntervalID);
    undimEditor();
    if (frenchVersion) {
      $("#dimCodeIndicator").html("Code Caché: inactif");
    } else {
      $("#dimCodeIndicator").html("Hide Code: off");
    }

  } else {
    // we restart a setInterval
    dimIntervalID = setInterval("dimIfNoCursorActivity()", 5000);
    if (frenchVersion) {
      $("#dimCodeIndicator").html("Code Caché: actif");
    } else {
      $("#dimCodeIndicator").html("Hide Code: on");
    }

  }
}




///////////////////////////////////////////////

function fullscreenify(canvas) {
  var style = canvas.getAttribute('style') || '';
  //alert('style: ' +  style);
  window.addEventListener('resize', function() {
    adjustCodeMirrorHeight();
    resize(canvas);
  }, false);

  resize(canvas);

  function resize(canvas) {
    var scale = {
      x: 1,
      y: 1
    };
    scale.x = (window.innerWidth + 40) / canvas.width;
    scale.y = (window.innerHeight + 40) / canvas.height;

    scale = scale.x + ', ' + scale.y;

    // this code below is if one wants to keep the aspect ratio
    // but I mean one doesn't necessarily resize the window
    // keeping the same aspect ratio.
    /*
        if (scale.x < 1 || scale.y < 1) {
            scale = '1, 1';
        } else if (scale.x < scale.y) {
            scale = scale.x + ', ' + scale.x;
        } else {
            scale = scale.y + ', ' + scale.y;
        }
        */

    canvas.setAttribute('style', style + ' ' + '-ms-transform-origin: left top; -webkit-transform-origin: left top; -moz-transform-origin: left top; -o-transform-origin: left top; transform-origin: left top; -ms-transform: scale(' + scale + '); -webkit-transform: scale3d(' + scale + ', 1); -moz-transform: scale(' + scale + '); -o-transform: scale(' + scale + '); transform: scale(' + scale + ');');

    // TODO In theory we want to re-draw the background because the
    // aspect ration might have changed.
    // But for the time being we only have vertical
    // gradients so that's not going to be a problem.
  }
}