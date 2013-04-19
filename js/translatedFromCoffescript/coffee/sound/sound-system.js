/*
## SoundSystem tries to abstract away different ways of playing sound, according to
## weird performance characteristics of each browser (ad probably, OS). Cross-browser
## sound playing is really in a sorry state, we are trying to make do here.
*/

var SoundSystem;

SoundSystem = (function() {
  "use strict";  SoundSystem.prototype.oldupdatesPerMinute = 0;

  SoundSystem.prototype.soundLoopTimer = void 0;

  SoundSystem.prototype.beatNumber = 0;

  SoundSystem.prototype.totalCreatedSoundObjects = 0;

  SoundSystem.prototype.soundSystemIsMangled = false;

  SoundSystem.prototype.CHANNELSPERSOUND = 6;

  SoundSystem.prototype.endedFirstPlay = 0;

  SoundSystem.prototype.buzzObjectsPool = [];

  SoundSystem.prototype.soundFilesPaths = {};

  SoundSystem.prototype.soundLoops = [];

  SoundSystem.prototype.updatesPerMinute = void 0;

  SoundSystem.prototype.anyCodeReactingTobpm = false;

  function SoundSystem(eventRouter, buzz, Bowser, samplebank) {
    var _this = this;

    this.eventRouter = eventRouter;
    this.buzz = buzz;
    this.Bowser = Bowser;
    this.samplebank = samplebank;
    this.soundLoops.soundIDs = [];
    this.soundLoops.beatStrings = [];
    if (this.Bowser.firefox) {
      this.playSound = function(a, b, c) {
        return _this.play_using_DYNAMICALLY_CREATED_AUDIO_TAG(a, b, c);
      };
    } else if (this.Bowser.safari || this.Bowser.msie || this.Bowser.chrome) {
      this.playSound = function(a, b, c) {
        return _this.play_using_BUZZJS_WITH_ONE_POOL_PER_SOUND(a, b, c);
      };
    }
    window.bpm = function(a) {
      return _this.bpm(a);
    };
    window.play = function(a, b) {
      return _this.play(a, b);
    };
  }

  SoundSystem.prototype.resetLoops = function() {
    this.soundLoops.soundIDs = [];
    return this.soundLoops.beatStrings = [];
  };

  SoundSystem.prototype.playStartupSound = function() {
    var startup;

    startup = new this.buzz.sound(this.samplebank.getByName("bing").path);
    return startup.play();
  };

  SoundSystem.prototype.SetUpdatesPerMinute = function(updatesPerMinute) {
    this.updatesPerMinute = updatesPerMinute;
  };

  SoundSystem.prototype.bpm = function(a) {
    if (a === undefined) {
      return;
    }
    if (a > 125) {
      a = 125;
    }
    if (a < 0) {
      a = 0;
    }
    return this.updatesPerMinute = a * 4;
  };

  SoundSystem.prototype.play = function(soundID, beatString) {
    this.anyCodeReactingTobpm = true;
    beatString = beatString.replace(/\s*/g, "");
    this.soundLoops.soundIDs.push(soundID);
    return this.soundLoops.beatStrings.push(beatString);
  };

  SoundSystem.prototype.play_using_BUZZ_JS_FIRE_AND_FORGET = function(soundFilesPaths, loopedSoundID, buzzObjectsPool) {
    var availableBuzzObject, soundFilePath;

    this.buzzObjectsPool = buzzObjectsPool;
    soundFilePath = void 0;
    soundFilePath = soundFilesPaths[loopedSoundID];
    availableBuzzObject = new this.buzz.sound(soundFilePath);
    return availableBuzzObject.play();
  };

  SoundSystem.prototype.play_using_DYNAMICALLY_CREATED_AUDIO_TAG = function(soundFilesPaths, loopedSoundID, buzzObjectsPool) {
    var audioElement, soundFilePath, source1,
      _this = this;

    this.buzzObjectsPool = buzzObjectsPool;
    audioElement = void 0;
    source1 = void 0;
    soundFilePath = void 0;
    soundFilePath = soundFilesPaths[loopedSoundID];
    audioElement = document.createElement("audio");
    audioElement.setAttribute("preload", "auto");
    audioElement.autobuffer = true;
    source1 = document.createElement("source");
    source1.type = "audio/ogg";
    source1.src = soundFilePath;
    audioElement.appendChild(source1);
    audioElement.addEventListener("load", (function() {
      audioElement.play();
      return $(".filename span").html(audioElement.src);
    }), true);
    return audioElement.play();
  };

  SoundSystem.prototype.play_using_BUZZJS_WITH_ONE_POOL_PER_SOUND = function(soundFilesPaths, loopedSoundID, buzzObjectsPool) {
    var allBuzzObjectsForWantedSound, availableBuzzObject, buzzObject, _i, _len;

    this.buzzObjectsPool = buzzObjectsPool;
    availableBuzzObject = void 0;
    allBuzzObjectsForWantedSound = this.buzzObjectsPool[loopedSoundID];
    buzzObject = void 0;
    for (_i = 0, _len = allBuzzObjectsForWantedSound.length; _i < _len; _i++) {
      buzzObject = allBuzzObjectsForWantedSound[_i];
      if (buzzObject.isEnded()) {
        availableBuzzObject = buzzObject;
        break;
      }
    }
    if (availableBuzzObject === undefined) {
      if (this.totalCreatedSoundObjects > 31) {
        this.soundSystemIsMangled = true;
        $("#soundSystemIsMangledMessage").modal();
        $("#simplemodal-container").height(250);
        return;
      }
      availableBuzzObject = new this.buzz.sound(soundFilesPaths[loopedSoundID]);
      this.buzzObjectsPool[loopedSoundID].push(availableBuzzObject);
      this.totalCreatedSoundObjects += 1;
    }
    return availableBuzzObject.play();
  };

  SoundSystem.prototype.soundLoop = function() {
    var beatString, loopedSoundID, loopingTheSoundIDs, playOrNoPlay, _i, _ref, _results;

    loopedSoundID = void 0;
    playOrNoPlay = void 0;
    beatString = void 0;
    if (this.soundSystemIsMangled) {
      return;
    }
    this.beatNumber += 1;
    _results = [];
    for (loopingTheSoundIDs = _i = 0, _ref = this.soundLoops.soundIDs.length; 0 <= _ref ? _i < _ref : _i > _ref; loopingTheSoundIDs = 0 <= _ref ? ++_i : --_i) {
      loopedSoundID = this.soundLoops.soundIDs[loopingTheSoundIDs];
      if (this.soundFilesPaths[loopedSoundID]) {
        beatString = this.soundLoops.beatStrings[loopingTheSoundIDs];
        playOrNoPlay = beatString.charAt(this.beatNumber % beatString.length);
        if (playOrNoPlay === "x") {
          _results.push(this.playSound(this.soundFilesPaths, loopedSoundID, this.buzzObjectsPool));
        } else {
          _results.push(void 0);
        }
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  SoundSystem.prototype.changeUpdatesPerMinuteIfNeeded = function() {
    var _this = this;

    if (this.oldupdatesPerMinute !== this.updatesPerMinute) {
      clearTimeout(this.soundLoopTimer);
      if (this.updatesPerMinute !== 0) {
        this.soundLoopTimer = setInterval((function() {
          return _this.soundLoop();
        }), (1000 * 60) / this.updatesPerMinute);
      }
      return this.oldupdatesPerMinute = this.updatesPerMinute;
    }
  };

  SoundSystem.prototype.isAudioSupported = function() {
    var _this = this;

    return setTimeout((function() {
      if (!_this.buzz.isSupported()) {
        $("#noAudioMessage").modal();
        return $("#simplemodal-container").height(200);
      }
    }), 500);
  };

  SoundSystem.prototype.checkSound = function(soundDef, soundInfo) {
    var newSound,
      _this = this;

    newSound = new this.buzz.sound(soundInfo.path);
    newSound.load();
    newSound.mute();
    newSound.bind("ended", function(e) {
      newSound.unbind("ended");
      newSound.unmute();
      _this.endedFirstPlay += 1;
      if (_this.endedFirstPlay === soundDef.sounds.length * _this.CHANNELSPERSOUND) {
        return _this.eventRouter.trigger("all-sounds-loaded-and tested");
      }
    });
    newSound.play();
    return this.buzzObjectsPool[soundInfo.name].push(newSound);
  };

  SoundSystem.prototype.loadAndTestAllTheSounds = function() {
    var cycleSoundDefs, preloadSounds, soundDef, soundInfo, _i, _j, _ref, _ref1,
      _this = this;

    soundDef = void 0;
    soundInfo = void 0;
    preloadSounds = void 0;
    soundDef = this.samplebank;
    for (cycleSoundDefs = _i = 0, _ref = soundDef.sounds.length; 0 <= _ref ? _i < _ref : _i > _ref; cycleSoundDefs = 0 <= _ref ? ++_i : --_i) {
      soundInfo = soundDef.getByNumber(cycleSoundDefs);
      this.buzzObjectsPool[soundInfo.name] = [];
      this.soundFilesPaths[soundInfo.name] = soundInfo.path;
      if (this.Bowser.safari) {
        for (preloadSounds = _j = 0, _ref1 = this.CHANNELSPERSOUND; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; preloadSounds = 0 <= _ref1 ? ++_j : --_j) {
          setTimeout(function(soundDef, soundInfo) {
            return _this.checkSound(soundDef, soundInfo);
          }, 20 * cycleSoundDefs, soundDef, soundInfo);
        }
      }
    }
    if (!this.Bowser.safari) {
      return this.eventRouter.trigger("all-sounds-loaded-and tested");
    }
  };

  return SoundSystem;

})();
