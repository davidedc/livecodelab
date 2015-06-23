###
## Implementation of all lights-related commands.
###

class LightsCommands

  lightsAreOn: false
  constructor: (
    @graphicsCommands,
    @three,
    @threeJsSystem,
    @colourFunctions
  ) ->

    # defining a couple of shorthands
    @objectPools = @graphicsCommands.objectPools
    @primitiveTypes = @graphicsCommands.primitiveTypes
    @objectsUsedInFrameCounts = @graphicsCommands.objectsUsedInFrameCounts

    @objectPools[@primitiveTypes.ambientLight] = []
    @objectsUsedInFrameCounts[@primitiveTypes.ambientLight] = 0
    
  addToScope: (scope) ->

    scope.add('lights', () => @lights())
    scope.add('noLights', () => @noLights())
    scope.add('ambientLight', (a,b,c,d) => @ambientLight(a,b,c,d))

  lights: ->
    @lightsAreOn = true

  noLights: ->
    @lightsAreOn = false
  
  # ambientLight needs to be global
  ambientLight: (r, g, b, a) ->
    newLightCreated = false
    if not r?
      
      # empty arguments gives some sort
      # of grey ambient light.
      # black is too stark and white
      # doesn't show the effect with the
      # default white fill
      colorToBeUsed = @colourFunctions.color(255)
    else
      colorToBeUsed = @colourFunctions.color(r, g, b, a)
    @lightsAreOn = true
    
    # used by graphic-primitives
    @graphicsCommands.defaultNormalFill = false
    
    # used by graphic-primitives
    @graphicsCommands.defaultNormalStroke = false
    ambientLightsPool = @objectPools[@primitiveTypes.ambientLight]
    objsUsed = @objectsUsedInFrameCounts[@primitiveTypes.ambientLight]
    pooledAmbientLight = ambientLightsPool[objsUsed]

    if not pooledAmbientLight?
      # So here is the thing, the command is currently called AmbientLight but
      # in reality we are creating a PointLight in a specific position.
      # AmbientLight just fills the whole scene,
      # so the faces of the cube would all be of the same exact color.
      # Note that in Three.js versions before r50 the AmbientLight
      # would work like a PointLight does now.
      pooledAmbientLight = new @three.PointLight(colorToBeUsed)
      pooledAmbientLight.position.set 10, 50, 130
      newLightCreated = true
      ambientLightsPool.push pooledAmbientLight
      pooledAmbientLight.detailLevel = 0
      pooledAmbientLight.primitiveType = @primitiveTypes.ambientLight
    else
      pooledAmbientLight.color.setHex colorToBeUsed

    @objectsUsedInFrameCounts[@primitiveTypes.ambientLight] += 1
    
    # NOTE that an ambient light is not actually added as an object.
    # i.e. if you navigate the objects you don't find it.
    @threeJsSystem.scene.add pooledAmbientLight  if newLightCreated

module.exports = LightsCommands

