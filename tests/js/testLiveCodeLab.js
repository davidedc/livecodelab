describe("ImageTest", function() {
  beforeEach(function() {
    return this.addMatchers(imagediff.jasmine);
  });
  return it("A simple ball should look right", function() {
    var Bowser, a, b, colourNames, eventRouter, liveCodeLabCoreInstance, testCanvas;

    a = new Image();
    b = new Image();
    Bowser = createBowser();
    if (Bowser.firefox) {
      b.src = "images/ballCanvasFirefox.png";
    } else if (Bowser.safari) {
      b.src = "images/ballCanvasSafari.png";
    } else {
      if (Bowser.chrome) {
        b.src = "images/ballCanvasChrome.png";
      }
    }
    testCanvas = document.createElement("canvas");
    testCanvas.width = 300;
    testCanvas.height = 300;
    eventRouter = new EventRouter();
    colourNames = new ColourLiterals();
    liveCodeLabCoreInstance = new LiveCodeLabCore({
      blendedThreeJsSceneCanvas: testCanvas,
      canvasForBackground: null,
      forceCanvasRenderer: true,
      eventRouter: eventRouter,
      statsWidget: null,
      testMode: true
    });
    waits(200);
    runs(function() {
      liveCodeLabCoreInstance.updateCode("ball");
      return liveCodeLabCoreInstance.startAnimationLoop();
    });
    waits(1500);
    runs(function() {
      return a = liveCodeLabCoreInstance.getForeground3DSceneImage("#FFFFFF");
    });
    waits(200);
    return runs(function() {
      return expect(a).toImageDiffEqual(b, 0);
    });
  });
});
