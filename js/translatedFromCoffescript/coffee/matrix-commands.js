var createMatrixCommands;

createMatrixCommands = function(liveCodeLabCore_THREE, liveCodeLabCoreInstance) {
  "use strict";

  var MatrixCommands, currentObject, matrixStack, parentObject, rootObject, worldMatrix;
  MatrixCommands = {};
  parentObject = 0;
  rootObject = 0;
  currentObject = void 0;
  matrixStack = [];
  worldMatrix = new liveCodeLabCore_THREE.Matrix4();
  MatrixCommands.getWorldMatrix = function() {
    return worldMatrix;
  };
  MatrixCommands.resetMatrixStack = function() {
    matrixStack = [];
    return worldMatrix.identity();
  };
  window.pushMatrix = MatrixCommands.pushMatrix = function() {
    matrixStack.push(worldMatrix);
    return worldMatrix = (new liveCodeLabCore_THREE.Matrix4()).copy(worldMatrix);
  };
  window.popMatrix = MatrixCommands.popMatrix = function() {
    if (matrixStack.length !== 0) {
      return worldMatrix = matrixStack.pop();
    } else {
      return worldMatrix.identity();
    }
  };
  window.resetMatrix = MatrixCommands.resetMatrix = function() {
    return worldMatrix.identity();
  };
  window.move = MatrixCommands.move = function(a, b, c) {
    if (c == null) {
      c = 0;
    }
    if (typeof a !== "number") {
      a = Math.sin(liveCodeLabCoreInstance.TimeKeeper.getTime() / 500);
      b = Math.cos(liveCodeLabCoreInstance.TimeKeeper.getTime() / 500);
      c = a;
    } else if (typeof b !== "number") {
      b = a;
      c = a;
    }
    return worldMatrix.translate(new liveCodeLabCore_THREE.Vector3(a, b, c));
  };
  window.rotate = MatrixCommands.rotate = function(a, b, c) {
    if (c == null) {
      c = 0;
    }
    if (typeof a !== "number") {
      a = liveCodeLabCoreInstance.TimeKeeper.getTime() / 1000;
      b = a;
      c = a;
    } else if (typeof b !== "number") {
      b = a;
      c = a;
    }
    return worldMatrix.rotateX(a).rotateY(b).rotateZ(c);
  };
  window.scale = MatrixCommands.scale = function(a, b, c) {
    if (c == null) {
      c = 1;
    }
    if (typeof a !== "number") {
      a = 1 + Math.sin(liveCodeLabCoreInstance.TimeKeeper.getTime() / 500) / 4;
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
    return worldMatrix.scale(new liveCodeLabCore_THREE.Vector3(a, b, c));
  };
  return MatrixCommands;
};
