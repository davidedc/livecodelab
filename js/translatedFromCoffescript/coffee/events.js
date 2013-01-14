"use strict";

var EventRouter;

EventRouter = (function() {

  EventRouter.prototype.events = {};

  function EventRouter() {}

  EventRouter.prototype.bind = function(name, callback, context) {
    var listenerInfo;
    listenerInfo = {
      callback: callback,
      context: context
    };
    if (!this.events[name]) {
      this.events[name] = [];
    }
    return this.events[name].push(listenerInfo);
  };

  EventRouter.prototype.trigger = function(name) {
    var args, callbacks, i, listenerInfo, _results;
    args = void 0;
    callbacks = void 0;
    i = void 0;
    listenerInfo = void 0;
    args = Array.prototype.slice.call(arguments);
    if (this.events[name]) {
      args = args.slice(1);
      callbacks = this.events[name];
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

})();
