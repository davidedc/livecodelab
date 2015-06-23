# Functions adapted from processing.js

#//////////////////////////////////////////////////////////////////////////
# Math functions
#//////////////////////////////////////////////////////////////////////////

class MathFunctions

  constructor: ->
    @abs = Math.abs
    @ceil = Math.ceil
    @exp = Math.exp
    @floor = Math.floor
    @int = int
    @log = Math.log
    @max = max
    @min = min
    @pow = Math.pow
    @round = Math.round
    @sqrt = Math.sqrt
    @acos = Math.acos
    @asin = Math.asin
    @atan = Math.atan
    @atan2 = Math.atan2

    @cos = Math.cos
    @sin = Math.sin
    @tan = Math.tan
    @degrees = degrees
    @radians = radians

    @random = random
    @noise = noise

    @pi = Math.PI

  addToScope: (scope) ->
    scope.add('abs',     @abs)
    scope.add('ceil',    @ceil)
    scope.add('exp',     @exp)
    scope.add('floor',   @floor)
    scope.add('int',     @int)

    scope.add('log',     @log)
    scope.add('max',     @max)
    scope.add('min',     @min)
    scope.add('pow',     @pow)
    scope.add('round',   @round)
    scope.add('sqrt',    @sqrt)
    scope.add('acos',    @acos)
    scope.add('asin',    @asin)
    scope.add('atan',    @atan)
    scope.add('atan2',   @atan2)
    scope.add('cos',     @cos)
    scope.add('sin',     @sin)
    scope.add('tan',     @tan)
    scope.add('degrees', @degrees)
    scope.add('radians', @radians)
    scope.add('random',  @random)
    scope.add('noise',   @noise)
    scope.add('pi',      @pi)


# Calculation
###
Calculates the absolute value (magnitude) of a number. The absolute value of a
number is always positive.

@param {int|float} value   int or float

@returns {int|float}
###
abs = Math.abs

###
Calculates the closest int value that is greater than or equal to the value
of the parameter. For example, ceil(9.03) returns the value 10.

@param {float} value   float

@returns {int}

@see floor
@see round
###
ceil = Math.ceil

###
Constrains a value to not exceed a maximum and minimum value.

@param {int|float} value   the value to constrain
@param {int|float} value   minimum limit
@param {int|float} value   maximum limit

@returns {int|float}

@see max
@see min
###
constrain = (aNumber, aMin, aMax) ->
  (if aNumber > aMax then aMax else (if aNumber < aMin then aMin else aNumber))


###
Calculates the distance between two points.

@param {int|float} x1     int or float: x-coordinate of the first point
@param {int|float} y1     int or float: y-coordinate of the first point
@param {int|float} z1     int or float: z-coordinate of the first point
@param {int|float} x2     int or float: x-coordinate of the second point
@param {int|float} y2     int or float: y-coordinate of the second point
@param {int|float} z2     int or float: z-coordinate of the second point

@returns {float}
###
dist = ->
  dx = undefined
  dy = undefined
  dz = undefined
  if arguments.length is 4
    dx = arguments[0] - arguments[2]
    dy = arguments[1] - arguments[3]
    return Math.sqrt(dx * dx + dy * dy)
  if arguments.length is 6
    dx = arguments[0] - arguments[3]
    dy = arguments[1] - arguments[4]
    dz = arguments[2] - arguments[5]
    Math.sqrt dx * dx + dy * dy + dz * dz


###
Returns Euler's number e (2.71828...) raised to the power of the
value parameter.

@param {int|float} value   int or float: the exponent to raise e to

@returns {float}
###
exp = Math.exp

###
Calculates the closest int value that is less than or equal to the
value of the parameter.
Note that casting to an int will truncate toward zero.  floor() will truncate toward negative infinite. This will give you different values if bar were negative.

@param {int|float} value        the value to floor

@returns {int|float}

@see ceil
@see round
@see int
###
floor = Math.floor

###
Casting to an int. Will truncate toward zero.  (floor() will truncate toward negative infinite). This will give you different values if bar were negative.

@param {int|float} value        the value to cast to integer

@returns {int|float}

@see ceil
@see round
###
int = parseInt

###
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
###
lerp = (value1, value2, amt) ->
  ((value2 - value1) * amt) + value1


###
Calculates the natural logarithm (the base-e logarithm) of a number.
This function expects the values greater than 0.0.

@param {int|float} value        int or float: number must be greater then 0.0

@returns {float}
###
log = Math.log

