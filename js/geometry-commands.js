// TODO Note that lines have a "solid fill" mode
// and something similar to the normalMaterial mode
// but there is no equivalent to the lambert material
// mode.
// That could be done by somehow mixing the color of
// an ambient light to the color of the stroke
// (although which ambient light do you pick if there
// is more than one?)
var line = function(a,b,c) {
  
  // primitive-specific initialisations:
  var thisGometryCanFill = false;
  var thisGometryCanStroke = true;
  var primitiveType = GEOM_TYPE_LINE;
  // end of primitive-specific initialisations:

  // b and c are not functional in some geometric
  // primitives, but we handle them here in all cases
  // to make the code uniform and unifiable
  if (a === undefined) {
    a = 1;
    b = 1;
    c = 1;
  } else if (arguments.length === 1) {
    b = a;
    c = a;
  }

  // simple case - if there is no fill and
  // no stroke then there is nothing to do.
  var startIndex = 0;
  var endIndex = 0;

  if (!doStroke && (!doFill || !thisGometryCanFill)) {
    return;
  }
  // if the wireframe is not going to be visible on top of the
  // fill then don't draw it
  else if ((doFill && (currentStrokeSize === 0 || !doStroke || (currentStrokeSize <= 1 && !defaultNormalFill && !defaultNormalStroke && currentStrokeColor === currentFillColor && currentFillAlpha === 1 && currentStrokeAlpha === 1))) || (currentStrokeSize <= 1 && defaultNormalFill && defaultNormalStroke)) {
    //if (doStroke) logger('smart optimisation, was supposed to do the stroke but not doing it!!');
    startIndex = 0;
    endIndex = 1;
  } else if (!doFill && doStroke) {
    startIndex = 1;
    endIndex = 2;
  } else {
    startIndex = 0;
    endIndex = 2;
  }

  var mesh = objectPool[primitiveType][objectsUsedInFrameCounts[primitiveType]];
  if (mesh === undefined) {
    var lineBasicMaterialCOL = new THREE.LineBasicMaterial({
      //color: currentStrokeColor,
      opacity: currentStrokeAlpha,
      linewidth: currentStrokeSize
    });

    mesh = new THREE.Line(geometriesBank[primitiveType], lineBasicMaterialCOL);
    mesh.isLine = true;
    mesh.isRectangle = false;
    mesh.isBox = false;
    mesh.isCylinder = false;
    mesh.isAmbientLight = false;
    mesh.isPointLight = false;
    mesh.isSphere = 0;
    objectPool[primitiveType].push(mesh);
    scene.add(mesh);
  } else {
    //mesh.geometry = geometriesBank[primitiveType];
    //mesh.material = lineBasicMaterialCOL;
    //mesh.material.color.setHex(currentStrokeColor);
    mesh.material.opacity = currentStrokeAlpha;
    mesh.material.linewidth = currentStrokeSize;
  }
  objectsUsedInFrameCounts[primitiveType]++;

  // old unpooled mechanism
  //var mesh = new THREE.Line(geometriesBank[primitiveType], lineBasicMaterialCOL);
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
    //logger(sasaas.x+ " " + sasaas.y + " " + sasaas.z);
    mesh.material.color.setHex(color(((sasaas.x + 1) / 2) * 255, ((sasaas.y + 1) / 2) * 255, ((sasaas.z + 1) / 2) * 255));
  } else {
    mesh.material.color.setHex(currentStrokeColor);
  }

}


