#jslint browser: true, devel: true 
createEditor = (eventRouter, codemirror) ->
  "use strict"
  Editor = undefined
  suspendDimmingAndCheckIfLink = undefined
  resetEditor = undefined
  suspendDimmingAndCheckIfLink = (editor) ->
    cursorP = undefined
    currentLineContent = undefined
    program = undefined
    
    # Now this is kind of a nasty hack: we check where the
    # cursor is, and if it's over a line containing the
    # link then we follow it.
    # There was no better way, for some reason some onClick
    # events are lost, so what happened is that one would click on
    # the link and nothing would happen.
    cursorP = editor.getCursor(true)
    if cursorP.ch > 2
      currentLineContent = editor.getLine(cursorP.line)
      if currentLineContent.indexOf("// next-tutorial:") is 0
        currentLineContent = currentLineContent.substring(17)
        currentLineContent = currentLineContent.replace("_", "")
        program = currentLineContent + "Tutorial"
        setTimeout (->
          eventRouter.trigger "load-program", program
        ), 200
    return  if editor.getValue() is ""
    eventRouter.trigger "editor-undim"

  Editor = codemirror.fromTextArea(document.getElementById("code"),
    mode: "livecodelab"
    theme: "night"
    lineNumbers: false
    indentWithTabs: true
    tabSize: 1
    indentUnit: 1
    lineWrapping: true
    
    # We want the code editor to always have focus
    # since there is nothing else to type into.
    # One of those little wonders: you have to pause a little
    # before giving the editor focus, otherwise for some reason
    # the focus is not regained. Go figure.
    onBlur: ->
      setTimeout Editor.focus, 30

    
    # the onChange and onCursorActivity functions of CodeMirror
    # will pass in the "editor" instance as the first
    # argument to the function callback
    onChange: (editor) ->
      eventRouter.trigger "code_changed", editor.getValue()

    onCursorActivity: suspendDimmingAndCheckIfLink
  )
  
  # Setup Event Listeners
  eventRouter.bind "reset", ->
    Editor.setValue ""

  eventRouter.bind "code-updated-by-livecodelab", (elaboratedSource) ->
    cursorPositionBeforeAddingCheckMark = Editor.getCursor()
    cursorPositionBeforeAddingCheckMark.ch = cursorPositionBeforeAddingCheckMark.ch + 1
    Editor.setValue elaboratedSource
    Editor.setCursor cursorPositionBeforeAddingCheckMark

  Editor