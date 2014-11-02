###
## SoundSystem tries to abstract away different ways of playing sound,
## according to weird performance characteristics of each browser
## (and probably, OS). Cross-browser sound playing is really in a sorry
## state, we are trying to make do here.
###

define () ->

  class SoundSystem

    constructor: (@eventRouter, @timeKeeper, @audioAPI, @samplebank) ->
      @timeKeeper.addListener('beat', (beat) => @soundLoop(beat) )

      @playSound = (name) => @audioAPI.play(name)

    addToScope: (scope) ->
      scope.add('bpm',  (a) => @bpm(a))
      scope.add('play', (a,b) => @play(a,b))

    resetLoops: ->
      true

    playStartupSound: ->
      @audioAPI.play('bing')

    # called from within patches
    play: (soundID, beatString) ->
      console.log('play soundID')

    soundLoop: (beat) ->
      null

    isAudioSupported: -> true

    loadAndTestAllTheSounds: -> true

  SoundSystem

