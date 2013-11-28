###
## Helper class to manage URL hash location.
###

define () ->

  class UrlRouter

    constructor: (@eventRouter) ->
      @eventRouter.addListener("set-url-hash", => @setHash)
    
    getHash: ->
      match = window.location.href.match(/#(.*)$/)
      (if match then match[1] else "")

    setHash: (hash) ->
      window.location.hash = hash

    urlPointsToDemoOrTutorial: ->
      found = false
      hash = @getHash()
      if hash
        @eventRouter.trigger("url-hash-changed", hash)
        found = true
      found

  UrlRouter

