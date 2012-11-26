
// Since you can't change the mesh of an object once it's created, we keep around
// a pool of objects for each mesh type. There is one pool for lines, one for rectangles, one
// for boxes. There is one pool for each detail level of spheres (since they are different)
// meshes. For the time being there is no detail level for cylinders so there is only
// one pool for cylinders.

// For how the mechanism works now, all pooled objects end up in the scene graph.
// The scene graph is traversed at each frame and only the used objects are marked as
// visible, the other unused objects are hidden. This is because adding/removing
// objects from the scene is expensive. Note that this might have changed with more
// recent versions of Three.js of the past 4 months.

// All object pools start empty. Note that each sphere detail level must have
// its own pool, because you can't easily change the mesh of an object.
// If one doesn't like the idea of creating dozens of empty arrays that won't ever be
// used (since probably only a few sphere detail levels will be used in a session)
// then one could leave all these arrays undefined and define them at runtime
// only when needed.
var objectPool = [];
objectPool[GEOM_TYPE_LINE] = [];
objectPool[GEOM_TYPE_RECT] = [];
objectPool[GEOM_TYPE_BOX] = [];
objectPool[GEOM_TYPE_CYLINDER] = [];
var creatingSpherePools;
for (creatingSpherePools = 0; creatingSpherePools < (maximumBallDetail - minimumBallDetail + 1); creatingSpherePools++) {
    objectPool[GEOM_TYPE_SPHERE + creatingSpherePools] = [];
}


var geometriesBank = [];
geometriesBank[GEOM_TYPE_LINE] = new THREE.Geometry();
geometriesBank[GEOM_TYPE_LINE].vertices.push(new THREE.Vertex(new THREE.Vector3(0, -0.5, 0)));
geometriesBank[GEOM_TYPE_LINE].vertices.push(new THREE.Vertex(new THREE.Vector3(0, 0.5, 0)));
geometriesBank[GEOM_TYPE_RECT] = new THREE.PlaneGeometry(1, 1);
geometriesBank[GEOM_TYPE_BOX] = new THREE.CubeGeometry(1, 1, 1);
geometriesBank[GEOM_TYPE_CYLINDER] = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
var creatingSphereGeometries;
for (creatingSphereGeometries = 0; creatingSphereGeometries < (maximumBallDetail - minimumBallDetail + 1); creatingSphereGeometries++) {
    geometriesBank[GEOM_TYPE_SPHERE + creatingSphereGeometries] = new THREE.SphereGeometry(1, minimumBallDetail + creatingSphereGeometries, minimumBallDetail + creatingSphereGeometries);
}

