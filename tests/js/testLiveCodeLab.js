describe('ImageTest', function() {

  // Matchers
  beforeEach(function () {
    this.addMatchers(imagediff.jasmine);
  });

  // Test
  it('A simple ball should look right', function () {

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

    waits(200);

		runs(function () {
			//liveCodeLabCoreInstance.updateCode("scale 0.99\nball");
			liveCodeLabCoreInstance.updateCode("ball");
			liveCodeLabCoreInstance.startAnimationLoop();
		});    
		//alert('1');

    // there is an initial animation,
    // in this test we wait here for it to finish.
    waits(1500);

    runs(function () {
		  //alert('2');
      a = liveCodeLabCoreInstance.getForeground3DSceneImage("#FFFFFF");
      //alert('got the image from livecodelab: ' + a);

    });

    waits(200);

    runs(function () {
		  //alert('2b');
      expect(a).toImageDiffEqual(b,0);
    });

  });

});
