/*jslint browser: true */
/*global Date */

var createTimeKeeper = function () {

    'use strict';

    var TimeKeeper = {},
        time,
        timeAtStart;

    window.time = 0;

    TimeKeeper.updateTime = function () {
        var d = new Date();
        time = d.getTime() - timeAtStart;
        window.time = d.getTime() - timeAtStart;
    };

    TimeKeeper.resetTime = function () {
        var d = new Date();
        time = 0;
        window.time = 0;
        timeAtStart = d.getTime();
    };

    TimeKeeper.getTime = function () {
        return time;
    };

    return TimeKeeper;
};
