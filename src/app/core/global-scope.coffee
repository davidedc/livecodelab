###
## Global Scope
## ============
##
## This object will contain all the global functions that can be called
## from within Live Code Lab
###

class GlobalScope

  constructor: () ->
    @scope = {}
    @functions = []
    @inlinables = []

  addVariable: (name, value) ->
    window[name] = value
    @scope[name] = value

  addFunction: (name, func) ->
    value = {
      type: 'builtin',
      func: func
    }
    window[name] = func
    @scope[name] = value
    @functions.push(name)

  addInlinable: (name, func) ->
    value = {
      type: 'builtin',
      func: func
    }
    window[name] = func
    @scope[name] = value
    @functions.push(name)
    @inlinables.push(name)

  getFunctions: () -> @functions

  getInlinables: () -> @inlinables

  getScope: () -> @scope

module.exports = GlobalScope
