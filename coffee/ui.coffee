###
## Ui handles all things UI such as the menus, the notification popups,
## the editor panel, the big flashing cursor, the stats widget...
###

class Ui

  constructor: (@eventRouter, @stats, @programLoader) ->
    # Setup Event Listeners
    @eventRouter.bind(
      "report-runtime-or-compile-time-error",
      (e) => @checkErrorAndReport(e),
      @
    )
    @eventRouter.bind "clear-error", (=>@clearError()), @
    @eventRouter.bind "autocoder-button-pressed", (state) =>
      if state is true
        $("#autocodeIndicatorContainer").html("Autocode: on").css(
          "background-color", "#FF0000"
        )
      else
        $("#autocodeIndicatorContainer").html("Autocode").css(
          "background-color", ""
        )

    @eventRouter.bind "autocoderbutton-flash", =>
      $("#autocodeIndicatorContainer").fadeOut(100).fadeIn 100

    @eventRouter.bind "auto-hide-code-button-pressed", (state) =>
      if state is true
        $("#dimCodeButtonContainer").html "Hide Code: on"
      else
        $("#dimCodeButtonContainer").html "Hide Code: off"

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
    canvas.css("-ms-transform-origin", "left top")
          .css("-webkit-transform-origin", "left top")
          .css("-moz-transform-origin", "left top")
          .css("-o-transform-origin", "left top")
          .css("transform-origin", "left top")
          .css("-ms-transform", "scale(" + scale + ")")
          .css("-webkit-transform", "scale3d(" + scale + ", 1)")
          .css("-moz-transform", "scale(" + scale + ")")
          .css("-o-transform", "scale(" + scale + ")")
          .css "transform", "scale(" + scale + ")"

  
  # TODO In theory we want to re-draw the background because the
  # aspect ration might have changed.
  # But for the time being we only have vertical
  # gradients so that's not going to be a problem.
  adjustCodeMirrorHeight: ->
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
  fullscreenify: (canvasId) ->
    window.addEventListener "resize", (=>
      @adjustCodeMirrorHeight()
      @resizeCanvas canvasId
    ), false
    @resizeCanvas canvasId

  checkErrorAndReport: (e) ->
    $("#errorMessageDiv").css "color", "red"
    
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
    $("#errorMessageDiv").text errorMessage

  clearError: ->
    $("#errorMessageDiv").css "color", "#000000"
    $("#errorMessageDiv").text ""

  soundSystemOk: ->
    $("#soundSystemStatus").text("Sound System On").removeClass("off")

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
      
      $('<span >LiveCodeLab</span>').appendTo(
        $('<li>').appendTo(
          $('#nav')
        )
      ).click =>
        $("#aboutWindow").modal()
        $("#simplemodal-container").height 250
        false

      # DEMOS
      # (note that the code for the tutorials is the same,
      # just with "tutorial" instead of "demo")
      # insert all the demos in the menu
      $('<span >Demos</span>').appendTo(
        $('<li>')
          .attr('id', 'demos')
          .addClass('current')
          .addClass('sf-parent')
          .appendTo($('#nav'))
      )

      $("<ul id='ulForDemos'></ul>").appendTo(
        $('#demos')
      )

      allDemos = @programLoader.programs.demos

      # Create an object with a property for each submenu.
      # That property contains an array with all the demos that belong to
      # that submenu.
      demoSubmenus = {}
      for demo of allDemos
        submenuOfThisDemo = allDemos[demo].submenu
        demoSubmenus[submenuOfThisDemo] ?= [] # create array if it didn't exist
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
          title = @programLoader.programs.demos[demo].title
          a = "<li><a id='#{demo}'>#{title}</a></li>"
          $(a).appendTo(
            $('#'+demoSubmenuNoSpaces)
          )

      # TUTORIALS
      # (note that the code for the demos is the same,
      # just with "demo" instead of "tutorial")
      # insert all the tutorials in the menu
      $('<span >Tutorials</span>').appendTo(
        $('<li>')
          .attr('id', 'tutorials')
          .addClass('current')
          .addClass('sf-parent')
          .appendTo($('#nav'))
      )

      $("<ul id='ulForTutorials'></ul>").appendTo(
        $('#tutorials')
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
          title = @programLoader.programs.demos[demo].title
          a= "<li><a id='#{tutorial}'>#{title}</a></li>"
          $(a).appendTo(
            $('#'+tutorialSubmenuNoSpaces)
          )

      
      # Now that all the menu items are in place in the DOM, invoke sooperfish,
      # which does some more transformations of its own.
      $('ul.sf-menu').sooperfish()

      $("#demos ul li a").click ->
        eventRouter.trigger "load-program", $(@).attr("id")
        false

      $("#tutorials li a").click ->
        eventRouter.trigger "load-program", $(@).attr("id")
        false

      $('<span >Autocode</span>').appendTo(
        $('<li>').appendTo(
          $('#nav')
        )
      ).attr('id', 'autocodeIndicatorContainer')
      $("#autocodeIndicatorContainer").click =>
        eventRouter.trigger "toggle-autocoder"
        false

      $('<span >Hide Code: on</span>').appendTo(
        $('<li>').appendTo(
          $('#nav')
        )
      ).attr('id', 'dimCodeButtonContainer')
      $("#dimCodeButtonContainer").click =>
        eventRouter.trigger "editor-toggle-dim"
        false

      $('<span >Reset</span>').appendTo(
        $('<li>').appendTo(
          $('#nav')
        )
      ).click =>
        eventRouter.trigger "reset"
        $(@).stop().fadeOut(100).fadeIn 100
        false

      $('<span id="errorMessageDiv">msg will go here</span>').appendTo(
        $('<li>').appendTo(
          $('#nav')
        )
      )

      
      # Align bottom-left
      @stats.getDomElement().style.position = "absolute"
      @stats.getDomElement().style.right = "0px"
      @stats.getDomElement().style.top = "0px"
      document.body.appendChild @stats.getDomElement()
      $("#startingCourtainScreen").fadeOut()
      $("#formCode").css "opacity", 0
      @fullscreenify "#backGroundCanvas"
      @adjustCodeMirrorHeight()
