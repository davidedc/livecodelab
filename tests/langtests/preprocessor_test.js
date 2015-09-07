/* global exports, require */

var parser = require('../../src/js/lcl/parser');
var ProgramData = require('../../src/js/lcl/programdata');

module.exports = {

    'basic calc': function (test) {

        var progdata = "a b c\nd e f\ng h i";
        var p = new ProgramData(progdata);

        var blocks = parser.preprocessor.blockcalc(p);
        var expected = [0, 0, 0];

        test.deepEqual(blocks, expected);
        test.done();
    },

    'empty line': function (test) {

        var progdata, p, blocks, expected;

        progdata = "a b c\n  \ng h i";
        p = new ProgramData(progdata);

        blocks = parser.preprocessor.blockcalc(p);
        expected = [0, -1, 0];

        test.deepEqual(blocks, expected);
        test.done();
    },

    'single block': function (test) {

        var progdata, p, blocks, expected;

        progdata = " a b c\n\t d e f  \ng h i";
        p = new ProgramData(progdata);

        blocks = parser.preprocessor.blockcalc(p);
        expected = [0, 1, 0];

        test.deepEqual(blocks, expected);
        test.done();
    },

    'single block with empty first line': function (test) {

        var progdata, p, blocks, expected;

        progdata = " a b c\n\n\t d e f  \ng h i";
        p = new ProgramData(progdata);

        blocks = parser.preprocessor.blockcalc(p);
        expected = [0, -1, 1, 0];

        test.deepEqual(blocks, expected);
        test.done();
    },

    'longer block': function (test) {

        var progdata, p, blocks, expected;

        progdata = " a b c\n\t d e f  \n\tg h i";
        p = new ProgramData(progdata);

        blocks = parser.preprocessor.blockcalc(p);
        expected = [0, 1, 1];

        test.deepEqual(blocks, expected);
        test.done();
    },

    'nested block': function (test) {

        var progdata, p, blocks, expected;

        progdata = " a b c\n\t d e f  \n\t\t g h i\n\tj k l\nm n o";
        p = new ProgramData(progdata);

        blocks = parser.preprocessor.blockcalc(p);
        expected = [0, 1, 2, 1, 0];

        test.deepEqual(blocks, expected);
        test.done();
    },

    'complex test': function (test) {

        var progdata, p, blocks, expected;

        progdata = [
            " alpha\t bravo",
            "\t charlie   \t",
            "\t\t delta echo ",
            "\t\t  ",
            "\t\t foxtrot golf ",
            "\t hotel ",
            "\t\t india \t juliett ",
            "kilo"
        ].join('\n');
        p = new ProgramData(progdata);

        blocks = parser.preprocessor.blockcalc(p);
        expected = [0, 1, 2, -1, 2, 1, 2, 0];

        test.deepEqual(blocks, expected);
        test.done();
    },

    'single block with first blank line': function (test) {

        var progdata, p, blocks, expected, finalprog;

        progdata = [
            " alpha\t bravo",
            "",
            "\t charlie   \t",
            "delta"
        ].join('\n');

        expected = [
            " alpha\t bravo {",
            "",
            "\t charlie   \t",
            "}",
            "delta"
        ].join('\n');

        p = new ProgramData(progdata);

        blocks = parser.preprocessor.blockcalc(p);

        finalprog = parser.preprocessor.insertBlocks(progdata, blocks);

        test.deepEqual(finalprog, expected);
        test.done();
    },

    'single block with middle blank line': function (test) {

        var progdata, p, blocks, expected, finalprog;

        progdata = [
            " alpha\t bravo",
            "\t charlie   \t",
            "",
            "\t delta",
            "echo"
        ].join('\n');

        expected = [
            " alpha\t bravo {",
            "\t charlie   \t",
            "",
            "\t delta",
            "}",
            "echo"
        ].join('\n');

        p = new ProgramData(progdata);

        blocks = parser.preprocessor.blockcalc(p);

        finalprog = parser.preprocessor.insertBlocks(progdata, blocks);

        test.deepEqual(finalprog, expected);
        test.done();
    },

    'single block with last blank line': function (test) {

        var progdata, p, blocks, expected, finalprog;

        progdata = [
            " alpha\t bravo",
            "\t charlie   \t",
            "",
            "delta",
        ].join('\n');

        expected = [
            " alpha\t bravo {",
            "\t charlie   \t",
            "",
            "}",
            "delta"
        ].join('\n');

        p = new ProgramData(progdata);

        blocks = parser.preprocessor.blockcalc(p);

        finalprog = parser.preprocessor.insertBlocks(progdata, blocks);

        test.deepEqual(finalprog, expected);
        test.done();
    },

    'adding in block delimiters': function (test) {

        var progdata, p, blocks, expected, finalprog;

        progdata = [
            " alpha\t bravo",
            "\t charlie   \t",
            "\t\t delta echo ",
            "",
            "\t\t foxtrot golf ",
            "\t hotel ",
            "\t\t india \t juliett ",
            "kilo"
        ].join('\n');
        expected = [
            " alpha\t bravo {",
            "\t charlie   \t {",
            "\t\t delta echo ",
            "",
            "\t\t foxtrot golf ",
            "}",
            "\t hotel  {",
            "\t\t india \t juliett ",
            "}",
            "}",
            "kilo"
        ].join('\n');
        p = new ProgramData(progdata);

        blocks = parser.preprocessor.blockcalc(p);

        finalprog = parser.preprocessor.insertBlocks(progdata, blocks);

        test.deepEqual(finalprog, expected);
        test.done();
    },

    'process function works': function (test) {

        var programtext, expected, finalprog;

        programtext = " alpha\t bravo\n\t charlie   \t";
        expected = [
            " alpha\t bravo {",
            "\t charlie   \t",
            "}"
        ].join('\n');

        finalprog = parser.preprocessor.process(programtext);

        test.equal(finalprog, expected);
        test.done();
    },

    'block finished at EOF': function (test) {

        var programtext, expected, finalprog;

        programtext = " alpha\t bravo\n\t charlie   \t\n\t\t delta echo \n\t\t  \n\t\t foxtrot golf \n\t hotel \n\t\t india \t juliett \n kilo";
        expected = [
            " alpha\t bravo {",
            "\t charlie   \t {",
            "\t\t delta echo ",
            "\t\t  ",
            "\t\t foxtrot golf ",
            "}",
            "\t hotel  {",
            "\t\t india \t juliett ",
            "}",
            "}",
            " kilo"
        ].join('\n');

        finalprog = parser.preprocessor.process(programtext);

        test.deepEqual(finalprog, expected);
        test.done();
    },

};

