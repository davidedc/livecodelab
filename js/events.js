
var createEventRouter = function () {

    'use strict';

    var EventRouter = {},
        events = {};

    EventRouter.bind = function (name, callback, context) {
        //console.log("binding: " + name + " to callback: " + callback + " with context: " + context);
        var listenerInfo = {
            callback: callback,
            context: context
        };

        if (!events[name]) {
            events[name] = [];
        }
        events[name].push(listenerInfo);
    };

    EventRouter.trigger = function (name) {
        var args, callbacks, i, listenerInfo;

        //console.log("triggered: " + name);
        // convert the arguments object into an array
        args = Array.prototype.slice.call(arguments);

        if (events[name]) {
            args = args.slice(1);
            callbacks = events[name];
            for (i = 0; i < callbacks.length; i += 1) {
                var listenerInfo = callbacks[i];
                listenerInfo.callback.apply(listenerInfo.context, args);
            }
        }
    };

    return EventRouter;
};

