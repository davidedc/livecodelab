
class Languages

  constructor: (@eventRouter, @globalScope) ->

  getLanguageObjects: () ->
    LiveLang = require ('../languages/' + LANGUAGE)
    compiler = new LiveLang.compiler(@eventRouter)
    runner = new LiveLang.runner(@eventRouter, compiler, @globalScope)
    return {
        runner: runner,
        compiler: compiler
    }

module.exports = Languages

