var createEventRouter;

createEventRouter = function() {
  "use strict";

  var EventRouter, events;
  EventRouter = {};
  events = {};
  EventRouter.bind = function(name, callback, context) {
    var listenerInfo;
    listenerInfo = {
      callback: callback,
      context: context
    };
    if (!events[name]) {
      events[name] = [];
    }
    return events[name].push(listenerInfo);
  };
  EventRouter.trigger = function(name) {
    var args, callbacks, i, listenerInfo, _results;
    args = void 0;
    callbacks = void 0;
    i = void 0;
    listenerInfo = void 0;
    args = Array.prototype.slice.call(arguments);
    if (events[name]) {
      args = args.slice(1);
      callbacks = events[name];
      i = 0;
      _results = [];
      while (i < callbacks.length) {
        listenerInfo = callbacks[i];
        listenerInfo.callback.apply(listenerInfo.context, args);
        _results.push(i += 1);
      }
      return _results;
    }
  };
  return EventRouter;
};
