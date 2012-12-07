/**
 * Extend the Number prototype
 * This needs to stay globally defined
 * @param func
 * @param scope [optional]
 */
Number.prototype.times = function (func, scope) {
    var v = this.valueOf();
    for (var i = 0; i < v; i++) {
        func.call(scope || window, i);
    }
};


// The CodeMirror editor
var editor;

// The Autocoder
var autocoder;


// All used globally
var logger = createDebugger();
var ThreeJs;
var BigCursor;
var LiveCodeLab;
var ProgramLoader;
var LightSystem;
var BlendControls;
var MatrixCommands;
var TimeKeeper;
var CodeTransformer;
var GraphicsCommands;
var BackgroundPainter;
var EditorDimmer;
var Ui;
var SoundSystem;
var ColourNames;

