/*jslint browser: true, devel: true */

var createEditor = function (events, codemirror) {

    'use strict';

    var Editor,
        suspendDimmingAndCheckIfLink,
        resetEditor;


    suspendDimmingAndCheckIfLink = function (editor) {

        var cursorP, currentLineContent, program;

        // Now this is kind of a nasty hack: we check where the
        // cursor is, and if it's over a line containing the
        // link then we follow it.
        // There was no better way, for some reason some onClick
        // events are lost, so what happened is that one would click on
        // the link and nothing would happen.
        cursorP = editor.getCursor(true);
        if (cursorP.ch > 2) {
            currentLineContent = editor.getLine(cursorP.line);
            if (currentLineContent.indexOf('// next-tutorial:') === 0) {
                currentLineContent = currentLineContent.substring(17);
                currentLineContent = currentLineContent.replace("_", "");
                program = currentLineContent + 'Tutorial';
                setTimeout(function () {
                    events.trigger('load-program', program);
                }, 200);
            }
        }

        if (editor.getValue() === '') {
            return;
        }
        events.trigger('editor-undim');
    };


    Editor = codemirror.fromTextArea(document.getElementById("code"), {
        mode: "livecodelab",
        theme: 'night',
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
            setTimeout(Editor.focus, 30);
        },
        // the onChange and onCursorActivity functions of CodeMirror
        // will pass in the "editor" instance as the first
        // argument to the function callback
        onChange: function (editor) {
            events.trigger('editor-change', editor);
        },
        onCursorActivity: suspendDimmingAndCheckIfLink
    });


    // Setup Event Listeners
    events.bind('reset', function () {
        Editor.setValue('');
    });



    return Editor;
};
