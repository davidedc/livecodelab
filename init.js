var startingSound;

var closeAndCheckAudio = function() {
    //$('#noWebGLMessage').close();
    $.modal.close();
    setTimeout('checkAudio();', 500);
  }

var checkAudio = function() {
    if (!buzz.isSupported()) {
      //if (true) {
      $('#noAudioMessage').modal();
      $('#simplemodal-container').height(200);
    }
  }

var loadAndTestAllTheSounds = function() {
    log("loading and testing all sounds");
    for (var cycleSoundDefs = 0; cycleSoundDefs < numberOfSounds; cycleSoundDefs++) {

      if (buzz.isMP3Supported()) soundDef[cycleSoundDefs].soundFile = soundDef[cycleSoundDefs].soundFile + ".mp3";
      else if (buzz.isOGGSupported()) soundDef[cycleSoundDefs].soundFile = soundDef[cycleSoundDefs].soundFile + ".ogg";
      else {
        break;
      }

      soundBank[soundDef[cycleSoundDefs].soundName] = [];
      soundFiles[soundDef[cycleSoundDefs].soundName] = soundDef[cycleSoundDefs].soundFile;

      // Chrome can deal with dynamic loading
      // of many files but doesn't like loading too many audio objects
      // so fast - it crashes.
      // At the opposite end, Safari doesn't like loading sound dynamically
      // and instead works fine by loading sound all at the beginning.
      if (navigator.userAgent.toLowerCase().indexOf('chrome') === -1 && !(/MSIE (\d+\.\d+);/.test(navigator.userAgent))) {
        for (var preloadSounds = 0; preloadSounds < CHANNELSPERSOUND; preloadSounds++) {
          // if you load and play all the channels of all the sounds all together
          // the browser freezes, and the OS doesn't feel too well either
          // so better stagger the checks in time.
          setTimeout("checkSound(" + cycleSoundDefs + ");", 200 * cycleSoundDefs);
        }
      }

    } // end of the for loop
    if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1 || (/MSIE (\d+\.\d+);/.test(navigator.userAgent))) {
      startEnvironment();
    }
  }

var checkSound = function(cycleSoundDefs) {
    var newSound = new buzz.sound(soundDef[cycleSoundDefs].soundFile);
    log("loading sound "+ soundDef[cycleSoundDefs].soundFile);
    newSound.mute();
    newSound.load();
    newSound.bind("ended", function(e) {
      this.unbind("ended");
      this.unmute();
      endedFirstPlay++;
      if (endedFirstPlay % 10 === 0) $('#loading').append('/');
      log("tested "+endedFirstPlay+" sounds");
      if (endedFirstPlay === numberOfSounds * CHANNELSPERSOUND) {
        log("tested all sounds");
        startEnvironment();
      }
    });
    newSound.play();
    soundBank[soundDef[cycleSoundDefs].soundName].push(newSound);
  }


var editor;


