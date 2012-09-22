// TODO Note that lines have a "solid fill" mode
// and something similar to the normalMaterial mode
// but there is no equivalent to the lambert material
// mode.
// That could be done by somehow mixing the color of
// an ambient light to the color of the stroke
// (although which ambient light do you pick if there
// is more than one?)
var line = function(a) {

  if (!doStroke) {
    return;
  }

  if (a === undefined) {
    a = 1;
  }


  var mesh = linesPool[usedLines];
  if (mesh === undefined) {
    var lineBasicMaterialCOL = new THREE.LineBasicMaterial({
      //color: currentStrokeColor,
      opacity: currentStrokeAlpha,
      linewidth: currentStrokeSize
    });

    mesh = new THREE.Line(lineGeometry, lineBasicMaterialCOL);
    mesh.isLine = true;
    mesh.isRectangle = false;
    mesh.isBox = false;
    mesh.isCylinder = false;
    mesh.isAmbientLight = false;
    mesh.isPointLight = false;
    mesh.isSphere = 0;
    linesPool.push(mesh);
    scene.add(mesh);
  } else {
    //mesh.geometry = lineGeometry;
    //mesh.material = lineBasicMaterialCOL;
    //mesh.material.color.setHex(currentStrokeColor);
    mesh.material.opacity = currentStrokeAlpha;
    mesh.material.linewidth = currentStrokeSize;
  }
  usedLines++;

  // old unpooled mechanism
  //var mesh = new THREE.Line(lineGeometry, lineBasicMaterialCOL);
  mesh.matrixAutoUpdate = false;
  mesh.matrix.copy(worldMatrix);
  mesh.matrixWorldNeedsUpdate = true;
  if (a !== 1) {
    mesh.matrix.scale(new THREE.Vector3(1, a, 1));
    // in theory the docs say that we should change the boundradius
    // but I don't think that we need it...
    //mesh.boundRadiusScale = Math.max(a,b,c);
  }

  // setting the color after the geometry has been dealt with
  // because in case we use the angleColor then we
  // need to know the geometry.
  if (currentStrokeColor === angleColor || defaultNormalStroke) {
    var sasaas = mesh.matrix.multiplyVector3(new THREE.Vector3(0, 1, 0)).normalize();
    log(sasaas.x+ " " + sasaas.y + " " + sasaas.z);
    mesh.material.color.setHex(color(((sasaas.x + 1) / 2) * 255, ((sasaas.y + 1) / 2) * 255, ((sasaas.z + 1) / 2) * 255));
  } else {
    mesh.material.color.setHex(currentStrokeColor);
  }

}


