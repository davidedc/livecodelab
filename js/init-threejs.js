/*jslint browser: true, devel: true */

var createThreeJs = function (Detector, THREE, THREEx) {

    'use strict';

    var ThreeJs = {},
        backgroundScene,
        backGroundFraction = 15,
        pointLight;

    ThreeJs.isWebGLUsed = false;

    ThreeJs.composer = {};

    ThreeJs.sceneRenderingCanvas = {};

    ThreeJs.forceCanvasRenderer = false;

    ThreeJs.scaledBackgroundWidth = Math.floor(window.innerWidth / backGroundFraction);
    ThreeJs.scaledBackgroundHeight = Math.floor(window.innerHeight / backGroundFraction);

    if (!ThreeJs.forceCanvasRenderer && Detector.webgl) {

        ThreeJs.ballDefaultDetLevel = 16;
        ThreeJs.sceneRenderingCanvas = document.createElement('canvas');

        ThreeJs.renderer = new THREE.WebGLRenderer({
            canvas: ThreeJs.sceneRenderingCanvas,
            preserveDrawingBuffer: false, // to allow screenshot
            antialias: false,
            premultipliedAlpha: false
        });

        ThreeJs.isWebGLUsed = true;

        ThreeJs.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('container').appendChild(ThreeJs.sceneRenderingCanvas);

    } else {


        // we always draw the 3d scene off-screen
        ThreeJs.ballDefaultDetLevel = 6;
        ThreeJs.sceneRenderingCanvas = document.createElement('canvas');
        ThreeJs.sceneRenderingCanvasContext = ThreeJs.sceneRenderingCanvas.getContext('2d');
        ThreeJs.renderer = new THREE.CanvasRenderer({
            canvas: ThreeJs.sceneRenderingCanvas,
            antialias: true, // to get smoother output
            preserveDrawingBuffer: false // to allow screenshot
        });


        ThreeJs.previousRenderForBlending = document.createElement('canvas');
        ThreeJs.previousRenderForBlending.width = window.innerWidth;
        ThreeJs.previousRenderForBlending.height = window.innerHeight;
        ThreeJs.previousRenderForBlendingContext = ThreeJs.previousRenderForBlending.getContext('2d');

        ThreeJs.finalRenderWithSceneAndBlend = document.getElementById('finalRenderWithSceneAndBlendCanvas');
        ThreeJs.finalRenderWithSceneAndBlend.width = window.innerWidth;
        ThreeJs.finalRenderWithSceneAndBlend.height = window.innerWidth;
        ThreeJs.finalRenderWithSceneAndBlendContext = ThreeJs.finalRenderWithSceneAndBlend.getContext('2d');

        ThreeJs.renderer.setSize(window.innerWidth, window.innerHeight);
    }


    backgroundScene = document.getElementById('backGroundCanvas');
    backgroundScene.width = ThreeJs.scaledBackgroundWidth;
    backgroundScene.height = ThreeJs.scaledBackgroundHeight;
    ThreeJs.backgroundSceneContext = backgroundScene.getContext('2d');


    ThreeJs.scene = new THREE.Scene();
    ThreeJs.scene.matrixAutoUpdate = false;


    // put a camera in the scene
    ThreeJs.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 10000);
    ThreeJs.camera.position.set(0, 0, 5);
    ThreeJs.scene.add(ThreeJs.camera);

    // temporarily, add a light
    // add subtle ambient lighting
    //var ambientLight = new THREE.AmbientLight(0xFF0000);
    //scene.add(ambientLight);
    // create a point light
    pointLight = new THREE.PointLight(0xFFFFFF);

    // set its position
    pointLight.position.x = 10;
    pointLight.position.y = 50;
    pointLight.position.z = 130;

    // add to the scene
    ThreeJs.scene.add(pointLight);

    // transparently support window resize
    THREEx.WindowResize.bind(ThreeJs.renderer, ThreeJs.camera);

    ThreeJs.buildPostprocessingChain = function () {
        var renderTargetParameters,
            renderTarget,
            effectSaveTarget,
            fxaaPass,
            screenPass,
            renderModel;

        renderTargetParameters = {
            format: THREE.RGBAFormat,
            stencilBuffer: true
        };

        renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters);
        effectSaveTarget = new THREE.SavePass(new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters));
        effectSaveTarget.clear = false;

        // Uncomment the three lines containing "fxaaPass" below to try a fast
        // antialiasing filter. Commented below because of two reasons: a) it's slow
        // b) it blends in some black pixels, so it only looks good in dark backgrounds
        // The problem of blending with black pixels is the same problem of the
        // motionBlur leaving a black trail - tracked in github with
        // https://github.com/davidedc/livecodelab/issues/22
        
        //fxaaPass = new THREE.ShaderPass(THREE.ShaderExtras.fxaa);
        //fxaaPass.uniforms.resolution.value.set(1 / window.innerWidth, 1 / window.innerHeight);

        ThreeJs.effectBlend = new THREE.ShaderPass(THREE.ShaderExtras.blend, "tDiffuse1");
        screenPass = new THREE.ShaderPass(THREE.ShaderExtras.screen);

        // motion blur
        ThreeJs.effectBlend.uniforms.tDiffuse2.texture = effectSaveTarget.renderTarget;
        ThreeJs.effectBlend.uniforms.mixRatio.value = 0;

        renderModel = new THREE.RenderPass(ThreeJs.scene, ThreeJs.camera);

        ThreeJs.composer = new THREE.EffectComposer(ThreeJs.renderer, renderTarget);

        ThreeJs.composer.addPass(renderModel);
        //ThreeJs.composer.addPass(fxaaPass);
        ThreeJs.composer.addPass(ThreeJs.effectBlend);
        ThreeJs.composer.addPass(effectSaveTarget);
        ThreeJs.composer.addPass(screenPass);
        screenPass.renderToScreen = true;
    };

    if (ThreeJs.isWebGLUsed) {
        ThreeJs.buildPostprocessingChain();
    }




    return ThreeJs;

};
