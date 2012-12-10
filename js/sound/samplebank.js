/**
 * The SampleBank is responsible for holding the filepaths to any audio that
 * needs to be loaded by the browser.
 *
 * It automatically handles returning the ogg or mp3 file path.
 */

var createSampleBank = function (buzz) {

    'use strict';

    var SampleBank,
        fileType;

    if (buzz.isMP3Supported()) {
        fileType = "mp3";
    } else if (buzz.isOGGSupported()) {
        fileType = "ogg";
    } else {
        return;
    }

    SampleBank = {
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

    SampleBank.load('bing', './sound/audioFiles/start_bing');
    SampleBank.load('highHatClosed', './sound/audioFiles/AMB_HHCL');
    SampleBank.load('highHatOpen', './sound/audioFiles/AMB_HHOP');
    SampleBank.load('toc3', './sound/audioFiles/AMB_LTM2');
    SampleBank.load('toc4', './sound/audioFiles/AMB_RIM1');
    SampleBank.load('snare', './sound/audioFiles/AMB_SN13');
    SampleBank.load('snare2', './sound/audioFiles/AMB_SN_5');
    SampleBank.load('crash', './sound/audioFiles/CRASH_1');
    SampleBank.load('crash2', './sound/audioFiles/CRASH_5');
    SampleBank.load('crash3', './sound/audioFiles/CRASH_6');
    SampleBank.load('ride', './sound/audioFiles/RIDE_1');
    SampleBank.load('glass', './sound/audioFiles/glass2');
    SampleBank.load('thump', './sound/audioFiles/8938__patchen__piano-hits-hand-03v2');
    SampleBank.load('lowFlash', './sound/audioFiles/9569__thanvannispen__industrial-low-flash04');
    SampleBank.load('lowFlash2', './sound/audioFiles/9570__thanvannispen__industrial-low-flash07');
    SampleBank.load('tranceKick2', './sound/audioFiles/24004__laya__dance-kick3');
    SampleBank.load('tranceKick', './sound/audioFiles/33325__laya__trance-kick01');
    SampleBank.load('voltage', './sound/audioFiles/49255__keinzweiter__bonobob-funk');
    SampleBank.load('beepA', './sound/audioFiles/100708__steveygos93__bleep_a');
    SampleBank.load('beepB', './sound/audioFiles/100708__steveygos93__bleep_b');
    SampleBank.load('beepC', './sound/audioFiles/100708__steveygos93__bleep_c');
    SampleBank.load('beepD', './sound/audioFiles/100708__steveygos93__bleep_d');
    SampleBank.load('alienBeep', './sound/audioFiles/132389__blackie666__alienbleep');
    SampleBank.load('penta1', './sound/audioFiles/toneMatrix-1');
    SampleBank.load('penta2', './sound/audioFiles/toneMatrix-2');
    SampleBank.load('penta3', './sound/audioFiles/toneMatrix-3');
    SampleBank.load('penta4', './sound/audioFiles/toneMatrix-4');
    SampleBank.load('penta5', './sound/audioFiles/toneMatrix-5');
    SampleBank.load('penta6', './sound/audioFiles/toneMatrix-6');
    SampleBank.load('penta7', './sound/audioFiles/toneMatrix-7');
    SampleBank.load('penta8', './sound/audioFiles/toneMatrix-8');
    SampleBank.load('penta9', './sound/audioFiles/toneMatrix-9');
    SampleBank.load('penta10', './sound/audioFiles/toneMatrix-10');
    SampleBank.load('penta11', './sound/audioFiles/toneMatrix-11');
    SampleBank.load('penta12', './sound/audioFiles/toneMatrix-12');
    SampleBank.load('penta13', './sound/audioFiles/toneMatrix-13');
    SampleBank.load('penta14', './sound/audioFiles/toneMatrix-14');
    SampleBank.load('penta15', './sound/audioFiles/toneMatrix-15');
    SampleBank.load('penta16', './sound/audioFiles/toneMatrix-16');
    SampleBank.load('ciack', './sound/audioFiles/ciack');
    SampleBank.load('snap', './sound/audioFiles/snap');
    SampleBank.load('thump2', './sound/audioFiles/thump2');
    SampleBank.load('dish', './sound/audioFiles/dish');

    return SampleBank;
};
