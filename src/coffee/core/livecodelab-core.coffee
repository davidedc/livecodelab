###
A LiveCodeLabCore instance packs together the following parts:

- timeKeeper
- three
- threeJsSystem
- matrixCommands
- blendControls
- soundSystem
- colourFunctions
- backgroundPainter
- graphicsCommands
- lightSystem
- programRunner
- codeCompiler
- renderer
- animationLoop

LiveCodeLab is built one part at a time, and the arguments in
the constructor tell how they depend on each other at
construction time and how they interact at runtime.

- _A constructor with no arguments_ (or where the arguments are just passed
  by the caller of the very createLiveCodeLabCore function we are in),
  such as createColourFunctions, is a part
  that does not need any other part at construction time and it doesn't
  interact with any of the other parts at run time.
- _A constructor with arguments other than
  "liveCodeLabCoreInstance"_ (such as threeJsSystem)
  only needs the parts passed at construction time for its own construction,
  and it can only interact with such parts at runtime.
- _A constructor which contains the "liveCodeLabCoreInstance" argument_, such as
  codeCompiler, might or might not need other parts for its own construction
  (if they are passed in addition to the "liveCodeLabCoreInstance" argument)
  but it does interact at runtime with other parts not passed in the constructor
  argument.

So, for determining the order of the constructors, one can just look at the
dependencies dictated by the arguments other than the "liveCodeLabCoreInstance"
argument. The "liveCodeLabCoreInstance" parameter
doesn't create dependencies at creation time,
it's just used by the parts to reference other parts that they need to
interact to at runtime.

It might well be that at runtime part A interacts with part B and viceversa.
This is why runtime interactions are not restricted to parts passed
as arguments at construction
time, because one would need to pass constructed part A to the constructor of
part B and viceversa, which is obviously impossible. This is why the runtime
interactions happen through the mother of all parts,
i.e. "liveCodeLabCoreInstance" itself.

To determine which parts any single part interacts with at runtime, one
has to check all the parameters passed to the constructor. The passed parts
are likely to mean that there is an interaction at runtime. If the "mother"
"liveCodeLabCoreInstance" is passed to the constructor, then one case to
look for all "liveCodeLabCoreInstance" occurrences and see which of its
children are accessed.
###

AnimationLoop     = require './animation-loop'
BackgroundPainter = require './background-painter'
BlendControls     = require './blend-controls'
Languages         = require './languages'
ColourFunctions   = require './colour-functions'
ColourLiterals    = require './colour-literals'
GraphicsCommands  = require './graphics-commands'
OtherCommands     = require './other-commands'
LightsCommands    = require './lights-commands'
MatrixCommands    = require './matrix-commands'
Renderer          = require './renderer'
TimeKeeper        = require './time-keeper'
Pulse             = require '../../js/pulse'
Math              = require '../globals/math'
GlobalScope       = require './global-scope'
SampleBank        = require '../sound/samplebank'
SoundSystem       = require '../sound/sound-system'
PatternPlayer     = require '../sound/pattern-player'
ThreeJs           = require '../../js/three'
window.THREE = ThreeJs
ThreeJsSystem     = require './threejs-system'

