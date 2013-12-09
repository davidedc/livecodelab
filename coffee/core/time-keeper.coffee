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
      @newBpm = undefined
      @mspb = 60000 / @bpm       # milliseconds per beat
      @lastBeat = undefined      # milliseconds at last whole beat
      @nextQuarterBeat = 0       # timestamp at which next quarter beat runs
      @beatCount = 0             # last whole beat number
      @fraction = 0              # fraction of the beat we're at

      @pulseClient = new Pulse();      

      super()
      
      # window.connect = (address) => @connect(address)
      window.bpm = (bpm) => @setBpmLater(bpm)
      window.beat = => @beat()
      window.pulse = => @pulse()
      window.wave = (period) => @wave(period)

      @resetTime()
      @beatLoop()

    ###
    This is the beat loop that runs at 4 quarters to the beat, emitting
    an event for every quarter. It uses setTimeout in stead of setInterval
    because the BPM could change.
    ###
    beatLoop: ->
      now = new Date().getTime()
      @emit('beat', @beatCount + @fraction)
      
      # Set the BPM and phase from pulse if it's connected
      if @pulseClient.currentConnection()
        console.log(@pulseClient.bpm)
        @setBpm(@pulseClient.bpm)
        # console.log(@bpm, @lastBeat, @pulseClient.beats[@pulseClient.beats.length-1]  )
        if @pulseClient.beats.length and @beatCount == @pulseClient.count
          @lastBeat = @pulseClient.beats[@pulseClient.beats.length-1]
      
      @fraction += 0.25
      if @fraction >= 1
        @lastBeat += @mspb
        @beatCount += 1
        @fraction = 0
      # fraction = Math.round((now - @lastBeat) / @mspb * 4) / 4;
      # console.log(@beatCount, @fraction, @bpm)  # TODO/tom remove 
      
      # Set a timeout for the next (quarter) beat
      @nextQuarterBeat = @lastBeat + @mspb * (@fraction + 0.25)
      delta = @nextQuarterBeat - new Date().getTime()
      setTimeout( (=> @beatLoop()) , delta)

    resetTime: ->
      @lastBeat = @millisAtStart = new Date().getTime()
      @updateTime()

    updateTime: ->
      @milliseconds = new Date().getTime()
      @time = window.time = (@milliseconds - @millisAtStart) / 1000

    setBpmLater: (bpm) ->
      if (bpm != @newBpm)
        clearTimeout(@setBpmTimeout)
        @newBpm = bpm
        @setBpmTimeout = setTimeout( (=> @setBpmOrConnect(bpm)) , 1000)

    setBpmOrConnect: (bpmOrAddress) ->
      if not bpmOrAddress?
        return

      # Any string supplied is interpreted as the address
      if typeof bpmOrAddress == 'string'
        @connect(bpmOrAddress)
      else if bpmOrAddress != @bpm
        if @pulseClient.currentConnection()
          @pulseClient.disconnect()
        @setBpm(bpmOrAddress)

    setBpm: (bpm) ->
          @bpm = Math.max(20, Math.min(bpm, 250))
          @mspb = 60000 / @bpm

    ###
    Connects to a pulse server, and read the bpm/beat from there.
    ###
    connect: (address) ->
      if address && !(@pulseClient.connecting || @pulseClient.currentConnection() == @pulseClient.cleanAddress(address))
        console.log('Connecting to ' + address)
        @pulseClient.connect(address)
      return

    beat: ->
      passed = new Date().getTime() - @lastBeat
      return @beatCount + passed / @mspb;

    pulse: ->
      return Math.exp(-Math.pow( Math.pow(@beat() % 1, 0.3) - 0.5, 2) / 0.05)

    # Wave: simple harmonic motion where a is period in milliseconds
    wave: (period) ->
      if typeof period isnt "number"
        period = 1
      sin((@beat/period) * Math.PI)



  TimeKeeper

