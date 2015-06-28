# From https://gist.github.com/Contra/2759355
# The central EventRouter is an instance of this class,
# it can serve as a superclass for others (e.g. the TimeKeeper).

###
## EventRouter bridges most events in LiveCodeLab.
## Error message pops up? Event router steps in.
## Big cursor needs to shrink? It's the event router who stepped in.
## You get the picture.
## Any part of LiveCodeLab can just register callbacks and trigger events,
## using some descriptive strings as keys.
## Handy because it's a hub where one could attach debugging and listing
## of all registered callbacks. Probably not a good idea to attach
## rapid-fire events due to overheads.
###

class EventEmitter
  constructor: ->
    @events = {}
 
  emit: (event, args...) ->
    return false unless @events[event]
    listener args... for listener in @events[event]
    return true
 
  addListener: (event, listener) ->
    @emit 'newListener', event, listener
    (@events[event]?=[]).push listener
    return @
 
  on: @::addListener
 
  once: (event, listener) ->
    fn = =>
      @removeListener event, fn
      listener arguments...
    @on event, fn
    return @
 
  removeListener: (event, listener) ->
    return @ unless @events[event]
    @events[event] = (l for l in @events[event] when l isnt listener)
    return @
 
  removeAllListeners: (event) ->
    delete @events[event]
    return @

module.exports = EventEmitter