class LiveCodeLabCore

  constructor: (
    @threeJsCanvas,
    @backgroundDiv,
    @eventRouter,
    @syncClient,
    @audioAPI,
    @statsWidget,
    @usingWebGL,
    @paramsObject
  ) ->

    # three is a global defined in three.min.js and used in:
    # ShaderPass, ShaderExtras, SavePass, RenderPass, MaskPass
    # The difference between three and the threeJsSystem is that
    # a) three is the raw Three.js system without some bits
    # b) threeJsSystem contains some convenience fields and abstractions,
    #    for example it keeps the renderer (whether it's canvas-based or WebGL
    #    based) in a "renderer" field.
    # Several fields/methods in threeJsSystem are just conveniency
    # mappings into the raw three object.
    # But often in LiveCodeLab there are direct reference to three
    # fields/methods. So, threeJsSystem provides some abstraction without
    # attempting to be a complete abstraction layer.
    @three = ThreeJs
    
    
    @timeKeeper = new TimeKeeper(@syncClient, @audioAPI)

    @globalscope = new GlobalScope(true)

    @colourFunctions = new ColourFunctions()
    @colourLiterals = new ColourLiterals()

    @mathFunctions = new Math()
    @otherCommands = new OtherCommands()
    
    @soundSystem = new SoundSystem(
      @timeKeeper,
      @audioAPI,
      new SampleBank(@audioAPI),
      new PatternPlayer()
    )
    
    @backgroundPainter = new BackgroundPainter(
      @backgroundDiv,
      @colourFunctions,
      @colourLiterals
    )

    @languages = new Languages(@eventRouter, @globalscope)
    languageObjects = @languages.getLanguageObjects()
    @programRunner = languageObjects.runner
    @codeCompiler = languageObjects.compiler

    @threeJsSystem = new ThreeJsSystem(
      @usingWebGL
      @threeJsCanvas,
      @paramsObject.testMode,
      @three
    )

    @blendControls = new BlendControls(@usingWebGL, @threeJsSystem)

    @renderer = new Renderer(@threeJsSystem, @usingWebGL, @blendControls)

    @matrixCommands = new MatrixCommands(
      @three,
      @timeKeeper,
      @ # for AnimationLoop
    )

    @graphicsCommands = new GraphicsCommands(
      @three,
      @threeJsSystem,
      @colourFunctions,
      @matrixCommands,
      @colourLiterals,
      @ #lightSystem, animationLoop
    )

    @lightSystem = new LightsCommands(
      @graphicsCommands,
      @three,
      @threeJsSystem,
      @colourFunctions
    )

    @animationLoop = new AnimationLoop(
      @, # programRunner and codeCompiler
      @eventRouter,
      @statsWidget,
      @timeKeeper,
      @blendControls,
      @backgroundPainter,
      @renderer,
      @matrixCommands,
      @soundSystem,
      @lightSystem,
      @graphicsCommands
    )

    @graphicsCommands.addToScope(@globalscope)
    @matrixCommands.addToScope(@globalscope)
    @lightSystem.addToScope(@globalscope)
    @colourLiterals.addToScope(@globalscope)
    @backgroundPainter.addToScope(@globalscope)
    @blendControls.addToScope(@globalscope)
    @soundSystem.addToScope(@globalscope)
    @colourFunctions.addToScope(@globalscope)
    @animationLoop.addToScope(@globalscope)
    @timeKeeper.addToScope(@globalscope)
    @programRunner.addToScope(@globalscope)
    @mathFunctions.addToScope(@globalscope)
    @otherCommands.addToScope(@globalscope)

  setLanguage: (langName) ->

    languageObjects = @languages.getLanguageObjects(langName)
    @programRunner = languageObjects.runner
    @codeCompiler = languageObjects.compiler

  paintARandomBackground: ->
    @backgroundPainter.paintARandomBackground()

  startAnimationLoop: ->
    @animationLoop.animate()

  runLastWorkingProgram: ->
    @programRunner.runLastWorkingProgram()

  playStartupSound: ->
    @soundSystem.playStartupSound()

  isAudioSupported: ->
    @soundSystem.isAudioSupported()

  updateCode: (newCode) ->

    output = @codeCompiler.compileCode newCode

    switch output.status
      when 'error'
        @eventRouter.emit("compile-time-error-thrown", output.error)
      when 'parsed'
        @eventRouter.emit("clear-error")
        @programRunner.setProgram(output.program, newCode)
      when 'empty'
        # we do a couple of special resets when
        # the code is the empty string.
        @animationLoop.sleeping = true
        @graphicsCommands.resetTheSpinThingy = true
        @eventRouter.emit("clear-error")
        @programRunner.reset()

    if output.status is 'parsed' and @animationLoop.sleeping
      @animationLoop.sleeping = false
      @animationLoop.animate()

      @eventRouter.emit("livecodelab-waking-up")


  # why do we leave the option to put a background?
  # For two reasons:
  #  a) leaving the transparent background makes it very
  #     difficult to save a reference "expected" image. The way to do
  #     that would be to save the image that appears in the failing test
  #     case. And when one does it, the correct image with the transparent
  #     background gets saved. But still, the expected image is slightly
  #     different from the generated image.
  #     This is really weird as the two should be absolutely identical,
  #     and yet (maybe because of compression artifacts reasons?) they are
  #     different enough that it makes the testing unusable.
  #  b) In theory one could get Three.js to directly render on an opaque
  #     background but if we do it this way (as in after all the rendering has
  #     happened) we keep the motionblur and the paintover styles. If we let
  #     Three.js paint the backgrounds, then the postprocessing effects for
  #     motionblur and for paintOver wouldn't work anymore.
  getForeground3DSceneImage: (backgroundColor) ->
    # some shorthands
    blendedThreeJsSceneCanvas =
      @threeJsSystem.blendedThreeJsSceneCanvas

    img = new Image
    img.src = blendedThreeJsSceneCanvas.toDataURL()

    if backgroundColor
      ctx = document.createElement("canvas")
      ctx.width = blendedThreeJsSceneCanvas.width
      ctx.height = blendedThreeJsSceneCanvas.height
      ctxContext = ctx.getContext("2d")
      ctxContext.drawImage img, 0, 0
      ctxContext.globalCompositeOperation = "destination-over"
      ctxContext.fillStyle = backgroundColor
      ctxContext.fillRect \
        0, 0,
        blendedThreeJsSceneCanvas.width,
        blendedThreeJsSceneCanvas.height
      img = new Image
      img.src = ctx.toDataURL()
    img

module.exports = LiveCodeLabCore

