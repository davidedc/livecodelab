/*
## Simple helper to handle the code dimming. When to trigger dimming and un-dimming and
## keeping track of status of the dedicated "automatic dimming" toggle switch.
*/

var EditorDimmer;

EditorDimmer = (function() {
  "use strict";  EditorDimmer.prototype.cursorActivity = true;

  EditorDimmer.prototype.dimIntervalID = void 0;

  EditorDimmer.prototype.dimCodeOn = false;

  function EditorDimmer(eventRouter, bigCursor) {
    this.eventRouter = eventRouter;
    this.bigCursor = bigCursor;
  }

  EditorDimmer.prototype.undimEditor = function() {
    if (!this.bigCursor.isShowing) {
      if ($("#formCode").css("opacity") < 0.99) {
        return $("#formCode").animate({
          opacity: 1
        }, "fast");
      }
    }
  };

  EditorDimmer.prototype.dimEditor = function() {
    if ($("#formCode").css("opacity") > 0) {
      return $("#formCode").animate({
        opacity: 0
      }, "slow");
    }
  };

  EditorDimmer.prototype.dimIfNoCursorActivity = function() {
    if (this.cursorActivity) {
      return this.cursorActivity = false;
    } else {
      return this.dimEditor();
    }
  };

  EditorDimmer.prototype.toggleDimCode = function(dimmingActive) {
    var _this = this;

    if (dimmingActive === undefined) {
      this.dimCodeOn = !this.dimCodeOn;
    } else {
      this.dimCodeOn = dimmingActive;
    }
    if (this.dimCodeOn) {
      this.dimIntervalID = setInterval((function() {
        return _this.dimIfNoCursorActivity();
      }), 5000);
    } else {
      clearInterval(this.dimIntervalID);
      this.undimEditor();
    }
    return this.eventRouter.trigger("auto-hide-code-button-pressed", this.dimCodeOn);
  };

  return EditorDimmer;

})();
