#jslint browser: true, regexp: true 

# This is the URL hash location router.
# It is controlled by the events framework.

createUrlRouter = (events) ->
  "use strict"
  UrlRouter = {}
  UrlRouter.getHash = ->
    match = window.location.href.match(/#(.*)$/)
    (if match then match[1] else "")

  UrlRouter.setHash = (hash) ->
    window.location.hash = hash

  UrlRouter.urlPointsToDemoOrTutorial = ->
    hash = undefined
    found = false
    hash = UrlRouter.getHash()
    if hash
      events.trigger "url-hash-changed", hash
      found = true
    found

  events.bind "set-url-hash", UrlRouter.setHash, UrlRouter
  UrlRouter