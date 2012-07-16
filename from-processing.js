// Functions taken from processing.js
/**
 * NOTE: in releases we replace symbolic Constants.* names with their values.
 * Using Constants.* in code below is fine.  See tools/rewrite-Constants.js.
 */
var Constants = {
  // Color modes
  RGB: 1,
  ARGB: 2,
  HSB: 3,
  ALPHA: 4,
  CMYK: 5,

  // Blend modes
  REPLACE: 0,
  BLEND: 1 << 0,
  ADD: 1 << 1,
  SUBTRACT: 1 << 2,
  LIGHTEST: 1 << 3,
  DARKEST: 1 << 4,
  DIFFERENCE: 1 << 5,
  EXCLUSION: 1 << 6,
  MULTIPLY: 1 << 7,
  SCREEN: 1 << 8,
  OVERLAY: 1 << 9,
  HARD_LIGHT: 1 << 10,
  SOFT_LIGHT: 1 << 11,
  DODGE: 1 << 12,
  BURN: 1 << 13,

  // Color component bit masks
  ALPHA_MASK: 0xff000000,
  RED_MASK: 0x00ff0000,
  GREEN_MASK: 0x0000ff00,
  BLUE_MASK: 0x000000ff,

};

var doFill = true,
  fillStyle = [1.0, 1.0, 1.0, 1.0],
  isFillDirty = true,
  doStroke = true,
  strokeStyle = [0.0, 0.0, 0.0, 1.0],
  isStrokeDirty = true,
  lineWidth = 1,
  colorModeA = 255,
  colorModeX = 255,
  colorModeY = 255,
  colorModeZ = 255,
  curColorMode = Constants.RGB;

/**
 * Determines the largest value in a sequence of numbers.
 *
 * @param {int|float} value1         int or float
 * @param {int|float} value2         int or float
 * @param {int|float} value3         int or float
 * @param {int|float} array          int or float array
 *
 * @returns {int|float}
 *
 * @see min
 */
var max = function() {
  if (arguments.length === 2) {
    return arguments[0] < arguments[1] ? arguments[1] : arguments[0];
  }
  var numbers = arguments.length === 1 ? arguments[0] : arguments; // if single argument, array is used
  if (!("length" in numbers && numbers.length > 0)) {
    throw "Non-empty array is expected";
  }
  var max = numbers[0],
    count = numbers.length;
  for (var i = 1; i < count; ++i) {
    if (max < numbers[i]) {
      max = numbers[i];
    }
  }
  return max;
};

/**
 * Determines the smallest value in a sequence of numbers.
 *
 * @param {int|float} value1         int or float
 * @param {int|float} value2         int or float
 * @param {int|float} value3         int or float
 * @param {int|float} array          int or float array
 *
 * @returns {int|float}
 *
 * @see max
 */
var min = function() {
  if (arguments.length === 2) {
    return arguments[0] < arguments[1] ? arguments[0] : arguments[1];
  }
  var numbers = arguments.length === 1 ? arguments[0] : arguments; // if single argument, array is used
  if (!("length" in numbers && numbers.length > 0)) {
    throw "Non-empty array is expected";
  }
  var min = numbers[0],
    count = numbers.length;
  for (var i = 1; i < count; ++i) {
    if (min > numbers[i]) {
      min = numbers[i];
    }
  }
  return min;
};

function color$4(aValue1, aValue2, aValue3, aValue4) {
  var r, g, b, a;

  if (curColorMode === Constants.HSB) {
    var rgb = color.toRGB(aValue1, aValue2, aValue3);
    r = rgb[0];
    g = rgb[1];
    b = rgb[2];
  } else {
    r = Math.round(255 * (aValue1 / colorModeX));
    g = Math.round(255 * (aValue2 / colorModeY));
    b = Math.round(255 * (aValue3 / colorModeZ));
  }

  a = Math.round(255 * (aValue4 / colorModeA));

  // Limit values less than 0 and greater than 255
  r = (r < 0) ? 0 : r;
  g = (g < 0) ? 0 : g;
  b = (b < 0) ? 0 : b;
  a = (a < 0) ? 0 : a;
  r = (r > 255) ? 255 : r;
  g = (g > 255) ? 255 : g;
  b = (b > 255) ? 255 : b;
  a = (a > 255) ? 255 : a;

  // Create color int
  return (a << 24) & Constants.ALPHA_MASK | (r << 16) & Constants.RED_MASK | (g << 8) & Constants.GREEN_MASK | b & Constants.BLUE_MASK;
}

