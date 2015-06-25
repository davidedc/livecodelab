###
## Init.js takes care of the setup of the whole environment up to
## cruise speed
###

Stats           = require '../js/threejs/Stats'
EventEmitter    = require './core/event-emitter'
LiveCodeLabCore = require './core/livecodelab-core'
ProgramLoader   = require './core/program-loader'
Pulse           = require '../js/pulse'
WebAudioAPI     = require './sound/webAudioApi'
BuzzAudioAPI    = require './sound/buzzAudioApi'
UrlRouter       = require './ui/url-router'
BigCursor       = require './ui/big-cursor'
EditorDimmer    = require './ui/text-dimming'
Ui              = require './ui/ui'
Editor          = require './editor/editor'
Autocoder       = require './autocoder/autocoder'
$               = require '../js/jquery'
window.$ = $
window.jQuery = $
Detector        = require '../js/threejs/Detector'

MouseWheelHandler = require '../js/mousewheel'
require './globals/numbertimes'
require './globals/requestAnimFrame'

# see http://stackoverflow.com/questions/2745432
canvasIsSupportedAndNotIE9 = ->

  # first check if we are IE 9
  div = document.createElement("div")
  div.innerHTML = "<!--[if IE 9 ]><i></i><![endif]-->"
  isIE9 = (div.getElementsByTagName("i").length == 1)
  if (isIE9)
    return false


  # now check is the canvas element is available
  elem = document.createElement("canvas")
  # One would think that doing the !! double negation below is
  # redundant but no, that's how Javascript rolls.
  !!(elem.getContext and elem.getContext("2d"))


