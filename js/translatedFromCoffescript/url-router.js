var createUrlRouter;

createUrlRouter = function(events) {
  "use strict";

  var UrlRouter;
  UrlRouter = {};
  UrlRouter.getHash = function() {
    var match;
    match = window.location.href.match(/#(.*)$/);
    if (match) {
      return match[1];
    } else {
      return "";
    }
  };
  UrlRouter.setHash = function(hash) {
    return window.location.hash = hash;
  };
  UrlRouter.urlPointsToDemoOrTutorial = function() {
    var found, hash;
    hash = void 0;
    found = false;
    hash = UrlRouter.getHash();
    if (hash) {
      events.trigger("url-hash-changed", hash);
      found = true;
    }
    return found;
  };
  events.bind("set-url-hash", UrlRouter.setHash, UrlRouter);
  return UrlRouter;
};
