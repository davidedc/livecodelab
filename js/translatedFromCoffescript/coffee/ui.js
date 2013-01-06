var createUi;

createUi = function(eventRouter, stats) {
  "use strict";

  var Ui, adjustCodeMirrorHeight, resizeCanvas;
  Ui = {};
  resizeCanvas = void 0;
  adjustCodeMirrorHeight = void 0;
  resizeCanvas = function(canvasId) {
    var canvas, scale;
    canvas = void 0;
    scale = void 0;
    canvas = $(canvasId);
    scale = {
      x: 1,
      y: 1
    };
    scale.x = (window.innerWidth + 40) / canvas.width();
    scale.y = (window.innerHeight + 40) / canvas.height();
    scale = scale.x + ", " + scale.y;
    return canvas.css("-ms-transform-origin", "left top").css("-webkit-transform-origin", "left top").css("-moz-transform-origin", "left top").css("-o-transform-origin", "left top").css("transform-origin", "left top").css("-ms-transform", "scale(" + scale + ")").css("-webkit-transform", "scale3d(" + scale + ", 1)").css("-moz-transform", "scale(" + scale + ")").css("-o-transform", "scale(" + scale + ")").css("transform", "scale(" + scale + ")");
  };
  Ui.adjustCodeMirrorHeight = function() {
    return $(".CodeMirror-scroll").css("height", window.innerHeight - $("#theMenu").height());
  };
  Ui.fullscreenify = function(canvasId) {
    window.addEventListener("resize", (function() {
      Ui.adjustCodeMirrorHeight();
      return resizeCanvas(canvasId);
    }), false);
    return resizeCanvas(canvasId);
  };
  Ui.checkErrorAndReport = function(e) {
    var errorMessage;
    $("#dangerSignText").css("color", "red");
    errorMessage = e.message || e;
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
    } else {
      if (errorMessage.indexOf("ReferenceError") > -1) {
        errorMessage = errorMessage.replace(/ReferenceError:\s/g, "");
      }
    }
    return $("#errorMessageText").text(errorMessage);
  };
  Ui.clearError = function() {
    $("#dangerSignText").css("color", "#000000");
    return $("#errorMessageText").text("");
  };
  Ui.soundSystemOk = function() {
    return $("#soundSystemStatus").text("Sound System On").removeClass("off").addClass("on");
  };
  Ui.hideStatsWidget = function() {
    return $("#statsWidget").hide();
  };
  Ui.showStatsWidget = function() {
    return setTimeout("$(\"#statsWidget\").show()", 1);
  };
  Ui.setup = function() {
    return $(document).ready(function() {
      $("#aboutMenu").click(function() {
        $("#aboutWindow").modal();
        $("#simplemodal-container").height(250);
        return false;
      });
      $("#demos li a").click(function() {
        eventRouter.trigger("load-program", $(this).attr("id"));
        return false;
      });
      $("#tutorials li a").click(function() {
        eventRouter.trigger("load-program", $(this).attr("id"));
        return false;
      });
      $("#autocodeIndicatorContainer").click(function() {
        eventRouter.trigger("toggle-autocoder");
        return false;
      });
      $("#dimCodeButtonContainer").click(function() {
        eventRouter.trigger("editor-toggle-dim");
        return false;
      });
      $("#resetButtonContainer").click(function() {
        eventRouter.trigger("reset");
        $(this).stop().fadeOut(100).fadeIn(100);
        return false;
      });
      stats.getDomElement().style.position = "absolute";
      stats.getDomElement().style.right = "0px";
      stats.getDomElement().style.top = "0px";
      document.body.appendChild(stats.getDomElement());
      $("#startingCourtainScreen").fadeOut();
      $("#formCode").css("opacity", 0);
      Ui.fullscreenify("#backGroundCanvas");
      return Ui.adjustCodeMirrorHeight();
    });
  };
  eventRouter.bind("report-runtime-or-compile-time-error", Ui.checkErrorAndReport, Ui);
  eventRouter.bind("clear-error", Ui.clearError, Ui);
  eventRouter.bind("autocoder-button-pressed", function(state) {
    if (state === true) {
      return $("#autocodeIndicator").html("Autocode: on").css("background-color", "#FF0000");
    } else {
      return $("#autocodeIndicator").html("Autocode: off").css("background-color", "");
    }
  });
  eventRouter.bind("autocoderbutton-flash", function() {
    return $("#autocodeIndicator").fadeOut(100).fadeIn(100);
  });
  eventRouter.bind("auto-hide-code-button-pressed", function(state) {
    if (state === true) {
      return $("#dimCodeIndicator").html("Hide Code: on");
    } else {
      return $("#dimCodeIndicator").html("Hide Code: off");
    }
  });
  return Ui;
};