var rect = function(a, b) {

  // simple case - if there is no fill and
  // no stroke then there is nothing to do.
  var startIndex = 0;
  var endIndex = 0;

  if (!doFill && !doStroke) {
    return;
  }
  // if the wireframe is not going to be visible on top of the
  // fill then don't draw it
  else if ((doFill && (currentStrokeSize === 0 || !doStroke || (currentStrokeSize <= 1 && !defaultNormalFill && !defaultNormalStroke && currentStrokeColor === currentFillColor && currentFillAlpha === 1 && currentStrokeAlpha === 1))) || (currentStrokeSize <= 1 && defaultNormalFill && defaultNormalStroke)) {
    //if (doStroke) log('smart optimisation, was supposed to do the stroke but not doing it!!');
    startIndex = 0;
    endIndex = 1;
  } else if (!doFill && doStroke) {
    startIndex = 1;
    endIndex = 2;
  } else {
    startIndex = 0;
    endIndex = 2;
  }
//  log("si: " + startIndex + " endI: " + endIndex );
  if (a === undefined) {
    a = 1;
    b = 1;
  } else if (arguments.length === 1) {
    b = a;
  }

  var strokeTime = false;
  var colorToBeUsed;
  var alphaToBeUsed;
  var newRectCreated = false;

  // this is to run the code twice. This should be neater
  // and turned into a function call really.
  for (var fillAndStroke = startIndex; fillAndStroke < endIndex; fillAndStroke++) {
    if (fillAndStroke === 1) {
      strokeTime = true;
      colorToBeUsed = currentStrokeColor;
      alphaToBeUsed = currentStrokeAlpha;
    } else {
      colorToBeUsed = currentFillColor;
      alphaToBeUsed = currentFillAlpha;
    }
    var pooledRectangle = rectanglesPool[usedRectangles];
    if (pooledRectangle === undefined) {
      // each pooled rectangle contains a geometry,
      // a basic material and a lambert material.
      pooledRectangle = {
        basicMaterial: undefined,
        lambertMaterial: undefined,
        normalMaterial: undefined,
        // the first time we render a mesh we need to
        // render it with the material that takes the
        // bigger buffer space, otherwise the
        // more complicated materials won't show
        // up, see:
        // https://github.com/mrdoob/three.js/issues/1051
        // so we always need to create a normalmaterial
        // and render that material first, in case
        // the user will ever want to use it.
        // Another workaround would be to create a mesh
        // for each different type of material
        neverUsed: true,
        mesh: undefined
      };
      newRectCreated = true;
      rectanglesPool.push(pooledRectangle);
    }
    var applyDefaultNormalColor = false;
    if (!strokeTime) {
      if (defaultNormalFill) {
        applyDefaultNormalColor = true;
      } else {
        applyDefaultNormalColor = false;
      }
    } else {
      if (defaultNormalStroke) {
        applyDefaultNormalColor = true;
      } else {
        applyDefaultNormalColor = false;
      }
    }
    log("rect: default normal color: " + applyDefaultNormalColor);
    log("rect: alphaToBeUsed: " + alphaToBeUsed);
    if (pooledRectangle.neverUsed || (colorToBeUsed === angleColor || applyDefaultNormalColor)) {
      // the first time we render a mesh we need to
      // render it with the material that takes the
      // bigger buffer space, see:
      // https://github.com/mrdoob/three.js/issues/1051
      // Another workaround would be to create a mesh
      // for each different type of material
      pooledRectangle.neverUsed = false;
      if (pooledRectangle.normalMaterial === undefined) {
        log("creating normal material");
        pooledRectangle.normalMaterial = new THREE.MeshNormalMaterial({
          opacity: alphaToBeUsed,
          wireframe: strokeTime,
          wireframeLinewidth: currentStrokeSize
        });
      } else {
        pooledRectangle.normalMaterial.opacity = alphaToBeUsed;
        pooledRectangle.normalMaterial.wireframe = strokeTime;
        pooledRectangle.normalMaterial.doubleSided = true;
        pooledRectangle.normalMaterial.wireframeLinewidth = currentStrokeSize;
      }
      if (pooledRectangle.mesh === undefined) {
        pooledRectangle.mesh = new THREE.Mesh(planeGeometry, pooledRectangle.normalMaterial);
        pooledRectangle.startCountdown = SPINFRAMES;
      } else {
//        log("associating normal material to existing mesh");
        pooledRectangle.mesh.material = pooledRectangle.normalMaterial;
      }
    } else if (!lightsAreOn) {
      log("rect: lights are not on");
      if (pooledRectangle.basicMaterial === undefined) {
        pooledRectangle.basicMaterial = new THREE.MeshBasicMaterial({
          color: colorToBeUsed,
          opacity: alphaToBeUsed,
          wireframe: strokeTime,
          wireframeLinewidth: currentStrokeSize
        });
      } else {
        pooledRectangle.basicMaterial.color.setHex(colorToBeUsed);
        pooledRectangle.basicMaterial.opacity = alphaToBeUsed;
        pooledRectangle.basicMaterial.wireframe = strokeTime;
        pooledRectangle.basicMaterial.doubleSided = true;
        pooledRectangle.basicMaterial.wireframeLinewidth = currentStrokeSize;
      }
      if (pooledRectangle.mesh === undefined) {
        pooledRectangle.mesh = new THREE.Mesh(planeGeometry, pooledRectangle.basicMaterial);
        pooledRectangle.startCountdown = SPINFRAMES;
      } else {
        pooledRectangle.mesh.material = pooledRectangle.basicMaterial;
      }

    }
    // lights are on
    else {
      log("rect: lights are on");
      if (pooledRectangle.lambertMaterial === undefined) {
        log("creating lambert:"+currentFillColor+" "+currentFillAlpha+" "+ambientColor+" "+reflectValue+" "+refractValue);
        pooledRectangle.lambertMaterial = new THREE.MeshLambertMaterial({
          color: colorToBeUsed,
          opacity: alphaToBeUsed,
          ambient: ambientColor,
          reflectivity: reflectValue,
          refractionRatio: refractValue,
          wireframe: strokeTime,
          wireframeLinewidth: currentStrokeSize
        });
      } else {
        pooledRectangle.lambertMaterial.color.setHex(colorToBeUsed);
        pooledRectangle.lambertMaterial.opacity = alphaToBeUsed;
        pooledRectangle.lambertMaterial.wireframe = strokeTime;
        pooledRectangle.lambertMaterial.wireframeLinewidth = currentStrokeSize;
        pooledRectangle.lambertMaterial.doubleSided = true;
        pooledRectangle.lambertMaterial.ambient.setHex(ambientColor);
        pooledRectangle.lambertMaterial.reflectivity = reflectValue;
        pooledRectangle.lambertMaterial.refractionRatio = refractValue;
      }
      if (pooledRectangle.mesh === undefined) {
        pooledRectangle.mesh = new THREE.Mesh(planeGeometry, pooledRectangle.lambertMaterial);
        pooledRectangle.startCountdown = SPINFRAMES;
      } else {
        pooledRectangle.mesh.material = pooledRectangle.lambertMaterial;
      }
    }

    if (resetTheSpinThingy) {
      pooledRectangle.startCountdown = SPINFRAMES;
      resetTheSpinThingy = false;
      doTheSpinThingy = true;
    }
    if (doTheSpinThingy) pooledRectangle.startCountdown--;
    if (pooledRectangle.startCountdown === -1) doTheSpinThingy = false;

    pooledRectangle.mesh.isLine = false;
    pooledRectangle.mesh.isRectangle = true;
    pooledRectangle.mesh.isBox = false;
    pooledRectangle.mesh.isCylinder = false;
    pooledRectangle.mesh.isAmbientLight = false;
    pooledRectangle.mesh.isPointLight = false;
    pooledRectangle.mesh.isSphere = 0;
    pooledRectangle.mesh.doubleSided = true;


    usedRectangles++;

    if (doTheSpinThingy && pooledRectangle.startCountdown > 0) {
      pushMatrix();
      rotate(pooledRectangle.startCountdown / 50);
      log(""+pooledRectangle.startCountdown);
    }

    pooledRectangle.mesh.matrixAutoUpdate = false;
    pooledRectangle.mesh.matrix.copy(worldMatrix);
    pooledRectangle.mesh.matrixWorldNeedsUpdate = true;

    if (doTheSpinThingy && pooledRectangle.startCountdown > 0) {
      popMatrix();
    }

    if (a !== 1 || b !== 1) {
      pooledRectangle.mesh.matrix.scale(new THREE.Vector3(a, b, 1));
    }

    if (newRectCreated) scene.add(pooledRectangle.mesh);

  }

}


