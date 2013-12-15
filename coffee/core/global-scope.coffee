###
## Global Scope
## ============
##
## This object will contain all the global functions that can be called
## from within Live Code Lab
###

define () ->

  class GlobalScope

    constructor: () ->
      @scope = {}

    add: (name, value) ->
      @scope[name] = value

    getScope: () -> @scope

