#jslint browser: true 
#global 

createMatrixCommands = (liveCodeLabCore_THREE, liveCodeLabCoreInstance) ->
  "use strict"
  MatrixCommands = {}
  parentObject = 0
  rootObject = 0
  currentObject = undefined
  matrixStack = []
  worldMatrix = new liveCodeLabCore_THREE.Matrix4()

  MatrixCommands.getWorldMatrix = ->
    worldMatrix

  MatrixCommands.resetMatrixStack = ->
    matrixStack = []
    worldMatrix.identity()

  window.pushMatrix = MatrixCommands.pushMatrix = ->
    matrixStack.push worldMatrix
    worldMatrix = (new liveCodeLabCore_THREE.Matrix4()).copy(worldMatrix)

  window.popMatrix = MatrixCommands.popMatrix = ->
    if matrixStack.length isnt 0
      worldMatrix = matrixStack.pop()
    else
      worldMatrix.identity()

  window.resetMatrix = MatrixCommands.resetMatrix = ->
    worldMatrix.identity()

  window.move = MatrixCommands.move = (a, b, c = 0) ->
    if typeof a isnt "number"
      a = Math.sin(liveCodeLabCoreInstance.TimeKeeper.getTime() / 500)
      b = Math.cos(liveCodeLabCoreInstance.TimeKeeper.getTime() / 500)
      c = a
    else if typeof b isnt "number"
      b = a
      c = a
    worldMatrix.translate new liveCodeLabCore_THREE.Vector3(a, b, c)

  window.rotate = MatrixCommands.rotate = (a, b, c = 0) ->
    if typeof a isnt "number"
      a = liveCodeLabCoreInstance.TimeKeeper.getTime() / 1000
      b = a
      c = a
    else if typeof b isnt "number"
      b = a
      c = a
    worldMatrix.rotateX(a).rotateY(b).rotateZ c

  window.scale = MatrixCommands.scale = (a, b, c = 1) ->
    if typeof a isnt "number"
      a = 1 + Math.sin(liveCodeLabCoreInstance.TimeKeeper.getTime() / 500) / 4
      b = a
      c = a
    else if typeof b isnt "number"
      b = a
      c = a
    
    # odd things happen setting scale to zero
    a = 0.000000001  if a > -0.000000001 and a < 0.000000001
    b = 0.000000001  if b > -0.000000001 and b < 0.000000001
    c = 0.000000001  if c > -0.000000001 and c < 0.000000001
    worldMatrix.scale new liveCodeLabCore_THREE.Vector3(a, b, c)

  MatrixCommands