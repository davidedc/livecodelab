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
      @load "cosmos", "./sound/audioFiles/cosmos"
      @load "crash", "./sound/audioFiles/CRASH_1"
      @load "crash0", "./sound/audioFiles/CRASH_1"
      @load "crash1", "./sound/audioFiles/CRASH_5"
      @load "crash2", "./sound/audioFiles/CRASH_6"
      @load "detune", "./sound/audioFiles/detune"
      @load "dish", "./sound/audioFiles/dish"
      @load "downstairs", "./sound/audioFiles/downstairs"
      @load "glass", "./sound/audioFiles/glass"
      @load "highHatClosed", "./sound/audioFiles/AMB_HHCL"
      @load "highHatOpen", "./sound/audioFiles/AMB_HHOP"
      @load "lowFlash", "./sound/audioFiles/9569__thanvannispen__industrial-low-flash04"
      @load "lowFlash0", "./sound/audioFiles/9569__thanvannispen__industrial-low-flash04"
      @load "lowFlash1", "./sound/audioFiles/9570__thanvannispen__industrial-low-flash07"
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
      @load "snap", "./sound/audioFiles/snap"
      @load "snare", "./sound/audioFiles/AMB_SN13"
      @load "snare0", "./sound/audioFiles/AMB_SN13"
      @load "snare1", "./sound/audioFiles/AMB_SN_5"
      @load "thump", "./sound/audioFiles/8938__patchen__piano-hits-hand-03v2"
      @load "thump0", "./sound/audioFiles/8938__patchen__piano-hits-hand-03v2"
      @load "thump1", "./sound/audioFiles/thump2"
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

