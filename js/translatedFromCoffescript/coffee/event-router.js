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
    var args, callbacks, i, listenerInfo, _i, _len, _results;
    args = void 0;
    callbacks = void 0;
    i = void 0;
    listenerInfo = void 0;
    args = Array.prototype.slice.call(arguments);
    if (this.events[name]) {
      args = args.slice(1);
      callbacks = this.events[name];
      _results = [];
      for (_i = 0, _len = callbacks.length; _i < _len; _i++) {
        listenerInfo = callbacks[_i];
        _results.push(listenerInfo.callback.apply(listenerInfo.context, args));
      }
      return _results;
    }
  };

  return EventRouter;

})();