function color$2(aValue1, aValue2) {
  var a;

  if (aValue1 === angleColor) return angleColor;

  // Color int and alpha
  if (aValue1 & Constants.ALPHA_MASK) {
    a = Math.round(255 * (aValue2 / colorModeA));
    // Limit values less than 0 and greater than 255
    a = (a > 255) ? 255 : a;
    a = (a < 0) ? 0 : a;

    return aValue1 - (aValue1 & Constants.ALPHA_MASK) + ((a << 24) & Constants.ALPHA_MASK);
  }
  // Grayscale and alpha
  if (curColorMode === Constants.RGB) {
    return color$4(aValue1, aValue1, aValue1, aValue2);
  }
  if (curColorMode === Constants.HSB) {
    return color$4(0, 0, (aValue1 / colorModeX) * colorModeZ, aValue2);
  }
}

function color$1(aValue1) {
  // Grayscale
  if (aValue1 <= colorModeX && aValue1 >= 0) {
    if (curColorMode === Constants.RGB) {
      return color$4(aValue1, aValue1, aValue1, colorModeA);
    }
    if (curColorMode === Constants.HSB) {
      return color$4(0, 0, (aValue1 / colorModeX) * colorModeZ, colorModeA);
    }
  }
  // Color int
  if (aValue1) {
    if (aValue1 > 2147483647) {
      // Java Overflow
      aValue1 -= 4294967296;
    }
    return aValue1;
  }
}

/**
 * Creates colors for storing in variables of the color datatype. The parameters are
 * interpreted as RGB or HSB values depending on the current colorMode(). The default
 * mode is RGB values from 0 to 255 and therefore, the function call color(255, 204, 0)
 * will return a bright yellow color. More about how colors are stored can be found in
 * the reference for the color datatype.
 *
 * @param {int|float} aValue1        red or hue or grey values relative to the current color range.
 * Also can be color value in hexadecimal notation (i.e. #FFCC00 or 0xFFFFCC00)
 * @param {int|float} aValue2        green or saturation values relative to the current color range
 * @param {int|float} aValue3        blue or brightness values relative to the current color range
 * @param {int|float} aValue4        relative to current color range. Represents alpha
 *
 * @returns {color} the color
 *
 * @see colorMode
 */
var color = function(aValue1, aValue2, aValue3, aValue4) {
    //alert("color");
    // 4 arguments: (R, G, B, A) or (H, S, B, A)
    if (aValue1 !== undefined && aValue2 !== undefined && aValue3 !== undefined && aValue4 !== undefined) {
      return color$4(aValue1, aValue2, aValue3, aValue4);
    }

    // 3 arguments: (R, G, B) or (H, S, B)
    if (aValue1 !== undefined && aValue2 !== undefined && aValue3 !== undefined) {
      return color$4(aValue1, aValue2, aValue3, colorModeA);
    }

    // 2 arguments: (Color, A) or (Grayscale, A)
    if (aValue1 !== undefined && aValue2 !== undefined) {
      return color$2(aValue1, aValue2);
    }

    // 1 argument: (Grayscale) or (Color)
    if (typeof aValue1 === "number") {
      return color$1(aValue1);
    }

    // Default
    return color$4(colorModeX, colorModeY, colorModeZ, colorModeA);
  };

// Ease of use function to extract the colour bits into a string
color.toString = function(colorInt) {
  return "rgba(" + ((colorInt & Constants.RED_MASK) >>> 16) + "," + ((colorInt & Constants.GREEN_MASK) >>> 8) + "," + ((colorInt & Constants.BLUE_MASK)) + "," + ((colorInt & Constants.ALPHA_MASK) >>> 24) / 255 + ")";
};

