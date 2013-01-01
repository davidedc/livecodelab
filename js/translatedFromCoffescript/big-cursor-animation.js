var createBigCursor;

createBigCursor = function(eventRouter) {
  "use strict";

  var BigCursor, fakeCursorInterval, shrinkBigCursor, startBigCursorBlinkingAnimation, unshrinkBigCursor;
  BigCursor = {};
  startBigCursorBlinkingAnimation = void 0;
  fakeCursorInterval = void 0;
  shrinkBigCursor = void 0;
  unshrinkBigCursor = void 0;
  BigCursor.isShowing = true;
  startBigCursorBlinkingAnimation = function() {
    return $("#fakeStartingBlinkingCursor").animate({
      opacity: 0.2
    }, "fast", "swing").animate({
      opacity: 1
    }, "fast", "swing");
  };
  BigCursor.toggleBlink = function(active) {
    if (active) {
      if (!fakeCursorInterval) {
        return fakeCursorInterval = setInterval(startBigCursorBlinkingAnimation, 800);
      }
    } else {
      clearTimeout(fakeCursorInterval);
      return fakeCursorInterval = null;
    }
  };
  shrinkBigCursor = function() {
    var currentCaption, shorterCaption;
    currentCaption = void 0;
    shorterCaption = void 0;
    if (BigCursor.isShowing) {
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
      BigCursor.isShowing = false;
      return BigCursor.toggleBlink(false);
    }
  };
  unshrinkBigCursor = function() {
    if (!BigCursor.isShowing) {
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
      BigCursor.isShowing = true;
      return BigCursor.toggleBlink(true);
    }
  };
  eventRouter.bind("big-cursor-show", function() {
    return unshrinkBigCursor();
  });
  eventRouter.bind("big-cursor-hide", function() {
    return shrinkBigCursor();
  });
  return BigCursor;
};
