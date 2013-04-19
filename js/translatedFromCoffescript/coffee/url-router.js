/*
## Helper class to manage URL hash location.
*/

var UrlRouter;

UrlRouter = (function() {
  "use strict";  function UrlRouter(eventRouter) {
    this.eventRouter = eventRouter;
    this.eventRouter.bind("set-url-hash", this.setHash, this);
  }

  UrlRouter.prototype.getHash = function() {
    var match;

    match = window.location.href.match(/#(.*)$/);
    if (match) {
      return match[1];
    } else {
      return "";
    }
  };

  UrlRouter.prototype.setHash = function(hash) {
    return window.location.hash = hash;
  };

  UrlRouter.prototype.urlPointsToDemoOrTutorial = function() {
    var found, hash;

    found = false;
    hash = this.getHash();
    if (hash) {
      this.eventRouter.trigger("url-hash-changed", hash);
      found = true;
    }
    return found;
  };

  return UrlRouter;

})();
