/* grunt.js file */

module.exports = function (grunt) {

    'use strict';

    var exec = require('exec');


    /**
     * Task for crojsdoc. This one in theory generates nice documentation but
     * a) can't get it to output the docs where it should
     * b) only seems to generate docs for two files.
     */
    grunt.registerMultiTask('crojsdoc', 'Generate source documents from CoffeeScript files.', function () {
        var target = this.data.target,
            options = this.data.options || {},
            cmds = ['buildSystem/crojsdocHelper.sh'],
            done = this.async();

        cmds.push(target);

        exec(cmds, function (err, out, code) {
            if (code === 0) {
                grunt.log.ok(cmds.join(' '));
                grunt.log.ok('document created at ' + target);
            } else {
                grunt.fail.warn('If you want to using codo task. Please global install (option with -g) codo pakage from npm.');
            }
            done();
        });
    });


    /**
     * Task for coffeedoc from https://gist.github.com/3596427
     */
    grunt.registerMultiTask('coffeedoc', 'Generate source documents from CoffeeScript files.', function () {
        var target = this.data.target,
            options = this.data.options || {},
            cmds = ['coffeedoc'],
            done = this.async();

        Object.keys(options).forEach(function (opt) {
            cmds.push('--' + opt + '=' + options[opt]);
        });
        
        cmds.push(target);

        exec(cmds, function (err, out, code) {
            if (code === 0) {
                grunt.log.ok(cmds.join(' '));
                grunt.log.ok('document created at ' + target);
            } else {
                grunt.log.ok(cmds.join(' '));
                grunt.fail.warn('If you want to using coffeedoc task. Please global install (option with -g) coffeedoc pakage from npm.');
            }
            done();
        });
    });

    /**
     * Task for codo
     */
    grunt.registerMultiTask('codo', 'Generate source documents from CoffeeScript files.', function () {
        var target = this.data.target,
            options = this.data.options || {},
            cmds = ['codo'],
            done = this.async();

        Object.keys(options).forEach(function (opt) {
            cmds.push('--' + opt.replace("_", "-") + '=' + options[opt]);
        });

        cmds.push(target);

        exec(cmds, function (err, out, code) {
            if (code === 0) {
                grunt.log.ok(cmds.join(' '));
                grunt.log.ok('document created at ' + target);
            } else {
                grunt.fail.warn('If you want to using codo task. Please global install (option with -g) codo pakage from npm.');
            }
            done();
        });
    });

    // Project configuration.
    grunt.initConfig({
				jsduck: {
						dist: {
								// source paths with your code
								src: ['js/*.js', 'js/**/*.js'],
				
								// docs output dir
								dest: 'docs/jsduck',
				
								// extra options
								options: {
										'builtin-classes': true,
										'warnings': ['-no_doc', '-dup_member', '-link_ambiguous'],
										'external': ['XMLHttpRequest']
								}
						}
				},
				jsdoc : {
						dist : {
								src: ['js/*.js', 'js/**/*.js'], 
								dest: 'docs/jsdoc'
						}
				},
        // currently not used, this is rather done
        // via invokation of a helper sh script
        // because I couldn't get crojsdoc to output
        // in a specific directory.
        crojsdoc: {
            dist: {
                target: 'coffee',
                options: {
                    o: './docs/crojsdoc/'
                }
            }
        },
        coffeedoc: {
            dist: {
                target: 'coffee',
                options: {
                    output: 'docs/coffeedoc',
                    parser: 'requirejs',
                    renderer: 'html'
                }
            }
        },
        codo: {
            dist: {
                target: 'coffee',
                options: {
                    output_dir: 'docs/codo',
                }
            }
        },
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
                src: ['coffee/**/*.coffee'],
                dest: 'js/translatedFromCoffescript/',
                options: {
                    preserve_dirs: true
                }
            },
            tests: {
                src: ['tests/coffee/**/*.coffee'],
                dest: 'tests/js/',
                options: {
                    preserve_dirs: false
                }
            }
        },
        concat: {
            dist: {
                src: [
                    'js/translatedFromCoffescript/coffee/livecodelab-core.js',
                    'js/translatedFromCoffescript/coffee/event-router.js',
                    'js/translatedFromCoffescript/coffee/parser.js',
                    'js/translatedFromCoffescript/coffee/url-router.js',
                    'js/translatedFromCoffescript/coffee/big-cursor.js',
                    'js/translatedFromCoffescript/coffee/autocoder/lexer.js',
                    'js/translatedFromCoffescript/coffee/sound/samplebank.js',
                    'js/translatedFromCoffescript/coffee/sound/sound-system.js',
                    'js/sound/buzz.js',
                    'js/translatedFromCoffescript/coffee/animation-loop.js',
                    'js/translatedFromCoffescript/coffee/threejs-system.js',
                    'js/translatedFromCoffescript/coffee/renderer.js',
                    'js/translatedFromCoffescript/coffee/colour-literals.js',
                    'js/three.js/Detector.js',
                    'js/three.js/Stats.js',
                    'js/threex/THREEx.WindowResize.js',
                    'js/three.js/ShaderExtras.js',
                    'js/three.js/postprocessing/EffectComposer.js',
                    'js/three.js/postprocessing/RenderPass.js',
                    'js/three.js/postprocessing/ShaderPass.js',
                    'js/three.js/postprocessing/MaskPass.js',
                    'js/three.js/postprocessing/SavePass.js',
                    'js/translatedFromCoffescript/coffee/globals.js',
                    'js/translatedFromCoffescript/coffee/background-painter.js',
                    'js/translatedFromCoffescript/coffee/editor/editor.js',
                    'js/translatedFromCoffescript/coffee/colour-functions.js',
                    'js/translatedFromCoffescript/coffee/matrix-commands.js',
                    'js/translatedFromCoffescript/coffee/graphics-commands.js',
                    'js/translatedFromCoffescript/coffee/math.js',
                    'js/translatedFromCoffescript/coffee/program-runner.js',
                    'js/translatedFromCoffescript/coffee/code-transformer.js',
                    'js/translatedFromCoffescript/coffee/program-loader.js',
                    'js/translatedFromCoffescript/coffee/autocoder/autocode.js',
                    'js/translatedFromCoffescript/coffee/text-dimming.js',
                    'js/translatedFromCoffescript/coffee/time-keeper.js',
                    'js/translatedFromCoffescript/coffee/blend-controls.js',
                    'js/translatedFromCoffescript/coffee/lights-commands.js',
                    'js/translatedFromCoffescript/coffee/ui.js',
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
                src: ['coffee/**/*.coffee'],
                options: {
                    output: 'docs/docco/'
                }
            },
        },
        clean: {
            docs: ['docs/docco/', 'docs/codo/', 'docs/coffeedoc/', 'docs/crojsdoc/'],
            build: ['dist/', 'indexMinified.html', 'js_compiled/Livecodelab-minified.js', 'js/translatedFromCoffescript/'],
            tests: ['tests/js/testLiveCodeLab.js']
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
    // first from the js files and then from the coffee files.
    // This is because the js files compiled from the coffee files
    // don't preserve the comments of the coffee files. So we
    // re-write the docs generated from the (translated) js files
    // with the docs generated from the coffee files.
    grunt.registerTask('docs', ' ', function () {
        // also generate these other two styles of documents for a class-view
        // of the coffeescript code.
        grunt.task.run('doccoh:Js');
        grunt.task.run('doccoh:Coffee');
        grunt.task.run('coffeedoc');
        grunt.task.run('codo');
    });

    // Compilation task
    grunt.registerTask('compile', 'clean:build coffee:app coffee:tests concat closure-compiler recess:compile targethtml:compile');

    // Load NPM Task modules
    grunt.loadNpmTasks('grunt-closure-compiler');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-doccoh');
    grunt.loadNpmTasks('grunt-recess');
    grunt.loadNpmTasks('grunt-targethtml');
    grunt.loadNpmTasks('grunt-coffee');
    // couldn't make these two to work
    //grunt.loadNpmTasks('grunt-contrib-jsdoc');
    //grunt.loadNpmTasks('grunt-jsduck');

    process.stdout.write("\n\n\n\n");
    process.stdout.write("****************************************************************\n");
    process.stdout.write("* Note:\n");
    process.stdout.write("* You can use jitter to automatically translate\n");
    process.stdout.write("* the .coffee files - which is fine for testing\n");
    process.stdout.write("* changes using the non-minified version of livecodelab,\n");
    process.stdout.write("* just do:\n");
    process.stdout.write("*    npm install -g jitter \n");
    process.stdout.write("*    jitter --bare coffee/ js/translatedFromCoffescript/coffee/ \n");
    process.stdout.write("****************************************************************\n");
    process.stdout.write("\n\n\n\n");

};
