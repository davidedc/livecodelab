###
## Keeps the time. A small thing to do, but it allows tricks such as
## setting a fake time for testing purposes, and avoiding repeated and
## unnecessary invokation of the Date and getTime browser functions.
###

define ['core/event-emitter'], (EventEmitter) ->

  class TimeKeeper extends EventEmitter

    constructor: ->      
      @time = undefined          # current time in SECONDS
      @millisAtStart = undefined # milliseconds at program start
      @milliseconds = undefined  # current milliseconds
      @bpm = 100
      @mspb = 60000 / @bpm       # milliseconds per beat
      @lastBeat = undefined      # milliseconds at last beat
      @beatCount = 0             # current/last whole beat number
      
      @resetTime()

      super()
      
      window.time = 0
      window.wave = (a) => @wave(a)

      @beatLoop()

    ###
    This is the beat loop that runs at 4 quarters to the beat, emitting
    an event for every quarter.
    ###
    beatLoop: ->
      now = new Date().getTime()
      if now >= @lastBeat + @mspb
        @lastBeat += @mspb
        @beatCount += 1
        console.log("whole beat")
      fraction = Math.round((now - @lastBeat) / @mspb * 4) / 4;
      @emit('beat', @beatCount + fraction)
      # Set a timeout for the next beat
      nextQuarterBeat = @lastBeat + @mspb * (fraction + 0.25)
      delta = nextQuarterBeat - new Date().getTime()
      setTimeout( (=> @beatLoop()) , delta)

    resetTime: ->
      @lastBeat = @millisAtStart = new Date().getTime()
      @updateTime()

    updateTime: ->
      @milliseconds = new Date().getTime()
      @time = window.time = (@milliseconds - @millisAtStart) / 1000

    getTime: ->
      # TODO/tom: This will be obsolete soon
      @time

    # Wave: simple harmonic motion where a is period in milliseconds
    wave: (a) ->
      # TODO/tom: base on beat
      if typeof a isnt "number"
        a = 500
      sin((@time/a) * Math.PI)

  TimeKeeper

