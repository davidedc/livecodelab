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


// I'm going to put this here, difficult to say where it belongs. In Firefox there
// is a window.back() function that takes you back to the previous page. The effect
// is that when one types "background", in the middle of the sentence the browser
// changes page. Re-defining it so that it causes no harm. This can be probably
// fixed a bit better once we'll have a scope dedicated to livecodelab code
// execution.
// Same applies to other functions below, to avoid tripping on them in the future.
window.back = function() {};
window.forward = function() {};
window.close = function() {};


// The CodeMirror editor
var editor;

// The Autocoder
var autocoder;


// All used globally
var ThreeJsSystem;
var Renderer;
var BigCursor;
var AnimationLoop;
var ProgramLoader;
var LightSystem;
var BlendControls;
var MatrixCommands;
var TimeKeeper;
var DrawFunctionRunner;
var CodeTransformer;
var GraphicsCommands;
var BackgroundPainter;
var EditorDimmer;
var Ui;
var SoundSystem;
var ColourNames;
var ColourFunctions;
var UrlRouter;


// this is the global namespace for the LiveCodeLab application
var LiveCodeLabCore = {};



