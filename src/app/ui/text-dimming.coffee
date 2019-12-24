###
## Simple helper to handle the code dimming. When to trigger dimming and
## un-dimming and keeping track of status of the dedicated
## "automatic dimming" toggle switch.
###

class EditorDimmer

  dimIntervalID: undefined
  # default behaviour in case the user
  # presses the toggle button is that
  # the autoDimming should turn ON
  # so we are setting this to false to
  # start with.
  # Note that lcl-init forces an initial
  # value anyways, si this is ignored.
  dimCodeOn: false
  editor: null
  
  constructor: (@eventRouter, @bigCursor, @editor) ->
  
  undimEditor: ->
    unless @bigCursor.isShowing
      if parseFloat(@editor.codemirrorInstance.getWrapperElement().style.opacity) < 1
        $(@editor.codemirrorInstance.getWrapperElement()).clearQueue()
        $(@editor.codemirrorInstance.getWrapperElement()).animate
          opacity: 1
          duration: 'fast'
        @editor.codemirrorInstance.focus()

  
  # Now that there is a manual switch to toggle it off and on
  # the dimming goes to full INvisibility
  # see toggleDimCode()
  # not sure about that, want to try it on people -- julien
  dimEditor: ->
    console.log "editor element: " + @editor.codemirrorInstance.getWrapperElement()
    if parseFloat(@editor.codemirrorInstance.getWrapperElement().style.opacity) > 0
      $(@editor.codemirrorInstance.getWrapperElement()).clearQueue()
      $(@editor.codemirrorInstance.getWrapperElement()).animate
        opacity: 0
        duration: 'fast'

  
  # a function to toggle code diming on and off -- julien
  toggleDimCode: (dimmingActive) ->
    # if no parameter is passed just toggle the
    # autodimming flag, otherwise set it to
    # the passed value (a value is passed
    # in lcl-init via trigger "editor-toggle-dim",
    # but when the user presses the button no
    # value is passed...)
    if not dimmingActive?
      @dimCodeOn = not @dimCodeOn
    else
      @dimCodeOn = dimmingActive

    clearInterval(@dimIntervalID) if @dimIntervalID?
    if @dimCodeOn
      # the dimmings happening when
      # the user presses the toggle
      # have to happen immediately
      # cause the button has to to feel responsive
      # the following ones give you a little bit of a break
      setTimeout((()=>@dimEditor()), 10)
      # if auto-dimming is on by default then you
      # want something like 5000
      @dimIntervalID = setInterval((()=>@dimEditor()), 3000)
    else
      @undimEditor()
    @eventRouter.emit("auto-hide-code-button-pressed", @dimCodeOn)

module.exports = EditorDimmer

