# jslint browser: true 
# global Date 

"use strict"
class TimeKeeper
  
  time: undefined
  timeAtStart: undefined
  
  constructor: ->
    window.time = 0
  
  updateTime: ->
    d = new Date()
    @time = d.getTime() - @timeAtStart
    window.time = d.getTime() - @timeAtStart

  resetTime: ->
    d = new Date()
    @time = 0
    window.time = 0
    @timeAtStart = d.getTime()

  getTime: ->
    @time
