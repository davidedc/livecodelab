"use strict";

var BlendControls;

BlendControls = (function() {

  BlendControls.prototype.previousanimationStyleValue = 0;

  BlendControls.prototype.animationStyleValue = 0;

  BlendControls.prototype.animationStyles = {};

  BlendControls.prototype.blendAmount = 0;

  function BlendControls(liveCodeLabCoreInstance) {
    var _this = this;
    this.liveCodeLabCoreInstance = liveCodeLabCoreInstance;
    window.normal = this.animationStyles.normal = 0;
    window.paintOver = this.animationStyles.paintOver = 1;
    window.motionBlur = this.animationStyles.motionBlur = 2;
    window.animationStyle = function(a) {
      return _this.animationStyle(a);
    };
  }

  BlendControls.prototype.animationStyle = function(a) {
    if (a === false || a === undefined) {
      return;
    }
    return this.animationStyleValue = a;
  };

  BlendControls.prototype.animationStyleUpdateIfChanged = function() {
    var isWebGLUsed;
    if (this.animationStyleValue === this.previousanimationStyleValue) {
      return;
    }
    this.previousanimationStyleValue = this.animationStyleValue;
    isWebGLUsed = this.liveCodeLabCoreInstance.threeJsSystem.isWebGLUsed;
    this.animationStyles = this.animationStyles;
    if (isWebGLUsed && this.animationStyleValue === this.animationStyles.motionBlur) {
      this.liveCodeLabCoreInstance.threeJsSystem.effectBlend.uniforms.mixRatio.value = 0.7;
    } else if (!isWebGLUsed && this.animationStyleValue === this.animationStyles.motionBlur) {
      this.blendAmount = 0.6;
    }
    if (isWebGLUsed && this.animationStyleValue === this.animationStyles.paintOver) {
      this.liveCodeLabCoreInstance.threeJsSystem.effectBlend.uniforms.mixRatio.value = 1;
    } else if (!isWebGLUsed && this.animationStyleValue === this.animationStyles.paintOver) {
      this.blendAmount = 1;
    }
    if (isWebGLUsed && this.animationStyleValue === this.animationStyles.normal) {
      return this.liveCodeLabCoreInstance.threeJsSystem.effectBlend.uniforms.mixRatio.value = 0;
    } else if (!isWebGLUsed && this.animationStyleValue === this.animationStyles.normal) {
      return this.blendAmount = 0;
    }
  };

  return BlendControls;

})();
