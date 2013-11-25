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
      # These need to be global so it can be run by the draw function
      window.pushMatrix  = () => @pushMatrix()
      window.popMatrix   = () => @popMatrix()
      window.resetMatrix = () => @resetMatrix()
      window.move   = (a,b,c) => @move(a,b,c)
      window.rotate = (a,b,c,d) => @rotate(a,b,c,d)
      window.scale  = (a,b,c) => @scale(a,b,c)

    getWorldMatrix: ->
      @worldMatrix

    resetMatrixStack: ->
      @matrixStack = []
      @worldMatrix.identity()

    pushMatrix: ->
      @matrixStack.push @worldMatrix
      @worldMatrix = (new @liveCodeLabCore_three.Matrix4()).copy(@worldMatrix)

    popMatrix: ->
      if @matrixStack.length
        @worldMatrix = @matrixStack.pop()
      else
        @worldMatrix.identity()

    resetMatrix: ->
      @worldMatrix.identity()

    move: (a, b, c = 0) ->
      if typeof a isnt "number"
        a = Math.sin(@liveCodeLabCoreInstance.timeKeeper.getTime() / 500)
        b = Math.cos(@liveCodeLabCoreInstance.timeKeeper.getTime() / 500)
        c = a
      else if typeof b isnt "number"
        b = a
        c = a
      @worldMatrix.translate new @liveCodeLabCore_three.Vector3(a, b, c)

    rotate: (a, b, c = 0, d = null) ->
      appendedFunction = undefined

      if typeof a isnt "number"
        if isFunction a then appendedFunction = a
        a = @liveCodeLabCoreInstance.timeKeeper.getTime() / 1000
        b = a
        c = a
      else if typeof b isnt "number"
        if isFunction b then appendedFunction = b
        b = a
        c = a
      else if typeof c isnt "number"
        if isFunction c then appendedFunction = c
        c = 0
      else if isFunction d
        appendedFunction = d

      @pushMatrix() if appendedFunction? 
      @worldMatrix.rotateX(a).rotateY(b).rotateZ c
      if appendedFunction?
        appendedFunction()
        @popMatrix()

    scale: (a, b, c = 1) ->
      if typeof a isnt "number"
        a = 1 + Math.sin(@liveCodeLabCoreInstance.timeKeeper.getTime() / 500) / 4
        b = a
        c = a
      else if typeof b isnt "number"
        b = a
        c = a
      
      # odd things happen setting scale to zero
      a = 0.000000001  if a > -0.000000001 and a < 0.000000001
      b = 0.000000001  if b > -0.000000001 and b < 0.000000001
      c = 0.000000001  if c > -0.000000001 and c < 0.000000001
      @worldMatrix.scale new @liveCodeLabCore_three.Vector3(a, b, c)

  MatrixCommands

