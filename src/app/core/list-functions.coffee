#//////////////////////////////////////////////////////////////////////////
# List Functions
#//////////////////////////////////////////////////////////////////////////

class ListFunctions

  @getElement = getElement

  addToScope: (scope) ->
    scope.addFunction('get', (list, idx) => getElement(list, idx))
    scope.addFunction('len', (list) => list.length)


getElement = (list, idx) -> list[idx]

module.exports = ListFunctions
