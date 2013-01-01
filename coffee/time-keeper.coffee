# jslint browser: true 
# global Date 

createTimeKeeper = ->
  "use strict"
  TimeKeeper = {}
  time = undefined
  timeAtStart = undefined
  window.time = 0
  TimeKeeper.updateTime = ->
    d = new Date()
    time = d.getTime() - timeAtStart
    window.time = d.getTime() - timeAtStart

  TimeKeeper.resetTime = ->
    d = new Date()
    time = 0
    window.time = 0
    timeAtStart = d.getTime()

  TimeKeeper.getTime = ->
    time

  TimeKeeper