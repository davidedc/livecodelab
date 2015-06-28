###
## The WebAudioApi uses the Web Audio Api for audio functionality
## It supports more stuff than the Buzz Api
###

class WebAudioApi

  constructor: () ->
    @context = new AudioContext()
    @soundout = @context.destination
    @samples = {}

  getTime: () =>
    @context.currentTime * 1000

  loadSample: (name, path) =>
    url = path + '.mp3'
    request = new XMLHttpRequest()
    request.open('GET', url, true)
    request.responseType = 'arraybuffer'

    request.onload = () =>
      @context.decodeAudioData(
        request.response,
        (buffer) => @samples[name] = buffer,
        () -> console.log('error loading sample', name)
      )

    request.send()

  play: (name) =>
    if (@samples[name])
      console.log('play: ', name)
      buffer = @samples[name]
      source = @context.createBufferSource()
      source.buffer = buffer
      source.connect(@soundout)
      source.start(0)

module.exports = WebAudioApi

