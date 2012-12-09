/*jslint browser: true */
/*global $, createSoundDef */

var createSoundSystem = function (buzz, Bowser) {

    'use strict';

    var SoundSystem = {},
        oldupdatesPerMinute = 0,
        soundLoopTimer,
        beatNumber = 0,
        totalCreatedSoundObjects = 0,
        soundSystemIsMangled = false,
        CHANNELSPERSOUND = 6,
        endedFirstPlay = 0,
        buzzObjectsPool = [],
        soundFilesPaths = {},
        soundLoops = [],
        soundLoop,
        checkSound,
        updatesPerMinute,
        play_using_BUZZ_JS_FIRE_AND_FORGET,
        play_using_DYNAMICALLY_CREATED_AUDIO_TAG,
        play_using_BUZZJS_WITH_ONE_POOL_PER_SOUND,
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


		// When each Audio object plays, it plays from start to end
		// and you can't get it to re-start until it's completely done
		// playing.
		// This is problematic because some sounds last a second or so, and they
		// need to play more often than one time per second.
		// So here are possible mechanisms to achieve that:
		//
		// BUZZJS_WITH_ONE_POOL:
		//    to have 20 or so sound objects, and all the times that
		//    a file needs playing, scan them and find one that is free,
		//    then associate that to the file one wants to play
		//    this works well in IE and Chrome but really bad in Safari
		//    The problem here is the potentially heavy switching of sound files.
		//
		// BUZZJS_WITH_ONE_POOL_PER_SOUND:
		//    for each file, give there is a pool of buzz objects that can play it.
		//    This is more complicated but seems to work
		//    about right in all browsers. Only caveat is that Safari
		//    needs the audio objects to be preloaded because otherwise
		//    it jams. Conversely, IE and Chrome don't like them preloaded
		//    because they have a limit of 35 or so sounds.
		//
		// BUZZ_JS_FIRE_AND_FORGET:
    //    This method is the simplest and entails just using buzz.js fire and forget.
    //    Each "playing" beat a new object is created.
    //
		// DYNAMICALLY_CREATED_AUDIO_TAG:
		//    Directly create an audio object each time we need to play a sound.
		//    Once the sound has finished playing, the audio object is garbage collected.

    play_using_BUZZ_JS_FIRE_AND_FORGET = function  (soundFilesPaths, loopedSoundID, buzzObjectsPool) {
        var soundFilePath = soundFilesPaths[loopedSoundID];

        var availableBuzzObject = new buzz.sound(soundFilePath);
        availableBuzzObject.play();
    };

    play_using_DYNAMICALLY_CREATED_AUDIO_TAG = function (soundFilesPaths, loopedSoundID, buzzObjectsPool) {

        var audioElement, source1;
        var soundFilePath = soundFilesPaths[loopedSoundID];

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


    play_using_BUZZJS_WITH_ONE_POOL_PER_SOUND = function (soundFilesPaths, loopedSoundID, buzzObjectsPool) {
        var availableBuzzObject,
            allBuzzObjectsForWantedSound = buzzObjectsPool[loopedSoundID],
            scanningBuzzObjectsForWantedSound,
            buzzObject;

        // check if there is an available buzz object that has finished
        // playing
        for (scanningBuzzObjectsForWantedSound = 0; scanningBuzzObjectsForWantedSound < allBuzzObjectsForWantedSound.length; scanningBuzzObjectsForWantedSound += 1) {
            buzzObject = allBuzzObjectsForWantedSound[scanningBuzzObjectsForWantedSound];
            if (buzzObject.isEnded()) {
                availableBuzzObject = buzzObject;
                break;
            }
        }
        if (availableBuzzObject === undefined) {
            // there are no available buzz objects for this sound
            // which might mean two things: there are too few and we can just
            // create a new one
            // OR there are already too many, so simply put the sound system
            // is mangled.
            if (totalCreatedSoundObjects > 31) {
                soundSystemIsMangled = true;
                $('#soundSystemIsMangledMessage').modal();
                $('#simplemodal-container').height(250);
                return;
            }
            availableBuzzObject = new buzz.sound(soundFilesPaths[loopedSoundID]);
            buzzObjectsPool[loopedSoundID].push(availableBuzzObject);
            totalCreatedSoundObjects += 1;
        }
        // if we are here it means that there is a buzz object to play with
        // (either an existing one that has stopped playing or a freshly-made one)
        availableBuzzObject.play();
    };

    // now that all the various sound playing functions for the different cases are
    // defined, we set the "play" function to the best solution according to
    // the browser/os. We wish we could do this better.
    if (Bowser.firefox) {
        play = play_using_DYNAMICALLY_CREATED_AUDIO_TAG;
    } else if (Bowser.safari || Bowser.ie || Bowser.chrome) {
        play = play_using_BUZZJS_WITH_ONE_POOL_PER_SOUND;
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
                    // transparently plays using the best method for this
                    // browser/os combination
                    play(soundFilesPaths, loopedSoundID, buzzObjectsPool);

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
        buzzObjectsPool[soundInfo.name].push(newSound);
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

            buzzObjectsPool[soundInfo.name] = [];
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
