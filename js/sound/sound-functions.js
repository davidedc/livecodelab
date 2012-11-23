/*jslint devel: true */
/*global $, buzz, autocoder, createSoundDef */

var updatesPerMinute = 0;
var oldupdatesPerMinute = 0;
var soundLoopTimer;
var beatNumber = 0;
var totalCreatedSoundObjects = 0;
var soundSystemIsMangled = false;
var CHANNELSPERSOUND = 6;
var endedFirstPlay = 0;
var soundBank = {};
var soundFiles = {};

var chosenSoundPlayingMethod;
if (navigator.userAgent.toLowerCase().indexOf('safari/') > -1) {
	chosenSoundPlayingMethod = 2;
}
else if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
	chosenSoundPlayingMethod = 2;
}
else if (navigator.userAgent.indexOf("Firefox")!=-1) {
	chosenSoundPlayingMethod = 3;
}
else if (navigator.userAgent.toLowerCase().indexOf('chrome') != -1) {
	chosenSoundPlayingMethod = 3;
}



// sets BPM
// is called by code in patches
var bpm = function (a) {

    'use strict';

    // timid attempt at sanity check.
    // the sound system might well bork out
    // even below 500 bpm.
    if (a === undefined) return;
    if (a > 125) a = 125;
    if (a < 0) a = 0;

    // each beat is made of 4 parts, and we can trigger sounds
    // on each of those, so updatesPerMinute is 4 times the bpm.
    updatesPerMinute = a * 4;
};

// called from within patches
var play = function (soundID, beatString) {

    'use strict';

    anyCodeReactingTobpm = true;
    beatString = beatString.replace(/\s*/g, "");
    soundLoops.soundIDs.push(soundID);
    soundLoops.beatStrings.push(beatString);
    logger('pushing ' + soundID + " beat: " + beatString);
};


// Called from animate function in livecodelab.js
var changeUpdatesPerMinuteIfNeeded = function () {

    'use strict';

    if (oldupdatesPerMinute !== updatesPerMinute) {
        //alert('changing beats per minute old ' + oldupdatesPerMinute + ' new: ' + updatesPerMinute);
        clearTimeout(soundLoopTimer);

        if (updatesPerMinute !== 0) {
            soundLoopTimer = setInterval('soundLoop();', (1000 * 60) / updatesPerMinute);
        }
        oldupdatesPerMinute = updatesPerMinute;
    }
    //alert('AFTER old ' + oldupdatesPerMinute + ' new: ' + a);
};

// Called from changeUpdatesPerMinuteIfNeeded
var soundLoop = function () {

    'use strict';

    //clearTimeout(soundLoopTimer);
    //alert('soundLoop');
    //if (updatesPerMinute !== 0) {
    //    soundLoopTimer = setTimeout('soundLoop();',(1000*60)/updatesPerMinute);
    //}

    var loopingTheSoundIDs, checkingAvailableSoundBank;

    if (soundSystemIsMangled) return;

    beatNumber++;
    beatNumber = beatNumber % 16;

    //logger('about to loop in '+soundLoops.soundIDs+" of length "+soundLoops.soundIDs.length);
    for (loopingTheSoundIDs = 0; loopingTheSoundIDs < soundLoops.soundIDs.length; loopingTheSoundIDs++) {


        var loopedSoundID = soundLoops.soundIDs[loopingTheSoundIDs];
        
        // When the user modifies the name of a sample,
        // while she is not done finishing typing, the sample name is "incomplete"
        // or anyways it doesn't map to anything until it's complete,
        // doesn't index any actual sound. So we check for that here.
        if (!(loopedSoundID in soundFiles)) continue;
        
        
        var playOrNoPlay;
        var beatString = soundLoops.beatStrings[loopingTheSoundIDs];
        // the beat string can be any length, we just wrap around if needed.
        playOrNoPlay = beatString.charAt(beatNumber%(beatString.length));
        //logger('checking sound loop '+soundLoops.beatStrings[loopingTheSoundIDs]+" beat "+beatNumber+" : "+playOrNoPlay);
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
                        
            if (chosenSoundPlayingMethod === 1) {
							// This method is the simplest and entails just using buzz.js fire and forget.
							// Each "playing" beat a new object is created.
							
							//if (availableSoundBank === undefined) {
							  availableSoundBank = new buzz.sound(soundFiles[loopedSoundID]);
							  //availableSoundBank.load();
							//}
							//nextAvailableSoundPlayerMethod1++;
              availableSoundBank.play();
            }
            else if (chosenSoundPlayingMethod === 3) {
              // This method is quite "raw" and involves using the
              // audio object directly.
							var audioElement = document.createElement('audio');
							audioElement.setAttribute("preload", "auto");
							audioElement.autobuffer = true;
							
							var source1 = document.createElement('source');
							source1.type= 'audio/ogg';
							source1.src= soundFiles[loopedSoundID];
							audioElement.appendChild(source1);
							audioElement.addEventListener("load", function() { 
								audioElement.play(); 
								//$(".duration span").html(audioElement.duration);
								$(".filename span").html(audioElement.src);
							}, true);

							audioElement.addEventListener("ended", function() { 
								source1.parentNode.removeChild(source1);
								//alert("removing"+source1)
							}, true);
							audioElement.play();

            }
            else if (chosenSoundPlayingMethod === 2) {
							var relevantSoundBank = soundBank[loopedSoundID];
							var lengthOfSoundBank = relevantSoundBank.length;
							var availableSoundBank = undefined;
							//logger('playing  '+loopedSoundID+" length: "+lengthOfSoundBank);
							for (checkingAvailableSoundBank = 0; checkingAvailableSoundBank < lengthOfSoundBank; checkingAvailableSoundBank++) {
									var checkingSoundBank = relevantSoundBank[checkingAvailableSoundBank];
									if (checkingSoundBank.isEnded()) {
											availableSoundBank = checkingSoundBank;
											logger('sound bank ' + checkingAvailableSoundBank + " is available ");
											break;
									} else {
											logger('sound bank ' + checkingAvailableSoundBank + " has not ended ");
									}
							}
							if (availableSoundBank === undefined) {
									logger('creating new sound object ');
									if (totalCreatedSoundObjects > 31) {
											soundSystemIsMangled = true;
											$('#soundSystemIsMangledMessage').modal();
											$('#simplemodal-container').height(250);
									}
									availableSoundBank = new buzz.sound(soundFiles[loopedSoundID]);
									// loading the sound here doesn't seem to matter
									//availableSoundBank.load();
									soundBank[loopedSoundID].push(availableSoundBank);
									totalCreatedSoundObjects++;
							}
              availableSoundBank.play();
            }


            //soundBank[soundLoops.soundIDs[i]]['lastUsed'] = (soundBank[soundLoops.soundIDs[i]]['lastUsed']+1)%CHANNELSPERSOUND;
        }
    }
};

