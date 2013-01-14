"use strict"
class EventRouter

  events: {}
  
  constructor: ->
  
  bind: (name, callback, context) ->
    # console.log("binding: " + name + " to callback: " + callback + " with context: " + context);
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
      i = 0
      while i < callbacks.length
        listenerInfo = callbacks[i]
        listenerInfo.callback.apply listenerInfo.context, args
        i += 1
