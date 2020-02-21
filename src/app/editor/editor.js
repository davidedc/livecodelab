/* global require, CodeMirror */
/*
 *# The Editor is just a wrapper for the CodeMirror editor.
 *# Contains a couple of handful functions and hooks-up the contents
 *# with the other parts of LiveCodeLab.
 */

require('../lib/codemirror/livecodelang');

export default class Editor {
  constructor(eventRouter, codeTextArea) {
    this.eventRouter = eventRouter;
    this.codeTextArea = codeTextArea;
    this.codemirrorInstance = CodeMirror.fromTextArea(this.codeTextArea, {
      mode: 'livecodelab',
      theme: 'night',
      lineNumbers: false,
      scrollbarStyle: 'null',
      indentWithTabs: true,
      tabSize: 3,
      indentUnit: 3,
      lineWrapping: true,
      styleSelectedText: true,
      autofocus: true,
    });

    // Setup Event Listeners
    this.eventRouter.addListener('reset', () =>
      this.codemirrorInstance.setValue('')
    );

    this.eventRouter.addListener(
      'code-updated-by-livecodelab',
      elaboratedSource => {
        const cursorPosBeforeCheck = this.codemirrorInstance.getCursor();
        cursorPosBeforeCheck.ch = cursorPosBeforeCheck.ch + 1;
        this.setValue(elaboratedSource);
        this.setCursor(cursorPosBeforeCheck);
      }
    );

    this.hideAndUnfocus();

    this.codemirrorInstance.on('change', () =>
      this.eventRouter.emit('code-changed', this.codemirrorInstance.getValue())
    );

    this.codemirrorInstance.on('mousedown', (editor, event) =>
      this.checkIfLink(editor, event)
    );
  }

  showAndFocus() {
    this.codemirrorInstance.getWrapperElement().style.opacity = '1';
    this.codemirrorInstance.focus();
  }

  hideAndUnfocus() {
    this.codemirrorInstance.getWrapperElement().style.opacity = '0';
  }

  getValue() {
    this.codemirrorInstance.getValue();
  }

  getCursor(a) {
    this.codemirrorInstance.getCursor(a);
  }

  setCursor(a, b) {
    this.codemirrorInstance.setCursor(a, b);
  }

  clearHistory(a, b) {
    this.codemirrorInstance.clearHistory(a, b);
  }

  getLine(a) {
    this.codemirrorInstance.getLine(a);
  }

  setValue(a) {
    this.codemirrorInstance.setValue(a);
  }

  lineCount() {
    this.codemirrorInstance.lineCount();
  }

  checkIfLink(editor, event) {
    const coords = editor.coordsChar({ left: event.pageX, top: event.pageY });
    if (editor.getTokenTypeAt(coords) === 'link') {
      const token = editor.getTokenAt(coords);
      const program = token.string.split(':')[1].replace('_', '') + 'Tutorial';
      this.eventRouter.emit('load-program', program);
    }
  }
}
