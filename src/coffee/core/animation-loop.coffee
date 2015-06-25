###
## The animation loop takes care of drawing each "frame",
## ideally 30 to 60 times (or, indeed, "frames")
## per second. The following happens in each frame:
## * the next frame is scheduled
## * the current program (i.e. a draw() Function) is run
## * the draw() function changes the state of the system
##   e.g. changes the background, creates new scene graph
## * the background is repainted if it has changed from the previous frame
## * the new 3d scene is rendered via Three.js
## * the beat of the sound system is changed if needed
## * the "frame" counter is incremented
## * the stats widget in the top right corner is updated
##   (it show either fps or milliseconds taken by each loop frame).
##
## Note that the followings are NOT done as part of the animation loop:
## * Syntax checking of the program typed by the user
##   (that's checked only when user changes via typing)
## * sound playing. That happens by its own series of timeouts
##   (as defined by the optional "bpm" command), separately from the
##   animation loop.
## * blinking of the cursor
##
## About the current Function being run:
## note that this might not be the Function corresponding to the very latest
## content of the editor, for two reasons:
## 1. the newest content of the editor might be syntactically incorrect
##    and hence can't be turned into a Function than can be run
## 2. even if syntactically correct, it might not be "stable"
##    i.e. it might have thrown a runtime error
##    (for example used an undefined variable or function),
##    in which case an older "stable" program is used.
##
## Rather, the current draw() function is the latest program
## that is both syntactically correct and "stable" (or in the process of
## being proven stable).
## Stability of a program cannot be guaranteed, but LiveCodeLab heuristically
## considers as "stable" a program once it's able to run for 5 frames
## without throwing runtime errors.
## If the program throws an error past this testing window, then LiveCodeLab
## currently has no further fallback, so the Function will be just run each
## frame and hope is that it has time to draw enough animation on the screen
## before it throws the error so that some kind of animation
## will still be playing.
## One could devise a mechanism by which a stack of stable functions
## is maintained, so each failing function of the stack would cause the
## previous one to become the current stable alternative.
## This would practically guarantee that there is a Function
## somewhere in the past that is simple enough that it would
## cause no runtime errors - unless a previous function has so
## dramatically borked the state of the entire system,
## but that would probably take some malice.
###

