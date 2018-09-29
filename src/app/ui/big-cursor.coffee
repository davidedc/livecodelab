###
## The big cursor that flashes when the environment is first opened.
## It's a special div "just for show", it's not actually a functioning
## cursor and it won't contain any text.
## It just shrinks/expands depending on whether the user types something
## (shrinks) or whether the program turns empty (expands).
###

class BigCursor

  fakeCursorInterval: null
  isShowing: null
  editor: null

  constructor: (eventRouter, @editor) ->
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

  turnBlinkingOff: ->
    clearTimeout @fakeCursorInterval
    @fakeCursorInterval = null

  turnBlinkingOn: ->
    #avoid setting the animation twice, which causes
    # the cursor to start blinking twice as fast.
    if !@fakeCursorInterval?
      @fakeCursorInterval = setInterval(
        @startBigCursorBlinkingAnimation, 800
      )

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
      setTimeout (() => $(@editor.codemirrorInstance.getWrapperElement()).animate({opacity: 1}, "fast")), 120
      setTimeout (() -> $("#justForFakeCursor").hide()), 200
      setTimeout (() -> $("#toMove").hide()), 200
      @isShowing = false
      @turnBlinkingOff()

  unshrinkBigCursor: ->
    unless @isShowing
      #$("#formCode").animate
      $(@editor.codemirrorInstance.getWrapperElement()).animate
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
      @turnBlinkingOn()

module.exports = BigCursor

