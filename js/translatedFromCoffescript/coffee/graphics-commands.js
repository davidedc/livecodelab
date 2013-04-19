/*
## Please reference the colour-functions.js file for all colour-related
## functions and lights-functions.js for lights, which use a similar
## structure for caching and counting of light instances.
## 
## Fundamentals
## ============
## There are a couple of fundamentals of LiveCodeLab and a couple of
## complications of Three.js that shape the way
## graphic primitives work in this file.
## 
## LiveCodeLab uses immediate mode graphics
## ----------------------
## First off, like Processing, LiveCodeLab shies away from "retained" graphics
## and instead uses "immediate mode" graphics.
## For context, "immediate mode" graphics means that when the user uses a graphic
## primitive, he is
## NOT given a handle that he can use to modify properties of that element at a
## later stage, contrarily to flash, DOM, CSS, openGL and Three.JS
## (to different degrees).
## Retained graphic modes keep structures in memory that make easy for example
## to do event handling (which object did I click?), hierarchy management
## (parent/child relationships, container/content, etc), property tweaking
## (change property X of object Y), and sometimes animation ( CoreAnimation from
## Apple for example), collision/overlap detection. Note that openGL is retained
## in that there are handles to geometry and textures, but little else is given
## (no events, no input, no physics/overlap/collision/animation).
## Also, retained graphics mode usually is smart about updating
## only minimal parts of the screen that need updating rather than redrawing the
## whole screen (again, openGL doesn't do that apart from basic frustum culling, but
## for example there is nothing to detect occlusions and avoid painting occluded
## objects).
## There are a few drawbacks in retained modes: a) programs that manage
## handles are more lengthy than programs that don't
## b) they are often not needed for example in
## 2d sprites-based videogames c) most importantly,
## they require deeper understanding of the underlying
## model (e.g. which property can I change? What are those called? How do I change
## parent/child relationship? How do events bubble up and where should I catch them?).
## Processing and LiveCodeLab go for immediate mode. Once the primitive is invoked, it
## becomes pixels and there is no built-in way to do input/event/hierarchies...
## Rather, there are a few properties that are set as a global state and apply to all
## objects. Examples are "fill" and "stroke".
## 
## Relationship between objects, meshes, geometry, materials...
## ----------------------
## A Three.js object (or to be more precise, Object3D) can be a line or a mesh. A line
## is a line, a mesh can be anything else depending on what the geometry of the mesh
## is. There are more possible types such as particles, etc. but they are not currently
## used in LiveCodeLab. An object needs one more thing: a material.
## 
## Caching of objects
## ----------------------
## Once created, objects are kept cached together with all possible materials that can be
## associated with it. Each object has to have its own set of materials because
## one can decide to draw one object in solid fill, one in normal color, one with
## an ambient light (i.e. lambert material), etc.
## 
## Objects are kept in the scene
## ----------------------
## Once an object is added to the scene, it's never removed. Rather, it's hidden if it's
## not used, but it's never removed. This is because adding/removing objects from the
## scene is rather expensive. Note that Mr Doob mentioned via email that subsequent
## versions of three.js have improved performance a lot, so it's worth trying another
## approach.
## 
## Strokes are managed via separate objects for stroke and fill
## ----------------------
## There is a particular flag in Three.js materials for drawing wireframes. But materials
## cannot be combined, i.e. only one is associated at any time with a geometry. So one
## can either draw a wireframe or a fill. In previous versions of Three.js more than
## one material could be associated, but that has been deprecated, see
## https://github.com/mrdoob/three.js/issues/751 and instead a
## createMultiMaterialObject utility was put in place, which basically creates multiple
## objects one for each material, see
## https://github.com/mrdoob/three.js/blob/dev/src/extras/SceneUtils.js#L29
## So the solution here is to create two disting objects.
## One for the fills and one, slightly "larger", for the strokes. In that way, the
## strokes are visible "in front" of the fills, and the fills cover the strokes "at
## the back"
## 
## The order of materials matters
## ----------------------
## When an object is created, it must be first rendered with the most complex material,
## because internally in Three.js/WebGL memory is allocated only once. So a special
## mechanism is put in place by which new objects are drawn with the normalMaterial
## with scale 0, so they are rendered but they are invisible. In the next frame (i.e.
## after the first render) the correct material is used.
## 
## "Spinning"
## ----------------------
## "Spinning" applies to all objects added to an empty frame: it makes all objects spin
## for a few frames. This has been implemented for two reasons a) cosmetic b) the user
## is likely to first use "box", and without spinning that would look like a boring
## square that appears without animation. Spinning gives many more cues: the environment
## is 3d, the lighting is special by default and all faces have primary colors, things
## animate. Without spinning, all those cues need to be further explained and demonstra
## ted.
*/

