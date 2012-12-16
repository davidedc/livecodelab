/*jslint browser: true */


var createBlendControls = function () {

    'use strict';

    var BlendControls = {},
        previousanimationStyleValue = 0,
        animationStyleValue = 0;

    // Used for setting how much blending there is between frames
    BlendControls.blendAmount = 0;


    // Just an object to hold the animation style variables
    BlendControls.animationStyles = {};
    // These all need to be made global so they can be used by sketches
    window.normal = BlendControls.animationStyles.normal = 0;
    window.paintOver = BlendControls.animationStyles.paintOver = 1;
    window.motionBlur = BlendControls.animationStyles.motionBlur = 2;

    window.animationStyle = BlendControls.animationStyle = function (a) {
        // turns out when you type normal that the first two letters "no"
        // are sent as "false"
        if (a === false || a === undefined) {
            return;
        }
        animationStyleValue = a;
    };

    BlendControls.animationStyleUpdateIfChanged = function () {

        if (animationStyleValue === previousanimationStyleValue) {
            // Animation Style hasn't changed so we don't need to do anything
            return;
        }

        previousanimationStyleValue = animationStyleValue;

        if (LiveCodeLabCore.ThreeJs.isWebGLUsed && animationStyleValue === BlendControls.animationStyles.motionBlur) {
            LiveCodeLabCore.ThreeJs.effectBlend.uniforms.mixRatio.value = 0.7;
        } else if (!LiveCodeLabCore.ThreeJs.isWebGLUsed && animationStyleValue === BlendControls.animationStyles.motionBlur) {
            BlendControls.blendAmount = 0.6;
        }

        if (LiveCodeLabCore.ThreeJs.isWebGLUsed && animationStyleValue === BlendControls.animationStyles.paintOver) {
            LiveCodeLabCore.ThreeJs.effectBlend.uniforms.mixRatio.value = 1;
        } else if (!LiveCodeLabCore.ThreeJs.isWebGLUsed && animationStyleValue === BlendControls.animationStyles.paintOver) {
            BlendControls.blendAmount = 1;
        }

        if (LiveCodeLabCore.ThreeJs.isWebGLUsed && animationStyleValue === BlendControls.animationStyles.normal) {
            LiveCodeLabCore.ThreeJs.effectBlend.uniforms.mixRatio.value = 0;
        } else if (!LiveCodeLabCore.ThreeJs.isWebGLUsed && animationStyleValue === BlendControls.animationStyles.normal) {
            BlendControls.blendAmount = 0;
        }

    };

    return BlendControls;
};

