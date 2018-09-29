
class OtherCommands

  constructor: () ->

  addToScope: (scope) ->
    scope.addFunction('noOperation', () => @noOperation())

  noOperation: () ->

module.exports = OtherCommands

