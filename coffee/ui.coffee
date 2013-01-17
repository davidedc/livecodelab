#jslint browser: true 
#global $ 

class Ui
  "use strict"

  constructor: (@eventRouter, @stats) ->
    # Setup Event Listeners
    @eventRouter.bind "report-runtime-or-compile-time-error", ((e)=>@checkErrorAndReport(e)), @
    @eventRouter.bind "clear-error", (=>@clearError()), @
    @eventRouter.bind "autocoder-button-pressed", (state) =>
      if state is true
        $("#autocodeIndicator").html("Autocode: on").css "background-color", "#FF0000"
      else
        $("#autocodeIndicator").html("Autocode: off").css "background-color", ""

    @eventRouter.bind "autocoderbutton-flash", =>
      $("#autocodeIndicator").fadeOut(100).fadeIn 100

    @eventRouter.bind "auto-hide-code-button-pressed", (state) =>
      if state is true
        $("#dimCodeIndicator").html "Hide Code: on"
      else
        $("#dimCodeIndicator").html "Hide Code: off"

  resizeCanvas: (canvasId) ->
    canvas = $(canvasId)
    scale =
      x: 1
      y: 1

    scale.x = (window.innerWidth + 40) / canvas.width()
    scale.y = (window.innerHeight + 40) / canvas.height()
    scale = scale.x + ", " + scale.y
    
    # this code below is if one wants to keep the aspect ratio
    # but I mean one doesn't necessarily resize the window
    # keeping the same aspect ratio.
    
    # if (scale.x < 1 || scale.y < 1) {
    #     scale = '1, 1';
    # } else if (scale.x < scale.y) {
    #     scale = scale.x + ', ' + scale.x;
    # } else {
    #     scale = scale.y + ', ' + scale.y;
    # }
    canvas.css("-ms-transform-origin", "left top").css("-webkit-transform-origin", "left top").css("-moz-transform-origin", "left top").css("-o-transform-origin", "left top").css("transform-origin", "left top").css("-ms-transform", "scale(" + scale + ")").css("-webkit-transform", "scale3d(" + scale + ", 1)").css("-moz-transform", "scale(" + scale + ")").css("-o-transform", "scale(" + scale + ")").css "transform", "scale(" + scale + ")"

  
  # TODO In theory we want to re-draw the background because the
  # aspect ration might have changed.
  # But for the time being we only have vertical
  # gradients so that's not going to be a problem.
  adjustCodeMirrorHeight: ->
    $(".CodeMirror-scroll").css "height", window.innerHeight - $("#theMenu").height()

  
  # resizing the text area is necessary otherwise
  # as the user types to the end of it, instead of just scrolling
  # the content leaving all the other parts of the page where
  # they are, it expands and it pushes down
  # the view of the page, meaning that the canvas goes up and
  # the menu disappears
  # so we have to resize it at launch and also every time the window
  # is resized.
  fullscreenify: (canvasId) ->
    window.addEventListener "resize", (=>
      @adjustCodeMirrorHeight()
      @resizeCanvas canvasId
    ), false
    @resizeCanvas canvasId

  checkErrorAndReport: (e) ->
    $("#dangerSignText").css "color", "red"
    
    # if the object is an exception then get the message
    # otherwise e should just be a string
    errorMessage = e.message or e
    if errorMessage.indexOf("Unexpected 'INDENT'") > -1
      errorMessage = "weird indentation"
    else if errorMessage.indexOf("Unexpected 'TERMINATOR'") > -1
      errorMessage = "line not complete"
    else if errorMessage.indexOf("Unexpected 'CALL_END'") > -1
      errorMessage = "line not complete"
    else if errorMessage.indexOf("Unexpected '}'") > -1
      errorMessage = "something wrong"
    else if errorMessage.indexOf("Unexpected 'MATH'") > -1
      errorMessage = "weird arithmetic there"
    else if errorMessage.indexOf("Unexpected 'LOGIC'") > -1
      errorMessage = "odd expression thingy"
    else if errorMessage.indexOf("Unexpected 'NUMBER'") > -1
      errorMessage = "lost number?"
    else if errorMessage.indexOf("Unexpected 'NUMBER'") > -1
      errorMessage = "lost number?"
    else errorMessage = errorMessage.replace(/ReferenceError:\s/g, "")  if errorMessage.indexOf("ReferenceError") > -1
    $("#errorMessageText").text errorMessage

  clearError: ->
    $("#dangerSignText").css "color", "#000000"
    $("#errorMessageText").text ""

  soundSystemOk: ->
    $("#soundSystemStatus").text("Sound System On").removeClass("off").addClass "on"

  hideStatsWidget: ->
    $("#statsWidget").hide()

  
  #console.log('hiding stats widget');
  showStatsWidget: ->
    
    # I wish I could tell you why showing the widget straight away doesn't work.
    # Postponing a little bit makes this work. It doesn't make any sense.
    setTimeout "$(\"#statsWidget\").show()", 1

  
  #console.log('showing stats widget');
  setup: ->
    $(document).ready =>
      # we need a way to reference the eventRouter without
      # resorting to "@", because the "@"s below need to stick
      # to the UI elements that generated the events
      eventRouter = @eventRouter
      
      $("#aboutMenu").click ->
        $("#aboutWindow").modal()
        $("#simplemodal-container").height 250
        false

      $("#demos li a").click ->
        eventRouter.trigger "load-program", $(@).attr("id")
        false

      $("#tutorials li a").click ->
        eventRouter.trigger "load-program", $(@).attr("id")
        false

      $("#autocodeIndicatorContainer").click ->
        eventRouter.trigger "toggle-autocoder"
        false

      $("#dimCodeButtonContainer").click ->
        eventRouter.trigger "editor-toggle-dim"
        false

      $("#resetButtonContainer").click ->
        eventRouter.trigger "reset"
        $(@).stop().fadeOut(100).fadeIn 100
        false

      
      # Align bottom-left
      @stats.getDomElement().style.position = "absolute"
      @stats.getDomElement().style.right = "0px"
      @stats.getDomElement().style.top = "0px"
      document.body.appendChild @stats.getDomElement()
      $("#startingCourtainScreen").fadeOut()
      $("#formCode").css "opacity", 0
      @fullscreenify "#backGroundCanvas"
      @adjustCodeMirrorHeight()
