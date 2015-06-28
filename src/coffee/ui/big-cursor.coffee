###
## The big cursor that flashes when the environment is first opened.
## It's a special div which is actually not meant to contain text.
## It just shrinks/expands depending on whether the user types something
## (shrinks) or whether the program turns empty (expands).
###

class BigCursor

  constructor: (eventRouter) ->
    @fakeCursorInterval = undefined
    
    # Do we show the big cursor or not
    # If there's any text in the editor
    # then we shouldn't be showing it
    @isShowing = true

  startBigCursorBlinkingAnimation: ->
    $("#fakeStartingBlinkingCursor").animate(
      opacity: 0.2,
      "fast",
      "swing"
    ).animate
      opacity: 1,
      "fast",
      "swing"

  toggleBlink: (active) ->
    if active
      #avoid setting the animation twice, which causes
      # the cursor to start blinking twice as fast.
      @fakeCursorInterval = setInterval(
        @startBigCursorBlinkingAnimation, 800
      ) unless @fakeCursorInterval
    else
      clearTimeout @fakeCursorInterval
      @fakeCursorInterval = null

  shrinkBigCursor: ->
    currentCaption = undefined
    shorterCaption = undefined
    if @isShowing
      currentCaption = $("#caption").html()
      shorterCaption = currentCaption.substring(0, currentCaption.length - 1)
      $("#caption").html shorterCaption + "|"
      $("#fakeStartingBlinkingCursor").html ""
      $("#toMove").animate
        opacity: 0
        margin: -100
        fontSize: 300
        left: 0
      , "fast"
      setTimeout "$(\"#formCode\").animate({opacity: 1}, \"fast\");", 120
      setTimeout "$(\"#justForFakeCursor\").hide();", 200
      setTimeout "$(\"#toMove\").hide();", 200
      @isShowing = false
      @toggleBlink false

  unshrinkBigCursor: ->
    unless @isShowing
      $("#formCode").animate
        opacity: 0
      , "fast"
      $("#justForFakeCursor").show()
      $("#toMove").show()
      $("#caption").html "|"
      $("#toMove").animate
        opacity: 1
        margin: 0
        fontSize: 350
        left: 0
      , "fast", ->
        $("#caption").html ""
        $("#fakeStartingBlinkingCursor").html "|"
      
      @isShowing = true
      @toggleBlink true

module.exports = BigCursor

