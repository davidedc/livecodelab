
class OtherCommands

  constructor: () ->

  addToScope: (scope) ->
    scope.add('noOperation', () => @noOperation())

  noOperation: () ->

module.exports = OtherCommands

