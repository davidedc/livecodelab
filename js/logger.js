/*jslint browser: true, devel: true */
/*global */


var createDebugger = function () {

    'use strict';

    var history = [],
        log,
        active = false;

    log = function () {

        history.push(arguments);

        if (active) {
            if (window.console) {
                console.log(Array.prototype.slice.call(arguments));
            }
        }
    };

    log.toggle = function (onoff) {
        active = onoff;
    };

    log.getHistory = function () {
        return history;
    };

    return log;
};
