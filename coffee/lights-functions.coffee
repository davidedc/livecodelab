#jslint browser: true 

createLightSystem = (liveCodeLabCore_GraphicsCommands, liveCodeLabCoreInstance) ->
  "use strict"
  LightSystem = {}

  # defining a couple of shorthands
  objectPools = liveCodeLabCore_GraphicsCommands.objectPools
  primitiveTypes = liveCodeLabCore_GraphicsCommands.primitiveTypes
  objectsUsedInFrameCounts = liveCodeLabCore_GraphicsCommands.objectsUsedInFrameCounts

  objectPools[primitiveTypes.ambientLight] = []
  objectsUsedInFrameCounts[primitiveTypes.ambientLight] = 0
  LightSystem.lightsAreOn = false

  window.lights = LightSystem.lights = ->
    LightSystem.lightsAreOn = true

  window.noLights = LightSystem.noLights = ->
    LightSystem.lightsAreOn = false
  
  # ambientLight needs to be global
  window.ambientLight = LightSystem.ambientLight = (r, g, b, a) ->
    colorToBeUsed = undefined
    newLightCreated = false
    ambientLightsPool = undefined
    pooledAmbientLight = undefined
    if r is `undefined`
      
      # empty arguments gives some sort
      # of grey ambient light.
      # black is too stark and white
      # doesn't show the effect with the
      # default white fill
      colorToBeUsed = liveCodeLabCoreInstance.ColourFunctions.color(255)
    else
      colorToBeUsed = liveCodeLabCoreInstance.ColourFunctions.color(r, g, b, a)
    LightSystem.lightsAreOn = true
    
    # used by graphic-primitives
    liveCodeLabCore_GraphicsCommands.defaultNormalFill = false
    
    # used by graphic-primitives
    liveCodeLabCore_GraphicsCommands.defaultNormalStroke = false
    ambientLightsPool = objectPools[primitiveTypes.ambientLight]
    pooledAmbientLight = ambientLightsPool[objectsUsedInFrameCounts[primitiveTypes.ambientLight]]
    if pooledAmbientLight is `undefined`
      
      # So here is the thing, the command is currently called AmbientLight but
      # in reality we are creating a PointLight in a specific position.
      # AmbientLight just fills the whole scene,
      # so the faces of the cube would all be of the same
      # exact color. Note that in Three.js versions before r50 the AmbientLight
      # would work like a PointLight does now.
      pooledAmbientLight = new liveCodeLabCoreInstance.THREE.PointLight(colorToBeUsed)
      pooledAmbientLight.position.set 10, 50, 130
      newLightCreated = true
      ambientLightsPool.push pooledAmbientLight
      pooledAmbientLight.detailLevel = 0
      pooledAmbientLight.primitiveType = primitiveTypes.ambientLight
    else
      pooledAmbientLight.color.setHex colorToBeUsed
    objectsUsedInFrameCounts[primitiveTypes.ambientLight] += 1
    
    # NOTE that an ambient light is not actually added as an object.
    # i.e. if you navigate the objects you don't find it.
    liveCodeLabCoreInstance.ThreeJsSystem.scene.add pooledAmbientLight  if newLightCreated

  LightSystem