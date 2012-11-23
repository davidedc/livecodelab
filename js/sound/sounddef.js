/*jslint */
/*global */

var createSoundDef = function (fileType) {

    'use strict';

    var soundDef = {
        sounds: [],

        soundsByName: {},

        // Should be either mp3 or ogg
        fileType: fileType,

        load: function (name, path) {
            var soundNumber = this.sounds.length;
            this.sounds.push({
                name: name,
                path: path + "." + this.fileType
            });
            this.soundsByName[name] = soundNumber;
            return soundNumber;
        },

        getByName: function (name) {
            return this.sounds[this.soundsByName[name]];
        },

        getByNumber: function (number) {
            return this.sounds[number];
        }

    };

    // first value here below of soundDefCounter is zero.

    soundDef.load('bing', './sound/audioFiles/start_bing');

    soundDef.load('highHatClosed', './sound/audioFiles/AMB_HHCL');

    soundDef.load('highHatOpen', './sound/audioFiles/AMB_HHOP');

    soundDef.load('toc3', './sound/audioFiles/AMB_LTM2');

    soundDef.load('toc4', './sound/audioFiles/AMB_RIM1');

    soundDef.load('snare', './sound/audioFiles/AMB_SN13');

    soundDef.load('snare2', './sound/audioFiles/AMB_SN_5');

    soundDef.load('crash', './sound/audioFiles/CRASH_1');

    soundDef.load('crash2', './sound/audioFiles/CRASH_5');

    soundDef.load('crash3', './sound/audioFiles/CRASH_6');

    soundDef.load('ride', './sound/audioFiles/RIDE_1');

    soundDef.load('glass', './sound/audioFiles/glass2');

    soundDef.load('thump', './sound/audioFiles/8938__patchen__piano-hits-hand-03v2');

    soundDef.load('lowFlash', './sound/audioFiles/9569__thanvannispen__industrial-low-flash04');

    soundDef.load('lowFlash2', './sound/audioFiles/9570__thanvannispen__industrial-low-flash07');

    soundDef.load('tranceKick2', './sound/audioFiles/24004__laya__dance-kick3');

    soundDef.load('tranceKick', './sound/audioFiles/33325__laya__trance-kick01');

    soundDef.load('voltage', './sound/audioFiles/49255__keinzweiter__bonobob-funk');

    soundDef.load('beepA', './sound/audioFiles/100708__steveygos93__bleep_a');

    soundDef.load('beepB', './sound/audioFiles/100708__steveygos93__bleep_b');

    soundDef.load('beepC', './sound/audioFiles/100708__steveygos93__bleep_c');

    soundDef.load('beepD', './sound/audioFiles/100708__steveygos93__bleep_d');

    soundDef.load('alienBeep', './sound/audioFiles/132389__blackie666__alienbleep');

    soundDef.load('penta1', './sound/audioFiles/toneMatrix-1');

    soundDef.load('penta2', './sound/audioFiles/toneMatrix-2');

    soundDef.load('penta3', './sound/audioFiles/toneMatrix-3');

    soundDef.load('penta4', './sound/audioFiles/toneMatrix-4');

    soundDef.load('penta5', './sound/audioFiles/toneMatrix-5');

    soundDef.load('penta6', './sound/audioFiles/toneMatrix-6');

    soundDef.load('penta7', './sound/audioFiles/toneMatrix-7');

    soundDef.load('penta8', './sound/audioFiles/toneMatrix-8');

    soundDef.load('penta9', './sound/audioFiles/toneMatrix-9');

    soundDef.load('penta10', './sound/audioFiles/toneMatrix-10');

    soundDef.load('penta11', './sound/audioFiles/toneMatrix-11');

    soundDef.load('penta12', './sound/audioFiles/toneMatrix-12');

    soundDef.load('penta13', './sound/audioFiles/toneMatrix-13');

    soundDef.load('penta14', './sound/audioFiles/toneMatrix-14');

    soundDef.load('penta15', './sound/audioFiles/toneMatrix-15');

    soundDef.load('penta16', './sound/audioFiles/toneMatrix-16');

    soundDef.load('ciack', './sound/audioFiles/ciack');

    soundDef.load('snap', './sound/audioFiles/snap');

    soundDef.load('thump2', './sound/audioFiles/thump2');

    soundDef.load('dish', './sound/audioFiles/dish');

    return soundDef;

};
