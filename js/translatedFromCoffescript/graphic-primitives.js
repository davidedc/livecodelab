var createGraphicsCommands;

createGraphicsCommands = function(liveCodeLabCore_THREE, liveCodeLabCoreInstance) {
  "use strict";

  var GraphicsCommands, SPIN_DURATION_IN_FRAMES, commonPrimitiveDrawingLogic, createObjectIfNeededAndDressWithCorrectMaterial, currentFillAlpha, currentFillColor, currentStrokeAlpha, currentStrokeColor, doFill, doStroke, geometriesBank, i, maximumBallDetail, minimumBallDetail, objectPools, objectsUsedInFrameCounts, primitiveTypes, reflectValue, refractValue;
  GraphicsCommands = {};
  primitiveTypes = {};
  minimumBallDetail = void 0;
  maximumBallDetail = void 0;
  doFill = true;
  doStroke = true;
  reflectValue = 1;
  refractValue = 0.98;
  currentStrokeAlpha = void 0;
  currentStrokeColor = void 0;
  i = void 0;
  geometriesBank = [];
  createObjectIfNeededAndDressWithCorrectMaterial = void 0;
  commonPrimitiveDrawingLogic = void 0;
  SPIN_DURATION_IN_FRAMES = 30;
  currentFillAlpha = void 0;
  currentFillColor = void 0;
  objectPools = [];
  GraphicsCommands.objectPools = objectPools;
  GraphicsCommands.ballDetLevel = 8;
  GraphicsCommands.currentStrokeSize = 1;
  GraphicsCommands.minimumBallDetail = minimumBallDetail = 2;
  GraphicsCommands.maximumBallDetail = maximumBallDetail = 30;
  primitiveTypes.ambientLight = 0;
  primitiveTypes.line = 1;
  primitiveTypes.rect = 2;
  primitiveTypes.box = 3;
  primitiveTypes.peg = 4;
  primitiveTypes.ball = 5;
  GraphicsCommands.primitiveTypes = primitiveTypes;
  objectPools[primitiveTypes.line] = [];
  objectPools[primitiveTypes.rect] = [];
  objectPools[primitiveTypes.box] = [];
  objectPools[primitiveTypes.peg] = [];
  i = 0;
  while (i < (maximumBallDetail - minimumBallDetail + 1)) {
    objectPools[primitiveTypes.ball + i] = [];
    i += 1;
  }
  geometriesBank[primitiveTypes.line] = new liveCodeLabCore_THREE.Geometry();
  geometriesBank[primitiveTypes.line].vertices.push(new liveCodeLabCore_THREE.Vector3(0, -0.5, 0));
  geometriesBank[primitiveTypes.line].vertices.push(new liveCodeLabCore_THREE.Vector3(0, 0.5, 0));
  geometriesBank[primitiveTypes.rect] = new liveCodeLabCore_THREE.PlaneGeometry(1, 1);
  geometriesBank[primitiveTypes.box] = new liveCodeLabCore_THREE.CubeGeometry(1, 1, 1);
  geometriesBank[primitiveTypes.peg] = new liveCodeLabCore_THREE.CylinderGeometry(0.5, 0.5, 1, 32);
  i = 0;
  while (i < (maximumBallDetail - minimumBallDetail + 1)) {
    geometriesBank[primitiveTypes.ball + i] = new liveCodeLabCore_THREE.SphereGeometry(1, minimumBallDetail + i, minimumBallDetail + i);
    i += 1;
  }
  objectsUsedInFrameCounts = [];
  GraphicsCommands.objectsUsedInFrameCounts = objectsUsedInFrameCounts;
  GraphicsCommands.doTheSpinThingy = true;
  GraphicsCommands.resetTheSpinThingy = false;
  GraphicsCommands.defaultNormalFill = true;
  GraphicsCommands.defaultNormalStroke = true;
  createObjectIfNeededAndDressWithCorrectMaterial = function(a, b, c, primitiveProperties, strokeTime, colorToBeUsed, alphaToBeUsed, applyDefaultNormalColor) {
    var objectIsNew, objectPool, pooledObjectWithMaterials, primitiveID, theAngle;
    objectIsNew = false;
    pooledObjectWithMaterials = void 0;
    theAngle = void 0;
    primitiveID = primitiveProperties.primitiveType + primitiveProperties.detailLevel;
    objectPool = objectPools[primitiveID];
    pooledObjectWithMaterials = objectPool[objectsUsedInFrameCounts[primitiveID]];
    if (pooledObjectWithMaterials === undefined) {
      pooledObjectWithMaterials = {
        lineMaterial: undefined,
        basicMaterial: undefined,
        lambertMaterial: undefined,
        normalMaterial: undefined,
        threejsObject3D: new primitiveProperties.THREEObjectConstructor(geometriesBank[primitiveID]),
        initialSpinCountdown: SPIN_DURATION_IN_FRAMES
      };
      objectIsNew = true;
      objectPool.push(pooledObjectWithMaterials);
    }
    if (primitiveProperties.primitiveType === primitiveTypes.line) {
      if (pooledObjectWithMaterials.lineMaterial === undefined) {
        pooledObjectWithMaterials.lineMaterial = new liveCodeLabCore_THREE.LineBasicMaterial();
      }
      if (currentStrokeColor === angleColor || GraphicsCommands.defaultNormalStroke) {
        theAngle = pooledObjectWithMaterials.threejsObject3D.matrix.multiplyVector3(new liveCodeLabCore_THREE.Vector3(0, 1, 0)).normalize();
        pooledObjectWithMaterials.lineMaterial.color.setHex(color(((theAngle.x + 1) / 2) * 255, ((theAngle.y + 1) / 2) * 255, ((theAngle.z + 1) / 2) * 255));
      } else {
        pooledObjectWithMaterials.lineMaterial.color.setHex(currentStrokeColor);
      }
      pooledObjectWithMaterials.lineMaterial.linewidth = GraphicsCommands.currentStrokeSize;
      pooledObjectWithMaterials.threejsObject3D.material = pooledObjectWithMaterials.lineMaterial;
    } else if (objectIsNew || (colorToBeUsed === angleColor || applyDefaultNormalColor)) {
      if (pooledObjectWithMaterials.normalMaterial === undefined) {
        pooledObjectWithMaterials.normalMaterial = new liveCodeLabCore_THREE.MeshNormalMaterial();
      }
      pooledObjectWithMaterials.threejsObject3D.material = pooledObjectWithMaterials.normalMaterial;
    } else if (!liveCodeLabCoreInstance.LightSystem.lightsAreOn) {
      if (pooledObjectWithMaterials.basicMaterial === undefined) {
        pooledObjectWithMaterials.basicMaterial = new liveCodeLabCore_THREE.MeshBasicMaterial();
      }
      pooledObjectWithMaterials.basicMaterial.color.setHex(colorToBeUsed);
      pooledObjectWithMaterials.threejsObject3D.material = pooledObjectWithMaterials.basicMaterial;
    } else {
      if (pooledObjectWithMaterials.lambertMaterial === undefined) {
        pooledObjectWithMaterials.lambertMaterial = new liveCodeLabCore_THREE.MeshLambertMaterial();
      }
      pooledObjectWithMaterials.lambertMaterial.color.setHex(colorToBeUsed);
      pooledObjectWithMaterials.threejsObject3D.material = pooledObjectWithMaterials.lambertMaterial;
    }
    pooledObjectWithMaterials.threejsObject3D.material.side = primitiveProperties.sidedness;
    pooledObjectWithMaterials.threejsObject3D.material.opacity = alphaToBeUsed;
    if (alphaToBeUsed < 1) {
      pooledObjectWithMaterials.threejsObject3D.material.transparent = true;
    }
    pooledObjectWithMaterials.threejsObject3D.material.wireframe = strokeTime;
    pooledObjectWithMaterials.threejsObject3D.material.wireframeLinewidth = GraphicsCommands.currentStrokeSize;
    pooledObjectWithMaterials.threejsObject3D.material.reflectivity = reflectValue;
    pooledObjectWithMaterials.threejsObject3D.material.refractionRatio = refractValue;
    if (GraphicsCommands.resetTheSpinThingy) {
      pooledObjectWithMaterials.initialSpinCountdown = SPIN_DURATION_IN_FRAMES;
      GraphicsCommands.resetTheSpinThingy = false;
      GraphicsCommands.doTheSpinThingy = true;
    }
    if (GraphicsCommands.doTheSpinThingy) {
      pooledObjectWithMaterials.initialSpinCountdown -= 1;
    }
    if (pooledObjectWithMaterials.initialSpinCountdown === -1) {
      GraphicsCommands.doTheSpinThingy = false;
    }
    pooledObjectWithMaterials.threejsObject3D.primitiveType = primitiveProperties.primitiveType;
    pooledObjectWithMaterials.threejsObject3D.detailLevel = primitiveProperties.detailLevel;
    objectsUsedInFrameCounts[primitiveID] += 1;
    if (GraphicsCommands.doTheSpinThingy && pooledObjectWithMaterials.initialSpinCountdown > 0) {
      liveCodeLabCoreInstance.MatrixCommands.pushMatrix();
      liveCodeLabCoreInstance.MatrixCommands.rotate(pooledObjectWithMaterials.initialSpinCountdown / 50);
    }
    pooledObjectWithMaterials.threejsObject3D.matrixAutoUpdate = false;
    pooledObjectWithMaterials.threejsObject3D.matrix.copy(liveCodeLabCoreInstance.MatrixCommands.getWorldMatrix());
    pooledObjectWithMaterials.threejsObject3D.matrixWorldNeedsUpdate = true;
    if (GraphicsCommands.doTheSpinThingy && pooledObjectWithMaterials.initialSpinCountdown > 0) {
      liveCodeLabCoreInstance.MatrixCommands.popMatrix();
    }
    if (objectIsNew) {
      pooledObjectWithMaterials.threejsObject3D.matrix.scale(new liveCodeLabCore_THREE.Vector3(0.0001, 0.0001, 0.0001));
    } else if (a !== 1 || b !== 1 || c !== 1) {
      if (strokeTime) {
        pooledObjectWithMaterials.threejsObject3D.matrix.scale(new liveCodeLabCore_THREE.Vector3(a + 0.001, b + 0.001, c + 0.001));
      } else {
        pooledObjectWithMaterials.threejsObject3D.matrix.scale(new liveCodeLabCore_THREE.Vector3(a, b, c));
      }
    }
    if (objectIsNew) {
      return liveCodeLabCoreInstance.ThreeJsSystem.scene.add(pooledObjectWithMaterials.threejsObject3D);
    }
  };
  commonPrimitiveDrawingLogic = function(a, b, c, primitiveProperties) {
    if (a === undefined) {
      a = 1;
      b = 1;
      c = 1;
    } else if (b === undefined) {
      b = a;
      c = a;
    } else {
      if (c === undefined) {
        c = 1;
      }
    }
    if (!doStroke && (!doFill || !primitiveProperties.canFill)) {
      return;
    }
    if ((primitiveProperties.canFill && doFill && (GraphicsCommands.currentStrokeSize === 0 || !doStroke || (GraphicsCommands.currentStrokeSize <= 1 && !GraphicsCommands.defaultNormalFill && !GraphicsCommands.defaultNormalStroke && currentStrokeColor === currentFillColor && currentFillAlpha === 1 && currentStrokeAlpha === 1))) || (GraphicsCommands.currentStrokeSize <= 1 && GraphicsCommands.defaultNormalFill && GraphicsCommands.defaultNormalStroke)) {
      return createObjectIfNeededAndDressWithCorrectMaterial(a, b, c, primitiveProperties, false, currentFillColor, currentFillAlpha, GraphicsCommands.defaultNormalFill);
    } else if ((!doFill || !primitiveProperties.canFill) && doStroke) {
      return createObjectIfNeededAndDressWithCorrectMaterial(a, b, c, primitiveProperties, true, currentStrokeColor, currentStrokeAlpha, GraphicsCommands.defaultNormalStroke);
    } else {
      createObjectIfNeededAndDressWithCorrectMaterial(a, b, c, primitiveProperties, true, currentStrokeColor, currentStrokeAlpha, GraphicsCommands.defaultNormalStroke);
      return createObjectIfNeededAndDressWithCorrectMaterial(a, b, c, primitiveProperties, false, currentFillColor, currentFillAlpha, GraphicsCommands.defaultNormalFill);
    }
  };
  GraphicsCommands.reset = function() {
    var _results;
    GraphicsCommands.fill(0xFFFFFFFF);
    GraphicsCommands.stroke(0xFFFFFFFF);
    GraphicsCommands.currentStrokeSize = 1;
    GraphicsCommands.defaultNormalFill = true;
    GraphicsCommands.defaultNormalStroke = true;
    GraphicsCommands.ballDetLevel = liveCodeLabCoreInstance.ThreeJsSystem.ballDefaultDetLevel;
    GraphicsCommands.objectsUsedInFrameCounts[GraphicsCommands.primitiveTypes.ambientLight] = 0;
    GraphicsCommands.objectsUsedInFrameCounts[GraphicsCommands.primitiveTypes.line] = 0;
    GraphicsCommands.objectsUsedInFrameCounts[GraphicsCommands.primitiveTypes.rect] = 0;
    GraphicsCommands.objectsUsedInFrameCounts[GraphicsCommands.primitiveTypes.box] = 0;
    GraphicsCommands.objectsUsedInFrameCounts[GraphicsCommands.primitiveTypes.peg] = 0;
    i = void 0;
    i = 0;
    _results = [];
    while (i < (GraphicsCommands.maximumBallDetail - GraphicsCommands.minimumBallDetail + 1)) {
      GraphicsCommands.objectsUsedInFrameCounts[GraphicsCommands.primitiveTypes.ball + i] = 0;
      _results.push(i += 1);
    }
    return _results;
  };
  window.line = GraphicsCommands.line = function(a, b, c) {
    var primitiveProperties, rememberIfThereWasAFill, rememberPreviousStrokeSize;
    if (liveCodeLabCoreInstance.LightSystem.lightsAreOn) {
      rememberIfThereWasAFill = doFill;
      rememberPreviousStrokeSize = GraphicsCommands.currentStrokeSize;
      if (GraphicsCommands.currentStrokeSize < 2) {
        GraphicsCommands.currentStrokeSize = 2;
      }
      if (a === undefined) {
        a = 1;
      }
      rect(0, a, 0);
      doFill = rememberIfThereWasAFill;
      GraphicsCommands.currentStrokeSize = rememberPreviousStrokeSize;
      return;
    }
    primitiveProperties = {
      canFill: false,
      primitiveType: primitiveTypes.line,
      sidedness: liveCodeLabCore_THREE.FrontSide,
      THREEObjectConstructor: liveCodeLabCore_THREE.Line,
      detailLevel: 0
    };
    return commonPrimitiveDrawingLogic(a, b, c, primitiveProperties);
  };
  window.rect = GraphicsCommands.rect = function(a, b, c) {
    var primitiveProperties;
    primitiveProperties = {
      canFill: true,
      primitiveType: primitiveTypes.rect,
      sidedness: liveCodeLabCore_THREE.DoubleSide,
      THREEObjectConstructor: liveCodeLabCore_THREE.Mesh,
      detailLevel: 0
    };
    return commonPrimitiveDrawingLogic(a, b, c, primitiveProperties);
  };
  window.box = GraphicsCommands.box = function(a, b, c) {
    var primitiveProperties;
    primitiveProperties = {
      canFill: true,
      primitiveType: primitiveTypes.box,
      sidedness: liveCodeLabCore_THREE.FrontSide,
      THREEObjectConstructor: liveCodeLabCore_THREE.Mesh,
      detailLevel: 0
    };
    return commonPrimitiveDrawingLogic(a, b, c, primitiveProperties);
  };
  window.peg = GraphicsCommands.peg = function(a, b, c) {
    var primitiveProperties;
    primitiveProperties = {
      canFill: true,
      primitiveType: primitiveTypes.peg,
      sidedness: liveCodeLabCore_THREE.FrontSide,
      THREEObjectConstructor: liveCodeLabCore_THREE.Mesh,
      detailLevel: 0
    };
    return commonPrimitiveDrawingLogic(a, b, c, primitiveProperties);
  };
  window.ballDetail = GraphicsCommands.ballDetail = function(a) {
    if (a === undefined) {
      return;
    }
    if (a < 2) {
      a = 2;
    }
    if (a > 30) {
      a = 30;
    }
    return GraphicsCommands.ballDetLevel = Math.round(a);
  };
  window.ball = GraphicsCommands.ball = function(a, b, c) {
    var primitiveProperties;
    primitiveProperties = {
      canFill: true,
      primitiveType: primitiveTypes.ball,
      sidedness: liveCodeLabCore_THREE.FrontSide,
      THREEObjectConstructor: liveCodeLabCore_THREE.Mesh,
      detailLevel: GraphicsCommands.ballDetLevel - minimumBallDetail
    };
    return commonPrimitiveDrawingLogic(a, b, c, primitiveProperties);
  };
  window.fill = GraphicsCommands.fill = function(r, g, b, a) {
    doFill = true;
    if (r !== angleColor) {
      GraphicsCommands.defaultNormalFill = false;
      currentFillColor = color(r, g, b);
      return currentFillAlpha = alphaZeroToOne(color(r, g, b, a));
    } else {
      GraphicsCommands.defaultNormalFill = true;
      currentFillColor = angleColor;
      if (b === undefined && g !== undefined) {
        return currentFillAlpha = g / liveCodeLabCoreInstance.ColourFunctions.colorModeA;
      } else {
        return currentFillAlpha = 1;
      }
    }
  };
  /*
    The noFill() function disables filling geometry.
    If both <b>noStroke()</b> and <b>noFill()</b>
    are called, no shapes will be drawn to the screen.
    
    @see #fill()
  */

  window.noFill = GraphicsCommands.noFill = function() {
    doFill = false;
    return GraphicsCommands.defaultNormalFill = false;
  };
  /*
    The stroke() function sets the color used to draw lines and borders around shapes.
    This color is either specified in terms of the RGB or HSB color depending on the
    current <b>colorMode()</b> (the default color space is RGB, with each
    value in the range from 0 to 255).
    <br><br>When using hexadecimal notation to specify a color, use "#" or
    "0x" before the values (e.g. #CCFFAA, 0xFFCCFFAA). The # syntax uses six
    digits to specify a color (the way colors are specified in HTML and CSS).
    When using the hexadecimal notation starting with "0x", the hexadecimal
    value must be specified with eight characters; the first two characters
    define the alpha component and the remainder the red, green, and blue
    components.
    <br><br>The value for the parameter "gray" must be less than or equal
    to the current maximum value as specified by <b>colorMode()</b>.
    The default maximum value is 255.
    
    @param {int|float} gray    number specifying value between white and black
    @param {int|float} value1  red or hue value
    @param {int|float} value2  green or saturation value
    @param {int|float} value3  blue or brightness value
    @param {int|float} alpha   opacity of the stroke
    @param {Color} color       any value of the color datatype
    @param {int} hex           color value in hex notation (i.e. #FFCC00 or 0xFFFFCC00)
    
    @see #fill()
    @see #noStroke()
    @see #tint()
    @see #background()
    @see #colorMode()
  */

  window.stroke = GraphicsCommands.stroke = function(r, g, b, a) {
    doStroke = true;
    if (r !== angleColor) {
      GraphicsCommands.defaultNormalStroke = false;
      currentStrokeColor = color(r, g, b);
      return currentStrokeAlpha = alphaZeroToOne(color(r, g, b, a));
    } else {
      GraphicsCommands.defaultNormalStroke = true;
      currentStrokeColor = angleColor;
      if (b === undefined && g !== undefined) {
        return currentStrokeAlpha = g / liveCodeLabCoreInstance.ColourFunctions.colorModeA;
      } else {
        return currentStrokeAlpha = 1;
      }
    }
  };
  /*
    The noStroke() function disables drawing the stroke (outline).
    If both <b>noStroke()</b> and <b>noFill()</b> are called, no shapes
    will be drawn to the screen.
    
    @see #stroke()
  */

  window.noStroke = GraphicsCommands.noStroke = function() {
    return doStroke = false;
  };
  window.strokeSize = GraphicsCommands.strokeSize = function(a) {
    if (a === undefined) {
      a = 1;
    } else {
      if (a < 0) {
        a = 0;
      }
    }
    return GraphicsCommands.currentStrokeSize = a;
  };
  return GraphicsCommands;
};
