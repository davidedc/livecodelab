/*jslint browser: true */
/*global THREE, logger, color, LightSystem, MatrixCommands, ThreeJs, colorModeA, redF, greenF, blueF, alphaZeroToOne  */

// Please reference the colour-functions.js file for all colour-related
// functions.

// Fundamentals
// ============
// There are a couple of fundamentals of LiveCodeLab and a couple of
// complications of Three.js that shape the way
// graphic primitives work in this file.
// LiveCodeLab uses immediate mode graphics
// ----------------------
// First off, like Processing, LiveCodeLab shies away from "retained" graphics
// and instead uses "immediate mode" graphics.
// Practically, this means that when the user uses a graphic primitive, he is
// NOT given a handle that he can use to modify properties of that element at a
// later stage. For example flash, DOM, CSS, openGL and Three.JS work that way
// (to different degrees).
// Retained graphic modes keep structures in memory that make easy for example
// to do event handling (which object did I click?), hierarchy management
// (parent/child relationships, container/content, etc), property tweaking
// (change property X of object Y), and sometimes animation ( CoreAnimation from
// Apple for example), collision/overlap detection. Note that openGL is retained
// in that there are handles to meshes and textures, but little else is given
// (no events, no input, no physics/overlap/collision/animation).
// Also, retained graphics mode usually is smart about updating
// only minimal parts of the screen that need updating rather than redrawing the
// whole screen (again, openGL doesn't do that apart from basic frustum culling, but
// for example there is nothing to detect occlusions and avoid painting occluded
// objects).
// There are a few drawbacks about retained modes: a) programs that manage
// handles are more lengthy than programs that don't to manage handles
// b) they are often not needed for example in
// 2d sprites-based videogames c) most importantly,
// they require deeper understanding of the underlying
// model (e.g. which property can I change? What are those called? How to I change
// parent/child relationship? How do events bubble up?).
// Processing and LiveCodeLab go for immediate mode. Once the primitive is invoked, it
// becomes pixels and there is no built-in way to do input/event/hierarchies...
// Rather, there are a few properties that are set as a global state and apply to all
// objects. Examples are "fill" and stroke.
// Strokes are managed via separately painting the stroke and then paining the fill
// ----------------------
// There is a particular material in Three.js for drawing wireframes. But materials
// cannot be combined, i.e. only one is associated at any time with a mesh. Also,
// wireframes draw ALL the edges, i.e. both the edges normally visible and "in front"
// and the occluded edges at the back. So the solution is to draw two disting objects.
// One for the fills and one, slightly "larger", for the strokes. In that way, the
// strokes are visible "in front" of the fills, and the fills cover the strokes "at
// the back"
// "Spinning"
// ----------------------
// "Spinning" applies to all objects added to an empty frame: it makes all objects spin
// for a few frames. This has been implemented for two reasons a) cosmetic b) the user
// is likely to first use "box", and without spinning that would look like a boring
// square that appears without animation. Spinning gives many more cues: the environment
// is 3d, the lighting is special by default and all faces have primary colors, things
// animate. Without spinning, all those queues need to be further explained and demonstra
// ted.


