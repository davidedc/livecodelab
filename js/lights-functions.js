/*jslint browser: true */
/*global logger, color */


var createLightSystem = function (threejs, three, matrixcommands, graphics) {

    'use strict';

    var LightSystem = {};

    graphics.objectPools[graphics.primitiveTypes.ambientLight] = [];
    graphics.objectsUsedInFrameCounts[graphics.primitiveTypes.ambientLight] = 0;

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
            newLightCreated = false;

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

        var ambientLightsPool = graphics.objectPools[graphics.primitiveTypes.ambientLight];
        var pooledAmbientLight =  ambientLightsPool[graphics.objectsUsedInFrameCounts[graphics.primitiveTypes.ambientLight]];
        //logger("how many ambient lights: " + graphics.objectsUsedInFrameCounts[graphics.primitiveTypes.ambientLight]);
        if (pooledAmbientLight === undefined) {
            //logger('no ambientLight in pool, creating one - ambientLightsPool length: ' + ambientLightsPool.length);
            pooledAmbientLight = new three.AmbientLight(colorToBeUsed);
            newLightCreated = true;
            ambientLightsPool.push(pooledAmbientLight);
            pooledAmbientLight.detailLevel = 0;
            pooledAmbientLight.primitiveType = graphics.primitiveTypes.ambientLight;
            //logger("graphics.primitiveTypes.ambientLight" + graphics.primitiveTypes.ambientLight);
        } else {
            pooledAmbientLight.color.setHex(colorToBeUsed);
            //logger('existing ambientLight in pool, setting color: ' + pooledAmbientLight.color.r + ' ' + pooledAmbientLight.color.g + ' ' + pooledAmbientLight.color.b);
        }




        graphics.objectsUsedInFrameCounts[graphics.primitiveTypes.ambientLight] += 1;
        pooledAmbientLight.matrixAutoUpdate = false;
        pooledAmbientLight.matrix.copy(matrixcommands.getWorldMatrix());
        pooledAmbientLight.matrixWorldNeedsUpdate = true;

        if (newLightCreated) {
            // NOTE that an ambient light is not actually added as an object.
            // i.e. if you navigate the objects you don't find it.
            threejs.scene.add(pooledAmbientLight);
        }
    };

    return LightSystem;

};
