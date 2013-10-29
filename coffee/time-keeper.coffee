###
## Keeps the time. A small thing to do, but it allows tricks such as
## setting a fake time for testing purposes, and avoiding repeated and
## unnecessary invokation of the Date and getTime browser functions.
###

class TimeKeeper

  time: undefined
  timeAtStart: undefined
  milliseconds: undefined
  shm: undefined

  constructor: ->
    window.time = 0
    window.shm = (a) => @shm(a)

  updateTime: ->
    d = new Date()
    @time = d.getTime() - @timeAtStart
    window.time = d.getTime() - @timeAtStart
    @milliseconds = d.getMilliseconds()

  # Simple harmonic motion where a is period in milliseconds
  shm: (a) ->
    sin((@time/a) * Math.PI)

  resetTime: ->
    d = new Date()
    @time = 0
    window.time = 0
    @timeAtStart = d.getTime()

  getTime: ->
    @time

