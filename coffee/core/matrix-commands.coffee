###
## Takes care of all matrix-related commands.
###

isFunction = (functionToCheck) ->
  getType = {}
  functionToCheck and getType.toString.call(functionToCheck) is "[object Function]"

define () ->

  class MatrixCommands

    matrixStack: []

    constructor: (@liveCodeLabCore_three, @liveCodeLabCoreInstance) ->
      @worldMatrix = new @liveCodeLabCore_three.Matrix4()

    addToScope: (scope) ->

      scope.add('pushMatrix',  () => @pushMatrix())
      scope.add('popMatrix',   () => @popMatrix())
      scope.add('resetMatrix', () => @resetMatrix())
      scope.add('move',        (theArguments...) => @move.apply(this,theArguments))
      scope.add('rotate',      (theArguments...) => @rotate.apply(this,theArguments))
      scope.add('scale',       (theArguments...) => @scale.apply(this,theArguments))

    getWorldMatrix: ->
      @worldMatrix

    resetMatrixStack: ->
      @matrixStack = []
      @worldMatrix.identity()

    pushMatrix: ->
      if @liveCodeLabCoreInstance.animationLoop.noDrawFrame
        return

      @matrixStack.push @worldMatrix
      @worldMatrix = (new @liveCodeLabCore_three.Matrix4()).copy(@worldMatrix)

    popMatrix: ->
      if @liveCodeLabCoreInstance.animationLoop.noDrawFrame
        return

      if @matrixStack.length
        @worldMatrix = @matrixStack.pop()
      else
        @worldMatrix.identity()

    resetMatrix: ->
      if @liveCodeLabCoreInstance.animationLoop.noDrawFrame
        return

      @worldMatrix.identity()

    move: (a, b, c = 0, d = null) ->
      if @liveCodeLabCoreInstance.animationLoop.noDrawFrame
        return

      arg_a = a
      arg_b = b
      arg_c = c
      arg_d = d

      appendedFunctionsStartIndex = undefined

      if typeof arg_a isnt "number"
        if isFunction arg_a then appendedFunctionsStartIndex = 0
        arg_a = Math.sin(@liveCodeLabCoreInstance.timeKeeper.beat() / 2 * Math.PI)
        arg_b = Math.cos(@liveCodeLabCoreInstance.timeKeeper.beat() / 2 * Math.PI)
        arg_c = arg_a
      else if typeof arg_b isnt "number"
        if isFunction arg_b then appendedFunctionsStartIndex = 1
        arg_b = arg_a
        arg_c = arg_a
      else if typeof arg_c isnt "number"
        if isFunction arg_c then appendedFunctionsStartIndex = 2
        arg_c = 0
      else if isFunction arg_d
        appendedFunctionsStartIndex = 3

      @pushMatrix() if appendedFunctionsStartIndex? 
      @worldMatrix.multiply(new @liveCodeLabCore_three.Matrix4().makeTranslation(arg_a, arg_b, arg_c))
      if appendedFunctionsStartIndex?
        while isFunction arguments[appendedFunctionsStartIndex]
          arguments[appendedFunctionsStartIndex]()
          appendedFunctionsStartIndex++
        @popMatrix()

    rotate: (a, b, c = 0, d = null) ->
      if @liveCodeLabCoreInstance.animationLoop.noDrawFrame
        return

      arg_a = a
      arg_b = b
      arg_c = c
      arg_d = d

      appendedFunctionsStartIndex = undefined

      if typeof arg_a isnt "number"
        if isFunction arg_a then appendedFunctionsStartIndex = 0
        arg_a = @liveCodeLabCoreInstance.timeKeeper.beat() / 4 * Math.PI
        arg_b = arg_a
        arg_c = 0
      else if typeof arg_b isnt "number"
        if isFunction arg_b then appendedFunctionsStartIndex = 1
        arg_b = arg_a
        arg_c = arg_a
      else if typeof arg_c isnt "number"
        if isFunction arg_c then appendedFunctionsStartIndex = 2
        arg_c = 0
      else if isFunction arg_d
        appendedFunctionsStartIndex = 3

      @pushMatrix() if appendedFunctionsStartIndex?
      @worldMatrix.multiply(new @liveCodeLabCore_three.Matrix4().makeRotationFromEuler(new @liveCodeLabCore_three.Euler(arg_a,arg_b,arg_c,'XYZ')))
      if appendedFunctionsStartIndex?
        while isFunction arguments[appendedFunctionsStartIndex]
          arguments[appendedFunctionsStartIndex]()
          appendedFunctionsStartIndex++
        @popMatrix()

    scale: (a, b, c = 1, d = null) ->
      if @liveCodeLabCoreInstance.animationLoop.noDrawFrame
        return

      arg_a = a
      arg_b = b
      arg_c = c
      arg_d = d

      appendedFunctionsStartIndex = undefined

      if typeof arg_a isnt "number"
        if isFunction arg_a then appendedFunctionsStartIndex = 0
        arg_a = 0.5 + @liveCodeLabCoreInstance.timeKeeper.pulse()
        arg_b = arg_a
        arg_c = arg_a
      else if typeof arg_b isnt "number"
        if isFunction arg_b then appendedFunctionsStartIndex = 1
        arg_b = arg_a
        arg_c = arg_a
      else if typeof arg_c isnt "number"
        if isFunction arg_c then appendedFunctionsStartIndex = 2
        arg_c = 1
      else if isFunction arg_d
        appendedFunctionsStartIndex = 3
      
      @pushMatrix() if appendedFunctionsStartIndex? 

      # odd things happen setting scale to zero
      arg_a = 0.000000001  if arg_a > -0.000000001 and arg_a < 0.000000001
      arg_b = 0.000000001  if arg_b > -0.000000001 and arg_b < 0.000000001
      arg_c = 0.000000001  if arg_c > -0.000000001 and arg_c < 0.000000001

      @worldMatrix.multiply(new @liveCodeLabCore_three.Matrix4().makeScale(arg_a, arg_b, arg_c))
      if appendedFunctionsStartIndex?
        while isFunction arguments[appendedFunctionsStartIndex]
          arguments[appendedFunctionsStartIndex]()
          appendedFunctionsStartIndex++
        @popMatrix()

  MatrixCommands

