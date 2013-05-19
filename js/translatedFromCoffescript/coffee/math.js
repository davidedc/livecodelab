/*
Calculates the absolute value (magnitude) of a number. The absolute value of a
number is always positive.

@param {int|float} value   int or float

@returns {int|float}
*/

var Marsaglia, PerlinNoise, Random, abs, acos, asin, atan, atan2, ceil, constrain, cos, currentRandom, degrees, dist, exp, floor, lerp, log, mag, map, max, min, noise, noiseDetail, noiseProfile, noiseSeed, norm, pow, radians, random, randomSeed, round, sin, sq, sqrt, tan;

abs = Math.abs;

/*
Calculates the closest int value that is greater than or equal to the value
of the parameter. For example, ceil(9.03) returns the value 10.

@param {float} value   float

@returns {int}

@see floor
@see round
*/


ceil = Math.ceil;

/*
Constrains a value to not exceed a maximum and minimum value.

@param {int|float} value   the value to constrain
@param {int|float} value   minimum limit
@param {int|float} value   maximum limit

@returns {int|float}

@see max
@see min
*/


constrain = function(aNumber, aMin, aMax) {
  if (aNumber > aMax) {
    return aMax;
  } else {
    if (aNumber < aMin) {
      return aMin;
    } else {
      return aNumber;
    }
  }
};

/*
Calculates the distance between two points.

@param {int|float} x1     int or float: x-coordinate of the first point
@param {int|float} y1     int or float: y-coordinate of the first point
@param {int|float} z1     int or float: z-coordinate of the first point
@param {int|float} x2     int or float: x-coordinate of the second point
@param {int|float} y2     int or float: y-coordinate of the second point
@param {int|float} z2     int or float: z-coordinate of the second point

@returns {float}
*/


