###
## The WebAudioApi uses the Web Audio Api for audio functionality
## It supports more stuff than the Buzz Api
###

class WebAudioApi
	
  constructor: () ->
    @context = new (window.AudioContext || window.webkitAudioContext)
    @soundout = @context.destination
    @samples = {}
    @bufferSize = 1024
    @total = 0
    @fft = []
    @waveform = []
    @analyser
    @numbars = 14
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
        @analyser = @context.createAnalyser()
        
        @analyser.fftSize = 1024
        @analyser.smoothingTimeConstant = 0.3
        # binding to window because otherwise it'll
        # get garbage collected
        window.microphoneProcessingNode = @createNode()
        @mediaStreamSource.connect @analyser;
       # @analyser.connect @mediaStreamSource;
        
        @mediaStreamSource.connect window.microphoneProcessingNode
        window.microphoneProcessingNode.connect @context.destination
        
   createNode: =>
        node = @context.createScriptProcessor @bufferSize, 2, 2
        node.onaudioprocess = (e) =>
            
            #console.log('received audio ' +left[0])
            # clone the samples
            
            freqByteData = new Uint8Array @analyser.frequencyBinCount
            timeByteData = new Uint8Array @analyser.frequencyBinCount
             
            @analyser.getByteFrequencyData freqByteData;
            @analyser.getByteTimeDomainData timeByteData;
            @waveform = timeByteData
            #numbars = 14

            for i in [0...@numbars]
            	    multipliers = @analyser.frequencyBinCount / @numbars
            	    
            	    magnitude = 0
            	    multipliers = Math.floor ( multipliers )
            	    offset = i * multipliers 
            	    #gotta sum/average the block, or we miss narrow-bandwidth spikes
            	    for j in [0...multipliers]
            	    	    magnitude += freqByteData[offset + j]            	    	   
            	    
            	    magnitude = magnitude / multipliers
            	    @fft[i] = magnitude

            @total += @bufferSize
            if @total > @bufLength
                outBuffer = @prepareBuffer()
                @callback outBuffer

        node
        
  activateMic: () =>
    console.log('hola +++++++++++++++++++++++')
    
  getFFT: () =>
     @fft
     
  getWaveForm: () =>
     @waveform 
   
  setNumVars: (value) =>
     @numbars = value
     
  setSmoothingTimeConstant: (smooth) =>   
     @analyser.smoothingTimeConstant = smooth
      
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

