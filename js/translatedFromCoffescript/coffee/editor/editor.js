var createEditor;

createEditor = function(eventRouter, codemirror) {
  "use strict";

  var Editor, resetEditor, suspendDimmingAndCheckIfLink;
  Editor = void 0;
  suspendDimmingAndCheckIfLink = void 0;
  resetEditor = void 0;
  suspendDimmingAndCheckIfLink = function(editor) {
    var currentLineContent, cursorP, program;
    cursorP = void 0;
    currentLineContent = void 0;
    program = void 0;
    cursorP = editor.getCursor(true);
    if (cursorP.ch > 2) {
      currentLineContent = editor.getLine(cursorP.line);
      if (currentLineContent.indexOf("// next-tutorial:") === 0) {
        currentLineContent = currentLineContent.substring(17);
        currentLineContent = currentLineContent.replace("_", "");
        program = currentLineContent + "Tutorial";
        setTimeout((function() {
          return eventRouter.trigger("load-program", program);
        }), 200);
      }
    }
    if (editor.getValue() === "") {
      return;
    }
    return eventRouter.trigger("editor-undim");
  };
  Editor = codemirror.fromTextArea(document.getElementById("code"), {
    mode: "livecodelab",
    theme: "night",
    lineNumbers: false,
    indentWithTabs: true,
    tabSize: 1,
    indentUnit: 1,
    lineWrapping: true,
    onBlur: function() {
      return setTimeout(Editor.focus, 30);
    },
    onChange: function(editor) {
      return eventRouter.trigger("code_changed", editor.getValue());
    },
    onCursorActivity: suspendDimmingAndCheckIfLink
  });
  eventRouter.bind("reset", function() {
    return Editor.setValue("");
  });
  eventRouter.bind("code-updated-by-livecodelab", function(elaboratedSource) {
    var cursorPositionBeforeAddingCheckMark;
    cursorPositionBeforeAddingCheckMark = Editor.getCursor();
    cursorPositionBeforeAddingCheckMark.ch = cursorPositionBeforeAddingCheckMark.ch + 1;
    Editor.setValue(elaboratedSource);
    return Editor.setCursor(cursorPositionBeforeAddingCheckMark);
  });
  return Editor;
};
