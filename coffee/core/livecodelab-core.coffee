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
- drawFunctionRunner
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

define [
  'core/animation-loop'
  ,'core/background-painter'
  ,'core/blend-controls'
  ,'core/code-compiler'
  ,'core/colour-functions'
  ,'core/colour-literals'
  ,'core/graphics-commands'
  ,'core/lights-commands'
  ,'core/matrix-commands'
  ,'core/program-runner'
  ,'core/renderer'
  ,'core/threejs-system'
  ,'core/time-keeper'
<<<<<<< HEAD
=======
  ,'core/connections'
  ,'core/global-scope'
>>>>>>> Creating global scope object in lcl core
  ,'sound/samplebank'
  ,'sound/sound-system'
  ,'bowser'
  ,'buzz'
  ,'lowLag'
  ,'threejs'
  ,'three-resize'
  ,'Three.Detector'
  ,'Three.ShaderExtras'
  ,'Three.EffectComposer'
  ,'Three.MaskPass'
  ,'Three.RenderPass'
  ,'Three.SavePass'
  ,'Three.ShaderPass'
], (
  AnimationLoop
  ,BackgroundPainter
  ,BlendControls
  ,CodeCompiler
  ,ColourFunctions
  ,ColourLiterals
  ,GraphicsCommands
  ,LightsCommands
  ,MatrixCommands
  ,ProgramRunner
  ,Renderer
  ,ThreeJsSystem
  ,TimeKeeper
<<<<<<< HEAD
=======
  ,Connections
  ,GlobalScope
>>>>>>> Creating global scope object in lcl core
  ,SampleBank
  ,SoundSystem
  ,createBowser
  ,buzz
  ,lowLag
  ,THREE
  ,THREEx
  ,Detector
) ->


  class LiveCodeLabCore

    constructor: (@paramsObject) ->
      
      #//////////////////////////////////////////////
      #
      # ### Phase 1
      # initialise all the fields first
      #
      #//////////////////////////////////////////////
      
      # three is a global defined in three.min.js and used in:
      # ShaderPass, ShaderExtras, SavePass, RenderPass, MaskPass
      # The difference between three and the threeJsSystem is that
      # a) three is the raw Three.js system without for example the blend options.
      # b) threeJsSystem contains some convenience fields and abstractions,
      #    for example it keeps the renderer (whether it's canvas-based or WebGL
      #    based) in a "renderer" field.
      # Several fields/methids in threeJsSystem are just conveniency mappings into
      # the raw three object.
      # But often in LiveCodeLab there are direct reference to three
      # fields/methods. So, threeJsSystem provides some abstraction without
      # attempting to be a complete abstraction layer.
      @three = THREE
      
      #//////////////////////////////////////////////
      #
      # ### Phase 2
      # initialise all the parts that don't
      # have any dependencies for construction
      # note that the "liveCodeLabCoreInstance" doesn't
      # count because it's only used for interactions at
      # runtime. Same for the arguments that come
      # directly from the caller of this createLiveCodeLabCore
      # function we are in.
      #
      #//////////////////////////////////////////////
      
      @timeKeeper = new TimeKeeper()
      
      # this one also interacts with threeJsSystem at runtime
      @blendControls = new BlendControls(@)
      @colourFunctions = new ColourFunctions()
      @colourLiterals = new ColourLiterals()
      
      # this one also interacts with threeJsSystem and blendControls at runtime
      @renderer = new Renderer(@)
      @soundSystem =
        new SoundSystem(
          @paramsObject.eventRouter, @timeKeeper, buzz, lowLag, createBowser(), new SampleBank(buzz))
      
      # this one also interacts with colourFunctions, backgroundSceneContext,
      # canvasForBackground at runtime
      @backgroundPainter = new BackgroundPainter(
        @paramsObject.canvasForBackground,
        @,
        @colourLiterals
      )
      
      # this one also interacts with codeCompiler at runtime.
      @drawFunctionRunner =
        new ProgramRunner(@paramsObject.eventRouter, @)
      
      # compiles the user sketch to js so it's ready to run.
      @codeCompiler =
        new CodeCompiler(@paramsObject.eventRouter, @)
      
      # this one also interacts with timeKeeper, matrixCommands, blendControls,
      #    soundSystem,
      #    backgroundPainter, graphicsCommands, lightSystem, drawFunctionRunner,
      #    codeCompiler, renderer
      # ...at runtime
      @animationLoop =
        new AnimationLoop(
          @paramsObject.eventRouter, @paramsObject.statsWidget, @)
      
      #//////////////////////////////////////////////
      #
      # ### Phase 3
      # initialise all the parts that do
      # have dependencies with other parts
      # for their construction.
      # Note again that the "liveCodeLabCoreInstance" doesn't
      # count because it's only used for interactions at
      # runtime.
      # If the other dependencies forms a cycle, something
      # is wrong.
      #
      #//////////////////////////////////////////////
      
      # this one doesn't interact with any other part at runtime.
      @threeJsSystem =
        new ThreeJsSystem(
          Detector, THREEx, @paramsObject.blendedThreeJsSceneCanvas,
          @paramsObject.forceCanvasRenderer, @paramsObject.testMode,
          @three)
      
      # this one interacts with timeKeeper at runtime
      @matrixCommands =
        new MatrixCommands(
          @three, @)
      
      # this one also interacts with colourFunctions, lightSystem, matrixCommands
      # threeJsSystem at runtime
      @graphicsCommands =
        new GraphicsCommands(
          @three,
          @,
          @colourLiterals)
          # color, lightSystem, matrixCommands, threeJsSystem, colorModeA,
          # redF, greenF, blueF, alphaZeroToOne
      
      # this one also interacts with three,
      # threeJsSystem, colourFunctions at runtime
      @lightSystem =
        new LightsCommands(@graphicsCommands, @)

      #//////////////////////////////////////////////
      #
      # ### Phase 4
      # Setup the global scope object, and add all the
      # necessary global functions/values to it
      #
      #//////////////////////////////////////////////

      @globalscope = new GlobalScope()

      @graphicsCommands.addToScope(@globalscope)
      @matrixCommands.addToScope(@globalscope)
      @lightSystem.addToScope(@globalscope)
      @colourLiterals.addToScope(@globalscope)
      @backgroundPainter.addToScope(@globalscope)
      @blendControls.addToScope(@globalscope)
      @connections.addToScope(@globalscope)
      @soundSystem.addToScope(@globalscope)
      @colourFunctions.addToScope(@globalscope)
      @animationLoop.addToScope(@globalscope)
      @timeKeeper.addToScope(@globalscope)
      @drawFunctionRunner.addToScope(@globalscope)


    #//////////////////////////////////////////////
    #
    # ### Phase 5
    # Grouped together here all the
    # methods. Most of the time they just delegate
    # to another part.
    #
    #//////////////////////////////////////////////
    paintARandomBackground: ->
      @backgroundPainter.paintARandomBackground()

    startAnimationLoop: ->
      # there is nothing special about starting the animation loop,
      # it's just a call to animate(), which then creates its own request
      # for the next frame. Abstracting a bit though, it's clearer this way.
      @animationLoop.animate()

    runLastWorkingDrawFunction: ->
      @drawFunctionRunner.reinstateLastWorkingDrawFunction()

    loadAndTestAllTheSounds: ->
      @soundSystem.loadAndTestAllTheSounds()

    playStartupSound: ->
      @soundSystem.playStartupSound()

    isAudioSupported: ->
      @soundSystem.isAudioSupported()

    updateCode: (updatedCode) ->
      # alert('updatedCode: ' + updatedCode);
      @codeCompiler.updateCode updatedCode
      if updatedCode isnt "" and @dozingOff
        @dozingOff = false
        @animationLoop.animate()
        
        # console.log('waking up');
        @paramsObject.eventRouter.emit("livecodelab-waking-up")


    # why do we leave the option to put a background?
    # For two reasons:
    #  a) leaving the transparent background makes it very
    #     difficult to save a reference "expected" image. The way to do that would
    #     be to save the image that appears in the failing test case. And when one
    #     does it, the correct image with the transparent background gets saved.
    #     But still, the expected image is slightly different from the generated
    #     image. This is really weird as the two should be absolutely identical,
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
          0, 0, blendedThreeJsSceneCanvas.width, blendedThreeJsSceneCanvas.height
        img = new Image
        img.src = ctx.toDataURL()
      img

  LiveCodeLabCore

