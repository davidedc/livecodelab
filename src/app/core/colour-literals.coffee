###
## Defines several color constant literals, e.g. "red" being 0xffff0000,
## modified from processing.js with added the missing ones from the
## CSS standard, which includes the spelling "grey" on top of "gray"
## and also "angleColor", used to dress objects with the normal material.
###

colorvalues = require './colour-values'

class ColourLiterals

  colourNames: []

  constructor: ->
    
    @colourNamesValues = colorvalues

    for colorName, colorValue of @colourNamesValues
      @colourNames.push "#{colorName}"

  addToScope: (scope) ->

    for colorName, colorValue of @colourNamesValues
      val = parseInt(colorValue)
      if isNaN(val)
        # this is the case of special colors that have string values
        scope.addVariable("#{colorName}", colorValue)
      else
        scope.addVariable("#{colorName}", val)

  getColour: (name) ->
    colorValue = @colourNamesValues[name]
    val = parseInt(colorValue)
    if isNaN(val)
      # this is the case of special colors that have string values
      colorValue
    else
      val

module.exports = ColourLiterals

