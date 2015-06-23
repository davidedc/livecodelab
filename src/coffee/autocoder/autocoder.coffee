###
## Autocoder takes care of making random variations to the code.
###

ColourLiterals = require '../core/colour-literals'

class Autocoder

  active: false
  autocoderMutateTimeout: undefined
  numberOfResults: 0
  whichOneToChange: 0
  colorsRegex: ""
  numberOfColors: 0
  mutationInterval: 1000

  constructor: (@eventRouter, @editor, @colourNames) ->
    # TODO this code is duplicated in the code-preprocessor
    @colorsRegex = ""
    @colourLiterals = new ColourLiterals
    @numberOfColors = @colourNames.length
    for key of @colourLiterals.colourNamesValues
      if @colourLiterals.colourNamesValues.hasOwnProperty key
        @colorsRegex = @colorsRegex + "|"+key
    # delete the pre-pended pipe character
    @colorsRegex = @colorsRegex.substring(1, @colorsRegex.length)
    @colorsRe = RegExp(
      "(^[\\t ]*|;| |,)([\\t ]*)("+@colorsRegex+")(?![\\w\\d])",
      'gm'
    )
    @matrixRe = RegExp(
      "(^[\\t ]*|;| |,)([\\t ]*)(scale|rotate|move)(?![\\w\\d])",
      'gm'
    )


  mutate : ->
    whichMutation = Math.floor(Math.random() * 6)
    if whichMutation is 0
      @replaceAFloat()
    else if whichMutation is 1
      @replaceAnInteger()
    else if whichMutation is 2
      @replaceABoxWithABall()
    else if whichMutation is 3
      @replaceABallWithABox()
    else if whichMutation is 4
      @replaceAColorWithAnotherColor()
    else if whichMutation is 5
      @replaceAMatrixTransformWithAnother()
    return

  replaceAMatrixTransformWithAnother : ->
    matrixTransforms = ["scale","rotate","move"]
    editorContent = @editor.getValue()

    allMatches = editorContent.match(@matrixRe)
    if allMatches is null
      numberOfResults = 0
    else
      numberOfResults = allMatches.length
    whichOneToChange = Math.floor(Math.random() * numberOfResults) + 1
    whichColorToReplaceWith = Math.floor(
      Math.random() * matrixTransforms.length
    )
    countWhichOneToSwap = 0
    editorContent = editorContent.replace(@matrixRe, (match, p1, p2) ->
      countWhichOneToSwap++
      if countWhichOneToSwap is whichOneToChange
        return p1+p2+ matrixTransforms[whichColorToReplaceWith]
      match
    )
    @editor.setValue editorContent
    return


  replaceAColorWithAnotherColor : ->
    editorContent = @editor.getValue()

    allMatches = editorContent.match(@colorsRe)
    if allMatches is null
      numberOfResults = 0
    else
      numberOfResults = allMatches.length
    whichOneToChange = Math.floor(Math.random() * numberOfResults) + 1
    whichColorToReplaceWith = Math.floor(Math.random() * @numberOfColors)
    countWhichOneToSwap = 0
    editorContent = editorContent.replace(@colorsRe, (match, p1, p2) =>
      countWhichOneToSwap++
      if countWhichOneToSwap is whichOneToChange
        return p1+p2+ @colourNames[whichColorToReplaceWith]
      match
    )
    @editor.setValue editorContent
    return


  replaceABallWithABox : ->
    editorContent = @editor.getValue()
    rePattern = undefined
    rePattern = /(ball)/g
    allMatches = editorContent.match(rePattern)
    if allMatches is null
      numberOfResults = 0
    else
      numberOfResults = allMatches.length
    whichOneToChange = Math.floor(Math.random() * numberOfResults) + 1
    countWhichOneToSwap = 0
    editorContent = editorContent.replace(rePattern, (match, text, urlId) ->
      countWhichOneToSwap++
      if countWhichOneToSwap is whichOneToChange
        return "box"
      match
    )
    @editor.setValue editorContent
    return

  replaceAnInteger : ->
    editorContent = @editor.getValue()
    rePattern = /(^|[\t ,\(/])(\d+)(?!\.)/gm
    allMatches = editorContent.match(rePattern)
    if allMatches is null
      numberOfResults = 0
    else
      numberOfResults = allMatches.length
    whichOneToChange = Math.floor(Math.random() * numberOfResults) + 1
    countWhichOneToSwap = 0
    editorContent = editorContent.replace(rePattern, (match, p1, p2) ->
      countWhichOneToSwap++
      if countWhichOneToSwap is whichOneToChange
        whichOp = Math.floor(Math.random() * 7)
        if whichOp is 0
          return p1 + Math.floor(parseFloat(p2) * 2)
        else if whichOp is 1
          return p1 + Math.floor(parseFloat(p2) / 2)
        else if whichOp is 2
          return p1 + Math.floor(parseFloat(p2) + 1)
        else if whichOp is 3
          return p1 + Math.floor(parseFloat(p2) - 1)
        else if whichOp is 4
          return p1 + Math.floor(parseFloat(p2) * 5)
        else if whichOp is 5
          return p1 + Math.floor(parseFloat(p2) / 5)
        else if whichOp is 6
          return p1 + "Math.floor(1+time/1000)"
      match
    )
    @editor.setValue editorContent
    return

  replaceTimeWithAConstant: ->
    editorContent = @editor.getValue()
    rePattern = /(time)/g
    allMatches = editorContent.match(rePattern)
    countWhichOneToSwap = 0
    if !allMatches
      @numberOfResults = 0
    else
      @numberOfResults = allMatches.length
    @whichOneToChange = Math.floor(Math.random() * @numberOfResults) + 1
    editorContent = editorContent.replace(rePattern, (match, text, urlId) =>
      countWhichOneToSwap++
      if countWhichOneToSwap is @whichOneToChange
        return "" + Math.floor(Math.random() * 20) + 1
      match
    )
    @editor.setValue editorContent


  replaceABoxWithABall : ->
    editorContent = @editor.getValue()
    rePattern = undefined
    rePattern = /(box)/g
    allMatches = editorContent.match(rePattern)
    if allMatches is null
      numberOfResults = 0
    else
      numberOfResults = allMatches.length
    whichOneToChange = Math.floor(Math.random() * numberOfResults) + 1
    countWhichOneToSwap = 0
    editorContent = editorContent.replace(rePattern, (match, text, urlId) ->
      countWhichOneToSwap++
      if countWhichOneToSwap is whichOneToChange
        return "ball"
      match
    )
    @editor.setValue editorContent
    return

  replaceAFloat : ->
    editorContent = @editor.getValue()
    rePattern = /([-+]?[0-9]*\.[0-9]+)/g
    allMatches = editorContent.match(rePattern)
    if allMatches is null
      numberOfResults = 0
    else
      numberOfResults = allMatches.length
    whichOneToChange = Math.floor(Math.random() * numberOfResults) + 1
    countWhichOneToSwap = 0
    editorContent = editorContent.replace(rePattern, (match, text, urlId) ->
      countWhichOneToSwap++
      if countWhichOneToSwap is whichOneToChange
        whichOp = Math.floor(Math.random() * 12)
        if whichOp is 0
          return parseFloat(match) * 2
        else if whichOp is 1
          return parseFloat(match) / 2
        else if whichOp is 2
          return parseFloat(match) + 1
        else if whichOp is 3
          return parseFloat(match) - 1
        else if whichOp is 4
          return parseFloat(match) * 5
        else if whichOp is 5
          return parseFloat(match) / 5
        else if whichOp is 6
          return parseFloat(match) + 0.1
        else if whichOp is 7
          return parseFloat(match) - 0.1
        else if whichOp is 8
          return parseFloat(match) + 0.5
        else if whichOp is 9
          return parseFloat(match) - 0.5
        else if whichOp is 10
          return Math.floor(parseFloat(match))
        else if whichOp is 11
          return "time/1000"
      match
    )
    @editor.setValue editorContent
    return

  autocoderMutate: ->
    @eventRouter.emit("autocoderbutton-flash")
    @mutate()

  toggle: (forcedState) ->
    if forcedState?
      @active = forcedState
    else
      @active = not @active

    if @active
      @autocoderMutateTimeout = setInterval(
        ()=>@autocoderMutate(),
        @mutationInterval
      )
      if @editor.getValue() is "" or
          ((window.location.hash.indexOf("bookmark") isnt -1) and
          (window.location.hash.indexOf("autocodeTutorial") isnt -1))
        @eventRouter.emit("load-program", "cubesAndSpikes")
    else
      clearInterval @autocoderMutateTimeout
    @eventRouter.emit("autocoder-button-pressed", @active)


module.exports = Autocoder

