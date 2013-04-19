/*
## The rendering requires some special steps that allow the display list
## to be reused as much as possible between frames.
*/

var Renderer;

Renderer = (function() {
  "use strict";  function Renderer(liveCodeLabCoreInstance) {
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
    var i, objectsUsedInFrameCounts, primitiveType, sceneObject, threeJsSystem, _i, _len, _ref, _results;

    i = void 0;
    sceneObject = void 0;
    primitiveType = void 0;
    threeJsSystem = this.liveCodeLabCoreInstance.threeJsSystem;
    objectsUsedInFrameCounts = graphics.objectsUsedInFrameCounts;
    _ref = threeJsSystem.scene.children;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      sceneObject = _ref[_i];
      if (objectsUsedInFrameCounts[sceneObject.primitiveType + sceneObject.detailLevel] > 0) {
        sceneObject.visible = true;
        _results.push(objectsUsedInFrameCounts[sceneObject.primitiveType + sceneObject.detailLevel] -= 1);
      } else {
        _results.push(sceneObject.visible = false);
      }
    }
    return _results;
  };

  return Renderer;

})();
