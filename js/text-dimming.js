/*jslint browser: true, devel: true */
/*global $, fakeText */

var createEditorDimmer = function (Editor, ProgramLoader) {

    'use strict';

    var cursorActivity = true,
        dimIntervalID,
        EditorDimmer = {};

    EditorDimmer.dimCodeOn = false;

    EditorDimmer.undimEditor = function () {
        if (fakeText || Editor.getValue() === '') {
            $("#formCode").css('opacity', 0);
        }
        if ($("#formCode").css('opacity') < 0.99) {
            $("#formCode").animate({
                opacity: 1
            }, "fast");
        }
    };



    EditorDimmer.suspendDimmingAndCheckIfLink = function () {

        var cursorP, currentLineContent, tutorialName;

        // Now this is kind of a nasty hack: we check where the
        // cursor is, and if it's over a line containing the
        // link then we follow it.
        // There was no better way, for some reason some onClick
        // events are lost, so what happened is that one would click on
        // the link and nothing would happen.
        cursorP = Editor.getCursor(true);
        if (cursorP.ch > 2) {
            currentLineContent = Editor.getLine(cursorP.line);
            if (currentLineContent.indexOf('// next-tutorial:') === 0) {
                currentLineContent = currentLineContent.substring(17);
                currentLineContent = currentLineContent.replace("_", "");
                tutorialName = currentLineContent + 'Tutorial';
                setTimeout(ProgramLoader.loadDemoOrTutorial, 200, tutorialName);
            }
        }

        if (fakeText || Editor.getValue() === '') {
            return;
        }
        cursorActivity = true;
        EditorDimmer.undimEditor();
    };



    // Now that there is a manual switch to toggle it off and on
    // the dimming goes to full INvisibility
    // see toggleDimCode() 
    // not sure about that, want to try it on people -- julien 

    EditorDimmer.dimEditor = function () {
        // TODO there is a chance that the animation library
        // doesn't bring the opacity completely to zero
        // but rather to a value close to it.
        // Make the animation step to print something
        // just to make sure that this is not the case.
        if ($("#formCode").css('opacity') > 0) {
            $("#formCode").animate({
                opacity: 0
            }, "slow");
        }
    };



    EditorDimmer.dimIfNoCursorActivity = function () {
        if (fakeText || Editor.getValue() === '') {
            return;
        }
        if (cursorActivity) {
            cursorActivity = false;
        } else {
            EditorDimmer.dimEditor();
        }
    };

    // a function to toggle code diming on and off -- julien 


    EditorDimmer.toggleDimCode = function () {
        EditorDimmer.dimCodeOn = !EditorDimmer.dimCodeOn;

        if (!EditorDimmer.dimCodeOn) {
            clearInterval(dimIntervalID);
            // don't un-dim if the giant cursor is blinking
            if (!fakeText && Editor.getValue() !== '') {
                EditorDimmer.undimEditor();
            }
            $("#dimCodeIndicator").html("Hide Code: off");

        } else {
            // we restart a setInterval
            dimIntervalID = setInterval(EditorDimmer.dimIfNoCursorActivity, 5000);
            $("#dimCodeIndicator").html("Hide Code: on");
        }
    };

    return EditorDimmer;

};