dist = function() {
  var dx, dy, dz;

  dx = void 0;
  dy = void 0;
  dz = void 0;
  if (arguments.length === 4) {
    dx = arguments[0] - arguments[2];
    dy = arguments[1] - arguments[3];
    return Math.sqrt(dx * dx + dy * dy);
  }
  if (arguments.length === 6) {
    dx = arguments[0] - arguments[3];
    dy = arguments[1] - arguments[4];
    dz = arguments[2] - arguments[5];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
};

/*
Returns Euler's number e (2.71828...) raised to the power of the
value parameter.

@param {int|float} value   int or float: the exponent to raise e to

@returns {float}
*/


exp = Math.exp;

/*
Calculates the closest int value that is less than or equal to the
value of the parameter.

@param {int|float} value        the value to floor

@returns {int|float}

@see ceil
@see round
*/


floor = Math.floor;

/*
Calculates a number between two numbers at a specific increment. The amt
parameter is the amount to interpolate between the two values where 0.0 equal
to the first point, 0.1 is very near the first point, 0.5 is half-way in
between, etc. The lerp function is convenient for creating motion along a
straight path and for drawing dotted lines.

@param {int|float} value1       float or int: first value
@param {int|float} value2       float or int: second value
@param {int|float} amt          float: between 0.0 and 1.0

@returns {float}

@see curvePoint
@see bezierPoint
*/


lerp = function(value1, value2, amt) {
  return ((value2 - value1) * amt) + value1;
};

/*
Calculates the natural logarithm (the base-e logarithm) of a number.
This function expects the values greater than 0.0.

@param {int|float} value        int or float: number must be greater then 0.0

@returns {float}
*/


log = Math.log;

/*
Calculates the magnitude (or length) of a vector. A vector is a direction
in space commonly used in computer graphics and linear algebra. Because it
has no "start" position, the magnitude of a vector can be thought of as the
distance from coordinate (0,0) to its (x,y) value. Therefore, mag() is a
shortcut for writing "dist(0, 0, x, y)".

@param {int|float} a       float or int: first value
@param {int|float} b       float or int: second value
@param {int|float} c       float or int: third value

@returns {float}

@see dist
*/


mag = function(a, b, c) {
  if (c) {
    return Math.sqrt(a * a + b * b + c * c);
  }
  return Math.sqrt(a * a + b * b);
};

/*
Re-maps a number from one range to another. In the example above, the number
'25' is converted from a value in the range 0..100 into a value that ranges
from the left edge (0) to the right edge (width) of the screen. Numbers
outside the range are not clamped to 0 and 1, because out-of-range values
are often intentional and useful.

@param {float} value        The incoming value to be converted
@param {float} istart       Lower bound of the value's current range
@param {float} istop        Upper bound of the value's current range
@param {float} ostart       Lower bound of the value's target range
@param {float} ostop        Upper bound of the value's target range

@returns {float}

@see norm
@see lerp
*/


map = function(value, istart, istop, ostart, ostop) {
  return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
};

/*
Determines the largest value in a sequence of numbers.

@param {int|float} value1         int or float
@param {int|float} value2         int or float
@param {int|float} value3         int or float
@param {int|float} array          int or float array

@returns {int|float}

@see min
*/


max = function() {
  var count, i, numbers;

  if (arguments.length === 2) {
    return (arguments[0] < arguments[1] ? arguments[1] : arguments[0]);
  }
  numbers = (arguments.length === 1 ? arguments[0] : arguments);
  if (!("length" in numbers && numbers.length)) {
    throw new Error("Non-empty array is expected");
  }
  max = numbers[0];
  count = numbers.length;
  i = 1;
  while (i < count) {
    if (max < numbers[i]) {
      max = numbers[i];
    }
    ++i;
  }
  return max;
};

/*
Determines the smallest value in a sequence of numbers.

@param {int|float} value1         int or float
@param {int|float} value2         int or float
@param {int|float} value3         int or float
@param {int|float} array          int or float array

@returns {int|float}

@see max
*/


min = function() {
  var count, i, numbers;

  if (arguments.length === 2) {
    return (arguments[0] < arguments[1] ? arguments[0] : arguments[1]);
  }
  numbers = (arguments.length === 1 ? arguments[0] : arguments);
  if (!("length" in numbers && numbers.length)) {
    throw new Error("Non-empty array is expected");
  }
  min = numbers[0];
  count = numbers.length;
  i = 1;
  while (i < count) {
    if (min > numbers[i]) {
      min = numbers[i];
    }
    ++i;
  }
  return min;
};

/*
Normalizes a number from another range into a value between 0 and 1.
Identical to map(value, low, high, 0, 1);
Numbers outside the range are not clamped to 0 and 1, because out-of-range
values are often intentional and useful.

@param {float} aNumber    The incoming value to be converted
@param {float} low        Lower bound of the value's current range
@param {float} high       Upper bound of the value's current range

@returns {float}

@see map
@see lerp
*/


norm = function(aNumber, low, high) {
  return (aNumber - low) / (high - low);
};

/*
Facilitates exponential expressions. The pow() function is an efficient way of
multiplying numbers by themselves (or their reciprocal) in large quantities.
For example, pow(3, 5) is equivalent to the expression 3*3*3*3*3 and pow(3, -5)
is equivalent to 1 / 3*3*3*3*3.

@param {int|float} num        base of the exponential expression
@param {int|float} exponent   power of which to raise the base

@returns {float}

@see sqrt
*/


pow = Math.pow;

/*
Calculates the integer closest to the value parameter.
For example, round(9.2) returns the value 9.

@param {float} value        number to round

@returns {int}

@see floor
@see ceil
*/


round = Math.round;

/*
Squares a number (multiplies a number by itself).
The result is always a positive number,
as multiplying two negative numbers always yields a
positive result. For example, -1 * -1 = 1.

@param {float} value        int or float

@returns {float}

@see sqrt
*/


sq = function(aNumber) {
  return aNumber * aNumber;
};

/*
Calculates the square root of a number.
The square root of a number is always positive,
even though there may be a valid negative root.
The square root s of number a is such
that s*s = a. It is the opposite of squaring.

@param {float} value        int or float, non negative

@returns {float}

@see pow
@see sq
*/


sqrt = Math.sqrt;

/*
The inverse of cos(), returns the arc cosine of a value.
This function expects the values in the range of -1 to 1
and values are returned in the range 0 to PI (3.1415927).

@param {float} value        the value whose arc cosine is to be returned

@returns {float}

@see cos
@see asin
@see atan
*/


acos = Math.acos;

/*
The inverse of sin(), returns the arc sine of a value.
This function expects the values in the range of -1 to 1
and values are returned in the range -PI/2 to PI/2.

@param {float} value        the value whose arc sine is to be returned

@returns {float}

@see sin
@see acos
@see atan
*/


asin = Math.asin;

/*
The inverse of tan(), returns the arc tangent of a value.
This function expects the values in the range of -Infinity
to Infinity (exclusive) and values are returned in the range -PI/2 to PI/2 .

@param {float} value        -Infinity to Infinity (exclusive)

@returns {float}

@see tan
@see asin
@see acos
*/


atan = Math.atan;

/*
Calculates the angle (in radians) from a specified point to
the coordinate origin as measured from the positive x-axis.
Values are returned as a float in the range from PI to -PI.
The atan2() function is most often used for orienting geometry
to the position of the cursor. Note: The y-coordinate of the
point is the first parameter and the x-coordinate is the second
due the the structure of calculating the tangent.

@param {float} y        y-coordinate of the point
@param {float} x        x-coordinate of the point

@returns {float}

@see tan
*/


atan2 = Math.atan2;

/*
Calculates the cosine of an angle. This function expects the values
of the angle parameter to be provided in radians (values from 0 to PI*2).
Values are returned in the range -1 to 1.

@param {float} value        an angle in radians

@returns {float}

@see tan
@see sin
*/


cos = Math.cos;

/*
Converts a radian measurement to its corresponding value in degrees.
Radians and degrees are two ways of measuring the same thing.
There are 360 degrees in a circle and 2*PI radians in a circle.
For example, 90 degrees = PI/2 = 1.5707964. All trigonometric methods
in Processing require their parameters to be specified in radians.

@param {int|float} value        an angle in radians

@returns {float}

@see radians
*/


degrees = function(aAngle) {
  return (aAngle * 180) / Math.PI;
};

/*
Converts a degree measurement to its corresponding value in radians. Radians and degrees are two ways of
measuring the same thing. There are 360 degrees in a circle and 2*PI radians in a circle. For example,
90 degrees = PI/2 = 1.5707964. All trigonometric methods in Processing require their parameters to be specified in radians.

@param {int|float} value        an angle in radians

@returns {float}

@see degrees
*/


radians = function(aAngle) {
  return (aAngle / 180) * Math.PI;
};

/*
Calculates the sine of an angle. This function expects the values of the angle parameter to be provided in
radians (values from 0 to 6.28). Values are returned in the range -1 to 1.

@param {float} value        an angle in radians

@returns {float}

@see cos
@see radians
*/


sin = Math.sin;

/*
Calculates the ratio of the sine and cosine of an angle. This function expects the values of the angle
parameter to be provided in radians (values from 0 to PI*2). Values are returned in the range infinity to -infinity.

@param {float} value        an angle in radians

@returns {float}

@see cos
@see sin
@see radians
*/


tan = Math.tan;

currentRandom = Math.random;

/*
Generates random numbers. Each time the random() function is called, it returns an unexpected value within
the specified range. If one parameter is passed to the function it will return a float between zero and the
value of the high parameter. The function call random(5) returns values between 0 and 5 (starting at zero,
up to but not including 5). If two parameters are passed, it will return a float with a value between the
parameters. The function call random(-5, 10.2) returns values starting at -5 up to (but not including) 10.2.
To convert a floating-point random number to an integer, use the int() function.

@param {int|float} value1         if one parameter is used, the top end to random from, if two params the low end
@param {int|float} value2         the top end of the random range

@returns {float}

@see randomSeed
@see noise
*/


random = function() {
  var aMax, aMin;

  if (!arguments.length) {
    return currentRandom();
  }
  if (arguments.length === 1) {
    return currentRandom() * arguments[0];
  }
  aMin = arguments[0];
  aMax = arguments[1];
  return currentRandom() * (aMax - aMin) + aMin;
};

Marsaglia = function(i1, i2) {
  var nextInt, w, z;

  z = i1 || 362436069;
  w = i2 || 521288629;
  nextInt = function() {
    z = (36969 * (z & 65535) + (z >>> 16)) & 0xFFFFFFFF;
    w = (18000 * (w & 65535) + (w >>> 16)) & 0xFFFFFFFF;
    return (((z & 0xFFFF) << 16) | (w & 0xFFFF)) & 0xFFFFFFFF;
  };
  this.nextDouble = function() {
    var i;

    i = nextInt() / 4294967296;
    if (i < 0) {
      return 1 + i;
    } else {
      return i;
    }
  };
  return this.nextInt = nextInt;
};

Marsaglia.createRandomized = function() {
  var now;

  now = new Date();
  return new Marsaglia((now / 60000) & 0xFFFFFFFF, now & 0xFFFFFFFF);
};

/*
Sets the seed value for random(). By default, random() produces different results each time the
program is run. Set the value parameter to a constant to return the same pseudo-random numbers
each time the software is run.

@param {int|float} seed         int

@see random
@see noise
@see noiseSeed
*/


randomSeed = function(seed) {
  return currentRandom = (new Marsaglia(seed)).nextDouble;
};

Random = function(seed) {
  var haveNextNextGaussian, nextNextGaussian;

  haveNextNextGaussian = false;
  nextNextGaussian = void 0;
  random = void 0;
  this.nextGaussian = function() {
    var multiplier, s, v1, v2;

    if (haveNextNextGaussian) {
      haveNextNextGaussian = false;
      return nextNextGaussian;
    }
    v1 = void 0;
    v2 = void 0;
    s = void 0;
    while (true) {
      v1 = 2 * random() - 1;
      v2 = 2 * random() - 1;
      s = v1 * v1 + v2 * v2;
      if (!(s >= 1 || s === 0)) {
        break;
      }
    }
    multiplier = Math.sqrt(-2 * Math.log(s) / s);
    nextNextGaussian = v2 * multiplier;
    haveNextNextGaussian = true;
    return v1 * multiplier;
  };
  return random = (seed === void 0 ? Math.random : (new Marsaglia(seed)).nextDouble);
};

PerlinNoise = function(seed) {
  var grad1d, grad2d, grad3d, i, j, perm, rnd, t;

  grad3d = function(i, x, y, z) {
    var h, u, v;

    h = i & 15;
    u = (h < 8 ? x : y);
    v = (h < 4 ? y : (h === 12 || h === 14 ? x : z));
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  };
  grad2d = function(i, x, y) {
    var v;

    v = ((i & 1) === 0 ? x : y);
    if ((i & 2) === 0) {
      return -v;
    } else {
      return v;
    }
  };
  grad1d = function(i, x) {
    if ((i & 1) === 0) {
      return -x;
    } else {
      return x;
    }
  };
  lerp = function(t, a, b) {
    return a + t * (b - a);
  };
  rnd = (seed !== void 0 ? new Marsaglia(seed) : Marsaglia.createRandomized());
  i = void 0;
  j = void 0;
  perm = new Uint8Array(512);
  i = 0;
  while (i < 256) {
    perm[i] = i;
    ++i;
  }
  i = 0;
  while (i < 256) {
    t = perm[j = rnd.nextInt() & 0xFF];
    perm[j] = perm[i];
    perm[i] = t;
    ++i;
  }
  i = 0;
  while (i < 256) {
    perm[i + 256] = perm[i];
    ++i;
  }
  this.noise3d = function(x, y, z) {
    var X, Y, Z, fx, fy, fz, p0, p00, p01, p1, p10, p11;

    X = Math.floor(x) & 255;
    Y = Math.floor(y) & 255;
    Z = Math.floor(z) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    fx = (3 - 2 * x) * x * x;
    fy = (3 - 2 * y) * y * y;
    fz = (3 - 2 * z) * z * z;
    p0 = perm[X] + Y;
    p00 = perm[p0] + Z;
    p01 = perm[p0 + 1] + Z;
    p1 = perm[X + 1] + Y;
    p10 = perm[p1] + Z;
    p11 = perm[p1 + 1] + Z;
    return lerp(fz, lerp(fy, lerp(fx, grad3d(perm[p00], x, y, z), grad3d(perm[p10], x - 1, y, z)), lerp(fx, grad3d(perm[p01], x, y - 1, z), grad3d(perm[p11], x - 1, y - 1, z))), lerp(fy, lerp(fx, grad3d(perm[p00 + 1], x, y, z - 1), grad3d(perm[p10 + 1], x - 1, y, z - 1)), lerp(fx, grad3d(perm[p01 + 1], x, y - 1, z - 1), grad3d(perm[p11 + 1], x - 1, y - 1, z - 1))));
  };
  this.noise2d = function(x, y) {
    var X, Y, fx, fy, p0, p1;

    X = Math.floor(x) & 255;
    Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    fx = (3 - 2 * x) * x * x;
    fy = (3 - 2 * y) * y * y;
    p0 = perm[X] + Y;
    p1 = perm[X + 1] + Y;
    return lerp(fy, lerp(fx, grad2d(perm[p0], x, y), grad2d(perm[p1], x - 1, y)), lerp(fx, grad2d(perm[p0 + 1], x, y - 1), grad2d(perm[p1 + 1], x - 1, y - 1)));
  };
  return this.noise1d = function(x) {
    var X, fx;

    X = Math.floor(x) & 255;
    x -= Math.floor(x);
    fx = (3 - 2 * x) * x * x;
    return lerp(fx, grad1d(perm[X], x), grad1d(perm[X + 1], x - 1));
  };
};

noiseProfile = {
  generator: void 0,
  octaves: 4,
  fallout: 0.5,
  seed: void 0
};

/*
Returns the Perlin noise value at specified coordinates. Perlin noise is a random sequence
generator producing a more natural ordered, harmonic succession of numbers compared to the
standard random() function. It was invented by Ken Perlin in the 1980s and been used since
in graphical applications to produce procedural textures, natural motion, shapes, terrains etc.
The main difference to the random() function is that Perlin noise is defined in an infinite
n-dimensional space where each pair of coordinates corresponds to a fixed semi-random value
(fixed only for the lifespan of the program). The resulting value will always be between 0.0
and 1.0. Processing can compute 1D, 2D and 3D noise, depending on the number of coordinates
given. The noise value can be animated by moving through the noise space as demonstrated in
the example above. The 2nd and 3rd dimension can also be interpreted as time.
The actual noise is structured similar to an audio signal, in respect to the function's use
of frequencies. Similar to the concept of harmonics in physics, perlin noise is computed over
several octaves which are added together for the final result.
Another way to adjust the character of the resulting sequence is the scale of the input
coordinates. As the function works within an infinite space the value of the coordinates
doesn't matter as such, only the distance between successive coordinates does (eg. when using
noise() within a loop). As a general rule the smaller the difference between coordinates, the
smoother the resulting noise sequence will be. Steps of 0.005-0.03 work best for most applications,
but this will differ depending on use.

@param {float} x          x coordinate in noise space
@param {float} y          y coordinate in noise space
@param {float} z          z coordinate in noise space

@returns {float}

@see random
@see noiseDetail
*/


noise = function(x, y, z) {
  var effect, generator, i, k, sum;

  if (noiseProfile.generator === void 0) {
    noiseProfile.generator = new PerlinNoise(noiseProfile.seed);
  }
  generator = noiseProfile.generator;
  effect = 1;
  k = 1;
  sum = 0;
  i = 0;
  while (i < noiseProfile.octaves) {
    effect *= noiseProfile.fallout;
    switch (arguments.length) {
      case 1:
        sum += effect * (1 + generator.noise1d(k * x)) / 2;
        break;
      case 2:
        sum += effect * (1 + generator.noise2d(k * x, k * y)) / 2;
        break;
      case 3:
        sum += effect * (1 + generator.noise3d(k * x, k * y, k * z)) / 2;
    }
    k *= 2;
    ++i;
  }
  return sum;
};

/*
Adjusts the character and level of detail produced by the Perlin noise function.
Similar to harmonics in physics, noise is computed over several octaves. Lower octaves
contribute more to the output signal and as such define the overal intensity of the noise,
whereas higher octaves create finer grained details in the noise sequence. By default,
noise is computed over 4 octaves with each octave contributing exactly half than its
predecessor, starting at 50% strength for the 1st octave. This falloff amount can be
changed by adding an additional function parameter. Eg. a falloff factor of 0.75 means
each octave will now have 75% impact (25% less) of the previous lower octave. Any value
between 0.0 and 1.0 is valid, however note that values greater than 0.5 might result in
greater than 1.0 values returned by noise(). By changing these parameters, the signal
created by the noise() function can be adapted to fit very specific needs and characteristics.

@param {int} octaves          number of octaves to be used by the noise() function
@param {float} falloff        falloff factor for each octave

@see noise
*/


noiseDetail = function(octaves, fallout) {
  noiseProfile.octaves = octaves;
  if (fallout !== void 0) {
    return noiseProfile.fallout = fallout;
  }
};

/*
Sets the seed value for noise(). By default, noise() produces different results each
time the program is run. Set the value parameter to a constant to return the same
pseudo-random numbers each time the software is run.

@param {int} seed         int

@returns {float}

@see random
@see radomSeed
@see noise
@see noiseDetail
*/


noiseSeed = function(seed) {
  noiseProfile.seed = seed;
  return noiseProfile.generator = void 0;
};