// Easy of use function to pack rgba values into a single bit-shifted color int.
color.toInt = function(r, g, b, a) {
  return (a << 24) & Constants.ALPHA_MASK | (r << 16) & Constants.RED_MASK | (g << 8) & Constants.GREEN_MASK | b & Constants.BLUE_MASK;
};

// Creates a simple array in [R, G, B, A] format, [255, 255, 255, 255]
color.toArray = function(colorInt) {
  return [(colorInt & Constants.RED_MASK) >>> 16, (colorInt & Constants.GREEN_MASK) >>> 8, colorInt & Constants.BLUE_MASK, (colorInt & Constants.ALPHA_MASK) >>> 24];
};

// Creates a WebGL color array in [R, G, B, A] format. WebGL wants the color ranges between 0 and 1, [1, 1, 1, 1]
color.toGLArray = function(colorInt) {
  return [((colorInt & Constants.RED_MASK) >>> 16) / 255, ((colorInt & Constants.GREEN_MASK) >>> 8) / 255, (colorInt & Constants.BLUE_MASK) / 255, ((colorInt & Constants.ALPHA_MASK) >>> 24) / 255];
};

// HSB conversion function from Mootools, MIT Licensed
color.toRGB = function(h, s, b) {
  // Limit values greater than range
  h = (h > colorModeX) ? colorModeX : h;
  s = (s > colorModeY) ? colorModeY : s;
  b = (b > colorModeZ) ? colorModeZ : b;

  h = (h / colorModeX) * 360;
  s = (s / colorModeY) * 100;
  b = (b / colorModeZ) * 100;

  var br = Math.round(b / 100 * 255);

  if (s === 0) { // Grayscale
    return [br, br, br];
  }
  var hue = h % 360;
  var f = hue % 60;
  var p = Math.round((b * (100 - s)) / 10000 * 255);
  var q = Math.round((b * (6000 - s * f)) / 600000 * 255);
  var t = Math.round((b * (6000 - s * (60 - f))) / 600000 * 255);
  switch (Math.floor(hue / 60)) {
  case 0:
    return [br, t, p];
  case 1:
    return [q, br, p];
  case 2:
    return [p, br, t];
  case 3:
    return [p, q, br];
  case 4:
    return [t, p, br];
  case 5:
    return [br, p, q];
  }
};

function colorToHSB(colorInt) {
  var red, green, blue;

  red = ((colorInt & Constants.RED_MASK) >>> 16) / 255;
  green = ((colorInt & Constants.GREEN_MASK) >>> 8) / 255;
  blue = (colorInt & Constants.BLUE_MASK) / 255;

  var max = max(max(red, green), blue),
    min = min(min(red, green), blue),
    hue, saturation;

  if (min === max) {
    return [0, 0, max * colorModeZ];
  }
  saturation = (max - min) / max;

  if (red === max) {
    hue = (green - blue) / (max - min);
  } else if (green === max) {
    hue = 2 + ((blue - red) / (max - min));
  } else {
    hue = 4 + ((red - green) / (max - min));
  }

  hue /= 6;

  if (hue < 0) {
    hue += 1;
  } else if (hue > 1) {
    hue -= 1;
  }
  return [hue * colorModeX, saturation * colorModeY, max * colorModeZ];
}

/**
 * Extracts the brightness value from a color.
 *
 * @param {color} colInt any value of the color datatype
 *
 * @returns {float} The brightness color value.
 *
 * @see red
 * @see green
 * @see blue
 * @see hue
 * @see saturation
 */
var brightness = function(colInt) {
  return colorToHSB(colInt)[2];
};

/**
 * Extracts the saturation value from a color.
 *
 * @param {color} colInt any value of the color datatype
 *
 * @returns {float} The saturation color value.
 *
 * @see red
 * @see green
 * @see blue
 * @see hue
 * @see brightness
 */
var saturation = function(colInt) {
  return colorToHSB(colInt)[1];
};

/**
 * Extracts the hue value from a color.
 *
 * @param {color} colInt any value of the color datatype
 *
 * @returns {float} The hue color value.
 *
 * @see red
 * @see green
 * @see blue
 * @see saturation
 * @see brightness
 */
