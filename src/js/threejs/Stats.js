/*jslint browser: true */
/**
 * @author mr.doob / http://mrdoob.com/
 */

var Stats = function () {

  var _bar, _mode = 1, _modes = 2,
    _frames = 0, _time = Date.now(), _timeLastFrame = _time, _timeLastSecond = _time,
    _fps = 0, _fpsMin = 1000, _fpsMax = 0,
    _ms = 0, _msMin = 1000, _msMax = 0;

  var statsEl = document.getElementById('stats');
  var fpsGraphEl = document.getElementById('fpsgraph');
  var fpsTextEl = document.getElementById('fpstext');
  var msGraphEl = document.getElementById('msgraph');
  var msTextEl = document.getElementById('mstext');

  statsEl.addEventListener( 'mousedown', function ( event ) {

    event.preventDefault();

    _mode = ( _mode + 1 ) % _modes;

    switch (_mode) {
    case 0:
      statsEl.classList.add('msMode');
      statsEl.classList.remove('fpsMode');
      break;
    case 1:
      statsEl.classList.add('fpsMode');
      statsEl.classList.remove('msMode');
      break;
    default:
      statsEl.classList.add('msMode');
      statsEl.classList.remove('fpsMode');
      break;
    }

  }, false );

  // fps
  while ( fpsGraphEl.children.length < 74 ) {
    _bar = document.createElement( 'span' );
    _bar.style.height = '100%';
    fpsGraphEl.appendChild( _bar );
  }

  // ms
  while ( msGraphEl.children.length < 74 ) {
    _bar = document.createElement( 'span' );
    _bar.style.height = Math.random() * 100 + '%';
    msGraphEl.appendChild( _bar );
  }

  var _updateGraph = function ( dom, value ) {
    var child = dom.appendChild( dom.firstChild );
    child.style.height = value + '%';
  };

  return {

    getFps: function () {
      return _fps;
    },

    getFpsMin: function () {
      return _fpsMin;
    },

    getFpsMax: function () {
      return _fpsMax;
    },

    getMs: function () {
      return _ms;
    },

    getMsMin: function () {
      return _msMin;
    },

    getMsMax: function () {
      return _msMax;
    },

    show: function () {
      statsEl.classList.remove('hidden');
    },

    hide: function () {
      statsEl.classList.add('hidden');
    },

    update: function () {

      _time = Date.now();

      _ms = _time - _timeLastFrame;
      _msMin = Math.min( _msMin, _ms );
      _msMax = Math.max( _msMax, _ms );

      msTextEl.textContent = _ms + ' MS ';
      _updateGraph( msGraphEl, Math.min( 1, 1 - ( _ms / 200 )) * 100 );

      _timeLastFrame = _time;

      _frames ++;

      if ( _time > _timeLastSecond + 1000 ) {

        _fps = Math.round( ( _frames * 1000 ) / ( _time - _timeLastSecond ) );
        _fpsMin = Math.min( _fpsMin, _fps );
        _fpsMax = Math.max( _fpsMax, _fps );

        fpsTextEl.textContent = _fps + ' FPS (' + _fpsMin + '-' + _fpsMax + ')';
        _updateGraph( fpsGraphEl, Math.min( 1, 1 - ( _fps / 100 )) * 100 );

        _timeLastSecond = _time;
        _frames = 0;

      }

    }

  };

};

module.exports = Stats;