var createGraphicsCommands = function () {

    'use strict';

    var GraphicsCommands = {},
        geometries = {},
        minimumBallDetail,
        maximumBallDetail,
        doFill = true,
        doStroke = true,
        reflectValue = 1,
        refractValue = 0.98,
        currentStrokeAlpha = 1,
        currentStrokeColor = 0x000000,
        i,
        objectPool = [],
        geometriesBank = [],
        createObjectIfNeededAndDressWithCorrectMaterial,
        commonPrimitiveDrawingLogic,
        SPIN_DURATION_IN_FRAMES = 30,
        currentFillAlpha = 1,
        currentFillColor = 0xFFFFFF,
        // lowest than any 32 bit color is a special
        // color that paints based on normals.
        angleColor = -16777217;


    GraphicsCommands.ballDetLevel = 8;
    GraphicsCommands.currentStrokeSize = 1;


    GraphicsCommands.minimumBallDetail = minimumBallDetail = 2;
    GraphicsCommands.maximumBallDetail = maximumBallDetail = 30;


    geometries.line = 0;
    geometries.rect = 1;
    geometries.box = 2;
    geometries.cyclinder = 3;
    geometries.sphere = 4;

    GraphicsCommands.geometries = geometries;

    objectPool[geometries.line] = [];
    objectPool[geometries.rect] = [];
    objectPool[geometries.box] = [];
    objectPool[geometries.cyclinder] = [];
    // creating sphere pools
    for (i = 0; i < (maximumBallDetail - minimumBallDetail + 1); i += 1) {
        objectPool[geometries.sphere + i] = [];
    }


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
    geometriesBank[geometries.line] = new THREE.Geometry();
    geometriesBank[geometries.line].vertices.push(new THREE.Vertex(new THREE.Vector3(0, -0.5, 0)));
    geometriesBank[geometries.line].vertices.push(new THREE.Vertex(new THREE.Vector3(0, 0.5, 0)));
    geometriesBank[geometries.rect] = new THREE.PlaneGeometry(1, 1);
    geometriesBank[geometries.box] = new THREE.CubeGeometry(1, 1, 1);
    geometriesBank[geometries.cyclinder] = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
    // creating sphere geometries
    for (i = 0; i < (maximumBallDetail - minimumBallDetail + 1); i += 1) {
        geometriesBank[geometries.sphere + i] = new THREE.SphereGeometry(1, minimumBallDetail + i, minimumBallDetail + i);
    }


    // For each pool we have a count of how many of those entries
    // are actually used in the current frame.
    // This is so that we can go through the scene graph and hide the unused objects.
    GraphicsCommands.objectsUsedInFrameCounts = [];


    // the "spinthingy" is because we want
    // users who type "box" to see that it's actually
    // a 3d environment. So the first few primitives
    // spin for a few moments when they are created.
    GraphicsCommands.doTheSpinThingy = true;
    GraphicsCommands.resetTheSpinThingy = false;


    GraphicsCommands.defaultNormalFill = true;
    GraphicsCommands.defaultNormalStroke = true;


    createObjectIfNeededAndDressWithCorrectMaterial = function (a, b, c, primitiveProperties, strokeTime, colorToBeUsed, alphaToBeUsed, applyDefaultNormalColor) {

        // this is to run the code twice. This should be neater
        // and turned into a function call really.

        var newObjectToBeAddedToTheScene = false,
            pooledObject,
            theAngle;

        pooledObject = objectPool[primitiveProperties.primitiveType][GraphicsCommands.objectsUsedInFrameCounts[primitiveProperties.primitiveType]];
        if (pooledObject === undefined) {
            // each pooled object contains a geometry, a line material,
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
                mesh: new primitiveProperties.THREEConstructor(geometriesBank[primitiveProperties.primitiveType]),
                initialSpinCountdown: SPIN_DURATION_IN_FRAMES
            };

            newObjectToBeAddedToTheScene = true;
            objectPool[primitiveProperties.primitiveType].push(pooledObject);
        }

        if (primitiveProperties.primitiveType === geometries.line) {
            if (pooledObject.lineMaterial === undefined) {
                logger("creating line material");
                pooledObject.lineMaterial = new THREE.LineBasicMaterial();
            }

            // associating normal material to the mesh
            pooledObject.lineMaterial.opacity = currentStrokeAlpha;
            pooledObject.lineMaterial.linewidth = GraphicsCommands.currentStrokeSize;

            if (currentStrokeColor === angleColor || GraphicsCommands.defaultNormalStroke) {
                theAngle = pooledObject.mesh.matrix.multiplyVector3(new THREE.Vector3(0, 1, 0)).normalize();
                pooledObject.lineMaterial.color.setHex(color(((theAngle.x + 1) / 2) * 255, ((theAngle.y + 1) / 2) * 255, ((theAngle.z + 1) / 2) * 255));
            } else {
                pooledObject.lineMaterial.color.setHex(currentStrokeColor);
            }

            pooledObject.mesh.material = pooledObject.lineMaterial;
        } else if (newObjectToBeAddedToTheScene || (colorToBeUsed === angleColor || applyDefaultNormalColor)) {
            // the first time we render a mesh we need to
            // render it with the material that takes the
            // bigger buffer space, see:
            // https://github.com/mrdoob/three.js/issues/1051
            // Another workaround would be to create a mesh
            // for each different type of material
            if (pooledObject.normalMaterial === undefined) {
                logger("creating normal material");
                pooledObject.normalMaterial = new THREE.MeshNormalMaterial();
            }
            pooledObject.normalMaterial.opacity = alphaToBeUsed;
            pooledObject.normalMaterial.wireframe = strokeTime;
            pooledObject.normalMaterial.wireframeLinewidth = GraphicsCommands.currentStrokeSize;
            pooledObject.normalMaterial.doubleSided = primitiveProperties.doubleSided;
            pooledObject.mesh.material = pooledObject.normalMaterial;
        } else if (!LightSystem.lightsAreOn) {
            if (pooledObject.basicMaterial === undefined) {
                pooledObject.basicMaterial = new THREE.MeshBasicMaterial();
            }
            pooledObject.basicMaterial.color.setHex(colorToBeUsed);
            pooledObject.basicMaterial.opacity = alphaToBeUsed;
            pooledObject.basicMaterial.wireframe = strokeTime;
            pooledObject.basicMaterial.wireframeLinewidth = GraphicsCommands.currentStrokeSize;
            pooledObject.basicMaterial.doubleSided = primitiveProperties.doubleSided;
            pooledObject.mesh.material = pooledObject.basicMaterial;

        } else {
            // lights are on
            if (pooledObject.lambertMaterial === undefined) {
                logger("creating lambert:" + currentFillColor + " " + currentFillAlpha + " " + LightSystem.ambientColor + " " + reflectValue + " " + refractValue);
                pooledObject.lambertMaterial = new THREE.MeshLambertMaterial();
            }
            pooledObject.lambertMaterial.color.setHex(colorToBeUsed);
            pooledObject.lambertMaterial.opacity = alphaToBeUsed;
            pooledObject.lambertMaterial.wireframe = strokeTime;
            pooledObject.lambertMaterial.wireframeLinewidth = GraphicsCommands.currentStrokeSize;
            pooledObject.lambertMaterial.doubleSided = primitiveProperties.doubleSided;
            pooledObject.lambertMaterial.ambient.setHex(LightSystem.ambientColor);
            pooledObject.lambertMaterial.reflectivity = reflectValue;
            pooledObject.lambertMaterial.refractionRatio = refractValue;
            pooledObject.mesh.material = pooledObject.lambertMaterial;
        }

        if (GraphicsCommands.resetTheSpinThingy) {
            pooledObject.initialSpinCountdown = SPIN_DURATION_IN_FRAMES;
            GraphicsCommands.resetTheSpinThingy = false;
            GraphicsCommands.doTheSpinThingy = true;
        }
        if (GraphicsCommands.doTheSpinThingy) {
            pooledObject.initialSpinCountdown -= 1;
        }
        if (pooledObject.initialSpinCountdown === -1) {
            GraphicsCommands.doTheSpinThingy = false;
        }

        pooledObject.mesh.isLine = primitiveProperties.isLine;
        pooledObject.mesh.isRectangle = primitiveProperties.isRectangle;
        pooledObject.mesh.isBox = primitiveProperties.isBox;
        pooledObject.mesh.isCylinder = primitiveProperties.isCylinder;
        pooledObject.mesh.isAmbientLight = primitiveProperties.isAmbientLight;
        pooledObject.mesh.isPointLight = primitiveProperties.isPointLight;
        pooledObject.mesh.isSphere = primitiveProperties.isSphere;
        pooledObject.mesh.doubleSided = primitiveProperties.doubleSided;


        GraphicsCommands.objectsUsedInFrameCounts[primitiveProperties.primitiveType] += 1;

        if (GraphicsCommands.doTheSpinThingy && pooledObject.initialSpinCountdown > 0) {
            MatrixCommands.pushMatrix();
            MatrixCommands.rotate(pooledObject.initialSpinCountdown / 50);
            logger(pooledObject.initialSpinCountdown);
        }

        pooledObject.mesh.matrixAutoUpdate = false;
        pooledObject.mesh.matrix.copy(MatrixCommands.getWorldMatrix());
        pooledObject.mesh.matrixWorldNeedsUpdate = true;

        if (GraphicsCommands.doTheSpinThingy && pooledObject.initialSpinCountdown > 0) {
            MatrixCommands.popMatrix();
        }

        // TODO: meshes should be built from geometries that are
        // ever so slight larger than the "fill" mesh so there
        // is no z-fighting...
        // constant 0.001 below is to avoid z-fighting
        if (a !== 1 || b !== 1 || c !== 1) {
            if (!strokeTime) {
                pooledObject.mesh.matrix.scale(new THREE.Vector3(a, b, c));
            } else {
                pooledObject.mesh.matrix.scale(new THREE.Vector3(a + 0.001, b + 0.001, c + 0.001));
            }
        }

        if (newObjectToBeAddedToTheScene) {
            ThreeJs.scene.add(pooledObject.mesh);
        }

    };


    commonPrimitiveDrawingLogic = function (a, b, c, primitiveProperties) {

        // b and c are not functional in some geometric
        // primitives, but we handle them here in all cases
        // to make the code uniform and unifiable
        if (a === undefined) {
            a = 1;
            b = 1;
            c = 1;
        } else if (b === undefined) {
            b = a;
            c = a;
        } else if (c === undefined) {
            c = 1;
        }

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
        // fill then don't draw the stroke, only draw the fill
        if ((primitiveProperties.thisGometryCanFill && doFill && (GraphicsCommands.currentStrokeSize === 0 || !doStroke || (GraphicsCommands.currentStrokeSize <= 1 && !GraphicsCommands.defaultNormalFill && !GraphicsCommands.defaultNormalStroke && currentStrokeColor === currentFillColor && currentFillAlpha === 1 && currentStrokeAlpha === 1))) || (GraphicsCommands.currentStrokeSize <= 1 && GraphicsCommands.defaultNormalFill && GraphicsCommands.defaultNormalStroke)) {
            createObjectIfNeededAndDressWithCorrectMaterial(a, b, c, primitiveProperties, false, currentFillColor, currentFillAlpha, GraphicsCommands.defaultNormalFill);
        } else if ((!doFill || !primitiveProperties.thisGometryCanFill) && doStroke) {
            // only doing the stroke
            createObjectIfNeededAndDressWithCorrectMaterial(a, b, c, primitiveProperties, true, currentStrokeColor, currentStrokeAlpha, GraphicsCommands.defaultNormalStroke);
            // doing both the fill and the stroke
        } else {
            createObjectIfNeededAndDressWithCorrectMaterial(a, b, c, primitiveProperties, true, currentStrokeColor, currentStrokeAlpha, GraphicsCommands.defaultNormalStroke);
            createObjectIfNeededAndDressWithCorrectMaterial(a, b, c, primitiveProperties, false, currentFillColor, currentFillAlpha, GraphicsCommands.defaultNormalFill);
        }

    };




    // TODO Note that lines have a "solid fill" mode
    // and something similar to the normalMaterial mode
    // but there is no equivalent to the lambert material
    // mode.
    // That could be done by somehow mixing the color of
    // an ambient light to the color of the stroke
    // (although which ambient light do you pick if there
    // is more than one?)
    window.line = GraphicsCommands.line = function (a, b, c) {

        // primitive-specific initialisations:
        var primitiveProperties = {
            thisGometryCanFill: false,
            thisGometryCanStroke: true,
            primitiveType: geometries.line,
            isLine: true,
            isRectangle: false,
            isBox: false,
            isCylinder: false,
            isAmbientLight: false,
            isPointLight: false,
            isSphere: 0,
            doubleSided: false,
            THREEConstructor: THREE.Line
        };
        // end of primitive-specific initialisations:

        commonPrimitiveDrawingLogic(a, b, c, primitiveProperties);
    };


    window.rect = GraphicsCommands.rect = function (a, b, c) {

        // primitive-specific initialisations:
        var primitiveProperties = {
            thisGometryCanFill: true,
            thisGometryCanStroke: true,
            primitiveType: geometries.rect,
            isLine: false,
            isRectangle: true,
            isBox: false,
            isCylinder: false,
            isAmbientLight: false,
            isPointLight: false,
            isSphere: 0,
            doubleSided: true,
            THREEConstructor: THREE.Mesh
        };
        // end of primitive-specific initialisations:

        commonPrimitiveDrawingLogic(a, b, c, primitiveProperties);
    };


    window.box = GraphicsCommands.box = function (a, b, c) {

        // primitive-specific initialisations:
        var primitiveProperties = {
            thisGometryCanFill: true,
            thisGometryCanStroke: true,
            primitiveType: geometries.box,
            isLine: false,
            isRectangle: false,
            isBox: true,
            isCylinder: false,
            isAmbientLight: false,
            isPointLight: false,
            isSphere: 0,
            doubleSided: false,
            THREEConstructor: THREE.Mesh
        };
        // end of primitive-specific initialisations:

        commonPrimitiveDrawingLogic(a, b, c, primitiveProperties);
    };


    window.peg = GraphicsCommands.peg = function (a, b, c) {

        // primitive-specific initialisations:
        var primitiveProperties = {
            thisGometryCanFill: true,
            thisGometryCanStroke: true,
            primitiveType: geometries.cylinder,
            isLine: false,
            isRectangle: false,
            isBox: false,
            isCylinder: true,
            isAmbientLight: false,
            isPointLight: false,
            isSphere: 0,
            doubleSided: false,
            THREEConstructor: THREE.Mesh
        };
        // end of primitive-specific initialisations:

        commonPrimitiveDrawingLogic(a, b, c, primitiveProperties);
    };


    window.ballDetail = GraphicsCommands.ballDetail = function (a) {
        if (a === undefined) {
            return;
        }
        if (a < 2) {
            a = 2;
        }
        if (a > 30) {
            a = 30;
        }
        GraphicsCommands.ballDetLevel = Math.round(a);
    };

    window.ball = GraphicsCommands.ball = function (a, b, c) {

        // primitive-specific initialisations:
        var primitiveProperties = {
            thisGometryCanFill: true,
            thisGometryCanStroke: true,
            primitiveType: geometries.sphere + GraphicsCommands.ballDetLevel - minimumBallDetail,
            isLine: false,
            isRectangle: false,
            isBox: false,
            isCylinder: false,
            isAmbientLight: false,
            isPointLight: false,
            isSphere: GraphicsCommands.ballDetLevel,
            doubleSided: false,
            THREEConstructor: THREE.Mesh
        };
        // end of primitive-specific initialisations:

        commonPrimitiveDrawingLogic(a, b, c, primitiveProperties);
    };


    // Modified fro Processing.js


    window.fill = GraphicsCommands.fill = function (r, g, b, a) {
        GraphicsCommands.defaultNormalFill = false;
        var c = color(r, g, b, a),
            crgb,
            ca;

        if (c === angleColor) {
            // this is so we can do a smart optimisation later
            // and not draw the wireframe is it happens to be the same color as
            // the fill
            GraphicsCommands.defaultNormalFill = true;
            crgb = c;
            if (r !== undefined) {
                ca = r / colorModeA;
            } else {
                ca = 1;
            }
        } else {
            crgb = color(redF(c), greenF(c), blueF(c));
            ca = alphaZeroToOne(c);
        }
        if (crgb === currentFillColor && ca === currentFillAlpha && doFill) {
            return;
        }
        doFill = true;
        currentFillColor = crgb;
        currentFillAlpha = ca;
    };

    /**
     * The noFill() function disables filling geometry. If both <b>noStroke()</b> and <b>noFill()</b>
     * are called, no shapes will be drawn to the screen.
     *
     * @see #fill()
     *
     */
    window.noFill = GraphicsCommands.noFill = function () {
        doFill = false;
        GraphicsCommands.defaultNormalFill = false;
    };

    /**
     * The stroke() function sets the color used to draw lines and borders around shapes. This color
     * is either specified in terms of the RGB or HSB color depending on the
     * current <b>colorMode()</b> (the default color space is RGB, with each
     * value in the range from 0 to 255).
     * <br><br>When using hexadecimal notation to specify a color, use "#" or
     * "0x" before the values (e.g. #CCFFAA, 0xFFCCFFAA). The # syntax uses six
     * digits to specify a color (the way colors are specified in HTML and CSS).
     * When using the hexadecimal notation starting with "0x", the hexadecimal
     * value must be specified with eight characters; the first two characters
     * define the alpha component and the remainder the red, green, and blue
     * components.
     * <br><br>The value for the parameter "gray" must be less than or equal
     * to the current maximum value as specified by <b>colorMode()</b>.
     * The default maximum value is 255.
     *
     * @param {int|float} gray    number specifying value between white and black
     * @param {int|float} value1  red or hue value
     * @param {int|float} value2  green or saturation value
     * @param {int|float} value3  blue or brightness value
     * @param {int|float} alpha   opacity of the stroke
     * @param {Color} color       any value of the color datatype
     * @param {int} hex           color value in hexadecimal notation (i.e. #FFCC00 or 0xFFFFCC00)
     *
     * @see #fill()
     * @see #noStroke()
     * @see #tint()
     * @see #background()
     * @see #colorMode()
     */

    window.stroke = GraphicsCommands.stroke = function (r, g, b, a) {
        GraphicsCommands.defaultNormalStroke = false;
        var c = color(r, g, b, a),
            crgb,
            ca;
        if (c === angleColor) {
            // this is so we can do a smart optimisation later
            // and not draw the wireframe is it happens to be the same color as
            // the fill
            GraphicsCommands.defaultNormalStroke = true;
            crgb = c;
            if (r !== undefined) {
                ca = r / colorModeA;
            } else {
                ca = 1;
            }
        } else {
            crgb = color(redF(c), greenF(c), blueF(c));
            ca = alphaZeroToOne(c);
        }
        if (crgb === currentStrokeColor && ca === currentStrokeAlpha && doStroke) {
            return;
        }
        doStroke = true;
        currentStrokeColor = crgb;
        currentStrokeAlpha = ca;
    };

    /**
     * The noStroke() function disables drawing the stroke (outline). If both <b>noStroke()</b> and
     * <b>noFill()</b> are called, no shapes will be drawn to the screen.
     *
     * @see #stroke()
     */
    window.noStroke = GraphicsCommands.noStroke = function () {
        doStroke = false;
    };

    window.strokeSize = GraphicsCommands.strokeSize = function (a) {
        if (a === undefined) {
            a = 1;
        } else if (a < 0) {
            a = 0;
        }
        GraphicsCommands.currentStrokeSize = a;
    };

    return GraphicsCommands;
};
