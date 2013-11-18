/*!
  * Pulse - beat tracking from MIDI Clock
  * v0.1.3
  * https://github.com/noio/pulse
  * MIT License | (c) Thomas "noio" van den Berg 2013
  */
var Pulse = function(module){

	function Pulse(address) {
		this.beats = [];
		this.bpm = 120;
		this.mspb = 600; 
		
		this.socket = null;
		this.address = null;
		this.connecting = false;
		this.clocks = 0;
		this.latest = 0;

		this.deviceLatency = 0;
		this.netLatency = 0;	
		this.lastPing = 0;
		this.pingTimer = null;

		if (address){
			this.connect(address);
		}
	}

	// Static properties
	Pulse.MIDI_CLOCK = 248;
	Pulse.MIDI_START = 250;
	Pulse.PPQN = 24;
	Pulse.TAP_TIMEOUT = 20;
	Pulse.MAX_NET_LATENCY = 150;
	Pulse.PING_INTERVAL = 10000;
	Pulse.VALID_IP = /^(http:\/\/)?(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(:[0-9]+)?$/;
	Pulse.VALID_HOSTNAME = /^(http:\/\/)?(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])(:[0-9]+)?$/;
	
	/**
	 * Handles the incoming MIDI clock messages.
	 */
	Pulse.prototype.clock = function(){
		if (this.clocks == 0){
			this.tap()
		}
		this.clocks ++;
		if (this.clocks == Pulse.PPQN){
			this.clocks = 0;
		}
	}

	/**
	 * Handles the midi start event,
	 * which basically resets the PPQN counter to 0
	 */
	Pulse.prototype.sync = function(){
		console.log('MIDI Synced.')
		this.clocks = 0;
		this.latest = 0;
	}


	/**
	 * This is fired every "whole" beat, and updates the BPM
	 */
	Pulse.prototype.tap = function(){
		var now = (new Date).getTime();
		if (now - this.beats[this.beats.length - 1] > Pulse.TAP_TIMEOUT * this.mspb) {
			this.beats = []
		}
		this.beats.push(now);
		if (this.beats.length > 1){
			if (this.beats.length >= 4){
				this.beats.shift()
			}
			this.mspb = (this.beats[this.beats.length-1] - this.beats[0]) / (this.beats.length-1);
			// convert 'milliseconds per beats to 'beats per minute'
			this.bpm = 60000 / this.mspb;
		}
		this.latest = Math.round(this.latest) + 1;
	}

	/**
	* Get the current beat
	*/
	Pulse.prototype.beat = function(){
		var passed = (new Date).getTime() - this.beats[this.beats.length-1];
		return this.latest + (passed + this.netLatency + this.deviceLatency) / this.mspb;
	}

	/**
	* Get a pulse on the beat
	*/
	Pulse.prototype.pulse = function(){
		return Math.exp(-Math.pow( Math.pow(this.beat() % 1, 0.3) - 0.5, 2) / 0.05)
	}

	/*
	* Return the address of the current connection,
	* or 'null' if not connected.
	*/
	Pulse.prototype.currentConnection = function(){
		if (this.socket){
			return this.address;
		} else {
			return null;
		}
	}

	/**
	* Cleans an address (prepend http)
	*/
	Pulse.prototype.cleanAddress = function(address){
		if (!address.indexOf('http') == 0){
			address =  'http://' + address;
		}
		return address;
	}

	/**
	* Connect to a pulse server, get the socket.io script
	*/
	Pulse.prototype.connect = function(address){
		address = this.cleanAddress(address);

		if (!(address.match(Pulse.VALID_HOSTNAME) || address.match(Pulse.VALID_IP))){
			throw "ConnectionError: Not a valid address (" + address + ")."
		}

		if (this.currentConnection() === address) {
			throw "ConnectionError: Already connected to that address."
		}

		if (this.connecting){
			throw "ConnectionError: Still attempting connection."
		}

		if (this.socket){
			this.disconnect();
		}

		if (typeof io !== 'undefined'){
			self.connectSocket(address)
		} else {
			this.connecting = true;
			var self = this;
			setTimeout(function(){
				self.connecting = false;
			}, 5000);
			var script = document.createElement('script');
			script.src = address + '/socket.io/socket.io.js';
			
			self = this;
			script.onload = function () {
				self.connectSocket(address);
			};
			document.head.appendChild(script);
		}
	}

	Pulse.prototype.connectSocket = function(address){
		var self = this;
		this.socket = io.connect(address);
		this.connecting = true;
		// Handle connect
		this.socket.on('connect', function(){
		   	this.address = address;
			console.log('Connected to ' + address);
		   	this.pingTimer = setInterval(function(){self.ping()}, Pulse.PING_INTERVAL);
		   	this.connecting = false;
		}.bind(this));
		
		// Handle connection failure
		this.socket.on('connect_failed', function(){
			this.socket = null;
			this.connecting = false;
			throw "Failed to connect to MIDI Socket.";
		}.bind(this));

		// Handle incoming midi
		this.socket.on('midi', function (data) {
    		if (data == Pulse.MIDI_CLOCK){
    			this.clock();
    		}
    		else if (data == Pulse.MIDI_START){
    			this.sync();
    		}
		}.bind(this));

		// Set the network latency when a pong is received. 
		this.socket.on('pong', function(data){
			var latency = Math.min(Pulse.MAX_NET_LATENCY, ((new Date).getTime() - this.lastPing) / 2);
			this.netLatency = this.netLatency * 0.8 + latency * 0.2;
			console.log("Pulse Latency: " + this.netLatency.toFixed(1) + 'ms')
		}.bind(this));
	}

	Pulse.prototype.ping = function(){
		if (this.socket){
			this.lastPing = (new Date).getTime();
			this.socket.emit('ping');
		}
	}

	/**
	* Disconnect from the pulse address
	*/
	Pulse.prototype.disconnect = function(){
		if (this.socket){
			this.socket.disconnect();
			this.socket = null;
			this.address = null;
			this.connecting = false;
		}
		clearInterval(this.pingTimer);
	}

	return Pulse;

}({})