var box = function(a, b, c) {
  // simple case - if there is no fill and
  // no stroke then there is nothing to do.
  var startIndex = 0;
  var endIndex = 0;

  if (!doFill && !doStroke) {
    return;
  }
  // if the wireframe is not going to be visible on top of the
  // fill then don't draw it
  else if ((doFill && (currentStrokeSize === 0 || !doStroke || (currentStrokeSize <= 1 && !defaultNormalFill && !defaultNormalStroke && currentStrokeColor === currentFillColor && currentFillAlpha === 1 && currentStrokeAlpha === 1))) || (currentStrokeSize <= 1 && defaultNormalFill && defaultNormalStroke)) {
    //if (doStroke) log('smart optimisation, was supposed to do the stroke but not doing it!!');
    startIndex = 0;
    endIndex = 1;
  } else if (!doFill && doStroke) {
    startIndex = 1;
    endIndex = 2;
  } else {
    startIndex = 0;
    endIndex = 2;
  }
//  log("si: " + startIndex + " endI: " + endIndex );
  if (a === undefined) {
    //alert('cube!')
    a = 1;
    b = 1;
    c = 1;
  } else if (arguments.length === 1) {
    b = a;
    c = a;
  }

  var strokeTime = false;
  var colorToBeUsed;
  var alphaToBeUsed;
  var newBoxCreated = false;


  // this is to run the code twice. This should be neater
  // and turned into a function call really.
  for (var fillAndStroke = startIndex; fillAndStroke < endIndex; fillAndStroke++) {
    if (fillAndStroke === 1) {
      strokeTime = true;
      colorToBeUsed = currentStrokeColor;
      alphaToBeUsed = currentStrokeAlpha;
    } else {
      colorToBeUsed = currentFillColor;
      alphaToBeUsed = currentFillAlpha;
    }
    var pooledBox = boxesPool[usedBoxes];
    if (pooledBox === undefined) {
      // each pooled box contains a geometry,
      // a basic material and a lambert material.
      pooledBox = {
        basicMaterial: undefined,
        lambertMaterial: undefined,
        normalMaterial: undefined,
        // the first time we render a mesh we need to
        // render it with the material that takes the
        // bigger buffer space, otherwise the
        // more complicated materials won't show
        // up, see:
        // https://github.com/mrdoob/three.js/issues/1051
        // so we always need to create a normalmaterial
        // and render that material first, in case
        // the user will ever want to use it.
        // Another workaround would be to create a mesh
        // for each different type of material
        neverUsed: true,
        mesh: undefined
      };
      newBoxCreated = true;
      boxesPool.push(pooledBox);
    }
    var applyDefaultNormalColor = false;
    if (!strokeTime) {
      if (defaultNormalFill) {
        applyDefaultNormalColor = true;
      } else {
        applyDefaultNormalColor = false;
      }
    } else {
      if (defaultNormalStroke) {
        applyDefaultNormalColor = true;
      } else {
        applyDefaultNormalColor = false;
      }
    }
    if (pooledBox.neverUsed || (colorToBeUsed === angleColor || applyDefaultNormalColor)) {
      // the first time we render a mesh we need to
      // render it with the material that takes the
      // bigger buffer space, see:
      // https://github.com/mrdoob/three.js/issues/1051
      // Another workaround would be to create a mesh
      // for each different type of material
      pooledBox.neverUsed = false;
      if (pooledBox.normalMaterial === undefined) {
        log("creating normal material");
        pooledBox.normalMaterial = new THREE.MeshNormalMaterial({
          opacity: alphaToBeUsed,
          wireframe: strokeTime,
          wireframeLinewidth: currentStrokeSize
        });
      } else {
        pooledBox.normalMaterial.opacity = alphaToBeUsed;
        pooledBox.normalMaterial.wireframe = strokeTime;
        pooledBox.normalMaterial.wireframeLinewidth = currentStrokeSize;
        pooledBox.normalMaterial.doubleSided = false;
      }
      if (pooledBox.mesh === undefined) {
        pooledBox.mesh = new THREE.Mesh(cubeGeometry, pooledBox.normalMaterial);
        pooledBox.startCountdown = SPINFRAMES;
      } else {
//        log("associating normal material to existing mesh");
        pooledBox.mesh.material = pooledBox.normalMaterial;
      }
    } else if (!lightsAreOn) {
      if (pooledBox.basicMaterial === undefined) {
        pooledBox.basicMaterial = new THREE.MeshBasicMaterial({
          color: colorToBeUsed,
          opacity: alphaToBeUsed,
          wireframe: strokeTime,
          wireframeLinewidth: currentStrokeSize
        });
      } else {
        pooledBox.basicMaterial.color.setHex(colorToBeUsed);
        pooledBox.basicMaterial.opacity = alphaToBeUsed;
        pooledBox.basicMaterial.wireframe = strokeTime;
        pooledBox.basicMaterial.wireframeLinewidth = currentStrokeSize;
        pooledBox.basicMaterial.doubleSided = false;
      }
      if (pooledBox.mesh === undefined) {
        pooledBox.mesh = new THREE.Mesh(cubeGeometry, pooledBox.basicMaterial);
        pooledBox.startCountdown = SPINFRAMES;
      } else {
        pooledBox.mesh.material = pooledBox.basicMaterial;
      }

    }
    // lights are on
    else {
      if (pooledBox.lambertMaterial === undefined) {
        log("creating lambert:"+currentFillColor+" "+currentFillAlpha+" "+ambientColor+" "+reflectValue+" "+refractValue);
        pooledBox.lambertMaterial = new THREE.MeshLambertMaterial({
          color: colorToBeUsed,
          opacity: alphaToBeUsed,
          ambient: ambientColor,
          reflectivity: reflectValue,
          refractionRatio: refractValue,
          wireframe: strokeTime,
          wireframeLinewidth: currentStrokeSize
        });
      } else {
        pooledBox.lambertMaterial.color.setHex(colorToBeUsed);
        pooledBox.lambertMaterial.opacity = alphaToBeUsed;
        pooledBox.lambertMaterial.wireframe = strokeTime;
        pooledBox.lambertMaterial.wireframeLinewidth = currentStrokeSize;
        pooledBox.lambertMaterial.doubleSided = false;
        pooledBox.lambertMaterial.ambient.setHex(ambientColor);
        pooledBox.lambertMaterial.reflectivity = reflectValue;
        pooledBox.lambertMaterial.refractionRatio = refractValue;
      }
      if (pooledBox.mesh === undefined) {
        pooledBox.mesh = new THREE.Mesh(cubeGeometry, pooledBox.lambertMaterial);
        pooledBox.startCountdown = SPINFRAMES;
      } else {
        pooledBox.mesh.material = pooledBox.lambertMaterial;
      }
    }

    if (resetTheSpinThingy) {
      pooledBox.startCountdown = SPINFRAMES;
      resetTheSpinThingy = false;
      doTheSpinThingy = true;
    }
    if (doTheSpinThingy) pooledBox.startCountdown--;
    if (pooledBox.startCountdown === -1) doTheSpinThingy = false;

    pooledBox.mesh.isLine = false;
    pooledBox.mesh.isRectangle = false;
    pooledBox.mesh.isBox = true;
    pooledBox.mesh.isCylinder = false;
    pooledBox.mesh.isAmbientLight = false;
    pooledBox.mesh.isPointLight = false;
    pooledBox.mesh.isSphere = 0;
    pooledBox.mesh.doubleSided = false;


    usedBoxes++;

    if (doTheSpinThingy && pooledBox.startCountdown > 0) {
      pushMatrix();
      rotate(pooledBox.startCountdown / 50);
      log(""+pooledBox.startCountdown);
    }

    pooledBox.mesh.matrixAutoUpdate = false;
    pooledBox.mesh.matrix.copy(worldMatrix);
    pooledBox.mesh.matrixWorldNeedsUpdate = true;

    if (doTheSpinThingy && pooledBox.startCountdown > 0) {
      popMatrix();
    }

    // TODO: meshes should be built from geometries that are
    // ever so slight larger than the "fill" mesh so there
    // is no z-fighting...
    // constant 0.001 below is to avoid z-fighting
    if (a !== 1 || b !== 1 || c !== 1) {
      if (!strokeTime) pooledBox.mesh.matrix.scale(new THREE.Vector3(a, b, c));
      else pooledBox.mesh.matrix.scale(new THREE.Vector3(a + 0.001, b + 0.001, c + 0.001));
    }

    if (newBoxCreated) scene.add(pooledBox.mesh);
  }


}


