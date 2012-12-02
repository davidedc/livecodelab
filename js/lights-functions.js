/*jslint browser: true */
/*global logger, color */


var createLightSystem = function (threejs, three, matrixcommands, graphics) {

    'use strict';

    var LightSystem = {},
        ambientLightsPool = [];


    LightSystem.usedAmbientLights = 0;

    LightSystem.lightsAreOn = false;

    window.lights = LightSystem.lights = function () {
        LightSystem.lightsAreOn = true;
    };
    window.noLights = LightSystem.noLights = function () {
        LightSystem.lightsAreOn = false;
    };

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
        graphics.defaultNormalFill = false;

        // used by graphic-primitives
        graphics.defaultNormalStroke = false;

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
        pooledAmbientLight.matrix.copy(matrixcommands.getWorldMatrix());
        pooledAmbientLight.matrixWorldNeedsUpdate = true;

        if (newLightCreated) {
            threejs.scene.add(pooledAmbientLight);
        }
    };

    return LightSystem;

};