###
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
###
mag = (a, b, c) ->
  return Math.sqrt(a * a + b * b + c * c)  if c
  Math.sqrt a * a + b * b


###
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
###
map = (value, istart, istop, ostart, ostop) ->
  ostart + (ostop - ostart) * ((value - istart) / (istop - istart))


###
Determines the largest value in a sequence of numbers.

@param {int|float} value1         int or float
@param {int|float} value2         int or float
@param {int|float} value3         int or float
@param {int|float} array          int or float array

@returns {int|float}

@see min
###
max = ->
  return (
    if arguments[0] < arguments[1] then arguments[1] else arguments[0]
  ) if arguments.length is 2
# if single argument, array is used
  numbers = (if arguments.length is 1 then arguments[0] else arguments)
  throw new Error("Non-empty array is expected") unless(
    "length" of numbers and numbers.length
  )
  max = numbers[0]
  count = numbers.length
  i = 1

  while i < count
    max = numbers[i]  if max < numbers[i]
    ++i
  max


###
Determines the smallest value in a sequence of numbers.

@param {int|float} value1         int or float
@param {int|float} value2         int or float
@param {int|float} value3         int or float
@param {int|float} array          int or float array

@returns {int|float}

@see max
###
min = ->
  return (
    if arguments[0] < arguments[1] then arguments[0] else arguments[1]
  )  if arguments.length is 2
# if single argument, array is used
  numbers = (if arguments.length is 1 then arguments[0] else arguments)
  throw new Error("Non-empty array is expected") unless(
    "length" of numbers and numbers.length
  )
  min = numbers[0]
  count = numbers.length
  i = 1

  while i < count
    min = numbers[i]  if min > numbers[i]
    ++i
  min


###
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
###
norm = (aNumber, low, high) ->
  (aNumber - low) / (high - low)


###
Facilitates exponential expressions. The pow() function is an efficient way of
multiplying numbers by themselves (or their reciprocal) in large quantities.
For example, pow(3, 5) is equivalent to the expression 3*3*3*3*3 and pow(3, -5)
is equivalent to 1 / 3*3*3*3*3.

@param {int|float} num        base of the exponential expression
@param {int|float} exponent   power of which to raise the base

@returns {float}

@see sqrt
###
pow = Math.pow

###
Calculates the integer closest to the value parameter.
For example, round(9.2) returns the value 9.

@param {float} value        number to round

@returns {int}

@see floor
@see ceil
###
round = Math.round

###
Squares a number (multiplies a number by itself).
The result is always a positive number,
as multiplying two negative numbers always yields a
positive result. For example, -1 * -1 = 1.

@param {float} value        int or float

@returns {float}

@see sqrt
###
sq = (aNumber) ->
  aNumber * aNumber


###
Calculates the square root of a number.
The square root of a number is always positive,
even though there may be a valid negative root.
The square root s of number a is such
that s*s = a. It is the opposite of squaring.

@param {float} value        int or float, non negative

@returns {float}

@see pow
@see sq
###
sqrt = Math.sqrt

# Trigonometry
###
The inverse of cos(), returns the arc cosine of a value.
This function expects the values in the range of -1 to 1
and values are returned in the range 0 to PI (3.1415927).

@param {float} value        the value whose arc cosine is to be returned

@returns {float}

@see cos
@see asin
@see atan
###
acos = Math.acos

###
The inverse of sin(), returns the arc sine of a value.
This function expects the values in the range of -1 to 1
and values are returned in the range -PI/2 to PI/2.

@param {float} value        the value whose arc sine is to be returned

@returns {float}

@see sin
@see acos
@see atan
###
asin = Math.asin

###
The inverse of tan(), returns the arc tangent of a value.
This function expects the values in the range of -Infinity
to Infinity (exclusive) and values are returned in the range -PI/2 to PI/2 .

@param {float} value        -Infinity to Infinity (exclusive)

@returns {float}

@see tan
@see asin
@see acos
###
atan = Math.atan

###
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
###
atan2 = Math.atan2

###
Calculates the cosine of an angle. This function expects the values
of the angle parameter to be provided in radians (values from 0 to PI*2).
Values are returned in the range -1 to 1.

@param {float} value        an angle in radians

@returns {float}

@see tan
@see sin
###
cos = Math.cos

###
Converts a radian measurement to its corresponding value in degrees.
Radians and degrees are two ways of measuring the same thing.
There are 360 degrees in a circle and 2*PI radians in a circle.
For example, 90 degrees = PI/2 = 1.5707964. All trigonometric methods
in Processing require their parameters to be specified in radians.

