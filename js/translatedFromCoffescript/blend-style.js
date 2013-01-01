var createBlendControls;

createBlendControls = function(liveCodeLabCoreInstance) {
  "use strict";

  var BlendControls, animationStyleValue, previousanimationStyleValue;
  BlendControls = {};
  previousanimationStyleValue = 0;
  animationStyleValue = 0;
  BlendControls.blendAmount = 0;
  BlendControls.animationStyles = {};
  window.normal = BlendControls.animationStyles.normal = 0;
  window.paintOver = BlendControls.animationStyles.paintOver = 1;
  window.motionBlur = BlendControls.animationStyles.motionBlur = 2;
  window.animationStyle = BlendControls.animationStyle = function(a) {
    if (a === false || a === undefined) {
      return;
    }
    return animationStyleValue = a;
  };
  BlendControls.animationStyleUpdateIfChanged = function() {
    var animationStyles, isWebGLUsed;
    if (animationStyleValue === previousanimationStyleValue) {
      return;
    }
    previousanimationStyleValue = animationStyleValue;
    isWebGLUsed = liveCodeLabCoreInstance.ThreeJsSystem.isWebGLUsed;
    animationStyles = BlendControls.animationStyles;
    if (isWebGLUsed && animationStyleValue === animationStyles.motionBlur) {
      liveCodeLabCoreInstance.ThreeJsSystem.effectBlend.uniforms.mixRatio.value = 0.7;
    } else if (!isWebGLUsed && animationStyleValue === animationStyles.motionBlur) {
      BlendControls.blendAmount = 0.6;
    }
    if (isWebGLUsed && animationStyleValue === animationStyles.paintOver) {
      liveCodeLabCoreInstance.ThreeJsSystem.effectBlend.uniforms.mixRatio.value = 1;
    } else if (!isWebGLUsed && animationStyleValue === animationStyles.paintOver) {
      BlendControls.blendAmount = 1;
    }
    if (isWebGLUsed && animationStyleValue === animationStyles.normal) {
      return liveCodeLabCoreInstance.ThreeJsSystem.effectBlend.uniforms.mixRatio.value = 0;
    } else if (!isWebGLUsed && animationStyleValue === animationStyles.normal) {
      return BlendControls.blendAmount = 0;
    }
  };
  return BlendControls;
};
