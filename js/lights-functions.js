/*jslint browser: true */


var createLightSystem = function (three) {

    'use strict';

    var LightSystem = {};

    LiveCodeLabCore.GraphicsCommands.objectPools[LiveCodeLabCore.GraphicsCommands.primitiveTypes.ambientLight] = [];
    LiveCodeLabCore.GraphicsCommands.objectsUsedInFrameCounts[LiveCodeLabCore.GraphicsCommands.primitiveTypes.ambientLight] = 0;

    LightSystem.lightsAreOn = false;

    window.lights = LightSystem.lights = function () {
        LightSystem.lightsAreOn = true;
    };
    window.noLights = LightSystem.noLights = function () {
        LightSystem.lightsAreOn = false;
    };

    // ambientLight needs to be global
    window.ambientLight = LightSystem.ambientLight = function (r, g, b, a) {

        var colorToBeUsed,
            newLightCreated = false,
            ambientLightsPool,
            pooledAmbientLight;

        if (r === undefined) {
            // empty arguments gives some sort
            // of grey ambient light.
            // black is too stark and white
            // doesn't show the effect with the
            // default white fill
            colorToBeUsed = LiveCodeLabCore.ColourFunctions.color(255);
        } else {
            colorToBeUsed = LiveCodeLabCore.ColourFunctions.color(r, g, b, a);
        }

        LightSystem.lightsAreOn = true;

        // used by graphic-primitives
        LiveCodeLabCore.GraphicsCommands.defaultNormalFill = false;

        // used by graphic-primitives
        LiveCodeLabCore.GraphicsCommands.defaultNormalStroke = false;

        ambientLightsPool = LiveCodeLabCore.GraphicsCommands.objectPools[LiveCodeLabCore.GraphicsCommands.primitiveTypes.ambientLight];
        pooledAmbientLight =  ambientLightsPool[LiveCodeLabCore.GraphicsCommands.objectsUsedInFrameCounts[LiveCodeLabCore.GraphicsCommands.primitiveTypes.ambientLight]];
        if (pooledAmbientLight === undefined) {
            // So here is the thing, the command is currently called AmbientLight but
            // in reality we are creating a PointLight in a specific position.
            // AmbientLight just fills the whole scene,
            // so the faces of the cube would all be of the same
            // exact color. Note that in Three.js versions before r50 the AmbientLight
            // would work like a PointLight does now.
            pooledAmbientLight = new three.PointLight(colorToBeUsed);
            pooledAmbientLight.position.set(10, 50, 130);

            newLightCreated = true;
            ambientLightsPool.push(pooledAmbientLight);
            pooledAmbientLight.detailLevel = 0;
            pooledAmbientLight.primitiveType = LiveCodeLabCore.GraphicsCommands.primitiveTypes.ambientLight;
        } else {
            pooledAmbientLight.color.setHex(colorToBeUsed);
        }




        LiveCodeLabCore.GraphicsCommands.objectsUsedInFrameCounts[LiveCodeLabCore.GraphicsCommands.primitiveTypes.ambientLight] += 1;

        if (newLightCreated) {
            // NOTE that an ambient light is not actually added as an object.
            // i.e. if you navigate the objects you don't find it.
            LiveCodeLabCore.ThreeJsSystem.scene.add(pooledAmbientLight);
        }
    };

    return LightSystem;

};
