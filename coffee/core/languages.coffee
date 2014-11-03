
define([
  'languages/livelangv1/main',
  'languages/livelangv2/main'
], (
  LiveLangV1,
  LiveLangV2
) ->

  class Languages

    constructor: (eventRouter, globalScope) ->

      v1Compiler =  new LiveLangV1.compiler(eventRouter)

      @languages = {
        'lclv1': {
          'runner': new LiveLangV1.runner(eventRouter, v1Compiler),
          'compiler': v1Compiler
        },
        'lclv2': {
          'runner': new LiveLangV2.runner(eventRouter, globalScope),
          'compiler': new LiveLangV2.compiler()
        }
      }
      @languages.default = @languages.lclv1

    getLanguageObjects: (name) ->
      if @languages[name]
        console.log("setting language to #{name}")
        return @languages[name]
      else
        console.log("setting language to default")
        return @languages.default

  Languages

)

