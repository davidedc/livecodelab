/* global require */
// The SampleBank is responsible for loading the audio files into buffers

export default class SampleBank {
  constructor(audioAPI) {
    this.audioAPI = audioAPI;

    this.load(
      'alienBeep',
      require('./audiofiles/132389__blackie666__alienbleep').default
    );

    this.load(
      'beep',
      require('./audiofiles/100708__steveygos93__bleep_a').default
    );
    this.load(
      'beep0',
      require('./audiofiles/100708__steveygos93__bleep_a').default
    );
    this.load(
      'beep1',
      require('./audiofiles/100708__steveygos93__bleep_b').default
    );
    this.load(
      'beep2',
      require('./audiofiles/100708__steveygos93__bleep_c').default
    );
    this.load(
      'beep3',
      require('./audiofiles/100708__steveygos93__bleep_d').default
    );

    this.load('bing', require('./audiofiles/start_bing').default);

    this.load('DJCastro', require('./audiofiles/castro-sample1').default);
    this.load('DJCastro0', require('./audiofiles/castro-sample1').default);
    this.load('DJCastro1', require('./audiofiles/castro-sample2').default);
    this.load('DJCastro2', require('./audiofiles/castro-sample3').default);
    this.load('DJCastro3', require('./audiofiles/castro-sample4').default);
    this.load('DJCastro4', require('./audiofiles/castro-sample5').default);
    this.load('DJCastro5', require('./audiofiles/castro-sample6').default);
    this.load('DJCastro6', require('./audiofiles/castro-sample7').default);
    this.load('DJCastro7', require('./audiofiles/castro-sample8').default);
    this.load('DJCastro8', require('./audiofiles/castro-sample9').default);
    this.load('DJCastro9', require('./audiofiles/castro-sample10').default);
    this.load('DJCastro10', require('./audiofiles/castro-sample11').default);
    this.load('DJCastro11', require('./audiofiles/castro-sample12').default);
    this.load('DJCastro12', require('./audiofiles/castro-sample13').default);
    this.load('DJCastro13', require('./audiofiles/castro-sample14').default);
    this.load('DJCastro14', require('./audiofiles/castro-sample15').default);
    this.load('DJCastro15', require('./audiofiles/castro-sample16').default);
    this.load('DJCastro16', require('./audiofiles/castro-sample17').default);
    this.load('DJCastro17', require('./audiofiles/castro-sample18').default);
    this.load('DJCastro18', require('./audiofiles/castro-sample19').default);
    this.load('DJCastro19', require('./audiofiles/castro-sample20').default);
    this.load('DJCastro20', require('./audiofiles/castro-sample21').default);
    this.load('DJCastro21', require('./audiofiles/castro-sample22').default);
    this.load('DJCastro22', require('./audiofiles/castro-sample23').default);
    this.load('DJCastro23', require('./audiofiles/castro-sample24').default);
    this.load('DJCastro24', require('./audiofiles/castro-sample25').default);
    this.load('DJCastro25', require('./audiofiles/castro-sample26').default);

    this.load('ciack', require('./audiofiles/ciack').default);
    this.load('ciack0', require('./audiofiles/ciack').default);
    this.load('ciack1', require('./audiofiles/a-ciack2').default);

    this.load('cosmos', require('./audiofiles/cosmos').default);

    this.load('crash', require('./audiofiles/CRASH_1').default);
    this.load('crash0', require('./audiofiles/CRASH_1').default);
    this.load('crash1', require('./audiofiles/CRASH_5').default);
    this.load('crash2', require('./audiofiles/CRASH_6').default);

    this.load('detune', require('./audiofiles/detune').default);

    this.load('dish', require('./audiofiles/dish').default);
    this.load('dish0', require('./audiofiles/dish').default);
    this.load('dish1', require('./audiofiles/a-dish2').default);
    this.load('dish2', require('./audiofiles/a-dish3').default);

    this.load('downstairs', require('./audiofiles/downstairs').default);

    this.load('glass', require('./audiofiles/glass').default);

    this.load('growl', require('./audiofiles/growl1').default);
    this.load('growl0', require('./audiofiles/growl1').default);
    this.load('growl1', require('./audiofiles/growl2').default);
    this.load('growl2', require('./audiofiles/growl3').default);
    this.load('growl3', require('./audiofiles/growl4').default);
    this.load('growl4', require('./audiofiles/growl5').default);
    this.load('growl5', require('./audiofiles/growl6').default);

    this.load('highHatClosed', require('./audiofiles/AMB_HHCL').default);
    this.load('highHatOpen', require('./audiofiles/AMB_HHOP').default);

    this.load('hiss', require('./audiofiles/a-hiss1').default);
    this.load('hiss0', require('./audiofiles/a-hiss1').default);
    this.load('hiss1', require('./audiofiles/a-hiss2').default);
    this.load('hiss2', require('./audiofiles/a-hiss3').default);

    this.load('hoover', require('./audiofiles/hoover1').default);
    this.load('hoover0', require('./audiofiles/hoover1').default);
    this.load('hoover1', require('./audiofiles/hoover2').default);

    this.load(
      'lowFlash',
      require('./audiofiles/9569__thanvannispen__industrial-low-flash04')
        .default
    );
    this.load(
      'lowFlash0',
      require('./audiofiles/9569__thanvannispen__industrial-low-flash04')
        .default
    );
    this.load(
      'lowFlash1',
      require('./audiofiles/9570__thanvannispen__industrial-low-flash07')
        .default
    );

    this.load('mouth', require('./audiofiles/a-mouth1').default);
    this.load('mouth0', require('./audiofiles/a-mouth1').default);
    this.load('mouth1', require('./audiofiles/a-mouth2').default);
    this.load('mouth2', require('./audiofiles/a-mouth3').default);
    this.load('mouth3', require('./audiofiles/a-mouth4').default);
    this.load('mouth4', require('./audiofiles/a-mouth5').default);

    this.load('penta0', require('./audiofiles/toneMatrix-1').default);
    this.load('penta1', require('./audiofiles/toneMatrix-2').default);
    this.load('penta2', require('./audiofiles/toneMatrix-3').default);
    this.load('penta3', require('./audiofiles/toneMatrix-4').default);
    this.load('penta4', require('./audiofiles/toneMatrix-5').default);
    this.load('penta5', require('./audiofiles/toneMatrix-6').default);
    this.load('penta6', require('./audiofiles/toneMatrix-7').default);
    this.load('penta7', require('./audiofiles/toneMatrix-8').default);
    this.load('penta8', require('./audiofiles/toneMatrix-9').default);
    this.load('penta9', require('./audiofiles/toneMatrix-10').default);
    this.load('penta10', require('./audiofiles/toneMatrix-11').default);
    this.load('penta11', require('./audiofiles/toneMatrix-12').default);
    this.load('penta12', require('./audiofiles/toneMatrix-13').default);
    this.load('penta13', require('./audiofiles/toneMatrix-14').default);
    this.load('penta14', require('./audiofiles/toneMatrix-15').default);
    this.load('penta15', require('./audiofiles/toneMatrix-16').default);

    this.load('pianoLDChord', require('./audiofiles/pianoLDChordsA').default);
    this.load('pianoLDChord0', require('./audiofiles/pianoLDChordsA').default);
    this.load('pianoLDChord1', require('./audiofiles/pianoLDChordsB').default);
    this.load('pianoLDChord2', require('./audiofiles/pianoLDChordsC').default);
    this.load('pianoLDChord3', require('./audiofiles/pianoLDChordsE').default);

    this.load('pianoLHChord', require('./audiofiles/pianoLHChordsA').default);
    this.load('pianoLHChord0', require('./audiofiles/pianoLHChordsA').default);
    this.load('pianoLHChord1', require('./audiofiles/pianoLHChordsB').default);
    this.load('pianoLHChord2', require('./audiofiles/pianoLHChordsC').default);
    this.load('pianoLHChord3', require('./audiofiles/pianoLHChordsE').default);

    this.load('pianoRHChord', require('./audiofiles/pianoRHChordsA').default);
    this.load('pianoRHChord0', require('./audiofiles/pianoRHChordsA').default);
    this.load('pianoRHChord1', require('./audiofiles/pianoRHChordsB').default);
    this.load('pianoRHChord2', require('./audiofiles/pianoRHChordsC').default);
    this.load('pianoRHChord3', require('./audiofiles/pianoRHChordsE').default);

    this.load('ride', require('./audiofiles/RIDE_1').default);

    this.load('rust', require('./audiofiles/rust1').default);
    this.load('rust0', require('./audiofiles/rust1').default);
    this.load('rust1', require('./audiofiles/rust2').default);
    this.load('rust2', require('./audiofiles/rust3').default);

    // scratches of short length
    this.load('scratch', require('./audiofiles/scratch1').default);
    this.load('scratch0', require('./audiofiles/scratch1').default);
    this.load('scratch1', require('./audiofiles/scratch2').default);
    this.load('scratch2', require('./audiofiles/scratch4').default);
    this.load('scratch3', require('./audiofiles/scratch5').default);
    this.load('scratch4', require('./audiofiles/scratch6').default);
    this.load('scratch5', require('./audiofiles/scratch7').default);
    this.load('scratch6', require('./audiofiles/scratch8').default);
    this.load('scratch7', require('./audiofiles/scratch9').default);
    this.load('scratch8', require('./audiofiles/scratch10').default);
    this.load('scratch9', require('./audiofiles/scratch11').default);
    this.load('scratch10', require('./audiofiles/scratch17').default);
    this.load('scratch11', require('./audiofiles/scratch21').default);
    this.load('scratch12', require('./audiofiles/scratch22').default);
    this.load('scratch13', require('./audiofiles/scratch24').default);

    // scratches of high pitch
    this.load('scratch-high', require('./audiofiles/scratch19').default);
    this.load('scratch-high0', require('./audiofiles/scratch19').default);
    this.load('scratch-high1', require('./audiofiles/scratch20').default);

    // scratches of long length
    this.load('scratch-long', require('./audiofiles/scratch3').default);
    this.load('scratch-long0', require('./audiofiles/scratch3').default);
    this.load('scratch-long1', require('./audiofiles/scratch26').default);
    this.load('scratch-long2', require('./audiofiles/scratch27').default);
    this.load('scratch-long3', require('./audiofiles/scratch28').default);

    // scratches of medium length
    this.load('scratch-med', require('./audiofiles/scratch12').default);
    this.load('scratch-med0', require('./audiofiles/scratch12').default);
    this.load('scratch-med1', require('./audiofiles/scratch13').default);
    this.load('scratch-med2', require('./audiofiles/scratch14').default);
    this.load('scratch-med3', require('./audiofiles/scratch15').default);
    this.load('scratch-med4', require('./audiofiles/scratch16').default);
    this.load('scratch-med5', require('./audiofiles/scratch18').default);
    this.load('scratch-med6', require('./audiofiles/scratch23').default);
    this.load('scratch-med7', require('./audiofiles/scratch25').default);
    this.load('scratch-med8', require('./audiofiles/scratch31').default);

    // "rough"-sounding scratches
    this.load('scratch-rough', require('./audiofiles/scratch32').default);
    this.load('scratch-rough0', require('./audiofiles/scratch32').default);
    this.load('scratch-rough1', require('./audiofiles/scratch33').default);
    this.load('scratch-rough2', require('./audiofiles/scratch34').default);
    this.load('scratch-rough3', require('./audiofiles/scratch35').default);

    this.load('siren', require('./audiofiles/siren1').default);
    this.load('siren0', require('./audiofiles/siren1').default);
    this.load('siren1', require('./audiofiles/siren2').default);
    this.load('siren2', require('./audiofiles/siren3').default);
    this.load('siren3', require('./audiofiles/siren4').default);

    this.load('snap', require('./audiofiles/snap').default);
    this.load('snap0', require('./audiofiles/snap').default);
    this.load('snap1', require('./audiofiles/a-snap2').default);

    this.load('snare', require('./audiofiles/AMB_SN13').default);
    this.load('snare0', require('./audiofiles/AMB_SN13').default);
    this.load('snare1', require('./audiofiles/AMB_SN_5').default);
    this.load('snare2', require('./audiofiles/a-snare2').default);

    this.load(
      'thump',
      require('./audiofiles/8938__patchen__piano-hits-hand-03v2').default
    );
    this.load(
      'thump0',
      require('./audiofiles/8938__patchen__piano-hits-hand-03v2').default
    );
    this.load('thump1', require('./audiofiles/thump2').default);
    this.load('thump2', require('./audiofiles/a-thump2').default);

    this.load('tap', require('./audiofiles/tap6').default);
    this.load('tap0', require('./audiofiles/tap6').default);
    this.load('tap1', require('./audiofiles/tap3').default);
    this.load('tap2', require('./audiofiles/tap4').default);
    this.load('tap3', require('./audiofiles/tap1').default);
    this.load('tap4', require('./audiofiles/tap5').default);
    this.load('tap5', require('./audiofiles/tap7').default);

    this.load('tense', require('./audiofiles/tense1').default);
    this.load('tense0', require('./audiofiles/tense1').default);
    this.load('tense1', require('./audiofiles/tense2').default);
    this.load('tense2', require('./audiofiles/tense3').default);
    this.load('tense3', require('./audiofiles/tense4').default);
    this.load('tense4', require('./audiofiles/tense5').default);
    this.load('tense5', require('./audiofiles/tense6').default);

    this.load('tic', require('./audiofiles/nit1').default);
    this.load('tic0', require('./audiofiles/nit1').default);
    this.load('tic1', require('./audiofiles/nit2').default);
    this.load('tic2', require('./audiofiles/nit3').default);
    this.load('tic3', require('./audiofiles/nit4').default);
    this.load('tic4', require('./audiofiles/nit5').default);

    this.load('toc', require('./audiofiles/AMB_LTM2').default);
    this.load('toc0', require('./audiofiles/AMB_LTM2').default);
    this.load('toc1', require('./audiofiles/AMB_RIM1').default);

    this.load(
      'tranceKick',
      require('./audiofiles/33325__laya__trance-kick01').default
    );
    this.load(
      'tranceKick0',
      require('./audiofiles/33325__laya__trance-kick01').default
    );
    this.load(
      'tranceKick1',
      require('./audiofiles/24004__laya__dance-kick3').default
    );
    this.load('tranceKick2', require('./audiofiles/anotherKick').default);
    this.load('tranceKick3', require('./audiofiles/anotherThump').default);

    this.load('tweet', require('./audiofiles/tweet1-shaped').default);
    this.load('tweet1', require('./audiofiles/tweet1-shaped').default);
    this.load('tweet2', require('./audiofiles/tweet2-shaped').default);
    this.load('tweet3', require('./audiofiles/tweet3-shaped').default);
    this.load('tweet4', require('./audiofiles/tweet4-shaped').default);
    this.load('tweet5', require('./audiofiles/tweet5-shaped').default);
    this.load('tweet6', require('./audiofiles/tweet6-shaped').default);
    this.load('tweet7', require('./audiofiles/tweet7-shaped').default);
    this.load('tweet8', require('./audiofiles/tweet8-shaped').default);
    this.load('tweet9', require('./audiofiles/tweet9-shaped').default);
    this.load('tweet10', require('./audiofiles/tweet10-shaped').default);
    this.load('tweet11', require('./audiofiles/tweet11-shaped').default);
    this.load('tweet12', require('./audiofiles/tweet12-shaped').default);
    this.load('tweet13', require('./audiofiles/tweet13-shaped').default);

    this.load(
      'voltage',
      require('./audiofiles/49255__keinzweiter__bonobob-funk').default
    );

    this.load('warm', require('./audiofiles/warm').default);
  }

  // Should be either mp3 or ogg
  load(name, path) {
    this.audioAPI.loadSample(name, path);
  }
}
