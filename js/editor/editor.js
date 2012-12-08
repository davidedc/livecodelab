/*jslint browser: true, devel: true */
/*global EditorDimmer, LiveCodeLab */

var createEditor = function (codemirror, codetransformer, bigcursor) {

    'use strict';

    var editor = codemirror.fromTextArea(document.getElementById("code"), {
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
        onBlur: function () {
            setTimeout(editor.focus, 30);
        },
        // the onChange function of CodeMirror will pass in
        // the "editor" instance as the first argument to the
        // function callback
        onChange: LiveCodeLab.registerCode,
        mode: "livecodelab",
        onCursorActivity: function () {
            EditorDimmer.suspendDimmingAndCheckIfLink();
        },
        theme: 'night'
    });

    document.onkeypress = function (e) {
        if (bigcursor.show && editor.getValue() !== "") {
            bigcursor.shrinkFakeText(e);
        }
    };

    return editor;
};
