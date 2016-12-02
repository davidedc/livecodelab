###
## ProgramLoader takes care of managing the URL and editor content
## when the user navigates through demos and examples - either by
## selecting menu entries, or by clicking back/forward arrow, or by
## landing on a URL with a hashtag.
###

programs = require './programs'

class ProgramLoader

  constructor: (
    @eventRouter,
    @texteditor,
    @liveCodeLabCoreInstance,
  ) ->
    @lastHash = ""

  kickOff: ->
    setInterval(
      () => @pollHash(),
      100
    )
    # Setup Event Listeners
    @eventRouter.addListener("url-hash-changed", (hash) =>
      @loadAppropriateDemoOrTutorialBasedOnHash hash
    )

  loadDemoOrTutorial: (demoName) ->
    # set the demo as a hash state
    # so that ideally people can link directly to
    # a specific demo they like.
    @eventRouter.emit("set-url-hash", "bookmark=" + demoName)
    @eventRouter.emit("big-cursor-hide")
    @eventRouter.emit("editor-undim")
    @liveCodeLabCoreInstance.graphicsCommands.doTheSpinThingy = false

    # Note, setting the value of the texteditor (texteditor.setValue below)
    # triggers the codeMirror onChange callback, which registers the new
    # code - so the next draw() will run the new demo code. But before doing
    # that will happen (when the timer for the next frame triggers), we'll
    # have cleared the screen with the code below.
    if programs.demos[demoName] || programs.tutorials[demoName]
      if programs.demos[demoName]
        @texteditor.setValue programs.demos[demoName].code
      else if programs.tutorials[demoName]
        # the "replace" here is to change the arrows in tabs
        @texteditor.setValue programs.tutorials[demoName].code
      # clear history. Why? Because we want to avoid the follwing:
      # user opens an example. User opens another example.
      # User performs undo. Result: previous example is open, but the hashtag
      # doesn't match the example. It's just confusing - we assume here that
      # the user selects another tutorial and example then is not expecting
      # the undo history to bring her back to previous demos/examples.
      # Note that, again, this is quite common in CodeMirror, the clearHistory
      # invocation below only works if slightly postponed. Not sure why.
      setTimeout((() => @texteditor.clearHistory()), 30)

    # bring the cursor to the top
    @texteditor.setCursor 0, 0

    # we want to avoid that the selected example
    # or tutorial when started paints over a screen with a previous drawing
    # of the previous code.
    # So basically we draw an empty frame.
    #   a) make sure that animationStyle is "normal"
    #   b) apply the potentially new animationStyle
    #   render the empty frame
    blendControls = @liveCodeLabCoreInstance.blendControls
    blendControls.animationStyle blendControls.animationStyles.normal
    blendControls.animationStyleUpdateIfChanged()
    @liveCodeLabCoreInstance.threeJsSystem.render(
      @liveCodeLabCoreInstance.graphicsCommands
    )

  loadAppropriateDemoOrTutorialBasedOnHash: (hash) ->
    matched = hash.match(/bookmark=(.*)/)

    if matched
      @loadDemoOrTutorial matched[1]
    else
      # user in on the root page without any hashes
      @texteditor.setValue ""
      # reset undo history
      setTimeout((()=>@texteditor.clearHistory()), 30)

  # this paragraph from http://stackoverflow.com/a/629817
  # there are more elegant ways to track back/forward history
  # but they are more complex than this. I don't mind having a bit of
  # polling for this, not too big of a problem.
  pollHash: ->
    if @lastHash isnt location.hash
      @lastHash = location.hash

      # hash has changed, so do stuff:
      @loadAppropriateDemoOrTutorialBasedOnHash @lastHash

module.exports = ProgramLoader

