###
## SoundSystem tries to abstract away different ways of playing sound,
## according to weird performance characteristics of each browser
## (and probably, OS). Cross-browser sound playing is really in a sorry
## state, we are trying to make do here.
###

define () ->

  class SoundSystem

    constructor: (
      @eventRouter,
      @timeKeeper,
      @audioAPI,
      @samplebank,
      @patternPlayer
    ) ->
      @timeKeeper.addListener('beat', (beat) => @soundLoop(beat) )
      @playPatterns = []

    addToScope: (scope) ->
      scope.add('play', (a,b) => @play(a,b))

    clearPatterns: ->
      @playPatterns = []

    playStartupSound: ->
      @audioAPI.play('bing')

    # called from within patches
    play: (name, pattern) ->
      @playPatterns.push({
        name: name,
        pattern: pattern
      })

    soundLoop: (beat) ->
      null

  SoundSystem

