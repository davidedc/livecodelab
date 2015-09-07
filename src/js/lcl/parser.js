
var lexer        = require('./lexer');
var preprocessor = require('./preprocessor');
var parser       = require('../../../src/generated/parser').parser;

parser.lexer = lexer;

parser.yy.parseError = (function (error) {
    console.log(error);
});

module.exports = {
    parser: parser,
    preprocessor: preprocessor,
    parse: parser.parse.bind(parser),
    preprocess: preprocessor.process,
    setErrFunc: function (errFunc) {
        parser.yy.parseError = errFunc;
    }
};

