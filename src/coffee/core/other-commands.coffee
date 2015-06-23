
define () ->

  class OtherCommands

    constructor: () ->

    addToScope: (scope) ->
      scope.add('noOperation', () => @noOperation())

    noOperation: () ->

  OtherCommands

