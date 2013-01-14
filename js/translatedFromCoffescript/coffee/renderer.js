"use strict";

var Renderer;

Renderer = (function() {

  function Renderer(liveCodeLabCoreInstance) {
    this.liveCodeLabCoreInstance = liveCodeLabCoreInstance;
  }

  Renderer.prototype.render = function(graphics) {
    var ThreeJsSystem, blendedThreeJsSceneCanvasContext, previousFrameThreeJSSceneRenderForBlendingCanvasContext, renderer;
    ThreeJsSystem = this.liveCodeLabCoreInstance.ThreeJsSystem;
    renderer = ThreeJsSystem.renderer;
    blendedThreeJsSceneCanvasContext = ThreeJsSystem.blendedThreeJsSceneCanvasContext;
    previousFrameThreeJSSceneRenderForBlendingCanvasContext = ThreeJsSystem.previousFrameThreeJSSceneRenderForBlendingCanvasContext;
    this.combDisplayList(graphics);
    if (ThreeJsSystem.isWebGLUsed) {
      return ThreeJsSystem.composer.render();
    } else {
      renderer.render(ThreeJsSystem.scene, ThreeJsSystem.camera);
      blendedThreeJsSceneCanvasContext.globalAlpha = 1.0;
      blendedThreeJsSceneCanvasContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
      blendedThreeJsSceneCanvasContext.globalAlpha = this.liveCodeLabCoreInstance.BlendControls.blendAmount;
      blendedThreeJsSceneCanvasContext.drawImage(ThreeJsSystem.previousFrameThreeJSSceneRenderForBlendingCanvas, 0, 0);
      blendedThreeJsSceneCanvasContext.globalAlpha = 1.0;
      blendedThreeJsSceneCanvasContext.drawImage(ThreeJsSystem.currentFrameThreeJsSceneCanvas, 0, 0);
      previousFrameThreeJSSceneRenderForBlendingCanvasContext.globalCompositeOperation = "copy";
      previousFrameThreeJSSceneRenderForBlendingCanvasContext.drawImage(ThreeJsSystem.blendedThreeJsSceneCanvas, 0, 0);
      return ThreeJsSystem.currentFrameThreeJsSceneCanvasContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  };

  Renderer.prototype.combDisplayList = function(graphics) {
    var ThreeJsSystem, i, objectsUsedInFrameCounts, primitiveType, sceneObject, _results;
    i = void 0;
    sceneObject = void 0;
    primitiveType = void 0;
    ThreeJsSystem = this.liveCodeLabCoreInstance.ThreeJsSystem;
    objectsUsedInFrameCounts = graphics.objectsUsedInFrameCounts;
    i = 0;
    _results = [];
    while (i < ThreeJsSystem.scene.children.length) {
      sceneObject = ThreeJsSystem.scene.children[i];
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
