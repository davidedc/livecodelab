/*
## The big cursor that flashes when the environment is first opened. It's a special div
## which is actually not meant to contain text. It just shrinks/expands depending on
## whether the user types something (shrinks) or whether the program turns empty
## (expands).
*/

var BigCursor;

BigCursor = (function() {
  "use strict";  function BigCursor(eventRouter) {
    this.fakeCursorInterval = void 0;
    this.isShowing = true;
  }

  BigCursor.prototype.startBigCursorBlinkingAnimation = function() {
    return $("#fakeStartingBlinkingCursor").animate({
      opacity: 0.2
    }, "fast", "swing").animate({
      opacity: 1
    }, "fast", "swing");
  };

  BigCursor.prototype.toggleBlink = function(active) {
    if (active) {
      if (!this.fakeCursorInterval) {
        return this.fakeCursorInterval = setInterval(this.startBigCursorBlinkingAnimation, 800);
      }
    } else {
      clearTimeout(this.fakeCursorInterval);
      return this.fakeCursorInterval = null;
    }
  };

  BigCursor.prototype.shrinkBigCursor = function() {
    var currentCaption, shorterCaption;

    currentCaption = void 0;
    shorterCaption = void 0;
    if (this.isShowing) {
      currentCaption = $("#caption").html();
      shorterCaption = currentCaption.substring(0, currentCaption.length - 1);
      $("#caption").html(shorterCaption + "|");
      $("#fakeStartingBlinkingCursor").html("");
      $("#toMove").animate({
        opacity: 0,
        margin: -100,
        fontSize: 300,
        left: 0
      }, "fast");
      setTimeout("$(\"#formCode\").animate({opacity: 1}, \"fast\");", 120);
      setTimeout("$(\"#justForFakeCursor\").hide();", 200);
      setTimeout("$(\"#toMove\").hide();", 200);
      this.isShowing = false;
      return this.toggleBlink(false);
    }
  };

  BigCursor.prototype.unshrinkBigCursor = function() {
    if (!this.isShowing) {
      $("#formCode").animate({
        opacity: 0
      }, "fast");
      $("#justForFakeCursor").show();
      $("#toMove").show();
      $("#caption").html("|");
      $("#toMove").animate({
        opacity: 1,
        margin: 0,
        fontSize: 350,
        left: 0
      }, "fast", function() {
        $("#caption").html("");
        return $("#fakeStartingBlinkingCursor").html("|");
      });
      this.isShowing = true;
      return this.toggleBlink(true);
    }
  };

  return BigCursor;

})();
