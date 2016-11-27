###
## The Editor is just a wrapper for the CodeMirror editor.
## Contains a couple of handful functions and hooks-up the contents
## with the other parts of LiveCodeLab.
###

CodeMirror      = require '../../js/codemirror/lib/codemirror'
window.CodeMirror = CodeMirror
require '../../js/codemirror/livecodelang'

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
        indentWithTabs: true
        tabSize: 3
        indentUnit: 3
        lineWrapping: true
        styleSelectedText: true
      }
    )

    # We want the code editor to always have focus
    # since there is nothing else to type into.
    @codemirrorInstance.on(
      'blur',
      (editor) => editor.focus()
    )

    @codemirrorInstance.on(
      'change',
      (editor) => @eventRouter.emit("code-changed", @codemirrorInstance.getValue())
    )

    @codemirrorInstance.on(
      'cursorActivity',
      (editor) => @suspendDimmingAndCheckIfLink()
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

  suspendDimmingAndCheckIfLink: (editor) ->
    cursorP = undefined
    currentLineContent = undefined
    program = undefined

    # Now this is kind of a nasty hack: we check where the
    # cursor is, and if it's over a line containing the
    # link then we follow it.
    # There was no better way, for some reason some onClick
    # events are lost, so what happened is that one would click on
    # the link and nothing would happen.
    cursorP = @codemirrorInstance.getCursor(true)
    if cursorP.ch > 2
      currentLineContent = @codemirrorInstance.getLine(cursorP.line)
      if currentLineContent.indexOf("// next-tutorial:") is 0
        currentLineContent = currentLineContent.substring(17)
        currentLineContent = currentLineContent.replace("_", "")
        program = currentLineContent + "Tutorial"
        setTimeout (=>
          @eventRouter.emit("load-program", program)
        ), 200
    return if @codemirrorInstance.getValue() is ""
    @eventRouter.emit("editor-undim")

module.exports = Editor

