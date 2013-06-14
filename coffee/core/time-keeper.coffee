###
## Keeps the time. A small thing to do, but it allows tricks such as
## setting a fake time for testing purposes, and avoiding repeated and
## unnecessary invokation of the Date and getTime browser functions.
###

define () ->

  class TimeKeeper
  
  time: undefined
  timeAtStart: undefined
  milliseconds: undefined
  
  constructor: ->
    window.time = 0
  
  updateTime: ->
    d = new Date()
    @time = d.getTime() - @timeAtStart
    window.time = d.getTime() - @timeAtStart
    @milliseconds = d.getMilliseconds()

  resetTime: ->
    d = new Date()
    @time = 0
    window.time = 0
    @timeAtStart = d.getTime()

  getTime: ->
    @time

  TimeKeeper

