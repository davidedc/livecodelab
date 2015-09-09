/*global define */

var PreProcessor = {};

var funcRegexp = /\=(.+->)/gm;
var loopRegexp = /^([\/\t]*)(.+times)/gm;

PreProcessor.fixLoops = function (programText) {
    return programText.replace(funcRegexp, "= def $1");
};

PreProcessor.fixFunctionDef = function (programText) {
    return programText.replace(loopRegexp, "$1loop $2");
};

PreProcessor.process = function (programText) {
    var blocks, p;
    var loopRewritten = PreProcessor.fixLoops(programText);
    var funcRewritten = PreProcessor.fixFunctionDef(loopRewritten);
    return funcRewritten;
};

module.exports = PreProcessor;

