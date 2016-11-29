###
## The Editor is just a wrapper for the CodeMirror editor.
## Contains a couple of handful functions and hooks-up the contents
## with the other parts of LiveCodeLab.
###

CodeMirror = require '../../js/codemirror/lib/codemirror'
require '../../js/codemirror/livecodelang'
require '../../js/codemirror/addons/selection/mark-selection'

class Editor

  constructor: (@eventRouter, @codeTextArea) ->
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
      }
    )


    @codemirrorInstance.on(
      'change',
      (editor) => @eventRouter.emit("code-changed", @codemirrorInstance.getValue())
    )

    @codemirrorInstance.on(
      'cursorActivity',
      (editor) => @eventRouter.emit("editor-undim")
    )

    @codemirrorInstance.on(
      'mousedown',
      (editor, event) => @checkIfLink(editor, event)
    )

  focus: ->
    @codemirrorInstance.focus()

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
