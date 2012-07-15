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
  log('cursor activity! opacity: ' + $("#formCode").css('opacity'));
  cursorActivity = true;
  undimEditor();
}

function undimEditor() {
  if (fakeText || editor.getValue() === '') $("#formCode").css('opacity', 0);
  if ($("#formCode").css('opacity') < 0.99) {
    log('undimming the editor');
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
    log('starting fadeout animation');
    $("#formCode").animate({
      opacity: 0
    }, "slow");
  }
}

function dimIfNoCursorActivity() {
  if (fakeText || editor.getValue() === '') return;
  if (cursorActivity) {
    log('marking cursor activity = false. Will check again in the next interval');
    cursorActivity = false;
    return;
  } else {
    log('no activity in the last interval. Dimming now, starting opacity is: ' + $("#formCode").css('opacity') );
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