###
## Keeps the time. A small thing to do, but it allows tricks such as
## setting a fake time for testing purposes, and avoiding repeated and
## unnecessary invokation of the Date and getTime browser functions.
###

EventEmitter = require '../core/event-emitter'

class TimeKeeper extends EventEmitter

  constructor: (@syncClient, @_audioApi) ->
    super()                       # call EventEmitter constructor

    now = @getCurrentTime()

    @beatCount       = 1            # last whole beat number
    @beatFraction    = 0            # fraction of the beat we're at

    @defaultBpm      = 100
    @defaultBpmShift = 0
    @bpm             = 100
    @newBpm          = 100
    @mspb            = 60000 / @bpm # milliseconds per beat

    @lastBeatLoopMs  = now          # milliseconds at last beat loop
    @timeAtStart     = now          # milliseconds at loop start
    @time            = now / 1000   # current time in SECONDS

    @resetTime()
    @beatLoop(now)

  addToScope: (scope) ->

    @scope = scope
    scope.addFunction('bpm',   (bpm) => @setBpm(bpm))
    scope.addFunction('bpmShift', (bpmShift) => @setBpmShift(bpmShift))
    scope.addFunction('beat',  () => @beat())
    scope.addFunction('pulse', (frequency) => @pulse(frequency))
    scope.addFunction('wave',  (frequency) => @wave(frequency))
    scope.addVariable('time',  @time)

  ###
  From now on, call @getCurrentTime instead of @_audioApi.getTime()
  ###
  getCurrentTime: () =>
    currentTime = @_audioApi.getTime()
    if @bpmShift
      currentTime += @bpmShift
    return currentTime

  setTime: (value) =>
    @time = value
    if @scope
      @scope.addVariable('time', @time)

  ###
  This is the beat loop that runs at 4 quarters to the beat, emitting
  an event for every quarter. It uses setTimeout in stead of setInterval
  because the BPM could change.

  The argument passed in is the time the beat should really be happening.
  This means that we can account for jitter but increasing/decreasing the
  timeout we use for triggering the next call
  ###
  beatLoop: (aimedForTime) =>

    now = @getCurrentTime()

    @emit('beat', @beatCount + @beatFraction)

    if (@beatFraction >= 1)
      @beatFraction = 0

      @beatCount += 1

    if (@syncClient.currentConnection() and @syncClient.beats.length)

      @setBpm(@syncClient.bpm)

      c = @syncClient.beats.length -1
      syncClientLastBeatLoopMs = @syncClient.beats[c]
      if (@syncClient.count == 1)
        @beatCount = 1

      # The sync client last beat loop ms will be the time of
      # the last quarter note the client knew about
      @lastBeatLoopMs = syncClientLastBeatLoopMs

    else
      @lastBeatLoopMs = now

    @beatFraction += 0.25

    # next call should be in 1/4 of a beat time
    diffMs = aimedForTime - now
    quarterBeatMs = @mspb * 0.25
    # We subtract a few miliseconds so that this triggers ahead of time
    # This means we can schedule events in the future for higher precision
    preemptMs = 20 # milliseconds
    newAimedForTime = aimedForTime + quarterBeatMs

    timeout = (quarterBeatMs + diffMs) - preemptMs

    setTimeout((() => @beatLoop(newAimedForTime)), timeout)

  resetTime: =>
    @lastBeat = @millisAtStart = @getCurrentTime()
    @updateTime()

  updateTime: =>
    @setTime((@getCurrentTime() - @millisAtStart) / 1000)

  setBpm: (bpm) ->
    if !(bpm?)
      bpm = @defaultBpm
    if (@bpm != bpm)
      @bpm = Math.max(20, Math.min(bpm, 250))
      @mspb = 60000 / @bpm

  setBpmShift: (bpmShift) ->
    if !(bpmShift?)
      bpmShift = @defaultBpmShift
    if (typeof bpmShift is 'number' and isFinite bpmShift and @bpmShift != bpmShift)
      @bpmShift = bpmShift

  ###
  Connects to a sync server, and read the bpm/beat from there.
  ###
  connect: (address) ->
    if address && !(
      @syncClient.connecting || (
        @syncClient.currentConnection() == @syncClient.cleanAddress(address)
      )
    )
      console.log('Connecting to ' + address)
      @syncClient.connect(address)

  beat: ->
    now = @getCurrentTime()
    msSinceLastQuarter = now - @lastBeatLoopMs
    msFrac = (msSinceLastQuarter / @mspb)
    beatValue = @beatCount + @beatFraction + msFrac
    return beatValue

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
    Math.sin((@beat() * frequency) * Math.PI)

module.exports = TimeKeeper