var GraphicsCommands;

GraphicsCommands = (function() {
  "use strict";  GraphicsCommands.prototype.primitiveTypes = {};

  GraphicsCommands.prototype.minimumBallDetail = 2;

  GraphicsCommands.prototype.maximumBallDetail = 30;

  GraphicsCommands.prototype.doFill = true;

  GraphicsCommands.prototype.doStroke = true;

  GraphicsCommands.prototype.reflectValue = 1;

  GraphicsCommands.prototype.refractValue = 0.98;

  GraphicsCommands.prototype.currentStrokeAlpha = void 0;

  GraphicsCommands.prototype.currentStrokeColor = void 0;

  GraphicsCommands.prototype.geometriesBank = [];

  GraphicsCommands.prototype.SPIN_DURATION_IN_FRAMES = 30;

  GraphicsCommands.prototype.currentFillAlpha = void 0;

  GraphicsCommands.prototype.currentFillColor = void 0;

  GraphicsCommands.prototype.objectPools = [];

  GraphicsCommands.prototype.ballDetLevel = 8;

  GraphicsCommands.prototype.currentStrokeSize = 1;

  GraphicsCommands.prototype.objectsUsedInFrameCounts = [];

  GraphicsCommands.prototype.doTheSpinThingy = true;

  GraphicsCommands.prototype.resetTheSpinThingy = false;

  GraphicsCommands.prototype.defaultNormalFill = true;

  GraphicsCommands.prototype.defaultNormalStroke = true;

  function GraphicsCommands(liveCodeLabCore_three, liveCodeLabCoreInstance) {
    var i, _i, _j, _ref, _ref1,
      _this = this;

    this.liveCodeLabCore_three = liveCodeLabCore_three;
    this.liveCodeLabCoreInstance = liveCodeLabCoreInstance;
    window.line = function(a, b, c) {
      return _this.line(a, b, c);
    };
    window.rect = function(a, b, c) {
      return _this.rect(a, b, c);
    };
    window.box = function(a, b, c) {
      return _this.box(a, b, c);
    };
    window.peg = function(a, b, c) {
      return _this.peg(a, b, c);
    };
    window.ball = function(a, b, c) {
      return _this.ball(a, b, c);
    };
    window.ballDetail = function(a) {
      return _this.ballDetail(a);
    };
    window.fill = function(a, b, c, d) {
      return _this.fill(a, b, c, d);
    };
    window.noFill = function() {
      return _this.noFill();
    };
    window.stroke = function(a, b, c, d) {
      return _this.stroke(a, b, c, d);
    };
    window.noStroke = function() {
      return _this.noStroke();
    };
    window.strokeSize = function(a) {
      return _this.strokeSize(a);
    };
    this.primitiveTypes.ambientLight = 0;
    this.primitiveTypes.line = 1;
    this.primitiveTypes.rect = 2;
    this.primitiveTypes.box = 3;
    this.primitiveTypes.peg = 4;
    this.primitiveTypes.ball = 5;
    this.objectPools[this.primitiveTypes.line] = [];
    this.objectPools[this.primitiveTypes.rect] = [];
    this.objectPools[this.primitiveTypes.box] = [];
    this.objectPools[this.primitiveTypes.peg] = [];
    for (i = _i = 0, _ref = this.maximumBallDetail - this.minimumBallDetail + 1; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      this.objectPools[this.primitiveTypes.ball + i] = [];
    }
    this.geometriesBank[this.primitiveTypes.line] = new this.liveCodeLabCore_three.Geometry();
    this.geometriesBank[this.primitiveTypes.line].vertices.push(new this.liveCodeLabCore_three.Vector3(0, -0.5, 0));
    this.geometriesBank[this.primitiveTypes.line].vertices.push(new this.liveCodeLabCore_three.Vector3(0, 0.5, 0));
    this.geometriesBank[this.primitiveTypes.rect] = new this.liveCodeLabCore_three.PlaneGeometry(1, 1);
    this.geometriesBank[this.primitiveTypes.box] = new this.liveCodeLabCore_three.CubeGeometry(1, 1, 1);
    this.geometriesBank[this.primitiveTypes.peg] = new this.liveCodeLabCore_three.CylinderGeometry(0.5, 0.5, 1, 32);
    for (i = _j = 0, _ref1 = this.maximumBallDetail - this.minimumBallDetail + 1; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
      this.geometriesBank[this.primitiveTypes.ball + i] = new this.liveCodeLabCore_three.SphereGeometry(1, this.minimumBallDetail + i, this.minimumBallDetail + i);
    }
  }

  GraphicsCommands.prototype.createObjectIfNeededAndDressWithCorrectMaterial = function(a, b, c, primitiveProperties, strokeTime, colorToBeUsed, alphaToBeUsed, applyDefaultNormalColor) {
    var objectIsNew, objectPool, pooledObjectWithMaterials, primitiveID, theAngle;

    objectIsNew = false;
    pooledObjectWithMaterials = void 0;
    theAngle = void 0;
    primitiveID = primitiveProperties.primitiveType + primitiveProperties.detailLevel;
    objectPool = this.objectPools[primitiveID];
    pooledObjectWithMaterials = objectPool[this.objectsUsedInFrameCounts[primitiveID]];
    if (pooledObjectWithMaterials === undefined) {
      pooledObjectWithMaterials = {
        lineMaterial: undefined,
        basicMaterial: undefined,
        lambertMaterial: undefined,
        normalMaterial: undefined,
        threejsObject3D: new primitiveProperties.threeObjectConstructor(this.geometriesBank[primitiveID]),
        initialSpinCountdown: this.SPIN_DURATION_IN_FRAMES
      };
      objectIsNew = true;
      objectPool.push(pooledObjectWithMaterials);
    }
    if (primitiveProperties.primitiveType === this.primitiveTypes.line) {
      if (pooledObjectWithMaterials.lineMaterial === undefined) {
        pooledObjectWithMaterials.lineMaterial = new this.liveCodeLabCore_three.LineBasicMaterial();
      }
      if (this.currentStrokeColor === angleColor || this.defaultNormalStroke) {
        theAngle = pooledObjectWithMaterials.threejsObject3D.matrix.multiplyVector3(new this.liveCodeLabCore_three.Vector3(0, 1, 0)).normalize();
        pooledObjectWithMaterials.lineMaterial.color.setHex(color(((theAngle.x + 1) / 2) * 255, ((theAngle.y + 1) / 2) * 255, ((theAngle.z + 1) / 2) * 255));
      } else {
        pooledObjectWithMaterials.lineMaterial.color.setHex(this.currentStrokeColor);
      }
      pooledObjectWithMaterials.lineMaterial.linewidth = this.currentStrokeSize;
      pooledObjectWithMaterials.threejsObject3D.material = pooledObjectWithMaterials.lineMaterial;
    } else if (objectIsNew || (colorToBeUsed === angleColor || applyDefaultNormalColor)) {
      if (pooledObjectWithMaterials.normalMaterial === undefined) {
        pooledObjectWithMaterials.normalMaterial = new this.liveCodeLabCore_three.MeshNormalMaterial();
      }
      pooledObjectWithMaterials.threejsObject3D.material = pooledObjectWithMaterials.normalMaterial;
    } else if (!this.liveCodeLabCoreInstance.lightSystem.lightsAreOn) {
      if (pooledObjectWithMaterials.basicMaterial === undefined) {
        pooledObjectWithMaterials.basicMaterial = new this.liveCodeLabCore_three.MeshBasicMaterial();
      }
      pooledObjectWithMaterials.basicMaterial.color.setHex(colorToBeUsed);
      pooledObjectWithMaterials.threejsObject3D.material = pooledObjectWithMaterials.basicMaterial;
    } else {
      if (pooledObjectWithMaterials.lambertMaterial === undefined) {
        pooledObjectWithMaterials.lambertMaterial = new this.liveCodeLabCore_three.MeshLambertMaterial();
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
    pooledObjectWithMaterials.threejsObject3D.material.wireframeLinewidth = this.currentStrokeSize;
    pooledObjectWithMaterials.threejsObject3D.material.reflectivity = this.reflectValue;
    pooledObjectWithMaterials.threejsObject3D.material.refractionRatio = this.refractValue;
    if (this.resetTheSpinThingy) {
      pooledObjectWithMaterials.initialSpinCountdown = this.SPIN_DURATION_IN_FRAMES;
      this.resetTheSpinThingy = false;
      this.doTheSpinThingy = true;
    }
    if (this.doTheSpinThingy) {
      pooledObjectWithMaterials.initialSpinCountdown -= 1;
    }
    if (pooledObjectWithMaterials.initialSpinCountdown === -1) {
      this.doTheSpinThingy = false;
    }
    pooledObjectWithMaterials.threejsObject3D.primitiveType = primitiveProperties.primitiveType;
    pooledObjectWithMaterials.threejsObject3D.detailLevel = primitiveProperties.detailLevel;
    this.objectsUsedInFrameCounts[primitiveID] += 1;
    if (this.doTheSpinThingy && pooledObjectWithMaterials.initialSpinCountdown > 0) {
      this.liveCodeLabCoreInstance.matrixCommands.pushMatrix();
      this.liveCodeLabCoreInstance.matrixCommands.rotate(pooledObjectWithMaterials.initialSpinCountdown / 50);
    }
    pooledObjectWithMaterials.threejsObject3D.matrixAutoUpdate = false;
    pooledObjectWithMaterials.threejsObject3D.matrix.copy(this.liveCodeLabCoreInstance.matrixCommands.getWorldMatrix());
    pooledObjectWithMaterials.threejsObject3D.matrixWorldNeedsUpdate = true;
    if (this.doTheSpinThingy && pooledObjectWithMaterials.initialSpinCountdown > 0) {
      this.liveCodeLabCoreInstance.matrixCommands.popMatrix();
    }
    if (objectIsNew) {
      pooledObjectWithMaterials.threejsObject3D.matrix.scale(new this.liveCodeLabCore_three.Vector3(0.0001, 0.0001, 0.0001));
    } else if (a !== 1 || b !== 1 || c !== 1) {
      if (strokeTime) {
        pooledObjectWithMaterials.threejsObject3D.matrix.scale(new this.liveCodeLabCore_three.Vector3(a + 0.001, b + 0.001, c + 0.001));
      } else {
        pooledObjectWithMaterials.threejsObject3D.matrix.scale(new this.liveCodeLabCore_three.Vector3(a, b, c));
      }
    }
    if (objectIsNew) {
      return this.liveCodeLabCoreInstance.threeJsSystem.scene.add(pooledObjectWithMaterials.threejsObject3D);
    }
  };

  GraphicsCommands.prototype.commonPrimitiveDrawingLogic = function(a, b, c, primitiveProperties) {
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
    if (!this.doStroke && (!this.doFill || !primitiveProperties.canFill)) {
      return;
    }
    if ((primitiveProperties.canFill && this.doFill && (this.currentStrokeSize === 0 || !this.doStroke || (this.currentStrokeSize <= 1 && !this.defaultNormalFill && !this.defaultNormalStroke && this.currentStrokeColor === this.currentFillColor && this.currentFillAlpha === 1 && this.currentStrokeAlpha === 1))) || (this.currentStrokeSize <= 1 && this.defaultNormalFill && this.defaultNormalStroke)) {
      return this.createObjectIfNeededAndDressWithCorrectMaterial(a, b, c, primitiveProperties, false, this.currentFillColor, this.currentFillAlpha, this.defaultNormalFill);
    } else if ((!this.doFill || !primitiveProperties.canFill) && this.doStroke) {
      return this.createObjectIfNeededAndDressWithCorrectMaterial(a, b, c, primitiveProperties, true, this.currentStrokeColor, this.currentStrokeAlpha, this.defaultNormalStroke);
    } else {
      this.createObjectIfNeededAndDressWithCorrectMaterial(a, b, c, primitiveProperties, true, this.currentStrokeColor, this.currentStrokeAlpha, this.defaultNormalStroke);
      return this.createObjectIfNeededAndDressWithCorrectMaterial(a, b, c, primitiveProperties, false, this.currentFillColor, this.currentFillAlpha, this.defaultNormalFill);
    }
  };

  GraphicsCommands.prototype.reset = function() {
    var i, _i, _ref, _results;

    this.fill(0xFFFFFFFF);
    this.stroke(0xFFFFFFFF);
    this.currentStrokeSize = 1;
    this.defaultNormalFill = true;
    this.defaultNormalStroke = true;
    this.ballDetLevel = this.liveCodeLabCoreInstance.threeJsSystem.ballDefaultDetLevel;
    this.objectsUsedInFrameCounts[this.primitiveTypes.ambientLight] = 0;
    this.objectsUsedInFrameCounts[this.primitiveTypes.line] = 0;
    this.objectsUsedInFrameCounts[this.primitiveTypes.rect] = 0;
    this.objectsUsedInFrameCounts[this.primitiveTypes.box] = 0;
    this.objectsUsedInFrameCounts[this.primitiveTypes.peg] = 0;
    _results = [];
    for (i = _i = 0, _ref = this.maximumBallDetail - this.minimumBallDetail + 1; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      _results.push(this.objectsUsedInFrameCounts[this.primitiveTypes.ball + i] = 0);
    }
    return _results;
  };

  GraphicsCommands.prototype.line = function(a, b, c) {
    var primitiveProperties, rememberIfThereWasAFill, rememberPreviousStrokeSize;

    if (this.liveCodeLabCoreInstance.lightSystem.lightsAreOn) {
      rememberIfThereWasAFill = this.doFill;
      rememberPreviousStrokeSize = this.currentStrokeSize;
      if (this.currentStrokeSize < 2) {
        this.currentStrokeSize = 2;
      }
      if (a === undefined) {
        a = 1;
      }
      this.rect(0, a, 0);
      this.doFill = rememberIfThereWasAFill;
      this.currentStrokeSize = rememberPreviousStrokeSize;
      return;
    }
    primitiveProperties = {
      canFill: false,
      primitiveType: this.primitiveTypes.line,
      sidedness: this.liveCodeLabCore_three.FrontSide,
      threeObjectConstructor: this.liveCodeLabCore_three.Line,
      detailLevel: 0
    };
    return this.commonPrimitiveDrawingLogic(a, b, c, primitiveProperties);
  };

  GraphicsCommands.prototype.rect = function(a, b, c) {
    var primitiveProperties;

    primitiveProperties = {
      canFill: true,
      primitiveType: this.primitiveTypes.rect,
      sidedness: this.liveCodeLabCore_three.DoubleSide,
      threeObjectConstructor: this.liveCodeLabCore_three.Mesh,
      detailLevel: 0
    };
    return this.commonPrimitiveDrawingLogic(a, b, c, primitiveProperties);
  };

  GraphicsCommands.prototype.box = function(a, b, c) {
    var primitiveProperties;

    primitiveProperties = {
      canFill: true,
      primitiveType: this.primitiveTypes.box,
      sidedness: this.liveCodeLabCore_three.FrontSide,
      threeObjectConstructor: this.liveCodeLabCore_three.Mesh,
      detailLevel: 0
    };
    return this.commonPrimitiveDrawingLogic(a, b, c, primitiveProperties);
  };

  GraphicsCommands.prototype.peg = function(a, b, c) {
    var primitiveProperties;

    primitiveProperties = {
      canFill: true,
      primitiveType: this.primitiveTypes.peg,
      sidedness: this.liveCodeLabCore_three.FrontSide,
      threeObjectConstructor: this.liveCodeLabCore_three.Mesh,
      detailLevel: 0
    };
    return this.commonPrimitiveDrawingLogic(a, b, c, primitiveProperties);
  };

  GraphicsCommands.prototype.ballDetail = function(a) {
    if (a === undefined) {
      return;
    }
    if (a < 2) {
      a = 2;
    }
    if (a > 30) {
      a = 30;
    }
    return this.ballDetLevel = Math.round(a);
  };

  GraphicsCommands.prototype.ball = function(a, b, c) {
    var primitiveProperties;

    primitiveProperties = {
      canFill: true,
      primitiveType: this.primitiveTypes.ball,
      sidedness: this.liveCodeLabCore_three.FrontSide,
      threeObjectConstructor: this.liveCodeLabCore_three.Mesh,
      detailLevel: this.ballDetLevel - this.minimumBallDetail
    };
    return this.commonPrimitiveDrawingLogic(a, b, c, primitiveProperties);
  };

  GraphicsCommands.prototype.fill = function(r, g, b, a) {
    this.doFill = true;
    if (r !== angleColor) {
      this.defaultNormalFill = false;
      this.currentFillColor = color(r, g, b);
      return this.currentFillAlpha = alphaZeroToOne(color(r, g, b, a));
    } else {
      this.defaultNormalFill = true;
      this.currentFillColor = angleColor;
      if (b === undefined && g !== undefined) {
        return this.currentFillAlpha = g / this.liveCodeLabCoreInstance.colourFunctions.colorModeA;
      } else {
        return this.currentFillAlpha = 1;
      }
    }
  };

  /*
  The noFill() function disables filling geometry.
  If both <b>noStroke()</b> and <b>noFill()</b>
  are called, no shapes will be drawn to the screen.
  
  @see #fill()
  */


  GraphicsCommands.prototype.noFill = function() {
    this.doFill = false;
    return this.defaultNormalFill = false;
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


  GraphicsCommands.prototype.stroke = function(r, g, b, a) {
    this.doStroke = true;
    if (r !== angleColor) {
      this.defaultNormalStroke = false;
      this.currentStrokeColor = color(r, g, b);
      return this.currentStrokeAlpha = alphaZeroToOne(color(r, g, b, a));
    } else {
      this.defaultNormalStroke = true;
      this.currentStrokeColor = angleColor;
      if (b === undefined && g !== undefined) {
        return this.currentStrokeAlpha = g / this.liveCodeLabCoreInstance.colourFunctions.colorModeA;
      } else {
        return this.currentStrokeAlpha = 1;
      }
    }
  };

  /*
  The noStroke() function disables drawing the stroke (outline).
  If both <b>noStroke()</b> and <b>noFill()</b> are called, no shapes
  will be drawn to the screen.
  
  @see #stroke()
  */


  GraphicsCommands.prototype.noStroke = function() {
    return this.doStroke = false;
  };

  GraphicsCommands.prototype.strokeSize = function(a) {
    if (a === undefined) {
      a = 1;
    } else {
      if (a < 0) {
        a = 0;
      }
    }
    return this.currentStrokeSize = a;
  };

  return GraphicsCommands;

})();
