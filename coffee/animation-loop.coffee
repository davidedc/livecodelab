#jslint browser: true 

# The animation loop is the loop that happens in each "frame", e.g. every 30 to 60 times
# (or, indeed, "frames") per second - which is the following:
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

frame = 0
AnimationLoop = (eventRouter, stats, liveCodeLabCoreInstance) ->
  "use strict"
  AnimationLoop = {}
  loopInterval = undefined
  
  # if you put to -1 then it means that
  # requestAnimationFrame will try to go as fast as it
  # can.
  AnimationLoop.wantedFramesPerSecond = -1
  AnimationLoop.useRequestAnimationFrame = true

  scheduleNextFrame = ->    
    # loop on request animation loop
    # - it has to be at the begining of the function
    # - see details at http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
    # requestAnimationFrame seems to only do 60 fps, which in my case is too much,
    # I rather prefer to have a slower framerate but steadier.
    if AnimationLoop.useRequestAnimationFrame
      if AnimationLoop.wantedFramesPerSecond is -1
        window.requestAnimationFrame ->
          AnimationLoop.animate()
      else
        if loopInterval is `undefined`
          loopInterval = setInterval(->
            window.requestAnimationFrame ->
              AnimationLoop.animate()
          , 1000 / AnimationLoop.wantedFramesPerSecond)
    else
      if AnimationLoop.wantedFramesPerSecond is -1
        setTimeout (->
          AnimationLoop.animate()
        ), 1000 / 60
      else
        setTimeout (->
          AnimationLoop.animate()
        ), 1000 / AnimationLoop.wantedFramesPerSecond

  
  # animation loop
  AnimationLoop.animate = ->
    drawFunction = undefined
    liveCodeLabCoreInstance.MatrixCommands.resetMatrixStack()
    
    # the sound list needs to be cleaned
    # so that the user program can create its own from scratch
    liveCodeLabCoreInstance.SoundSystem.resetLoops()
    if frame is 0
      liveCodeLabCoreInstance.TimeKeeper.resetTime()
    else
      liveCodeLabCoreInstance.TimeKeeper.updateTime()
    liveCodeLabCoreInstance.DrawFunctionRunner.resetTrackingOfDoOnceOccurrences()
    liveCodeLabCoreInstance.SoundSystem.anyCodeReactingTobpm = false
    liveCodeLabCoreInstance.SoundSystem.SetUpdatesPerMinute 60 * 4
    liveCodeLabCoreInstance.LightSystem.noLights()
    liveCodeLabCoreInstance.GraphicsCommands.reset()
    liveCodeLabCoreInstance.BlendControls.animationStyle \
      liveCodeLabCoreInstance.BlendControls.animationStyles.normal
    liveCodeLabCoreInstance.BackgroundPainter.resetGradientStack()
    
    # if the draw function is empty, then don't schedule the
    # next animation frame and set a "I'm sleeping" flag.
    # We'll re-start the animation when the editor content
    # changes. Note that this frame goes to completion anyways, because
    # we actually do want to render one "empty screen" frame.
    if liveCodeLabCoreInstance.DrawFunctionRunner.drawFunction
      scheduleNextFrame()
      
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
        liveCodeLabCoreInstance.DrawFunctionRunner.runDrawFunction()
      catch e
        
        #alert('runtime error');
        eventRouter.trigger "runtime-error-thrown", e
        return
      DrawFunctionRunner = liveCodeLabCoreInstance.DrawFunctionRunner
      DrawFunctionRunner.putTicksNextToDoOnceBlocksThatHaveBeenRun \
        liveCodeLabCoreInstance.CodeTransformer
    else
      liveCodeLabCoreInstance.dozingOff = true
    
    #console.log('dozing off');
    
    # we have to repeat this check because in the case
    # the user has set frame = 0,
    # then we have to catch that case here
    # after the program has executed
    liveCodeLabCoreInstance.TimeKeeper.resetTime()  if frame is 0
    liveCodeLabCoreInstance.BlendControls.animationStyleUpdateIfChanged()
    liveCodeLabCoreInstance.BackgroundPainter.simpleGradientUpdateIfChanged()
    liveCodeLabCoreInstance.SoundSystem.changeUpdatesPerMinuteIfNeeded()
    
    # "frame" starts at zero, so we increment after the first time the draw
    # function has been run.
    frame++
    
    # do the render
    liveCodeLabCoreInstance.Renderer.render liveCodeLabCoreInstance.GraphicsCommands
    
    # update stats
    stats.update()  if stats isnt null

  AnimationLoop