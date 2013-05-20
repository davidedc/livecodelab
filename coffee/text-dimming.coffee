###
## Simple helper to handle the code dimming. When to trigger dimming and
## un-dimming and keeping track of status of the dedicated
## "automatic dimming" toggle switch.
###

class EditorDimmer

  cursorActivity: true
  dimIntervalID: undefined
  dimCodeOn: false
  
  constructor: (@eventRouter, @bigCursor) ->
  
  undimEditor: ->
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
    if not dimmingActive?
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

  
