require ['core/event-emitter','core/colour-literals','core/livecodelab-core'], (EventEmitter, ColourLiterals, LiveCodeLabCore) ->
  describe "ImageTest", ->
    beforeEach ->
      @addMatchers imagediff.jasmine

    it "A simple ball", ->
      a = new Image()
      b = new Image()
      Bowser = createBowser()
      if Bowser.firefox
        b.src = "test-page-files/images/ballCanvasFirefox.png"
      else if Bowser.safari
        b.src = "test-page-files/images/ballCanvasSafari.png"
      else
        if Bowser.chrome
          b.src = "test-page-files/images/ballCanvasChrome.png"
      console.log b.src
      testCanvas = document.createElement("canvas")
      testCanvas.width = 300
      testCanvas.height = 300
      eventRouter = new EventEmitter()
      colourNames = new ColourLiterals()
      statsWidget = null
      liveCodeLabCoreInstance = new LiveCodeLabCore(
        eventRouter,
        statsWidget,
        {
          blendedThreeJsSceneCanvas: testCanvas
          canvasForBackground: null
          forceCanvasRenderer: true
          testMode: true
        }
      )

      waits 10
      runs ->
        liveCodeLabCoreInstance.updateCode "ball"
        liveCodeLabCoreInstance.startAnimationLoop()

      waits 1500
      runs ->
        a = liveCodeLabCoreInstance.getForeground3DSceneImage("#FFFFFF")

      waits 200
      runs ->
        expect(a).toImageDiffEqual b, 0

    it "A simple box", ->
      a = new Image()
      b = new Image()
      Bowser = createBowser()
      if Bowser.firefox
        b.src = "test-page-files/images/ballCanvasFirefox.png"
      else if Bowser.safari
        b.src = "test-page-files/images/ballCanvasSafari.png"
      else
        if Bowser.chrome
          b.src = "test-page-files/images/ballCanvasChrome.png"
      console.log b.src
      testCanvas = document.createElement("canvas")
      testCanvas.width = 300
      testCanvas.height = 300
      eventRouter = new EventEmitter()
      colourNames = new ColourLiterals()
      statsWidget = null
      liveCodeLabCoreInstance = new LiveCodeLabCore(
        eventRouter, statsWidget, {
          blendedThreeJsSceneCanvas: testCanvas
          canvasForBackground: null
          forceCanvasRenderer: true
          testMode: true
        }
      )

      waits 10
      runs ->
        liveCodeLabCoreInstance.updateCode "box ball rect line peg"
        liveCodeLabCoreInstance.startAnimationLoop()

      waits 1500
      runs ->
        a = liveCodeLabCoreInstance.getForeground3DSceneImage("#FFFFFF")

      waits 200
      runs ->
        expect(a).toImageDiffEqual b, 0
