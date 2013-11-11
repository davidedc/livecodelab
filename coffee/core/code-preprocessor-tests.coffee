###
## CodePreprocessor takes care of translating the simplified syntax
## of livecodelb to a coffeescript that is degestible by the
## coffeescript compiler.
## This pre-processing step can raise some errors - which are
## returned in a dedicated variable.
###

define ['core/code-preprocessor-tests'], (foo) ->

  class CodePreprocessorTests

    testCases: null

    constructor: ->

      @testCases= [
         input:    """
                   5 times
                     rotate 0,1,time/5000
                     move 0.2,0,0
                     3 times
                       rotate 1
                       box
                   """
         expected: """
                   (5+0).times -> 
                     rotate 0,1,time/5000
                     move 0.2,0,0
                     (3+0).times -> 
                       rotate 1
                       box();
                   """
         error: undefined
        ,
         input:    """
                   // should give error
                   peg
                   times
                     box 2
                   """
         expected: undefined
         error: "how many times?"
      ]

  CodePreprocessorTests