var hue = function(colInt) {
  return colorToHSB(colInt)[0];
};

/**
 * Extracts the red value from a color, scaled to match current colorMode().
 * This value is always returned as a float so be careful not to assign it to an int value.
 *
 * @param {color} aColor any value of the color datatype
 *
 * @returns {float} The red color value.
 *
 * @see green
 * @see blue
 * @see alpha
 * @see >> right shift
 * @see hue
 * @see saturation
 * @see brightness
 */
var redF = function(aColor) {
  return ((aColor & Constants.RED_MASK) >>> 16) / 255 * colorModeX;
};

/**
 * Extracts the green value from a color, scaled to match current colorMode().
 * This value is always returned as a float so be careful not to assign it to an int value.
 *
 * @param {color} aColor any value of the color datatype
 *
 * @returns {float} The green color value.
 *
 * @see red
 * @see blue
 * @see alpha
 * @see >> right shift
 * @see hue
 * @see saturation
 * @see brightness
 */
var greenF = function(aColor) {
  return ((aColor & Constants.GREEN_MASK) >>> 8) / 255 * colorModeY;
};

/**
 * Extracts the blue value from a color, scaled to match current colorMode().
 * This value is always returned as a float so be careful not to assign it to an int value.
 *
 * @param {color} aColor any value of the color datatype
 *
 * @returns {float} The blue color value.
 *
 * @see red
 * @see green
 * @see alpha
 * @see >> right shift
 * @see hue
 * @see saturation
 * @see brightness
 */
var blueF = function(aColor) {
  return (aColor & Constants.BLUE_MASK) / 255 * colorModeZ;
};

/**
 * Extracts the alpha value from a color, scaled to match current colorMode().
 * This value is always returned as a float so be careful not to assign it to an int value.
 *
 * @param {color} aColor any value of the color datatype
 *
 * @returns {float} The alpha color value.
 *
 * @see red
 * @see green
 * @see blue
 * @see >> right shift
 * @see hue
 * @see saturation
 * @see brightness
 */
var alpha = function(aColor) {
  return ((aColor & Constants.ALPHA_MASK) >>> 24) / 255 * colorModeA;
};
var alphaZeroToOne = function(aColor) {
  return ((aColor & Constants.ALPHA_MASK) >>> 24) / 255;
};

/**
    * Calculates a number between two numbers at a specific increment. The amt  parameter is the
    * amount to interpolate between the two values where 0.0 equal to the first point, 0.1 is very
    * near the first point, 0.5 is half-way in between, etc. The lerp function is convenient for
    * creating motion along a straight path and for drawing dotted lines.
    *
    * @param {int|float} value1       float or int: first value
    * @param {int|float} value2       float or int: second value
    * @param {int|float} amt          float: between 0.0 and 1.0
    *
    * @returns {float}
    *
    * @see curvePoint
    * @see bezierPoint
    */
var lerp = function(value1, value2, amt) {
  return ((value2 - value1) * amt) + value1;
};
    
    
/**
 * Calculates a color or colors between two colors at a specific increment.
 * The amt parameter is the amount to interpolate between the two values where 0.0
 * equal to the first point, 0.1 is very near the first point, 0.5 is half-way in between, etc.
 *
 * @param {color} c1     interpolate from this color
 * @param {color} c2     interpolate to this color
 * @param {float} amt    between 0.0 and 1.0
 *
 * @returns {float} The blended color.
 *
 * @see blendColor
 * @see color
 */
