###
## Keeps the time. A small thing to do, but it allows tricks such as
## setting a fake time for testing purposes, and avoiding repeated and
## unnecessary invokation of the Date and getTime browser functions.
###

define ['core/event-emitter'], (EventEmitter) ->

  class TimeKeeper extends EventEmitter

    constructor: ->      
      @time: undefined
      @timeAtStart: undefined
      @milliseconds: undefined
      @bpm: 100
      @lastBeat: undefined
      @nextBeat: undefined

      window.time = 0
      window.wave = (a) => @wave(a)

    updateTime: ->
      @milliseconds = new Date().getTime()
      @time = window.time = (@milliseconds - @timeAtStart) / 1000

    beatLoop: ->
      

    resetTime: ->
      @time = 0
      window.time = 0
      @timeAtStart = new Date().getTime()

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

