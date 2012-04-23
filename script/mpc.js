/**
 * SoundManager 2: MPC (Drum Machine) demo
 */

var MPC = function() {
  var self = this;
  //this.idPrefix = 'btn-'; // HTML ID prefix
  //this.statusWidth = 6;
  //this.progressWidth = 256;
  //this.keys = {'1':0,'2':1,'3':2,'4':3,'q':4,'w':5,'e':6,'r':7,'a':8,'s':9,'d':10,'f':11,'z':12,'x':13,'c':14,'v':15}

  // scope within these event handler methods: "this" = SMSound() object instance (see SMSound() in soundmanager.js for reference) 

  this.showProgress = function() {
    // sound is loading, update bytes received using this.bytesLoaded / this.bytesTotal
    //if (self._getButton(this.sID).className != 'loading') self._getButton(this.sID).className = 'loading'; // a bit inefficient here..
    //self._showStatus(this.sID,this.bytesLoaded,this.bytesTotal);
  }

  this.onid3 = function() {
    soundManager._writeDebug('mpc.onid3()');
    var oName = null;
    for (var oName in this.id3) {
      soundManager._writeDebug(oName+': '+this.id3[oName]) // write out name/value ID3 pairs (eg. "artist: Beck")
    }
  }

  this.onload = function() {
    var sID = this.sID;
    //self._getButton(this.sID).className = '';
    //self._getButton(this.sID).title = ('Sound ID: '+this.sID+' ('+this.url+')');
  }

  this.onfinish = function() {
  }

  this.onplay = function() {
  }

  this.whileplaying = function() {
  }

  

  this._showStatus = function(sID,n1,n2) {
    //var o = self._getButton(sID).getElementsByTagName('div')[0];
    //var offX = (n2>0?(-self.progressWidth+parseInt((n1/n2)*o.offsetWidth)):-self.progressWidth);
    //o.style.backgroundPosition = offX+'px 0px';
  }



  this.init = function() {
    //document.onkeydown = self._keyHandler;
  }

}

var mpc = new MPC();

soundManager.flashVersion = (window.location.toString().match(/#flash8/i)?8:9);
if (soundManager.flashVersion != 8) {
  soundManager.useHighPerformance = true;
  soundManager.useFastPolling = true;
}
soundManager.flashPollingInterval = 0;
soundManager.url = './swf/'; // path to load SWF from (overriding default)
soundManager.bgcolor = '#333333';
soundManager.wmode = null;
soundManager.debugMode = false;
soundManager.consoleOnly = false;
soundManager.useFlashBlock = true;

soundManager.onready(function() {

  // This is the "onload" equivalent which is called when SoundManager has been initialised (sounds can be created, etc.)

  mpc.init();

  // set up some default options / event handlers - so all sounds created are given these handlers

  soundManager.defaultOptions.autoLoad = true;
  soundManager.defaultOptions.whileloading = mpc.showProgress;
  soundManager.defaultOptions.onid3 = mpc.onid3;
  soundManager.defaultOptions.onload = mpc.onload;
  //soundManager.defaultOptions.onplay = mpc.onplay;
  //soundManager.defaultOptions.whileplaying = mpc.whileplaying;
  //soundManager.defaultOptions.onfinish = mpc.onfinish;

  if (!soundManager.html5.needsFlash) {
    //document.getElementById('isHTML5').style.display = 'inline';
  }

    soundManager.createSound('toc', 'audio/AMB_BD_1.mp3');
    soundManager.createSound('highHatOpen', 'audio/AMB_HHCL.mp3');
    soundManager.createSound('highHatOpen', 'audio/AMB_HHOP.mp3');
    soundManager.createSound('toc2', 'audio/AMB_HTM.mp3');
    soundManager.createSound('toc3', 'audio/AMB_LTM2.mp3');
    soundManager.createSound('toc4', 'audio/AMB_RIM1.mp3');
    soundManager.createSound('snare', 'audio/AMB_SN13.mp3');
    soundManager.createSound('snare2', 'audio/AMB_SN_5.mp3');
    soundManager.createSound('china', 'audio/CHINA_1.mp3');
    soundManager.createSound('crash', 'audio/CRASH_1.mp3');
    soundManager.createSound('crash2', 'audio/CRASH_5.mp3');
    soundManager.createSound('crash3', 'audio/CRASH_6.mp3');
    soundManager.createSound('ride', 'audio/RIDE_1.mp3');

  soundManager.createSound({id:'glass', multiShot: true, url:'audio/glass2.mp3'});
  soundManager.createSound({id:'glass1', multiShot: true, url:'audio/glass3.mp3'});
  soundManager.createSound({id:'glass2', multiShot: true, url:'audio/glass4.mp3'});
  soundManager.createSound({id:'glass3', multiShot: true, url:'audio/glass5.mp3'});

  soundManager.createSound({id:'thump', multiShot: true, url:'audio/8938__patchen__piano-hits-hand-03v2.mp3'});
  soundManager.createSound({id:'lowFlash', multiShot: true, url:'audio/9569__thanvannispen__industrial-low-flash04.mp3'});
  soundManager.createSound({id:'lowFlash2', multiShot: true, url:'audio/9570__thanvannispen__industrial-low-flash07.mp3'});
  soundManager.createSound({id:'tranceKick2', multiShot: true, url:'audio/24004__laya__dance-kick3.mp3'});
  soundManager.createSound({id:'tranceKick', multiShot: true, url:'audio/33325__laya__trance-kick01.mp3'});
  soundManager.createSound({id:'wosh', multiShot: true, url:'audio/33960__krlox__pudricion-4.mp3'});
  soundManager.createSound({id:'voltage', multiShot: true, url:'audio/49255__keinzweiter__bonobob-funk.mp3'});
  soundManager.createSound({id:'beepA', multiShot: true, url:'audio/100708__steveygos93__bleep_a.mp3'});
  soundManager.createSound({id:'beepB', multiShot: true, url:'audio/100708__steveygos93__bleep_b.mp3'});
  soundManager.createSound({id:'beepC', multiShot: true, url:'audio/100708__steveygos93__bleep_c.mp3'});
  soundManager.createSound({id:'beepD', multiShot: true, url:'audio/100708__steveygos93__bleep_d.mp3'});
  soundManager.createSound({id:'beep', multiShot: true, url:'audio/116508_Beep.mp3'});
  soundManager.createSound({id:'hello', multiShot: true, url:'audio/116508_Hello.mp3'});
  soundManager.createSound({id:'alienBeep', multiShot: true, url:'audio/132389__blackie666__alienbleep.mp3'});
  

  /**
   * createSound options can also be set on a per-file basis, with specific option overrides.
   * (Options not specified here will inherit defaults as defined in soundManager.defaultOptions.)
   *
   * eg.
   *
   * soundManager.createSound({
   *  id: 'mySound',
   *  url: '/path/to/some.mp3',
   *  stream: true,
   *  autoPlay: true,
   *  multiShot: false,
   *  whileloading: function() { alert('sound '+this.sID+': '+this.bytesLoaded+' of '+this.bytesTotal+' bytes loaded.'); } // event handler: "this" is scoped to SMSound() object instance for easy access to methods/properties
   * });
   *
   * - OR -
   *
   * If you just want a sound with all default options, you can also specify just the required id and URL as string parameters:
   *
   * soundManager.createSound('mySound','/path/to/some.mp3');
   */
});