var peg = function(a, b, c) {
  // simple case - if there is no fill and
  // no stroke then there is nothing to do.
  var startIndex = 0;
  var endIndex = 0;

  if (!doFill && !doStroke) {
    return;
  }
  // if the wireframe is not going to be visible on top of the
  // fill then don't draw it
  else if ((doFill && (currentStrokeSize === 0 || !doStroke || (currentStrokeSize <= 1 && !defaultNormalFill && !defaultNormalStroke && currentStrokeColor === currentFillColor && currentFillAlpha === 1 && currentStrokeAlpha === 1))) || (currentStrokeSize <= 1 && defaultNormalFill && defaultNormalStroke)) {
    //if (doStroke) log('smart optimisation, was supposed to do the stroke but not doing it!!');
    startIndex = 0;
    endIndex = 1;
  } else if (!doFill && doStroke) {
    startIndex = 1;
    endIndex = 2;
  } else {
    startIndex = 0;
    endIndex = 2;
  }
//  log("si: " + startIndex + " endI: " + endIndex );
  if (a === undefined) {
    //alert('cube!')
    a = 1;
    b = 1;
    c = 1;
  } else if (arguments.length === 1) {
    b = a;
    c = a;
  }

  var strokeTime = false;
  var colorToBeUsed;
  var alphaToBeUsed;
  var newCylinderCreated = false;


  // this is to run the code twice. This should be neater
  // and turned into a function call really.
  for (var fillAndStroke = startIndex; fillAndStroke < endIndex; fillAndStroke++) {
    if (fillAndStroke === 1) {
      strokeTime = true;
      colorToBeUsed = currentStrokeColor;
      alphaToBeUsed = currentStrokeAlpha;
    } else {
      colorToBeUsed = currentFillColor;
      alphaToBeUsed = currentFillAlpha;
    }
    var pooledCylinder = cylindersPool[usedCylinders];
    if (pooledCylinder === undefined) {
      // each pooled cylinder contains a geometry,
      // a basic material and a lambert material.
      pooledCylinder = {
        basicMaterial: undefined,
        lambertMaterial: undefined,
        normalMaterial: undefined,
        // the first time we render a mesh we need to
        // render it with the material that takes the
        // bigger buffer space, otherwise the
        // more complicated materials won't show
        // up, see:
        // https://github.com/mrdoob/three.js/issues/1051
        // so we always need to create a normalmaterial
        // and render that material first, in case
        // the user will ever want to use it.
        // Another workaround would be to create a mesh
        // for each different type of material
        neverUsed: true,
        mesh: undefined
      };
      newCylinderCreated = true;
      cylindersPool.push(pooledCylinder);
    }
    var applyDefaultNormalColor = false;
    if (!strokeTime) {
      if (defaultNormalFill) {
        applyDefaultNormalColor = true;
      } else {
        applyDefaultNormalColor = false;
      }
    } else {
      if (defaultNormalStroke) {
        applyDefaultNormalColor = true;
      } else {
        applyDefaultNormalColor = false;
      }
    }
    if (pooledCylinder.neverUsed || (colorToBeUsed === angleColor || applyDefaultNormalColor)) {
      // the first time we render a mesh we need to
      // render it with the material that takes the
      // bigger buffer space, see:
      // https://github.com/mrdoob/three.js/issues/1051
      // Another workaround would be to create a mesh
      // for each different type of material
      pooledCylinder.neverUsed = false;
      if (pooledCylinder.normalMaterial === undefined) {
        log("creating normal material");
        pooledCylinder.normalMaterial = new THREE.MeshNormalMaterial({
          opacity: alphaToBeUsed,
          wireframe: strokeTime,
          wireframeLinewidth: currentStrokeSize,
        });
      } else {
        pooledCylinder.normalMaterial.opacity = alphaToBeUsed;
        pooledCylinder.normalMaterial.wireframe = strokeTime;
        pooledCylinder.normalMaterial.wireframeLinewidth = currentStrokeSize;
        pooledCylinder.normalMaterial.doubleSided = false;
      }
      if (pooledCylinder.mesh === undefined) {
        pooledCylinder.mesh = new THREE.Mesh(cylinderGeometry, pooledCylinder.normalMaterial);
        pooledCylinder.startCountdown = SPINFRAMES;
      } else {
////        log("associating normal material to existing mesh");
        pooledCylinder.mesh.material = pooledCylinder.normalMaterial;
      }
    } else if (!lightsAreOn) {
      if (pooledCylinder.basicMaterial === undefined) {
        pooledCylinder.basicMaterial = new THREE.MeshBasicMaterial({
          color: colorToBeUsed,
          opacity: alphaToBeUsed,
          wireframe: strokeTime,
          wireframeLinewidth: currentStrokeSize,
        });
      } else {
        pooledCylinder.basicMaterial.color.setHex(colorToBeUsed);
        pooledCylinder.basicMaterial.opacity = alphaToBeUsed;
        pooledCylinder.basicMaterial.wireframe = strokeTime;
        pooledCylinder.basicMaterial.wireframeLinewidth = currentStrokeSize;
        pooledCylinder.basicMaterial.doubleSided = false;
      }
      if (pooledCylinder.mesh === undefined) {
        pooledCylinder.mesh = new THREE.Mesh(cylinderGeometry, pooledCylinder.basicMaterial);
        pooledCylinder.startCountdown = SPINFRAMES;
      } else {
        pooledCylinder.mesh.material = pooledCylinder.basicMaterial;
      }

    }
    // lights are on
    else {
      if (pooledCylinder.lambertMaterial === undefined) {
        log("creating lambert:"+currentFillColor+" "+currentFillAlpha+" "+ambientColor+" "+reflectValue+" "+refractValue);
        pooledCylinder.lambertMaterial = new THREE.MeshLambertMaterial({
          color: colorToBeUsed,
          opacity: alphaToBeUsed,
          ambient: ambientColor,
          reflectivity: reflectValue,
          refractionRatio: refractValue,
          wireframe: strokeTime,
          wireframeLinewidth: currentStrokeSize,
        });
      } else {
        pooledCylinder.lambertMaterial.color.setHex(colorToBeUsed);
        pooledCylinder.lambertMaterial.opacity = alphaToBeUsed;
        pooledCylinder.lambertMaterial.wireframe = strokeTime;
        pooledCylinder.lambertMaterial.wireframeLinewidth = currentStrokeSize;
        pooledCylinder.lambertMaterial.doubleSided = false;
        pooledCylinder.lambertMaterial.ambient.setHex(ambientColor);
        pooledCylinder.lambertMaterial.reflectivity = reflectValue;
        pooledCylinder.lambertMaterial.refractionRatio = refractValue;
      }
      if (pooledCylinder.mesh === undefined) {
        pooledCylinder.mesh = new THREE.Mesh(cylinderGeometry, pooledCylinder.lambertMaterial);
        pooledCylinder.startCountdown = SPINFRAMES;
      } else {
        pooledCylinder.mesh.material = pooledCylinder.lambertMaterial;
      }
    }

    if (resetTheSpinThingy) {
      pooledCylinder.startCountdown = SPINFRAMES;
      resetTheSpinThingy = false;
      doTheSpinThingy = true;
    }
    if (doTheSpinThingy) pooledCylinder.startCountdown--;
    if (pooledCylinder.startCountdown === -1) doTheSpinThingy = false;

    pooledCylinder.mesh.isLine = false;
    pooledCylinder.mesh.isRectangle = false;
    pooledCylinder.mesh.isBox = false;
    pooledCylinder.mesh.isCylinder = true;
    pooledCylinder.mesh.isAmbientLight = false;
    pooledCylinder.mesh.isPointLight = false;
    pooledCylinder.mesh.isSphere = 0;
    pooledCylinder.mesh.doubleSided = false;


    usedCylinders++;

    if (doTheSpinThingy && pooledCylinder.startCountdown > 0) {
      pushMatrix();
      rotate(pooledCylinder.startCountdown / 50);
      log(""+pooledCylinder.startCountdown);      
    }

    pooledCylinder.mesh.matrixAutoUpdate = false;
    pooledCylinder.mesh.matrix.copy(worldMatrix);
    pooledCylinder.mesh.matrixWorldNeedsUpdate = true;

    if (doTheSpinThingy && pooledCylinder.startCountdown > 0) {
      popMatrix();
    }

    // TODO: meshes should be built from geometries that are
    // ever so slight larger than the "fill" mesh so there
    // is no z-fighting...
    // constant 0.001 below is to avoid z-fighting
    if (a !== 1 || b !== 1 || c !== 1) {
      if (!strokeTime) pooledCylinder.mesh.matrix.scale(new THREE.Vector3(a, b, c));
      else pooledCylinder.mesh.matrix.scale(new THREE.Vector3(a + 0.001, b + 0.001, c + 0.001));
    }

    if (newCylinderCreated) scene.add(pooledCylinder.mesh);
  }


}


