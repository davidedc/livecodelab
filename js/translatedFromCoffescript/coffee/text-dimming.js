var createEditorDimmer;

createEditorDimmer = function(eventRouter, bigCursor) {
  "use strict";

  var EditorDimmer, cursorActivity, dimCodeOn, dimIntervalID;
  cursorActivity = true;
  dimIntervalID = void 0;
  EditorDimmer = {};
  dimCodeOn = false;
  EditorDimmer.undimEditor = function() {
    if (!bigCursor.isShowing) {
      if ($("#formCode").css("opacity") < 0.99) {
        return $("#formCode").animate({
          opacity: 1
        }, "fast");
      }
    }
  };
  EditorDimmer.dimEditor = function() {
    if ($("#formCode").css("opacity") > 0) {
      return $("#formCode").animate({
        opacity: 0
      }, "slow");
    }
  };
  EditorDimmer.dimIfNoCursorActivity = function() {
    if (cursorActivity) {
      return cursorActivity = false;
    } else {
      return EditorDimmer.dimEditor();
    }
  };
  EditorDimmer.toggleDimCode = function(dimmingActive) {
    if (dimmingActive === undefined) {
      dimCodeOn = !dimCodeOn;
    } else {
      dimCodeOn = dimmingActive;
    }
    if (dimCodeOn) {
      dimIntervalID = setInterval(EditorDimmer.dimIfNoCursorActivity, 5000);
    } else {
      clearInterval(dimIntervalID);
      EditorDimmer.undimEditor();
    }
    return eventRouter.trigger("auto-hide-code-button-pressed", dimCodeOn);
  };
  eventRouter.bind("editor-dim", EditorDimmer.dimEditor, EditorDimmer);
  eventRouter.bind("editor-undim", EditorDimmer.undimEditor, EditorDimmer);
  eventRouter.bind("editor-toggle-dim", EditorDimmer.toggleDimCode, EditorDimmer);
  return EditorDimmer;
};
