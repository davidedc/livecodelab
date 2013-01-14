#jslint 
#global $ 

"use strict"
class EditorDimmer
  cursorActivity: true
  dimIntervalID: undefined
  dimCodeOn: false
  
  constructor: (@eventRouter, @bigCursor) ->
  
  undimEditor: ->  
    #console.log('undimming, @bigCursor.startBigCursorBlinkingAnimation:' + @bigCursor.startBigCursorBlinkingAnimation);
    unless @bigCursor.isShowing
      if $("#formCode").css("opacity") < 0.99
        $("#formCode").animate
          opacity: 1
        , "fast"

  
  # Now that there is a manual switch to toggle it off and on
  # the dimming goes to full INvisibility
  # see toggleDimCode() 
  # not sure about that, want to try it on people -- julien 
  dimEditor: ->
    if $("#formCode").css("opacity") > 0
      $("#formCode").animate
        opacity: 0
      , "slow"

  dimIfNoCursorActivity: ->
    if @cursorActivity
      @cursorActivity = false
    else
      @dimEditor()

  
  # a function to toggle code diming on and off -- julien 
  toggleDimCode: (dimmingActive) ->
    if dimmingActive is `undefined`
      @dimCodeOn = not @dimCodeOn
    else
      @dimCodeOn = dimmingActive
    if @dimCodeOn
      
      # we restart a setInterval
      @dimIntervalID = setInterval((()=>@dimIfNoCursorActivity()), 5000)
    else
      clearInterval @dimIntervalID
      @undimEditor()
    @eventRouter.trigger "auto-hide-code-button-pressed", @dimCodeOn

  
