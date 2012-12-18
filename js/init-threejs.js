/*jslint browser: true, devel: true */

var createThreeJsSystem = function (Detector, THREEx, blendedThreeJsSceneCanvas, forceCanvasRenderer, testMode, liveCodeLabCore_THREE) {

    'use strict';

    var ThreeJsSystem = {},
        pointLight;

    ThreeJsSystem.isWebGLUsed = false;

    ThreeJsSystem.composer = {};

    ThreeJsSystem.blendedThreeJsSceneCanvas;

    ThreeJsSystem.forceCanvasRenderer = forceCanvasRenderer;


    if (!ThreeJsSystem.forceCanvasRenderer && Detector.webgl) {

        ThreeJsSystem.ballDefaultDetLevel = 16;
        
        if (!blendedThreeJsSceneCanvas) {
          blendedThreeJsSceneCanvas = document.createElement('canvas');
        }
        ThreeJsSystem.blendedThreeJsSceneCanvas = blendedThreeJsSceneCanvas;

        ThreeJsSystem.renderer = new liveCodeLabCore_THREE.WebGLRenderer({
            canvas: ThreeJsSystem.blendedThreeJsSceneCanvas,
            preserveDrawingBuffer: testMode, // to allow screenshot
            antialias: false,
            premultipliedAlpha: false
        });

        ThreeJsSystem.isWebGLUsed = true;

        ThreeJsSystem.renderer.setSize(window.innerWidth, window.innerHeight);

    } else {

        // we always draw the 3d scene off-screen
        ThreeJsSystem.ballDefaultDetLevel = 6;
        if (!ThreeJsSystem.currentFrameThreeJsSceneCanvas) {
          ThreeJsSystem.currentFrameThreeJsSceneCanvas = document.createElement('canvas');
        }
        ThreeJsSystem.currentFrameThreeJsSceneCanvasContext = ThreeJsSystem.currentFrameThreeJsSceneCanvas.getContext('2d');
        ThreeJsSystem.renderer = new liveCodeLabCore_THREE.CanvasRenderer({
            canvas: ThreeJsSystem.currentFrameThreeJsSceneCanvas,
            antialias: true, // to get smoother output
            preserveDrawingBuffer: testMode // to allow screenshot
        });


        ThreeJsSystem.previousFrameThreeJSSceneRenderForBlendingCanvas = document.createElement('canvas');
        ThreeJsSystem.previousFrameThreeJSSceneRenderForBlendingCanvas.width = window.innerWidth;
        ThreeJsSystem.previousFrameThreeJSSceneRenderForBlendingCanvas.height = window.innerHeight;
        ThreeJsSystem.previousFrameThreeJSSceneRenderForBlendingCanvasContext = ThreeJsSystem.previousFrameThreeJSSceneRenderForBlendingCanvas.getContext('2d');


        ThreeJsSystem.blendedThreeJsSceneCanvas = document.getElementById('blendedThreeJsSceneCanvas');
        ThreeJsSystem.blendedThreeJsSceneCanvas.width = window.innerWidth;
        ThreeJsSystem.blendedThreeJsSceneCanvas.height = window.innerWidth;
        ThreeJsSystem.blendedThreeJsSceneCanvasContext = ThreeJsSystem.blendedThreeJsSceneCanvas.getContext('2d');

        ThreeJsSystem.renderer.setSize(window.innerWidth, window.innerHeight);
    }



    ThreeJsSystem.scene = new liveCodeLabCore_THREE.Scene();
    ThreeJsSystem.scene.matrixAutoUpdate = false;


    // put a camera in the scene
    ThreeJsSystem.camera = new liveCodeLabCore_THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 10000);
    ThreeJsSystem.camera.position.set(0, 0, 5);
    ThreeJsSystem.scene.add(ThreeJsSystem.camera);

    // transparently support window resize
    THREEx.WindowResize.bind(ThreeJsSystem.renderer, ThreeJsSystem.camera);

    ThreeJsSystem.buildPostprocessingChain = function () {
        var renderTargetParameters,
            renderTarget,
            effectSaveTarget,
            fxaaPass,
            screenPass,
            renderModel;

        renderTargetParameters = {
            format: liveCodeLabCore_THREE.RGBAFormat,
            stencilBuffer: true
        };

        renderTarget = new liveCodeLabCore_THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters);
        effectSaveTarget = new liveCodeLabCore_THREE.SavePass(new liveCodeLabCore_THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters));
        effectSaveTarget.clear = false;

        // Uncomment the three lines containing "fxaaPass" below to try a fast
        // antialiasing filter. Commented below because of two reasons: a) it's slow
        // b) it blends in some black pixels, so it only looks good in dark backgrounds
        // The problem of blending with black pixels is the same problem of the
        // motionBlur leaving a black trail - tracked in github with
        // https://github.com/davidedc/livecodelab/issues/22
        
        //fxaaPass = new liveCodeLabCore_THREE.ShaderPass(liveCodeLabCore_THREE.ShaderExtras.fxaa);
        //fxaaPass.uniforms.resolution.value.set(1 / window.innerWidth, 1 / window.innerHeight);

        ThreeJsSystem.effectBlend = new liveCodeLabCore_THREE.ShaderPass(liveCodeLabCore_THREE.ShaderExtras.blend, "tDiffuse1");
        screenPass = new liveCodeLabCore_THREE.ShaderPass(liveCodeLabCore_THREE.ShaderExtras.screen);

        // motion blur
        ThreeJsSystem.effectBlend.uniforms.tDiffuse2.value = effectSaveTarget.renderTarget;
        ThreeJsSystem.effectBlend.uniforms.mixRatio.value = 0;

        renderModel = new liveCodeLabCore_THREE.RenderPass(ThreeJsSystem.scene, ThreeJsSystem.camera);

        ThreeJsSystem.composer = new liveCodeLabCore_THREE.EffectComposer(ThreeJsSystem.renderer, renderTarget);

        ThreeJsSystem.composer.addPass(renderModel);
        //ThreeJsSystem.composer.addPass(fxaaPass);
        ThreeJsSystem.composer.addPass(ThreeJsSystem.effectBlend);
        ThreeJsSystem.composer.addPass(effectSaveTarget);
        ThreeJsSystem.composer.addPass(screenPass);
        screenPass.renderToScreen = true;
    };

    if (ThreeJsSystem.isWebGLUsed) {
        ThreeJsSystem.buildPostprocessingChain();
    }




    return ThreeJsSystem;

};
