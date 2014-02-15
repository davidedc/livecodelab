/*global define */

define([
    'lib/lcl/programdata'
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

        var programlines,
            i,
            output,
            lastblockdepth,
            currentline,
            currentdepth,
            bdiff,
            bd,
            trackeddepth,
            prevline,
            emptylines;

        output = [];
        programlines = programtext.split('\n');
        lastblockdepth = 0;
        trackeddepth = 0;
        emptylines = [];

        for (i = 0; i < programlines.length; i += 1) {

            currentline = programlines[i];
            currentdepth = blocks[i];

            if (currentdepth === -1) {
                emptylines.push(currentline);
            } else if (currentdepth > lastblockdepth) {

                bdiff = currentdepth - lastblockdepth;

                for (bd = 0; bd < bdiff; bd += 1) {
                    prevline = output.pop();
                    output.push(prevline + ' {');
                    trackeddepth += 1;
                }

                if (emptylines.length !== 0) {
                    for (bd = 0; bd < emptylines.length; bd += 1) {
                        output.push(emptylines[bd]);
                    }
                    emptylines = [];
                }

                lastblockdepth = currentdepth;
                output.push(currentline);

            } else if (currentdepth < lastblockdepth) {
                bdiff = lastblockdepth - currentdepth;

                if (emptylines.length !== 0) {
                    for (bd = 0; bd < emptylines.length; bd += 1) {
                        output.push(emptylines[bd]);
                    }
                    emptylines = [];
                }

                for (bd = 0; bd < bdiff; bd += 1) {
                    output.push('}');
                    trackeddepth -= 1;
                }
                lastblockdepth = currentdepth;
                output.push(currentline);
            } else {
                lastblockdepth = currentdepth;

                if (emptylines.length !== 0) {
                    for (bd = 0; bd < emptylines.length; bd += 1) {
                        output.push(emptylines[bd]);
                    }
                    emptylines = [];
                }

                output.push(currentline);
            }
        }

        /* if there are any unclosed blocks then close them off */
        if (trackeddepth > 0) {
            for (bd = 0; bd < trackeddepth; bd += 1) {
                output.push('}');
            }
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

