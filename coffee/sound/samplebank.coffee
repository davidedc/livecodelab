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
      @load "bing", "./sound/audioFiles/start_bing"
      @load "highHatClosed", "./sound/audioFiles/AMB_HHCL"
      @load "highHatOpen", "./sound/audioFiles/AMB_HHOP"
      @load "toc3", "./sound/audioFiles/AMB_LTM2"
      @load "toc4", "./sound/audioFiles/AMB_RIM1"
      @load "snare", "./sound/audioFiles/AMB_SN13"
      @load "snare2", "./sound/audioFiles/AMB_SN_5"
      @load "crash", "./sound/audioFiles/CRASH_1"
      @load "crash2", "./sound/audioFiles/CRASH_5"
      @load "crash3", "./sound/audioFiles/CRASH_6"
      @load "ride", "./sound/audioFiles/RIDE_1"
      @load "glass", "./sound/audioFiles/glass2"
      @load "thump", "./sound/audioFiles/8938__patchen__piano-hits-hand-03v2"
      @load "lowFlash", "./sound/audioFiles/9569__thanvannispen__industrial-low-flash04"
      @load "lowFlash2", "./sound/audioFiles/9570__thanvannispen__industrial-low-flash07"
      @load "tranceKick2", "./sound/audioFiles/24004__laya__dance-kick3"
      @load "tranceKick", "./sound/audioFiles/33325__laya__trance-kick01"
      @load "voltage", "./sound/audioFiles/49255__keinzweiter__bonobob-funk"
      @load "beepA", "./sound/audioFiles/100708__steveygos93__bleep_a"
      @load "beepB", "./sound/audioFiles/100708__steveygos93__bleep_b"
      @load "beepC", "./sound/audioFiles/100708__steveygos93__bleep_c"
      @load "beepD", "./sound/audioFiles/100708__steveygos93__bleep_d"
      @load "alienBeep", "./sound/audioFiles/132389__blackie666__alienbleep"
      @load "penta1", "./sound/audioFiles/toneMatrix-1"
      @load "penta2", "./sound/audioFiles/toneMatrix-2"
      @load "penta3", "./sound/audioFiles/toneMatrix-3"
      @load "penta4", "./sound/audioFiles/toneMatrix-4"
      @load "penta5", "./sound/audioFiles/toneMatrix-5"
      @load "penta6", "./sound/audioFiles/toneMatrix-6"
      @load "penta7", "./sound/audioFiles/toneMatrix-7"
      @load "penta8", "./sound/audioFiles/toneMatrix-8"
      @load "penta9", "./sound/audioFiles/toneMatrix-9"
      @load "penta10", "./sound/audioFiles/toneMatrix-10"
      @load "penta11", "./sound/audioFiles/toneMatrix-11"
      @load "penta12", "./sound/audioFiles/toneMatrix-12"
      @load "penta13", "./sound/audioFiles/toneMatrix-13"
      @load "penta14", "./sound/audioFiles/toneMatrix-14"
      @load "penta15", "./sound/audioFiles/toneMatrix-15"
      @load "penta16", "./sound/audioFiles/toneMatrix-16"
      @load "ciack", "./sound/audioFiles/ciack"
      @load "snap", "./sound/audioFiles/snap"
      @load "thump2", "./sound/audioFiles/thump2"
      @load "dish", "./sound/audioFiles/dish"
    
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

