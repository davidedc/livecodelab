###
## The BuzzAudioApi uses Buzz for audio functionality where necessary
## It only supports sample playback and uses a less accurate clock
###

buzz = require '../../js/buzz'

class BuzzAudioApi

  constructor: () ->
    @samples = {}

  getTime: () -> new Date().getTime()

  loadSample: (name, path) =>
    @samples[name] = new buzz.sound(path, {
      formats: ['ogg', 'mp3']
    }).load()

  play: (name) =>
    @samples[name].play()

module.exports = BuzzAudioApi

