###
## PatternPlayer is the class responsible for triggering audio
## based off a pattern
###

define () ->

  class PatternPlayer

    constructor: () ->
      console.log('Pattern Player')

    # How are patterns run
    #
    # each letter in a pattern is considered to be a 1/16 note
    # each beat is considered to be a 1/4 note
    # take the beat value, multiply by 4, modulus the pattern length
    # get the char from the pattern position equal to the remainder
    # if it's an X, trigger a note
    runPattern: (pattern, beat) ->
      compressedPattern = pattern.replace(/\s+/g, '')
      patternPos = int(((beat - 1) * 4) % compressedPattern.length)
      console.log(compressedPattern, patternPos)
      compressedPattern[patternPos] == 'x'

  PatternPlayer

