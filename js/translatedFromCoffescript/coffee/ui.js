/*
## Ui handles all things UI such as the menus, the notification popups, the editor panel,
## the big flashing cursor, the stats widget...
*/

var Ui;

Ui = (function() {
  "use strict";  function Ui(eventRouter, stats, programLoader) {
    var _this = this;

    this.eventRouter = eventRouter;
    this.stats = stats;
    this.programLoader = programLoader;
    this.eventRouter.bind("report-runtime-or-compile-time-error", (function(e) {
      return _this.checkErrorAndReport(e);
    }), this);
    this.eventRouter.bind("clear-error", (function() {
      return _this.clearError();
    }), this);
    this.eventRouter.bind("autocoder-button-pressed", function(state) {
      if (state === true) {
        return $("#autocodeIndicatorContainer").html("Autocode: on").css("background-color", "#FF0000");
      } else {
        return $("#autocodeIndicatorContainer").html("Autocode").css("background-color", "");
      }
    });
    this.eventRouter.bind("autocoderbutton-flash", function() {
      return $("#autocodeIndicatorContainer").fadeOut(100).fadeIn(100);
    });
    this.eventRouter.bind("auto-hide-code-button-pressed", function(state) {
      if (state === true) {
        return $("#dimCodeButtonContainer").html("Hide Code: on");
      } else {
        return $("#dimCodeButtonContainer").html("Hide Code: off");
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

    $("#errorMessageDiv").css("color", "red");
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
    return $("#errorMessageDiv").text(errorMessage);
  };

  Ui.prototype.clearError = function() {
    $("#errorMessageDiv").css("color", "#000000");
    return $("#errorMessageDiv").text("");
  };

  Ui.prototype.soundSystemOk = function() {
    return $("#soundSystemStatus").text("Sound System On").removeClass("off");
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
      var a, allDemos, allTutorials, demo, demoSubmenu, demoSubmenuNoSpaces, demoSubmenus, eventRouter, submenuOfThisDemo, submenuOfThisTutorial, tutorial, tutorialSubmenu, tutorialSubmenuNoSpaces, tutorialSubmenus, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3;

      eventRouter = _this.eventRouter;
      $('<span >LiveCodeLab</span>').appendTo($('<li>').appendTo($('#nav'))).click(function() {
        $("#aboutWindow").modal();
        $("#simplemodal-container").height(250);
        return false;
      });
      $('<span >Demos</span>').appendTo($('<li>').attr('id', 'demos').addClass('current').addClass('sf-parent').appendTo($('#nav')));
      $("<ul id='ulForDemos'></ul>").appendTo($('#demos'));
      allDemos = _this.programLoader.programs.demos;
      demoSubmenus = {};
      for (demo in allDemos) {
        submenuOfThisDemo = allDemos[demo].submenu;
        if ((_ref = demoSubmenus[submenuOfThisDemo]) == null) {
          demoSubmenus[submenuOfThisDemo] = [];
        }
        demoSubmenus[submenuOfThisDemo].push(demo);
      }
      for (demoSubmenu in demoSubmenus) {
        demoSubmenuNoSpaces = demoSubmenu.replace(" ", "_");
        $("<li></li>").appendTo($('#ulForDemos')).attr('id', 'hookforDemos' + demoSubmenuNoSpaces);
        $("<span>" + demoSubmenu + "</span>").appendTo($('#hookforDemos' + demoSubmenuNoSpaces));
        $("<ul id='" + demoSubmenuNoSpaces + "'></ul>").appendTo($('#hookforDemos' + demoSubmenuNoSpaces));
        _ref1 = demoSubmenus[demoSubmenu];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          demo = _ref1[_i];
          a = "<li><a id='" + demo + "'>" + _this.programLoader.programs.demos[demo].title + "</a></li>";
          $(a).appendTo($('#' + demoSubmenuNoSpaces));
        }
      }
      $('<span >Tutorials</span>').appendTo($('<li>').attr('id', 'tutorials').addClass('current').addClass('sf-parent').appendTo($('#nav')));
      $("<ul id='ulForTutorials'></ul>").appendTo($('#tutorials'));
      allTutorials = _this.programLoader.programs.tutorials;
      tutorialSubmenus = {};
      for (tutorial in allTutorials) {
        submenuOfThisTutorial = allTutorials[tutorial].submenu;
        if ((_ref2 = tutorialSubmenus[submenuOfThisTutorial]) == null) {
          tutorialSubmenus[submenuOfThisTutorial] = [];
        }
        tutorialSubmenus[submenuOfThisTutorial].push(tutorial);
      }
      for (tutorialSubmenu in tutorialSubmenus) {
        tutorialSubmenuNoSpaces = tutorialSubmenu.replace(" ", "_");
        $("<li></li>").appendTo($('#ulForTutorials')).attr('id', 'hookforTutorials' + tutorialSubmenuNoSpaces);
        $("<span>" + tutorialSubmenu + "</span>").appendTo($('#hookforTutorials' + tutorialSubmenuNoSpaces));
        $("<ul id='" + tutorialSubmenuNoSpaces + "'></ul>").appendTo($('#hookforTutorials' + tutorialSubmenuNoSpaces));
        _ref3 = tutorialSubmenus[tutorialSubmenu];
        for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
          tutorial = _ref3[_j];
          a = "<li><a id='" + tutorial + "'>" + _this.programLoader.programs.tutorials[tutorial].title + "</a></li>";
          $(a).appendTo($('#' + tutorialSubmenuNoSpaces));
        }
      }
      $('ul.sf-menu').sooperfish();
      $("#demos ul li a").click(function() {
        eventRouter.trigger("load-program", $(this).attr("id"));
        return false;
      });
      $("#tutorials li a").click(function() {
        eventRouter.trigger("load-program", $(this).attr("id"));
        return false;
      });
      $('<span >Autocode</span>').appendTo($('<li>').appendTo($('#nav'))).attr('id', 'autocodeIndicatorContainer');
      $("#autocodeIndicatorContainer").click(function() {
        eventRouter.trigger("toggle-autocoder");
        return false;
      });
      $('<span >Hide Code: on</span>').appendTo($('<li>').appendTo($('#nav'))).attr('id', 'dimCodeButtonContainer');
      $("#dimCodeButtonContainer").click(function() {
        eventRouter.trigger("editor-toggle-dim");
        return false;
      });
      $('<span >Reset</span>').appendTo($('<li>').appendTo($('#nav'))).click(function() {
        eventRouter.trigger("reset");
        $(_this).stop().fadeOut(100).fadeIn(100);
        return false;
      });
      $('<span id="errorMessageDiv">msg will go here</span>').appendTo($('<li>').appendTo($('#nav')));
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