var lerpColor = function(c1, c2, amt) {
  var r, g, b, a, r1, g1, b1, a1, r2, g2, b2, a2;
  var hsb1, hsb2, rgb, h, s;
  var colorBits1 = color(c1);
  var colorBits2 = color(c2);

  if (curColorMode === Constants.HSB) {
    // Special processing for HSB mode.
    // Get HSB and Alpha values for Color 1 and 2
    hsb1 = colorToHSB(colorBits1);
    a1 = ((colorBits1 & Constants.ALPHA_MASK) >>> 24) / colorModeA;
    hsb2 = colorToHSB(colorBits2);
    a2 = ((colorBits2 & Constants.ALPHA_MASK) >>> 24) / colorModeA;

    // Return lerp value for each channel, for HSB components
    h = lerp(hsb1[0], hsb2[0], amt);
    s = lerp(hsb1[1], hsb2[1], amt);
    b = lerp(hsb1[2], hsb2[2], amt);
    rgb = color.toRGB(h, s, b);
    // ... and for Alpha-range
    a = lerp(a1, a2, amt) * colorModeA;

    return (a << 24) & Constants.ALPHA_MASK | (rgb[0] << 16) & Constants.RED_MASK | (rgb[1] << 8) & Constants.GREEN_MASK | rgb[2] & Constants.BLUE_MASK;
  }

  // Get RGBA values for Color 1 to floats
  r1 = (colorBits1 & Constants.RED_MASK) >>> 16;
  g1 = (colorBits1 & Constants.GREEN_MASK) >>> 8;
  b1 = (colorBits1 & Constants.BLUE_MASK);
  a1 = ((colorBits1 & Constants.ALPHA_MASK) >>> 24) / colorModeA;

  // Get RGBA values for Color 2 to floats
  r2 = (colorBits2 & Constants.RED_MASK) >>> 16;
  g2 = (colorBits2 & Constants.GREEN_MASK) >>> 8;
  b2 = (colorBits2 & Constants.BLUE_MASK);
  a2 = ((colorBits2 & Constants.ALPHA_MASK) >>> 24) / colorModeA;

  // Return lerp value for each channel, INT for color, Float for Alpha-range
  r = lerp(r1, r2, amt) | 0;
  g = lerp(g1, g2, amt) | 0;
  b = lerp(b1, b2, amt) | 0;
  a = lerp(a1, a2, amt) * colorModeA;

  return (a << 24) & Constants.ALPHA_MASK | (r << 16) & Constants.RED_MASK | (g << 8) & Constants.GREEN_MASK | b & Constants.BLUE_MASK;
};

/**
 * Changes the way Processing interprets color data. By default, fill(), stroke(), and background()
 * colors are set by values between 0 and 255 using the RGB color model. It is possible to change the
 * numerical range used for specifying colors and to switch color systems. For example, calling colorMode(RGB, 1.0)
 * will specify that values are specified between 0 and 1. The limits for defining colors are altered by setting the
 * parameters range1, range2, range3, and range 4.
 *
 * @param {MODE} mode Either RGB or HSB, corresponding to Red/Green/Blue and Hue/Saturation/Brightness
 * @param {int|float} range              range for all color elements
 * @param {int|float} range1             range for the red or hue depending on the current color mode
 * @param {int|float} range2             range for the green or saturation depending on the current color mode
 * @param {int|float} range3             range for the blue or brightness depending on the current color mode
 * @param {int|float} range4             range for the alpha
 *
 * @returns none
 *
 * @see background
 * @see fill
 * @see stroke
 */
var colorMode = function() { // mode, range1, range2, range3, range4
  curColorMode = arguments[0];
  if (arguments.length > 1) {
    colorModeX = arguments[1];
    colorModeY = arguments[2] || arguments[1];
    colorModeZ = arguments[3] || arguments[1];
    colorModeA = arguments[4] || arguments[1];
  }
};

/**
 * Blends two color values together based on the blending mode given as the MODE parameter.
 * The possible modes are described in the reference for the blend() function.
 *
 * @param {color} c1 color: the first color to blend
 * @param {color} c2 color: the second color to blend
 * @param {MODE} MODE Either BLEND, ADD, SUBTRACT, DARKEST, LIGHTEST, DIFFERENCE, EXCLUSION, MULTIPLY,
 * SCREEN, OVERLAY, HARD_LIGHT, SOFT_LIGHT, DODGE, or BURN
 *
 * @returns {float} The blended color.
 *
 * @see blend
 * @see color
 */
