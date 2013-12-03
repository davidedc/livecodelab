###
## SoundSystem tries to abstract away different ways of playing sound,
## according to weird performance characteristics of each browser
## (and probably, OS). Cross-browser sound playing is really in a sorry
## state, we are trying to make do here.
###

define () ->

  class SoundSystem

    soundLoopTimer: undefined
    beatNumber: 0
    totalCreatedSoundObjects: 0
    soundSystemIsMangled: false
    CHANNELSPERSOUND: 6
    endedFirstPlay: 0
    buzzObjectsPool: []
    soundFilesPaths: {}
    soundLoops: []
    
    constructor: (@eventRouter, @timeKeeper, @buzz, @lowLag, @Bowser, @samplebank) ->
      @soundLoops.soundIDs = []
      @soundLoops.beatStrings = []

      # now that all the various sound playing functions for the different cases
      # are defined, we set the "play" function to the best solution according
      # to the browser/os. We wish we could do this better.
      #if @Bowser.firefox
      #  @playSound = (a,b,c) => @play_using_DYNAMICALLY_CREATED_AUDIO_TAG(a,b,c)
      #else if @Bowser.safari or @Bowser.msie or @Bowser.chrome
      #  @playSound = (a,b,c) => @play_using_BUZZJS_WITH_ONE_POOL_PER_SOUND(a,b,c)

      @timeKeeper.addListener('beat', (beat) => @soundLoop(beat) );

      @playSound = (a,b,c) => @play_using_LOWLAGJS(a,b,c)

      # These need to be global so it can be run by the draw function
      window.play = (a,b) => @play(a,b)

    resetLoops: ->
      @soundLoops.soundIDs = []
      @soundLoops.beatStrings = []

    playStartupSound: ->
      startup = new @buzz.sound(@samplebank.getByName("bing").path)
      startup.play()

    # called from within patches
    play: (soundID, beatString) ->
      # ignore the whitespaced
      beatString = beatString.replace(/\s*/g, "")
      @soundLoops.soundIDs.push soundID
      @soundLoops.beatStrings.push beatString

    # When each Audio object plays, it plays from start to end
    # and you can't get it to re-start until it's completely done
    # playing.
    # This is problematic because some sounds last a second or so, and they
    # need to play more often than one time per second.
    # So here are possible mechanisms to achieve that:
    #
    # BUZZJS_WITH_ONE_POOL:
    #    to have 20 or so sound objects, and all the times that
    #    a file needs playing, scan them and find one that is free,
    #    then associate that to the file one wants to play
    #    this works well in IE and Chrome but really bad in Safari
    #    The problem here is the potentially heavy switching of sound files.
    #
    # BUZZJS_WITH_ONE_POOL_PER_SOUND:
    #    for each file, give there is a pool of buzz objects that can play it.
    #    This is more complicated but seems to work
    #    about right in all browsers. Only caveat is that Safari
    #    needs the audio objects to be preloaded because otherwise
    #    it jams. Conversely, IE and Chrome don't like them preloaded
    #    because they have a limit of 35 or so sounds.
    #
    # BUZZ_JS_FIRE_AND_FORGET:
    #    This method is the simplest and entails just using buzz.js
    #    fire and forget.
    #    Each "playing" beat a new object is created.
    #
    # DYNAMICALLY_CREATED_AUDIO_TAG:
    #    Directly create an audio object each time we need to play a sound.
    #    Once the sound has finished playing, the audio
    #    object is garbage collected.
    # The buzzObjectsPool parameter is not used but we put it here
    # for uniformity with the other playing alternatives
    play_using_BUZZ_JS_FIRE_AND_FORGET: (soundFilesPaths,loopedSoundID,@buzzObjectsPool) ->
      soundFilePath = undefined
      soundFilePath = soundFilesPaths[loopedSoundID]
      availableBuzzObject = new @buzz.sound(soundFilePath)
      availableBuzzObject.play()

    play_using_DYNAMICALLY_CREATED_AUDIO_TAG: (soundFilesPaths,loopedSoundID,@buzzObjectsPool) ->
      audioElement = undefined
      source1 = undefined
      soundFilePath = undefined
      soundFilePath = soundFilesPaths[loopedSoundID]
      audioElement = document.createElement("audio")
      audioElement.setAttribute "preload", "auto"
      audioElement.autobuffer = true
      source1 = document.createElement("source")
      source1.type = "audio/ogg"
      source1.src = soundFilePath
      audioElement.appendChild source1
      audioElement.addEventListener "load", (=>
        audioElement.play()
        $(".filename span").html audioElement.src
      ), true
      audioElement.play()

    play_using_LOWLAGJS: (soundFilesPaths,loopedSoundID,@buzzObjectsPool) ->
      @lowLag.play(loopedSoundID)

    play_using_BUZZJS_WITH_ONE_POOL_PER_SOUND: (soundFilesPaths,loopedSoundID,@buzzObjectsPool) ->
      availableBuzzObject = undefined
      allBuzzObjectsForWantedSound = @buzzObjectsPool[loopedSoundID]
      buzzObject = undefined
      
      # check if there is an available buzz object that has finished
      # playing
      for buzzObject in allBuzzObjectsForWantedSound
        if buzzObject.isEnded()
          availableBuzzObject = buzzObject
          break

      if not availableBuzzObject?
        # there are no available buzz objects for this sound
        # which might mean two things: there are too few and we can just
        # create a new one
        # OR there are already too many, so simply put the sound system
        # is mangled.
        if @totalCreatedSoundObjects > 31
          @soundSystemIsMangled = true
          $("#soundSystemIsMangledMessage").modal()
          $("#simplemodal-container").height 250
          return
        availableBuzzObject = new @buzz.sound(soundFilesPaths[loopedSoundID])
        @buzzObjectsPool[loopedSoundID].push availableBuzzObject
        @totalCreatedSoundObjects += 1
      
      # if we are here it means that there is a buzz object to play with
      # (either an existing one that has stopped playing or a freshly-made one)
      availableBuzzObject.play()
    
    soundLoop: (beat) ->
      loopedSoundID = undefined
      playOrNoPlay = undefined
      beatString = undefined
      return  if @soundSystemIsMangled
      # @beatNumber += 1
      for loopingTheSoundIDs in [0...@soundLoops.soundIDs.length]
        loopedSoundID = @soundLoops.soundIDs[loopingTheSoundIDs]
        
        # When the user modifies the name of a sample,
        # while she is not done finishing typing, the sample name is "incomplete"
        # or anyways it doesn't map to anything until it's complete,
        # doesn't index any actual sound. So we check for that here.
        if @soundFilesPaths[loopedSoundID]
          beatString = @soundLoops.beatStrings[loopingTheSoundIDs]
          
          # the beat string can be any length, we just wrap around if needed.
          playOrNoPlay = beatString.charAt(beat * 4 % (beatString.length))
          
          # transparently plays using the best method for this
          # browser/os combination
          if playOrNoPlay is "x"
            @playSound @soundFilesPaths, loopedSoundID, @buzzObjectsPool

    
    # Called in init.js
    isAudioSupported: ->
    #  setTimeout (=>
    #    unless @buzz.isSupported()
    #      $("#noAudioMessage").modal()
    #      $("#simplemodal-container").height 200
    #  ), 500

    
    # Called from loadAndTestAllTheSounds
    #checkSound: (soundDef, soundInfo) ->
    #  newSound = new @buzz.sound(soundInfo.path)
    #  newSound.load()
    #  newSound.mute()
    #  newSound.bind "ended", (e) =>
    #    newSound.unbind "ended"
    #    newSound.unmute()
    #    @endedFirstPlay += 1
    #    if @endedFirstPlay is soundDef.sounds.length * @CHANNELSPERSOUND
    #      @eventRouter.trigger "all-sounds-loaded-and tested"#
    #
    #  newSound.play()
    #  @buzzObjectsPool[soundInfo.name].push newSound

    
    # Called form the document ready block in init.js
    loadAndTestAllTheSounds: ->
      @lowLag.init()
      soundDef = undefined
      soundInfo = undefined
      preloadSounds = undefined
      soundDef = @samplebank
      for cycleSoundDefs in [0...soundDef.sounds.length]
        soundInfo = soundDef.getByNumber(cycleSoundDefs)
        #@buzzObjectsPool[soundInfo.name] = []
        @soundFilesPaths[soundInfo.name] = soundInfo.path
        @lowLag.load(soundInfo.path,soundInfo.name)
        
        # Chrome can deal with dynamic loading
        # of many files but doesn't like loading too many audio objects
        # so fast - it crashes.
        # At the opposite end, Safari doesn't like loading sound dynamically
        # and instead works fine by loading sound all at the beginning.
        #if @Bowser.safari
        #  for preloadSounds in [0...@CHANNELSPERSOUND]
        #    # if you load and play all the channels of all the sounds
        #    # all together the browser freezes, and the OS doesn't feel
        #    # too well either so better stagger the checks in time.
        #    setTimeout(
        #      (soundDef,soundInfo)=>@checkSound(soundDef,soundInfo),
        #      20 * cycleSoundDefs,
        #      soundDef,
        #      soundInfo
        #    )
      # end of the for loop
      
        # if this is chrome, fire the callback immediately
        # otherwise wait untill all the sounds have been tested
        @eventRouter.emit("all-sounds-loaded-and tested")  unless @Bowser.safari

  SoundSystem

