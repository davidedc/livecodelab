/*global define */

define([
    'programdata'
], function (
    ProgramData
) {

    'use strict';
    var PreProcessor = {};

    PreProcessor.blockcalc = function (program) {

        var blocks, c, starttabs, blockdepth, onlywhitespace;

        blocks = [];
        c = program.pop();

        starttabs = true;
        blockdepth = 0;
        onlywhitespace = true;

        while (c !== null) {

            if (c === ' ') {
                //ingnore spaces
                c = ' ';
            } else if (c === '\t') {
                if (starttabs === true) {
                    blockdepth += 1;
                }
            } else if (c === '\n') {
                if (onlywhitespace === true) {
                    blocks.push(-1);
                } else {
                    blocks.push(blockdepth);
                }
                starttabs = true;
                onlywhitespace = true;
                blockdepth = 0;
            } else {
                starttabs = false;
                onlywhitespace = false;
            }

            c = program.pop();
        }
        blocks.push(blockdepth);
        return blocks;

    };

    PreProcessor.insertBlocks = function (programtext, blocks) {

        var lines, i, output, lastblock, l, b, bdiff, bd;

        output = [];
        lines = programtext.split('\n');
        lastblock = 0;

        for (i = 0; i < lines.length; i += 1) {
            l = lines[i];
            b = blocks[i];
            if (b === -1) {
                b = lastblock;
            } else if (b > lastblock) {
                bdiff = b - lastblock;
                for (bd = 0; bd < bdiff; bd += 1) {
                    output.push('{');
                }
            } else if (b < lastblock) {
                bdiff = lastblock - b;
                for (bd = 0; bd < bdiff; bd += 1) {
                    output.push('}');
                }
            }
            lastblock = b;
            output.push(l);
        }
        return output.join('\n');

    };

    PreProcessor.process = function (programtext) {
        var blocks, p;
        p = new ProgramData(programtext);
        blocks = PreProcessor.blockcalc(p);

        return PreProcessor.insertBlocks(programtext, blocks);
    };

    return PreProcessor;

});

