###
EventRouter bridges most events in LiveCodeLab. Error message pops up? Event router
steps in. Big cursor needs to shrink? It's the event router who stepped in. You get the
picture. Any part of LiveCodeLab can just register callbacks and trigger events, using
some descriptive strings as keys. Handy because it's a hub where one could attach
debugging and listing of all registered callbacks. Probably not a good idea to attach
rapid-fire events due to overheads.
###

class EventRouter
  "use strict"

  events: {}
  
  constructor: ->
  
  bind: (name, callback, context) ->
    # console.log("binding: " + name + " to callback: " +
    #   callback + " with context: " + context);
    listenerInfo =
      callback: callback
      context: context

    @events[name] = []  unless @events[name]
    @events[name].push listenerInfo

  trigger: (name) ->
    args = undefined
    callbacks = undefined
    i = undefined
    listenerInfo = undefined
    
    # console.log("triggered: " + name);
    # convert the arguments object into an array
    args = Array::slice.call(arguments)
    if @events[name]
      args = args.slice(1)
      callbacks = @events[name]
      for listenerInfo in callbacks
        listenerInfo.callback.apply listenerInfo.context, args
