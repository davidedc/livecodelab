###
## The AudioAPI is responsible for the actual management and playback
## of the sounds
###

define () ->

  class AudioApi

    constructor: () ->
      @context = new AudioContext();
      @soundout = @context.destination
      @samples = {}

    loadSample: (name, path) =>
      url = path + '.mp3'
      request = new XMLHttpRequest()
      request.open('GET', url, true)
      request.responseType = 'arraybuffer';

      request.onload = () =>
        @context.decodeAudioData(
          request.response,
          (buffer) => @samples[name] = buffer,
          () -> console.log('error loading sample', name)
        )

      request.send()

    play: (name) =>
      buffer = @samples[name]
      source = @context.createBufferSource()
      source.buffer = buffer
      source.connect(@soundout)
      source.start(0)

    # Return time in milliseconds
    getTime: () =>
      @context.currentTime * 1000