@param {int|float} value        an angle in radians

@returns {float}

@see radians
###
degrees = (aAngle) ->
  (aAngle * 180) / Math.PI


###
Converts a degree measurement to its corresponding value in radians. Radians and degrees are two ways of
measuring the same thing. There are 360 degrees in a circle and 2*PI radians in a circle. For example,
90 degrees = PI/2 = 1.5707964. All trigonometric methods in Processing require their parameters to be specified in radians.

@param {int|float} value        an angle in radians

@returns {float}

@see degrees
###
radians = (aAngle) ->
  (aAngle / 180) * Math.PI


###
Calculates the sine of an angle. This function expects the values of the angle parameter to be provided in
radians (values from 0 to 6.28). Values are returned in the range -1 to 1.

@param {float} value        an angle in radians

@returns {float}

@see cos
@see radians
###
sin = Math.sin

###
Calculates the ratio of the sine and cosine of an angle. This function expects the values of the angle
parameter to be provided in radians (values from 0 to PI*2). Values are returned in the range infinity to -infinity.

@param {float} value        an angle in radians

@returns {float}

@see cos
@see sin
@see radians
###
tan = Math.tan
currentRandom = Math.random

###
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
###
random = ->
  return currentRandom()  if !arguments.length
  return currentRandom() * arguments[0]  if arguments.length is 1
  aMin = arguments[0]
  aMax = arguments[1]
  currentRandom() * (aMax - aMin) + aMin


# Pseudo-random generator
class Marsaglia
  z:0
  w:0

  constructor:(i1, i2) ->
    # from http://www.math.uni-bielefeld.de/~sillke/ALGORITHMS/random/marsaglia-c
    z = i1 or 362436069
    w = i2 or 521288629

  createRandomized: ->
    now = new Date()
    new Marsaglia((now / 60000) & 0xFFFFFFFF, now & 0xFFFFFFFF)

  nextInt: ->
    z = (36969 * (z & 65535) + (z >>> 16)) & 0xFFFFFFFF
    w = (18000 * (w & 65535) + (w >>> 16)) & 0xFFFFFFFF
    (((z & 0xFFFF) << 16) | (w & 0xFFFF)) & 0xFFFFFFFF

  nextDouble: ->
    i = @nextInt() / 4294967296
    (if i < 0 then 1 + i else i)



###
Sets the seed value for random(). By default, random() produces different results each time the
program is run. Set the value parameter to a constant to return the same pseudo-random numbers
each time the software is run.

@param {int|float} seed         int

@see random
@see noise
@see noiseSeed
###
randomSeed = (seed) ->
  currentRandom = (new Marsaglia(seed)).nextDouble


# Random
# We have two random()'s in the code... what does this do ? and which one is current ?
Random = (seed) ->
  haveNextNextGaussian = false
  nextNextGaussian = undefined
  random = undefined
  @nextGaussian = ->
    if haveNextNextGaussian
      haveNextNextGaussian = false
      return nextNextGaussian
    v1 = undefined
    v2 = undefined
    s = undefined
    loop
      v1 = 2 * random() - 1 # between -1.0 and 1.0
      v2 = 2 * random() - 1 # between -1.0 and 1.0
      s = v1 * v1 + v2 * v2
      break unless s >= 1 or s is 0
    multiplier = Math.sqrt(-2 * Math.log(s) / s)
    nextNextGaussian = v2 * multiplier
    haveNextNextGaussian = true
    v1 * multiplier


# by default use standard random, otherwise seeded
  random = (if (seed is undefined) then Math.random else (new Marsaglia(seed)).nextDouble)


# Noise functions and helpers
# http://www.noisemachine.com/talk1/17b.html
# http://mrl.nyu.edu/~perlin/noise/
# generate permutation

class PerlinNoise

  seed:0
  perm: null

  constructor:(@seed) ->
    rnd = (if @seed isnt undefined then new Marsaglia(@seed) else Marsaglia.createRandomized())
    i = undefined
    j = undefined
    @perm = new Uint8Array(512)
    i = 0
    while i < 256
      @perm[i] = i
      ++i
    i = 0
    while i < 256
      t = @perm[j = rnd.nextInt() & 0xFF]
      @perm[j] = @perm[i]
      @perm[i] = t
      ++i
    i = 0
    while i < 256
      @perm[i + 256] = @perm[i]
      ++i


