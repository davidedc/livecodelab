"use strict";

var LightSystem;

LightSystem = (function() {

  LightSystem.prototype.lightsAreOn = false;

  function LightSystem(liveCodeLabCore_GraphicsCommands, liveCodeLabCoreInstance) {
    var _this = this;
    this.liveCodeLabCore_GraphicsCommands = liveCodeLabCore_GraphicsCommands;
    this.liveCodeLabCoreInstance = liveCodeLabCoreInstance;
    this.objectPools = this.liveCodeLabCore_GraphicsCommands.objectPools;
    this.primitiveTypes = this.liveCodeLabCore_GraphicsCommands.primitiveTypes;
    this.objectsUsedInFrameCounts = this.liveCodeLabCore_GraphicsCommands.objectsUsedInFrameCounts;
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

  LightSystem.prototype.lights = function() {
    return this.lightsAreOn = true;
  };

  LightSystem.prototype.noLights = function() {
    return this.lightsAreOn = false;
  };

  LightSystem.prototype.ambientLight = function(r, g, b, a) {
    var ambientLightsPool, colorToBeUsed, newLightCreated, pooledAmbientLight;
    colorToBeUsed = void 0;
    newLightCreated = false;
    ambientLightsPool = void 0;
    pooledAmbientLight = void 0;
    if (r === undefined) {
      colorToBeUsed = this.liveCodeLabCoreInstance.ColourFunctions.color(255);
    } else {
      colorToBeUsed = this.liveCodeLabCoreInstance.ColourFunctions.color(r, g, b, a);
    }
    this.lightsAreOn = true;
    this.liveCodeLabCore_GraphicsCommands.defaultNormalFill = false;
    this.liveCodeLabCore_GraphicsCommands.defaultNormalStroke = false;
    ambientLightsPool = this.objectPools[this.primitiveTypes.ambientLight];
    pooledAmbientLight = ambientLightsPool[this.objectsUsedInFrameCounts[this.primitiveTypes.ambientLight]];
    if (pooledAmbientLight === undefined) {
      pooledAmbientLight = new this.liveCodeLabCoreInstance.THREE.PointLight(colorToBeUsed);
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
      return this.liveCodeLabCoreInstance.ThreeJsSystem.scene.add(pooledAmbientLight);
    }
  };

  return LightSystem;

})();
