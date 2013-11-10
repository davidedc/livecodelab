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
         input: """
                <strong>
                cup of coffeescript
                </strong>
                """
         expected: "A2"
        ,
         input: "B1"
         expected: "B2"
      ]

  CodePreprocessorTests