var commonPrimitiveDrawingLogic = function(a,b,c,primitiveProperties) {

  var startIndex = 0;
  var endIndex = 0;

  // Simple case - if there is no fill and
  // no stroke then there is nothing to do.
  // Also, even if we aren'd under a noFill command spell, some geometries
  // inherently don't have a fill, so we return if there is no stroke either.
  // (right now that applies only lines).
  if (!doStroke && (!doFill || !primitiveProperties.thisGometryCanFill)) {
    return;
  }
  // if we are under the influence of a noFill command OR
  // the wireframe is not going to be visible on top of the
  // fill then don't draw it
  else if ((doFill && (currentStrokeSize === 0 || !doStroke || (currentStrokeSize <= 1 && !defaultNormalFill && !defaultNormalStroke && currentStrokeColor === currentFillColor && currentFillAlpha === 1 && currentStrokeAlpha === 1))) || (currentStrokeSize <= 1 && defaultNormalFill && defaultNormalStroke)) {
    startIndex = 0;
    endIndex = 1;
  }
  // only doing the stroke
  else if (!doFill && doStroke) {
    startIndex = 1;
    endIndex = 2;
  // doing both the fill and the stroke
  } else {
    startIndex = 0;
    endIndex = 2;
  }

  var strokeTime = false;
  var colorToBeUsed;
  var alphaToBeUsed;
  var newObjectToBeAddedToTheScene = false;

  // this is to run the code twice. This should be neater
  // and turned into a function call really.
  for (var fillAndStroke = startIndex; fillAndStroke < endIndex; fillAndStroke++) {
    var applyDefaultNormalColor = false;
    if (fillAndStroke === 1) {
      strokeTime = true;
      colorToBeUsed = currentStrokeColor;
      alphaToBeUsed = currentStrokeAlpha;
      applyDefaultNormalColor = defaultNormalStroke;
    } else {
      colorToBeUsed = currentFillColor;
      alphaToBeUsed = currentFillAlpha;
      applyDefaultNormalColor = defaultNormalFill;
    }
    var pooledObject = objectPool[primitiveProperties.primitiveType][objectsUsedInFrameCounts[primitiveProperties.primitiveType]];
    if (pooledObject === undefined) {
      // each pooled object contains a geometry,
      // a basic material and a lambert material.
      pooledObject = {
        lineMaterial: undefined,
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
        mesh: new primitiveProperties.THREEConstructor(
           geometriesBank[primitiveProperties.primitiveType]
        ),
        startCountdown: SPINFRAMES
      };
      
      newObjectToBeAddedToTheScene = true;
      objectPool[primitiveProperties.primitiveType].push(pooledObject);
    }

    if (primitiveProperties.primitiveType === GEOM_TYPE_LINE) {
      if (pooledObject.lineMaterial === undefined) {
        logger("creating line material");
        pooledObject.lineMaterial = new THREE.LineBasicMaterial({
					color: currentStrokeColor,
					opacity: currentStrokeAlpha,
					linewidth: currentStrokeSize
				});
      } else {
				pooledObject.lineMaterial.opacity = currentStrokeAlpha;
				pooledObject.lineMaterial.linewidth = currentStrokeSize;
      }
    ////        logger("associating normal material to existing mesh");
    pooledObject.mesh.material = pooledObject.lineMaterial;
		// setting the color after the geometry has been dealt with
		// because in case we use the angleColor then we
		// need to know the geometry.
			if (currentStrokeColor === angleColor || defaultNormalStroke) {
				var sasaas = pooledObject.mesh.matrix.multiplyVector3(new THREE.Vector3(0, 1, 0)).normalize();
				//logger(sasaas.x+ " " + sasaas.y + " " + sasaas.z);
				pooledObject.mesh.material.color.setHex(color(((sasaas.x + 1) / 2) * 255, ((sasaas.y + 1) / 2) * 255, ((sasaas.z + 1) / 2) * 255));
			} else {
				pooledObject.mesh.material.color.setHex(currentStrokeColor);
			}

    }
    else if (newObjectToBeAddedToTheScene || (colorToBeUsed === angleColor || applyDefaultNormalColor)) {
      // the first time we render a mesh we need to
      // render it with the material that takes the
      // bigger buffer space, see:
      // https://github.com/mrdoob/three.js/issues/1051
      // Another workaround would be to create a mesh
      // for each different type of material
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
        pooledObject.normalMaterial.doubleSided = primitiveProperties.doubleSided;
      }
      pooledObject.mesh.material = pooledObject.normalMaterial;
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
        pooledObject.basicMaterial.doubleSided = primitiveProperties.doubleSided;
      }
      pooledObject.mesh.material = pooledObject.basicMaterial;

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
        pooledObject.lambertMaterial.doubleSided = primitiveProperties.doubleSided;
        pooledObject.lambertMaterial.ambient.setHex(ambientColor);
        pooledObject.lambertMaterial.reflectivity = reflectValue;
        pooledObject.lambertMaterial.refractionRatio = refractValue;
      }
      pooledObject.mesh.material = pooledObject.lambertMaterial;
    }

    if (resetTheSpinThingy) {
      pooledObject.startCountdown = SPINFRAMES;
      resetTheSpinThingy = false;
      doTheSpinThingy = true;
    }
    if (doTheSpinThingy) pooledObject.startCountdown--;
    if (pooledObject.startCountdown === -1) doTheSpinThingy = false;

    pooledObject.mesh.isLine = primitiveProperties.isLine;
    pooledObject.mesh.isRectangle = primitiveProperties.isRectangle;
    pooledObject.mesh.isBox = primitiveProperties.isBox;
    pooledObject.mesh.isCylinder = primitiveProperties.isCylinder;
    pooledObject.mesh.isAmbientLight = primitiveProperties.isAmbientLight;
    pooledObject.mesh.isPointLight = primitiveProperties.isPointLight;
    pooledObject.mesh.isSphere = primitiveProperties.isSphere;
    pooledObject.mesh.doubleSided = primitiveProperties.doubleSided;


    objectsUsedInFrameCounts[primitiveProperties.primitiveType]++;

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

    if (newObjectToBeAddedToTheScene) ThreeJs.scene.add(pooledObject.mesh);
  }
}


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
  var primitiveProperties = {
		thisGometryCanFill: false,
		thisGometryCanStroke: true,
		primitiveType: GEOM_TYPE_LINE,
		isLine: true,
		isRectangle: false,
		isBox: false,
		isCylinder: false,
		isAmbientLight: false,
		isPointLight: false,
		isSphere: 0,
		doubleSided: false,
		THREEConstructor: THREE.Line
	}
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

	commonPrimitiveDrawingLogic(a,b,c,primitiveProperties);


}


