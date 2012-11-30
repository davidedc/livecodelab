/*jslint browser: true */
/*global logger, color, defaultNormalFill: true, defaultNormalStroke: true, worldMatrix */


var createLightSystem = function (threejs, three) {

    'use strict';

    var LightSystem = {},
        previousanimationStyleValue = 0,
        ambientLightsPool = [],
        animationStyleValue = 0;


    LightSystem.usedAmbientLights = 0;


    LightSystem.lightsAreOn = false;

    window.lights = LightSystem.lights = function () {
        LightSystem.lightsAreOn = true;
    };
    window.noLights = LightSystem.noLights = function () {
        LightSystem.lightsAreOn = false;
    };


    // Used for setting how much blending there is between frames
    LightSystem.blendAmount = 0;


    // ambientColor is always white
    // because it needs to reflect what the
    // ambient light color is
    // I tried to set the ambientColor directly
    // but it doesn't work. It needs to be white so
    // that the tint of the ambientLight is shown. 
    LightSystem.ambientColor = color(255, 255, 255);

    // ambientLight needs to be global
    window.ambientLight = LightSystem.ambientLight = function (r, g, b, a) {

        var colorToBeUsed,
            newLightCreated = false,
            pooledAmbientLight;

        if (r === undefined) {
            // empty arguments gives some sort
            // of grey ambient light.
            // black is too stark and white
            // doesn't show the effect with the
            // default white fill
            colorToBeUsed = color(125);
        } else {
            colorToBeUsed = color(r, g, b, a);
        }

        LightSystem.lightsAreOn = true;

        // used by graphic-primitives
        defaultNormalFill = false;

        // used by graphic-primitives
        defaultNormalStroke = false;

        pooledAmbientLight = ambientLightsPool[LightSystem.usedAmbientLights];
        if (pooledAmbientLight === undefined) {
            logger('no ambientLight in pool, creating one');
            pooledAmbientLight = new three.AmbientLight(colorToBeUsed);
            newLightCreated = true;
            ambientLightsPool.push(pooledAmbientLight);
        } else {
            pooledAmbientLight.color.setHex(colorToBeUsed);
            logger('existing ambientLight in pool, setting color: ' + pooledAmbientLight.color.r + ' ' + pooledAmbientLight.color.g + ' ' + pooledAmbientLight.color.b);
        }


        pooledAmbientLight.isLine = false;
        pooledAmbientLight.isRectangle = false;
        pooledAmbientLight.isBox = false;
        pooledAmbientLight.isCylinder = false;
        pooledAmbientLight.isAmbientLight = true;
        pooledAmbientLight.isPointLight = false;
        pooledAmbientLight.isSphere = 0;


        LightSystem.usedAmbientLights += 1;
        pooledAmbientLight.matrixAutoUpdate = false;
        pooledAmbientLight.matrix.copy(worldMatrix);
        pooledAmbientLight.matrixWorldNeedsUpdate = true;

        if (newLightCreated) {
            threejs.scene.add(pooledAmbientLight);
        }
    };



    // Just an object to hold the animation style variables
    LightSystem.animationStyles = {};
    // These all need to be made global so they can be used by sketches
    window.normal = LightSystem.animationStyles.normal = 0;
    window.paintOver = LightSystem.animationStyles.paintOver = 1;
    window.motionBlur = LightSystem.animationStyles.motionBlur = 2;

    window.animationStyle = LightSystem.animationStyle = function (a) {
        // turns out when you type normal that the first two letters "no"
        // are sent as "false"
        if (a === false || a === undefined) {
            return;
        }
        animationStyleValue = a;
    };

    LightSystem.animationStyleUpdateIfChanged = function () {

        if (animationStyleValue === previousanimationStyleValue) {
            // Animation Style hasn't changed so we don't need to do anything
            return;
        }

        previousanimationStyleValue = animationStyleValue;

        if (threejs.isWebGLUsed && animationStyleValue === LightSystem.animationStyles.motionBlur) {
            threejs.effectBlend.uniforms.mixRatio.value = 0.7;
        } else if (!threejs.isWebGLUsed && animationStyleValue === LightSystem.animationStyles.motionBlur) {
            LightSystem.blendAmount = 0.6;
        }

        if (threejs.isWebGLUsed && animationStyleValue === LightSystem.animationStyles.paintOver) {
            threejs.effectBlend.uniforms.mixRatio.value = 1;
        } else if (!threejs.isWebGLUsed && animationStyleValue === LightSystem.animationStyles.paintOver) {
            LightSystem.blendAmount = 1;
        }

        if (threejs.isWebGLUsed && animationStyleValue === LightSystem.animationStyles.normal) {
            threejs.effectBlend.uniforms.mixRatio.value = 0;
        } else if (!threejs.isWebGLUsed && animationStyleValue === LightSystem.animationStyles.normal) {
            LightSystem.blendAmount = 0;
        }

    };

    return LightSystem;

};
