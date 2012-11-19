/* grunt.js file */

module.exports = function (grunt) {

    'use strict';

    // Project configuration.
    grunt.initConfig({
        lint: {
            all: ['js/**/*.js'],
            grunt: ['grunt.js'],
            test: ['js/menu.js']
        },
        recess: {
            lint: {
                src: ['css/**/*.css'],
                options: {
                    strictPropertyOrder: false,
                    noOverqualifying: false,
                    noUnderscores: false,
                    zeroUnits: false,
                    noIDs: false
                }
            },
            compile: {
                src: ['css/**/*.css'],
                dest: 'css_compiled/main.css',
                options: {
                    compile: true,
                    compress: true
                }
            }
        },
        jshint: {
            options: {
                browser: true
            }
        },
        concat: {
            dist: {
                src: [
                    'js/logger.js',
                    'js/autocoder/mclexer.js',
                    'js/vendor/three.js/Detector.js',
                    'js/vendor/three.js/Stats.js',
                    'js/vendor/threex/THREEx.WindowResize.js',
                    'js/vendor/three.js/ShaderExtras.js',
                    'js/vendor/three.js/postprocessing/EffectComposer.js',
                    'js/vendor/three.js/postprocessing/RenderPass.js',
                    'js/vendor/three.js/postprocessing/ShaderPass.js',
                    'js/vendor/three.js/postprocessing/MaskPass.js',
                    'js/vendor/three.js/postprocessing/SavePass.js',
                    'js/editor/coffeescript-livecodelab-mode.js',
                    'js/var-definitions.js',
                    'js/background-painting.js',
                    'js/editor/editor.js',
                    'js/from-processing.js',
                    'js/livecodelab.js',
                    'js/sound/sounddef.js',
                    'js/sound/sound-functions.js',
                    'js/sound/buzz.js',
                    'js/init.js',
                    'js/matrix-commands.js',
                    'js/geometry-commands.js',
                    'js/math.js',
                    'js/code-transformations.js',
                    'js/demos-and-tutorials.js',
                    'js/autocoder/autocode.js',
                    'js/text-dimming.js',
                    'js/lights-functions.js',
                    'js/init-threejs.js',
                    'js/editor/mousewheel.js',
                    'js/big-cursor-animation.js',
                    'js/menu.js'
                ],
                dest: 'dist/built.js'
            }
        },
        doccoh: {
            src: ['js/*.js',
                  'js/editor/*.js']
        },
        clean: {
            docs: ['docs/'],
            build: ['dist/*']
        },
        'closure-compiler': {
            frontend: {
                closurePath: 'buildSystem',
                js: 'dist/built.js',
                jsOutputFile: 'js_compiled/Livecodelab-minified.js',
                maxBuffer: 2000000,
                options: {
                    jscomp_off: [
                        'globalThis',
                        'checkTypes'
                    ],
                    language_in: 'ECMASCRIPT5_STRICT',
                    externs: [
                        'buildSystem/externs_common.js'
                    ]
                }
            }
        }
    });

    // Default task.
    grunt.registerTask('default', 'lint');

    // Doc generation task
    grunt.registerTask('docs', 'doccoh');

    // Compilation task
    grunt.registerTask('compile', 'clean:build concat closure-compiler recess:compile');

    // Load NPM Task modules
    grunt.loadNpmTasks('grunt-closure-compiler');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-doccoh');
    grunt.loadNpmTasks('grunt-recess');

};
