
//
//

var initThreeJs = function() {

  scaledBackgroundWidth = Math.floor(window.innerWidth / backGroundFraction);
  scaledBackgroundHeight = Math.floor(window.innerHeight / backGroundFraction);

  if (!forceCanvasRenderer && Detector.webgl && !forceCanvasRenderer) {

    ballDefaultDetLevel = 16;
    sceneRenderingCanvas = document.createElement('canvas');

    renderer = new THREE.WebGLRenderer({
      canvas: sceneRenderingCanvas,
      preserveDrawingBuffer: false,
      // to allow screenshot
      antialias: false,
      premultipliedAlpha: false
    });

    //renderer.autoClearColor = false;
    //renderer.autoClear = false;
    isWebGLUsed = true;

    // this is really a bad hack, but chrome goes twice
    // as fast with this, while safari doesn't work,
    // and firefox is the fastest no matter what
    if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
      //renderer.autoClear = false;
    }

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(sceneRenderingCanvas);
    //document.getElementById('finalRenderWithSceneAndBlendCanvas').appendChild(finalRenderWithSceneAndBlend);

  } else {


    // we always draw the 3d scene off-screen
    ballDefaultDetLevel = 6;
    sceneRenderingCanvas = document.createElement('canvas');
    sceneRenderingCanvasContext = sceneRenderingCanvas.getContext('2d');
    renderer = new THREE.CanvasRenderer({
      canvas: sceneRenderingCanvas,
      antialias: true,
      // to get smoother output
      preserveDrawingBuffer: false // to allow screenshot
    });

    //renderer.autoClear = true;
    //renderer.setClearColorHex( 0x000000, 1 );

    previousRenderForBlending = document.createElement('canvas');
    previousRenderForBlending.width = window.innerWidth;
    previousRenderForBlending.height = window.innerHeight;
    previousRenderForBlendingContext = previousRenderForBlending.getContext('2d');

    finalRenderWithSceneAndBlend = document.getElementById('finalRenderWithSceneAndBlendCanvas');
    //finalRenderWithSceneAndBlend.width = scaledBackgroundWidth;
    //finalRenderWithSceneAndBlend.height = scaledBackgroundHeight;
    finalRenderWithSceneAndBlend.width = window.innerWidth;
    finalRenderWithSceneAndBlend.height = window.innerWidth;
    finalRenderWithSceneAndBlendContext = finalRenderWithSceneAndBlend.getContext('2d');

    renderer.setSize(window.innerWidth, window.innerHeight);
    //document.getElementById('container').appendChild(sceneRenderingCanvas);
  }


  backgroundScene = document.getElementById('backGroundCanvas');
  backgroundScene.width = scaledBackgroundWidth;
  backgroundScene.height = scaledBackgroundHeight;
  backgroundSceneContext = backgroundScene.getContext('2d');



  // add Stats.js - https://github.com/mrdoob/stats.js
  stats = new Stats();
  // Align bottom-left
  stats.getDomElement().style.position = 'absolute';
  stats.getDomElement().style.right = '0px';
  stats.getDomElement().style.top = '0px';
  document.body.appendChild(stats.getDomElement());

  scene = new THREE.Scene();
  scene.matrixAutoUpdate = false;


  // put a camera in the scene
  camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.set(0, 0, 5);
  scene.add(camera);

  // temporarily, add a light
  // add subtle ambient lighting
  //var ambientLight = new THREE.AmbientLight(0xFF0000);
  //scene.add(ambientLight);
  // create a point light
  var pointLight = new THREE.PointLight(0xFFFFFF);

  // set its position
  pointLight.position.x = 10;
  pointLight.position.y = 50;
  pointLight.position.z = 130;

  // add to the scene
  scene.add(pointLight);

  // transparently support window resize
  THREEx.WindowResize.bind(renderer, camera);

  if (isWebGLUsed) {
    buildPostprocessingChain();
  }

}

var effectBlend;

var buildPostprocessingChain = function() {
  var renderTargetParameters = {
    format: THREE.RGBAFormat,
    stencilBuffer: true
  };

  var renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters);
  var effectSaveTarget = new THREE.SavePass(new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters));
  effectSaveTarget.clear = false;

  var fxaaPass = new THREE.ShaderPass(THREE.ShaderExtras["fxaa"]);
  fxaaPass.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);

  effectBlend = new THREE.ShaderPass(THREE.ShaderExtras["blend"], "tDiffuse1");
  var screenPass = new THREE.ShaderPass(THREE.ShaderExtras["screen"]);

  // motion blur
  effectBlend.uniforms['tDiffuse2'].texture = effectSaveTarget.renderTarget;
  effectBlend.uniforms['mixRatio'].value = 0;

  var renderModel = new THREE.RenderPass(scene, camera);

  composer = new THREE.EffectComposer(renderer, renderTarget);

  composer.addPass(renderModel);
  //composer.addPass( fxaaPass );
  composer.addPass(effectBlend);
  composer.addPass(effectSaveTarget);
  composer.addPass(screenPass);
  screenPass.renderToScreen = true;
}
