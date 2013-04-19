/*
## The Editor is just a wrapper for the CodeMirror editor. Contains a couple of handful
## functions and hooks-up the contents with the other parts of LiveCodeLab.
*/

var Editor;

Editor = (function() {
  "use strict";  function Editor(eventRouter, codemirror) {
    var _this = this;

    this.eventRouter = eventRouter;
    this.eventRouter.bind("reset", function() {
      return _this.codemirrorInstance.setValue("");
    });
    this.eventRouter.bind("code-updated-by-livecodelab", (function(elaboratedSource) {
      var cursorPositionBeforeAddingCheckMark;

      cursorPositionBeforeAddingCheckMark = _this.codemirrorInstance.getCursor();
      cursorPositionBeforeAddingCheckMark.ch = cursorPositionBeforeAddingCheckMark.ch + 1;
      _this.setValue(elaboratedSource);
      return _this.setCursor(cursorPositionBeforeAddingCheckMark);
    }));
    this.codemirrorInstance = codemirror.fromTextArea(document.getElementById("code"), {
      mode: "livecodelab",
      theme: "night",
      lineNumbers: false,
      indentWithTabs: true,
      tabSize: 1,
      indentUnit: 1,
      lineWrapping: true,
      onBlur: function() {
        return setTimeout(_this.codemirrorInstance.focus, 30);
      },
      onChange: function(editor) {
        return _this.eventRouter.trigger("code_changed", _this.codemirrorInstance.getValue());
      },
      onCursorActivity: function(editor) {
        return _this.suspendDimmingAndCheckIfLink();
      }
    });
  }

  Editor.prototype.focus = function() {
    return this.codemirrorInstance.focus();
  };

  Editor.prototype.getValue = function() {
    return this.codemirrorInstance.getValue();
  };

  Editor.prototype.getCursor = function(a) {
    return this.codemirrorInstance.getCursor(a);
  };

  Editor.prototype.setCursor = function(a, b) {
    return this.codemirrorInstance.setCursor(a, b);
  };

  Editor.prototype.clearHistory = function(a, b) {
    return this.codemirrorInstance.clearHistory(a, b);
  };

  Editor.prototype.getLine = function(a) {
    return this.codemirrorInstance.getLine(a);
  };

  Editor.prototype.setValue = function(a) {
    return this.codemirrorInstance.setValue(a);
  };

  Editor.prototype.lineCount = function() {
    return this.codemirrorInstance.lineCount();
  };

  Editor.prototype.suspendDimmingAndCheckIfLink = function(editor) {
    var currentLineContent, cursorP, program,
      _this = this;

    cursorP = void 0;
    currentLineContent = void 0;
    program = void 0;
    cursorP = this.codemirrorInstance.getCursor(true);
    if (cursorP.ch > 2) {
      currentLineContent = this.codemirrorInstance.getLine(cursorP.line);
      if (currentLineContent.indexOf("// next-tutorial:") === 0) {
        currentLineContent = currentLineContent.substring(17);
        currentLineContent = currentLineContent.replace("_", "");
        program = currentLineContent + "Tutorial";
        setTimeout((function() {
          return _this.eventRouter.trigger("load-program", program);
        }), 200);
      }
    }
    if (this.codemirrorInstance.getValue() === "") {
      return;
    }
    return this.eventRouter.trigger("editor-undim");
  };

  return Editor;

})();