var ballDetail = function(a) {
  if (a === undefined) return;
  if (a < 2) a = 2;
  if (a > 30) a = 30;
  ballDetLevel = a;
}

var ball = function(a) {
  var pooledSphereGeometry;
  // simple case - if there is no fill and
  // no stroke then there is nothing to do.
  var startIndex = 0;
  var endIndex = 0;

  log("fill: "+doFill+" stroke: "+doStroke+" fillCol " + currentFillColor + " stroke col " + currentStrokeColor + " fill alpha " + currentFillAlpha);
  if (!doFill && !doStroke) {
    return;
  }
  // if the wireframe is not going to be visible on top of the
  // fill then don't draw it
  else if ((doFill && (currentStrokeSize === 0 || !doStroke || (currentStrokeSize <= 1 && !defaultNormalFill && !defaultNormalStroke && currentStrokeColor === currentFillColor && currentFillAlpha === 1 && currentStrokeAlpha === 1))) || (currentStrokeSize <= 1 && defaultNormalFill && defaultNormalStroke)) {
    //if (doStroke) log('smart optimisation, was supposed to do the stroke but not doing it!!');
    startIndex = 0;
    endIndex = 1;
  } else if (!doFill && doStroke) {
    startIndex = 1;
    endIndex = 2;
  } else {
    startIndex = 0;
    endIndex = 2;
  }
//  log("si: " + startIndex + " endI: " + endIndex );
  if (a === undefined) {
    //alert('ball!')
    a = 1;
  }

  var strokeTime = false;
  var colorToBeUsed;
  var alphaToBeUsed;
  var newSphereCreated = false;


  // this is to run the code twice. This should be neater
  // and turned into a function call really.
  for (var fillAndStroke = startIndex; fillAndStroke < endIndex; fillAndStroke++) {
    if (fillAndStroke === 1) {
      strokeTime = true;
      colorToBeUsed = currentStrokeColor;
      alphaToBeUsed = currentStrokeAlpha;
    } else {
      colorToBeUsed = currentFillColor;
      alphaToBeUsed = currentFillAlpha;
    }
    if (spheresPool['' + ballDetLevel] === undefined) {
      spheresPool['' + ballDetLevel] = [];
      log('creating pool for ball det level ' + ballDetLevel);
    }
    if (usedSpheres['' + ballDetLevel] === undefined) {
      usedSpheres['' + ballDetLevel] = 0;
      log('creating counter for ball det level ' + ballDetLevel);
    }
    var pooledSphere = spheresPool['' + ballDetLevel][usedSpheres['' + ballDetLevel]];
    if (pooledSphere === undefined) {
      // each pooled sphere contains a geometry,
      // a basic material and a lambert material.
      pooledSphere = {
        basicMaterial: undefined,
        lambertMaterial: undefined,
        normalMaterial: undefined,
        // the first time we render a mesh we need to
        // render it with the material that takes the
        // bigger buffer space, otherwise the
        // more complicated materials won't show
        // up, see:
        // https://github.com/mrdoob/three.js/issues/1051
        // so we always need to create a normalmaterial
        // and render that material first, in case
        // the user will ever want to use it.
        // Another workaround would be to create a mesh
        // for each different type of material
        neverUsed: true,
        mesh: undefined
      };
      newSphereCreated = true;
      spheresPool['' + ballDetLevel].push(pooledSphere);
      log('making space for pool for sphere , size of pool for spheres of detail ' + ballDetLevel + ' is ' + spheresPool[''+ballDetLevel].length);
    }
    var applyDefaultNormalColor = false;
    if (!strokeTime) {
      if (defaultNormalFill) {
        applyDefaultNormalColor = true;
      } else {
        applyDefaultNormalColor = false;
      }
    } else {
      if (defaultNormalStroke) {
        applyDefaultNormalColor = true;
      } else {
        applyDefaultNormalColor = false;
      }
    }
    if (pooledSphere.neverUsed || (colorToBeUsed === angleColor || applyDefaultNormalColor)) {
      // the first time we render a mesh we need to
      // render it with the material that takes the
      // bigger buffer space, see:
      // https://github.com/mrdoob/three.js/issues/1051
      // Another workaround would be to create a mesh
      // for each different type of material
      pooledSphere.neverUsed = false;
      if (pooledSphere.normalMaterial === undefined) {
        log("creating normal material");
        pooledSphere.normalMaterial = new THREE.MeshNormalMaterial({
          opacity: alphaToBeUsed,
          wireframe: strokeTime,
          wireframeLinewidth: currentStrokeSize,
        });
      } else {
        pooledSphere.normalMaterial.opacity = alphaToBeUsed;
        pooledSphere.normalMaterial.wireframe = strokeTime;
        pooledSphere.normalMaterial.wireframeLinewidth = currentStrokeSize;
        pooledSphere.normalMaterial.doubleSided = false;
      }
      if (pooledSphere.mesh === undefined) {
        pooledSphereGeometry = sphereGeometriesPool['' + ballDetLevel];
        if (pooledSphereGeometry === undefined) {
          pooledSphereGeometry = new THREE.SphereGeometry(1, ballDetLevel, ballDetLevel);
          sphereGeometriesPool['' + ballDetLevel] = pooledSphereGeometry;
          log('creating ball geometry of detail ' + ballDetLevel);
        }
        pooledSphere.mesh = new THREE.Mesh(pooledSphereGeometry, pooledSphere.normalMaterial);
        pooledSphere.startCountdown = SPINFRAMES;
      } else {
//        log("associating normal material to existing mesh");
        pooledSphere.mesh.material = pooledSphere.normalMaterial;
      }
    } else if (!lightsAreOn) {
      if (pooledSphere.basicMaterial === undefined) {
        pooledSphere.basicMaterial = new THREE.MeshBasicMaterial({
          color: colorToBeUsed,
          opacity: alphaToBeUsed,
          wireframe: strokeTime,
          wireframeLinewidth: currentStrokeSize,
        });
      } else {
        pooledSphere.basicMaterial.color.setHex(colorToBeUsed);
        pooledSphere.basicMaterial.opacity = alphaToBeUsed;
        pooledSphere.basicMaterial.wireframe = strokeTime;
        pooledSphere.basicMaterial.wireframeLinewidth = currentStrokeSize;
        pooledSphere.basicMaterial.doubleSided = false;
      }
      if (pooledSphere.mesh === undefined) {
        pooledSphereGeometry = sphereGeometriesPool['' + ballDetLevel];
        if (pooledSphereGeometry === undefined) {
          pooledSphereGeometry = new THREE.SphereGeometry(1, ballDetLevel, ballDetLevel);
          sphereGeometriesPool['' + ballDetLevel] = pooledSphereGeometry;
          log('creating ball geometry of detail ' + ballDetLevel);
        }
        pooledSphere.mesh = new THREE.Mesh(pooledSphereGeometry, pooledSphere.basicMaterial);
        pooledSphere.startCountdown = SPINFRAMES;
      } else {
        pooledSphere.mesh.material = pooledSphere.basicMaterial;
      }

    }
    // lights are on
    else {
      if (pooledSphere.lambertMaterial === undefined) {
        log("creating lambert:"+currentFillColor+" "+currentFillAlpha+" "+ambientColor+" "+reflectValue+" "+refractValue);
        pooledSphere.lambertMaterial = new THREE.MeshLambertMaterial({
          color: colorToBeUsed,
          opacity: alphaToBeUsed,
          ambient: ambientColor,
          reflectivity: reflectValue,
          refractionRatio: refractValue,
          wireframe: strokeTime,
          wireframeLinewidth: currentStrokeSize,
        });
      } else {
        pooledSphere.lambertMaterial.color.setHex(colorToBeUsed);
        pooledSphere.lambertMaterial.opacity = alphaToBeUsed;
        pooledSphere.lambertMaterial.wireframe = strokeTime;
        pooledSphere.lambertMaterial.wireframeLinewidth = currentStrokeSize;
        pooledSphere.lambertMaterial.doubleSided = false;
        pooledSphere.lambertMaterial.ambient.setHex(ambientColor);
        pooledSphere.lambertMaterial.reflectivity = reflectValue;
        pooledSphere.lambertMaterial.refractionRatio = refractValue;
      }
      if (pooledSphere.mesh === undefined) {
        pooledSphereGeometry = sphereGeometriesPool['' + ballDetLevel];
        if (pooledSphereGeometry === undefined) {
          pooledSphereGeometry = new THREE.SphereGeometry(1, ballDetLevel, ballDetLevel);
          sphereGeometriesPool['' + ballDetLevel] = pooledSphereGeometry;
          log('creating ball geometry of detail ' + ballDetLevel);
        }
        pooledSphere.mesh = new THREE.Mesh(pooledSphereGeometry, pooledSphere.lambertMaterial);
        pooledSphere.startCountdown = SPINFRAMES;
      } else {
        pooledSphere.mesh.material = pooledSphere.lambertMaterial;
      }
    }

    if (resetTheSpinThingy) {
      pooledSphere.startCountdown = SPINFRAMES;
      resetTheSpinThingy = false;
      doTheSpinThingy = true;
    }
    if (doTheSpinThingy) pooledSphere.startCountdown--;
    if (pooledSphere.startCountdown === -1) doTheSpinThingy = false;

    pooledSphere.mesh.isLine = false;
    pooledSphere.mesh.isRectangle = false;
    pooledSphere.mesh.isBox = false;
    pooledSphere.mesh.isCylinder = false;
    pooledSphere.mesh.isAmbientLight = false;
    pooledSphere.mesh.isPointLight = false;
    pooledSphere.mesh.isSphere = ballDetLevel;
    pooledSphere.mesh.doubleSided = false;


    usedSpheres['' + ballDetLevel] = usedSpheres['' + ballDetLevel] + 1;

    if (doTheSpinThingy && pooledSphere.startCountdown > 0) {
      pushMatrix();
      rotate(pooledSphere.startCountdown / 50);
      log(""+pooledSphere.startCountdown);
    }

    pooledSphere.mesh.matrixAutoUpdate = false;
    pooledSphere.mesh.matrix.copy(worldMatrix);
    pooledSphere.mesh.matrixWorldNeedsUpdate = true;

    if (doTheSpinThingy && pooledSphere.startCountdown > 0) {
      popMatrix();
    }

    // TODO: meshes should be built from geometries that are
    // ever so slight larger than the "fill" mesh so there
    // is no z-fighting...
    // constant 0.001 below is to avoid z-fighting
    if (a !== 1) {
      if (!strokeTime) pooledSphere.mesh.matrix.scale(new THREE.Vector3(a, a, a));
      else pooledSphere.mesh.matrix.scale(new THREE.Vector3(a + 0.001, a + 0.001, a + 0.001));
    }

    if (newSphereCreated) scene.add(pooledSphere.mesh);
  }


}