// Called in init.js
var closeAndCheckAudio = function () {

    'use strict';

    //$('#noWebGLMessage').close();
    $.modal.close();
    setTimeout('checkAudio();', 500);
};

// Called from closeAndCheckAudio
var checkAudio = function () {

    'use strict';

    if (!buzz.isSupported()) {
        //if (true) {
        $('#noAudioMessage').modal();
        $('#simplemodal-container').height(200);
    }
};

// Called form the document ready block in init.js
var loadAndTestAllTheSounds = function (callback) {

    'use strict';

    var soundDef, soundInfo, cycleSoundDefs, preloadSounds;

    if (buzz.isMP3Supported()) {
        soundDef = createSoundDef("mp3");
    } else if (buzz.isOGGSupported()) {
        soundDef = createSoundDef("ogg");
    } else {
        return;
    }

    for (cycleSoundDefs = 0; cycleSoundDefs < soundDef.sounds.length; cycleSoundDefs++) {

        soundInfo = soundDef.getByNumber(cycleSoundDefs)

        soundBank[soundInfo.name] = [];
        soundFiles[soundInfo.name] = soundInfo.path;

        logger("loading sound: " + soundInfo.name);

        // Chrome can deal with dynamic loading
        // of many files but doesn't like loading too many audio objects
        // so fast - it crashes.
        // At the opposite end, Safari doesn't like loading sound dynamically
        // and instead works fine by loading sound all at the beginning.
        if (navigator.userAgent.indexOf("Firefox")===-1 && navigator.userAgent.toLowerCase().indexOf('chrome') === -1 && !(/MSIE (\d+\.\d+);/.test(navigator.userAgent))) {

            for (preloadSounds = 0; preloadSounds < CHANNELSPERSOUND; preloadSounds++) {
                logger("checking sound " + soundInfo.name);
                // if you load and play all the channels of all the sounds all together
                // the browser freezes, and the OS doesn't feel too well either
                // so better stagger the checks in time.
                setTimeout(checkSound, 200 * cycleSoundDefs, soundDef, soundInfo, callback);
            }

        }

    } // end of the for loop

    // if this is chrome, fire the callback immediately
    // otherwise wait untill all the sounds have been tested
     if (navigator.userAgent.indexOf("Firefox")!=-1 || navigator.userAgent.toLowerCase().indexOf('chrome') > -1 || (/MSIE (\d+\.\d+);/.test(navigator.userAgent))) {
         callback();
     }
};

// Called from loadAndTestAllTheSounds
var checkSound = function (soundDef, soundInfo, callback) {

    'use strict';

    var newSound = new buzz.sound(soundInfo.path);

    logger("testing sound: " + soundInfo.path);
    newSound.mute();
    newSound.load();
    newSound.bind("ended", function (e) {
        newSound.unbind("ended");
        newSound.unmute();
        endedFirstPlay++;
        if (endedFirstPlay % 10 === 0) $('#loading').append('/');
        logger("tested " + endedFirstPlay + " sounds");
        if (endedFirstPlay === soundDef.sounds.length * CHANNELSPERSOUND) {
            logger("tested all sounds");
            callback();
        }
    });
    newSound.play();
    soundBank[soundInfo.name].push(newSound);
};
