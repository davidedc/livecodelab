###
## The SampleBank is responsible for holding the filepaths to any audio that
## needs to be loaded by the browser.
##
## It automatically handles returning the ogg or mp3 file path.
###

define () ->

  class SampleBank

    sounds: []
    soundsByName: {}
    fileType: undefined
    constructor: (buzz) ->
      @fileType = undefined
      if buzz.isMP3Supported()
        @fileType = "mp3"
      else if buzz.isOGGSupported()
        @fileType = "ogg"
      else
        return
      @load "alienBeep", "./sound/audioFiles/132389__blackie666__alienbleep"
      @load "beep", "./sound/audioFiles/100708__steveygos93__bleep_a"
      @load "beep0", "./sound/audioFiles/100708__steveygos93__bleep_a"
      @load "beep1", "./sound/audioFiles/100708__steveygos93__bleep_b"
      @load "beep2", "./sound/audioFiles/100708__steveygos93__bleep_c"
      @load "beep3", "./sound/audioFiles/100708__steveygos93__bleep_d"
      @load "bing", "./sound/audioFiles/start_bing"
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
      @load "highHatClosed", "./sound/audioFiles/AMB_HHCL"
      @load "highHatOpen", "./sound/audioFiles/AMB_HHOP"
      @load "hiss", "./sound/audioFiles/a-hiss1"
      @load "hiss0", "./sound/audioFiles/a-hiss1"
      @load "hiss1", "./sound/audioFiles/a-hiss2"
      @load "hiss2", "./sound/audioFiles/a-hiss3"
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
      @load "ride", "./sound/audioFiles/RIDE_1"

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

      # "rough"-sounding sketches
      @load "scratch-rough", "./sound/audioFiles/scratch32"
      @load "scratch-rough0", "./sound/audioFiles/scratch32"
      @load "scratch-rough1", "./sound/audioFiles/scratch33"
      @load "scratch-rough2", "./sound/audioFiles/scratch34"
      @load "scratch-rough3", "./sound/audioFiles/scratch35"

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
      @load "toc", "./sound/audioFiles/AMB_LTM2"
      @load "toc0", "./sound/audioFiles/AMB_LTM2"
      @load "toc1", "./sound/audioFiles/AMB_RIM1"
      @load "tranceKick", "./sound/audioFiles/33325__laya__trance-kick01"
      @load "tranceKick0", "./sound/audioFiles/33325__laya__trance-kick01"
      @load "tranceKick1", "./sound/audioFiles/24004__laya__dance-kick3"
      @load "voltage", "./sound/audioFiles/49255__keinzweiter__bonobob-funk"
      @load "warm", "./sound/audioFiles/warm"
    
    # Should be either mp3 or ogg
    load: (name, path) ->
      soundNumber = @sounds.length
      @sounds.push
        name: name
        path: path + "." + @fileType

      @soundsByName[name] = soundNumber
      soundNumber

    getByName: (name) ->
      @sounds[@soundsByName[name]]

    getByNumber: (number) ->
      @sounds[number]

  SampleBank

