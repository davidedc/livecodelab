#jslint browser: true 

# The animation loop is the loop that make each "frame" happen, i.e. whatever happend
# every 30 to 60 times (or, indeed, "frames") per second - which is the following:
# * the next frame is scheduled
# * the current program (i.e. a draw() Function is run).
#   Note that this might not be the very latest
#   content of the editor, because that might be syntactically incorrect. Also it might
#   not be the last syntactically correct program, because that might have thrown
#   runtime errors (for example used an undefined variable or function). The current
#   draw() function is rather both syntactically correct and "stable". Stability of a
#   program cannot be guaranteed, but LiveCodeLab heuristically considers as "stable" a
#   program that was able to run without throwing errors for the past 5 frames.
# * the background is repainted if it has changed from the previous frame
# * the new 3d scene is painted
# * the stats widget on the top right is updated to show milliseconds taken by each loop
#   frame.
#
# Note that the followings are NOT done as part of the animation loop
# * Syntax checking of the program typed by the user (that's checked only when it changed)
# * sound playing. That happens by its own series of timeouts (as defined by the
#   optional "bpm" command) separately from the
#   animation loop.
# * blinking of the cursor

# global variale, keeps the count of how many frames
# since beginning of session (or since the
# program was last cleared). This variable is incremented and reset in the animation
# loop "animate" function.
frame = 0

class AnimationLoop
  "use strict"

  loopInterval: null
  wantedFramesPerSecond: null
  liveCodeLabCoreInstance: undefined
  AS_HIGH_FPS_AS_POSSIBLE: -1

  constructor: (@eventRouter, @stats, @liveCodeLabCoreInstance, @forceUseOfTimeoutForScheduling = false) ->
    # Some basic initialisations and constant definitions
    @wantedFramesPerSecond = @AS_HIGH_FPS_AS_POSSIBLE

  # There are two different ways to schedule the next frame:
  # 1) using a native window.requestAnimationFrame implementation (supported by some
  #    browsers)
  # 2) using timeouts
  #
  # Notes and constraints:
  # * window.requestAnimationFrame cannot be used if user wants a specific fps (i.e. you
  #   can't pick a specific framerate)
  # * for browser that don't have a window.requestAnimationFrame, a shim at the end
  #   of the page replaces that with an implementation based on timeouts
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
        if loopInterval is `undefined`
          loopInterval = setInterval(=>
            window.requestAnimationFrame ->
              @animate()
          , 1000 / @wantedFramesPerSecond)

  
  # animation loop
  animate: ->
    @liveCodeLabCoreInstance.matrixCommands.resetMatrixStack()
    
    # the sound list needs to be cleaned
    # so that the user program can create its own from scratch
    @liveCodeLabCoreInstance.soundSystem.resetLoops()
    if frame is 0
      @liveCodeLabCoreInstance.timeKeeper.resetTime()
    else
      @liveCodeLabCoreInstance.timeKeeper.updateTime()
    @liveCodeLabCoreInstance.drawFunctionRunner.resetTrackingOfDoOnceOccurrences()
    @liveCodeLabCoreInstance.soundSystem.anyCodeReactingTobpm = false
    @liveCodeLabCoreInstance.soundSystem.SetUpdatesPerMinute 60 * 4
    @liveCodeLabCoreInstance.lightSystem.noLights()
    @liveCodeLabCoreInstance.graphicsCommands.reset()
    @liveCodeLabCoreInstance.blendControls.animationStyle \
      @liveCodeLabCoreInstance.blendControls.animationStyles.normal
    @liveCodeLabCoreInstance.backgroundPainter.resetGradientStack()
    
    # if the draw function is empty, then don't schedule the
    # next animation frame and set a "I'm sleeping" flag.
    # We'll re-start the animation when the editor content
    # changes. Note that this frame goes to completion anyways, because
    # we actually do want to render one "empty screen" frame.
    if @liveCodeLabCoreInstance.drawFunctionRunner.drawFunction
      @scheduleNextFrame()
      
      # Now here there is another try/catch check when the draw function is ran.
      # The reason is that there might be references to uninitialised or inexistent
      # variables. For example:
      #   box
      #   background yeLow
      #   ball
      # draws only a box, because the execution silently fails at the yeLow reference.
      # So in that case we need to a) highlight the error and b) run the previously
      # known good program.
      try
        @liveCodeLabCoreInstance.drawFunctionRunner.runDrawFunction()
      catch e
        
        #alert('runtime error');
        @eventRouter.trigger "runtime-error-thrown", e
        return
      drawFunctionRunner = @liveCodeLabCoreInstance.drawFunctionRunner
      drawFunctionRunner.putTicksNextToDoOnceBlocksThatHaveBeenRun \
        @liveCodeLabCoreInstance.codeTransformer
    else
      @liveCodeLabCoreInstance.dozingOff = true
      # the program is empty and so it's the screen. Effectively, the user
      # is starting from scratch, so the frame variable should be reset to zero.
      frame = 0
    
    #console.log('dozing off');
    
    # we have to repeat this check because in the case
    # the user has set frame = 0,
    # then we have to catch that case here
    # after the program has executed
    @liveCodeLabCoreInstance.timeKeeper.resetTime()  if frame is 0
    @liveCodeLabCoreInstance.blendControls.animationStyleUpdateIfChanged()
    @liveCodeLabCoreInstance.backgroundPainter.simpleGradientUpdateIfChanged()
    @liveCodeLabCoreInstance.soundSystem.changeUpdatesPerMinuteIfNeeded()
    
    # "frame" starts at zero, so we increment after the first time the draw
    # function has been run.
    frame++
    
    # do the render
    @liveCodeLabCoreInstance.renderer.render @liveCodeLabCoreInstance.graphicsCommands
    
    # update stats
    if @stats then @stats.update()

# Shim for browser that don't have requestAnimationFrame, see
# http://paulirish.com/2011/requestanimationframe-for-smart-animating/
lastTime = 0
vendors = ["ms", "moz", "webkit", "o"]
x = 0
while x < vendors.length and not window.requestAnimationFrame
  window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"]
  window.cancelAnimationFrame = window[vendors[x] + "CancelAnimationFrame"] or
     window[vendors[x] + "CancelRequestAnimationFrame"]
  ++x
unless window.requestAnimationFrame
  window.requestAnimationFrame = (callback, element) ->
    currTime = new Date().getTime()
    timeToCall = Math.max(0, 16 - (currTime - lastTime))
    id = window.setTimeout(->
      callback currTime + timeToCall
    , timeToCall)
    lastTime = currTime + timeToCall
    id
unless window.cancelAnimationFrame
  window.cancelAnimationFrame = (id) ->
    clearTimeout id