# copy to avoid taking mod in @perm[0];
  grad3d: (i, x, y, z) ->
    h = i & 15 # convert into 12 gradient directions
    u = (if h < 8 then x else y)
    v = (if h < 4 then y else (if h is 12 or h is 14 then x else z))
    ((if (h & 1) is 0 then u else -u)) + ((if (h & 2) is 0 then v else -v))
  grad2d: (i, x, y) ->
    v = (if (i & 1) is 0 then x else y)
    (if (i & 2) is 0 then -v else v)
  grad1d: (i, x) ->
    (if (i & 1) is 0 then -x else x)

# there is a lerp defined already, with same
# behaviour, but I guess it makes sense to have
# one here to make things self-contained.
  lerp: (t, a, b) ->
    a + t * (b - a)

  noise3d: (x, y, z) ->
    X = Math.floor(x) & 255
    Y = Math.floor(y) & 255
    Z = Math.floor(z) & 255
    x -= Math.floor(x)
    y -= Math.floor(y)
    z -= Math.floor(z)
    fx = (3 - 2 * x) * x * x
    fy = (3 - 2 * y) * y * y
    fz = (3 - 2 * z) * z * z
    p0 = @perm[X] + Y
    p00 = @perm[p0] + Z
    p01 = @perm[p0 + 1] + Z
    p1 = @perm[X + 1] + Y
    p10 = @perm[p1] + Z
    p11 = @perm[p1 + 1] + Z
    @lerp fz, @lerp(fy, @lerp(fx, @grad3d(@perm[p00], x, y, z), @grad3d(@perm[p10], x - 1, y, z)), @lerp(fx, @grad3d(@perm[p01], x, y - 1, z), @grad3d(@perm[p11], x - 1, y - 1, z))), @lerp(fy, @lerp(fx, @grad3d(@perm[p00 + 1], x, y, z - 1), @grad3d(@perm[p10 + 1], x - 1, y, z - 1)), @lerp(fx, @grad3d(@perm[p01 + 1], x, y - 1, z - 1), @grad3d(@perm[p11 + 1], x - 1, y - 1, z - 1)))

  noise2d: (x, y) ->
    X = Math.floor(x) & 255
    Y = Math.floor(y) & 255
    x -= Math.floor(x)
    y -= Math.floor(y)
    fx = (3 - 2 * x) * x * x
    fy = (3 - 2 * y) * y * y
    p0 = @perm[X] + Y
    p1 = @perm[X + 1] + Y
    @lerp fy, @lerp(fx, @grad2d(@perm[p0], x, y), @grad2d(@perm[p1], x - 1, y)), @lerp(fx, @grad2d(@perm[p0 + 1], x, y - 1), @grad2d(@perm[p1 + 1], x - 1, y - 1))

  noise1d: (x) ->
    X = Math.floor(x) & 255
    x -= Math.floor(x)
    fx = (3 - 2 * x) * x * x
    @lerp fx, @grad1d(@perm[X], x), @grad1d(@perm[X + 1], x - 1)


# processing defaults
noiseProfile = {
  generator: undefined
  octaves: 4
  fallout: 0.5
  seed: undefined
}


###
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
###
noise = (x, y, z) ->

# caching
  noiseProfile.generator = new PerlinNoise(noiseProfile.seed)  if noiseProfile.generator is undefined
  generator = noiseProfile.generator
  effect = 1
  k = 1
  sum = 0
  i = 0

  while i < noiseProfile.octaves
    effect *= noiseProfile.fallout
    switch arguments.length
      when 1
        sum += effect * (1 + generator.noise1d(k * x)) / 2
      when 2
        sum += effect * (1 + generator.noise2d(k * x, k * y)) / 2
      when 3
        sum += effect * (1 + generator.noise3d(k * x, k * y, k * z)) / 2
    k *= 2
    ++i
  sum


###
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
###
noiseDetail = (octaves, fallout) ->
  noiseProfile.octaves = octaves
  noiseProfile.fallout = fallout  if fallout isnt undefined


###
Sets the seed value for noise(). By default, noise() produces different results each
time the program is run. Set the value parameter to a constant to return the same
pseudo-random numbers each time the software is run.

@param {int} seed         int

@returns {float}

@see random
@see radomSeed
@see noise
@see noiseDetail
###
noiseSeed = (seed) ->
  noiseProfile.seed = seed
  noiseProfile.generator = undefined

module.exports = MathFunctions
