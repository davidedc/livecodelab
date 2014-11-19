

define () ->

  class OtherCommands
    
    constructor: (@liveCodeLabCore_three, @liveCodeLabCoreInstance, @colourLiterals) ->
      

    addToScope: (scope) ->

      scope.add('noOperation',       () => @noOperation())

    noOperation: () ->


  OtherCommands

