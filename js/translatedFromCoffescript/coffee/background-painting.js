"use strict";

var BackgroundPainter;

BackgroundPainter = (function() {

  function BackgroundPainter(canvasForBackground, liveCodeLabCoreInstance) {
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
    var color, diagonal, radgrad, scanningGradStack, _results;
    diagonal = void 0;
    radgrad = void 0;
    scanningGradStack = void 0;
    color = this.liveCodeLabCoreInstance.colourFunctions.color;
    if (this.currentGradientStackValue !== this.previousGradientStackValue) {
      this.previousGradientStackValue = this.currentGradientStackValue;
      diagonal = Math.sqrt(Math.pow(this.canvasForBackground.width / 2, 2) + Math.pow(this.canvasForBackground.height / 2, 2));
      scanningGradStack = 0;
      _results = [];
      while (scanningGradStack < this.gradStack.length) {
        if (this.gradStack[scanningGradStack].gradStacka !== undefined) {
          radgrad = this.backgroundSceneContext.createLinearGradient(this.canvasForBackground.width / 2, 0, this.canvasForBackground.width / 2, this.canvasForBackground.height);
          radgrad.addColorStop(0, color.toString(this.gradStack[scanningGradStack].gradStacka));
          radgrad.addColorStop(0.5, color.toString(this.gradStack[scanningGradStack].gradStackb));
          radgrad.addColorStop(1, color.toString(this.gradStack[scanningGradStack].gradStackc));
          this.backgroundSceneContext.globalAlpha = 1.0;
          this.backgroundSceneContext.fillStyle = radgrad;
          this.backgroundSceneContext.fillRect(0, 0, this.canvasForBackground.width, this.canvasForBackground.height);
        } else {
          this.backgroundSceneContext.globalAlpha = 1.0;
          this.backgroundSceneContext.fillStyle = color.toString(this.gradStack[scanningGradStack].solid);
          this.backgroundSceneContext.fillRect(0, 0, this.canvasForBackground.width, this.canvasForBackground.height);
        }
        _results.push(scanningGradStack++);
      }
      return _results;
    }
  };

  return BackgroundPainter;

})();
