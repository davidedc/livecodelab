###
## The Editor is just a wrapper for the CodeMirror editor.
## Contains a couple of handful functions and hooks-up the contents
## with the other parts of LiveCodeLab.
###

require '../lib/codemirror/livecodelang'

class Editor

  constructor: (@eventRouter, @codeTextArea) ->

    @codemirrorInstance = CodeMirror.fromTextArea(
      @codeTextArea,
      {
        mode: "livecodelab"
        theme: "night"
        lineNumbers: false
        scrollbarStyle: "null"
        indentWithTabs: true
        tabSize: 3
        indentUnit: 3
        lineWrapping: true
        styleSelectedText: true
        autofocus: true
      }
    )


    # Setup Event Listeners
    @eventRouter.addListener("reset", => @codemirrorInstance.setValue "")

    @eventRouter.addListener(
      "code-updated-by-livecodelab",
      (elaboratedSource) =>
        cursorPosBeforeCheck = @codemirrorInstance.getCursor()
        cursorPosBeforeCheck.ch = cursorPosBeforeCheck.ch + 1
        @setValue elaboratedSource
        @setCursor cursorPosBeforeCheck
    )

    @hideAndUnfocus()

    @codemirrorInstance.on(
      'change',
      (editor) => @eventRouter.emit("code-changed", @codemirrorInstance.getValue())
    )

    @codemirrorInstance.on(
      'mousedown',
      (editor, event) => @checkIfLink(editor, event)
    )

  showAndFocus: ->
    @codemirrorInstance.getWrapperElement().style.opacity = "1";
    @codemirrorInstance.focus()

  hideAndUnfocus: ->
    @codemirrorInstance.getWrapperElement().style.opacity = "0";

  getValue: ->
    @codemirrorInstance.getValue()

  getCursor: (a) ->
    @codemirrorInstance.getCursor(a)

  setCursor: (a, b) ->
    @codemirrorInstance.setCursor(a,b)

  clearHistory: (a, b) ->
    @codemirrorInstance.clearHistory(a,b)

  getLine: (a) ->
    @codemirrorInstance.getLine(a)

  setValue: (a) ->
    @codemirrorInstance.setValue(a)

  lineCount: () ->
    @codemirrorInstance.lineCount()

  checkIfLink: (editor, event) ->
    coords = editor.coordsChar({left: event.pageX, top: event.pageY})
    if editor.getTokenTypeAt(coords) == 'link'
      token = editor.getTokenAt(coords)
      program = token.string.split(':')[1].replace("_", "") + "Tutorial"
      @eventRouter.emit("load-program", program)

module.exports = Editor
