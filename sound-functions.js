var beatsPerMinute = 0;
var oldBeatsPerMinute = 0;
var soundLoopTimer;
var beatNumber = 0;

var bpm = function(a) {

  // timid attempt at sanity check.
  // the sound system might well bork out
  // even below 500 bpm.
  if (a > 500) a = 500;
  if (a < 0) a = 0;

  beatsPerMinute = a;
  updateBpmIfChanged();
}

var updateBpmIfChanged = function() {
  if (oldBeatsPerMinute !== beatsPerMinute) {
    //alert('changing beats per minute old ' + oldBeatsPerMinute + ' new: ' + beatsPerMinute);
    clearTimeout(soundLoopTimer);

    if (beatsPerMinute !== 0) {
      soundLoopTimer = setInterval('soundLoop();', (1000 * 60) / beatsPerMinute);
    }
    oldBeatsPerMinute = beatsPerMinute;
  }
  //alert('AFTER old ' + oldBeatsPerMinute + ' new: ' + a);
}

var soundLoop = function() {
  //clearTimeout(soundLoopTimer);
  //alert('soundLoop');
  //if (beatsPerMinute !== 0) {
  //    soundLoopTimer = setTimeout('soundLoop();',(1000*60)/beatsPerMinute);
  //}
  if (soundSystemIsMangled) return;

  beatNumber++;
  beatNumber = beatNumber % 16;

  log('about to loop in '+soundLoops.soundIDs+" of length "+soundLoops.soundIDs.length);
  for (var loopingTheSoundIDs = 0; loopingTheSoundIDs < soundLoops.soundIDs.length; loopingTheSoundIDs++) {
    var loopedSoundID = soundLoops.soundIDs[loopingTheSoundIDs];
    var playOrNoPlay;
    playOrNoPlay = soundLoops.beatStrings[loopingTheSoundIDs].charAt(beatNumber);
    log('checking sound loop '+soundLoops.beatStrings[loopingTheSoundIDs]+" beat "+beatNumber+" : "+playOrNoPlay);
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
      // 2) for each file, give it a queue of audio objects.
      //    This is more complicated but seems to work
      //    about right in all browsers. Only caveat is that Safari
      //    needs the audio objects to be preloaded because otherwise
      //    it jams. Conversely, IE and Chrome don't like them preloaded
      //    because they have a limit of 35 or so sounds.
      // So here we went for 2), and we preload the sounds only for
      // browsers other than Chrome and IE.
      var relevantSoundBank = soundBank[loopedSoundID];
      var lengthOfSoundBank = relevantSoundBank.length;
      var availableSoundBank = undefined;
      log('playing  '+loopedSoundID+" length: "+lengthOfSoundBank);
      for (var checkingAvailableSoundBank = 0; checkingAvailableSoundBank < lengthOfSoundBank; checkingAvailableSoundBank++) {
        var checkingSoundBank = relevantSoundBank[checkingAvailableSoundBank];
        if (checkingSoundBank.isEnded()) {
          availableSoundBank = checkingSoundBank;
          log('sound bank '+checkingAvailableSoundBank+" is available ");
          break;
        } else {
          log('sound bank '+checkingAvailableSoundBank+" has not ended ");
        }
      }
      if (availableSoundBank === undefined) {
        log('creating new sound object ');
        if (totalCreatedSoundObjects > 31) {
          soundSystemIsMangled = true;
          $('#soundSystemIsMangledMessage').modal();
          $('#simplemodal-container').height(250);
        }
        availableSoundBank = new buzz.sound(soundFiles[loopedSoundID]);
        soundBank[loopedSoundID].push(availableSoundBank);
        totalCreatedSoundObjects++;
      }

      
      availableSoundBank.play();
      //soundBank[soundLoops.soundIDs[i]]['lastUsed'] = (soundBank[soundLoops.soundIDs[i]]['lastUsed']+1)%CHANNELSPERSOUND;
    }
  }
}


var addSound = function(soundID, beatString) {
  beatString = beatString.replace(/\s*/g, "");
  soundLoops.soundIDs.push(soundID);
  soundLoops.beatStrings.push(beatString);
  log('pushing '+soundID+" beat: "+beatString);
}
