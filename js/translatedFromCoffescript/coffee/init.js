/*
## Init.js takes care of the setup of the whole environment up to
## cruise speed
*/

var isCanvasSupported, startEnvironment;

$(document).ready(function() {
  document.getElementById("blendedThreeJsSceneCanvas").width = window.innerWidth;
  document.getElementById("blendedThreeJsSceneCanvas").height = window.innerHeight;
  return startEnvironment({
    blendedThreeJsSceneCanvas: document.getElementById("blendedThreeJsSceneCanvas"),
    canvasForBackground: document.getElementById("backGroundCanvas"),
    forceCanvasRenderer: false,
    bubbleUpErrorsForDebugging: false,
    testMode: false
  });
});

isCanvasSupported = function() {
  var elem;

  elem = document.createElement("canvas");
  return !!(elem.getContext && elem.getContext("2d"));
};

startEnvironment = function(paramsObject) {
  "use strict";
  var autocoder, bigCursor, colourNames, editor, editorDimmer, eventRouter, liveCodeLabCore, programLoader, stats, ui, urlRouter,
    _this = this;

  if (!isCanvasSupported) {
    $("#noCanvasMessage").modal({
      onClose: function() {
        $("#loading").text("sorry :-(");
        return $.modal.close();
      }
    });
    $("#simplemodal-container").height(200);
    return;
  }
  eventRouter = new EventRouter();
  stats = new Stats;
  colourNames = (new ColourLiterals()).colourNames;
  liveCodeLabCore = new LiveCodeLabCore({
    blendedThreeJsSceneCanvas: paramsObject.blendedThreeJsSceneCanvas,
    canvasForBackground: paramsObject.canvasForBackground,
    forceCanvasRenderer: paramsObject.forceCanvasRenderer,
    eventRouter: eventRouter,
    statsWidget: stats,
    testMode: paramsObject.testMode
  });
  urlRouter = new UrlRouter(eventRouter);
  bigCursor = new BigCursor(eventRouter);
  eventRouter.bind("big-cursor-show", function() {
    return bigCursor.unshrinkBigCursor();
  });
  eventRouter.bind("big-cursor-hide", function() {
    return bigCursor.shrinkBigCursor();
  });
  editor = new Editor(eventRouter, CodeMirror);
  attachMouseWheelHandler(editor);
  programLoader = new ProgramLoader(eventRouter, editor, liveCodeLabCore);
  eventRouter.bind("load-program", programLoader.loadDemoOrTutorial, programLoader);
  ui = new Ui(eventRouter, stats, programLoader);
  autocoder = new Autocoder(eventRouter, editor, colourNames);
  eventRouter.bind("reset", function() {
    return autocoder.toggle(false);
  });
  eventRouter.bind("toggle-autocoder", function() {
    return autocoder.toggle();
  });
  editorDimmer = new EditorDimmer(eventRouter, bigCursor);
  eventRouter.bind("editor-dim", (function() {
    return editorDimmer.dimEditor();
  }), editorDimmer);
  eventRouter.bind("editor-undim", (function() {
    return editorDimmer.undimEditor();
  }), editorDimmer);
  eventRouter.bind("editor-toggle-dim", (function() {
    return editorDimmer.toggleDimCode();
  }), editorDimmer);
  eventRouter.bind("reset", (function() {
    return liveCodeLabCore.paintARandomBackground();
  }));
  eventRouter.trigger("editor-toggle-dim", true);
  eventRouter.bind("livecodelab-running-stably", ui.showStatsWidget);
  eventRouter.bind("code_changed", function(updatedCodeAsString) {
    var _this = this;

    if (updatedCodeAsString !== "") {
      eventRouter.trigger("big-cursor-hide");
    } else {
      setTimeout((function() {
        return editor.clearHistory();
      }), 30);
      eventRouter.trigger("set-url-hash", "");
      eventRouter.trigger("big-cursor-show");
      ui.hideStatsWidget();
    }
    return liveCodeLabCore.updateCode(updatedCodeAsString);
  });
  eventRouter.bind("runtime-error-thrown", function(e) {
    eventRouter.trigger("report-runtime-or-compile-time-error", e);
    if (autocoder.active) {
      editor.undo();
    } else {
      liveCodeLabCore.runLastWorkingDrawFunction();
    }
    if (paramsObject.bubbleUpErrorsForDebugging) {
      throw e;
    }
  });
  eventRouter.bind("compile-time-error-thrown", function(e) {
    eventRouter.trigger("report-runtime-or-compile-time-error", e);
    if (autocoder.active) {
      return editor.undo();
    }
  });
  eventRouter.bind("clear-error", ui.clearError, ui);
  eventRouter.bind("all-sounds-loaded-and tested", ui.soundSystemOk);
  liveCodeLabCore.loadAndTestAllTheSounds();
  liveCodeLabCore.paintARandomBackground();
  liveCodeLabCore.startAnimationLoop();
  if (!Detector.webgl || paramsObject.forceCanvasRenderer) {
    $("#noWebGLMessage").modal({
      onClose: $.modal.close
    });
    $("#simplemodal-container").height(200);
  }
  editor.focus();
  if (!urlRouter.urlPointsToDemoOrTutorial()) {
    setTimeout((function() {
      return liveCodeLabCore.playStartupSound();
    }), 650);
  }
  bigCursor.toggleBlink(true);
  return ui.setup();
};
