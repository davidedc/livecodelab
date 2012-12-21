describe('ImageTest', function() {

  // Matchers
  beforeEach(function () {
    this.addMatchers(imagediff.jasmine);
  });

  // Test
  it('should convert be the same image', function () {

		// The div containing this canvas is supposed to be 100% width and height,
		// so this canvas in theory should be of the right size already. But it isn't,
		// so we are setting the width and height here again.
		var testCanvas = document.createElement('canvas');

		testCanvas.width = 300;
		testCanvas.height = 300;
		    
    var eventRouter = createEventRouter();
    var colourNames = createColours();

    var liveCodeLabCoreInstance = createLiveCodeLabCore({
    		blendedThreeJsSceneCanvas: testCanvas,
    		canvasForBackground: null,
    		forceCanvasRenderer: true,
    		eventRouter: eventRouter,
    		statsWidget: null,
    		testMode: true
    	});
    //liveCodeLabCoreInstance.updateCode("scale 0.99\nball");
    liveCodeLabCoreInstance.updateCode("ball");
    liveCodeLabCoreInstance.startAnimationLoop();


    var a = new Image();
    var b = new Image();
    var Bowser = createBowser();

    if (Bowser.firefox) {
      b.src = 'images/ballCanvasFirefox.png';
    }
    else if (Bowser.safari) {
      b.src = 'images/ballCanvasSafari.png';
    }
    else if (Bowser.chrome) {
      b.src = 'images/ballCanvasChrome.png';
    }
    //b.src = 'images/ballCanvasTransparentBackground.png';


    waits(1000);

    runs(function () {
      a = liveCodeLabCoreInstance.getForeground3DSceneImage("#FFFFFF");
      // tolerance of 1 is very tight - it means that any pixel component
      // value can at most be +-1 off the original.
      // Unfortunately to make it pass on all OSX browsers one would need
      // a tolerance of around 25, which is quite high.
      expect(a).toImageDiffEqual(b,0);
    });
  });

  it('should convert be the same image', function () {

    var
      a = new Image(),
      b = new Image();
    a.src = 'images/1_normal_a.jpg';
    b.src = 'images/1_normal_b.jpg';

    waitsFor(function () {
      return a.complete & b.complete;
    }, 'image not loaded.', 2000);

    runs(function () {
      expect(a).toImageDiffEqual(b);
    });
  });
});
