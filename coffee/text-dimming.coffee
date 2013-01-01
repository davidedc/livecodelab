#jslint 
#global $ 

createEditorDimmer = (eventRouter, bigCursor) ->
  "use strict"
  cursorActivity = true
  dimIntervalID = undefined
  EditorDimmer = {}
  dimCodeOn = false
  EditorDimmer.undimEditor = ->
    
    #console.log('undimming, bigCursor.startBigCursorBlinkingAnimation:' + bigCursor.startBigCursorBlinkingAnimation);
    unless bigCursor.isShowing
      if $("#formCode").css("opacity") < 0.99
        $("#formCode").animate
          opacity: 1
        , "fast"

  
  # Now that there is a manual switch to toggle it off and on
  # the dimming goes to full INvisibility
  # see toggleDimCode() 
  # not sure about that, want to try it on people -- julien 
  EditorDimmer.dimEditor = ->
    if $("#formCode").css("opacity") > 0
      $("#formCode").animate
        opacity: 0
      , "slow"

  EditorDimmer.dimIfNoCursorActivity = ->
    if cursorActivity
      cursorActivity = false
    else
      EditorDimmer.dimEditor()

  
  # a function to toggle code diming on and off -- julien 
  EditorDimmer.toggleDimCode = (dimmingActive) ->
    if dimmingActive is `undefined`
      dimCodeOn = not dimCodeOn
    else
      dimCodeOn = dimmingActive
    if dimCodeOn
      
      # we restart a setInterval
      dimIntervalID = setInterval(EditorDimmer.dimIfNoCursorActivity, 5000)
    else
      clearInterval dimIntervalID
      EditorDimmer.undimEditor()
    eventRouter.trigger "auto-hide-code-button-pressed", dimCodeOn

  
  # Setup Event Listeners
  eventRouter.bind "editor-dim", EditorDimmer.dimEditor, EditorDimmer
  eventRouter.bind "editor-undim", EditorDimmer.undimEditor, EditorDimmer
  eventRouter.bind "editor-toggle-dim", EditorDimmer.toggleDimCode, EditorDimmer
  
  EditorDimmer