/*!
  * Pulse - beat tracking from MIDI Clock
  * v0.1.1
  * https://github.com/noio/pulse
  * MIT License | (c) Thomas "noio" van den Berg 2013
  */
var pulse = function(module){

	module.MIDI_CLOCK = 248;
	module.MIDI_START = 250;
	module.PPQN = 24;
	module.TAP_TIMEOUT = 20;
	
	module.beats = [];
	module.bpm = 120;
	module.mspb = 600; 

	var socket = null;
	var clocks = 0;
	var latest = 0;

	/**
	 * Handles the incoming MIDI clock messages.
	 */
	function clock(){
		if (clocks == 0){
			module.tap()
		}
		clocks ++;
		if (clocks == module.PPQN){
			clocks = 0;
		}
	}

	/**
	 * Handles the midi start event,
	 * which basically resets the PPQN counter to 0
	 */
	function sync(){
		console.log('Synced.')
		clocks = 0;
		latest = 0;
	}

	/**
	 * This is fired every "whole" beat, and updates the BPM
	 */
	module.tap = function(){
		var now = (new Date).getTime();
		if (now - module.beats[module.beats.length - 1] > module.TAP_TIMEOUT * module.mspb) {
			module.beats = []
		}
		module.beats.push(now);
		if (module.beats.length > 1){
			if (module.beats.length >= 4){
				module.beats.shift()
			}
			module.mspb = (module.beats[module.beats.length-1] - module.beats[0]) / (module.beats.length-1);
			// convert 'milliseconds per beats to 'beats per minute'
			module.bpm = 60000 / module.mspb;
		}
		latest = Math.round(latest) + 1;
	}

	/**
	* Get the current beat
	*/
	module.beat = function(){
		return latest + ((new Date).getTime() - module.beats[module.beats.length-1]) / module.mspb;
	}

	/**
	* Get a pulse on the beat
	*/
	module.pulse = function(){
		return Math.exp(-Math.pow( Math.pow(module.beat() % 1, 0.3) - 0.5, 2) / 0.05)
	}

	/**
	* Connect to a pulse server, get the socket.io script
	*/
	module.connect = function(address){
		if (socket){
			module.disconnect();
		}
		if (!address.indexOf('http') == 0){
			address =  'http://' + address;
		}
		var script = document.createElement('script');
		script.src = address + '/socket.io/socket.io.js';
		console.log(script)
		
		script.onload = function () {	
    		socket = io.connect(address);
  			socket.on('midi', function (data) {
	    		if (data == module.MIDI_CLOCK){
	    			clock();
	    		}
	    		else if (data == module.MIDI_START){
	    			sync();
	    		}
  			});
		};

		document.head.appendChild(script);
	}

	/**
	* Disconnect from the pulse address
	*/
	module.disconnect = function(){
		if (socket){
			socket.disconnect();
			socket = null;
		}
	}

	return module;

}({})