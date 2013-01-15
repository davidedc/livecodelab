#jslint browser: true, maxerr: 100 

#global LiveCodeLabCore, $, autocoder, initThreeJs, buzz 

# Init.js takes care of the setup of the whole environment up to
# cruise speed
$(document).ready ->
  
  # The div containing this canvas is supposed to be 100% width and height,
  # so this canvas in theory should be of the right size already. But it isn't,
  # so we are setting the width and height here again.
  document.getElementById("blendedThreeJsSceneCanvas").width = window.innerWidth
  document.getElementById("blendedThreeJsSceneCanvas").height = window.innerHeight
  startEnvironment
    blendedThreeJsSceneCanvas: document.getElementById("blendedThreeJsSceneCanvas")
    canvasForBackground: document.getElementById("backGroundCanvas")
    forceCanvasRenderer: false
    bubbleUpErrorsForDebugging: false
    
    # testMode enables the webgl flag "preserverDrawingBuffer",
    # see https://github.com/mrdoob/three.js/pull/421
    testMode: false



# see http://stackoverflow.com/questions/2745432
isCanvasSupported = ->
  elem = document.createElement("canvas")
  
  # One would think that doing the !! double negation below is
  # redundant but no, that's how Javascript rolls.
  !!(elem.getContext and elem.getContext("2d"))

