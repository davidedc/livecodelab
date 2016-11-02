
class Languages

  constructor: (@eventRouter, @globalScope) ->

  getLanguageObjects: () ->
    if LANGUAGE == 'v2'
        LiveLang = require ('../languages/livelangv2')
        compiler = new LiveLang.compiler(@eventRouter)
        runner = new LiveLang.runner(@eventRouter, @compiler)
    else
        LiveLang = require ('../languages/livelangv1')
        compiler = new LiveLang.compiler()
        runner = new LiveLang.runner(@eventRouter, @globalScope)
    return {
        runner: runner,
        compiler: compiler
    }

module.exports = Languages

