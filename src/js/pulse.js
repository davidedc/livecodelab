/*jslint browser: true */
/*global define, io */
/*!
  * Pulse - beat tracking from MIDI Clock
  * v0.1.7
  * https://github.com/noio/pulse
  * MIT License | (c) Thomas "noio" van den Berg 2013
  */

/*
 * Further modifications Guy John for Live Code Lab
 */

var Pulse = function (address) {
    this.beats = [];
    this.bpm = 120;
    this.mspb = 600; 
    
    this.socket = null;
    this.address = null;
    this.connecting = false;
    this.clocks = 0;
    this.count = 0;

    this.deviceLatency = 0;
    this.netLatency = 0;	
    this.lastPing = 0;
    this.pingTimer = null;

    if (address){
        this.connect(address);
    }
};

// Static properties
Pulse.MIDI_CLOCK = 248;
Pulse.MIDI_START = 250;
Pulse.MIDI_CONTINUE = 251;
Pulse.PPQN = 4;
Pulse.TAP_TIMEOUT = 20;
Pulse.MAX_NET_LATENCY = 150;
Pulse.PING_INTERVAL = 10000;
Pulse.VALID_IP = /^(http:\/\/)?(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(:[0-9]+)?$/;
Pulse.VALID_HOSTNAME = /^(http:\/\/)?(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])(:[0-9]+)?$/;

/**
* Handles the incoming MIDI clock messages.
*/
Pulse.prototype.clock = function(){
    if (this.clocks % Pulse.PPQN === 0){
        var beatTime = new Date().getTime() - this.deviceLatency - this.netLatency;
        this.newBeat(beatTime);
        this.clocks = 0;
    }
    this.clocks ++;
};

/**
* Handles the midi start event,
* which basically resets the PPQN counter to 0
*/
Pulse.prototype.sync = function(){
    console.log('MIDI Synced.');
    this.clocks = 0;
    this.count = 0;
};

/**
* This updates the bpm when necessary
*/
Pulse.prototype.newBeat = function(t){
    this.beats.push(t);
    if (this.beats.length > 1){
        if (this.beats.length > 4){
            this.beats.shift();
        }
        this.mspb = (this.beats[this.beats.length-1] - this.beats[0]) / (this.beats.length-1);
        // convert 'milliseconds per beats to 'beats per minute'
        this.bpm = 60000 / this.mspb;
    }
    this.count = Math.round(this.count) + 1;
};


/**
* This is fired every "whole" beat, and updates the BPM
*/
Pulse.prototype.tap = function(){
    var now = (new Date()).getTime();
    if (now - this.beats[this.beats.length - 1] > Pulse.TAP_TIMEOUT * this.mspb) {
        this.beats = [];
    }
    this.newBeat(now);
};

/**
* Get the current beat
*/
Pulse.prototype.beat = function(){
    var passed = (new Date()).getTime() - this.beats[this.beats.length-1];
    return this.count + passed / this.mspb;
};

/**
* Get a pulse on the beat
*/
Pulse.prototype.pulse = function(){
    return Math.exp(-Math.pow( Math.pow(this.beat() % 1, 0.3) - 0.5, 2) / 0.05);
};

/**
* Returns timestamp of the last beat
*/
Pulse.prototype.timeOfLastBeat = function(){
    if (this.beats.length){
        return this.beats[this.beats.length - 1];
    }
    return null;
};

/*
* Return the address of the current connection,
* or 'null' if not connected.
*/
Pulse.prototype.currentConnection = function(){
    if (this.socket){
        return this.address;
    }
    return null;
};

/**
* Cleans an address (prepend http)
*/
Pulse.prototype.cleanAddress = function(address){
    if (address.indexOf('http') !== 0){
        address =  'http://' + address;
    }
    return address;
};

/**
* Connect to a pulse server, get the socket.io script
*/
Pulse.prototype.connect = function(address){
    var _this = this;

    if (typeof address === 'undefined') {
        throw "No address.";
    }

    address = this.cleanAddress(address);

    if (!(address.match(Pulse.VALID_HOSTNAME) || address.match(Pulse.VALID_IP))){
        throw "Not a valid address (" + address + ").";
    }

    if (this.currentConnection() === address) {
        throw "Already connected to that address.";
    }

    if (this.connecting){
        throw "Still attempting connection.";
    }

    if (this.socket){
        this.disconnect();
    }

    if (typeof io !== 'undefined'){
        this.connectSocket(address);
    } else {
        this.connecting = true;
        setTimeout(function(){
            _this.connecting = false;
        }, 5000);
        var script = document.createElement('script');
        script.src = address + '/socket.io/socket.io.js';
        
        script.onload = function () {
            _this.connectSocket(address);
        };
        document.head.appendChild(script);
    }
};

Pulse.prototype.connectSocket = function(address){
    var _this = this;
    this.socket = io.connect(address, {'force new connection': true });
    this.connecting = true;
    setTimeout(function(){
        _this.connecting = false;
    }, 5000);

    console.log(this.socket);
    
    // Handle connect
    this.socket.on('connect', function(){
        _this.address = address;
        console.log('Connected to ' + address);
        _this.pingTimer = setInterval(function(){_this.ping();}, Pulse.PING_INTERVAL);
        _this.connecting = false;
    });
    
    // Handle connection failure
    this.socket.on('connect_failed', function(){
        _this.socket = null;
        _this.connecting = false;
        throw "Failed to connect to MIDI Socket.";
    });

    // Handle incoming midi
    this.socket.on('midi', function (data) {
        if (data === Pulse.MIDI_CLOCK){
            _this.clock();
        }
        else if (data === Pulse.MIDI_START || data === Pulse.MIDI_CONTINUE){
            _this.sync();
        }
    });

    // Set the network latency when a pong is received. 
    this.socket.on('pong', function(data){
        var latency = Math.min(Pulse.MAX_NET_LATENCY, ((new Date()).getTime() - _this.lastPing) / 2);
        _this.netLatency = _this.netLatency * 0.8 + latency * 0.2;
        console.log("Pulse Latency: " + _this.netLatency.toFixed(1) + 'ms');
    });


};

Pulse.prototype.ping = function(){
    if (this.socket){
        this.lastPing = (new Date()).getTime();
        this.socket.emit('ping');
    }
};

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
};

module.exports = Pulse;

