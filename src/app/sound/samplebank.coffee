###
## The SampleBank is responsible for loading the audio files into buffers
###

class SampleBank

  constructor: (@audioAPI) ->

    @load "alienBeep", (require "./audiofiles/132389__blackie666__alienbleep")

    @load "beep", (require "./audiofiles/100708__steveygos93__bleep_a")
    @load "beep0", (require "./audiofiles/100708__steveygos93__bleep_a")
    @load "beep1", (require "./audiofiles/100708__steveygos93__bleep_b")
    @load "beep2", (require "./audiofiles/100708__steveygos93__bleep_c")
    @load "beep3", (require "./audiofiles/100708__steveygos93__bleep_d")

    @load "bing", (require "./audiofiles/start_bing")

    @load "DJCastro", (require "./audiofiles/castro-sample1")
    @load "DJCastro0", (require "./audiofiles/castro-sample1")
    @load "DJCastro1", (require "./audiofiles/castro-sample2")
    @load "DJCastro2", (require "./audiofiles/castro-sample3")
    @load "DJCastro3", (require "./audiofiles/castro-sample4")
    @load "DJCastro4", (require "./audiofiles/castro-sample5")
    @load "DJCastro5", (require "./audiofiles/castro-sample6")
    @load "DJCastro6", (require "./audiofiles/castro-sample7")
    @load "DJCastro7", (require "./audiofiles/castro-sample8")
    @load "DJCastro8", (require "./audiofiles/castro-sample9")
    @load "DJCastro9", (require "./audiofiles/castro-sample10")
    @load "DJCastro10", (require "./audiofiles/castro-sample11")
    @load "DJCastro11", (require "./audiofiles/castro-sample12")
    @load "DJCastro12", (require "./audiofiles/castro-sample13")
    @load "DJCastro13", (require "./audiofiles/castro-sample14")
    @load "DJCastro14", (require "./audiofiles/castro-sample15")
    @load "DJCastro15", (require "./audiofiles/castro-sample16")
    @load "DJCastro16", (require "./audiofiles/castro-sample17")
    @load "DJCastro17", (require "./audiofiles/castro-sample18")
    @load "DJCastro18", (require "./audiofiles/castro-sample19")
    @load "DJCastro19", (require "./audiofiles/castro-sample20")
    @load "DJCastro20", (require "./audiofiles/castro-sample21")
    @load "DJCastro21", (require "./audiofiles/castro-sample22")
    @load "DJCastro22", (require "./audiofiles/castro-sample23")
    @load "DJCastro23", (require "./audiofiles/castro-sample24")
    @load "DJCastro24", (require "./audiofiles/castro-sample25")
    @load "DJCastro25", (require "./audiofiles/castro-sample26")

    @load "ciack", (require "./audiofiles/ciack")
    @load "ciack0", (require "./audiofiles/ciack")
    @load "ciack1", (require "./audiofiles/a-ciack2")

    @load "cosmos", (require "./audiofiles/cosmos")

    @load "crash", (require "./audiofiles/CRASH_1")
    @load "crash0", (require "./audiofiles/CRASH_1")
    @load "crash1", (require "./audiofiles/CRASH_5")
    @load "crash2", (require "./audiofiles/CRASH_6")

    @load "detune", (require "./audiofiles/detune")

    @load "dish", (require "./audiofiles/dish")
    @load "dish0", (require "./audiofiles/dish")
    @load "dish1", (require "./audiofiles/a-dish2")
    @load "dish2", (require "./audiofiles/a-dish3")

    @load "downstairs", (require "./audiofiles/downstairs")

    @load "glass", (require "./audiofiles/glass")

    @load "growl", (require "./audiofiles/growl1")
    @load "growl0", (require "./audiofiles/growl1")
    @load "growl1", (require "./audiofiles/growl2")
    @load "growl2", (require "./audiofiles/growl3")
    @load "growl3", (require "./audiofiles/growl4")
    @load "growl4", (require "./audiofiles/growl5")
    @load "growl5", (require "./audiofiles/growl6")

    @load "highHatClosed", (require "./audiofiles/AMB_HHCL")
    @load "highHatOpen", (require "./audiofiles/AMB_HHOP")

    @load "hiss", (require "./audiofiles/a-hiss1")
    @load "hiss0", (require "./audiofiles/a-hiss1")
    @load "hiss1", (require "./audiofiles/a-hiss2")
    @load "hiss2", (require "./audiofiles/a-hiss3")

    @load "hoover", (require "./audiofiles/hoover1")
    @load "hoover0", (require "./audiofiles/hoover1")
    @load "hoover1", (require "./audiofiles/hoover2")

    @load "lowFlash", (require "./audiofiles/9569__thanvannispen__industrial-low-flash04")
    @load "lowFlash0", (require "./audiofiles/9569__thanvannispen__industrial-low-flash04")
    @load "lowFlash1", (require "./audiofiles/9570__thanvannispen__industrial-low-flash07")

    @load "mouth", (require "./audiofiles/a-mouth1")
    @load "mouth0", (require "./audiofiles/a-mouth1")
    @load "mouth1", (require "./audiofiles/a-mouth2")
    @load "mouth2", (require "./audiofiles/a-mouth3")
    @load "mouth3", (require "./audiofiles/a-mouth4")
    @load "mouth4", (require "./audiofiles/a-mouth5")

    @load "penta0", (require "./audiofiles/toneMatrix-1")
    @load "penta1", (require "./audiofiles/toneMatrix-2")
    @load "penta2", (require "./audiofiles/toneMatrix-3")
    @load "penta3", (require "./audiofiles/toneMatrix-4")
    @load "penta4", (require "./audiofiles/toneMatrix-5")
    @load "penta5", (require "./audiofiles/toneMatrix-6")
    @load "penta6", (require "./audiofiles/toneMatrix-7")
    @load "penta7", (require "./audiofiles/toneMatrix-8")
    @load "penta8", (require "./audiofiles/toneMatrix-9")
    @load "penta9", (require "./audiofiles/toneMatrix-10")
    @load "penta10", (require "./audiofiles/toneMatrix-11")
    @load "penta11", (require "./audiofiles/toneMatrix-12")
    @load "penta12", (require "./audiofiles/toneMatrix-13")
    @load "penta13", (require "./audiofiles/toneMatrix-14")
    @load "penta14", (require "./audiofiles/toneMatrix-15")
    @load "penta15", (require "./audiofiles/toneMatrix-16")

    @load "pianoLDChord", (require "./audiofiles/pianoLDChordsA")
    @load "pianoLDChord0", (require "./audiofiles/pianoLDChordsA")
    @load "pianoLDChord1", (require "./audiofiles/pianoLDChordsB")
    @load "pianoLDChord2", (require "./audiofiles/pianoLDChordsC")
    @load "pianoLDChord3", (require "./audiofiles/pianoLDChordsE")

    @load "pianoLHChord", (require "./audiofiles/pianoLHChordsA")
    @load "pianoLHChord0", (require "./audiofiles/pianoLHChordsA")
    @load "pianoLHChord1", (require "./audiofiles/pianoLHChordsB")
    @load "pianoLHChord2", (require "./audiofiles/pianoLHChordsC")
    @load "pianoLHChord3", (require "./audiofiles/pianoLHChordsE")

    @load "pianoRHChord", (require "./audiofiles/pianoRHChordsA")
    @load "pianoRHChord0", (require "./audiofiles/pianoRHChordsA")
    @load "pianoRHChord1", (require "./audiofiles/pianoRHChordsB")
    @load "pianoRHChord2", (require "./audiofiles/pianoRHChordsC")
    @load "pianoRHChord3", (require "./audiofiles/pianoRHChordsE")

    @load "ride", (require "./audiofiles/RIDE_1")

    @load "rust", (require "./audiofiles/rust1")
    @load "rust0", (require "./audiofiles/rust1")
    @load "rust1", (require "./audiofiles/rust2")
    @load "rust2", (require "./audiofiles/rust3")

    # scratches of short length
    @load "scratch", (require "./audiofiles/scratch1")
    @load "scratch0", (require "./audiofiles/scratch1")
    @load "scratch1", (require "./audiofiles/scratch2")
    @load "scratch2", (require "./audiofiles/scratch4")
    @load "scratch3", (require "./audiofiles/scratch5")
    @load "scratch4", (require "./audiofiles/scratch6")
    @load "scratch5", (require "./audiofiles/scratch7")
    @load "scratch6", (require "./audiofiles/scratch8")
    @load "scratch7", (require "./audiofiles/scratch9")
    @load "scratch8", (require "./audiofiles/scratch10")
    @load "scratch9", (require "./audiofiles/scratch11")
    @load "scratch10", (require "./audiofiles/scratch17")
    @load "scratch11", (require "./audiofiles/scratch21")
    @load "scratch12", (require "./audiofiles/scratch22")
    @load "scratch13", (require "./audiofiles/scratch24")

    # scratches of high pitch
    @load "scratch-high", (require "./audiofiles/scratch19")
    @load "scratch-high0", (require "./audiofiles/scratch19")
    @load "scratch-high1", (require "./audiofiles/scratch20")

    # scratches of long length
    @load "scratch-long", (require "./audiofiles/scratch3")
    @load "scratch-long0", (require "./audiofiles/scratch3")
    @load "scratch-long1", (require "./audiofiles/scratch26")
    @load "scratch-long2", (require "./audiofiles/scratch27")
    @load "scratch-long3", (require "./audiofiles/scratch28")

    # scratches of medium length
    @load "scratch-med", (require "./audiofiles/scratch12")
    @load "scratch-med0", (require "./audiofiles/scratch12")
    @load "scratch-med1", (require "./audiofiles/scratch13")
    @load "scratch-med2", (require "./audiofiles/scratch14")
    @load "scratch-med3", (require "./audiofiles/scratch15")
    @load "scratch-med4", (require "./audiofiles/scratch16")
    @load "scratch-med5", (require "./audiofiles/scratch18")
    @load "scratch-med6", (require "./audiofiles/scratch23")
    @load "scratch-med7", (require "./audiofiles/scratch25")
    @load "scratch-med8", (require "./audiofiles/scratch31")

    # "rough"-sounding scratches
    @load "scratch-rough", (require "./audiofiles/scratch32")
    @load "scratch-rough0", (require "./audiofiles/scratch32")
    @load "scratch-rough1", (require "./audiofiles/scratch33")
    @load "scratch-rough2", (require "./audiofiles/scratch34")
    @load "scratch-rough3", (require "./audiofiles/scratch35")

    @load "siren", (require "./audiofiles/siren1")
    @load "siren0", (require "./audiofiles/siren1")
    @load "siren1", (require "./audiofiles/siren2")
    @load "siren2", (require "./audiofiles/siren3")
    @load "siren3", (require "./audiofiles/siren4")

    @load "snap", (require "./audiofiles/snap")
    @load "snap0", (require "./audiofiles/snap")
    @load "snap1", (require "./audiofiles/a-snap2")

    @load "snare", (require "./audiofiles/AMB_SN13")
    @load "snare0", (require "./audiofiles/AMB_SN13")
    @load "snare1", (require "./audiofiles/AMB_SN_5")
    @load "snare2", (require "./audiofiles/a-snare2")

    @load "thump", (require "./audiofiles/8938__patchen__piano-hits-hand-03v2")
    @load "thump0", (require "./audiofiles/8938__patchen__piano-hits-hand-03v2")
    @load "thump1", (require "./audiofiles/thump2")
    @load "thump2", (require "./audiofiles/a-thump2")

    @load "tap", (require "./audiofiles/tap6")
    @load "tap0", (require "./audiofiles/tap6")
    @load "tap1", (require "./audiofiles/tap3")
    @load "tap2", (require "./audiofiles/tap4")
    @load "tap3", (require "./audiofiles/tap1")
    @load "tap4", (require "./audiofiles/tap5")
    @load "tap5", (require "./audiofiles/tap7")

    @load "tense", (require "./audiofiles/tense1")
    @load "tense0", (require "./audiofiles/tense1")
    @load "tense1", (require "./audiofiles/tense2")
    @load "tense2", (require "./audiofiles/tense3")
    @load "tense3", (require "./audiofiles/tense4")
    @load "tense4", (require "./audiofiles/tense5")
    @load "tense5", (require "./audiofiles/tense6")

    @load "tic", (require "./audiofiles/nit1")
    @load "tic0", (require "./audiofiles/nit1")
    @load "tic1", (require "./audiofiles/nit2")
    @load "tic2", (require "./audiofiles/nit3")
    @load "tic3", (require "./audiofiles/nit4")
    @load "tic4", (require "./audiofiles/nit5")

    @load "toc", (require "./audiofiles/AMB_LTM2")
    @load "toc0", (require "./audiofiles/AMB_LTM2")
    @load "toc1", (require "./audiofiles/AMB_RIM1")

    @load "tranceKick", (require "./audiofiles/33325__laya__trance-kick01")
    @load "tranceKick0", (require "./audiofiles/33325__laya__trance-kick01")
    @load "tranceKick1", (require "./audiofiles/24004__laya__dance-kick3")
    @load "tranceKick2", (require "./audiofiles/anotherKick")
    @load "tranceKick3", (require "./audiofiles/anotherThump")

    @load "tweet", (require "./audiofiles/tweet1-shaped")
    @load "tweet1", (require "./audiofiles/tweet1-shaped")
    @load "tweet2", (require "./audiofiles/tweet2-shaped")
    @load "tweet3", (require "./audiofiles/tweet3-shaped")
    @load "tweet4", (require "./audiofiles/tweet4-shaped")
    @load "tweet5", (require "./audiofiles/tweet5-shaped")
    @load "tweet6", (require "./audiofiles/tweet6-shaped")
    @load "tweet7", (require "./audiofiles/tweet7-shaped")
    @load "tweet8", (require "./audiofiles/tweet8-shaped")
    @load "tweet9", (require "./audiofiles/tweet9-shaped")
    @load "tweet10", (require "./audiofiles/tweet10-shaped")
    @load "tweet11", (require "./audiofiles/tweet11-shaped")
    @load "tweet12", (require "./audiofiles/tweet12-shaped")
    @load "tweet13", (require "./audiofiles/tweet13-shaped")

    @load "voltage", (require "./audiofiles/49255__keinzweiter__bonobob-funk")

    @load "warm", (require "./audiofiles/warm")
  
  # Should be either mp3 or ogg
  load: (name, path) ->
    @audioAPI.loadSample(name, path)

module.exports = SampleBank

