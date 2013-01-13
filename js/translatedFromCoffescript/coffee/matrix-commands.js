"use strict";

var MatrixCommands;

MatrixCommands = (function() {
  var matrixStack;

  matrixStack = [];

  function MatrixCommands(liveCodeLabCore_THREE, liveCodeLabCoreInstance) {
    var _this = this;
    this.liveCodeLabCore_THREE = liveCodeLabCore_THREE;
    this.liveCodeLabCoreInstance = liveCodeLabCoreInstance;
    this.worldMatrix = new this.liveCodeLabCore_THREE.Matrix4();
    window.pushMatrix = function() {
      return _this.pushMatrix();
    };
    window.popMatrix = function() {
      return _this.popMatrix();
    };
    window.resetMatrix = function() {
      return _this.resetMatrix();
    };
    window.move = function(a, b, c) {
      return _this.move(a, b, c);
    };
    window.rotate = function(a, b, c) {
      return _this.rotate(a, b, c);
    };
    window.scale = function(a, b, c) {
      return _this.scale(a, b, c);
    };
  }

  MatrixCommands.prototype.getWorldMatrix = function() {
    return this.worldMatrix;
  };

  MatrixCommands.prototype.resetMatrixStack = function() {
    this.matrixStack = [];
    return this.worldMatrix.identity();
  };

  MatrixCommands.prototype.pushMatrix = function() {
    this.matrixStack.push(this.worldMatrix);
    return this.worldMatrix = (new this.liveCodeLabCore_THREE.Matrix4()).copy(this.worldMatrix);
  };

  MatrixCommands.prototype.popMatrix = function() {
    if (this.matrixStack.length !== 0) {
      return this.worldMatrix = this.matrixStack.pop();
    } else {
      return this.worldMatrix.identity();
    }
  };

  MatrixCommands.prototype.resetMatrix = function() {
    return this.worldMatrix.identity();
  };

  MatrixCommands.prototype.move = function(a, b, c) {
    if (c == null) {
      c = 0;
    }
    if (typeof a !== "number") {
      a = Math.sin(this.liveCodeLabCoreInstance.TimeKeeper.getTime() / 500);
      b = Math.cos(this.liveCodeLabCoreInstance.TimeKeeper.getTime() / 500);
      c = a;
    } else if (typeof b !== "number") {
      b = a;
      c = a;
    }
    return this.worldMatrix.translate(new this.liveCodeLabCore_THREE.Vector3(a, b, c));
  };

  MatrixCommands.prototype.rotate = function(a, b, c) {
    if (c == null) {
      c = 0;
    }
    if (typeof a !== "number") {
      a = this.liveCodeLabCoreInstance.TimeKeeper.getTime() / 1000;
      b = a;
      c = a;
    } else if (typeof b !== "number") {
      b = a;
      c = a;
    }
    return this.worldMatrix.rotateX(a).rotateY(b).rotateZ(c);
  };

  MatrixCommands.prototype.scale = function(a, b, c) {
    if (c == null) {
      c = 1;
    }
    if (typeof a !== "number") {
      a = 1 + Math.sin(this.liveCodeLabCoreInstance.TimeKeeper.getTime() / 500) / 4;
      b = a;
      c = a;
    } else if (typeof b !== "number") {
      b = a;
      c = a;
    }
    if (a > -0.000000001 && a < 0.000000001) {
      a = 0.000000001;
    }
    if (b > -0.000000001 && b < 0.000000001) {
      b = 0.000000001;
    }
    if (c > -0.000000001 && c < 0.000000001) {
      c = 0.000000001;
    }
    return this.worldMatrix.scale(new this.liveCodeLabCore_THREE.Vector3(a, b, c));
  };

  return MatrixCommands;

})();
