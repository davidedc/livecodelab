var createBackgroundPainter;

createBackgroundPainter = function(eventRouter, canvasForBackground, liveCodeLabCoreInstance) {
  "use strict";

  var BackgroundPainter, backGroundFraction, currentGradientStackValue, defaultGradientColor1, defaultGradientColor2, defaultGradientColor3, gradStack, previousGradientStackValue, whichDefaultBackground;
  gradStack = [];
  defaultGradientColor1 = orange;
  defaultGradientColor2 = red;
  defaultGradientColor3 = black;
  whichDefaultBackground = void 0;
  currentGradientStackValue = "";
  previousGradientStackValue = 0;
  BackgroundPainter = {};
  if (!canvasForBackground) {
    canvasForBackground = document.createElement("canvas");
  }
  BackgroundPainter.canvasForBackground = canvasForBackground;
  backGroundFraction = 1 / 15;
  canvasForBackground.width = Math.floor(window.innerWidth * backGroundFraction);
  canvasForBackground.height = Math.floor(window.innerHeight * backGroundFraction);
  BackgroundPainter.backgroundSceneContext = canvasForBackground.getContext("2d");
  BackgroundPainter.simpleGradient = function(a, b, c, d) {
    currentGradientStackValue = currentGradientStackValue + " " + a + "" + b + "" + c + "" + d + "null ";
    return gradStack.push({
      gradStacka: liveCodeLabCoreInstance.ColourFunctions.color(a),
      gradStackb: liveCodeLabCoreInstance.ColourFunctions.color(b),
      gradStackc: liveCodeLabCoreInstance.ColourFunctions.color(c),
      gradStackd: liveCodeLabCoreInstance.ColourFunctions.color(d),
      solid: null
    });
  };
  BackgroundPainter.background = function() {
    var a;
    a = liveCodeLabCoreInstance.ColourFunctions.color(arguments[0], arguments[1], arguments[2], arguments[3]);
    currentGradientStackValue = currentGradientStackValue + " null null null null " + a + " ";
    return gradStack.push({
      gradStacka: undefined,
      gradStackb: undefined,
      gradStackc: undefined,
      gradStackd: undefined,
      solid: a
    });
  };
  BackgroundPainter.paintARandomBackground = function() {
    if (whichDefaultBackground === undefined) {
      whichDefaultBackground = Math.floor(Math.random() * 5);
    } else {
      whichDefaultBackground = (whichDefaultBackground + 1) % 5;
    }
    switch (whichDefaultBackground) {
      case 0:
        defaultGradientColor1 = orange;
        defaultGradientColor2 = red;
        defaultGradientColor3 = black;
        $("#fakeStartingBlinkingCursor").css("color", "white");
        break;
      case 1:
        defaultGradientColor1 = white;
        defaultGradientColor2 = khaki;
        defaultGradientColor3 = peachpuff;
        $("#fakeStartingBlinkingCursor").css("color", "LightPink");
        break;
      case 2:
        defaultGradientColor1 = lightsteelblue;
        defaultGradientColor2 = lightcyan;
        defaultGradientColor3 = paleturquoise;
        $("#fakeStartingBlinkingCursor").css("color", "CadetBlue");
        break;
      case 3:
        defaultGradientColor1 = silver;
        defaultGradientColor2 = lightgrey;
        defaultGradientColor3 = gainsboro;
        $("#fakeStartingBlinkingCursor").css("color", "white");
        break;
      case 4:
        defaultGradientColor1 = liveCodeLabCoreInstance.ColourFunctions.color(155, 255, 155);
        defaultGradientColor2 = liveCodeLabCoreInstance.ColourFunctions.color(155, 255, 155);
        defaultGradientColor3 = liveCodeLabCoreInstance.ColourFunctions.color(155, 255, 155);
        $("#fakeStartingBlinkingCursor").css("color", "DarkOliveGreen");
    }
    BackgroundPainter.resetGradientStack();
    return BackgroundPainter.simpleGradientUpdateIfChanged();
  };
  BackgroundPainter.resetGradientStack = function() {
    currentGradientStackValue = "";
    gradStack = [];
    return BackgroundPainter.simpleGradient(defaultGradientColor1, defaultGradientColor2, defaultGradientColor3);
  };
  BackgroundPainter.simpleGradientUpdateIfChanged = function() {
    var color, diagonal, radgrad, scanningGradStack, _results;
    diagonal = void 0;
    radgrad = void 0;
    scanningGradStack = void 0;
    canvasForBackground = BackgroundPainter.canvasForBackground;
    color = liveCodeLabCoreInstance.ColourFunctions.color;
    if (currentGradientStackValue !== previousGradientStackValue) {
      previousGradientStackValue = currentGradientStackValue;
      diagonal = Math.sqrt(Math.pow(canvasForBackground.width / 2, 2) + Math.pow(canvasForBackground.height / 2, 2));
      scanningGradStack = 0;
      _results = [];
      while (scanningGradStack < gradStack.length) {
        if (gradStack[scanningGradStack].gradStacka !== undefined) {
          radgrad = BackgroundPainter.backgroundSceneContext.createLinearGradient(canvasForBackground.width / 2, 0, canvasForBackground.width / 2, canvasForBackground.height);
          radgrad.addColorStop(0, color.toString(gradStack[scanningGradStack].gradStacka));
          radgrad.addColorStop(0.5, color.toString(gradStack[scanningGradStack].gradStackb));
          radgrad.addColorStop(1, color.toString(gradStack[scanningGradStack].gradStackc));
          BackgroundPainter.backgroundSceneContext.globalAlpha = 1.0;
          BackgroundPainter.backgroundSceneContext.fillStyle = radgrad;
          BackgroundPainter.backgroundSceneContext.fillRect(0, 0, canvasForBackground.width, canvasForBackground.height);
        } else {
          BackgroundPainter.backgroundSceneContext.globalAlpha = 1.0;
          BackgroundPainter.backgroundSceneContext.fillStyle = color.toString(gradStack[scanningGradStack].solid);
          BackgroundPainter.backgroundSceneContext.fillRect(0, 0, canvasForBackground.width, canvasForBackground.height);
        }
        _results.push(scanningGradStack++);
      }
      return _results;
    }
  };
  window.simpleGradient = BackgroundPainter.simpleGradient;
  window.background = BackgroundPainter.background;
  return BackgroundPainter;
};
