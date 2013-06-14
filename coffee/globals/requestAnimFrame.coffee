###
## This file contains any global shims that we need
###

# Shim for browser that don't have requestAnimationFrame, see
# http://paulirish.com/2011/requestanimationframe-for-smart-animating/
lastTime = 0
vendors = ["ms", "moz", "webkit", "o"]
x = 0
while x < vendors.length and not window.requestAnimationFrame
  window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"]
  window.cancelAnimationFrame = window[vendors[x] + "CancelAnimationFrame"] or
     window[vendors[x] + "CancelRequestAnimationFrame"]
  ++x
unless window.requestAnimationFrame
  window.requestAnimationFrame = (callback, element) ->
    currTime = new Date().getTime()
    timeToCall = Math.max(0, 16 - (currTime - lastTime))
    id = window.setTimeout(->
      callback currTime + timeToCall
    , timeToCall)
    lastTime = currTime + timeToCall
    id
unless window.cancelAnimationFrame
  window.cancelAnimationFrame = (id) ->
    clearTimeout id
