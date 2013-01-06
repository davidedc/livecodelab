var createLightSystem;

createLightSystem = function(liveCodeLabCore_GraphicsCommands, liveCodeLabCoreInstance) {
  "use strict";

  var LightSystem, objectPools, objectsUsedInFrameCounts, primitiveTypes;
  LightSystem = {};
  objectPools = liveCodeLabCore_GraphicsCommands.objectPools;
  primitiveTypes = liveCodeLabCore_GraphicsCommands.primitiveTypes;
  objectsUsedInFrameCounts = liveCodeLabCore_GraphicsCommands.objectsUsedInFrameCounts;
  objectPools[primitiveTypes.ambientLight] = [];
  objectsUsedInFrameCounts[primitiveTypes.ambientLight] = 0;
  LightSystem.lightsAreOn = false;
  window.lights = LightSystem.lights = function() {
    return LightSystem.lightsAreOn = true;
  };
  window.noLights = LightSystem.noLights = function() {
    return LightSystem.lightsAreOn = false;
  };
  window.ambientLight = LightSystem.ambientLight = function(r, g, b, a) {
    var ambientLightsPool, colorToBeUsed, newLightCreated, pooledAmbientLight;
    colorToBeUsed = void 0;
    newLightCreated = false;
    ambientLightsPool = void 0;
    pooledAmbientLight = void 0;
    if (r === undefined) {
      colorToBeUsed = liveCodeLabCoreInstance.ColourFunctions.color(255);
    } else {
      colorToBeUsed = liveCodeLabCoreInstance.ColourFunctions.color(r, g, b, a);
    }
    LightSystem.lightsAreOn = true;
    liveCodeLabCore_GraphicsCommands.defaultNormalFill = false;
    liveCodeLabCore_GraphicsCommands.defaultNormalStroke = false;
    ambientLightsPool = objectPools[primitiveTypes.ambientLight];
    pooledAmbientLight = ambientLightsPool[objectsUsedInFrameCounts[primitiveTypes.ambientLight]];
    if (pooledAmbientLight === undefined) {
      pooledAmbientLight = new liveCodeLabCoreInstance.THREE.PointLight(colorToBeUsed);
      pooledAmbientLight.position.set(10, 50, 130);
      newLightCreated = true;
      ambientLightsPool.push(pooledAmbientLight);
      pooledAmbientLight.detailLevel = 0;
      pooledAmbientLight.primitiveType = primitiveTypes.ambientLight;
    } else {
      pooledAmbientLight.color.setHex(colorToBeUsed);
    }
    objectsUsedInFrameCounts[primitiveTypes.ambientLight] += 1;
    if (newLightCreated) {
      return liveCodeLabCoreInstance.ThreeJsSystem.scene.add(pooledAmbientLight);
    }
  };
  return LightSystem;
};
