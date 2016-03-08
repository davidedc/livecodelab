###
## The WebAudioApi uses the Web Audio Api for audio functionality
## It supports more stuff than the Buzz Api
###

class WebAudioApi
	
  constructor: () ->
    @context = new (window.AudioContext || window.webkitAudioContext)
    @soundout = @context.destination
    @samples = {}
    @bufferSize = 4096
    @total = 0
    @bufL = []
    @bufR = []
    @getUserMedia audio:true, @gotStream

  getTime: () =>
    @context.currentTime * 1000

  getUserMedia: (dictionary, callback) ->
        try
            navigator.getMedia = navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia ||
                navigator.msGetUserMedia

            navigator.getMedia dictionary, callback, (err) ->
                console.log("The following error occured: " + err);
        catch e
            throw "Could not getMedia"
            
            
  callback: (data) =>
  	console.log('ESTAMOS YA EN EL CALLBACCKKKKKSS')
  	  
  	  
  gotStream: (stream) =>
        @bufLength = @length * @context.sampleRate

        # get an AudioNode from the stream
        @mediaStreamSource = @context.createMediaStreamSource stream

        # binding to window because otherwise it'll
        # get garbage collected
        window.microphoneProcessingNode = @createNode()
        @mediaStreamSource.connect window.microphoneProcessingNode
        window.microphoneProcessingNode.connect @context.destination
        
   createNode: =>
        node = @context.createScriptProcessor @bufferSize, 2, 2
        node.onaudioprocess = (e) =>
            left = e.inputBuffer.getChannelData(0)
            right = e.inputBuffer.getChannelData(1)
            console.log('received audio ' +left[0])
            # clone the samples
            @bufL.push new Float32Array(left)
            @bufR.push new Float32Array(right)

            @total += @bufferSize
            if @total > @bufLength
                outBuffer = @prepareBuffer()
                @callback outBuffer

        node
        
  activateMic: () =>
    console.log('hola +++++++++++++++++++++++')
    
  readMic: () =>
     @bufL
      
  loadSample: (name, path) =>
    url = path
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
      console.log('play modificado: ', name)
      buffer = @samples[name]
      source = @context.createBufferSource()
      source.buffer = buffer
      source.connect(@soundout)
      source.start(0)

module.exports = WebAudioApi

