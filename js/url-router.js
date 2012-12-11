/*jslint browser: true, regexp: true */
/**
 * This is the URL hash location router.
 *
 * It is controlled by the events framework.
 */

var createUrlRouter = function (events) {

    'use strict';

    var UrlRouter = {};

    UrlRouter.getHash = function () {
        var match = window.location.href.match(/#(.*)$/);
        return match ? match[1] : '';
    };

    UrlRouter.setHash = function (hash) {
        window.location.hash = hash;
    };

    UrlRouter.checkUrl = function () {
        var hash, found = false;
        hash = UrlRouter.getHash();
        if (hash) {
            events.trigger('url-hash', hash);
            found = true;
        }
        return found;
    };

    events.bind('set-url-hash', UrlRouter.setHash, UrlRouter);

    return UrlRouter;
};