startEnvironment = (threeJsCanvas, backgroundDiv, paramsObject) ->

  #/////////////////////////////////////////////////////
  # Phase 1 - Preliminary checks and initialisations
  # before LiveCodeCore.
  #/////////////////////////////////////////////////////

  # We need to check that the browser supports canvas
  # AND that we are not in IE9.
  # IE9 supports canvas, but Three.js doesn't work on it
  # because it uses typedArrays. There would be a shim
  # but I tried it and it's way too slow. References:
  #    https://github.com/mrdoob/three.js/issues/4452
  #    http://caniuse.com/typedarrays
  unless canvasIsSupportedAndNotIE9()
    $("#noCanvasMessage").modal onClose: ->
      $("#loading").text "sorry :-("
      $.modal.close()

    $("#simplemodal-container").height 200
    return

  usingWebGL = (Detector.webgl and not paramsObject.forceCanvasRenderer)

  # EventRouter manages all the events/callbacks across the whole
  # of livecodelab.
  # For "heavy fire" callbacks one might want to use a classic
  # callback system, because there might be some overhead in the
  # triggering of events using this. (to be tested. just throwing
  # it out there.)
  eventRouter = new EventEmitter()

  # Stats are updated in the animationLoop
  # add Stats.js - https://github.com/mrdoob/stats.js
  stats = new Stats

  # Client used to sync to a time pulse over websocket
  syncClient = new Pulse()

  # If the WebAudioApi AudioContext class is available then we
  # can use that API. Otherwise we fall back to Buzz
  if (AudioContext)
    audioAPI = new WebAudioAPI()
  else
    audioAPI = new BuzzAudioAPI()

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
  #  - codeCompiler
  #  - renderer
  #  - animationLoop
  liveCodeLabCore = new LiveCodeLabCore(
    threeJsCanvas,
    backgroundDiv,
    eventRouter,
    syncClient,
    audioAPI,
    stats,
    usingWebGL,
    {
      testMode: paramsObject.testMode
    }
  )

  #/////////////////////////////////////////////////////
  # Phase 3 - Other satellite parts
  #/////////////////////////////////////////////////////
  urlRouter = new UrlRouter(eventRouter, window.location)

  bigCursor = new BigCursor eventRouter # $

  eventRouter.addListener(
    'big-cursor-show',
    () -> bigCursor.unshrinkBigCursor()
  )
  eventRouter.addListener(
    'big-cursor-hide',
    () -> bigCursor.shrinkBigCursor()
  )
  eventRouter.addListener(
    'set-language',
    (langNameId) ->
      langName = langNameId.split('-')[1]
      liveCodeLabCore.setLanguage(langName)
  )

  codeTextArea = document.getElementById('code')
  editor = new Editor(eventRouter, codeTextArea)
  MouseWheelHandler.attach editor

  # requires threeJsSystem, blendControls, graphicsCommands, renderer
  # note that the programLoader variable below is never used. Leaving it
  # in for consistency.
  programLoader = new ProgramLoader(
    eventRouter,
    editor,
    liveCodeLabCore,
    usingWebGL
  )
  eventRouter.addListener(
    "load-program",
    (demoName) -> programLoader.loadDemoOrTutorial(demoName)
  )

  ui = new Ui(eventRouter, stats, programLoader) # $

  # requires: ColourNames
  autocoder = new Autocoder(
    eventRouter,
    editor,
    liveCodeLabCore.colourLiterals.colourNames
  )
  # Setup Event Listeners
  eventRouter.addListener("reset", -> autocoder.toggle(false))
  eventRouter.addListener("toggle-autocoder", -> autocoder.toggle())

  # EditorDimmer functions should probablly be rolled into the editor itself
  # note that the editorDimmer variable below is never used. Leaving it
  # in for consistency.
  editorDimmer = new EditorDimmer(eventRouter, bigCursor) # $
  # Setup Event Listeners
  eventRouter.addListener(
    "editor-dim",
    () -> editorDimmer.dimEditor()
  )
  eventRouter.addListener(
    "editor-undim",
    () -> editorDimmer.undimEditor()
  )
  eventRouter.addListener(
    "editor-toggle-dim",
    (autoDim) -> editorDimmer.toggleDimCode(autoDim)
  )


  #/////////////////////////////////////////////////////
  # Phase 4 - Setup Of Event Listeners, including handling of
  # compile time and runtime errors.
  #/////////////////////////////////////////////////////
  eventRouter.addListener(
    'reset',
    () -> liveCodeLabCore.paintARandomBackground()
  )
  eventRouter.emit('editor-toggle-dim', false)
  eventRouter.addListener(
    'livecodelab-running-stably',
    () -> ui.showStatsWidget()
  )
  eventRouter.addListener(
    'code-changed',
    (updatedCodeAsString) ->
      if updatedCodeAsString isnt ""
        eventRouter.emit('big-cursor-hide')
      else
        # clearing history, otherwise the user can undo her way
        # into a previous example but the hash in the URL would be misaligned.
        setTimeout(
          () -> editor.clearHistory(),
          30
        )
        eventRouter.emit("set-url-hash", "")
        eventRouter.emit("big-cursor-show")
        ui.hideStatsWidget()
      liveCodeLabCore.updateCode updatedCodeAsString
  )


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
  # track of only one stable function at a time (rather than
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
  eventRouter.addListener("runtime-error-thrown", (e) ->
    eventRouter.emit("report-runtime-or-compile-time-error", e)
    if autocoder.active
      editor.undo()
    else
      liveCodeLabCore.runLastWorkingProgram()

    # re-throw the error so that the top-level debuggers
    # (firebug, built-in, whathaveyous) can properly
    # catch the error and let the user inspect things.
    throw (e)  if paramsObject.bubbleUpErrorsForDebugging
  )

  eventRouter.addListener("compile-time-error-thrown", (e) ->
    eventRouter.emit("report-runtime-or-compile-time-error", e)
    editor.undo()  if autocoder.active
  )

  eventRouter.addListener('clear-error', () -> ui.clearError())

  # create this binding before the sounds are loaded
  eventRouter.addListener(
    'all-sounds-loaded-and tested',
    () -> ui.soundSystemOk()
  )

  #/////////////////////////////////////////////////////
  # Phase 5- Kick-off the system and start of the
  # animation loop. Events will start
  # being triggered from here on.
  #/////////////////////////////////////////////////////
  liveCodeLabCore.paintARandomBackground()
  liveCodeLabCore.startAnimationLoop()
  if not Detector.webgl or paramsObject.forceCanvasRenderer
    $("#noWebGLMessage").modal onClose: $.modal.close
    $("#simplemodal-container").height 200
  editor.focus()

  # check if the url points to a particular demo,
  # in which case we load the demo directly.
  # otherwise we do as usual.
  if !urlRouter.urlPointsToDemoOrTutorial()
    setTimeout(
      () -> liveCodeLabCore.playStartupSound(),
      650
    )
    bigCursor.toggleBlink true
  ui.setup()
  setTimeout(
    () -> programLoader.kickOff(),
    650
  )

if setupForNormalLCLPage?
  $(document).ready ->

    threeJsCanvas = document.getElementById('threeJsCanvas')
    Ui.sizeForegroundCanvas(
      threeJsCanvas,
      {
        x: Ui.foregroundCanvasMaxScaleUpFactor,
        y: Ui.foregroundCanvasMaxScaleUpFactor
      }
    )

    backgroundDiv = document.getElementById('backgroundDiv')
    Ui.fullscreenify(
      backgroundDiv,
      {
        x: Ui.backgroundCanvasFractionOfWindowSize,
        y: Ui.backgroundCanvasFractionOfWindowSize
      }
    )


    setTimeout(
      () ->
        startEnvironment(
          threeJsCanvas,
          backgroundDiv,
          {
            forceCanvasRenderer: false
            bubbleUpErrorsForDebugging: false

            # testMode enables the webgl flag "preserverDrawingBuffer",
            # see https://github.com/mrdoob/three.js/pull/421
            testMode: false
          }
        )
      , 100
    )

if setupForTestPage?
  $(document).ready ->
    console.log 'describing ImageTest'

    execJasmine = ->
      jasmineEnv.execute()
    prettyPrint()
    jasmineEnv = jasmine.getEnv()
    jasmineEnv.updateInterval = 1000
    reporter = new jasmine.HtmlReporter()
    jasmineEnv.addReporter reporter
    jasmineEnv.specFilter = (spec) ->
      reporter.specFilter spec

    execJasmine()