startEnvironment = (paramsObject) ->
  "use strict"
  
  #/////////////////////////////////////////////////////
  # Phase 1 - Preliminary checks and initialisations
  # before LiveCodeCore.
  #/////////////////////////////////////////////////////
  unless isCanvasSupported
    $("#noCanvasMessage").modal onClose: ->
      $("#loading").text "sorry :-("
      $.modal.close()

    $("#simplemodal-container").height 200
    return
  
  # EventRouter manages all the events/callbacks across the whole
  # of livecodelab.
  # For "heavy fire" callbacks one might want to use a classic callback system,
  # because there might be some overhead in the triggering of events using this.
  # (to be tested. just throwing it out there.)
  eventRouter = new EventRouter()
  
  # Stats are updated in the animationLoop
  # add Stats.js - https://github.com/mrdoob/stats.js
  stats = new Stats
  paramsObject.forceCanvasRenderer = false  if paramsObject.forceCanvasRenderer is `undefined`
  paramsObject.forceCanvasRenderer = false  if paramsObject.forceCanvasRenderer is null
  
  # createColours creates a bunch of global variables for all css colors (and more).
  # Since background-painting.js initialises the background by means of
  # CSS colors, this needs to be run before creating LiveCodeLabCore. This is also
  # used by the autocoder because it needs to be able to swap color names that it
  # finds as CSS color strings in the user program.
  colourNames = (new Colours()).colourNames
  
  #//////////////////////////////////////////////////////
  # Phase 2 - Initialise the core of livecodelab.
  # LiveCodeLabCore consists of the following main parts:
  #//////////////////////////////////////////////////////
  #  - timeKeeper
  #  - three
  #  - threeJsSystem
  #  - matrixCommands
  #  - blendControls
  #  - soundSystem
  #  - colourFunctions
  #  - backgroundPainter
  #  - graphicsCommands
  #  - lightSystem 
  #  - drawFunctionRunner
  #  - codeTransformer
  #  - renderer
  #  - animationLoop
  liveCodeLabCore = new LiveCodeLabCore(
    blendedThreeJsSceneCanvas: paramsObject.blendedThreeJsSceneCanvas
    canvasForBackground: paramsObject.canvasForBackground
    forceCanvasRenderer: paramsObject.forceCanvasRenderer
    eventRouter: eventRouter
    statsWidget: stats
    testMode: paramsObject.testMode
  )
  
  #/////////////////////////////////////////////////////
  # Phase 3 - Other satellite parts
  #/////////////////////////////////////////////////////
  urlRouter = new UrlRouter(eventRouter)
  #eventRouter.bind("set-url-hash", (=> urlRouter.setHash()), @)
  
  bigCursor = new BigCursor eventRouter # $
  # Setup Event Listeners
  eventRouter.bind("big-cursor-show", => bigCursor.unshrinkBigCursor() )
  eventRouter.bind("big-cursor-hide", => bigCursor.shrinkBigCursor()   )

  editor = createEditor(eventRouter, CodeMirror)
  attachMouseWheelHandler editor
  
  #console.log('creating stats');
  ui = new Ui(eventRouter, stats) # $
  # requires: ColourNames
  autocoder = new Autocoder(eventRouter, editor, colourNames) # McLexer
  # Setup Event Listeners
  eventRouter.bind("reset", => autocoder.toggle(false))  
  eventRouter.bind("toggle-autocoder", => autocoder.toggle())
  
  # EditorDimmer functions should probablly be rolled into the editor itself
  # note that the editorDimmer variable below is never used. Leaving it
  # in for consistency.
  editorDimmer = new EditorDimmer(eventRouter, bigCursor) # $
  # Setup Event Listeners
  eventRouter.bind "editor-dim", (=> editorDimmer.dimEditor()), editorDimmer
  eventRouter.bind "editor-undim", (=> editorDimmer.undimEditor()), editorDimmer
  eventRouter.bind "editor-toggle-dim", (=> editorDimmer.toggleDimCode()), editorDimmer
  
  # requires threeJsSystem, blendControls, graphicsCommands, renderer
  # note that the programLoader variable below is never used. Leaving it
  # in for consistency.
  programLoader = new ProgramLoader(eventRouter, editor, liveCodeLabCore) # $, Detector, blendControls
  eventRouter.bind "load-program", programLoader.loadDemoOrTutorial, programLoader

  
  #/////////////////////////////////////////////////////
  # Phase 4 - Setup Of Event Listeners, including handling of
  # compile time and runtime errors.
  #/////////////////////////////////////////////////////
  eventRouter.bind "reset", liveCodeLabCore.paintARandomBackground
  eventRouter.trigger "editor-toggle-dim", true
  eventRouter.bind "livecodelab-running-stably", ui.showStatsWidget
  eventRouter.bind "code_changed", (updatedCodeAsString) ->
    if updatedCodeAsString isnt ""
      eventRouter.trigger "big-cursor-hide"
    else
      # clearing history, otherwise the user can undo her way into a previous example
      # but the hash in the URL would be misaligned.
      setTimeout((()=>editor.clearHistory()),30)
      eventRouter.trigger "set-url-hash", ""
      eventRouter.trigger "big-cursor-show"
      ui.hideStatsWidget()
    liveCodeLabCore.updateCode updatedCodeAsString

  
  # runtime and compile-time error management //////////
  #/////////////////////////////////////////////////////
  # Two different types of errors are managed in
  # two slightly different ways.
  #
  # Compile-time errors are the errors such as an extra
  # comma being added, or an unbalanced parenthesis, or
  # in general any of the syntactic problems.
  # These errors are just reported and the
  # new borked program does *not* result in a new
  # draw Function, so the previous syntactically correct
  # program is kept as the draw Function. The editor
  # content is kept the same as the user is probably just
  # finishing to type something.
  # If the autocoder is active, the editor
  # undoes the change, which triggers in a recompilation.
  # So this undo/recompilation cycle results in eventually
  # a syntactically correct program being set as
  # the draw Function.
  #
  # Runtime errors are things such as calling a function
  # with invalid parameters, accessing a non-existing
  # field of an object, accessing a null or an undefined,
  # accessing a variable that is not defined anywhere.
  # Runtime errors cannot be caught at compile time (not in
  # general anyways) because they are syntactically correct
  # and doing analysis on runtime behaviour at compile time
  # is extremely difficult if not outright impossible.
  # For example one might want to try to figure out whether
  # all the called functions and all the referenced variables
  # actually exist. In practice though one might create
  # those variables at runtime depending on complex tests
  # on state of the system, so one cannot really figure out
  # at compile time whether all functions and variables will
  # actually be in place when the program runs. One could
  # carry out some clever checks in particular cases, but *in
  # general* it's an impossible thing to do.
  # So an "unstable" program might often pass the compile checks
  # and be turned into a new draw Function.
  # When the next frame runs (or at some point in one of the
  # next frames), the draw Function is run and
  # a runtime error is thrown. At this point what we just
  # want to do is to keep the editor contents the same (because
  # user might be just finishing to type something) and we
  # just swap the current draw Function with a previous draw
  # Function that seemed to be stable, so that the animation
  # in the background doesn't stop. Note again that there is no
  # guarantee that just because a function was stable in the
  # past that it might still be stable now. For example the old
  # stable function might do silly things in the new state
  # that has been changed/borked in the meantime.
  # Or just simply a stable Function might
  # eventually do some silly things on its own, for example
  # it might do an out-of bounds array reference as the frame
  # count is incremented. Since at the moment we keep
  # track of only one stable function at the time (rather than
  # a stack of the) in general one cannot guarantee
  # that the animation will keep going no matter what. It probably
  # will in most normal cases though.
  # When the autocoder is active, a runtime error *does not* swap
  # the current function for an old stable one. Doing so
  # causes some bad interactions with the undoing of the
  # editor. Rather, the editor "undoes" its content,
  # which causes old content to be recompiled, and this
  # undo/recompile cycle carries on until a
  # syntactically-correct version of the program can be
  # established as the draw Function. If this new version still
  # throws a runtime error, the editor "undoes" again, until a
  # program that is both syntactically correct and stable
  # is found.
  eventRouter.bind "runtime-error-thrown", (e) ->
    eventRouter.trigger "report-runtime-or-compile-time-error", e
    if autocoder.active
      
      #alert('editor: ' + editor);
      editor.undo()
    
    #alert('undoing');
    else
      liveCodeLabCore.runLastWorkingDrawFunction()
    
    # re-throw the error so that the top-level debuggers
    # (firebug, built-in, whathaveyous) can properly
    # catch the error and let the user inspect things.
    throw (e)  if paramsObject.bubbleUpErrorsForDebugging

  eventRouter.bind "compile-time-error-thrown", (e) ->
    eventRouter.trigger "report-runtime-or-compile-time-error", e
    editor.undo()  if autocoder.active

  eventRouter.bind "clear-error", ui.clearError, ui
  
  # create this binding before the sounds are loaded
  eventRouter.bind "all-sounds-loaded-and tested", ui.soundSystemOk
  
  #/////////////////////////////////////////////////////
  # Phase 5- Kick-off the system and start of the
  # animation loop. Events will start
  # being triggered from here on.
  #/////////////////////////////////////////////////////
  liveCodeLabCore.loadAndTestAllTheSounds()
  liveCodeLabCore.paintARandomBackground()
  liveCodeLabCore.startAnimationLoop()
  if not Detector.webgl or paramsObject.forceCanvasRenderer
    $("#noWebGLMessage").modal onClose: eval_("$.modal.close()", "liveCodeLabCore.isAudioSupported")
    $("#simplemodal-container").height 200
  editor.focus()
  
  # check if the url points to a particular demo,
  # in which case we load the demo directly.
  # otherwise we do as usual.    
  if !urlRouter.urlPointsToDemoOrTutorial()
    setTimeout (()=>liveCodeLabCore.playStartupSound()), 650
  bigCursor.toggleBlink true
  ui.setup()

#
#    var printoutImageData = function(){
#    	console.log(liveCodeLabCore.getForeground3DSceneImageData());
#    }
#    
#    if (paramsObject.testMode) {
#      setTimeout(printoutImageData,3000);
#    }
#    