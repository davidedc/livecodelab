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
      @audioApi,
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
      @audioApi.play('bing')

    # called from within patches
    play: (name, pattern) ->
      if (name && pattern)
        @playPatterns.push({
          name: name,
          pattern: pattern
        })

    soundLoop: (beat) =>
      for p in @playPatterns
        console.log(p)
        if (@patternPlayer.runPattern(p.pattern, beat))
          console.log(p)
          @audioApi.play(p.name)
      @clearPatterns()

  SoundSystem

