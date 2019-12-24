/* global $ */

// Init.js takes care of the setup of the whole environment up to cruise speed

import './style/codemirror.css';
import './style/stats.css';
import './style/night.css';
import './style/simpleModal.css';
import './style/sooperfish.css';
import './style/sooperfish-theme-glass.css';
import './style/main.css';

import './index.html';

import EventEmitter from './app/core/event-emitter';
import LiveCodeLabCore from './app/core/livecodelab-core';
import ProgramLoader from './app/programs/program-loader';
import Pulse from './app/lib/pulse';
import WebAudioAPI from './app/sound/webAudioApi';
import BuzzAudioAPI from './app/sound/buzzAudioApi';
import Ui from './app/ui/ui';
import UrlRouter from './app/ui/url-router';
import BigCursor from './app/ui/big-cursor';
import EditorDimmer from './app/ui/text-dimming';
import Stats from './app/ui/stats';
import Canvas from './app/ui/canvas';
import Editor from './app/editor/editor';
import Autocoder from './app/autocoder/autocoder';
import Detector from './app/lib/threejs/Detector';

import './app/globals/numbertimes';

function start() {
  const canvas = new Canvas(document.getElementById('threeJsCanvas'));

  const backgroundDiv = document.getElementById('backgroundDiv');

  /*****************************************************
   * Phase 1 - Preliminary checks and initialisations
   * before LiveCodeCore.
   *****************************************************/

  if (!Detector.webgl) {
    $('#noWebGLMessage').modal({
      onClose: () => $('#loading').text('sorry :-('),
    });
    $.modal.close();

    $('#simplemodal-container').height(200);
    return;
  }

  /****************************************************************
   * EventRouter manages all the events/callbacks across the whole
   * of livecodelab.
   * For "heavy fire" callbacks one might want to use a classic
   * callback system, because there might be some overhead in the
   * triggering of events using this. (to be tested. just throwing
   * it out there.)
   ****************************************************************/
  const eventRouter = new EventEmitter();

  // Stats are updated in the animationLoop
  // add Stats.js - https://github.com/mrdoob/stats.js
  const stats = new Stats();
  stats.hide();

  const ui = new Ui(eventRouter, stats);

  eventRouter.addListener('frame-animated', stats.update);

  // Client used to sync to a time pulse over websocket
  const syncClient = new Pulse();

  // If the WebAudioApi AudioContext class is available then we
  // can use that API. Otherwise we fall back to Buzz
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioAPI = AudioContext
    ? new WebAudioAPI(AudioContext)
    : new BuzzAudioAPI();

  /********************************************************
   * Phase 2 - Initialise the core of livecodelab.
   * LiveCodeLabCore consists of the following main parts:
   *
   *  - timeKeeper
   *  - three
   *  - threeJsSystem
   *  - matrixCommands
   *  - blendControls
   *  - soundSystem
   *  - colourFunctions
   *  - backgroundPainter
   *  - graphicsCommands
   *  - lightSystem
   *  - drawFunctionRunner
   *  - codeCompiler
   *  - animationLoop
   ********************************************************/
  const liveCodeLabCore = new LiveCodeLabCore(
    canvas,
    backgroundDiv,
    eventRouter,
    syncClient,
    audioAPI
  );

  /********************************************************
   * Phase 3 - Other satellite parts
   ********************************************************/
  const urlRouter = new UrlRouter(eventRouter, window.location);

  const codeTextArea = document.getElementById('code');

  const editor = new Editor(eventRouter, codeTextArea);

  setTimeout(
    () => (editor.codemirrorInstance.getWrapperElement().style.opacity = '0'),
    30
  );

  eventRouter.addListener('editor-showAndFocus', () => editor.showAndFocus());
  eventRouter.addListener('editor-hideAndUnfocus', () =>
    editor.hideAndUnfocus()
  );

  const bigCursor = new BigCursor(eventRouter, editor);

  eventRouter.addListener('big-cursor-show', () =>
    bigCursor.unshrinkBigCursor()
  );
  eventRouter.addListener('big-cursor-hide', () => bigCursor.shrinkBigCursor());

  // requires threeJsSystem, blendControls, graphicsCommands
  const programLoader = new ProgramLoader(eventRouter, editor, liveCodeLabCore);
  eventRouter.addListener('load-program', demoName =>
    programLoader.loadDemoOrTutorial(demoName)
  );

  const autocoder = new Autocoder(eventRouter, editor);

  eventRouter.addListener('reset', () => autocoder.toggle(false));
  eventRouter.addListener('toggle-autocoder', () => autocoder.toggle());

  // EditorDimmer functions should probablly be rolled into the editor itself
  // note that the editorDimmer variable below is never used. Leaving it
  // in for consistency.
  const editorDimmer = new EditorDimmer(eventRouter, bigCursor, editor);
  eventRouter.addListener('editor-dim', () => editorDimmer.dimEditor());
  eventRouter.addListener('editor-undim', () => editorDimmer.undimEditor());
  eventRouter.addListener('editor-toggle-dim', autoDim =>
    editorDimmer.toggleDimCode(autoDim)
  );
  eventRouter.addListener('editor-undim', () => editorDimmer.undimEditor());
  window.addEventListener('wheel', () => editorDimmer.undimEditor());
  window.addEventListener(
    'keydown', // keypress would ignore arrows
    () => editorDimmer.undimEditor()
  );

  /***************************************************************
   * Phase 4 - Setup Of Event Listeners, including handling of
   * compile time and runtime errors.
   ***************************************************************/
  eventRouter.addListener('reset', () =>
    liveCodeLabCore.paintARandomBackground()
  );
  eventRouter.emit('editor-toggle-dim', false);
  eventRouter.addListener('livecodelab-running-stably', () => stats.show());
  eventRouter.addListener('livecodelab-sleeping', () => stats.hide());
  eventRouter.addListener('code-changed', updatedCodeAsString => {
    if (updatedCodeAsString !== '') {
      eventRouter.emit('big-cursor-hide');
      eventRouter.emit('editor-showAndFocus');
    } else {
      // clearing history, otherwise the user can undo their way
      // into a previous example but the hash in the URL would be misaligned.
      setTimeout(() => editor.clearHistory(), 30);
      eventRouter.emit('set-url-hash', '');
      eventRouter.emit('big-cursor-show');
      eventRouter.emit('editor-hideAndUnfocus');
    }
    liveCodeLabCore.updateCode(updatedCodeAsString);
  });

  /* runtime and compile-time error management //////////
  #/////////////////////////////////////////////////////
  # Two different types of errors are managed in
  # two slightly different ways.
  #
  # Compile-time errors are the errors such as an extra
  # comma being added, or an unbalanced parenthesis, or
  # in general any of the syntactic problems.
  # These errors are just reported and the
  # new borked program does *not* result in a new
  # draw Function, so the previous syntactically correct
  # program is kept as the draw Function. The editor
  # content is kept the same as the user is probably just
  # finishing to type something.
  # If the autocoder is active, the editor
  # undoes the change, which triggers in a recompilation.
  # So this undo/recompilation cycle results in eventually
  # a syntactically correct program being set as
  # the draw Function.
  #
  # Runtime errors are things such as calling a function
  # with invalid parameters, accessing a non-existing
  # field of an object, accessing a null or an undefined,
  # accessing a variable that is not defined anywhere.
  # Runtime errors cannot be caught at compile time (not in
  # general anyways) because they are syntactically correct
  # and doing analysis on runtime behaviour at compile time
  # is extremely difficult if not outright impossible.
  # For example one might want to try to figure out whether
  # all the called functions and all the referenced variables
  # actually exist. In practice though one might create
  # those variables at runtime depending on complex tests
  # on state of the system, so one cannot really figure out
  # at compile time whether all functions and variables will
  # actually be in place when the program runs. One could
  # carry out some clever checks in particular cases, but *in
  # general* it's an impossible thing to do.
  # So an "unstable" program might often pass the compile checks
  # and be turned into a new draw Function.
  # When the next frame runs (or at some point in one of the
  # next frames), the draw Function is run and
  # a runtime error is thrown. At this point what we just
  # want to do is to keep the editor contents the same (because
  # user might be just finishing to type something) and we
  # just swap the current draw Function with a previous draw
  # Function that seemed to be stable, so that the animation
  # in the background doesn't stop. Note again that there is no
  # guarantee that just because a function was stable in the
  # past that it might still be stable now. For example the old
  # stable function might do silly things in the new state
  # that has been changed/borked in the meantime.
  # Or just simply a stable Function might
  # eventually do some silly things on its own, for example
  # it might do an out-of bounds array reference as the frame
  # count is incremented. Since at the moment we keep
  # track of only one stable function at a time (rather than
  # a stack of the) in general one cannot guarantee
  # that the animation will keep going no matter what. It probably
  # will in most normal cases though.
  # When the autocoder is active, a runtime error *does not* swap
  # the current function for an old stable one. Doing so
  # causes some bad interactions with the undoing of the
  # editor. Rather, the editor "undoes" its content,
  # which causes old content to be recompiled, and this
  # undo/recompile cycle carries on until a
  # syntactically-correct version of the program can be
  # established as the draw Function. If this new version still
  # throws a runtime error, the editor "undoes" again, until a
  # program that is both syntactically correct and stable
  # is found.
  */
  eventRouter.addListener('runtime-error-thrown', e => {
    eventRouter.emit('report-runtime-or-compile-time-error', e);
    if (autocoder.active) {
      editor.undo();
    } else {
      liveCodeLabCore.runLastWorkingProgram();
    }
  });

  eventRouter.addListener('compile-time-error-thrown', e => {
    eventRouter.emit('report-runtime-or-compile-time-error', e);
    if (autocoder.active) {
      editor.undo();
    }
  });

  eventRouter.addListener('clear-error', () => ui.clearError());

  // create this binding before the sounds are loaded
  eventRouter.addListener('all-sounds-loaded-and tested', () =>
    ui.soundSystemOk()
  );

  /*****************************************************
   * Phase 5- Kick-off the system and start of the
   * animation loop. Events will start
   * being triggered from here on.
   *****************************************************/
  liveCodeLabCore.paintARandomBackground();
  liveCodeLabCore.startAnimationLoop();
  editor.showAndFocus();

  // check if the url points to a particular demo,
  // in which case we load the demo directly.
  // otherwise we do as usual.
  if (!urlRouter.urlPointsToDemoOrTutorial()) {
    setTimeout(() => liveCodeLabCore.playStartupSound(), 650);
    bigCursor.turnBlinkingOn();
  }

  setTimeout(() => programLoader.kickOff(), 650);
}

start();
