/*
## Implementation of all lights-related commands.
*/

var LightsCommands;

LightsCommands = (function() {
  "use strict";  LightsCommands.prototype.lightsAreOn = false;

  function LightsCommands(liveCodeLabCore_graphicsCommands, liveCodeLabCoreInstance) {
    var _this = this;

    this.liveCodeLabCore_graphicsCommands = liveCodeLabCore_graphicsCommands;
    this.liveCodeLabCoreInstance = liveCodeLabCoreInstance;
    this.objectPools = this.liveCodeLabCore_graphicsCommands.objectPools;
    this.primitiveTypes = this.liveCodeLabCore_graphicsCommands.primitiveTypes;
    this.objectsUsedInFrameCounts = this.liveCodeLabCore_graphicsCommands.objectsUsedInFrameCounts;
    this.objectPools[this.primitiveTypes.ambientLight] = [];
    this.objectsUsedInFrameCounts[this.primitiveTypes.ambientLight] = 0;
    window.lights = function() {
      return _this.lights();
    };
    window.noLights = function() {
      return _this.noLights();
    };
    window.ambientLight = function(a, b, c, d) {
      return _this.ambientLight(a, b, c, d);
    };
  }

  LightsCommands.prototype.lights = function() {
    return this.lightsAreOn = true;
  };

  LightsCommands.prototype.noLights = function() {
    return this.lightsAreOn = false;
  };

  LightsCommands.prototype.ambientLight = function(r, g, b, a) {
    var ambientLightsPool, colorToBeUsed, newLightCreated, pooledAmbientLight;

    newLightCreated = false;
    if (r === undefined) {
      colorToBeUsed = this.liveCodeLabCoreInstance.colourFunctions.color(255);
    } else {
      colorToBeUsed = this.liveCodeLabCoreInstance.colourFunctions.color(r, g, b, a);
    }
    this.lightsAreOn = true;
    this.liveCodeLabCore_graphicsCommands.defaultNormalFill = false;
    this.liveCodeLabCore_graphicsCommands.defaultNormalStroke = false;
    ambientLightsPool = this.objectPools[this.primitiveTypes.ambientLight];
    pooledAmbientLight = ambientLightsPool[this.objectsUsedInFrameCounts[this.primitiveTypes.ambientLight]];
    if (pooledAmbientLight === undefined) {
      pooledAmbientLight = new this.liveCodeLabCoreInstance.three.PointLight(colorToBeUsed);
      pooledAmbientLight.position.set(10, 50, 130);
      newLightCreated = true;
      ambientLightsPool.push(pooledAmbientLight);
      pooledAmbientLight.detailLevel = 0;
      pooledAmbientLight.primitiveType = this.primitiveTypes.ambientLight;
    } else {
      pooledAmbientLight.color.setHex(colorToBeUsed);
    }
    this.objectsUsedInFrameCounts[this.primitiveTypes.ambientLight] += 1;
    if (newLightCreated) {
      return this.liveCodeLabCoreInstance.threeJsSystem.scene.add(pooledAmbientLight);
    }
  };

  return LightsCommands;

})();
