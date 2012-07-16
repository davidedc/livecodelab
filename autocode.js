// this is where the Autocode functions go

var autocodeOn = false;
var blinkingAutocoderTimeout;
var blinkingAutocoderStatus = false;
var numberOfResults = 0;
var whichOneToChange = 0;

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