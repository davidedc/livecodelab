
define([
  'LiveLangV1',
  'LiveLangV2'
], (
  LiveLangV1,
  LiveLangV2
) ->

  class Languages

    constructor: (lclCore, eventRouter, globalScope) ->

      @languages = {
        'lclv1': {
          'runner': new LiveLangV1.runner(eventRouter),
          'compiler': new LiveLangV1.compiler(eventRouter, lclCore)
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

