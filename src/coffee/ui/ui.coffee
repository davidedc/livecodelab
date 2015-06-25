###
## Ui handles all things UI such as the menus, the notification popups,
## the editor panel, the big flashing cursor, the stats widget...
###

$ = require '../../js/jquery'
window.$ = $
window.jQuery = $
require '../../js/jquery.sooperfish'
require '../../js/jquery.easing-sooper'
require '../../js/jquery.simplemodal'

class Ui

  @backgroundCanvasFractionOfWindowSize: 10
  @foregroundCanvasMaxScaleUpFactor: 2

  constructor: (@eventRouter, @stats, @programLoader) ->
    # Setup Event Listeners
    @eventRouter.addListener(
      "report-runtime-or-compile-time-error",
      (e) => @checkErrorAndReport(e)
    )
    @eventRouter.addListener("clear-error", => @clearError() )
    @eventRouter.addListener("autocoder-button-pressed", (state) ->
      if state is true
        $("#autocodeIndicator span").html("Autocode: on").css(
          "background-color", "#FF0000"
        )
      else
        $("#autocodeIndicator span").html("Autocode").css(
          "background-color", ""
        )
    )

    @eventRouter.addListener("autocoderbutton-flash", ->
      $("#autocodeIndicator").fadeOut(100).fadeIn 100
    )

    @eventRouter.addListener("auto-hide-code-button-pressed",
      (autoDimmingIsOn) ->
        if autoDimmingIsOn
          $("#dimCodeButton span").html("Hide Code: on")
        else
          $("#dimCodeButton span").html("Hide Code: off")
    )

  @sizeForegroundCanvas: (canvas, scale = {x: 1, y: 1}) ->

    # set the buffer size
    canvas.width = (window.innerWidth + 40) / scale.x
    canvas.height = (window.innerHeight + 40) / scale.y

    scaleString = scale.x + ", " + scale.y

    $(canvas).css("-ms-transform-origin", "0% 0%")
            .css("-webkit-transform-origin", "0% 0%")
            .css("-moz-transform-origin", "0% 0%")
            .css("-o-transform-origin", "0% 0%")
            .css("transform-origin", "0% 0%")
            .css("-ms-transform", "scale(" + scaleString + ")")
            .css("-webkit-transform", "scale3d(" + scaleString + ", 1)")
            .css("-moz-transform", "scale(" + scaleString + ")")
            .css("-o-transform", "scale(" + scaleString + ")")
            .css "transform", "scale(" + scaleString + ")"


  @resizeCanvas: (canvas, scale = {x: 1, y: 1}) ->
    sx = (window.innerWidth + 40) / 10
    sy = (window.innerHeight + 40) / 10
    canvas.style.width = sx + "px"
    canvas.style.height = sy + "px"

    document.getElementById("labels").style.width = window.innerWidth + "px"
    document.getElementById("labels").style.height = window.innerHeight + "px"

    scaleString = 10 + ", " + 10

    $(canvas).css("-ms-transform-origin", "0% 0%")
            .css("-webkit-transform-origin", "0% 0%")
            .css("-moz-transform-origin", "0% 0%")
            .css("-o-transform-origin", "0% 0%")
            .css("transform-origin", "0% 0%")
            .css("-ms-transform", "scale(" + scaleString + ")")
            .css("-webkit-transform", "scale3d(" + scaleString + ", 1)")
            .css("-moz-transform", "scale(" + scaleString + ")")
            .css("-o-transform", "scale(" + scaleString + ")")
            .css "transform", "scale(" + scaleString + ")"


  # TODO In theory we want to re-draw the background because the
  # aspect ration might have changed.
  # But for the time being we only have vertical
  # gradients so that's not going to be a problem.
  @adjustCodeMirrorHeight: ->
    $(".CodeMirror-scroll").css(
      "height", window.innerHeight - $("#theMenu").height()
    )


  # resizing the text area is necessary otherwise
  # as the user types to the end of it, instead of just scrolling
  # the content leaving all the other parts of the page where
  # they are, it expands and it pushes down
  # the view of the page, meaning that the canvas goes up and
  # the menu disappears
  # so we have to resize it at launch and also every time the window
  # is resized.
  @fullscreenify: (canvas, scale = {x: 1, y: 1}) ->
    @resizeCanvas canvas, scale
    window.addEventListener "resize", (=>
      @adjustCodeMirrorHeight()
      @resizeCanvas canvas, scale
    ), false

  checkErrorAndReport: (e) ->
    $("#errorMessageDisplay").css "color", "red"

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
    else
      errorMessage = errorMessage.replace(/ReferenceError:\s/g, "") if(
        errorMessage.indexOf("ReferenceError") > -1
      )
    $("#errorMessageDisplay").text errorMessage

  clearError: ->
    $("#errorMessageDisplay").css "color", "#000000"
    $("#errorMessageDisplay").text ""

  soundSystemOk: ->
    $("#soundSystemStatus").text("Sound System On").removeClass("off")

  hideStatsWidget: ->
    $("#statsWidget").hide()


  showStatsWidget: ->
    # I wish I could tell you why showing
    # the widget straight away doesn't work.
    # Postponing a little bit makes this work. It doesn't make any sense.
    setTimeout(
      () -> $("#statsWidget").show(),
      1
    )

  setup: ->
    # we need a way to reference the eventRouter without
    # resorting to "@", because the "@"s below need to stick
    # to the UI elements that generated the events
    eventRouter = @eventRouter

    $('#logo span').click(
      () ->
        $("#aboutWindow").modal()
        $("#simplemodal-container").height 250
        false
    )

    allDemos = @programLoader.programs.demos

    # Create an object with a property for each submenu.
    # That property contains an array with all the demos that belong to
    # that submenu.
    demoSubmenus = {}
    for demo of allDemos
      submenuOfThisDemo = allDemos[demo].submenu
      demoSubmenus[submenuOfThisDemo] ?= []
      demoSubmenus[submenuOfThisDemo].push(demo)

    for demoSubmenu of demoSubmenus

      demoSubmenuNoSpaces = demoSubmenu.replace(" ","_")
      # insert the submenu in the first level
      $("<li></li>").appendTo(
        $('#ulForDemos')
      ).attr('id', 'hookforDemos' + demoSubmenuNoSpaces)

      $("<span>#{demoSubmenu}</span>").appendTo(
        $('#hookforDemos' + demoSubmenuNoSpaces)
      )
      $("<ul id='#{demoSubmenuNoSpaces}'></ul>").appendTo(
        $('#hookforDemos' + demoSubmenuNoSpaces)
      )
      # now take each demo that belongs to this submenu and put it there
      for demo in demoSubmenus[demoSubmenu]
        a = """<li>
               <a id='#{demo}'>
               #{@programLoader.programs.demos[demo].title}
               </a>
               </li>"""
        $(a).appendTo(
          $('#'+demoSubmenuNoSpaces)
        )

    allTutorials = @programLoader.programs.tutorials

    # Create an object with a property for each submenu.
    # That property contains an array with all the tutorials that belong to
    # that submenu.
    tutorialSubmenus = {}
    for tutorial of allTutorials
      submenuOfThisTutorial = allTutorials[tutorial].submenu
      # create array if it didn't exist
      tutorialSubmenus[submenuOfThisTutorial] ?= []
      tutorialSubmenus[submenuOfThisTutorial].push(tutorial)

    for tutorialSubmenu of tutorialSubmenus

      tutorialSubmenuNoSpaces = tutorialSubmenu.replace(" ","_")
      # insert the submenu in the first level
      $("<li></li>").appendTo(
        $('#ulForTutorials')
      ).attr('id', 'hookforTutorials' + tutorialSubmenuNoSpaces)

      $("<span>#{tutorialSubmenu}</span>").appendTo(
        $('#hookforTutorials' + tutorialSubmenuNoSpaces)
      )
      $("<ul id='#{tutorialSubmenuNoSpaces}'></ul>").appendTo(
        $('#hookforTutorials' + tutorialSubmenuNoSpaces)
      )
      # now take each tutorial that belongs to this submenu and put it there
      for tutorial in tutorialSubmenus[tutorialSubmenu]
        a = """<li>
               <a id='#{tutorial}'>
               #{@programLoader.programs.tutorials[tutorial].title}
               </a>
               </li>"""
        $(a).appendTo(
          $('#'+tutorialSubmenuNoSpaces)
        )

    languageList = [
        'name': 'LCL V1',
        'value': 'lclv1'
      ,
        'name': 'LCL V2',
        'value': 'lclv2'
    ]

    for lang in languageList
      l = """<li>
             <a id='language-#{lang.value}'>
             #{lang.name}
             </a>
             </li>"""
      $(l).appendTo(
        $('#ulForLanguages')
      )


    # Now that all the menu items are in place in the DOM,
    # invoke sooperfish,
    # which does some more transformations of its own.
    $('ul.sf-menu').sooperfish()

    $("#demos ul li a").click ->
      eventRouter.emit("load-program", $(@).attr("id"))
      false

    $("#tutorials li a").click ->
      eventRouter.emit("load-program", $(@).attr("id"))
      false

    $("#languages li a").click ->
      eventRouter.emit("set-language", $(@).attr("id"))
      false

    $("#autocodeIndicator").click(
      () ->
        eventRouter.emit("toggle-autocoder")
        false
    )

    $("#dimCodeButton").click(
      () ->
        eventRouter.emit("editor-toggle-dim")
        false
    )

    $('#resetButton').click(
      () ->
        eventRouter.emit("reset")
        $(@).stop().fadeOut(100).fadeIn 100
        false
    )

    # Align bottom-left
    @stats.getDomElement().style.position = "absolute"
    @stats.getDomElement().style.right = "0px"
    @stats.getDomElement().style.top = "0px"
    document.body.appendChild @stats.getDomElement()

    $("#startingCurtainScreen").fadeOut()
    $("#formCode").css "opacity", 0
    @constructor.adjustCodeMirrorHeight()

module.exports = Ui

