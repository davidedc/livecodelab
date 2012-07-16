var parentObject, rootObject;
parentObject = 0;
rootObject = 0;
var currentObject;

var matrixStack = [];

var pushMatrix = function() {
  matrixStack.push(worldMatrix);
  worldMatrix = (new THREE.Matrix4()).copy(worldMatrix);
}

var popMatrix = function() {
  if (matrixStack.length !== 0) worldMatrix = matrixStack.pop();
  else worldMatrix.identity();
}

var resetMatrix = function() {
  worldMatrix.identity();
}

var move = function(a, b, c) {
  if (arguments.length === 0) {
    a = Math.sin(time / 500);
    b = Math.cos(time / 500);
    c = a;
  } else if (arguments.length == 1) {
    b = a;
    c = a;
  } else if (arguments.length == 2) {
    c = 0;
  }

  /*
  currentObject = new THREE.Object3D();
  currentObject.position.x = a;
  currentObject.position.y = b;
  currentObject.position.z = c;
  parentObject.add(currentObject);
  parentObject = currentObject;
  */
  worldMatrix.translate(new THREE.Vector3(a, b, c));
};

function rotate(a, b, c) {

  if (arguments.length === 0) {
    a = time / 1000;
    b = a;
    c = a;
  } else if (arguments.length == 1) {
    b = a;
    c = a;
  } else if (arguments.length == 2) {
    c = 0;
  }

  /*
  currentObject = new THREE.Object3D();
  currentObject.rotation.x = a;
  currentObject.rotation.y = b;
  currentObject.rotation.z = c;
  parentObject.add(currentObject);
  parentObject = currentObject;
  */
  //worldMatrix.setRotationFromEuler(new THREE.Vector3(a,b,c));
  worldMatrix.rotateX(a).rotateY(b).rotateZ(c);

};

var scale = function(a, b, c) {
  if (arguments.length === 0) {
    a = 1 + Math.sin(time / 500) / 4;
    b = a;
    c = a;
  } else if (arguments.length == 1) {
    b = a;
    c = a;
  } else if (arguments.length == 2) {
    c = 1;
  }

  // odd things happen setting scale to zero
  if (a > -0.000000001 && a < 0.000000001) a = 0.000000001;
  if (b > -0.000000001 && b < 0.000000001) b = 0.000000001;
  if (c > -0.000000001 && c < 0.000000001) c = 0.000000001;

  /*
  currentObject = new THREE.Object3D();
  currentObject.scale.x = a;
  currentObject.scale.y = b;
  currentObject.scale.z = c;
  parentObject.add(currentObject);
  parentObject = currentObject;
  */
  worldMatrix.scale(new THREE.Vector3(a, b, c));

};