###
## Ui handles all things UI such as the menus, the notification popups,
## the editor panel, the big flashing cursor, the stats widget...
###

window.$ = $
require '../lib/jquery.sooperfish'
require '../lib/jquery.easing-sooper'
require '../lib/jquery.simplemodal'

_ = require 'underscore'

programs = require '../programs/programs'

createProgramMenu = (parentEl, programs) =>
  _.chain(
     programs
   ).reduce(
     (
       (submenu, program, programKey) =>
         submenu[program.submenu] = submenu[program.submenu] || {}
         submenu[program.submenu][programKey] = program
         return submenu
     ),
     {}
   ).map(
     (programs, name) =>

       menuDropdown = document.createElement('li')

       menuName = document.createElement('span')
       menuName.textContent = name
       menuDropdown.appendChild(menuName)

       menuList = document.createElement('ul')
       menuDropdown.appendChild(menuList)

       _.each(
         programs,
         (program, programName) =>
           programEntry = document.createElement('li')
           programLink = document.createElement('a')
           programLink.setAttribute('id', programName)
           programLink.textContent = program.title
           programEntry.appendChild(programLink)
           menuList.appendChild(programEntry)
       )
       return menuDropdown
   ).each(
     (submenu) => parentEl.appendChild(submenu)
   )



class Ui

  constructor: (eventRouter, stats) ->
    # Setup Event Listeners
    eventRouter.addListener(
      "report-runtime-or-compile-time-error",
      (e) => @checkErrorAndReport(e)
    )
    eventRouter.addListener("clear-error", => @clearError() )
    eventRouter.addListener("autocoder-button-pressed", (state) ->
      if state is true
        $("#autocodeIndicator span").html("Autocode: on").css(
          "background-color", "#FF0000"
        )
      else
        $("#autocodeIndicator span").html("Autocode").css(
          "background-color", ""
        )
    )

    eventRouter.addListener("autocoderbutton-flash", ->
      $("#autocodeIndicator").fadeOut(100).fadeIn 100
    )

    eventRouter.addListener("auto-hide-code-button-pressed",
      (autoDimmingIsOn) ->
        if autoDimmingIsOn
          $("#dimCodeButton span").html("Hide Code: on")
        else
          $("#dimCodeButton span").html("Hide Code: off")
    )

    demosEl = document.getElementById('ulForDemos')
    createProgramMenu(demosEl, programs.demos)

    tutorialsEl = document.getElementById('ulForTutorials')
    createProgramMenu(tutorialsEl, programs.tutorials)


    # Now that all the menu items are in place in the DOM,
    # invoke sooperfish,
    # which does some more transformations of its own.
    $('ul.sf-menu').sooperfish()

    $('#logo span').click(
      () ->
        $("#aboutWindow").modal()
        false
    )

    $("#demos ul li a").click ->
      eventRouter.emit("load-program", $(@).attr("id"))
      false

    $("#tutorials li a").click ->
      eventRouter.emit("load-program", $(@).attr("id"))
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

    $("#startingCurtainScreen").fadeOut()


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

module.exports = Ui

