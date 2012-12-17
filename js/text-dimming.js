/*jslint */
/*global $ */

var createEditorDimmer = function (eventRouter, bigCursor) {

    'use strict';

    var cursorActivity = true,
        dimIntervalID,
        EditorDimmer = {},
        dimCodeOn = false;

    EditorDimmer.undimEditor = function () {
			//console.log('undimming, bigCursor.startBigCursorBlinkingAnimation:' + bigCursor.startBigCursorBlinkingAnimation);
			if (!bigCursor.isShowing) {
				if ($("#formCode").css('opacity') < 0.99) {
						$("#formCode").animate({
								opacity: 1
						}, "fast");
				}
			}
    };

    // Now that there is a manual switch to toggle it off and on
    // the dimming goes to full INvisibility
    // see toggleDimCode() 
    // not sure about that, want to try it on people -- julien 

    EditorDimmer.dimEditor = function () {
        if ($("#formCode").css('opacity') > 0) {
            $("#formCode").animate({
                opacity: 0
            }, "slow");
        }
    };



    EditorDimmer.dimIfNoCursorActivity = function () {
        if (cursorActivity) {
            cursorActivity = false;
        } else {
            EditorDimmer.dimEditor();
        }
    };

    // a function to toggle code diming on and off -- julien 

    EditorDimmer.toggleDimCode = function (dimmingActive) {
        if (dimmingActive === undefined) {
            dimCodeOn = !dimCodeOn;
        } else {
            dimCodeOn = dimmingActive;
        }

        if (dimCodeOn) {
            // we restart a setInterval
            dimIntervalID = setInterval(EditorDimmer.dimIfNoCursorActivity, 5000);
        } else {
            clearInterval(dimIntervalID);
            EditorDimmer.undimEditor();
        }
        eventRouter.trigger('auto-hide-code-button-pressed', dimCodeOn);
    };


    // Setup Event Listeners
    eventRouter.bind('editor-dim', EditorDimmer.dimEditor, EditorDimmer);

    eventRouter.bind('editor-undim', EditorDimmer.undimEditor, EditorDimmer);

    eventRouter.bind('editor-toggle-dim', EditorDimmer.toggleDimCode, EditorDimmer);

    return EditorDimmer;

};
