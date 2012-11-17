/*jslint browser: true, devel: true */
/*global CodeMirror, registerCode, suspendDimmingAndCheckIfLink */

var createEditor = function () {
    var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
        lineNumbers: false,
        indentWithTabs: true,
        tabSize: 1,
        indentUnit: 1,
        lineWrapping: true,
        // We want the code editor to always have focus
        // since there is nothing else to type into.
        // One of those little wonders: you have to pause a little
        // before giving the editor focus, otherwise for some reason
        // the focus is not regained. Go figure.
        onBlur: (function () {
            setTimeout('editor.focus()', 30);
        }),
        onChange: (function () {
            registerCode();
        }),
        mode: "livecodelab",
        onCursorActivity: (function () {
            suspendDimmingAndCheckIfLink();
        })
    });
    return editor;
};
