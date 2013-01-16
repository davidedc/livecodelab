"use strict";

var SoundSystem;

SoundSystem = (function() {

  SoundSystem.prototype.oldupdatesPerMinute = 0;

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
    var allBuzzObjectsForWantedSound, availableBuzzObject, buzzObject, scanningBuzzObjectsForWantedSound;
    this.buzzObjectsPool = buzzObjectsPool;
    availableBuzzObject = void 0;
    allBuzzObjectsForWantedSound = this.buzzObjectsPool[loopedSoundID];
    scanningBuzzObjectsForWantedSound = void 0;
    buzzObject = void 0;
    scanningBuzzObjectsForWantedSound = 0;
    while (scanningBuzzObjectsForWantedSound < allBuzzObjectsForWantedSound.length) {
      buzzObject = allBuzzObjectsForWantedSound[scanningBuzzObjectsForWantedSound];
      if (buzzObject.isEnded()) {
        availableBuzzObject = buzzObject;
        break;
      }
      scanningBuzzObjectsForWantedSound += 1;
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
    var beatString, loopedSoundID, loopingTheSoundIDs, playOrNoPlay, _results;
    loopingTheSoundIDs = void 0;
    loopedSoundID = void 0;
    playOrNoPlay = void 0;
    beatString = void 0;
    if (this.soundSystemIsMangled) {
      return;
    }
    this.beatNumber += 1;
    this.beatNumber = this.beatNumber % 16;
    loopingTheSoundIDs = 0;
    _results = [];
    while (loopingTheSoundIDs < this.soundLoops.soundIDs.length) {
      loopedSoundID = this.soundLoops.soundIDs[loopingTheSoundIDs];
      if (this.soundFilesPaths[loopedSoundID]) {
        beatString = this.soundLoops.beatStrings[loopingTheSoundIDs];
        playOrNoPlay = beatString.charAt(this.beatNumber % beatString.length);
        if (playOrNoPlay === "x") {
          this.playSound(this.soundFilesPaths, loopedSoundID, this.buzzObjectsPool);
        }
      }
      _results.push(loopingTheSoundIDs += 1);
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
    newSound.mute();
    newSound.load();
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
    var cycleSoundDefs, preloadSounds, soundDef, soundInfo,
      _this = this;
    soundDef = void 0;
    soundInfo = void 0;
    cycleSoundDefs = void 0;
    preloadSounds = void 0;
    soundDef = this.samplebank;
    cycleSoundDefs = 0;
    while (cycleSoundDefs < soundDef.sounds.length) {
      soundInfo = soundDef.getByNumber(cycleSoundDefs);
      this.buzzObjectsPool[soundInfo.name] = [];
      this.soundFilesPaths[soundInfo.name] = soundInfo.path;
      if (this.Bowser.safari) {
        preloadSounds = 0;
        while (preloadSounds < this.CHANNELSPERSOUND) {
          setTimeout((function() {
            return checkSound;
          }), 200 * cycleSoundDefs, soundDef, soundInfo);
          preloadSounds += 1;
        }
      }
      cycleSoundDefs += 1;
    }
    if (!this.Bowser.safari) {
      return this.eventRouter.trigger("all-sounds-loaded-and tested");
    }
  };

  return SoundSystem;

})();
