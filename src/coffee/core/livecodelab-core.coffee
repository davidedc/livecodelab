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
LiveLang          = require '../livelang'
ColourFunctions   = require './colour-functions'
ColourLiterals    = require './colour-literals'
ListFunctions     = require './list-functions'
GraphicsCommands  = require './graphics-commands'
OtherCommands     = require './other-commands'
LightsCommands    = require './lights-commands'
MatrixCommands    = require './matrix-commands'
TimeKeeper        = require './time-keeper'
Pulse             = require '../../js/pulse'
Math              = require '../globals/math'
GlobalScope       = require './global-scope'
SampleBank        = require '../sound/samplebank'
SoundSystem       = require '../sound/sound-system'
PatternPlayer     = require '../sound/pattern-player'
ThreeJsSystem     = require './threejs-system'

class LiveCodeLabCore

  constructor: (
    canvas,
    @backgroundDiv,
    @eventRouter,
    @syncClient,
    @audioAPI
  ) ->

    # three is a global defined in three.min.js and used in:
    # ShaderPass, ShaderExtras, SavePass, RenderPass, MaskPass
    # The difference between three and the threeJsSystem is that
    # a) three is the raw Three.js system without some bits
    # b) threeJsSystem contains some convenience fields and abstractions,
    #    for example it keeps the scene in a "scene" field.
    # Several fields/methods in threeJsSystem are just conveniency
    # mappings into the raw three object.
    # But often in LiveCodeLab there are direct reference to three
    # fields/methods. So, threeJsSystem provides some abstraction without
    # attempting to be a complete abstraction layer.
    
    @timeKeeper = new TimeKeeper(@syncClient, @audioAPI)

    @globalscope = new GlobalScope(true)

    @colourFunctions = new ColourFunctions()
    @colourLiterals = new ColourLiterals()
    @listFunctions = new ListFunctions()

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

    @codeCompiler = new LiveLang.compiler(@eventRouter)
    @programRunner = new LiveLang.runner(@eventRouter, @codeCompiler, @globalscope)

    @threeJsSystem = new ThreeJsSystem(canvas)

    @blendControls = new BlendControls(@threeJsSystem)

    @matrixCommands = new MatrixCommands(
      @timeKeeper
    )

    @graphicsCommands = new GraphicsCommands(
      @threeJsSystem,
      @colourFunctions,
      @matrixCommands,
      @colourLiterals,
      @timeKeeper,
      @ #lightSystem
    )

    @lightSystem = new LightsCommands(
      @graphicsCommands,
      @threeJsSystem,
      @colourFunctions
    )

    @animationLoop = new AnimationLoop(
      @programRunner,
      @codeCompiler
      @eventRouter,
      @timeKeeper,
      @blendControls,
      @backgroundPainter,
      @threeJsSystem,
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
    @listFunctions.addToScope(@globalscope)
    @animationLoop.addToScope(@globalscope)
    @timeKeeper.addToScope(@globalscope)
    @programRunner.addToScope(@globalscope)
    @mathFunctions.addToScope(@globalscope)
    @otherCommands.addToScope(@globalscope)

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

    output = @codeCompiler.compileCode newCode, @globalscope

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
        @timeKeeper.resetTime()
        @graphicsCommands.resetTheSpinThingy = true
        @eventRouter.emit("clear-error")
        @programRunner.reset()
        @eventRouter.emit("livecodelab-sleeping")

    if output.status is 'parsed' and @animationLoop.sleeping
      @animationLoop.sleeping = false
      @animationLoop.animate()

      @eventRouter.emit("livecodelab-waking-up")

module.exports = LiveCodeLabCore

