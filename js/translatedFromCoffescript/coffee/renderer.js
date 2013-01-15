"use strict";

var Renderer;

Renderer = (function() {

  function Renderer(liveCodeLabCoreInstance) {
    this.liveCodeLabCoreInstance = liveCodeLabCoreInstance;
  }

  Renderer.prototype.render = function(graphics) {
    var blendedThreeJsSceneCanvasContext, previousFrameThreeJSSceneRenderForBlendingCanvasContext, renderer, threeJsSystem;
    threeJsSystem = this.liveCodeLabCoreInstance.threeJsSystem;
    renderer = threeJsSystem.renderer;
    blendedThreeJsSceneCanvasContext = threeJsSystem.blendedThreeJsSceneCanvasContext;
    previousFrameThreeJSSceneRenderForBlendingCanvasContext = threeJsSystem.previousFrameThreeJSSceneRenderForBlendingCanvasContext;
    this.combDisplayList(graphics);
    if (threeJsSystem.isWebGLUsed) {
      return threeJsSystem.composer.render();
    } else {
      renderer.render(threeJsSystem.scene, threeJsSystem.camera);
      blendedThreeJsSceneCanvasContext.globalAlpha = 1.0;
      blendedThreeJsSceneCanvasContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
      blendedThreeJsSceneCanvasContext.globalAlpha = this.liveCodeLabCoreInstance.blendControls.blendAmount;
      blendedThreeJsSceneCanvasContext.drawImage(threeJsSystem.previousFrameThreeJSSceneRenderForBlendingCanvas, 0, 0);
      blendedThreeJsSceneCanvasContext.globalAlpha = 1.0;
      blendedThreeJsSceneCanvasContext.drawImage(threeJsSystem.currentFrameThreeJsSceneCanvas, 0, 0);
      previousFrameThreeJSSceneRenderForBlendingCanvasContext.globalCompositeOperation = "copy";
      previousFrameThreeJSSceneRenderForBlendingCanvasContext.drawImage(threeJsSystem.blendedThreeJsSceneCanvas, 0, 0);
      return threeJsSystem.currentFrameThreeJsSceneCanvasContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  };

  Renderer.prototype.combDisplayList = function(graphics) {
    var i, objectsUsedInFrameCounts, primitiveType, sceneObject, threeJsSystem, _results;
    i = void 0;
    sceneObject = void 0;
    primitiveType = void 0;
    threeJsSystem = this.liveCodeLabCoreInstance.threeJsSystem;
    objectsUsedInFrameCounts = graphics.objectsUsedInFrameCounts;
    i = 0;
    _results = [];
    while (i < threeJsSystem.scene.children.length) {
      sceneObject = threeJsSystem.scene.children[i];
      if (objectsUsedInFrameCounts[sceneObject.primitiveType + sceneObject.detailLevel] > 0) {
        sceneObject.visible = true;
        objectsUsedInFrameCounts[sceneObject.primitiveType + sceneObject.detailLevel] -= 1;
      } else {
        sceneObject.visible = false;
      }
      _results.push(i += 1);
    }
    return _results;
  };

  return Renderer;

})();
