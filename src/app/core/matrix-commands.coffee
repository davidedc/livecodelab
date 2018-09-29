###
## Takes care of all matrix-related commands.
###

_ = require 'underscore'

class MatrixCommands

  matrixStack: []

  constructor: (@timeKeeper) ->
    @worldMatrix = new THREE.Matrix4()

  addToScope: (scope) ->

    scope.addFunction('pushMatrix',           () => @pushMatrix())
    scope.addFunction('discardPushedMatrix',  () => @discardPushedMatrix())
    scope.addFunction('popMatrix',            () => @popMatrix())
    scope.addFunction('resetMatrix',          () => @resetMatrix())
    scope.addInlinable('move',        (args...) => @move.apply(this,args))
    scope.addInlinable('rotate',      (args...) => @rotate.apply(this,args))
    scope.addInlinable('scale',       (args...) => @scale.apply(this,args))
    scope.addInlinable('bigger',        (block) => @scale(1.2, block))
    scope.addInlinable('smaller',       (block) => @scale(0.8, block))

  getWorldMatrix: ->
    @worldMatrix

  resetMatrixStack: ->
    @matrixStack = []
    @worldMatrix.identity()

  pushMatrix: ->
    @matrixStack.push @worldMatrix
    @worldMatrix = (new THREE.Matrix4()).copy(@worldMatrix)

  # in the following case:
  #  flashing = <if random < 0.5 then scale 0>
  #  flashing
  #  ball
  # it happens that because flashing is invoked
  # without arguments, then scale is invoked with 0
  # and a function that returns null
  # in which case it means that scale has done a
  # push matrix, it invokes the chained function
  # and finds out that the transformation actually
  # won't be popped. So we need a way to "undo"
  # the push. This is like a pop but we
  # discard the popped value.
  discardPushedMatrix: ->
    if @matrixStack.length
      @matrixStack.pop()

  popMatrix: ->
    if @matrixStack.length
      @worldMatrix = @matrixStack.pop()
    else
      @worldMatrix.identity()

  resetMatrix: ->
    @worldMatrix.identity()

  move: (a, b, c = 0, d = null) ->
    arg_a = a
    arg_b = b
    arg_c = c
    arg_d = d

    appendedFunctionsStartIndex = undefined

    if typeof arg_a isnt "number"
      if _.isFunction arg_a then appendedFunctionsStartIndex = 0
      arg_a = Math.sin(@timeKeeper.beat() / 2 * Math.PI)
      arg_b = Math.cos(@timeKeeper.beat() / 2 * Math.PI)
      arg_c = arg_a
    else if typeof arg_b isnt "number"
      if _.isFunction arg_b then appendedFunctionsStartIndex = 1
      arg_b = arg_a
      arg_c = arg_a
    else if typeof arg_c isnt "number"
      if _.isFunction arg_c then appendedFunctionsStartIndex = 2
      arg_c = 0
    else if _.isFunction arg_d
      appendedFunctionsStartIndex = 3

    @pushMatrix() if appendedFunctionsStartIndex?
    @worldMatrix.multiply(
      new THREE.Matrix4().makeTranslation(arg_a, arg_b, arg_c)
    )
    if appendedFunctionsStartIndex?
      while _.isFunction arguments[appendedFunctionsStartIndex]
        result = arguments[appendedFunctionsStartIndex]()
        # we find out that the function is actually
        # a fake so we have to undo the push and leave
        if result == null
          discardPushedMatrix()
          return
        appendedFunctionsStartIndex++
      @popMatrix()

  rotate: (a, b, c = 0, d = null) ->
    arg_a = a
    arg_b = b
    arg_c = c
    arg_d = d

    appendedFunctionsStartIndex = undefined

    if typeof arg_a isnt "number"
      if _.isFunction arg_a then appendedFunctionsStartIndex = 0
      arg_a = @timeKeeper.beat() / 4 * Math.PI
      arg_b = arg_a
      arg_c = 0
    else if typeof arg_b isnt "number"
      if _.isFunction arg_b then appendedFunctionsStartIndex = 1
      arg_b = arg_a
      arg_c = arg_a
    else if typeof arg_c isnt "number"
      if _.isFunction arg_c then appendedFunctionsStartIndex = 2
      arg_c = 0
    else if _.isFunction arg_d
      appendedFunctionsStartIndex = 3

    @pushMatrix() if appendedFunctionsStartIndex?
    @worldMatrix.multiply(
      new THREE.Matrix4().makeRotationFromEuler(
        new THREE.Euler(arg_a,arg_b,arg_c,'XYZ')
      )
    )
    if appendedFunctionsStartIndex?
      while _.isFunction arguments[appendedFunctionsStartIndex]
        result = arguments[appendedFunctionsStartIndex]()
        # we find out that the function is actually
        # a fake so we have to undo the push and leave
        if result == null
          discardPushedMatrix()
          return
        appendedFunctionsStartIndex++
      @popMatrix()

  scale: (a, b, c = 1, d = null) ->
    arg_a = a
    arg_b = b
    arg_c = c
    arg_d = d

    appendedFunctionsStartIndex = undefined

    if typeof arg_a isnt "number"
      if _.isFunction arg_a then appendedFunctionsStartIndex = 0
      arg_a = 0.5 + @timeKeeper.pulse()
      arg_b = arg_a
      arg_c = arg_a
    else if typeof arg_b isnt "number"
      if _.isFunction arg_b then appendedFunctionsStartIndex = 1
      arg_b = arg_a
      arg_c = arg_a
    else if typeof arg_c isnt "number"
      if _.isFunction arg_c then appendedFunctionsStartIndex = 2
      arg_c = 1
    else if _.isFunction arg_d
      appendedFunctionsStartIndex = 3

    @pushMatrix() if appendedFunctionsStartIndex?

    # odd things happen setting scale to zero
    arg_a = 0.000000001  if arg_a > -0.000000001 and arg_a < 0.000000001
    arg_b = 0.000000001  if arg_b > -0.000000001 and arg_b < 0.000000001
    arg_c = 0.000000001  if arg_c > -0.000000001 and arg_c < 0.000000001

    @worldMatrix.multiply(new THREE.Matrix4().makeScale(arg_a, arg_b, arg_c))
    if appendedFunctionsStartIndex?
      while _.isFunction arguments[appendedFunctionsStartIndex]
        result = arguments[appendedFunctionsStartIndex]()
        # we find out that the function is actually
        # a fake so we have to undo the push and leave
        if result == null
          discardPushedMatrix()
          return
        appendedFunctionsStartIndex++
      @popMatrix()

module.exports = MatrixCommands

