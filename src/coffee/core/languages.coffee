
class Languages

  constructor: (@eventRouter, @globalScope) ->
    LiveLang = require ('../languages/' + LANGUAGE)
    @compiler = new LiveLang.compiler(@eventRouter)
    @runner = new LiveLang.runner(@eventRouter, @compiler, @globalScope)

module.exports = Languages

