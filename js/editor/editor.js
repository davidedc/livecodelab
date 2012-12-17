/*jslint browser: true, devel: true */

var createEditor = function (eventRouter, codemirror) {

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
                    eventRouter.trigger('load-program', program);
                }, 200);
            }
        }

        if (editor.getValue() === '') {
            return;
        }
        eventRouter.trigger('editor-undim');
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
            eventRouter.trigger('code_changed', editor.getValue());
        },
        onCursorActivity: suspendDimmingAndCheckIfLink
    });

    // Setup Event Listeners
    eventRouter.bind('reset', function () {
        Editor.setValue('');
    });

    eventRouter.bind('code-updated-by-livecodelab', function (elaboratedSource) {
        var cursorPositionBeforeAddingCheckMark = Editor.getCursor();
        cursorPositionBeforeAddingCheckMark.ch = cursorPositionBeforeAddingCheckMark.ch + 1;

        Editor.setValue(elaboratedSource);
        Editor.setCursor(cursorPositionBeforeAddingCheckMark);
    });



    return Editor;
};
