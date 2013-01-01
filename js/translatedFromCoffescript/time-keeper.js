var createTimeKeeper;

createTimeKeeper = function() {
  "use strict";

  var TimeKeeper, time, timeAtStart;
  TimeKeeper = {};
  time = void 0;
  timeAtStart = void 0;
  window.time = 0;
  TimeKeeper.updateTime = function() {
    var d;
    d = new Date();
    time = d.getTime() - timeAtStart;
    return window.time = d.getTime() - timeAtStart;
  };
  TimeKeeper.resetTime = function() {
    var d;
    d = new Date();
    time = 0;
    window.time = 0;
    return timeAtStart = d.getTime();
  };
  TimeKeeper.getTime = function() {
    return time;
  };
  return TimeKeeper;
};
