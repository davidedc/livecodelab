###
## Keeps the time. A small thing to do, but it allows tricks such as
## setting a fake time for testing purposes, and avoiding repeated and
## unnecessary invokation of the Date and getTime browser functions.
###

define ['core/event-emitter'], (EventEmitter) ->

  class TimeKeeper extends EventEmitter

    time: undefined
    timeAtStart: undefined
    milliseconds: undefined
    wave: undefined

    constructor: ->
      @setTime(0)

    addToScope: (scope) ->

      @scope = scope
      scope.add('wave', (a) => @wave(a))
      scope.add('time', @time)

    setTime: (value) ->
      @time = value
      if @scope
        @scope.add('time', value)

    updateTime: ->
      d = new Date()
      @setTime(d.getTime() - @timeAtStart)
      @milliseconds = d.getMilliseconds()

    resetTime: ->
      d = new Date()
      @setTime(0)
      @timeAtStart = d.getTime()

    getTime: ->
      @time

    # Wave: simple harmonic motion where a is period in milliseconds
    wave: (a) ->
      if typeof a isnt "number"
        a = 500
      sin((@time/a) * Math.PI)

  TimeKeeper

