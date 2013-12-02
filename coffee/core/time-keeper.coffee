###
## Keeps the time. A small thing to do, but it allows tricks such as
## setting a fake time for testing purposes, and avoiding repeated and
## unnecessary invokation of the Date and getTime browser functions.
###

define ['core/event-emitter', 'pulse'], (EventEmitter, PulseEmpty) ->

  class TimeKeeper extends EventEmitter

    constructor: ->
      @time = undefined          # current time in SECONDS
      @millisAtStart = undefined # milliseconds at program start
      @milliseconds = undefined  # current time in MILLISECONDS
      @bpm = 100
      @mspb = 60000 / @bpm       # milliseconds per beat
      @lastBeat = undefined      # milliseconds at last beat
      @beatCount = 0             # current/last whole beat number

      @pulseClient = new Pulse();      

      super()
      
      # window.connect = (address) => @connect(address)
      window.bpm = (bpm) => @setBpm(bpm)
      window.beat = => @beat()
      window.pulse = => @pulse()
      window.wave = (period) => @wave(period)

      @resetTime()
      @beatLoop()


    ###
    Connects to a pulse server, and read the bpm/beat from there.
    ###
    connect: (address) ->
      if address && !(@pulseClient.connecting || @pulseClient.currentConnection() == @pulseClient.cleanAddress(address))
        console.log(@pulseClient.currentConnection())
        console.log(@pulseClient.cleanAddress(address))
        console.log('Connecting to ' + address)
        @pulseClient.connect(address)
      
      return

    ###
    This is the beat loop that runs at 4 quarters to the beat, emitting
    an event for every quarter. It uses setTimeout in stead of setInterval
    because the BPM could change.
    ###
    beatLoop: ->
      now = new Date().getTime()
      if now >= @lastBeat + @mspb
        @lastBeat += @mspb
        @beatCount += 1
      fraction = Math.round((now - @lastBeat) / @mspb * 4) / 4;
      @emit('beat', @beatCount + fraction)
      
      # Set the BPM and phase from pulse if it's connected
      if @pulseClient.currentConnection()
        @setBpm(@pulseClient.bpm)
        if @pulseClient.beats.length
          @lastBeat = @pulseClient.beats[@pulseClient.beats.length-1]
      
      # Set a timeout for the next (quarter) beat
      nextQuarterBeat = @lastBeat + @mspb * (fraction + 0.25)
      delta = nextQuarterBeat - new Date().getTime()
      setTimeout( (=> @beatLoop()) , delta)

    resetTime: ->
      @lastBeat = @millisAtStart = new Date().getTime()
      @updateTime()

    updateTime: ->
      @milliseconds = new Date().getTime()
      @time = window.time = (@milliseconds - @millisAtStart) / 1000

    setBpm: (bpm) ->
      if not bpm?
        return

      # Any string supplied is interpreted as the address
      if typeof bpm == 'string'
        connect(bpm)

      if bpm != @bpm
        @bpm = Math.max(20, Math.min(bpm, 170))
        @mspb = 60000 / @bpm

    getTime: ->
      # TODO/tom: This will be obsolete soon
      @time

    beat: ->
      passed = new Date().getTime() - @lastBeat
      return @beatCount + passed / @mspb;

    pulse: ->
      return Math.exp(-Math.pow( Math.pow(@beat() % 1, 0.3) - 0.5, 2) / 0.05)

    # Wave: simple harmonic motion where a is period in milliseconds
    wave: (period) ->
      # TODO/tom: base on beat
      if typeof period isnt "number"
        period = 500
      sin((@time/period) * Math.PI)



  TimeKeeper

