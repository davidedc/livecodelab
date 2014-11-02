###
## Init.js takes care of the setup of the whole environment up to
## cruise speed
###


requirejs.config(
  paths:
    'underscore': 'lib/underscore.min'
    'codemirror': 'lib/codemirror'
    'coffeescript': 'lib/coffee-script'
    'codemirror-lcl-mode': 'lib/coffeescript-livecodelab-mode'
    'sooperfish-easing': 'lib/jquery.easing-sooper'
    'jquery': 'lib/jquery.min'
    'simplemodal': 'lib/jquery.simplemodal.min'
    'sooperfish': 'lib/jquery.sooperfish'
    'mousewheel': 'lib/mousewheel'
    'pulse': 'lib/pulse'
    'threejs': 'lib/three.min'

    'Three.Detector': 'lib/three.js/Detector'
    'Three.ShaderExtras': 'lib/three.js/ShaderExtras'
    'Three.Stats': 'lib/three.js/Stats'

    # these two needed for the CanvasRenderer
    'Three.CanvasRenderer': 'lib/three.js/CanvasRenderer'
    'Three.Projector': 'lib/three.js/Projector'

    'Three.EffectComposer': 'lib/three.js/postprocessing/EffectComposer'
    'Three.MaskPass': 'lib/three.js/postprocessing/MaskPass'
    'Three.RenderPass': 'lib/three.js/postprocessing/RenderPass'
    'Three.SavePass': 'lib/three.js/postprocessing/SavePass'
    'Three.ShaderPass': 'lib/three.js/postprocessing/ShaderPass'

    #'three-resize': 'lib/threex/THREEx.WindowResize'

  packages: [
      name: 'LiveLangV1'
      location: 'languages/livelangv1'
      main: "main"
    ,
      name: 'LiveLangV2'
      location: 'languages/livelangv2'
      main: "main"
  ]

  shim:
    'codemirror':
      deps: []
      exports: 'CodeMirror'
    'coffeescript':
      deps: []
      exports: 'CoffeeScript'
    'codemirror-lcl-mode': ['codemirror']
    'sooperfish': ['jquery']
    'sooperfish-easing': ['jquery', 'sooperfish']
    'simplemodal': ['jquery']
    'mousewheel':
      deps: []
      exports: 'attachMouseWheelHandler'
    'pulse':
      deps: []
      exports: 'pulse'
    'threejs':
      deps: []
      exports: 'THREE'
    'Three.Detector':
      deps: ['threejs']
      exports: 'Detector'
    'Three.Stats':
      deps: ['threejs']
      exports: 'Stats'
    'Three.ShaderExtras': ['threejs']

    # these two needed for the CanvasRenderer
    'Three.CanvasRenderer': ['threejs']
    'Three.Projector': ['threejs']

    'Three.EffectComposer': ['threejs']
    'Three.MaskPass': ['threejs']
    'Three.RenderPass': ['threejs']
    'Three.SavePass': ['threejs']
    'Three.ShaderPass': ['threejs']
    #'three-resize':
    #  deps: ['threejs']
    #  exports: 'THREEx'
)


require [
  'lcl-init'
], (
  lcl
) ->

  #console.log('Live Code Lab Loaded')

