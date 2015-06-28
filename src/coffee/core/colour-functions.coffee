# Code adapted from processing.js

###
## Closure compiler automatically replaces symbolic Constants.* names with their
## values (it does it for everything it thinks it's a constant really).
###

class ColourFunctions

  constructor: ->

    @colorModeX = 255
    @colorModeY = 255
    @colorModeZ = 255
    @colorModeA = 255
    @Constants =
      # Color modes
      RGB: 1
      ARGB: 2
      HSB: 3
      ALPHA: 4
      CMYK: 5
      
      # Blend modes
      REPLACE: 0
      BLEND: 1 << 0
      ADD: 1 << 1
      SUBTRACT: 1 << 2
      LIGHTEST: 1 << 3
      DARKEST: 1 << 4
      DIFFERENCE: 1 << 5
      EXCLUSION: 1 << 6
      MULTIPLY: 1 << 7
      SCREEN: 1 << 8
      OVERLAY: 1 << 9
      HARD_LIGHT: 1 << 10
      SOFT_LIGHT: 1 << 11
      DODGE: 1 << 12
      BURN: 1 << 13
      
      # Color component bit masks
      ALPHA_MASK: 0xff000000
      RED_MASK: 0x00ff0000
      GREEN_MASK: 0x0000ff00
      BLUE_MASK: 0x000000ff
    
    @curColorMode = @Constants.RGB

    # Ease of use function to extract the colour bits into a string
    @color.toString = (colorInt) =>
      "rgba(" + ((colorInt & @Constants.RED_MASK) >>> 16) + "," + ((colorInt & @Constants.GREEN_MASK) >>> 8) + "," + (colorInt & @Constants.BLUE_MASK) + "," + ((colorInt & @Constants.ALPHA_MASK) >>> 24) / 255 + ")"

    # Easy of use function to pack rgba values into a single bit-shifted color int.
    @color.toInt = (r, g, b, a) =>
      (a << 24) & @Constants.ALPHA_MASK | (r << 16) & @Constants.RED_MASK | (g << 8) & @Constants.GREEN_MASK | b & @Constants.BLUE_MASK
  
    # Creates a simple array in [R, G, B, A] format, [255, 255, 255, 255]
    @color.toArray = (colorInt) =>
      [(colorInt & @Constants.RED_MASK) >>> 16, (colorInt & @Constants.GREEN_MASK) >>> 8, colorInt & @Constants.BLUE_MASK, (colorInt & @Constants.ALPHA_MASK) >>> 24]
  
    # Creates a WebGL color array in [R, G, B, A] format. WebGL wants the color ranges between 0 and 1, [1, 1, 1, 1]
    @color.toGLArray= (colorInt) =>
      [((colorInt & @Constants.RED_MASK) >>> 16) / 255, ((colorInt & @Constants.GREEN_MASK) >>> 8) / 255, (colorInt & @Constants.BLUE_MASK) / 255, ((colorInt & @Constants.ALPHA_MASK) >>> 24) / 255]
  
    # HSB conversion function from Mootools, MIT Licensed
    @color.toRGB = (h, s, b) =>
      br = undefined
      hue = undefined
      f = undefined
      p = undefined
      q = undefined
      t = undefined
      
      # Limit values greater than range
      h = (if (h > @colorModeX) then @colorModeX else h)
      s = (if (s > @colorModeY) then @colorModeY else s)
      b = (if (b > @colorModeZ) then @colorModeZ else b)
      h = (h / @colorModeX) * 360
      s = (s / @colorModeY) * 100
      b = (b / @colorModeZ) * 100
      br = Math.round(b / 100 * 255)
      # Grayscale
      return [br, br, br]  if s is 0
      hue = h % 360
      f = hue % 60
      p = Math.round((b * (100 - s)) / 10000 * 255)
      q = Math.round((b * (6000 - s * f)) / 600000 * 255)
      t = Math.round((b * (6000 - s * (60 - f))) / 600000 * 255)
      switch Math.floor(hue / 60)
        when 0
          [br, t, p]
        when 1
          [q, br, p]
        when 2
          [p, br, t]
        when 3
          [p, q, br]
        when 4
          [t, p, br]
        when 5
          [br, p, q]
    @modes = @modesFunction()

  addToScope: (scope) ->

    scope.add('color',      (a,b,c,d) => @color(a,b,c,d))
    scope.add('colorToHSB', (a) => @colorToHSB(a))
    scope.add('brightness', (a) => @brightness(a))
    scope.add('saturation', (a) => @saturation(a))
    scope.add('hue',        (a) => @hue(a))
    scope.add('redF',       (a) => @redF(a))
    scope.add('greenF',     (a) => @greenF(a))
    scope.add('blueF',      (a) => @blueF(a))
    scope.add('alpha',      (a) => @alpha(a))
    scope.add('alphaZeroToOne',      (a) => @alphaZeroToOne(a))
    scope.add('lerp',       (a,b,c) => @lerp(a,b,c))
    scope.add('lerpColor',  (a,b,c) => @lerpColor(a,b,c))
    scope.add('colorMode',  (a,b,c,d,e) => @lerpColor(a,b,c,d,e))
    scope.add('blendColor', (a,b,c) => @blendColor(a,b,c))

    scope.add('HSB',      @Constants.HSB)
    scope.add('RGB',      @Constants.RGB)

  color$4: (aValue1, aValue2, aValue3, aValue4) ->
    r = undefined
    g = undefined
    b = undefined
    a = undefined
    rgb = undefined
    if @curColorMode is @Constants.HSB
      rgb = @color.toRGB(aValue1, aValue2, aValue3)
      r = rgb[0]
      g = rgb[1]
      b = rgb[2]
    else
      r = Math.round(255 * (aValue1 / @colorModeX))
      g = Math.round(255 * (aValue2 / @colorModeY))
      b = Math.round(255 * (aValue3 / @colorModeZ))
    a = Math.round(255 * (aValue4 / @colorModeA))
    
    # Limit values less than 0 and greater than 255
    r = (if (r < 0) then 0 else r)
    g = (if (g < 0) then 0 else g)
    b = (if (b < 0) then 0 else b)
    a = (if (a < 0) then 0 else a)
    r = (if (r > 255) then 255 else r)
    g = (if (g > 255) then 255 else g)
    b = (if (b > 255) then 255 else b)
    a = (if (a > 255) then 255 else a)
    
    # Create color int
    (a << 24) & @Constants.ALPHA_MASK | (r << 16) & @Constants.RED_MASK | (g << 8) & @Constants.GREEN_MASK | b & @Constants.BLUE_MASK

  color$2: (aValue1, aValue2) ->
    a = undefined
    
    # lowest than any 32 bit color is a special
    # color that paints based on normals.
    angleColor = -16777217
    return angleColor  if aValue1 is angleColor
    
    # Color int and alpha
    if aValue1 & @Constants.ALPHA_MASK
      a = Math.round(255 * (aValue2 / @colorModeA))
      
      # Limit values less than 0 and greater than 255
      a = (if (a > 255) then 255 else a)
      a = (if (a < 0) then 0 else a)
      return aValue1 - (aValue1 & @Constants.ALPHA_MASK) + ((a << 24) & @Constants.ALPHA_MASK)
    
    # Grayscale and alpha
    return @color$4(aValue1, aValue1, aValue1, aValue2)  if @curColorMode is @Constants.RGB
    @color$4 0, 0, (aValue1 / @colorModeX) * @colorModeZ, aValue2  if @curColorMode is @Constants.HSB

  # so, color in both processing and processing.js is slightly weird, because
  # color is just a Java integer, which is a little bit of a headache to
  # fold into a Javascript number, which is a float and it's 64 bits.
  # For example, the color black is 0xFF000000, which
  # in unsigned integer (or 64 bits float) would be 4278190080.
  # OK, instead color(0) in Java return -16777216, because Java
  # integers are signed in two's complement and they go from -2147483648
  # to 2147483647 included
  color$1: (aValue1) ->
    
    # so that special colors still work with "color", e.g.
    # fill(color(angleColor))
    if (typeof aValue1) == "string"
      return aValue1

    # Grayscale
    if aValue1 <= @colorModeX and aValue1 >= 0
      return @color$4(aValue1, aValue1, aValue1, @colorModeA)  if @curColorMode is @Constants.RGB
      return @color$4(0, 0, (aValue1 / @colorModeX) * @colorModeZ, @colorModeA)  if @curColorMode is @Constants.HSB
    
    # Color int
    if aValue1
      # Java Overflow
      # in two's complement, 2147483647 is 0xFFFFFFFF i.e. the very max of
      # java integer's 32 bits, so if you add one you go back to the java
      # int minimum so in java the following program gives -2147483648
      # int a = 2147483647 + 1; // equivalent to int a = color(2147483647 + 1)
      # println("a " + a);
      # so we are emulating this here with this subtraction.
      # note that this stops being correct at 2147483647*3 + 3, i.e.
      #   int a = color(2147483647*3 + 3 ) ;
      #   println("a " + a);
      # in Java gives -2147483648
      # while this routine gives 2147483648
      aValue1 -= 4294967296  if aValue1 > 2147483647
      # note that folding below the lower bound is not handled,
      # i.e. -2147483648 -1 doesn't fold to 2147483647
      aValue1


  ###
  Creates colors for storing in variables of the color datatype.
  The parameters are interpreted as RGB or HSB values depending on the
  current colorMode(). The default mode is RGB values from 0 to 255
  and therefore, the function call color(255, 204, 0) will return a bright
  yellow color. More about how colors are stored can be found in the
  reference for the color datatype.

  @param {int|float} aValue1        red or hue or grey values relative to the current color range.
  Also can be color value in hexadecimal notation (i.e. #FFCC00 or 0xFFFFCC00)
  @param {int|float} aValue2        green or saturation values relative to the current color range
  @param {int|float} aValue3        blue or brightness values relative to the current color range
  @param {int|float} aValue4        relative to current color range. Represents alpha

  @returns {color} the color
  
  @see colorMode
  ###
  color: (aValue1, aValue2, aValue3, aValue4) ->
    
    # 4 arguments: (R, G, B, A) or (H, S, B, A)
    return @color$4(aValue1, aValue2, aValue3, aValue4)  if aValue1 isnt undefined and aValue2 isnt undefined and aValue3 isnt undefined and aValue4 isnt undefined
    
    # 3 arguments: (R, G, B) or (H, S, B)
    return @color$4(aValue1, aValue2, aValue3, @colorModeA)  if aValue1 isnt undefined and aValue2 isnt undefined and aValue3 isnt undefined
    
    # 2 arguments: (Color, A) or (Grayscale, A)
    return @color$2(aValue1, aValue2)  if aValue1 isnt undefined and aValue2 isnt undefined
    
    # 1 argument: (Grayscale) or (Color)
    # we also accept strings because special colors such as angleColor are encoded
    # through strings
    if typeof aValue1 is "number" or typeof aValue1 is "string"
      return @color$1(aValue1)
    
    # Default
    @color$4 @colorModeX, @colorModeY, @colorModeZ, @colorModeA

  colorToHSB: (colorInt) ->
    red = undefined
    green = undefined
    blue = undefined
    minBright = undefined
    maxBright = undefined
    hue = undefined
    saturation = undefined
    red = ((colorInt & @Constants.RED_MASK) >>> 16) / 255
    green = ((colorInt & @Constants.GREEN_MASK) >>> 8) / 255
    blue = (colorInt & @Constants.BLUE_MASK) / 255
    maxBright = max(max(red, green), blue)
    minBright = min(min(red, green), blue)
    return [0, 0, maxBright * @colorModeZ]  if minBright is maxBright
    saturation = (maxBright - minBright) / maxBright
    if red is maxBright
      hue = (green - blue) / (maxBright - minBright)
    else if green is maxBright
      hue = 2 + ((blue - red) / (maxBright - minBright))
    else
      hue = 4 + ((red - green) / (maxBright - minBright))
    hue /= 6
    if hue < 0
      hue += 1
    else hue -= 1  if hue > 1
    [hue * @colorModeX, saturation * @colorModeY, maxBright * @colorModeZ]

  
  ###
  Extracts the brightness value from a color.
  
  @param {color} colInt any value of the color datatype
  
  @returns {float} The brightness color value.
  
  @see red
  @see green
  @see blue
  @see hue
  @see saturation
  ###
  brightness: (colInt) ->
    @colorToHSB(colInt)[2]

  
  ###
  Extracts the saturation value from a color.
  
  @param {color} colInt any value of the color datatype
  
  @returns {float} The saturation color value.
  
  @see red
  @see green
  @see blue
  @see hue
  @see brightness
  ###
  saturation: (colInt) ->
    @colorToHSB(colInt)[1]

  
  ###
  Extracts the hue value from a color.
  
  @param {color} colInt any value of the color datatype
  
  @returns {float} The hue color value.
  
  @see red
  @see green
  @see blue
  @see saturation
  @see brightness
  ###
  hue: (colInt) ->
    @colorToHSB(colInt)[0]

  
  ###
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
  ###
  redF: (aColor) ->
    ((aColor & @Constants.RED_MASK) >>> 16) / 255 * @colorModeX

  
  ###
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
  ###
  greenF: (aColor) ->
    ((aColor & @Constants.GREEN_MASK) >>> 8) / 255 * @colorModeY

  
  ###
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
  ###
  blueF: (aColor) ->
    (aColor & @Constants.BLUE_MASK) / 255 * @colorModeZ

  
  ###
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
  ###
  alpha: (aColor) ->
    ((aColor & @Constants.ALPHA_MASK) >>> 24) / 255 * @colorModeA

  alphaZeroToOne: (aColor) ->
    ((aColor & @Constants.ALPHA_MASK) >>> 24) / 255

  
  ###
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
  ###
  lerp: (value1, value2, amt) ->
    ((value2 - value1) * amt) + value1

  
  ###
  Calculates a color or colors between two colors at a specific increment.
  The amt parameter is the amount to interpolate between the two values where 0.0
  equal to the first point, 0.1 is very near the first point, 0.5 is half-way in between, etc.
  
  @param {color} c1     interpolate from this color
  @param {color} c2     interpolate to this color
  @param {float} amt    between 0.0 and 1.0
  
  @returns {float} The blended color.
  
  @see blendColor
  @see color
  ###
  lerpColor: (c1, c2, amt) ->
    r = undefined
    g = undefined
    b = undefined
    a = undefined
    r1 = undefined
    g1 = undefined
    b1 = undefined
    a1 = undefined
    r2 = undefined
    g2 = undefined
    b2 = undefined
    a2 = undefined
    hsb1 = undefined
    hsb2 = undefined
    rgb = undefined
    h = undefined
    s = undefined
    colorBits1 = @color(c1)
    colorBits2 = @color(c2)
    if @curColorMode is @Constants.HSB
      
      # Special processing for HSB mode.
      # Get HSB and Alpha values for Color 1 and 2
      hsb1 = @colorToHSB(colorBits1)
      a1 = ((colorBits1 & @Constants.ALPHA_MASK) >>> 24) / @colorModeA
      hsb2 = @colorToHSB(colorBits2)
      a2 = ((colorBits2 & @Constants.ALPHA_MASK) >>> 24) / @colorModeA
      
      # RColourFunctions.eturn lerp value for each channel, for HSB components
      h = @lerp(hsb1[0], hsb2[0], amt)
      s = @lerp(hsb1[1], hsb2[1], amt)
      b = @lerp(hsb1[2], hsb2[2], amt)
      rgb = @color.toRGB(h, s, b)
      
      # ... and for Alpha-range
      a = @lerp(a1, a2, amt) * @colorModeA
      return (a << 24) & @Constants.ALPHA_MASK | (rgb[0] << 16) & @Constants.RED_MASK | (rgb[1] << 8) & @Constants.GREEN_MASK | rgb[2] & @Constants.BLUE_MASK
    
    # Get RGBA values for Color 1 to floats
    r1 = (colorBits1 & @Constants.RED_MASK) >>> 16
    g1 = (colorBits1 & @Constants.GREEN_MASK) >>> 8
    b1 = (colorBits1 & @Constants.BLUE_MASK)
    a1 = ((colorBits1 & @Constants.ALPHA_MASK) >>> 24) / @colorModeA
    
    # Get RGBA values for Color 2 to floats
    r2 = (colorBits2 & @Constants.RED_MASK) >>> 16
    g2 = (colorBits2 & @Constants.GREEN_MASK) >>> 8
    b2 = (colorBits2 & @Constants.BLUE_MASK)
    a2 = ((colorBits2 & @Constants.ALPHA_MASK) >>> 24) / @colorModeA
    
    # Return lerp value for each channel, INT for color, Float for Alpha-range
    r = @lerp(r1, r2, amt) | 0
    g = @lerp(g1, g2, amt) | 0
    b = @lerp(b1, b2, amt) | 0
    a = @lerp(a1, a2, amt) * @colorModeA
    (a << 24) & @Constants.ALPHA_MASK | (r << 16) & @Constants.RED_MASK | (g << 8) & @Constants.GREEN_MASK | b & @Constants.BLUE_MASK

  
  ###
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
  ###
  colorMode: (mode, range1, range2, range3, range4) ->
    @curColorMode = mode
    if arguments.length > 1
      @colorModeX = range1
      @colorModeY = range2 or range1
      @colorModeZ = range3 or range1
      @colorModeA = range4 or range1

  
  # blending modes
  ###
  These are internal blending modes used for BlendColor()
  
  @param {Color} c1       First Color to blend
  @param {Color} c2       Second Color to blend
  
  @returns {Color}        The blended Color
  
  @see BlendColor
  @see Blend
  ###
  modesFunction: ->
    ALPHA_MASK = @Constants.ALPHA_MASK
    RED_MASK = @Constants.RED_MASK
    GREEN_MASK = @Constants.GREEN_MASK
    BLUE_MASK = @Constants.BLUE_MASK
    min = Math.min
    max = Math.max
    applyMode = undefined
    applyMode = (c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb) ->
      a = undefined
      r = undefined
      g = undefined
      b = undefined
      a = min(((c1 & 0xff000000) >>> 24) + f, 0xff) << 24
      r = (ar + (((cr - ar) * f) >> 8))
      r = ((if (r < 0) then 0 else ((if (r > 255) then 255 else r)))) << 16
      g = (ag + (((cg - ag) * f) >> 8))
      g = ((if (g < 0) then 0 else ((if (g > 255) then 255 else g)))) << 8
      b = ab + (((cb - ab) * f) >> 8)
      b = (if (b < 0) then 0 else ((if (b > 255) then 255 else b)))
      a | r | g | b

    replace = (c1, c2) ->
      c2

    blend = (c1, c2) ->
      f = (c2 & ALPHA_MASK) >>> 24
      ar = (c1 & RED_MASK)
      ag = (c1 & GREEN_MASK)
      ab = (c1 & BLUE_MASK)
      br = (c2 & RED_MASK)
      bg = (c2 & GREEN_MASK)
      bb = (c2 & BLUE_MASK)
      min(((c1 & ALPHA_MASK) >>> 24) + f, 0xff) << 24 | (ar + (((br - ar) * f) >> 8)) & RED_MASK | (ag + (((bg - ag) * f) >> 8)) & GREEN_MASK | (ab + (((bb - ab) * f) >> 8)) & BLUE_MASK

    add = (c1, c2) ->
      f = (c2 & ALPHA_MASK) >>> 24
      min(((c1 & ALPHA_MASK) >>> 24) + f, 0xff) << 24 | min(((c1 & RED_MASK) + ((c2 & RED_MASK) >> 8) * f), RED_MASK) & RED_MASK | min(((c1 & GREEN_MASK) + ((c2 & GREEN_MASK) >> 8) * f), GREEN_MASK) & GREEN_MASK | min((c1 & BLUE_MASK) + (((c2 & BLUE_MASK) * f) >> 8), BLUE_MASK)

    subtract = (c1, c2) ->
      f = (c2 & ALPHA_MASK) >>> 24
      min(((c1 & ALPHA_MASK) >>> 24) + f, 0xff) << 24 | max(((c1 & RED_MASK) - ((c2 & RED_MASK) >> 8) * f), GREEN_MASK) & RED_MASK | max(((c1 & GREEN_MASK) - ((c2 & GREEN_MASK) >> 8) * f), BLUE_MASK) & GREEN_MASK | max((c1 & BLUE_MASK) - (((c2 & BLUE_MASK) * f) >> 8), 0)

    lightest = (c1, c2) ->
      f = (c2 & ALPHA_MASK) >>> 24
      min(((c1 & ALPHA_MASK) >>> 24) + f, 0xff) << 24 | max(c1 & RED_MASK, ((c2 & RED_MASK) >> 8) * f) & RED_MASK | max(c1 & GREEN_MASK, ((c2 & GREEN_MASK) >> 8) * f) & GREEN_MASK | max(c1 & BLUE_MASK, ((c2 & BLUE_MASK) * f) >> 8)

    darkest = (c1, c2) ->
      f = (c2 & ALPHA_MASK) >>> 24
      ar = (c1 & RED_MASK)
      ag = (c1 & GREEN_MASK)
      ab = (c1 & BLUE_MASK)
      br = min(c1 & RED_MASK, ((c2 & RED_MASK) >> 8) * f)
      bg = min(c1 & GREEN_MASK, ((c2 & GREEN_MASK) >> 8) * f)
      bb = min(c1 & BLUE_MASK, ((c2 & BLUE_MASK) * f) >> 8)
      min(((c1 & ALPHA_MASK) >>> 24) + f, 0xff) << 24 | (ar + (((br - ar) * f) >> 8)) & RED_MASK | (ag + (((bg - ag) * f) >> 8)) & GREEN_MASK | (ab + (((bb - ab) * f) >> 8)) & BLUE_MASK

    difference = (c1, c2) ->
      f = (c2 & ALPHA_MASK) >>> 24
      ar = (c1 & RED_MASK) >> 16
      ag = (c1 & GREEN_MASK) >> 8
      ab = (c1 & BLUE_MASK)
      br = (c2 & RED_MASK) >> 16
      bg = (c2 & GREEN_MASK) >> 8
      bb = (c2 & BLUE_MASK)
      cr = (if (ar > br) then (ar - br) else (br - ar))
      cg = (if (ag > bg) then (ag - bg) else (bg - ag))
      cb = (if (ab > bb) then (ab - bb) else (bb - ab))
      applyMode c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb

    exclusion = (c1, c2) ->
      f = (c2 & ALPHA_MASK) >>> 24
      ar = (c1 & RED_MASK) >> 16
      ag = (c1 & GREEN_MASK) >> 8
      ab = (c1 & BLUE_MASK)
      br = (c2 & RED_MASK) >> 16
      bg = (c2 & GREEN_MASK) >> 8
      bb = (c2 & BLUE_MASK)
      cr = ar + br - ((ar * br) >> 7)
      cg = ag + bg - ((ag * bg) >> 7)
      cb = ab + bb - ((ab * bb) >> 7)
      applyMode c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb

    multiply = (c1, c2) ->
      f = (c2 & ALPHA_MASK) >>> 24
      ar = (c1 & RED_MASK) >> 16
      ag = (c1 & GREEN_MASK) >> 8
      ab = (c1 & BLUE_MASK)
      br = (c2 & RED_MASK) >> 16
      bg = (c2 & GREEN_MASK) >> 8
      bb = (c2 & BLUE_MASK)
      cr = (ar * br) >> 8
      cg = (ag * bg) >> 8
      cb = (ab * bb) >> 8
      applyMode c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb

    screen = (c1, c2) ->
      f = (c2 & ALPHA_MASK) >>> 24
      ar = (c1 & RED_MASK) >> 16
      ag = (c1 & GREEN_MASK) >> 8
      ab = (c1 & BLUE_MASK)
      br = (c2 & RED_MASK) >> 16
      bg = (c2 & GREEN_MASK) >> 8
      bb = (c2 & BLUE_MASK)
      cr = 255 - (((255 - ar) * (255 - br)) >> 8)
      cg = 255 - (((255 - ag) * (255 - bg)) >> 8)
      cb = 255 - (((255 - ab) * (255 - bb)) >> 8)
      applyMode c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb

    hard_light = (c1, c2) ->
      f = (c2 & ALPHA_MASK) >>> 24
      ar = (c1 & RED_MASK) >> 16
      ag = (c1 & GREEN_MASK) >> 8
      ab = (c1 & BLUE_MASK)
      br = (c2 & RED_MASK) >> 16
      bg = (c2 & GREEN_MASK) >> 8
      bb = (c2 & BLUE_MASK)
      cr = (if (br < 128) then ((ar * br) >> 7) else (255 - (((255 - ar) * (255 - br)) >> 7)))
      cg = (if (bg < 128) then ((ag * bg) >> 7) else (255 - (((255 - ag) * (255 - bg)) >> 7)))
      cb = (if (bb < 128) then ((ab * bb) >> 7) else (255 - (((255 - ab) * (255 - bb)) >> 7)))
      applyMode c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb

    soft_light = (c1, c2) ->
      f = (c2 & ALPHA_MASK) >>> 24
      ar = (c1 & RED_MASK) >> 16
      ag = (c1 & GREEN_MASK) >> 8
      ab = (c1 & BLUE_MASK)
      br = (c2 & RED_MASK) >> 16
      bg = (c2 & GREEN_MASK) >> 8
      bb = (c2 & BLUE_MASK)
      cr = ((ar * br) >> 7) + ((ar * ar) >> 8) - ((ar * ar * br) >> 15)
      cg = ((ag * bg) >> 7) + ((ag * ag) >> 8) - ((ag * ag * bg) >> 15)
      cb = ((ab * bb) >> 7) + ((ab * ab) >> 8) - ((ab * ab * bb) >> 15)
      applyMode c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb

    overlay = (c1, c2) ->
      f = (c2 & ALPHA_MASK) >>> 24
      ar = (c1 & RED_MASK) >> 16
      ag = (c1 & GREEN_MASK) >> 8
      ab = (c1 & BLUE_MASK)
      br = (c2 & RED_MASK) >> 16
      bg = (c2 & GREEN_MASK) >> 8
      bb = (c2 & BLUE_MASK)
      cr = (if (ar < 128) then ((ar * br) >> 7) else (255 - (((255 - ar) * (255 - br)) >> 7)))
      cg = (if (ag < 128) then ((ag * bg) >> 7) else (255 - (((255 - ag) * (255 - bg)) >> 7)))
      cb = (if (ab < 128) then ((ab * bb) >> 7) else (255 - (((255 - ab) * (255 - bb)) >> 7)))
      applyMode c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb

    dodge = (c1, c2) ->
      f = (c2 & ALPHA_MASK) >>> 24
      ar = (c1 & RED_MASK) >> 16
      ag = (c1 & GREEN_MASK) >> 8
      ab = (c1 & BLUE_MASK)
      br = (c2 & RED_MASK) >> 16
      bg = (c2 & GREEN_MASK) >> 8
      bb = (c2 & BLUE_MASK)
      cr = undefined
      cg = undefined
      cb = undefined
      cr = 255
      if br isnt 255
        cr = (ar << 8) / (255 - br)
        cr = (if (cr < 0) then 0 else ((if (cr > 255) then 255 else cr)))
      cg = 255
      if bg isnt 255
        cg = (ag << 8) / (255 - bg)
        cg = (if (cg < 0) then 0 else ((if (cg > 255) then 255 else cg)))
      cb = 255
      if bb isnt 255
        cb = (ab << 8) / (255 - bb)
        cb = (if (cb < 0) then 0 else ((if (cb > 255) then 255 else cb)))
      applyMode c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb

    burn = (c1, c2) ->
      f = (c2 & ALPHA_MASK) >>> 24
      ar = (c1 & RED_MASK) >> 16
      ag = (c1 & GREEN_MASK) >> 8
      ab = (c1 & BLUE_MASK)
      br = (c2 & RED_MASK) >> 16
      bg = (c2 & GREEN_MASK) >> 8
      bb = (c2 & BLUE_MASK)
      cr = undefined
      cg = undefined
      cb = undefined
      cr = 0
      if br isnt 0
        cr = ((255 - ar) << 8) / br
        cr = 255 - ((if (cr < 0) then 0 else ((if (cr > 255) then 255 else cr))))
      cg = 0
      if bg isnt 0
        cg = ((255 - ag) << 8) / bg
        cg = 255 - ((if (cg < 0) then 0 else ((if (cg > 255) then 255 else cg))))
      cb = 0
      if bb isnt 0
        cb = ((255 - ab) << 8) / bb
        cb = 255 - ((if (cb < 0) then 0 else ((if (cb > 255) then 255 else cb))))
      applyMode c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb
  
  ###
  Blends two color values together based on the blending mode given as the MODE parameter.
  The possible modes are described in the reference for the blend() function.
  
  @param {color} c1 color: the first color to blend
  @param {color} c2 color: the second color to blend
  @param {MODE} MODE Either BLEND, ADD, SUBTRACT, DARKEST, LIGHTEST, DIFFERENCE, EXCLUSION, MULTIPLY,
  SCREEN, OVERLAY, HARD_LIGHT, SOFT_LIGHT, DODGE, or BURN
  
  @returns {float} The blended color.
  
  @see blend
  @see color
  ###
  blendColor: (c1, c2, mode) ->
    if mode is @Constants.REPLACE
      @modes.replace c1, c2
    else if mode is @Constants.BLEND
      @modes.blend c1, c2
    else if mode is @Constants.ADD
      @modes.add c1, c2
    else if mode is @Constants.SUBTRACT
      @modes.subtract c1, c2
    else if mode is @Constants.LIGHTEST
      @modes.lightest c1, c2
    else if mode is @Constants.DARKEST
      @modes.darkest c1, c2
    else if mode is @Constants.DIFFERENCE
      @modes.difference c1, c2
    else if mode is @Constants.EXCLUSION
      @modes.exclusion c1, c2
    else if mode is @Constants.MULTIPLY
      @modes.multiply c1, c2
    else if mode is @Constants.SCREEN
      @modes.screen c1, c2
    else if mode is @Constants.HARD_LIGHT
      @modes.hard_light c1, c2
    else if mode is @Constants.SOFT_LIGHT
      @modes.soft_light c1, c2
    else if mode is @Constants.OVERLAY
      @modes.overlay c1, c2
    else if mode is @Constants.DODGE
      @modes.dodge c1, c2
    else @modes.burn c1, c2  if mode is @Constants.BURN

module.exports = ColourFunctions

