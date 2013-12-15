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
      @beatCount = 1             # last whole beat number
      @fraction = 0              # fraction of the beat we're at

      @pulseClient = new Pulse();      

      super()
      
      @resetTime()
      @beatLoop()

    addToScope: (scope) ->

      @scope = scope
      scope.add('bpm',   (bpm) => @setBpmLater(bpm))
      scope.add('beat',  () => @beat())
      scope.add('pulse', () => @pulse())
      scope.add('wave',  (period) => @wave(period))
      scope.add('time', @time)

    setTime: (value) ->
      @time = value
      if @scope
        @scope.add('time', @time)

    ###
    This is the beat loop that runs at 4 quarters to the beat, emitting
    an event for every quarter. It uses setTimeout in stead of setInterval
    because the BPM could change.
    ###
    beatLoop: ->
      now = new Date().getTime()
      @emit('beat', @beatCount + @fraction)

      if @fraction == 1
        @fraction = 0
        @beatCount += 1

        # Set the BPM and phase from pulse if it's connected
        if @pulseClient.currentConnection() and @pulseClient.beats.length
          @setBpm(@pulseClient.bpm)
          if @pulseClient.count == 1 and @lastBeat != @pulseClient.beats[@pulseClient.beats.length-1]
            @beatCount = 1
            @lastBeat = @pulseClient.beats[@pulseClient.beats.length-1]
          else
            @lastBeat = @pulseClient.beats[@pulseClient.beats.length-1] + @mspb * (@beatCount - @pulseClient.count)
        else
          @lastBeat += @mspb
      
      @fraction += 0.25

      # Set a timeout for the next (quarter) beat
      @nextQuarterBeat = @lastBeat + @mspb * @fraction
      delta = @nextQuarterBeat - new Date().getTime()
      setTimeout( (=> @beatLoop()) , delta)

    resetTime: ->
      @lastBeat = @millisAtStart = new Date().getTime()
      @updateTime()

    updateTime: ->
      @milliseconds = new Date().getTime()
      @setTime((@milliseconds - @millisAtStart) / 1000)

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

