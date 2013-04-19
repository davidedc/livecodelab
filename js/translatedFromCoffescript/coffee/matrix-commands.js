/*
## Takes care of all matrix-related commands.
*/

var MatrixCommands;

MatrixCommands = (function() {
  "use strict";  MatrixCommands.prototype.matrixStack = [];

  function MatrixCommands(liveCodeLabCore_three, liveCodeLabCoreInstance) {
    var _this = this;

    this.liveCodeLabCore_three = liveCodeLabCore_three;
    this.liveCodeLabCoreInstance = liveCodeLabCoreInstance;
    this.worldMatrix = new this.liveCodeLabCore_three.Matrix4();
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
    return this.worldMatrix = (new this.liveCodeLabCore_three.Matrix4()).copy(this.worldMatrix);
  };

  MatrixCommands.prototype.popMatrix = function() {
    if (this.matrixStack.length) {
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
      a = Math.sin(this.liveCodeLabCoreInstance.timeKeeper.getTime() / 500);
      b = Math.cos(this.liveCodeLabCoreInstance.timeKeeper.getTime() / 500);
      c = a;
    } else if (typeof b !== "number") {
      b = a;
      c = a;
    }
    return this.worldMatrix.translate(new this.liveCodeLabCore_three.Vector3(a, b, c));
  };

  MatrixCommands.prototype.rotate = function(a, b, c) {
    if (c == null) {
      c = 0;
    }
    if (typeof a !== "number") {
      a = this.liveCodeLabCoreInstance.timeKeeper.getTime() / 1000;
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
      a = 1 + Math.sin(this.liveCodeLabCoreInstance.timeKeeper.getTime() / 500) / 4;
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
    return this.worldMatrix.scale(new this.liveCodeLabCore_three.Vector3(a, b, c));
  };

  return MatrixCommands;

})();
