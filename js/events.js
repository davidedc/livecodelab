
var createEventRouter = function () {

    'use strict';

    var EventRouter = {},
        events = {};

    EventRouter.bind = function (name, callback) {
        if (!events[name]) {
            events[name] = [];
        }
        events[name].push(callback);
    };

    EventRouter.trigger = function (name) {
        var args, callbacks, i;

        if (events[name]) {
            args = arguments.slice(1);
            callbacks = events[name];
            for (i = 0; i < events.length; i += 1) {
                callbacks[i](args);
            }
        }
    };

    return EventRouter;
};

