/*jslint browser: true */
/*global $, createSoundDef */

var createSoundSystem = function (buzz, Bowser) {

    'use strict';

    var SoundSystem = {},
        chosenSoundPlayingMethod,
        oldupdatesPerMinute = 0,
        soundLoopTimer,
        beatNumber = 0,
        totalCreatedSoundObjects = 0,
        soundSystemIsMangled = false,
        CHANNELSPERSOUND = 6,
        endedFirstPlay = 0,
        soundBank = {},
        soundFilesPaths = {},
        soundLoops = [],
        soundLoop,
        checkSound,
        updatesPerMinute,
        playingMethod,
        BUZZ_JS_FIRE_AND_FORGET = 0,
        DYNAMICALLY_CREATE_AUDIO_TAG = 1,
        BUZZJS_WITH_SOUNDBANKS = 2,
        playBy_BUZZ_JS_FIRE_AND_FORGET,
        playBy_DYNAMICALLY_CREATE_AUDIO_TAG,
        playBy_BUZZJS_WITH_SOUNDBANKS,
        play;

    soundLoops.soundIDs = [];
    soundLoops.beatStrings = [];

    SoundSystem.resetLoops = 0;


    SoundSystem.resetLoops = function () {
        soundLoops.soundIDs = [];
        soundLoops.beatStrings = [];
    };


    SoundSystem.SetUpdatesPerMinute = function (updates) {
        updatesPerMinute = updates;
    };

    // if there isn't any code using the bpm setting then we can save a timer, so
    // worth tracking with this variable
    SoundSystem.anyCodeReactingTobpm = false;

    // sets BPM
    // is called by code in patches
    window.bpm = SoundSystem.bpm = function (a) {

        // timid attempt at sanity check.
        // the sound system might well bork out
        // even below 500 bpm.
        if (a === undefined) {
            return;
        }
        if (a > 125) {
            a = 125;
        }
        if (a < 0) {
            a = 0;
        }

        // each beat is made of 4 parts, and we can trigger sounds
        // on each of those, so updatesPerMinute is 4 times the bpm.
        updatesPerMinute = a * 4;
    };

    // called from within patches
    window.play = SoundSystem.play = function (soundID, beatString) {

        SoundSystem.anyCodeReactingTobpm = true;
        beatString = beatString.replace(/\s*/g, "");
        soundLoops.soundIDs.push(soundID);
        soundLoops.beatStrings.push(beatString);
    };


    playBy_BUZZ_JS_FIRE_AND_FORGET = function  (soundFilesPaths, loopedSoundID, soundBank) {
        var soundFilePath = soundFilesPaths[loopedSoundID];
        // This method is the simplest and entails just using buzz.js fire and forget.
        // Each "playing" beat a new object is created.
        var availableSoundBank = new buzz.sound(soundFilePath);
        availableSoundBank.play();
    };

    playBy_DYNAMICALLY_CREATE_AUDIO_TAG = function (soundFilesPaths, loopedSoundID, soundBank) {

        var audioElement, source1;
        var soundFilePath = soundFilesPaths[loopedSoundID];

        // This method is quite "raw" and involves using the
        // audio object directly.
        audioElement = document.createElement('audio');
        audioElement.setAttribute("preload", "auto");
        audioElement.autobuffer = true;

        source1 = document.createElement('source');
        source1.type = 'audio/ogg';
        source1.src = soundFilePath;

        audioElement.appendChild(source1);
        audioElement.addEventListener("load", function () {
            audioElement.play();
            $(".filename span").html(audioElement.src);
        }, true);

        audioElement.play();
    };

    playBy_BUZZJS_WITH_SOUNDBANKS = function (soundFilesPaths, loopedSoundID, soundBank) {
        var availableSoundBank,
            relevantSoundBank = soundBank[loopedSoundID],
            lengthOfSoundBank = relevantSoundBank.length,
            i,
            checkingSoundBank;

        for (i = 0; i < lengthOfSoundBank; i += 1) {
            checkingSoundBank = relevantSoundBank[i];
            if (checkingSoundBank.isEnded()) {
                availableSoundBank = checkingSoundBank;
                break;
            }
        }
        if (availableSoundBank === undefined) {
            if (totalCreatedSoundObjects > 31) {
                soundSystemIsMangled = true;
                $('#soundSystemIsMangledMessage').modal();
                $('#simplemodal-container').height(250);
            }
            availableSoundBank = new buzz.sound(soundFilesPaths[loopedSoundID]);
            soundBank[loopedSoundID].push(availableSoundBank);
            totalCreatedSoundObjects += 1;
        }
        availableSoundBank.play();
    };

    // now that all the various sound playing functions for the different cases are
    // defined, we set the "play" function to the best solution according to
    // the browser/os. We wish we could do this better.
    if (Bowser.chrome || Bowser.firefox) {
        playingMethod = BUZZ_JS_FIRE_AND_FORGET;
        play = playBy_DYNAMICALLY_CREATE_AUDIO_TAG;
    } else if (Bowser.safari || Bowser.ie) {
        playingMethod = BUZZJS_WITH_SOUNDBANKS;
        play = playBy_BUZZJS_WITH_SOUNDBANKS;
    }

    // Called from changeUpdatesPerMinuteIfNeeded
    soundLoop = function () {

        var loopingTheSoundIDs,
            loopedSoundID,
            playOrNoPlay,
            beatString;

        if (soundSystemIsMangled) {
            return;
        }

        beatNumber += 1;
        beatNumber = beatNumber % 16;

        for (loopingTheSoundIDs = 0; loopingTheSoundIDs < soundLoops.soundIDs.length; loopingTheSoundIDs += 1) {


            loopedSoundID = soundLoops.soundIDs[loopingTheSoundIDs];

            // When the user modifies the name of a sample,
            // while she is not done finishing typing, the sample name is "incomplete"
            // or anyways it doesn't map to anything until it's complete,
            // doesn't index any actual sound. So we check for that here.
            if (soundFilesPaths[loopedSoundID]) {
                beatString = soundLoops.beatStrings[loopingTheSoundIDs];
                // the beat string can be any length, we just wrap around if needed.
                playOrNoPlay = beatString.charAt(beatNumber % (beatString.length));
                if (playOrNoPlay === 'x') {
                    // OK so this is what we do here:
                    // when each Audio object plays, it plays from start to end
                    // and you can't get it to re-start until it's completely done
                    // playing.
                    // This is bad because some sounds last a second or so, and they
                    // need to play more often than one time per second.
                    // So there are two possible solutions:
                    // 1) to have 20 or so sound objects, and all the times that
                    //    a file needs playing, scan them and find one that is free,
                    //    then associate that to the file one wants to play
                    //    this works well in IE and Chrome but really bad in Safari
                    //    The problem here is the potentially heavy switching of sound files.
                    // 2) for each file, give it a queue of audio objects.
                    //    This is more complicated but seems to work
                    //    about right in all browsers. Only caveat is that Safari
                    //    needs the audio objects to be preloaded because otherwise
                    //    it jams. Conversely, IE and Chrome don't like them preloaded
                    //    because they have a limit of 35 or so sounds.
                    // So here we went for 2), and we preload the sounds only for
                    // browsers other than Chrome and IE.

                    play(soundFilesPaths, loopedSoundID, soundBank);

                }
            }

        }
    };



    // Called from animate function in animation-controls.js
    SoundSystem.changeUpdatesPerMinuteIfNeeded = function () {

        if (oldupdatesPerMinute !== updatesPerMinute) {
            clearTimeout(soundLoopTimer);

            if (updatesPerMinute !== 0) {
                soundLoopTimer = setInterval(soundLoop, (1000 * 60) / updatesPerMinute);
            }
            oldupdatesPerMinute = updatesPerMinute;
        }
    };



    // Called in init.js
    SoundSystem.closeAndCheckAudio = function () {
        $.modal.close();
        setTimeout(function () {
            if (!buzz.isSupported()) {
                $('#noAudioMessage').modal();
                $('#simplemodal-container').height(200);
            }
        }, 500);
    };

    // Called from loadAndTestAllTheSounds
    checkSound = function (soundDef, soundInfo, callback) {

        var newSound = new buzz.sound(soundInfo.path);

        newSound.mute();
        newSound.load();
        newSound.bind("ended", function (e) {
            newSound.unbind("ended");
            newSound.unmute();
            endedFirstPlay += 1;
            if (endedFirstPlay === soundDef.sounds.length * CHANNELSPERSOUND) {
                callback();
            }
        });
        newSound.play();
        soundBank[soundInfo.name].push(newSound);
    };

    // Called form the document ready block in init.js
    SoundSystem.loadAndTestAllTheSounds = function (callback) {

        var soundDef, soundInfo, cycleSoundDefs, preloadSounds;

        if (buzz.isMP3Supported()) {
            soundDef = createSoundDef("mp3");
        } else if (buzz.isOGGSupported()) {
            soundDef = createSoundDef("ogg");
        } else {
            return;
        }
        
        for (cycleSoundDefs = 0; cycleSoundDefs < soundDef.sounds.length; cycleSoundDefs += 1) {

            soundInfo = soundDef.getByNumber(cycleSoundDefs);

            soundBank[soundInfo.name] = [];
            soundFilesPaths[soundInfo.name] = soundInfo.path;

            // Chrome can deal with dynamic loading
            // of many files but doesn't like loading too many audio objects
            // so fast - it crashes.
            // At the opposite end, Safari doesn't like loading sound dynamically
            // and instead works fine by loading sound all at the beginning.
            if (Bowser.safari) {

                for (preloadSounds = 0; preloadSounds < CHANNELSPERSOUND; preloadSounds += 1) {
                    // if you load and play all the channels of all the sounds all together
                    // the browser freezes, and the OS doesn't feel too well either
                    // so better stagger the checks in time.
                    setTimeout(checkSound, 200 * cycleSoundDefs, soundDef, soundInfo, callback);
                }

            }

        } // end of the for loop

        // if this is chrome, fire the callback immediately
        // otherwise wait untill all the sounds have been tested
        if (!Bowser.safari) {
            callback();
        }
    };

    return SoundSystem;
};