var startEnvironment = function() {
  pickRandomDefaultGradient();

  log("startEnvironment");
  if (!initThreeJs()) animate();

  if (!Detector.webgl || forceCanvasRenderer) {
    //$('#noWebGLMessage').modal()
    $('#noWebGLMessage').modal({
      onClose: closeAndCheckAudio
    });
    $('#simplemodal-container').height(200);
  }

  //alert('resizing canvas');
  var canvas = document.getElementById('backGroundCanvas');

  if (fullScreenifyBackground) {
    fullscreenify(canvas);
  }
  resetGradientStack();
  simpleGradientUpdateIfChanged();

  if (frenchVersion) {
    $('#demoMenu').text("Démos");
    $('#tutorialsMenu').text("Tutoriaux");
    $('#resetButton').text("Effacer");
    $('#autocodeIndicator').text("Autocode: inactif");

    $('#simpleCubeDemo').text("Cube simple");
    $('#webgltwocubesDemo').text("WebGL: Deux cubes");
    $('#cubesAndSpikes').text("Cubes et piques");
    $('#webglturbineDemo').text("WebGL: Turbine");
    $('#webglzfightartDemo').text("WebGL: Z-fight art!");
    $('#littleSpiralOfCubes').text("Petite spirale");
    $('#tentacleDemo').text("Tentacule");
    $('#lampDemo').text("Lampe");
    $('#trillionfeathersDemo').text("Mille milliards de plumes");
    $('#monsterblobDemo').text("Monstre blob");
    $('#industrialMusicDemo').text("Son: Industriel");
    $('#trySoundsDemo').text("Son: Essayez les tous");
    $('#springysquaresDemo').text("Carrés rebondissants");
    $('#diceDemo').text("Dé");
    $('#webglalmostvoronoiDemo').text("WebGL: Presque Voronoi");
    $('#webglshardsDemo').text("WebGL: Échardes");
    $('#webglredthreadsDemo').text("WebGL: Fils rouges");
    $('#webglnuclearOctopusDemo').text("WebGL: Pieuvre nucléaire");

    $('#introTutorial').text("intro");
    $('#helloworldTutorial').text("hello world");
    $('#somenotesTutorial').text("quelques notes");
    $('#rotateTutorial').text("tourne");
    $('#frameTutorial').text("image");
    $('#timeTutorial').text("temps");
    $('#moveTutorial').text("déplace");
    $('#scaleTutorial').text("taille");
    $('#timesTutorial').text("fois");
    $('#fillTutorial').text("remplissage");
    $('#strokeTutorial').text("trait");
    $('#colornamesTutorial').text("les couleurs par leur nom");
    $('#lightsTutorial').text("éclairages");
    $('#backgroundTutorial').text("fond");
    $('#gradientTutorial').text("degradeSimple");
    $('#lineTutorial').text("ligne");
    $('#ballTutorial').text("balle");
    $('#pushpopMatrixTutorial').text("matrice");
    $('#animationstyleTutorial').text("styleAnimation");
    $('#doonceTutorial').text("uneFois");
    $('#autocodeTutorial').text("autocode");
  }


  $('#startingCourtainScreen').fadeOut();
  $("#formCode").css('opacity', 0);

editor = CodeMirror.fromTextArea(document.getElementById("code"), {
  lineNumbers: false,
  indentWithTabs: true,
  tabSize: 1,
  indentUnit: 1,
  lineWrapping: true,
  // We want the code editor to always have focus
  // since there is nothing else to type into.
  // One of those little wonders: you have to pause a little
  // before giving the editor focus, otherwise for some reason
  // the focus is not regained. Go figure.
  onBlur: (function() {
    setTimeout('editor.focus()', 30);
  }),
  onChange: (function() {
    registerCode();
  }),
  mode: "livecodelab",
  onCursorActivity: (function() {
    suspendDimmingAndCheckIfLink();
  })
  //onScroll: (function(){alert('scroll')})
});


editor.setOption("theme", 'night');

  editor.focus();
  adjustCodeMirrorHeight();

  // check if the url points to a particular demo,
  // in which case we load the demo directly.
  // otherwise we do as usual.
  if (window.location.hash.indexOf("bookmark") !== -1) {
    var demoToLoad = window.location.hash.substring("bookmark".length + 2);
    //setTimeout ( "loadDemoOrTutorial('"+demoToLoad+"');",500);
    loadDemoOrTutorial(demoToLoad);
  }
  else {
			startingSound = new buzz.sound( "./sound/audioFiles/start_bing", {
					formats: [ "ogg", "mp3" ]
			});
			
			setTimeout("startingSound.play();",650);
  }
  fakeCursorInterval = setInterval("fakeCursorBlinking()", 800);


  // Init of the dim code toggle.
  // set it to false, then immediatly toggle it to true with the managing function
  // that way we can easily invert the default: just change false to true -- julien
  dimcodeOn = false;
  toggleDimCode();

}

$(document).ready(function() {
  log("document ready");
  if (!isCanvasSupported) {
    $('#noCanvasMessage').modal({
      onClose: function() {
        $('#loading').text('sorry :-(');
        $.modal.close();
      }
    });
    $('#simplemodal-container').height(200);
    return;
  }

  loadAndTestAllTheSounds();
});