var rect = function(a,b,c) {

  // primitive-specific initialisations:
  var primitiveProperties = {
		thisGometryCanFill: true,
		thisGometryCanStroke: true,
		primitiveType: GEOM_TYPE_RECT,
		isLine: false,
		isRectangle: true,
		isBox: false,
		isCylinder: false,
		isAmbientLight: false,
		isPointLight: false,
		isSphere: 0,
		doubleSided: true,
		THREEConstructor: THREE.Mesh
	}
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

	commonPrimitiveDrawingLogic(a,b,c,primitiveProperties);

}


var box = function(a,b,c) {

  // primitive-specific initialisations:
  var primitiveProperties = {
		thisGometryCanFill: true,
		thisGometryCanStroke: true,
		primitiveType: GEOM_TYPE_BOX,
		isLine: false,
		isRectangle: false,
		isBox: true,
		isCylinder: false,
		isAmbientLight: false,
		isPointLight: false,
		isSphere: 0,
		doubleSided: false,
		THREEConstructor: THREE.Mesh
	}
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

	commonPrimitiveDrawingLogic(a,b,c,primitiveProperties);
}


var peg = function(a,b,c) {

  // primitive-specific initialisations:
  var primitiveProperties = {
		thisGometryCanFill: true,
		thisGometryCanStroke: true,
		primitiveType: GEOM_TYPE_CYLINDER,
		isLine: false,
		isRectangle: false,
		isBox: false,
		isCylinder: true,
		isAmbientLight: false,
		isPointLight: false,
		isSphere: 0,
		doubleSided: false,
		THREEConstructor: THREE.Mesh
	}
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

	commonPrimitiveDrawingLogic(a,b,c,primitiveProperties);

}


var ballDetail = function(a) {
  if (a === undefined) return;
  if (a < 2) a = 2;
  if (a > 30) a = 30;
  ballDetLevel = Math.round(a);
}

var ball = function(a,b,c) {

  // primitive-specific initialisations:
  var primitiveProperties = {
		thisGometryCanFill: true,
		thisGometryCanStroke: true,
		primitiveType: GEOM_TYPE_SPHERE + ballDetLevel - minimumBallDetail,
		isLine: false,
		isRectangle: false,
		isBox: false,
		isCylinder: false,
		isAmbientLight: false,
		isPointLight: false,
		isSphere: ballDetLevel,
		doubleSided: false,
		THREEConstructor: THREE.Mesh
	}
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

	commonPrimitiveDrawingLogic(a,b,c,primitiveProperties);

}
