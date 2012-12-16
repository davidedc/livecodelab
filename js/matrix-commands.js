/*jslint browser: true */
/*global */

var createMatrixCommands = function (liveCodeLabCore_THREE) {

    'use strict';

    var MatrixCommands = {},
        parentObject = 0,
        rootObject = 0,
        currentObject,
        matrixStack = [],
        worldMatrix = new liveCodeLabCore_THREE.Matrix4();

    MatrixCommands.getWorldMatrix = function () {
        return worldMatrix;
    };

    MatrixCommands.resetMatrixStack = function () {
        matrixStack = [];
        worldMatrix.identity();
    };

    window.pushMatrix = MatrixCommands.pushMatrix = function () {
        matrixStack.push(worldMatrix);
        worldMatrix = (new liveCodeLabCore_THREE.Matrix4()).copy(worldMatrix);
    };

    window.popMatrix = MatrixCommands.popMatrix = function () {
        if (matrixStack.length !== 0) {
            worldMatrix = matrixStack.pop();
        } else {
            worldMatrix.identity();
        }
    };

    window.resetMatrix = MatrixCommands.resetMatrix = function () {
        worldMatrix.identity();
    };


    window.move = MatrixCommands.move = function (a, b, c) {
        if (arguments.length === 0) {
            a = Math.sin(LiveCodeLabCore.TimeKeeper.getTime() / 500);
            b = Math.cos(LiveCodeLabCore.TimeKeeper.getTime() / 500);
            c = a;
        } else if (arguments.length === 1) {
            b = a;
            c = a;
        } else if (arguments.length === 2) {
            c = 0;
        }

        worldMatrix.translate(new liveCodeLabCore_THREE.Vector3(a, b, c));
    };

    window.rotate = MatrixCommands.rotate = function (a, b, c) {

        if (arguments.length === 0) {
            a = LiveCodeLabCore.TimeKeeper.getTime() / 1000;
            b = a;
            c = a;
        } else if (arguments.length === 1) {
            b = a;
            c = a;
        } else if (arguments.length === 2) {
            c = 0;
        }

        worldMatrix.rotateX(a).rotateY(b).rotateZ(c);

    };

    window.scale = MatrixCommands.scale = function (a, b, c) {
        if (arguments.length === 0) {
            a = 1 + Math.sin(LiveCodeLabCore.TimeKeeper.getTime() / 500) / 4;
            b = a;
            c = a;
        } else if (arguments.length === 1) {
            b = a;
            c = a;
        } else if (arguments.length === 2) {
            c = 1;
        }

        // odd things happen setting scale to zero
        if (a > -0.000000001 && a < 0.000000001) {
            a = 0.000000001;
        }
        if (b > -0.000000001 && b < 0.000000001) {
            b = 0.000000001;
        }
        if (c > -0.000000001 && c < 0.000000001) {
            c = 0.000000001;
        }

        worldMatrix.scale(new liveCodeLabCore_THREE.Vector3(a, b, c));

    };

    return MatrixCommands;
};
