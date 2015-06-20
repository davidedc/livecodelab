###
## Helper class to manage URL hash location.
###

define () ->

  class UrlRouter

    constructor: (@eventRouter, @location) ->
      @eventRouter.addListener("set-url-hash", (hash) => @setHash(hash) )

    getHash: ->
      match = @location.href.match(/#(.*)$/)
      (if match then match[1] else "")

    setHash: (hash) ->
      @location.hash = hash

    urlPointsToDemoOrTutorial: ->
      found = false
      hash = @getHash()
      if hash
        @eventRouter.emit("url-hash-changed", hash)
        found = true
      found

  UrlRouter