var rect = function(a,b,c) {

  // primitive-specific initialisations:
  var thisGometryCanFill = true;
  var thisGometryCanStroke = true;
  var primitiveType = GEOM_TYPE_RECT;
  var isLine = false;
  var isRectangle = true;
  var isBox = false;
  var isCylinder = false;
  var isAmbientLight = false;
  var isPointLight = false;
  var isSphere = 0;
  var doubleSided = true;
  // end of primitive-specific initialisations:

  // b and c are not functional in some geometric
  // primitives, but we handle them here in all cases
  // to make the code uniform and unifiable
  if (a === undefined) {
    a = 1;
    b = 1;
    c = 1;
  } else if (arguments.length === 1) {
    b = a;
    c = a;
  }

  // simple case - if there is no fill and
  // no stroke then there is nothing to do.
  var startIndex = 0;
  var endIndex = 0;

  if (!doStroke && (!doFill || !thisGometryCanFill)) {
    return;
  }
  // if the wireframe is not going to be visible on top of the
  // fill then don't draw it
  else if ((doFill && (currentStrokeSize === 0 || !doStroke || (currentStrokeSize <= 1 && !defaultNormalFill && !defaultNormalStroke && currentStrokeColor === currentFillColor && currentFillAlpha === 1 && currentStrokeAlpha === 1))) || (currentStrokeSize <= 1 && defaultNormalFill && defaultNormalStroke)) {
    //if (doStroke) logger('smart optimisation, was supposed to do the stroke but not doing it!!');
    startIndex = 0;
    endIndex = 1;
  } else if (!doFill && doStroke) {
    startIndex = 1;
    endIndex = 2;
  } else {
    startIndex = 0;
    endIndex = 2;
  }

  var strokeTime = false;
  var colorToBeUsed;
  var alphaToBeUsed;
  var newGeometricObjectCreated = false;

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
    var pooledObject = objectPool[primitiveType][objectsUsedInFrameCounts[primitiveType]];
    if (pooledObject === undefined) {
      // each pooled rectangle contains a geometry,
      // a basic material and a lambert material.
      pooledObject = {
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
      newGeometricObjectCreated = true;
      objectPool[primitiveType].push(pooledObject);
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
    if (pooledObject.neverUsed || (colorToBeUsed === angleColor || applyDefaultNormalColor)) {
      // the first time we render a mesh we need to
      // render it with the material that takes the
      // bigger buffer space, see:
      // https://github.com/mrdoob/three.js/issues/1051
      // Another workaround would be to create a mesh
      // for each different type of material
      pooledObject.neverUsed = false;
      if (pooledObject.normalMaterial === undefined) {
        logger("creating normal material");
        pooledObject.normalMaterial = new THREE.MeshNormalMaterial({
          opacity: alphaToBeUsed,
          wireframe: strokeTime,
          wireframeLinewidth: currentStrokeSize
        });
      } else {
        pooledObject.normalMaterial.opacity = alphaToBeUsed;
        pooledObject.normalMaterial.wireframe = strokeTime;
        pooledObject.normalMaterial.doubleSided = true;
        pooledObject.normalMaterial.wireframeLinewidth = currentStrokeSize;
      }
      if (pooledObject.mesh === undefined) {
        pooledObject.mesh = new THREE.Mesh(geometriesBank[primitiveType], pooledObject.normalMaterial);
        pooledObject.startCountdown = SPINFRAMES;
      } else {
//        logger("associating normal material to existing mesh");
        pooledObject.mesh.material = pooledObject.normalMaterial;
      }
    } else if (!lightsAreOn) {
      if (pooledObject.basicMaterial === undefined) {
        pooledObject.basicMaterial = new THREE.MeshBasicMaterial({
          color: colorToBeUsed,
          opacity: alphaToBeUsed,
          wireframe: strokeTime,
          wireframeLinewidth: currentStrokeSize
        });
      } else {
        pooledObject.basicMaterial.color.setHex(colorToBeUsed);
        pooledObject.basicMaterial.opacity = alphaToBeUsed;
        pooledObject.basicMaterial.wireframe = strokeTime;
        pooledObject.basicMaterial.doubleSided = true;
        pooledObject.basicMaterial.wireframeLinewidth = currentStrokeSize;
      }
      if (pooledObject.mesh === undefined) {
        pooledObject.mesh = new THREE.Mesh(geometriesBank[primitiveType], pooledObject.basicMaterial);
        pooledObject.startCountdown = SPINFRAMES;
      } else {
        pooledObject.mesh.material = pooledObject.basicMaterial;
      }

    }
    // lights are on
    else {
      if (pooledObject.lambertMaterial === undefined) {
        logger("creating lambert:"+currentFillColor+" "+currentFillAlpha+" "+ambientColor+" "+reflectValue+" "+refractValue);
        pooledObject.lambertMaterial = new THREE.MeshLambertMaterial({
          color: colorToBeUsed,
          opacity: alphaToBeUsed,
          ambient: ambientColor,
          reflectivity: reflectValue,
          refractionRatio: refractValue,
          wireframe: strokeTime,
          wireframeLinewidth: currentStrokeSize
        });
      } else {
        pooledObject.lambertMaterial.color.setHex(colorToBeUsed);
        pooledObject.lambertMaterial.opacity = alphaToBeUsed;
        pooledObject.lambertMaterial.wireframe = strokeTime;
        pooledObject.lambertMaterial.wireframeLinewidth = currentStrokeSize;
        pooledObject.lambertMaterial.doubleSided = true;
        pooledObject.lambertMaterial.ambient.setHex(ambientColor);
        pooledObject.lambertMaterial.reflectivity = reflectValue;
        pooledObject.lambertMaterial.refractionRatio = refractValue;
      }
      if (pooledObject.mesh === undefined) {
        pooledObject.mesh = new THREE.Mesh(geometriesBank[primitiveType], pooledObject.lambertMaterial);
        pooledObject.startCountdown = SPINFRAMES;
      } else {
        pooledObject.mesh.material = pooledObject.lambertMaterial;
      }
    }

    if (resetTheSpinThingy) {
      pooledObject.startCountdown = SPINFRAMES;
      resetTheSpinThingy = false;
      doTheSpinThingy = true;
    }
    if (doTheSpinThingy) pooledObject.startCountdown--;
    if (pooledObject.startCountdown === -1) doTheSpinThingy = false;

    pooledObject.mesh.isLine = isLine;
    pooledObject.mesh.isRectangle = isRectangle;
    pooledObject.mesh.isBox = isBox;
    pooledObject.mesh.isCylinder = isCylinder;
    pooledObject.mesh.isAmbientLight = isAmbientLight;
    pooledObject.mesh.isPointLight = isPointLight;
    pooledObject.mesh.isSphere = isSphere;
    pooledObject.mesh.doubleSided = doubleSided;


    objectsUsedInFrameCounts[primitiveType]++;

    if (doTheSpinThingy && pooledObject.startCountdown > 0) {
      pushMatrix();
      rotate(pooledObject.startCountdown / 50);
      logger(pooledObject.startCountdown);
    }

    pooledObject.mesh.matrixAutoUpdate = false;
    pooledObject.mesh.matrix.copy(worldMatrix);
    pooledObject.mesh.matrixWorldNeedsUpdate = true;

    if (doTheSpinThingy && pooledObject.startCountdown > 0) {
      popMatrix();
    }

    // TODO: meshes should be built from geometries that are
    // ever so slight larger than the "fill" mesh so there
    // is no z-fighting...
    // constant 0.001 below is to avoid z-fighting
    if (a !== 1 || b !== 1 || c !== 1) {
      if (!strokeTime) pooledObject.mesh.matrix.scale(new THREE.Vector3(a, b, c));
      else pooledObject.mesh.matrix.scale(new THREE.Vector3(a + 0.001, b + 0.001, c + 0.001));
    }

    if (newGeometricObjectCreated) scene.add(pooledObject.mesh);

  }

}


var box = function(a,b,c) {

  // primitive-specific initialisations:
  var thisGometryCanFill = true;
  var thisGometryCanStroke = true;
  var primitiveType = GEOM_TYPE_BOX;
  var isLine = false;
  var isRectangle = false;
  var isBox = true;
  var isCylinder = false;
  var isAmbientLight = false;
  var isPointLight = false;
  var isSphere = 0;
  var doubleSided = false;
  // end of primitive-specific initialisations:

  // b and c are not functional in some geometric
  // primitives, but we handle them here in all cases
  // to make the code uniform and unifiable
  if (a === undefined) {
    a = 1;
    b = 1;
    c = 1;
  } else if (arguments.length === 1) {
    b = a;
    c = a;
  }

  // simple case - if there is no fill and
  // no stroke then there is nothing to do.
  var startIndex = 0;
  var endIndex = 0;

  if (!doStroke && (!doFill || !thisGometryCanFill)) {
    return;
  }
  // if the wireframe is not going to be visible on top of the
  // fill then don't draw it
  else if ((doFill && (currentStrokeSize === 0 || !doStroke || (currentStrokeSize <= 1 && !defaultNormalFill && !defaultNormalStroke && currentStrokeColor === currentFillColor && currentFillAlpha === 1 && currentStrokeAlpha === 1))) || (currentStrokeSize <= 1 && defaultNormalFill && defaultNormalStroke)) {
    //if (doStroke) logger('smart optimisation, was supposed to do the stroke but not doing it!!');
    startIndex = 0;
    endIndex = 1;
  } else if (!doFill && doStroke) {
    startIndex = 1;
    endIndex = 2;
  } else {
    startIndex = 0;
    endIndex = 2;
  }

  var strokeTime = false;
  var colorToBeUsed;
  var alphaToBeUsed;
  var newGeometricObjectCreated = false;

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
    var pooledObject = objectPool[primitiveType][objectsUsedInFrameCounts[primitiveType]];
    if (pooledObject === undefined) {
      // each pooled box contains a geometry,
      // a basic material and a lambert material.
      pooledObject = {
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
      newGeometricObjectCreated = true;
      objectPool[primitiveType].push(pooledObject);
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
    if (pooledObject.neverUsed || (colorToBeUsed === angleColor || applyDefaultNormalColor)) {
      // the first time we render a mesh we need to
      // render it with the material that takes the
      // bigger buffer space, see:
      // https://github.com/mrdoob/three.js/issues/1051
      // Another workaround would be to create a mesh
      // for each different type of material
      pooledObject.neverUsed = false;
      if (pooledObject.normalMaterial === undefined) {
        logger("creating normal material");
        pooledObject.normalMaterial = new THREE.MeshNormalMaterial({
          opacity: alphaToBeUsed,
          wireframe: strokeTime,
          wireframeLinewidth: currentStrokeSize
        });
      } else {
        pooledObject.normalMaterial.opacity = alphaToBeUsed;
        pooledObject.normalMaterial.wireframe = strokeTime;
        pooledObject.normalMaterial.wireframeLinewidth = currentStrokeSize;
        pooledObject.normalMaterial.doubleSided = false;
      }
      if (pooledObject.mesh === undefined) {
        pooledObject.mesh = new THREE.Mesh(geometriesBank[primitiveType], pooledObject.normalMaterial);
        pooledObject.startCountdown = SPINFRAMES;
      } else {
//        logger("associating normal material to existing mesh");
        pooledObject.mesh.material = pooledObject.normalMaterial;
      }
    } else if (!lightsAreOn) {
      if (pooledObject.basicMaterial === undefined) {
        pooledObject.basicMaterial = new THREE.MeshBasicMaterial({
          color: colorToBeUsed,
          opacity: alphaToBeUsed,
          wireframe: strokeTime,
          wireframeLinewidth: currentStrokeSize
        });
      } else {
        pooledObject.basicMaterial.color.setHex(colorToBeUsed);
        pooledObject.basicMaterial.opacity = alphaToBeUsed;
        pooledObject.basicMaterial.wireframe = strokeTime;
        pooledObject.basicMaterial.wireframeLinewidth = currentStrokeSize;
        pooledObject.basicMaterial.doubleSided = false;
      }
      if (pooledObject.mesh === undefined) {
        pooledObject.mesh = new THREE.Mesh(geometriesBank[primitiveType], pooledObject.basicMaterial);
        pooledObject.startCountdown = SPINFRAMES;
      } else {
        pooledObject.mesh.material = pooledObject.basicMaterial;
      }

    }
    // lights are on
    else {
      if (pooledObject.lambertMaterial === undefined) {
        logger("creating lambert:"+currentFillColor+" "+currentFillAlpha+" "+ambientColor+" "+reflectValue+" "+refractValue);
        pooledObject.lambertMaterial = new THREE.MeshLambertMaterial({
          color: colorToBeUsed,
          opacity: alphaToBeUsed,
          ambient: ambientColor,
          reflectivity: reflectValue,
          refractionRatio: refractValue,
          wireframe: strokeTime,
          wireframeLinewidth: currentStrokeSize
        });
      } else {
        pooledObject.lambertMaterial.color.setHex(colorToBeUsed);
        pooledObject.lambertMaterial.opacity = alphaToBeUsed;
        pooledObject.lambertMaterial.wireframe = strokeTime;
        pooledObject.lambertMaterial.wireframeLinewidth = currentStrokeSize;
        pooledObject.lambertMaterial.doubleSided = false;
        pooledObject.lambertMaterial.ambient.setHex(ambientColor);
        pooledObject.lambertMaterial.reflectivity = reflectValue;
        pooledObject.lambertMaterial.refractionRatio = refractValue;
      }
      if (pooledObject.mesh === undefined) {
        pooledObject.mesh = new THREE.Mesh(geometriesBank[primitiveType], pooledObject.lambertMaterial);
        pooledObject.startCountdown = SPINFRAMES;
      } else {
        pooledObject.mesh.material = pooledObject.lambertMaterial;
      }
    }

    if (resetTheSpinThingy) {
      pooledObject.startCountdown = SPINFRAMES;
      resetTheSpinThingy = false;
      doTheSpinThingy = true;
    }
    if (doTheSpinThingy) pooledObject.startCountdown--;
    if (pooledObject.startCountdown === -1) doTheSpinThingy = false;

    pooledObject.mesh.isLine = isLine;
    pooledObject.mesh.isRectangle = isRectangle;
    pooledObject.mesh.isBox = isBox;
    pooledObject.mesh.isCylinder = isCylinder;
    pooledObject.mesh.isAmbientLight = isAmbientLight;
    pooledObject.mesh.isPointLight = isPointLight;
    pooledObject.mesh.isSphere = isSphere;
    pooledObject.mesh.doubleSided = doubleSided;


    objectsUsedInFrameCounts[primitiveType]++;

    if (doTheSpinThingy && pooledObject.startCountdown > 0) {
      pushMatrix();
      rotate(pooledObject.startCountdown / 50);
      logger(pooledObject.startCountdown);
    }

    pooledObject.mesh.matrixAutoUpdate = false;
    pooledObject.mesh.matrix.copy(worldMatrix);
    pooledObject.mesh.matrixWorldNeedsUpdate = true;

    if (doTheSpinThingy && pooledObject.startCountdown > 0) {
      popMatrix();
    }

    // TODO: meshes should be built from geometries that are
    // ever so slight larger than the "fill" mesh so there
    // is no z-fighting...
    // constant 0.001 below is to avoid z-fighting
    if (a !== 1 || b !== 1 || c !== 1) {
      if (!strokeTime) pooledObject.mesh.matrix.scale(new THREE.Vector3(a, b, c));
      else pooledObject.mesh.matrix.scale(new THREE.Vector3(a + 0.001, b + 0.001, c + 0.001));
    }

    if (newGeometricObjectCreated) scene.add(pooledObject.mesh);
  }


}


var peg = function(a,b,c) {

  // primitive-specific initialisations:
  var thisGometryCanFill = true;
  var thisGometryCanStroke = true;
  var primitiveType = GEOM_TYPE_CYLINDER;
  var isLine = false;
  var isRectangle = false;
  var isBox = false;
  var isCylinder = true;
  var isAmbientLight = false;
  var isPointLight = false;
  var isSphere = 0;
  var doubleSided = false;
  // end of primitive-specific initialisations:

  // b and c are not functional in some geometric
  // primitives, but we handle them here in all cases
  // to make the code uniform and unifiable
  if (a === undefined) {
    a = 1;
    b = 1;
    c = 1;
  } else if (arguments.length === 1) {
    b = a;
    c = a;
  }

  // simple case - if there is no fill and
  // no stroke then there is nothing to do.
  var startIndex = 0;
  var endIndex = 0;

  if (!doStroke && (!doFill || !thisGometryCanFill)) {
    return;
  }
  // if the wireframe is not going to be visible on top of the
  // fill then don't draw it
  else if ((doFill && (currentStrokeSize === 0 || !doStroke || (currentStrokeSize <= 1 && !defaultNormalFill && !defaultNormalStroke && currentStrokeColor === currentFillColor && currentFillAlpha === 1 && currentStrokeAlpha === 1))) || (currentStrokeSize <= 1 && defaultNormalFill && defaultNormalStroke)) {
    //if (doStroke) logger('smart optimisation, was supposed to do the stroke but not doing it!!');
    startIndex = 0;
    endIndex = 1;
  } else if (!doFill && doStroke) {
    startIndex = 1;
    endIndex = 2;
  } else {
    startIndex = 0;
    endIndex = 2;
  }

  var strokeTime = false;
  var colorToBeUsed;
  var alphaToBeUsed;
  var newGeometricObjectCreated = false;

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
    var pooledObject = objectPool[primitiveType][objectsUsedInFrameCounts[primitiveType]];
    if (pooledObject === undefined) {
      // each pooled cylinder contains a geometry,
      // a basic material and a lambert material.
      pooledObject = {
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
      newGeometricObjectCreated = true;
      objectPool[primitiveType].push(pooledObject);
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
    if (pooledObject.neverUsed || (colorToBeUsed === angleColor || applyDefaultNormalColor)) {
      // the first time we render a mesh we need to
      // render it with the material that takes the
      // bigger buffer space, see:
      // https://github.com/mrdoob/three.js/issues/1051
      // Another workaround would be to create a mesh
      // for each different type of material
      pooledObject.neverUsed = false;
      if (pooledObject.normalMaterial === undefined) {
        logger("creating normal material");
        pooledObject.normalMaterial = new THREE.MeshNormalMaterial({
          opacity: alphaToBeUsed,
          wireframe: strokeTime,
          wireframeLinewidth: currentStrokeSize,
        });
      } else {
        pooledObject.normalMaterial.opacity = alphaToBeUsed;
        pooledObject.normalMaterial.wireframe = strokeTime;
        pooledObject.normalMaterial.wireframeLinewidth = currentStrokeSize;
        pooledObject.normalMaterial.doubleSided = false;
      }
      if (pooledObject.mesh === undefined) {
        pooledObject.mesh = new THREE.Mesh(geometriesBank[primitiveType], pooledObject.normalMaterial);
        pooledObject.startCountdown = SPINFRAMES;
      } else {
////        logger("associating normal material to existing mesh");
        pooledObject.mesh.material = pooledObject.normalMaterial;
      }
    } else if (!lightsAreOn) {
      if (pooledObject.basicMaterial === undefined) {
        pooledObject.basicMaterial = new THREE.MeshBasicMaterial({
          color: colorToBeUsed,
          opacity: alphaToBeUsed,
          wireframe: strokeTime,
          wireframeLinewidth: currentStrokeSize,
        });
      } else {
        pooledObject.basicMaterial.color.setHex(colorToBeUsed);
        pooledObject.basicMaterial.opacity = alphaToBeUsed;
        pooledObject.basicMaterial.wireframe = strokeTime;
        pooledObject.basicMaterial.wireframeLinewidth = currentStrokeSize;
        pooledObject.basicMaterial.doubleSided = false;
      }
      if (pooledObject.mesh === undefined) {
        pooledObject.mesh = new THREE.Mesh(geometriesBank[primitiveType], pooledObject.basicMaterial);
        pooledObject.startCountdown = SPINFRAMES;
      } else {
        pooledObject.mesh.material = pooledObject.basicMaterial;
      }

    }
    // lights are on
    else {
      if (pooledObject.lambertMaterial === undefined) {
        logger("creating lambert:"+currentFillColor+" "+currentFillAlpha+" "+ambientColor+" "+reflectValue+" "+refractValue);
        pooledObject.lambertMaterial = new THREE.MeshLambertMaterial({
          color: colorToBeUsed,
          opacity: alphaToBeUsed,
          ambient: ambientColor,
          reflectivity: reflectValue,
          refractionRatio: refractValue,
          wireframe: strokeTime,
          wireframeLinewidth: currentStrokeSize,
        });
      } else {
        pooledObject.lambertMaterial.color.setHex(colorToBeUsed);
        pooledObject.lambertMaterial.opacity = alphaToBeUsed;
        pooledObject.lambertMaterial.wireframe = strokeTime;
        pooledObject.lambertMaterial.wireframeLinewidth = currentStrokeSize;
        pooledObject.lambertMaterial.doubleSided = false;
        pooledObject.lambertMaterial.ambient.setHex(ambientColor);
        pooledObject.lambertMaterial.reflectivity = reflectValue;
        pooledObject.lambertMaterial.refractionRatio = refractValue;
      }
      if (pooledObject.mesh === undefined) {
        pooledObject.mesh = new THREE.Mesh(geometriesBank[primitiveType], pooledObject.lambertMaterial);
        pooledObject.startCountdown = SPINFRAMES;
      } else {
        pooledObject.mesh.material = pooledObject.lambertMaterial;
      }
    }

    if (resetTheSpinThingy) {
      pooledObject.startCountdown = SPINFRAMES;
      resetTheSpinThingy = false;
      doTheSpinThingy = true;
    }
    if (doTheSpinThingy) pooledObject.startCountdown--;
    if (pooledObject.startCountdown === -1) doTheSpinThingy = false;

    pooledObject.mesh.isLine = isLine;
    pooledObject.mesh.isRectangle = isRectangle;
    pooledObject.mesh.isBox = isBox;
    pooledObject.mesh.isCylinder = isCylinder;
    pooledObject.mesh.isAmbientLight = isAmbientLight;
    pooledObject.mesh.isPointLight = isPointLight;
    pooledObject.mesh.isSphere = isSphere;
    pooledObject.mesh.doubleSided = doubleSided;


    objectsUsedInFrameCounts[primitiveType]++;

    if (doTheSpinThingy && pooledObject.startCountdown > 0) {
      pushMatrix();
      rotate(pooledObject.startCountdown / 50);
      logger(""+pooledObject.startCountdown);      
    }

    pooledObject.mesh.matrixAutoUpdate = false;
    pooledObject.mesh.matrix.copy(worldMatrix);
    pooledObject.mesh.matrixWorldNeedsUpdate = true;

    if (doTheSpinThingy && pooledObject.startCountdown > 0) {
      popMatrix();
    }

    // TODO: meshes should be built from geometries that are
    // ever so slight larger than the "fill" mesh so there
    // is no z-fighting...
    // constant 0.001 below is to avoid z-fighting
    if (a !== 1 || b !== 1 || c !== 1) {
      if (!strokeTime) pooledObject.mesh.matrix.scale(new THREE.Vector3(a, b, c));
      else pooledObject.mesh.matrix.scale(new THREE.Vector3(a + 0.001, b + 0.001, c + 0.001));
    }

    if (newGeometricObjectCreated) scene.add(pooledObject.mesh);
  }


}


var ballDetail = function(a) {
  if (a === undefined) return;
  if (a < 2) a = 2;
  if (a > 30) a = 30;
  ballDetLevel = a;
}

var ball = function(a,b,c) {

  // primitive-specific initialisations:
  var thisGometryCanFill = true;
  var thisGometryCanStroke = true;
  var primitiveType = GEOM_TYPE_SPHERE + ballDetLevel - minimumBallDetail;
  var isLine = false;
  var isRectangle = false;
  var isBox = false;
  var isCylinder = false;
  var isAmbientLight = false;
  var isPointLight = false;
  var isSphere = ballDetLevel;
  var doubleSided = false;
  // end of primitive-specific initialisations:

  // b and c are not functional in some geometric
  // primitives, but we handle them here in all cases
  // to make the code uniform and unifiable
  if (a === undefined) {
    a = 1;
    b = 1;
    c = 1;
  } else if (arguments.length === 1) {
    b = a;
    c = a;
  }

  // simple case - if there is no fill and
  // no stroke then there is nothing to do.
  var startIndex = 0;
  var endIndex = 0;

  if (!doStroke && (!doFill || !thisGometryCanFill)) {
    return;
  }
  // if the wireframe is not going to be visible on top of the
  // fill then don't draw it
  else if ((doFill && (currentStrokeSize === 0 || !doStroke || (currentStrokeSize <= 1 && !defaultNormalFill && !defaultNormalStroke && currentStrokeColor === currentFillColor && currentFillAlpha === 1 && currentStrokeAlpha === 1))) || (currentStrokeSize <= 1 && defaultNormalFill && defaultNormalStroke)) {
    //if (doStroke) logger('smart optimisation, was supposed to do the stroke but not doing it!!');
    startIndex = 0;
    endIndex = 1;
  } else if (!doFill && doStroke) {
    startIndex = 1;
    endIndex = 2;
  } else {
    startIndex = 0;
    endIndex = 2;
  }

  var strokeTime = false;
  var colorToBeUsed;
  var alphaToBeUsed;
  var newGeometricObjectCreated = false;

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
    var pooledObject = objectPool[primitiveType][objectsUsedInFrameCounts[primitiveType]];
    if (pooledObject === undefined) {
      // each pooled sphere contains a geometry,
      // a basic material and a lambert material.
      pooledObject = {
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
      newGeometricObjectCreated = true;
      objectPool[primitiveType].push(pooledObject);
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
    if (pooledObject.neverUsed || (colorToBeUsed === angleColor || applyDefaultNormalColor)) {
      // the first time we render a mesh we need to
      // render it with the material that takes the
      // bigger buffer space, see:
      // https://github.com/mrdoob/three.js/issues/1051
      // Another workaround would be to create a mesh
      // for each different type of material
      pooledObject.neverUsed = false;
      if (pooledObject.normalMaterial === undefined) {
        logger("creating normal material");
        pooledObject.normalMaterial = new THREE.MeshNormalMaterial({
          opacity: alphaToBeUsed,
          wireframe: strokeTime,
          wireframeLinewidth: currentStrokeSize,
        });
      } else {
        pooledObject.normalMaterial.opacity = alphaToBeUsed;
        pooledObject.normalMaterial.wireframe = strokeTime;
        pooledObject.normalMaterial.wireframeLinewidth = currentStrokeSize;
        pooledObject.normalMaterial.doubleSided = false;
      }
      if (pooledObject.mesh === undefined) {
        pooledObject.mesh = new THREE.Mesh(geometriesBank[primitiveType], pooledObject.normalMaterial);
        pooledObject.startCountdown = SPINFRAMES;
      } else {
//        logger("associating normal material to existing mesh");
        pooledObject.mesh.material = pooledObject.normalMaterial;
      }
    } else if (!lightsAreOn) {
      if (pooledObject.basicMaterial === undefined) {
        pooledObject.basicMaterial = new THREE.MeshBasicMaterial({
          color: colorToBeUsed,
          opacity: alphaToBeUsed,
          wireframe: strokeTime,
          wireframeLinewidth: currentStrokeSize,
        });
      } else {
        pooledObject.basicMaterial.color.setHex(colorToBeUsed);
        pooledObject.basicMaterial.opacity = alphaToBeUsed;
        pooledObject.basicMaterial.wireframe = strokeTime;
        pooledObject.basicMaterial.wireframeLinewidth = currentStrokeSize;
        pooledObject.basicMaterial.doubleSided = false;
      }
      if (pooledObject.mesh === undefined) {
        pooledObject.mesh = new THREE.Mesh(geometriesBank[primitiveType], pooledObject.basicMaterial);
        pooledObject.startCountdown = SPINFRAMES;
      } else {
        pooledObject.mesh.material = pooledObject.basicMaterial;
      }

    }
    // lights are on
    else {
      if (pooledObject.lambertMaterial === undefined) {
        logger("creating lambert:"+currentFillColor+" "+currentFillAlpha+" "+ambientColor+" "+reflectValue+" "+refractValue);
        pooledObject.lambertMaterial = new THREE.MeshLambertMaterial({
          color: colorToBeUsed,
          opacity: alphaToBeUsed,
          ambient: ambientColor,
          reflectivity: reflectValue,
          refractionRatio: refractValue,
          wireframe: strokeTime,
          wireframeLinewidth: currentStrokeSize,
        });
      } else {
        pooledObject.lambertMaterial.color.setHex(colorToBeUsed);
        pooledObject.lambertMaterial.opacity = alphaToBeUsed;
        pooledObject.lambertMaterial.wireframe = strokeTime;
        pooledObject.lambertMaterial.wireframeLinewidth = currentStrokeSize;
        pooledObject.lambertMaterial.doubleSided = false;
        pooledObject.lambertMaterial.ambient.setHex(ambientColor);
        pooledObject.lambertMaterial.reflectivity = reflectValue;
        pooledObject.lambertMaterial.refractionRatio = refractValue;
      }
      if (pooledObject.mesh === undefined) {
        pooledObject.mesh = new THREE.Mesh(geometriesBank[primitiveType], pooledObject.lambertMaterial);
        pooledObject.startCountdown = SPINFRAMES;
      } else {
        pooledObject.mesh.material = pooledObject.lambertMaterial;
      }
    }

    if (resetTheSpinThingy) {
      pooledObject.startCountdown = SPINFRAMES;
      resetTheSpinThingy = false;
      doTheSpinThingy = true;
    }
    if (doTheSpinThingy) pooledObject.startCountdown--;
    if (pooledObject.startCountdown === -1) doTheSpinThingy = false;

    pooledObject.mesh.isLine = isLine;
    pooledObject.mesh.isRectangle = isRectangle;
    pooledObject.mesh.isBox = isBox;
    pooledObject.mesh.isCylinder = isCylinder;
    pooledObject.mesh.isAmbientLight = isAmbientLight;
    pooledObject.mesh.isPointLight = isPointLight;
    pooledObject.mesh.isSphere = isSphere;
    pooledObject.mesh.doubleSided = doubleSided;


    objectsUsedInFrameCounts[primitiveType]++;

    if (doTheSpinThingy && pooledObject.startCountdown > 0) {
      pushMatrix();
      rotate(pooledObject.startCountdown / 50);
      logger(""+pooledObject.startCountdown);
    }

    pooledObject.mesh.matrixAutoUpdate = false;
    pooledObject.mesh.matrix.copy(worldMatrix);
    pooledObject.mesh.matrixWorldNeedsUpdate = true;

    if (doTheSpinThingy && pooledObject.startCountdown > 0) {
      popMatrix();
    }

    // TODO: meshes should be built from geometries that are
    // ever so slight larger than the "fill" mesh so there
    // is no z-fighting...
    // constant 0.001 below is to avoid z-fighting
    if (a !== 1 || b !== 1 || c !== 1) {
      if (!strokeTime) pooledObject.mesh.matrix.scale(new THREE.Vector3(a, b, c));
      else pooledObject.mesh.matrix.scale(new THREE.Vector3(a + 0.001, b + 0.001, c + 0.001));
    }

    if (newGeometricObjectCreated) scene.add(pooledObject.mesh);
  }


}
