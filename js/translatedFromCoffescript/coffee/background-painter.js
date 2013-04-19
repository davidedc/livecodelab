/*
## The user can issue multiple solid fill and gradient fill commands
## and they are all painted on top of each other according to the
## order they have been issued in.
## So for example you can have one gradient and then
## a second one painted over it that uses some transparency.
## 
## This is why solid and gradient fills are all kept in an array
## and each time the user issues one of the two commands, an
## element is added to the array.
## 
## Both solid and gradient fills are stored as elements in the
## array, all elements are the same and accommodate for a description
## that either case (solid/gradient).
## 
## The background/gradients are drawn on a separate 2D canvas
## and we avoid repainting that canvas over and over if the
## painting commands stay the same (i.e. colors of their
## arguments and the order of the commands) across frames.
## 
## For quickly determining whether the order/content of the commands
## has changed across frames,
## a string is kept that represents the whole stack of commands
## issued in the current frame, and similarly the "previous frame"
## string representation is also kept.
## So it's kind of like a simplified JSON representation if you will.
## 
## If the strings are the same across frames, then the 2D layer of
## the background is not repainted, otherwise the array is iterated
## and each background/gradient is painted anew.
## 
## Note that we are not trying to be too clever here - for example
## a solid fill effectively invalidates the contents of the previous
## elements of the array, so we could discard those when such
## a command is issued.
*/

var BackgroundPainter;

BackgroundPainter = (function() {
  "use strict";  function BackgroundPainter(canvasForBackground, liveCodeLabCoreInstance) {
    var backGroundFraction,
      _this = this;

    this.canvasForBackground = canvasForBackground;
    this.liveCodeLabCoreInstance = liveCodeLabCoreInstance;
    this.gradStack = [];
    this.defaultGradientColor1 = orange;
    this.defaultGradientColor2 = red;
    this.defaultGradientColor3 = black;
    this.whichDefaultBackground = void 0;
    this.currentGradientStackValue = "";
    this.previousGradientStackValue = 0;
    if (!this.canvasForBackground) {
      this.canvasForBackground = document.createElement("canvas");
    }
    backGroundFraction = 1 / 15;
    this.canvasForBackground.width = Math.floor(window.innerWidth * backGroundFraction);
    this.canvasForBackground.height = Math.floor(window.innerHeight * backGroundFraction);
    this.backgroundSceneContext = this.canvasForBackground.getContext("2d");
    window.simpleGradient = function(a, b, c) {
      return _this.simpleGradient(a, b, c);
    };
    window.background = function(a, b, c) {
      return _this.background(a, b, c);
    };
  }

  BackgroundPainter.prototype.simpleGradient = function(a, b, c, d) {
    this.currentGradientStackValue = this.currentGradientStackValue + " " + a + "" + b + "" + c + "" + d + "null ";
    return this.gradStack.push({
      gradStacka: this.liveCodeLabCoreInstance.colourFunctions.color(a),
      gradStackb: this.liveCodeLabCoreInstance.colourFunctions.color(b),
      gradStackc: this.liveCodeLabCoreInstance.colourFunctions.color(c),
      gradStackd: this.liveCodeLabCoreInstance.colourFunctions.color(d),
      solid: null
    });
  };

  BackgroundPainter.prototype.background = function() {
    var a;

    a = this.liveCodeLabCoreInstance.colourFunctions.color(arguments[0], arguments[1], arguments[2], arguments[3]);
    this.currentGradientStackValue = this.currentGradientStackValue + " null null null null " + a + " ";
    return this.gradStack.push({
      gradStacka: undefined,
      gradStackb: undefined,
      gradStackc: undefined,
      gradStackd: undefined,
      solid: a
    });
  };

  BackgroundPainter.prototype.paintARandomBackground = function() {
    if (this.whichDefaultBackground === undefined) {
      this.whichDefaultBackground = Math.floor(Math.random() * 5);
    } else {
      this.whichDefaultBackground = (this.whichDefaultBackground + 1) % 5;
    }
    switch (this.whichDefaultBackground) {
      case 0:
        this.defaultGradientColor1 = orange;
        this.defaultGradientColor2 = red;
        this.defaultGradientColor3 = black;
        $("#fakeStartingBlinkingCursor").css("color", "white");
        break;
      case 1:
        this.defaultGradientColor1 = white;
        this.defaultGradientColor2 = khaki;
        this.defaultGradientColor3 = peachpuff;
        $("#fakeStartingBlinkingCursor").css("color", "LightPink");
        break;
      case 2:
        this.defaultGradientColor1 = lightsteelblue;
        this.defaultGradientColor2 = lightcyan;
        this.defaultGradientColor3 = paleturquoise;
        $("#fakeStartingBlinkingCursor").css("color", "CadetBlue");
        break;
      case 3:
        this.defaultGradientColor1 = silver;
        this.defaultGradientColor2 = lightgrey;
        this.defaultGradientColor3 = gainsboro;
        $("#fakeStartingBlinkingCursor").css("color", "white");
        break;
      case 4:
        this.defaultGradientColor1 = this.liveCodeLabCoreInstance.colourFunctions.color(155, 255, 155);
        this.defaultGradientColor2 = this.liveCodeLabCoreInstance.colourFunctions.color(155, 255, 155);
        this.defaultGradientColor3 = this.liveCodeLabCoreInstance.colourFunctions.color(155, 255, 155);
        $("#fakeStartingBlinkingCursor").css("color", "DarkOliveGreen");
    }
    this.resetGradientStack();
    return this.simpleGradientUpdateIfChanged();
  };

  BackgroundPainter.prototype.resetGradientStack = function() {
    this.currentGradientStackValue = "";
    this.gradStack = [];
    return this.simpleGradient(this.defaultGradientColor1, this.defaultGradientColor2, this.defaultGradientColor3);
  };

  BackgroundPainter.prototype.simpleGradientUpdateIfChanged = function() {
    var color, diagonal, radgrad, scanningGradStack, _i, _len, _ref, _results;

    diagonal = void 0;
    radgrad = void 0;
    color = this.liveCodeLabCoreInstance.colourFunctions.color;
    if (this.currentGradientStackValue !== this.previousGradientStackValue) {
      this.previousGradientStackValue = this.currentGradientStackValue;
      diagonal = Math.sqrt(Math.pow(this.canvasForBackground.width / 2, 2) + Math.pow(this.canvasForBackground.height / 2, 2));
      _ref = this.gradStack;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        scanningGradStack = _ref[_i];
        if (scanningGradStack.gradStacka !== undefined) {
          radgrad = this.backgroundSceneContext.createLinearGradient(this.canvasForBackground.width / 2, 0, this.canvasForBackground.width / 2, this.canvasForBackground.height);
          radgrad.addColorStop(0, color.toString(scanningGradStack.gradStacka));
          radgrad.addColorStop(0.5, color.toString(scanningGradStack.gradStackb));
          radgrad.addColorStop(1, color.toString(scanningGradStack.gradStackc));
          this.backgroundSceneContext.globalAlpha = 1.0;
          this.backgroundSceneContext.fillStyle = radgrad;
          _results.push(this.backgroundSceneContext.fillRect(0, 0, this.canvasForBackground.width, this.canvasForBackground.height));
        } else {
          this.backgroundSceneContext.globalAlpha = 1.0;
          this.backgroundSceneContext.fillStyle = color.toString(scanningGradStack.solid);
          _results.push(this.backgroundSceneContext.fillRect(0, 0, this.canvasForBackground.width, this.canvasForBackground.height));
        }
      }
      return _results;
    }
  };

  return BackgroundPainter;

})();