var blendColor = function(c1, c2, mode) {
  if (mode === Constants.REPLACE) {
    return modes.replace(c1, c2);
  } else if (mode === Constants.BLEND) {
    return modes.blend(c1, c2);
  } else if (mode === Constants.ADD) {
    return modes.add(c1, c2);
  } else if (mode === Constants.SUBTRACT) {
    return modes.subtract(c1, c2);
  } else if (mode === Constants.LIGHTEST) {
    return modes.lightest(c1, c2);
  } else if (mode === Constants.DARKEST) {
    return modes.darkest(c1, c2);
  } else if (mode === Constants.DIFFERENCE) {
    return modes.difference(c1, c2);
  } else if (mode === Constants.EXCLUSION) {
    return modes.exclusion(c1, c2);
  } else if (mode === Constants.MULTIPLY) {
    return modes.multiply(c1, c2);
  } else if (mode === Constants.SCREEN) {
    return modes.screen(c1, c2);
  } else if (mode === Constants.HARD_LIGHT) {
    return modes.hard_light(c1, c2);
  } else if (mode === Constants.SOFT_LIGHT) {
    return modes.soft_light(c1, c2);
  } else if (mode === Constants.OVERLAY) {
    return modes.overlay(c1, c2);
  } else if (mode === Constants.DODGE) {
    return modes.dodge(c1, c2);
  } else if (mode === Constants.BURN) {
    return modes.burn(c1, c2);
  }
};

