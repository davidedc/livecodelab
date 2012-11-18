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

    soundDef.load('toc', './sound/audioFiles/AMB_BD_1');

    soundDef.load('highHatClosed', './sound/audioFiles/AMB_HHCL');

    soundDef.load('highHatOpen', './sound/audioFiles/AMB_HHOP');

    soundDef.load('toc2', './sound/audioFiles/AMB_HTM');

    soundDef.load('toc3', './sound/audioFiles/AMB_LTM2');

    soundDef.load('toc4', './sound/audioFiles/AMB_RIM1');

    soundDef.load('snare', './sound/audioFiles/AMB_SN13');

    soundDef.load('snare2', './sound/audioFiles/AMB_SN_5');

    soundDef.load('china', './sound/audioFiles/CHINA_1');

    soundDef.load('crash', './sound/audioFiles/CRASH_1');

    soundDef.load('crash2', './sound/audioFiles/CRASH_5');

    soundDef.load('crash3', './sound/audioFiles/CRASH_6');

    soundDef.load('ride', './sound/audioFiles/RIDE_1');

    soundDef.load('glass', './sound/audioFiles/glass2');

    soundDef.load('glass1', './sound/audioFiles/glass3');

    soundDef.load('glass2', './sound/audioFiles/glass4');

    soundDef.load('glass3', './sound/audioFiles/glass5');

    soundDef.load('thump', './sound/audioFiles/8938__patchen__piano-hits-hand-03v2');

    soundDef.load('lowFlash', './sound/audioFiles/9569__thanvannispen__industrial-low-flash04');

    soundDef.load('lowFlash2', './sound/audioFiles/9570__thanvannispen__industrial-low-flash07');

    soundDef.load('tranceKick2', './sound/audioFiles/24004__laya__dance-kick3');

    soundDef.load('tranceKick', './sound/audioFiles/33325__laya__trance-kick01');

    soundDef.load('wosh', './sound/audioFiles/33960__krlox__pudricion-4');

    soundDef.load('voltage', './sound/audioFiles/49255__keinzweiter__bonobob-funk');

    soundDef.load('beepA', './sound/audioFiles/100708__steveygos93__bleep_a');

    soundDef.load('beepB', './sound/audioFiles/100708__steveygos93__bleep_b');

    soundDef.load('beepC', './sound/audioFiles/100708__steveygos93__bleep_c');

    soundDef.load('beepD', './sound/audioFiles/100708__steveygos93__bleep_d');

    soundDef.load('beep', './sound/audioFiles/116508_Beep');

    soundDef.load('hello', './sound/audioFiles/116508_Hello');

    soundDef.load('alienBeep', './sound/audioFiles/132389__blackie666__alienbleep');

    return soundDef;

};
