###
## Keeps the time. A small thing to do, but it allows tricks such as
## setting a fake time for testing purposes, and avoiding repeated and
## unnecessary invokation of the Date and getTime browser functions.
###

define ['core/event-emitter'], (EventEmitter) ->

  class TimeKeeper extends EventEmitter

    constructor: (@syncClient, @audioApi) ->
      super()                       # call EventEmitter constructor

      now = @audioApi.getTime()

      @beatCount     = 1            # last whole beat number
      @fraction      = 0            # fraction of the beat we're at

      @bpm           = 100
      @newBpm        = 100
      @mspb          = 60000 / @bpm # milliseconds per beat

      @lastBeat      = now          # milliseconds at last whole beat
      @timeAtStart   = now          # milliseconds at loop start
      @time          = now / 1000   # current time in SECONDS

      @nextQuarterBeat = 0       # timestamp at which next quarter beat runs

      @resetTime()
      @beatLoop(now)

    addToScope: (scope) ->

      @scope = scope
      scope.add('bpm',   (bpm) => @setBpm(bpm))
      scope.add('beat',  () => @beat())
      scope.add('pulse', (frequency) => @pulse(frequency))
      scope.add('wave',  (frequency) => @wave(frequency))
      scope.add('time',  @time)

    setTime: (value) =>
      @time = value
      if @scope
        @scope.add('time', @time)

    ###
    This is the beat loop that runs at 4 quarters to the beat, emitting
    an event for every quarter. It uses setTimeout in stead of setInterval
    because the BPM could change.

    The argument passed in is the time the beat should really be happening.
    This means that we can account for jitter but increasing/decreasing the
    timeout we use for triggering the next call
    ###
    beatLoop: (aimedForTime) =>

      @emit('beat', @beatCount + @fraction)

      if @fraction >= 1
        @fraction = 0

        @beatCount += 1

        if (@syncClient.currentConnection() and @syncClient.beats.length)

          @setBpm(@syncClient.bpm)

          if (@syncClient.count == 1 and @lastBeat != @syncClient.beats[@syncClient.beats.length-1])
            @beatCount = 1
            @lastBeat = @syncClient.beats[@syncClient.beats.length-1]
          else
            @lastBeat = @syncClient.beats[@syncClient.beats.length-1] + @mspb * (@beatCount - @syncClient.count)
        else
          @lastBeat += @mspb

      @fraction += 0.25

      # next call should be in 1/4 of a beat time
      now = @audioApi.getTime()
      diffMs = aimedForTime - now
      quarterBeatMs = @mspb * 0.25
      # We subtract a few miliseconds so that this triggers ahead of time
      # This means we can schedule audio events in the future for higher precision
      preemptMs = 5 # milliseconds
      newAimedForTime = aimedForTime + quarterBeatMs

      timeout = (quarterBeatMs + diffMs) - preemptMs

      setTimeout((() => @beatLoop(newAimedForTime)), timeout)

    resetTime: =>
      @lastBeat = @millisAtStart = @audioApi.getTime()
      @updateTime()

    updateTime: =>
      @setTime((@audioApi.getTime() - @millisAtStart) / 1000)

    setBpm: (bpm) ->
      if (@bpm != bpm)
        @bpm = Math.max(20, Math.min(bpm, 250))
        @mspb = 60000 / @bpm

    ###
    Connects to a sync server, and read the bpm/beat from there.
    ###
    connect: (address) ->
      if address && !(@syncClient.connecting || @syncClient.currentConnection() == @syncClient.cleanAddress(address))
        console.log('Connecting to ' + address)
        @syncClient.connect(address)
      return

    beat: ->
      passed = new Date().getTime() - @lastBeat
      return @beatCount + passed / @mspb;

    pulse: (frequency) ->
      if typeof frequency != "number"
        frequency = 1
      return Math.exp(
        -Math.pow(
          Math.pow((@beat() * frequency) % 1, 0.3) - 0.5, 2
        ) / 0.05
      )

    # Wave: simple harmonic motion where a is period in milliseconds
    wave: (frequency) ->
      if typeof frequency != "number"
        frequency = 1
      sin((@beat() * frequency) * Math.PI)

  TimeKeeper