var currentFillAlpha = 1;
var currentFillColor = 0xFFFFFF;
var defaultNormalFill = true;
var defaultNormalStroke = true;
// lowest than any 32 bit color is a special
// color that paints based on normals.
var angleColor = -16777217;
var fill = function() {
  defaultNormalFill = false;
  var c = color(arguments[0], arguments[1], arguments[2], arguments[3]);
  var crgb;
  var ca;
  //log("fillColor: "+c);
  if (c === angleColor) {
    // this is so we can do a smart optimisation later
    // and not draw the wireframe is it happens to be the same color as
    // the fill
    defaultNormalFill = true;
    //log("yes it's normal color ");
    crgb = c;
    if (arguments[1] !== undefined) {
      //log("passed alpha: " + arguments[1]);
      ca = arguments[1] / colorModeA;
      //log("calculated alpha: " + ca);
    } else {
      ca = 1;
    }
  } else {
    crgb = color(redF(c), greenF(c), blueF(c));
    ca = alphaZeroToOne(c);
  }
  //log("crgb ca "+crgb + " " + ca);
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
var noFill = function() {
  doFill = false;
  defaultNormalFill = false;
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
var currentStrokeAlpha = 1;
var currentStrokeColor = 0x000000;
var stroke = function() {
    defaultNormalStroke = false;
    var c = color(arguments[0], arguments[1], arguments[2], arguments[3]);
    var crgb;
    var ca;
    if (c === angleColor) {
      // this is so we can do a smart optimisation later
      // and not draw the wireframe is it happens to be the same color as
      // the fill
      defaultNormalStroke = true;
      //log("yes it's normal color ");
      crgb = c;
      if (arguments[1] !== undefined) {
        //log("passed alpha: " + arguments[1]);
        ca = arguments[1] / colorModeA;
        //log("calculated alpha: " + ca);
      } else {
        ca = 1;
      }
    } else {
      crgb = color(redF(c), greenF(c), blueF(c));
      ca = alphaZeroToOne(c);
    }
    //log("crgb ca "+crgb + " " + ca);
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
var noStroke = function() {
  doStroke = false;
};

var strokeSize = function(a) {
  if (a === undefined) a = 1;
  else if (a < 0) a = 0;
  currentStrokeSize = a;
};

// blending modes
    /**
    * These are internal blending modes used for BlendColor()
    *
    * @param {Color} c1       First Color to blend
    * @param {Color} c2       Second Color to blend
    *
    * @returns {Color}        The blended Color
    *
    * @see BlendColor
    * @see Blend
    */
var modes = (function() {
      var ALPHA_MASK = Constants.ALPHA_MASK,
        RED_MASK = Constants.RED_MASK,
        GREEN_MASK = Constants.GREEN_MASK,
        BLUE_MASK = Constants.BLUE_MASK,
        min = Math.min,
        max = Math.max;

      function applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb) {
        var a = min(((c1 & 0xff000000) >>> 24) + f, 0xff) << 24;

        var r = (ar + (((cr - ar) * f) >> 8));
        r = ((r < 0) ? 0 : ((r > 255) ? 255 : r)) << 16;

        var g = (ag + (((cg - ag) * f) >> 8));
        g = ((g < 0) ? 0 : ((g > 255) ? 255 : g)) << 8;

        var b = ab + (((cb - ab) * f) >> 8);
        b = (b < 0) ? 0 : ((b > 255) ? 255 : b);

        return (a | r | g | b);
      }

      return {
        replace: function(c1, c2) {
          return c2;
        },
        blend: function(c1, c2) {
          var f = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK),
            ag = (c1 & GREEN_MASK),
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK),
            bg = (c2 & GREEN_MASK),
            bb = (c2 & BLUE_MASK);

          return (min(((c1 & ALPHA_MASK) >>> 24) + f, 0xff) << 24 |
                  (ar + (((br - ar) * f) >> 8)) & RED_MASK |
                  (ag + (((bg - ag) * f) >> 8)) & GREEN_MASK |
                  (ab + (((bb - ab) * f) >> 8)) & BLUE_MASK);
        },
        add: function(c1, c2) {
          var f = (c2 & ALPHA_MASK) >>> 24;
          return (min(((c1 & ALPHA_MASK) >>> 24) + f, 0xff) << 24 |
                  min(((c1 & RED_MASK) + ((c2 & RED_MASK) >> 8) * f), RED_MASK) & RED_MASK |
                  min(((c1 & GREEN_MASK) + ((c2 & GREEN_MASK) >> 8) * f), GREEN_MASK) & GREEN_MASK |
                  min((c1 & BLUE_MASK) + (((c2 & BLUE_MASK) * f) >> 8), BLUE_MASK));
        },
        subtract: function(c1, c2) {
          var f = (c2 & ALPHA_MASK) >>> 24;
          return (min(((c1 & ALPHA_MASK) >>> 24) + f, 0xff) << 24 |
                  max(((c1 & RED_MASK) - ((c2 & RED_MASK) >> 8) * f), GREEN_MASK) & RED_MASK |
                  max(((c1 & GREEN_MASK) - ((c2 & GREEN_MASK) >> 8) * f), BLUE_MASK) & GREEN_MASK |
                  max((c1 & BLUE_MASK) - (((c2 & BLUE_MASK) * f) >> 8), 0));
        },
        lightest: function(c1, c2) {
          var f = (c2 & ALPHA_MASK) >>> 24;
          return (min(((c1 & ALPHA_MASK) >>> 24) + f, 0xff) << 24 |
                  max(c1 & RED_MASK, ((c2 & RED_MASK) >> 8) * f) & RED_MASK |
                  max(c1 & GREEN_MASK, ((c2 & GREEN_MASK) >> 8) * f) & GREEN_MASK |
                  max(c1 & BLUE_MASK, ((c2 & BLUE_MASK) * f) >> 8));
        },
        darkest: function(c1, c2) {
          var f = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK),
            ag = (c1 & GREEN_MASK),
            ab = (c1 & BLUE_MASK),
            br = min(c1 & RED_MASK, ((c2 & RED_MASK) >> 8) * f),
            bg = min(c1 & GREEN_MASK, ((c2 & GREEN_MASK) >> 8) * f),
            bb = min(c1 & BLUE_MASK, ((c2 & BLUE_MASK) * f) >> 8);

          return (min(((c1 & ALPHA_MASK) >>> 24) + f, 0xff) << 24 |
                  (ar + (((br - ar) * f) >> 8)) & RED_MASK |
                  (ag + (((bg - ag) * f) >> 8)) & GREEN_MASK |
                  (ab + (((bb - ab) * f) >> 8)) & BLUE_MASK);
        },
        difference: function(c1, c2) {
          var f  = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = (c2 & BLUE_MASK),
            cr = (ar > br) ? (ar - br) : (br - ar),
            cg = (ag > bg) ? (ag - bg) : (bg - ag),
            cb = (ab > bb) ? (ab - bb) : (bb - ab);

          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
        },
        exclusion: function(c1, c2) {
          var f  = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = (c2 & BLUE_MASK),
            cr = ar + br - ((ar * br) >> 7),
            cg = ag + bg - ((ag * bg) >> 7),
            cb = ab + bb - ((ab * bb) >> 7);

          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
        },
        multiply: function(c1, c2) {
          var f  = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = (c2 & BLUE_MASK),
            cr = (ar * br) >> 8,
            cg = (ag * bg) >> 8,
            cb = (ab * bb) >> 8;

          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
        },
        screen: function(c1, c2) {
          var f  = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = (c2 & BLUE_MASK),
            cr = 255 - (((255 - ar) * (255 - br)) >> 8),
            cg = 255 - (((255 - ag) * (255 - bg)) >> 8),
            cb = 255 - (((255 - ab) * (255 - bb)) >> 8);

          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
        },
        hard_light: function(c1, c2) {
          var f  = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = (c2 & BLUE_MASK),
            cr = (br < 128) ? ((ar * br) >> 7) : (255 - (((255 - ar) * (255 - br)) >> 7)),
            cg = (bg < 128) ? ((ag * bg) >> 7) : (255 - (((255 - ag) * (255 - bg)) >> 7)),
            cb = (bb < 128) ? ((ab * bb) >> 7) : (255 - (((255 - ab) * (255 - bb)) >> 7));

          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
        },
        soft_light: function(c1, c2) {
          var f  = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = (c2 & BLUE_MASK),
            cr = ((ar * br) >> 7) + ((ar * ar) >> 8) - ((ar * ar * br) >> 15),
            cg = ((ag * bg) >> 7) + ((ag * ag) >> 8) - ((ag * ag * bg) >> 15),
            cb = ((ab * bb) >> 7) + ((ab * ab) >> 8) - ((ab * ab * bb) >> 15);

          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
        },
        overlay: function(c1, c2) {
          var f  = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = (c2 & BLUE_MASK),
            cr = (ar < 128) ? ((ar * br) >> 7) : (255 - (((255 - ar) * (255 - br)) >> 7)),
            cg = (ag < 128) ? ((ag * bg) >> 7) : (255 - (((255 - ag) * (255 - bg)) >> 7)),
            cb = (ab < 128) ? ((ab * bb) >> 7) : (255 - (((255 - ab) * (255 - bb)) >> 7));

          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
        },
        dodge: function(c1, c2) {
          var f  = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = (c2 & BLUE_MASK);

          var cr = 255;
          if (br !== 255) {
            cr = (ar << 8) / (255 - br);
            cr = (cr < 0) ? 0 : ((cr > 255) ? 255 : cr);
          }

          var cg = 255;
          if (bg !== 255) {
            cg = (ag << 8) / (255 - bg);
            cg = (cg < 0) ? 0 : ((cg > 255) ? 255 : cg);
          }

          var cb = 255;
          if (bb !== 255) {
            cb = (ab << 8) / (255 - bb);
            cb = (cb < 0) ? 0 : ((cb > 255) ? 255 : cb);
          }

          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
        },
        burn: function(c1, c2) {
          var f  = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = (c2 & BLUE_MASK);

          var cr = 0;
          if (br !== 0) {
            cr = ((255 - ar) << 8) / br;
            cr = 255 - ((cr < 0) ? 0 : ((cr > 255) ? 255 : cr));
          }

          var cg = 0;
          if (bg !== 0) {
            cg = ((255 - ag) << 8) / bg;
            cg = 255 - ((cg < 0) ? 0 : ((cg > 255) ? 255 : cg));
          }

          var cb = 0;
          if (bb !== 0) {
            cb = ((255 - ab) << 8) / bb;
            cb = 255 - ((cb < 0) ? 0 : ((cb > 255) ? 255 : cb));
          }

          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
        }
      };
    }());

// enf of functions from processing.js