class AnimationLoop

  loopInterval: null
  wantedFramesPerSecond: null
  AS_HIGH_FPS_AS_POSSIBLE: -1

  sleeping: true

  constructor: (
    @lclCore,
    @eventRouter,
    @stats,
    @timeKeeper,
    @blendControls,
    @backgroundPainter,
    @renderer,
    @matrixCommands,
    @soundSystem,
    @lightSystem,
    @graphicsCommands,
    @forceUseOfTimeoutForScheduling = false
  ) ->
    # Some basic initialisations and constant definitions
    @wantedFramesPerSecond = @AS_HIGH_FPS_AS_POSSIBLE

    # global variale, keeps the count of how many frames since beginning
    # of session (or since the program was last cleared).
    # This variable is incremented and reset in the animation
    # loop "animate" function.
    @setFrame(0)

  addToScope: (scope) ->
    @scope = scope
    @scope.add('frame', @frame)

  setFrame: (value) ->
    @frame = value
    if @scope
      @scope.add('frame', value)

  # There are two different ways to schedule the next frame:
  # 1. using a native window.requestAnimationFrame implementation
  #    (supported by some browsers)
  # 2. using timeouts
  #
  # Notes and constraints:
  # * window.requestAnimationFrame cannot be used if user wants a
  #   specific fps (i.e. you can't pick a specific framerate)
  # * for browser that don't have a window.requestAnimationFrame, a shim
  #   at the end of the page replaces that with an implementation
  #   based on timeouts
  # * the user can decide to force the use of timeouts (for testing purposes)
  scheduleNextFrame: ->
    if @forceUseOfTimeoutForScheduling
      if @wantedFramesPerSecond is @AS_HIGH_FPS_AS_POSSIBLE
        setTimeout (=>
          @animate()
        ), 1000 / 60
      else
        setTimeout (=>
          @animate()
        ), 1000 / @wantedFramesPerSecond
    else
      if @wantedFramesPerSecond is @AS_HIGH_FPS_AS_POSSIBLE
        window.requestAnimationFrame =>
          @animate()
      else
        if loopInterval?
          loopInterval = setInterval(
            () => window.requestAnimationFrame(() => @animate()),
            1000 / @wantedFramesPerSecond
          )


  # animation loop
  animate: ->

    if @frame is 0
      @timeKeeper.resetTime()
    else
      @timeKeeper.updateTime()

    @cleanStateBeforeRunningDrawAndRendering()

    # if the draw function is empty, then don't schedule the
    # next animation frame and set a "I'm sleeping" flag.
    # We'll re-start the animation when the editor content
    # changes. Note that this frame goes to completion anyways, because
    # we actually do want to render one "empty screen" frame.
    if not @sleeping
      @scheduleNextFrame()

      # Now here is another try/catch check.
      # The reason is that there might be references to uninitialised
      # or inexistent variables. For example:
      #   box
      #   background yeLow
      #   ball
      # draws only a box, because the execution silently fails at
      # the 'yeLow' reference.
      # So in that case we need to
      # 1. highlight the error
      # 2. run the previously known good program.
      try
        @lclCore.programRunner.runProgram()
      catch e

        # note that this causes the running of the last stable function
        # so you could have executed half of the original draw function,
        # then got an error, now you are re-running an old draw function.
        @eventRouter.emit("runtime-error-thrown", e)
        return
      @lclCore.programRunner.putTicksNextToDoOnceBlocksThatHaveBeenRun(
        @lclCore.codeCompiler
      )
    else
      # the program is empty and so is the screen. Effectively, the user
      # is starting from scratch, so the frame should be reset to zero.
      @setFrame(0)
      @blendControls.animationStyle(@blendControls.animationStyles.normal)
      @blendControls.animationStyleUpdateIfChanged()
      @renderer.render(@graphicsCommands)


    # we have to repeat this check because in the case
    # the user has set frame = 0,
    # then we have to catch that case here
    # after the program has executed
    @timeKeeper.resetTime()  if @frame is 0
    @blendControls.animationStyleUpdateIfChanged()
    @backgroundPainter.simpleGradientUpdateIfChanged()

    # "frame" starts at zero, so we increment after the first time the draw
    # function has been run.
    @setFrame(@frame + 1)

    geometryOnScreenMightHaveChanged = (
      @graphicsCommands.atLeastOneObjectWasDrawn ||
      @graphicsCommands.atLeastOneObjectIsDrawn
    )

    # if livecodelab is dozing off, in that case you do
    # want to do a render because it will clear the screen.
    # otherwise the last frame of the sketch is going
    # to remain painted in the background behind
    # the big cursor.
    if !@sleeping and geometryOnScreenMightHaveChanged
      @renderer.render @graphicsCommands
      @graphicsCommands.atLeastOneObjectWasDrawn = @graphicsCommands.atLeastOneObjectIsDrawn

    custom_compare = (a,b) ->
      # I'm assuming all values are numbers
      if a.fontSize < b.fontSize
        return -1
      else if a.fontSize > b.fontSize
        return 1
      return 0
    @graphicsCommands.labelsData.sort(custom_compare)
    #debugger
    @graphicsCommands.disposableLabelsHolder = document.createElement('div')
    for eachLabel in @graphicsCommands.labelsData
      labelDiv = document.createElement('div')
      labelDiv.style.position = 'fixed'
      labelDiv.style.width = 100
      labelDiv.style.height = 100
      labelDiv.innerHTML = "" + eachLabel.text
      labelDiv.style.top = eachLabel.y + 'px'
      labelDiv.style.left = eachLabel.x + 'px'
      labelDiv.style.fontSize =  eachLabel.fontSize + '%'
      labelDiv.style.color = "rgb("+eachLabel.r+","+eachLabel.g+","+eachLabel.b+")"
      @graphicsCommands.disposableLabelsHolder.appendChild labelDiv

    holdingDiv = document.getElementById("labels")
    @graphicsCommands.disposableLabelsHolder
    holdingDiv.appendChild @graphicsCommands.disposableLabelsHolder

    # update stats
    if @stats then @stats.update()

  cleanStateBeforeRunningDrawAndRendering: ->
    @renderer.resetExclusionPrincipleWobbleDataIfNeeded @graphicsCommands

    @matrixCommands.resetMatrixStack()

    # the sound list needs to be cleaned
    # so that the user program can create its own from scratch
    @lclCore.soundSystem.clearPatterns()

    @lclCore.programRunner.resetTrackingOfDoOnceOccurrences()

    @lightSystem.noLights()
    @graphicsCommands.reset()
    @blendControls.animationStyle @blendControls.animationStyles.normal
    @backgroundPainter.resetGradientStack()

    # if the user used labels in previous frame, they are in this div
    # and they must be cleared.
    if @graphicsCommands.disposableLabelsHolder?
      parentDiv = @graphicsCommands.disposableLabelsHolder.parentNode
      if parentDiv?
        parentDiv.removeChild(@graphicsCommands.disposableLabelsHolder)

      @graphicsCommands.numberOfLabels = 0
      @graphicsCommands.labelsData = []

    # In case we want to make each frame an actual
    # pure function then we need to seed "random" and "noise"
    # each frame...
    # [todo] All the math functions ideally should be taken out of the
    # global scope same as in the colour-functions.coffee file
    # but they are global now so here we go.
    # noiseSeed @frame
    # randomSeed @frame

module.exports = AnimationLoop

