###
## Abstract the html canvas scaling and sizing away
###

_ = require('underscore')

# This resolution is easily managed by modern graphic cards (the PS Vita can).
IDEAL_RESOLUTION = {width: 880, height: 720}
MAX_CANVAS_SCALING = 2
SCALE_DELTA = 0.1
RESIZE_TRIGGER_DEBOUNCING = 250

class Canvas

  resizeCallbacks: []

  constructor: (@canvasElement) ->
    @resize(@getBestBufferSize())

    window.addEventListener(
      "resize",
      _.debounce(
        (
          () =>
             bestBufferSize = @getBestBufferSize()
             @resize(bestBufferSize)
             _.each(@resizeCallbacks, (cb) -> cb(bestBufferSize))
        ),
        RESIZE_TRIGGER_DEBOUNCING
      ),
      false
    )

  getDOMElement: -> @canvasElement
  getWidth: -> @canvasElement.width
  getHeight: -> @canvasElement.height
  getAspectRatio: -> @canvasElement.width / @canvasElement.height

  onResize: (cb) ->
    @resizeCallbacks.push(cb)

  maxBufferSize: () ->
    multiplier = window.devicePixelRatio
    return {
      width: Math.floor(window.innerWidth * multiplier),
      height: Math.floor(window.innerHeight * multiplier)
    }

  calculateMaxUnscaledBuffer: (a, b) ->
    {
      width: Math.min(a.width, b.width),
      height: Math.min(a.height, b.height)
    }

  # To improve the performance of LiveCodeLab, the canvas resolution can
  # be scaled down. There is a maximum amount of scaling allowed so that
  # the graphics won't get too blurry, and the scaling factor adaptive,
  # transitioning between no scaling and the maximum.

  # This function calculates the best size for the current canvas buffer,
  # based on the current resolution, the devide pixel ratio and the
  # maximum amount of scaling allowed.
  getBestBufferSize: () ->

    # Displays with the ideal resolution or less should not be scaled.
    # So below the ideal resolution we show graphics on the canvas at 1 to 1.
    # At the same time, we don't want to use buffers that are bigger
    # than necessary, so we limit the buffer to the maximum we need.
    maxUnscaledBuffer = @calculateMaxUnscaledBuffer(
      IDEAL_RESOLUTION,
      @maxBufferSize()
    )

    # This is the minimum size buffer based on how much we're willing to scale.
    # Basically this is the buffer that would give us the maximum blurryness
    # that we can accept.
    # If this buffer is bigger than the ideal resolution maximally scaled then
    # this is what will be used.
    scaledCanvasWidth = Math.floor(window.innerWidth / MAX_CANVAS_SCALING)
    scaledCanvasHeight = Math.floor(window.innerHeight / MAX_CANVAS_SCALING)

    # Starting with maximum scaling, check if that buffer resolution is within
    # the acceptable limits. If it is then decrease the scaling factor and carry
    # on checking. If it's not then exit the loop and use the last acceptable
    # buffer size.
    scaling = MAX_CANVAS_SCALING
    while (scaling > 1)

      sW = Math.floor(window.innerWidth / (scaling - SCALE_DELTA))
      sH = Math.floor(window.innerHeight / (scaling - SCALE_DELTA))

      if (sW > maxUnscaledBuffer.width || sH > maxUnscaledBuffer.height)
        break

      scaledCanvasWidth = sW
      scaledCanvasHeight = sH
      scaling -= SCALE_DELTA;

    return {
      width: scaledCanvasWidth,
      height: scaledCanvasHeight
      scaling: scaling
    }

  resize: ({width, height, scaling}) ->

    @canvasElement.width = window.innerWidth / scaling
    @canvasElement.height = window.innerHeight / scaling

    @canvasElement.style.width = width + "px"
    @canvasElement.style.height = height + "px"

    scaleString = scaling + ", " + scaling

    $(@canvasElement).css("-ms-transform-origin", "0% 0%")
            .css("-webkit-transform-origin", "0% 0%")
            .css("-moz-transform-origin", "0% 0%")
            .css("-o-transform-origin", "0% 0%")
            .css("transform-origin", "0% 0%")
            .css("-ms-transform", "scale(" + scaleString + ")")
            .css("-webkit-transform", "scale3d(" + scaleString + ", 1)")
            .css("-moz-transform", "scale(" + scaleString + ")")
            .css("-o-transform", "scale(" + scaleString + ")")
            .css "transform", "scale(" + scaleString + ")"

module.exports = Canvas
