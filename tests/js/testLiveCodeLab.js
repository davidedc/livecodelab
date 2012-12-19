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
    		forceCanvasRenderer: false,
    		eventRouter: eventRouter,
    		statsWidget: null,
    		testMode: true
    	});
    liveCodeLabCoreInstance.updateCode("ball");
    liveCodeLabCoreInstance.startAnimationLoop();


    var a = new Image();
    var b = new Image();
    b.src = 'images/1_normal_a.jpg';


    waits(1000);

    runs(function () {
      a = liveCodeLabCoreInstance.getForeground3DSceneImage();
      expect(a).toImageDiffEqual(b);
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
