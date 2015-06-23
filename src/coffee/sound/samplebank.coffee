###
## The SampleBank is responsible for loading the audio files into buffers
###

class SampleBank

  constructor: (@audioAPI) ->

    @load "alienBeep", "./sound/audioFiles/132389__blackie666__alienbleep"

    @load "beep", "./sound/audioFiles/100708__steveygos93__bleep_a"
    @load "beep0", "./sound/audioFiles/100708__steveygos93__bleep_a"
    @load "beep1", "./sound/audioFiles/100708__steveygos93__bleep_b"
    @load "beep2", "./sound/audioFiles/100708__steveygos93__bleep_c"
    @load "beep3", "./sound/audioFiles/100708__steveygos93__bleep_d"

    @load "bing", "./sound/audioFiles/start_bing"

    @load "DJCastro", "./sound/audioFiles/castro-sample1"
    @load "DJCastro0", "./sound/audioFiles/castro-sample1"
    @load "DJCastro1", "./sound/audioFiles/castro-sample2"
    @load "DJCastro2", "./sound/audioFiles/castro-sample3"
    @load "DJCastro3", "./sound/audioFiles/castro-sample4"
    @load "DJCastro4", "./sound/audioFiles/castro-sample5"
    @load "DJCastro5", "./sound/audioFiles/castro-sample6"
    @load "DJCastro6", "./sound/audioFiles/castro-sample7"
    @load "DJCastro7", "./sound/audioFiles/castro-sample8"
    @load "DJCastro8", "./sound/audioFiles/castro-sample9"
    @load "DJCastro9", "./sound/audioFiles/castro-sample10"
    @load "DJCastro10", "./sound/audioFiles/castro-sample11"
    @load "DJCastro11", "./sound/audioFiles/castro-sample12"
    @load "DJCastro12", "./sound/audioFiles/castro-sample13"
    @load "DJCastro13", "./sound/audioFiles/castro-sample14"
    @load "DJCastro14", "./sound/audioFiles/castro-sample15"
    @load "DJCastro15", "./sound/audioFiles/castro-sample16"
    @load "DJCastro16", "./sound/audioFiles/castro-sample17"
    @load "DJCastro17", "./sound/audioFiles/castro-sample18"
    @load "DJCastro18", "./sound/audioFiles/castro-sample19"
    @load "DJCastro19", "./sound/audioFiles/castro-sample20"
    @load "DJCastro20", "./sound/audioFiles/castro-sample21"
    @load "DJCastro21", "./sound/audioFiles/castro-sample22"
    @load "DJCastro22", "./sound/audioFiles/castro-sample23"
    @load "DJCastro23", "./sound/audioFiles/castro-sample24"
    @load "DJCastro24", "./sound/audioFiles/castro-sample25"
    @load "DJCastro25", "./sound/audioFiles/castro-sample26"

    @load "ciack", "./sound/audioFiles/ciack"
    @load "ciack0", "./sound/audioFiles/ciack"
    @load "ciack1", "./sound/audioFiles/a-ciack2"

    @load "cosmos", "./sound/audioFiles/cosmos"

    @load "crash", "./sound/audioFiles/CRASH_1"
    @load "crash0", "./sound/audioFiles/CRASH_1"
    @load "crash1", "./sound/audioFiles/CRASH_5"
    @load "crash2", "./sound/audioFiles/CRASH_6"

    @load "detune", "./sound/audioFiles/detune"

    @load "dish", "./sound/audioFiles/dish"
    @load "dish0", "./sound/audioFiles/dish"
    @load "dish1", "./sound/audioFiles/a-dish2"
    @load "dish2", "./sound/audioFiles/a-dish3"

    @load "downstairs", "./sound/audioFiles/downstairs"

    @load "glass", "./sound/audioFiles/glass"

    @load "growl", "./sound/audioFiles/growl1"
    @load "growl0", "./sound/audioFiles/growl1"
    @load "growl1", "./sound/audioFiles/growl2"
    @load "growl2", "./sound/audioFiles/growl3"
    @load "growl3", "./sound/audioFiles/growl4"
    @load "growl4", "./sound/audioFiles/growl5"
    @load "growl5", "./sound/audioFiles/growl6"

    @load "highHatClosed", "./sound/audioFiles/AMB_HHCL"
    @load "highHatOpen", "./sound/audioFiles/AMB_HHOP"

    @load "hiss", "./sound/audioFiles/a-hiss1"
    @load "hiss0", "./sound/audioFiles/a-hiss1"
    @load "hiss1", "./sound/audioFiles/a-hiss2"
    @load "hiss2", "./sound/audioFiles/a-hiss3"

    @load "hoover", "./sound/audioFiles/hoover1"
    @load "hoover0", "./sound/audioFiles/hoover1"
    @load "hoover1", "./sound/audioFiles/hoover2"

    @load "lowFlash", "./sound/audioFiles/9569__thanvannispen__industrial-low-flash04"
    @load "lowFlash0", "./sound/audioFiles/9569__thanvannispen__industrial-low-flash04"
    @load "lowFlash1", "./sound/audioFiles/9570__thanvannispen__industrial-low-flash07"

    @load "mouth", "./sound/audioFiles/a-mouth1"
    @load "mouth0", "./sound/audioFiles/a-mouth1"
    @load "mouth1", "./sound/audioFiles/a-mouth2"
    @load "mouth2", "./sound/audioFiles/a-mouth3"
    @load "mouth3", "./sound/audioFiles/a-mouth4"
    @load "mouth4", "./sound/audioFiles/a-mouth5"

    @load "penta0", "./sound/audioFiles/toneMatrix-1"
    @load "penta1", "./sound/audioFiles/toneMatrix-2"
    @load "penta2", "./sound/audioFiles/toneMatrix-3"
    @load "penta3", "./sound/audioFiles/toneMatrix-4"
    @load "penta4", "./sound/audioFiles/toneMatrix-5"
    @load "penta5", "./sound/audioFiles/toneMatrix-6"
    @load "penta6", "./sound/audioFiles/toneMatrix-7"
    @load "penta7", "./sound/audioFiles/toneMatrix-8"
    @load "penta8", "./sound/audioFiles/toneMatrix-9"
    @load "penta9", "./sound/audioFiles/toneMatrix-10"
    @load "penta10", "./sound/audioFiles/toneMatrix-11"
    @load "penta11", "./sound/audioFiles/toneMatrix-12"
    @load "penta12", "./sound/audioFiles/toneMatrix-13"
    @load "penta13", "./sound/audioFiles/toneMatrix-14"
    @load "penta14", "./sound/audioFiles/toneMatrix-15"
    @load "penta15", "./sound/audioFiles/toneMatrix-16"

    @load "pianoLDChord", "./sound/audioFiles/pianoLDChordsA"
    @load "pianoLDChord0", "./sound/audioFiles/pianoLDChordsA"
    @load "pianoLDChord1", "./sound/audioFiles/pianoLDChordsB"
    @load "pianoLDChord2", "./sound/audioFiles/pianoLDChordsC"
    @load "pianoLDChord3", "./sound/audioFiles/pianoLDChordsE"

    @load "pianoLHChord", "./sound/audioFiles/pianoLHChordsA"
    @load "pianoLHChord0", "./sound/audioFiles/pianoLHChordsA"
    @load "pianoLHChord1", "./sound/audioFiles/pianoLHChordsB"
    @load "pianoLHChord2", "./sound/audioFiles/pianoLHChordsC"
    @load "pianoLHChord3", "./sound/audioFiles/pianoLHChordsE"

    @load "pianoRHChord", "./sound/audioFiles/pianoRHChordsA"
    @load "pianoRHChord0", "./sound/audioFiles/pianoRHChordsA"
    @load "pianoRHChord1", "./sound/audioFiles/pianoRHChordsB"
    @load "pianoRHChord2", "./sound/audioFiles/pianoRHChordsC"
    @load "pianoRHChord3", "./sound/audioFiles/pianoRHChordsE"

    @load "ride", "./sound/audioFiles/RIDE_1"

    @load "rust", "./sound/audioFiles/rust1"
    @load "rust0", "./sound/audioFiles/rust1"
    @load "rust1", "./sound/audioFiles/rust2"
    @load "rust2", "./sound/audioFiles/rust3"

    # scratches of short length
    @load "scratch", "./sound/audioFiles/scratch1"
    @load "scratch0", "./sound/audioFiles/scratch1"
    @load "scratch1", "./sound/audioFiles/scratch2"
    @load "scratch2", "./sound/audioFiles/scratch4"
    @load "scratch3", "./sound/audioFiles/scratch5"
    @load "scratch4", "./sound/audioFiles/scratch6"
    @load "scratch5", "./sound/audioFiles/scratch7"
    @load "scratch6", "./sound/audioFiles/scratch8"
    @load "scratch7", "./sound/audioFiles/scratch9"
    @load "scratch8", "./sound/audioFiles/scratch10"
    @load "scratch9", "./sound/audioFiles/scratch11"
    @load "scratch10", "./sound/audioFiles/scratch17"
    @load "scratch11", "./sound/audioFiles/scratch21"
    @load "scratch12", "./sound/audioFiles/scratch22"
    @load "scratch13", "./sound/audioFiles/scratch24"

    # scratches of high pitch
    @load "scratch-high", "./sound/audioFiles/scratch19"
    @load "scratch-high0", "./sound/audioFiles/scratch19"
    @load "scratch-high1", "./sound/audioFiles/scratch20"

    # scratches of long length
    @load "scratch-long", "./sound/audioFiles/scratch3"
    @load "scratch-long0", "./sound/audioFiles/scratch3"
    @load "scratch-long1", "./sound/audioFiles/scratch26"
    @load "scratch-long2", "./sound/audioFiles/scratch27"
    @load "scratch-long3", "./sound/audioFiles/scratch28"

    # scratches of medium length
    @load "scratch-med", "./sound/audioFiles/scratch12"
    @load "scratch-med0", "./sound/audioFiles/scratch12"
    @load "scratch-med1", "./sound/audioFiles/scratch13"
    @load "scratch-med2", "./sound/audioFiles/scratch14"
    @load "scratch-med3", "./sound/audioFiles/scratch15"
    @load "scratch-med4", "./sound/audioFiles/scratch16"
    @load "scratch-med5", "./sound/audioFiles/scratch18"
    @load "scratch-med6", "./sound/audioFiles/scratch23"
    @load "scratch-med7", "./sound/audioFiles/scratch25"
    @load "scratch-med8", "./sound/audioFiles/scratch31"

    # "rough"-sounding scratches
    @load "scratch-rough", "./sound/audioFiles/scratch32"
    @load "scratch-rough0", "./sound/audioFiles/scratch32"
    @load "scratch-rough1", "./sound/audioFiles/scratch33"
    @load "scratch-rough2", "./sound/audioFiles/scratch34"
    @load "scratch-rough3", "./sound/audioFiles/scratch35"

    @load "siren", "./sound/audioFiles/siren1"
    @load "siren0", "./sound/audioFiles/siren1"
    @load "siren1", "./sound/audioFiles/siren2"
    @load "siren2", "./sound/audioFiles/siren3"
    @load "siren3", "./sound/audioFiles/siren4"

    @load "snap", "./sound/audioFiles/snap"
    @load "snap0", "./sound/audioFiles/snap"
    @load "snap1", "./sound/audioFiles/a-snap2"

    @load "snare", "./sound/audioFiles/AMB_SN13"
    @load "snare0", "./sound/audioFiles/AMB_SN13"
    @load "snare1", "./sound/audioFiles/AMB_SN_5"
    @load "snare2", "./sound/audioFiles/a-snare2"

    @load "thump", "./sound/audioFiles/8938__patchen__piano-hits-hand-03v2"
    @load "thump0", "./sound/audioFiles/8938__patchen__piano-hits-hand-03v2"
    @load "thump1", "./sound/audioFiles/thump2"
    @load "thump2", "./sound/audioFiles/a-thump2"

    @load "tap", "./sound/audioFiles/tap6"
    @load "tap0", "./sound/audioFiles/tap6"
    @load "tap1", "./sound/audioFiles/tap3"
    @load "tap2", "./sound/audioFiles/tap4"
    @load "tap3", "./sound/audioFiles/tap1"
    @load "tap4", "./sound/audioFiles/tap5"
    @load "tap5", "./sound/audioFiles/tap7"

    @load "tense", "./sound/audioFiles/tense1"
    @load "tense0", "./sound/audioFiles/tense1"
    @load "tense1", "./sound/audioFiles/tense2"
    @load "tense2", "./sound/audioFiles/tense3"
    @load "tense3", "./sound/audioFiles/tense4"
    @load "tense4", "./sound/audioFiles/tense5"
    @load "tense5", "./sound/audioFiles/tense6"

    @load "tic", "./sound/audioFiles/nit1"
    @load "tic0", "./sound/audioFiles/nit1"
    @load "tic1", "./sound/audioFiles/nit2"
    @load "tic2", "./sound/audioFiles/nit3"
    @load "tic3", "./sound/audioFiles/nit4"
    @load "tic4", "./sound/audioFiles/nit5"

    @load "toc", "./sound/audioFiles/AMB_LTM2"
    @load "toc0", "./sound/audioFiles/AMB_LTM2"
    @load "toc1", "./sound/audioFiles/AMB_RIM1"

    @load "tranceKick", "./sound/audioFiles/33325__laya__trance-kick01"
    @load "tranceKick0", "./sound/audioFiles/33325__laya__trance-kick01"
    @load "tranceKick1", "./sound/audioFiles/24004__laya__dance-kick3"
    @load "tranceKick2", "./sound/audioFiles/anotherKick"
    @load "tranceKick3", "./sound/audioFiles/anotherThump"

    @load "tweet", "./sound/audioFiles/tweet1-shaped"
    @load "tweet1", "./sound/audioFiles/tweet1-shaped"
    @load "tweet2", "./sound/audioFiles/tweet2-shaped"
    @load "tweet3", "./sound/audioFiles/tweet3-shaped"
    @load "tweet4", "./sound/audioFiles/tweet4-shaped"
    @load "tweet5", "./sound/audioFiles/tweet5-shaped"
    @load "tweet6", "./sound/audioFiles/tweet6-shaped"
    @load "tweet7", "./sound/audioFiles/tweet7-shaped"
    @load "tweet8", "./sound/audioFiles/tweet8-shaped"
    @load "tweet9", "./sound/audioFiles/tweet9-shaped"
    @load "tweet10", "./sound/audioFiles/tweet10-shaped"
    @load "tweet11", "./sound/audioFiles/tweet11-shaped"
    @load "tweet12", "./sound/audioFiles/tweet12-shaped"
    @load "tweet13", "./sound/audioFiles/tweet13-shaped"

    @load "voltage", "./sound/audioFiles/49255__keinzweiter__bonobob-funk"

    @load "warm", "./sound/audioFiles/warm"
  
  # Should be either mp3 or ogg
  load: (name, path) ->
    @audioAPI.loadSample(name, path)

module.exports = SampleBank

