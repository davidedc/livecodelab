/*
## The SampleBank is responsible for holding the filepaths to any audio that
## needs to be loaded by the browser.
## 
## It automatically handles returning the ogg or mp3 file path.
*/

var SampleBank;

SampleBank = (function() {
  "use strict";  SampleBank.prototype.sounds = [];

  SampleBank.prototype.soundsByName = {};

  SampleBank.prototype.fileType = void 0;

  function SampleBank(buzz) {
    this.fileType = void 0;
    if (buzz.isMP3Supported()) {
      this.fileType = "mp3";
    } else if (buzz.isOGGSupported()) {
      this.fileType = "ogg";
    } else {
      return;
    }
    this.load("bing", "./sound/audioFiles/start_bing");
    this.load("highHatClosed", "./sound/audioFiles/AMB_HHCL");
    this.load("highHatOpen", "./sound/audioFiles/AMB_HHOP");
    this.load("toc3", "./sound/audioFiles/AMB_LTM2");
    this.load("toc4", "./sound/audioFiles/AMB_RIM1");
    this.load("snare", "./sound/audioFiles/AMB_SN13");
    this.load("snare2", "./sound/audioFiles/AMB_SN_5");
    this.load("crash", "./sound/audioFiles/CRASH_1");
    this.load("crash2", "./sound/audioFiles/CRASH_5");
    this.load("crash3", "./sound/audioFiles/CRASH_6");
    this.load("ride", "./sound/audioFiles/RIDE_1");
    this.load("glass", "./sound/audioFiles/glass2");
    this.load("thump", "./sound/audioFiles/8938__patchen__piano-hits-hand-03v2");
    this.load("lowFlash", "./sound/audioFiles/9569__thanvannispen__industrial-low-flash04");
    this.load("lowFlash2", "./sound/audioFiles/9570__thanvannispen__industrial-low-flash07");
    this.load("tranceKick2", "./sound/audioFiles/24004__laya__dance-kick3");
    this.load("tranceKick", "./sound/audioFiles/33325__laya__trance-kick01");
    this.load("voltage", "./sound/audioFiles/49255__keinzweiter__bonobob-funk");
    this.load("beepA", "./sound/audioFiles/100708__steveygos93__bleep_a");
    this.load("beepB", "./sound/audioFiles/100708__steveygos93__bleep_b");
    this.load("beepC", "./sound/audioFiles/100708__steveygos93__bleep_c");
    this.load("beepD", "./sound/audioFiles/100708__steveygos93__bleep_d");
    this.load("alienBeep", "./sound/audioFiles/132389__blackie666__alienbleep");
    this.load("penta1", "./sound/audioFiles/toneMatrix-1");
    this.load("penta2", "./sound/audioFiles/toneMatrix-2");
    this.load("penta3", "./sound/audioFiles/toneMatrix-3");
    this.load("penta4", "./sound/audioFiles/toneMatrix-4");
    this.load("penta5", "./sound/audioFiles/toneMatrix-5");
    this.load("penta6", "./sound/audioFiles/toneMatrix-6");
    this.load("penta7", "./sound/audioFiles/toneMatrix-7");
    this.load("penta8", "./sound/audioFiles/toneMatrix-8");
    this.load("penta9", "./sound/audioFiles/toneMatrix-9");
    this.load("penta10", "./sound/audioFiles/toneMatrix-10");
    this.load("penta11", "./sound/audioFiles/toneMatrix-11");
    this.load("penta12", "./sound/audioFiles/toneMatrix-12");
    this.load("penta13", "./sound/audioFiles/toneMatrix-13");
    this.load("penta14", "./sound/audioFiles/toneMatrix-14");
    this.load("penta15", "./sound/audioFiles/toneMatrix-15");
    this.load("penta16", "./sound/audioFiles/toneMatrix-16");
    this.load("ciack", "./sound/audioFiles/ciack");
    this.load("snap", "./sound/audioFiles/snap");
    this.load("thump2", "./sound/audioFiles/thump2");
    this.load("dish", "./sound/audioFiles/dish");
  }

  SampleBank.prototype.load = function(name, path) {
    var soundNumber;

    soundNumber = this.sounds.length;
    this.sounds.push({
      name: name,
      path: path + "." + this.fileType
    });
    this.soundsByName[name] = soundNumber;
    return soundNumber;
  };

  SampleBank.prototype.getByName = function(name) {
    return this.sounds[this.soundsByName[name]];
  };

  SampleBank.prototype.getByNumber = function(number) {
    return this.sounds[number];
  };

  return SampleBank;

})();
