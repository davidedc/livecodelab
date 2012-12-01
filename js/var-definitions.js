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



// All used by Three.js
// add Stats.js - https://github.com/mrdoob/stats.js
var stats = new Stats();
// Align bottom-left
stats.getDomElement().style.position = 'absolute';
stats.getDomElement().style.right = '0px';
stats.getDomElement().style.top = '0px';
$(document).ready(function () {
    document.body.appendChild(stats.getDomElement());
});



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

var BackgroundPainter;

var EditorDimmer;

