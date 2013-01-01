/* grunt.js file */

module.exports = function (grunt) {

    'use strict';

    // Project configuration.
    grunt.initConfig({
        lint: {
            all: ['js/**/*.js'],
            grunt: ['grunt.js']
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
				coffee: {
							app: {
								src: ['coffee/*.coffee'],
								dest: 'js/'
							}
				},
        concat: {
            dist: {
                src: [
                    'js/livecodelab-core.js',
                    'js/events.js',
                    'js/simple-error-checker.js',
                    'js/url-router.js',
                    'js/big-cursor-animation.js',
                    'js/autocoder/mclexer.js',
                    'js/sound/samplebank.js',
                    'js/sound/sound-system.js',
                    'js/sound/buzz.js',
                    'js/animation-loop.js',
                    'js/init-threejs.js',
                    'js/renderer.js',
                    'js/colour-definitions.js',
                    'js/three.js/Detector.js',
                    'js/three.js/Stats.js',
                    'js/threex/THREEx.WindowResize.js',
                    'js/three.js/ShaderExtras.js',
                    'js/three.js/postprocessing/EffectComposer.js',
                    'js/three.js/postprocessing/RenderPass.js',
                    'js/three.js/postprocessing/ShaderPass.js',
                    'js/three.js/postprocessing/MaskPass.js',
                    'js/three.js/postprocessing/SavePass.js',
                    'js/globals.js',
                    'js/background-painting.js',
                    'js/editor/editor.js',
                    'js/colour-functions.js',
                    'js/matrix-commands.js',
                    'js/graphic-primitives.js',
                    'js/math.js',
                    'js/draw-function-runner.js',
                    'js/code-transformations.js',
                    'js/demos-and-tutorials.js',
                    'js/autocoder/autocode.js',
                    'js/text-dimming.js',
                    'js/time-keeper.js',
                    'js/blend-style.js',
                    'js/lights-functions.js',
                    'js/ui.js',
                    'js/browser-detection/bowser-2012-07-18.js'],
                dest: 'dist/built.js'
            }
        },
        doccoh: {
            Js: {
							src: ['js/*.js',
										'js/editor/*.js'],
							options: {
										output: 'docs/docco/'
							}
            },
            Coffee: {
							src: ['coffee/*.coffee'],
							options: {
										output: 'docs/docco/'
							}
            },
        },
        clean: {
            docs: ['docs/docco/'],
            build: ['dist/', 'indexMinified.html', 'js_compiled/Livecodelab-minified.js']
        },
        targethtml: {
            compile: {
                src: 'index.html',
                dest: 'indexMinified.html'
            }
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
                        'checkTypes'],
                    language_in: 'ECMASCRIPT5_STRICT',
                    externs: [
                        'buildSystem/externs_common.js']
                }
            }
        }
    });

    // Default task.
    grunt.registerTask('default', 'lint');

    // Doc generation task. We create the docs in two steps:
    // first from the js files and then fro, the coffee files.
    // This is because the js files compiled from the coffee files
    // don't preserve the comments of the coffee files. So we
    // re-write the docs generated from the (translated) js files
    // with the docs generated from the coffee files.
    grunt.registerTask('docs', 'doccoh:Js doccoh:Coffee');

    // Compilation task
    grunt.registerTask('compile', 'clean:build coffee concat closure-compiler recess:compile targethtml:compile');

    // Load NPM Task modules
    grunt.loadNpmTasks('grunt-closure-compiler');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-doccoh');
    grunt.loadNpmTasks('grunt-recess');
    grunt.loadNpmTasks('grunt-targethtml');
    grunt.loadNpmTasks('grunt-coffee');

};
