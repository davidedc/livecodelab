###
## Global Scope
## ============
##
## This object will contain all the global functions that can be called
## from within Live Code Lab
###

define () ->

  class GlobalScope

    getScope: () ->
      {
        box: window.box
      }

  new GlobalScope

