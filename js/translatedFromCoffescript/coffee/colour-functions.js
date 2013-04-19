/*
## Closure compiler automatically replaces symbolic Constants.* names with their
## values (it does it for everything it thinks it's a constant really).
*/

var ColourFunctions;

ColourFunctions = (function() {
  "use strict";  function ColourFunctions() {
    var _this = this;

    window.color = function(a, b, c, d) {
      return _this.color(a, b, c, d);
    };
    window.colorToHSB = function(a) {
      return _this.colorToHSB(a);
    };
    window.brightness = function(a) {
      return _this.brightness(a);
    };
    window.saturation = function(a) {
      return _this.saturation(a);
    };
    window.hue = function(a) {
      return _this.hue(a);
    };
    window.redF = function(a) {
      return _this.redF(a);
    };
    window.greenF = function(a) {
      return _this.greenF(a);
    };
    window.blueF = function(a) {
      return _this.blueF(a);
    };
    window.alpha = function(a) {
      return _this.alpha(a);
    };
    window.alphaZeroToOne = function(a) {
      return _this.alphaZeroToOne(a);
    };
    window.lerp = function(a, b, c) {
      return _this.lerp(a, b, c);
    };
    window.lerpColor = function(a, b, c) {
      return _this.lerpColor(a, b, c);
    };
    window.colorMode = function(a, b, c, d, e) {
      return _this.colorMode(a, b, c, d, e);
    };
    window.blendColor = function(a, b, c) {
      return _this.blendColor(a, b, c);
    };
    this.colorModeX = 255;
    this.colorModeY = 255;
    this.colorModeZ = 255;
    this.colorModeA = 255;
    this.Constants = {
      RGB: 1,
      ARGB: 2,
      HSB: 3,
      ALPHA: 4,
      CMYK: 5,
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
      ALPHA_MASK: 0xff000000,
      RED_MASK: 0x00ff0000,
      GREEN_MASK: 0x0000ff00,
      BLUE_MASK: 0x000000ff
    };
    window.HSB = this.Constants.HSB;
    window.RGB = this.Constants.RGB;
    this.curColorMode = this.Constants.RGB;
    this.color.toString = function(colorInt) {
      return "rgba(" + ((colorInt & _this.Constants.RED_MASK) >>> 16) + "," + ((colorInt & _this.Constants.GREEN_MASK) >>> 8) + "," + (colorInt & _this.Constants.BLUE_MASK) + "," + ((colorInt & _this.Constants.ALPHA_MASK) >>> 24) / 255 + ")";
    };
    this.color.toInt = function(r, g, b, a) {
      return (a << 24) & _this.Constants.ALPHA_MASK | (r << 16) & _this.Constants.RED_MASK | (g << 8) & _this.Constants.GREEN_MASK | b & _this.Constants.BLUE_MASK;
    };
    this.color.toArray = function(colorInt) {
      return [(colorInt & _this.Constants.RED_MASK) >>> 16, (colorInt & _this.Constants.GREEN_MASK) >>> 8, colorInt & _this.Constants.BLUE_MASK, (colorInt & _this.Constants.ALPHA_MASK) >>> 24];
    };
    this.color.toGLArray = function(colorInt) {
      return [((colorInt & _this.Constants.RED_MASK) >>> 16) / 255, ((colorInt & _this.Constants.GREEN_MASK) >>> 8) / 255, (colorInt & _this.Constants.BLUE_MASK) / 255, ((colorInt & _this.Constants.ALPHA_MASK) >>> 24) / 255];
    };
    this.color.toRGB = function(h, s, b) {
      var br, f, hue, p, q, t;

      br = void 0;
      hue = void 0;
      f = void 0;
      p = void 0;
      q = void 0;
      t = void 0;
      h = (h > _this.colorModeX ? _this.colorModeX : h);
      s = (s > _this.colorModeY ? _this.colorModeY : s);
      b = (b > _this.colorModeZ ? _this.colorModeZ : b);
      h = (h / _this.colorModeX) * 360;
      s = (s / _this.colorModeY) * 100;
      b = (b / _this.colorModeZ) * 100;
      br = Math.round(b / 100 * 255);
      if (s === 0) {
        return [br, br, br];
      }
      hue = h % 360;
      f = hue % 60;
      p = Math.round((b * (100 - s)) / 10000 * 255);
      q = Math.round((b * (6000 - s * f)) / 600000 * 255);
      t = Math.round((b * (6000 - s * (60 - f))) / 600000 * 255);
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
    this.modes = this.modesFunction();
  }

  ColourFunctions.prototype.color$4 = function(aValue1, aValue2, aValue3, aValue4) {
    var a, b, g, r, rgb;

    r = void 0;
    g = void 0;
    b = void 0;
    a = void 0;
    rgb = void 0;
    if (this.curColorMode === this.Constants.HSB) {
      rgb = this.color.toRGB(aValue1, aValue2, aValue3);
      r = rgb[0];
      g = rgb[1];
      b = rgb[2];
    } else {
      r = Math.round(255 * (aValue1 / this.colorModeX));
      g = Math.round(255 * (aValue2 / this.colorModeY));
      b = Math.round(255 * (aValue3 / this.colorModeZ));
    }
    a = Math.round(255 * (aValue4 / this.colorModeA));
    r = (r < 0 ? 0 : r);
    g = (g < 0 ? 0 : g);
    b = (b < 0 ? 0 : b);
    a = (a < 0 ? 0 : a);
    r = (r > 255 ? 255 : r);
    g = (g > 255 ? 255 : g);
    b = (b > 255 ? 255 : b);
    a = (a > 255 ? 255 : a);
    return (a << 24) & this.Constants.ALPHA_MASK | (r << 16) & this.Constants.RED_MASK | (g << 8) & this.Constants.GREEN_MASK | b & this.Constants.BLUE_MASK;
  };

  ColourFunctions.prototype.color$2 = function(aValue1, aValue2) {
    var a, angleColor;

    a = void 0;
    angleColor = -16777217;
    if (aValue1 === angleColor) {
      return angleColor;
    }
    if (aValue1 & this.Constants.ALPHA_MASK) {
      a = Math.round(255 * (aValue2 / this.colorModeA));
      a = (a > 255 ? 255 : a);
      a = (a < 0 ? 0 : a);
      return aValue1 - (aValue1 & this.Constants.ALPHA_MASK) + ((a << 24) & this.Constants.ALPHA_MASK);
    }
    if (this.curColorMode === this.Constants.RGB) {
      return this.color$4(aValue1, aValue1, aValue1, aValue2);
    }
    if (this.curColorMode === this.Constants.HSB) {
      return this.color$4(0, 0, (aValue1 / this.colorModeX) * this.colorModeZ, aValue2);
    }
  };

  ColourFunctions.prototype.color$1 = function(aValue1) {
    if ((typeof aValue1) === "string") {
      return aValue1;
    }
    if (aValue1 <= this.colorModeX && aValue1 >= 0) {
      if (this.curColorMode === this.Constants.RGB) {
        return this.color$4(aValue1, aValue1, aValue1, this.colorModeA);
      }
      if (this.curColorMode === this.Constants.HSB) {
        return this.color$4(0, 0, (aValue1 / this.colorModeX) * this.colorModeZ, this.colorModeA);
      }
    }
    if (aValue1) {
      if (aValue1 > 2147483647) {
        aValue1 -= 4294967296;
      }
      return aValue1;
    }
  };

  /*
  Creates colors for storing in variables of the color datatype. The parameters are
  interpreted as RGB or HSB values depending on the current colorMode(). The default
  mode is RGB values from 0 to 255 and therefore, the function call color(255, 204, 0)
  will return a bright yellow color. More about how colors are stored can be found in
  the reference for the color datatype.
  
  @param {int|float} aValue1        red or hue or grey values relative to the current color range.
  Also can be color value in hexadecimal notation (i.e. #FFCC00 or 0xFFFFCC00)
  @param {int|float} aValue2        green or saturation values relative to the current color range
  @param {int|float} aValue3        blue or brightness values relative to the current color range
  @param {int|float} aValue4        relative to current color range. Represents alpha
  
  @returns {color} the color
  
  @see colorMode
  */


  ColourFunctions.prototype.color = function(aValue1, aValue2, aValue3, aValue4) {
    if (aValue1 !== undefined && aValue2 !== undefined && aValue3 !== undefined && aValue4 !== undefined) {
      return this.color$4(aValue1, aValue2, aValue3, aValue4);
    }
    if (aValue1 !== undefined && aValue2 !== undefined && aValue3 !== undefined) {
      return this.color$4(aValue1, aValue2, aValue3, this.colorModeA);
    }
    if (aValue1 !== undefined && aValue2 !== undefined) {
      return this.color$2(aValue1, aValue2);
    }
    if (typeof aValue1 === "number" || typeof aValue1 === "string") {
      return this.color$1(aValue1);
    }
    return this.color$4(this.colorModeX, this.colorModeY, this.colorModeZ, this.colorModeA);
  };

  ColourFunctions.prototype.colorToHSB = function(colorInt) {
    var blue, green, hue, maxBright, minBright, red, saturation;

    red = void 0;
    green = void 0;
    blue = void 0;
    minBright = void 0;
    maxBright = void 0;
    hue = void 0;
    saturation = void 0;
    red = ((colorInt & this.Constants.RED_MASK) >>> 16) / 255;
    green = ((colorInt & this.Constants.GREEN_MASK) >>> 8) / 255;
    blue = (colorInt & this.Constants.BLUE_MASK) / 255;
    maxBright = max(max(red, green), blue);
    minBright = min(min(red, green), blue);
    if (minBright === maxBright) {
      return [0, 0, maxBright * this.colorModeZ];
    }
    saturation = (maxBright - minBright) / maxBright;
    if (red === maxBright) {
      hue = (green - blue) / (maxBright - minBright);
    } else if (green === maxBright) {
      hue = 2 + ((blue - red) / (maxBright - minBright));
    } else {
      hue = 4 + ((red - green) / (maxBright - minBright));
    }
    hue /= 6;
    if (hue < 0) {
      hue += 1;
    } else {
      if (hue > 1) {
        hue -= 1;
      }
    }
    return [hue * this.colorModeX, saturation * this.colorModeY, maxBright * this.colorModeZ];
  };

  /*
  Extracts the brightness value from a color.
  
  @param {color} colInt any value of the color datatype
  
  @returns {float} The brightness color value.
  
  @see red
  @see green
  @see blue
  @see hue
  @see saturation
  */


  ColourFunctions.prototype.brightness = function(colInt) {
    return this.colorToHSB(colInt)[2];
  };

  /*
  Extracts the saturation value from a color.
  
  @param {color} colInt any value of the color datatype
  
  @returns {float} The saturation color value.
  
  @see red
  @see green
  @see blue
  @see hue
  @see brightness
  */


  ColourFunctions.prototype.saturation = function(colInt) {
    return this.colorToHSB(colInt)[1];
  };

  /*
  Extracts the hue value from a color.
  
  @param {color} colInt any value of the color datatype
  
  @returns {float} The hue color value.
  
  @see red
  @see green
  @see blue
  @see saturation
  @see brightness
  */


  ColourFunctions.prototype.hue = function(colInt) {
    return this.colorToHSB(colInt)[0];
  };

  /*
  Extracts the red value from a color, scaled to match current colorMode().
  This value is always returned as a float so be careful not to assign it to an int value.
  
  @param {color} aColor any value of the color datatype
  
  @returns {float} The red color value.
  
  @see green
  @see blue
  @see alpha
  @see >> right shift
  @see hue
  @see saturation
  @see brightness
  */


  ColourFunctions.prototype.redF = function(aColor) {
    return ((aColor & this.Constants.RED_MASK) >>> 16) / 255 * this.colorModeX;
  };

  /*
  Extracts the green value from a color, scaled to match current colorMode().
  This value is always returned as a float so be careful not to assign it to an int value.
  
  @param {color} aColor any value of the color datatype
  
  @returns {float} The green color value.
  
  @see red
  @see blue
  @see alpha
  @see >> right shift
  @see hue
  @see saturation
  @see brightness
  */


  ColourFunctions.prototype.greenF = function(aColor) {
    return ((aColor & this.Constants.GREEN_MASK) >>> 8) / 255 * this.colorModeY;
  };

  /*
  Extracts the blue value from a color, scaled to match current colorMode().
  This value is always returned as a float so be careful not to assign it to an int value.
  
  @param {color} aColor any value of the color datatype
  
  @returns {float} The blue color value.
  
  @see red
  @see green
  @see alpha
  @see >> right shift
  @see hue
  @see saturation
  @see brightness
  */


  ColourFunctions.prototype.blueF = function(aColor) {
    return (aColor & this.Constants.BLUE_MASK) / 255 * this.colorModeZ;
  };

  /*
  Extracts the alpha value from a color, scaled to match current colorMode().
  This value is always returned as a float so be careful not to assign it to an int value.
  
  @param {color} aColor any value of the color datatype
  
  @returns {float} The alpha color value.
  
  @see red
  @see green
  @see blue
  @see >> right shift
  @see hue
  @see saturation
  @see brightness
  */


  ColourFunctions.prototype.alpha = function(aColor) {
    return ((aColor & this.Constants.ALPHA_MASK) >>> 24) / 255 * this.colorModeA;
  };

  ColourFunctions.prototype.alphaZeroToOne = function(aColor) {
    return ((aColor & this.Constants.ALPHA_MASK) >>> 24) / 255;
  };

  /*
  Calculates a number between two numbers at a specific increment. The amt  parameter is the
  amount to interpolate between the two values where 0.0 equal to the first point, 0.1 is very
  near the first point, 0.5 is half-way in between, etc. The lerp function is convenient for
  creating motion along a straight path and for drawing dotted lines.
  
  @param {int|float} value1       float or int: first value
  @param {int|float} value2       float or int: second value
  @param {int|float} amt          float: between 0.0 and 1.0
  
  @returns {float}
  
  @see curvePoint
  @see bezierPoint
  */


  ColourFunctions.prototype.lerp = function(value1, value2, amt) {
    return ((value2 - value1) * amt) + value1;
  };

  /*
  Calculates a color or colors between two colors at a specific increment.
  The amt parameter is the amount to interpolate between the two values where 0.0
  equal to the first point, 0.1 is very near the first point, 0.5 is half-way in between, etc.
  
  @param {color} c1     interpolate from this color
  @param {color} c2     interpolate to this color
  @param {float} amt    between 0.0 and 1.0
  
  @returns {float} The blended color.
  
  @see blendColor
  @see color
  */


  ColourFunctions.prototype.lerpColor = function(c1, c2, amt) {
    var a, a1, a2, b, b1, b2, colorBits1, colorBits2, g, g1, g2, h, hsb1, hsb2, r, r1, r2, rgb, s;

    r = void 0;
    g = void 0;
    b = void 0;
    a = void 0;
    r1 = void 0;
    g1 = void 0;
    b1 = void 0;
    a1 = void 0;
    r2 = void 0;
    g2 = void 0;
    b2 = void 0;
    a2 = void 0;
    hsb1 = void 0;
    hsb2 = void 0;
    rgb = void 0;
    h = void 0;
    s = void 0;
    colorBits1 = this.color(c1);
    colorBits2 = this.color(c2);
    if (this.curColorMode === this.Constants.HSB) {
      hsb1 = this.colorToHSB(colorBits1);
      a1 = ((colorBits1 & this.Constants.ALPHA_MASK) >>> 24) / this.colorModeA;
      hsb2 = this.colorToHSB(colorBits2);
      a2 = ((colorBits2 & this.Constants.ALPHA_MASK) >>> 24) / this.colorModeA;
      h = this.lerp(hsb1[0], hsb2[0], amt);
      s = this.lerp(hsb1[1], hsb2[1], amt);
      b = this.lerp(hsb1[2], hsb2[2], amt);
      rgb = this.color.toRGB(h, s, b);
      a = this.lerp(a1, a2, amt) * this.colorModeA;
      return (a << 24) & this.Constants.ALPHA_MASK | (rgb[0] << 16) & this.Constants.RED_MASK | (rgb[1] << 8) & this.Constants.GREEN_MASK | rgb[2] & this.Constants.BLUE_MASK;
    }
    r1 = (colorBits1 & this.Constants.RED_MASK) >>> 16;
    g1 = (colorBits1 & this.Constants.GREEN_MASK) >>> 8;
    b1 = colorBits1 & this.Constants.BLUE_MASK;
    a1 = ((colorBits1 & this.Constants.ALPHA_MASK) >>> 24) / this.colorModeA;
    r2 = (colorBits2 & this.Constants.RED_MASK) >>> 16;
    g2 = (colorBits2 & this.Constants.GREEN_MASK) >>> 8;
    b2 = colorBits2 & this.Constants.BLUE_MASK;
    a2 = ((colorBits2 & this.Constants.ALPHA_MASK) >>> 24) / this.colorModeA;
    r = this.lerp(r1, r2, amt) | 0;
    g = this.lerp(g1, g2, amt) | 0;
    b = this.lerp(b1, b2, amt) | 0;
    a = this.lerp(a1, a2, amt) * this.colorModeA;
    return (a << 24) & this.Constants.ALPHA_MASK | (r << 16) & this.Constants.RED_MASK | (g << 8) & this.Constants.GREEN_MASK | b & this.Constants.BLUE_MASK;
  };

  /*
  Changes the way Processing interprets color data. By default, fill(), stroke(), and background()
  colors are set by values between 0 and 255 using the RGB color model. It is possible to change the
  numerical range used for specifying colors and to switch color systems. For example, calling colorMode(RGB, 1.0)
  will specify that values are specified between 0 and 1. The limits for defining colors are altered by setting the
  parameters range1, range2, range3, and range 4.
  
  @param {MODE} mode Either RGB or HSB, corresponding to Red/Green/Blue and Hue/Saturation/Brightness
  @param {int|float} range              range for all color elements
  @param {int|float} range1             range for the red or hue depending on the current color mode
  @param {int|float} range2             range for the green or saturation depending on the current color mode
  @param {int|float} range3             range for the blue or brightness depending on the current color mode
  @param {int|float} range4             range for the alpha
  
  @returns none
  
  @see background
  @see fill
  @see stroke
  */


  ColourFunctions.prototype.colorMode = function(mode, range1, range2, range3, range4) {
    this.curColorMode = mode;
    if (arguments.length > 1) {
      this.colorModeX = range1;
      this.colorModeY = range2 || range1;
      this.colorModeZ = range3 || range1;
      return this.colorModeA = range4 || range1;
    }
  };

  /*
  These are internal blending modes used for BlendColor()
  
  @param {Color} c1       First Color to blend
  @param {Color} c2       Second Color to blend
  
  @returns {Color}        The blended Color
  
  @see BlendColor
  @see Blend
  */


  ColourFunctions.prototype.modesFunction = function() {
    var ALPHA_MASK, BLUE_MASK, GREEN_MASK, RED_MASK, add, applyMode, blend, burn, darkest, difference, dodge, exclusion, hard_light, lightest, max, min, multiply, overlay, replace, screen, soft_light, subtract;

    ALPHA_MASK = this.Constants.ALPHA_MASK;
    RED_MASK = this.Constants.RED_MASK;
    GREEN_MASK = this.Constants.GREEN_MASK;
    BLUE_MASK = this.Constants.BLUE_MASK;
    min = Math.min;
    max = Math.max;
    applyMode = void 0;
    applyMode = function(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb) {
      var a, b, g, r;

      a = void 0;
      r = void 0;
      g = void 0;
      b = void 0;
      a = min(((c1 & 0xff000000) >>> 24) + f, 0xff) << 24;
      r = ar + (((cr - ar) * f) >> 8);
      r = (r < 0 ? 0 : (r > 255 ? 255 : r)) << 16;
      g = ag + (((cg - ag) * f) >> 8);
      g = (g < 0 ? 0 : (g > 255 ? 255 : g)) << 8;
      b = ab + (((cb - ab) * f) >> 8);
      b = (b < 0 ? 0 : (b > 255 ? 255 : b));
      return a | r | g | b;
    };
    replace = function(c1, c2) {
      return c2;
    };
    blend = function(c1, c2) {
      var ab, ag, ar, bb, bg, br, f;

      f = (c2 & ALPHA_MASK) >>> 24;
      ar = c1 & RED_MASK;
      ag = c1 & GREEN_MASK;
      ab = c1 & BLUE_MASK;
      br = c2 & RED_MASK;
      bg = c2 & GREEN_MASK;
      bb = c2 & BLUE_MASK;
      return min(((c1 & ALPHA_MASK) >>> 24) + f, 0xff) << 24 | (ar + (((br - ar) * f) >> 8)) & RED_MASK | (ag + (((bg - ag) * f) >> 8)) & GREEN_MASK | (ab + (((bb - ab) * f) >> 8)) & BLUE_MASK;
    };
    add = function(c1, c2) {
      var f;

      f = (c2 & ALPHA_MASK) >>> 24;
      return min(((c1 & ALPHA_MASK) >>> 24) + f, 0xff) << 24 | min((c1 & RED_MASK) + ((c2 & RED_MASK) >> 8) * f, RED_MASK) & RED_MASK | min((c1 & GREEN_MASK) + ((c2 & GREEN_MASK) >> 8) * f, GREEN_MASK) & GREEN_MASK | min((c1 & BLUE_MASK) + (((c2 & BLUE_MASK) * f) >> 8), BLUE_MASK);
    };
    subtract = function(c1, c2) {
      var f;

      f = (c2 & ALPHA_MASK) >>> 24;
      return min(((c1 & ALPHA_MASK) >>> 24) + f, 0xff) << 24 | max((c1 & RED_MASK) - ((c2 & RED_MASK) >> 8) * f, GREEN_MASK) & RED_MASK | max((c1 & GREEN_MASK) - ((c2 & GREEN_MASK) >> 8) * f, BLUE_MASK) & GREEN_MASK | max((c1 & BLUE_MASK) - (((c2 & BLUE_MASK) * f) >> 8), 0);
    };
    lightest = function(c1, c2) {
      var f;

      f = (c2 & ALPHA_MASK) >>> 24;
      return min(((c1 & ALPHA_MASK) >>> 24) + f, 0xff) << 24 | max(c1 & RED_MASK, ((c2 & RED_MASK) >> 8) * f) & RED_MASK | max(c1 & GREEN_MASK, ((c2 & GREEN_MASK) >> 8) * f) & GREEN_MASK | max(c1 & BLUE_MASK, ((c2 & BLUE_MASK) * f) >> 8);
    };
    darkest = function(c1, c2) {
      var ab, ag, ar, bb, bg, br, f;

      f = (c2 & ALPHA_MASK) >>> 24;
      ar = c1 & RED_MASK;
      ag = c1 & GREEN_MASK;
      ab = c1 & BLUE_MASK;
      br = min(c1 & RED_MASK, ((c2 & RED_MASK) >> 8) * f);
      bg = min(c1 & GREEN_MASK, ((c2 & GREEN_MASK) >> 8) * f);
      bb = min(c1 & BLUE_MASK, ((c2 & BLUE_MASK) * f) >> 8);
      return min(((c1 & ALPHA_MASK) >>> 24) + f, 0xff) << 24 | (ar + (((br - ar) * f) >> 8)) & RED_MASK | (ag + (((bg - ag) * f) >> 8)) & GREEN_MASK | (ab + (((bb - ab) * f) >> 8)) & BLUE_MASK;
    };
    difference = function(c1, c2) {
      var ab, ag, ar, bb, bg, br, cb, cg, cr, f;

      f = (c2 & ALPHA_MASK) >>> 24;
      ar = (c1 & RED_MASK) >> 16;
      ag = (c1 & GREEN_MASK) >> 8;
      ab = c1 & BLUE_MASK;
      br = (c2 & RED_MASK) >> 16;
      bg = (c2 & GREEN_MASK) >> 8;
      bb = c2 & BLUE_MASK;
      cr = (ar > br ? ar - br : br - ar);
      cg = (ag > bg ? ag - bg : bg - ag);
      cb = (ab > bb ? ab - bb : bb - ab);
      return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
    };
    exclusion = function(c1, c2) {
      var ab, ag, ar, bb, bg, br, cb, cg, cr, f;

      f = (c2 & ALPHA_MASK) >>> 24;
      ar = (c1 & RED_MASK) >> 16;
      ag = (c1 & GREEN_MASK) >> 8;
      ab = c1 & BLUE_MASK;
      br = (c2 & RED_MASK) >> 16;
      bg = (c2 & GREEN_MASK) >> 8;
      bb = c2 & BLUE_MASK;
      cr = ar + br - ((ar * br) >> 7);
      cg = ag + bg - ((ag * bg) >> 7);
      cb = ab + bb - ((ab * bb) >> 7);
      return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
    };
    multiply = function(c1, c2) {
      var ab, ag, ar, bb, bg, br, cb, cg, cr, f;

      f = (c2 & ALPHA_MASK) >>> 24;
      ar = (c1 & RED_MASK) >> 16;
      ag = (c1 & GREEN_MASK) >> 8;
      ab = c1 & BLUE_MASK;
      br = (c2 & RED_MASK) >> 16;
      bg = (c2 & GREEN_MASK) >> 8;
      bb = c2 & BLUE_MASK;
      cr = (ar * br) >> 8;
      cg = (ag * bg) >> 8;
      cb = (ab * bb) >> 8;
      return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
    };
    screen = function(c1, c2) {
      var ab, ag, ar, bb, bg, br, cb, cg, cr, f;

      f = (c2 & ALPHA_MASK) >>> 24;
      ar = (c1 & RED_MASK) >> 16;
      ag = (c1 & GREEN_MASK) >> 8;
      ab = c1 & BLUE_MASK;
      br = (c2 & RED_MASK) >> 16;
      bg = (c2 & GREEN_MASK) >> 8;
      bb = c2 & BLUE_MASK;
      cr = 255 - (((255 - ar) * (255 - br)) >> 8);
      cg = 255 - (((255 - ag) * (255 - bg)) >> 8);
      cb = 255 - (((255 - ab) * (255 - bb)) >> 8);
      return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
    };
    hard_light = function(c1, c2) {
      var ab, ag, ar, bb, bg, br, cb, cg, cr, f;

      f = (c2 & ALPHA_MASK) >>> 24;
      ar = (c1 & RED_MASK) >> 16;
      ag = (c1 & GREEN_MASK) >> 8;
      ab = c1 & BLUE_MASK;
      br = (c2 & RED_MASK) >> 16;
      bg = (c2 & GREEN_MASK) >> 8;
      bb = c2 & BLUE_MASK;
      cr = (br < 128 ? (ar * br) >> 7 : 255 - (((255 - ar) * (255 - br)) >> 7));
      cg = (bg < 128 ? (ag * bg) >> 7 : 255 - (((255 - ag) * (255 - bg)) >> 7));
      cb = (bb < 128 ? (ab * bb) >> 7 : 255 - (((255 - ab) * (255 - bb)) >> 7));
      return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
    };
    soft_light = function(c1, c2) {
      var ab, ag, ar, bb, bg, br, cb, cg, cr, f;

      f = (c2 & ALPHA_MASK) >>> 24;
      ar = (c1 & RED_MASK) >> 16;
      ag = (c1 & GREEN_MASK) >> 8;
      ab = c1 & BLUE_MASK;
      br = (c2 & RED_MASK) >> 16;
      bg = (c2 & GREEN_MASK) >> 8;
      bb = c2 & BLUE_MASK;
      cr = ((ar * br) >> 7) + ((ar * ar) >> 8) - ((ar * ar * br) >> 15);
      cg = ((ag * bg) >> 7) + ((ag * ag) >> 8) - ((ag * ag * bg) >> 15);
      cb = ((ab * bb) >> 7) + ((ab * ab) >> 8) - ((ab * ab * bb) >> 15);
      return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
    };
    overlay = function(c1, c2) {
      var ab, ag, ar, bb, bg, br, cb, cg, cr, f;

      f = (c2 & ALPHA_MASK) >>> 24;
      ar = (c1 & RED_MASK) >> 16;
      ag = (c1 & GREEN_MASK) >> 8;
      ab = c1 & BLUE_MASK;
      br = (c2 & RED_MASK) >> 16;
      bg = (c2 & GREEN_MASK) >> 8;
      bb = c2 & BLUE_MASK;
      cr = (ar < 128 ? (ar * br) >> 7 : 255 - (((255 - ar) * (255 - br)) >> 7));
      cg = (ag < 128 ? (ag * bg) >> 7 : 255 - (((255 - ag) * (255 - bg)) >> 7));
      cb = (ab < 128 ? (ab * bb) >> 7 : 255 - (((255 - ab) * (255 - bb)) >> 7));
      return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
    };
    dodge = function(c1, c2) {
      var ab, ag, ar, bb, bg, br, cb, cg, cr, f;

      f = (c2 & ALPHA_MASK) >>> 24;
      ar = (c1 & RED_MASK) >> 16;
      ag = (c1 & GREEN_MASK) >> 8;
      ab = c1 & BLUE_MASK;
      br = (c2 & RED_MASK) >> 16;
      bg = (c2 & GREEN_MASK) >> 8;
      bb = c2 & BLUE_MASK;
      cr = void 0;
      cg = void 0;
      cb = void 0;
      cr = 255;
      if (br !== 255) {
        cr = (ar << 8) / (255 - br);
        cr = (cr < 0 ? 0 : (cr > 255 ? 255 : cr));
      }
      cg = 255;
      if (bg !== 255) {
        cg = (ag << 8) / (255 - bg);
        cg = (cg < 0 ? 0 : (cg > 255 ? 255 : cg));
      }
      cb = 255;
      if (bb !== 255) {
        cb = (ab << 8) / (255 - bb);
        cb = (cb < 0 ? 0 : (cb > 255 ? 255 : cb));
      }
      return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
    };
    return burn = function(c1, c2) {
      var ab, ag, ar, bb, bg, br, cb, cg, cr, f;

      f = (c2 & ALPHA_MASK) >>> 24;
      ar = (c1 & RED_MASK) >> 16;
      ag = (c1 & GREEN_MASK) >> 8;
      ab = c1 & BLUE_MASK;
      br = (c2 & RED_MASK) >> 16;
      bg = (c2 & GREEN_MASK) >> 8;
      bb = c2 & BLUE_MASK;
      cr = void 0;
      cg = void 0;
      cb = void 0;
      cr = 0;
      if (br !== 0) {
        cr = ((255 - ar) << 8) / br;
        cr = 255 - (cr < 0 ? 0 : (cr > 255 ? 255 : cr));
      }
      cg = 0;
      if (bg !== 0) {
        cg = ((255 - ag) << 8) / bg;
        cg = 255 - (cg < 0 ? 0 : (cg > 255 ? 255 : cg));
      }
      cb = 0;
      if (bb !== 0) {
        cb = ((255 - ab) << 8) / bb;
        cb = 255 - (cb < 0 ? 0 : (cb > 255 ? 255 : cb));
      }
      return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
    };
  };

  /*
  Blends two color values together based on the blending mode given as the MODE parameter.
  The possible modes are described in the reference for the blend() function.
  
  @param {color} c1 color: the first color to blend
  @param {color} c2 color: the second color to blend
  @param {MODE} MODE Either BLEND, ADD, SUBTRACT, DARKEST, LIGHTEST, DIFFERENCE, EXCLUSION, MULTIPLY,
  SCREEN, OVERLAY, HARD_LIGHT, SOFT_LIGHT, DODGE, or BURN
  
  @returns {float} The blended color.
  
  @see blend
  @see color
  */


  ColourFunctions.prototype.blendColor = function(c1, c2, mode) {
    if (mode === this.Constants.REPLACE) {
      return this.modes.replace(c1, c2);
    } else if (mode === this.Constants.BLEND) {
      return this.modes.blend(c1, c2);
    } else if (mode === this.Constants.ADD) {
      return this.modes.add(c1, c2);
    } else if (mode === this.Constants.SUBTRACT) {
      return this.modes.subtract(c1, c2);
    } else if (mode === this.Constants.LIGHTEST) {
      return this.modes.lightest(c1, c2);
    } else if (mode === this.Constants.DARKEST) {
      return this.modes.darkest(c1, c2);
    } else if (mode === this.Constants.DIFFERENCE) {
      return this.modes.difference(c1, c2);
    } else if (mode === this.Constants.EXCLUSION) {
      return this.modes.exclusion(c1, c2);
    } else if (mode === this.Constants.MULTIPLY) {
      return this.modes.multiply(c1, c2);
    } else if (mode === this.Constants.SCREEN) {
      return this.modes.screen(c1, c2);
    } else if (mode === this.Constants.HARD_LIGHT) {
      return this.modes.hard_light(c1, c2);
    } else if (mode === this.Constants.SOFT_LIGHT) {
      return this.modes.soft_light(c1, c2);
    } else if (mode === this.Constants.OVERLAY) {
      return this.modes.overlay(c1, c2);
    } else if (mode === this.Constants.DODGE) {
      return this.modes.dodge(c1, c2);
    } else {
      if (mode === this.Constants.BURN) {
        return this.modes.burn(c1, c2);
      }
    }
  };

  return ColourFunctions;

})();
