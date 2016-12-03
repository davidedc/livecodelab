/* global THREE */
/* -------------------------------------------------------------------------
//  Blend two textures with special "paint over" mode
//  [Davide Della Casa] modified so that when mixRatio is 1 then
//  an overlap is done that continuously paints over the old scene.
//  It took around two years to find a solution of having both
//  the paintOver AND a nice motion blur.
//  This shader is very messy and could do with a bit of cleaning
//  Note that this is a combination of the classic pre-existing
//  blend shader (when mixRatio != 1.0) and a previous custom shader.
//  The branching isn't too bad because it's done on a uniform,
//  so the compiler probably optimises that as a simple combination
//  of the two branches (both branches are executed).
//  Luckily the original 'blend' branch is very fast, and the other
//  one can be simplified further.
//  ------------------------------------------------------------------------- */

THREE.LCLBlendShader = {

  uniforms: {

    tDiffuse1: { value: null },
    tDiffuse2: { value: null },
    mixRatio:  { value: 0.5 },
    opacity:   { value: 1.0 }

  },

  vertexShader: [

    'varying vec2 vUv;',

    'void main() {',

      'vUv = uv;',
      'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}'

  ].join('\n'),

  fragmentShader: [

    'uniform float opacity;',
    'uniform float mixRatio;',

    'uniform sampler2D tDiffuse1;',
    'uniform sampler2D tDiffuse2;',

    'varying vec2 vUv;',

    'void main() {',

      'vec4 texel1 = texture2D( tDiffuse1, vUv );',
      'vec4 texel2 = texture2D( tDiffuse2, vUv );',

      'if (mixRatio == 1.0) {',

        'vec3 ca = vec3(texel1.x,texel1.y,texel1.z);',
        'vec3 cb = vec3(texel2.x,texel2.y,texel2.z);',

        'float alphaa = texel1.w ;',
        'float alphab = texel2.w * mixRatio;',
        'float alphao = (alphaa + alphab * (1.0 - alphaa));',
        'vec3 co = (1.0/alphao) * (ca * alphaa + cb * alphab * (1.0 - alphaa));',
        'vec4 mixxx = vec4(co, alphao );',

        'gl_FragColor =  mixxx;',

      '} else {',

        'gl_FragColor = opacity * mix( texel1, texel2, mixRatio );',

      '}',

    '}'

  ].join('\n')

};
