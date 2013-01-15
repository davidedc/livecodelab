"use strict";

var Ui;

Ui = (function() {

  function Ui(eventRouter, stats) {
    var _this = this;
    this.eventRouter = eventRouter;
    this.stats = stats;
    this.eventRouter.bind("report-runtime-or-compile-time-error", (function() {
      return _this.checkErrorAndReport();
    }), this);
    this.eventRouter.bind("clear-error", (function() {
      return _this.clearError();
    }), this);
    this.eventRouter.bind("autocoder-button-pressed", function(state) {
      if (state === true) {
        return $("#autocodeIndicator").html("Autocode: on").css("background-color", "#FF0000");
      } else {
        return $("#autocodeIndicator").html("Autocode: off").css("background-color", "");
      }
    });
    this.eventRouter.bind("autocoderbutton-flash", function() {
      return $("#autocodeIndicator").fadeOut(100).fadeIn(100);
    });
    this.eventRouter.bind("auto-hide-code-button-pressed", function(state) {
      if (state === true) {
        return $("#dimCodeIndicator").html("Hide Code: on");
      } else {
        return $("#dimCodeIndicator").html("Hide Code: off");
      }
    });
  }

  Ui.prototype.resizeCanvas = function(canvasId) {
    var canvas, scale;
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

  Ui.prototype.adjustCodeMirrorHeight = function() {
    return $(".CodeMirror-scroll").css("height", window.innerHeight - $("#theMenu").height());
  };

  Ui.prototype.fullscreenify = function(canvasId) {
    var _this = this;
    window.addEventListener("resize", (function() {
      _this.adjustCodeMirrorHeight();
      return _this.resizeCanvas(canvasId);
    }), false);
    return this.resizeCanvas(canvasId);
  };

  Ui.prototype.checkErrorAndReport = function(e) {
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

  Ui.prototype.clearError = function() {
    $("#dangerSignText").css("color", "#000000");
    return $("#errorMessageText").text("");
  };

  Ui.prototype.soundSystemOk = function() {
    return $("#soundSystemStatus").text("Sound System On").removeClass("off").addClass("on");
  };

  Ui.prototype.hideStatsWidget = function() {
    return $("#statsWidget").hide();
  };

  Ui.prototype.showStatsWidget = function() {
    return setTimeout("$(\"#statsWidget\").show()", 1);
  };

  Ui.prototype.setup = function() {
    var _this = this;
    return $(document).ready(function() {
      var eventRouter;
      eventRouter = _this.eventRouter;
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
      _this.stats.getDomElement().style.position = "absolute";
      _this.stats.getDomElement().style.right = "0px";
      _this.stats.getDomElement().style.top = "0px";
      document.body.appendChild(_this.stats.getDomElement());
      $("#startingCourtainScreen").fadeOut();
      $("#formCode").css("opacity", 0);
      _this.fullscreenify("#backGroundCanvas");
      return _this.adjustCodeMirrorHeight();
    });
  };

  return Ui;

})();
