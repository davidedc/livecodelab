/* grunt.js file */

module.exports = function (grunt) {

    'use strict';

    var exec = require('exec');

    grunt.registerMultiTask('removeCopiedSourcesForDocs', 'Generate source documents from CoffeeScript files.', function () {
        var target = this.data.target,
            options = this.data.options || {},
            cmds = ['buildSystem/removeCopiedSourcesForDocs.sh'],
            done = this.async();

        exec(cmds, function (err, out, code) {
            if (code === 0) {
                grunt.log.ok(cmds.join(' '));
                grunt.log.ok('document created at ' + target);
            } else {
                grunt.fail.warn('If you want to using removeCopiedSourcesForDocs task. Please global install (option with -g) codo pakage from npm.');
            }
            done();
        });
    });


    grunt.registerMultiTask('beautifyCoffeedoc', 'Generate source documents from CoffeeScript files.', function () {
        var target = this.data.target,
            options = this.data.options || {},
            cmds = ['buildSystem/beautifyCoffeedoc.sh'],
            done = this.async();

        exec(cmds, function (err, out, code) {
            if (code === 0) {
                grunt.log.ok(cmds.join(' '));
                grunt.log.ok('document created at ' + target);
            } else {
                grunt.fail.warn('If you want to using beautifyCoffeedoc task. Please global install (option with -g) codo pakage from npm.');
            }
            done();
        });
    });

    grunt.registerMultiTask('copySourcesForCreatingDocs', 'Generate source documents from CoffeeScript files.', function () {
        var target = this.data.target,
            options = this.data.options || {},
            cmds = ['buildSystem/copySourcesForCreatingDocs.sh'],
            done = this.async();

        exec(cmds, function (err, out, code) {
            if (code === 0) {
                grunt.log.ok(cmds.join(' '));
                grunt.log.ok('document created at ' + target);
            } else {
                grunt.fail.warn('If you want to using copySourcesForCreatingDocs task. Please global install (option with -g) codo pakage from npm.');
            }
            done();
        });
    });

    grunt.registerMultiTask('putBackBlockComments', 'Generate source documents from CoffeeScript files.', function () {
        var target = this.data.target,
            options = this.data.options || {},
            cmds = ['buildSystem/putBackBlockComments.sh'],
            done = this.async();

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

    grunt.registerMultiTask('replaceBlockComments', 'Generate source documents from CoffeeScript files.', function () {
        var target = this.data.target,
            options = this.data.options || {},
            cmds = ['buildSystem/replaceBlockComments.sh'],
            done = this.async();

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
     * Task for crojsdoc. This one in theory generates nice documentation but
     * a) can't get it to output the docs where it should
     * b) only seems to generate docs for two files.
     */
    grunt.registerTask('crojsdoc', 'Generate source documents from CoffeeScript files.', function () {
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

        removeCopiedSourcesForDocs: {
            dist: {
                target: 'coffee'
            }
        },
        beautifyCoffeedoc: {
            dist: {
                target: 'coffee'
            }
        },
        copySourcesForCreatingDocs: {
            dist: {
                target: 'coffee'
            }
        },
        replaceBlockComments: {
            dist: {
                target: 'coffee'
            }
        },
        putBackBlockComments: {
            dist: {
                target: 'coffee'
            }
        },
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
        jsdoc: {
            dist: {
                src: ['js/*.js', 'js/**/*.js'],
                dest: 'docs/jsdoc'
            }
        },
        docco: {
            Js: {
                src: ['js/*/*.js'],
                options: {
                    output: 'docs/docco/'
                }
            },
            Coffee: {
                src: ['docs/deleteme/sourcesForDocco/**/*.coffee'],
                options: {
                    output: 'docs/docco/'
                }
            }
        },
        // currently not used, this is rather done
        // via invokation of a helper sh script
        // because I couldn't get crojsdoc to output
        // in a specific directory.
        crojsdoc: {
            dist: {
                target: 'docs/deleteme/sourcesWithBlockComments',
                options: {
                    o: './docs/crojsdoc/'
                }
            }
        },

        coffeedoc: {
            dist: {
                target: 'docs/deleteme/sourcesWithBlockComments',
                options: {
                    output: 'docs/coffeedoc',
                    parser: 'requirejs',
                    renderer: 'html'
                }
            }
        },
        copy: {
            fonts: {
                files: [{
                    expand: true,
                    cwd: 'css/fonts/',
                    src: ['**'],
                    dest: 'css_compiled/fonts/'
                }]
            },
            images: {
                files: [{
                    expand: true,
                    cwd: 'css/images/',
                    src: ['**'],
                    dest: 'css_compiled/images/'
                }]
            }
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
        coffee: {
            app: {
                expand: true,
                src: ['coffee/**/*.coffee'],
                dest: 'js/translatedFromCoffescript/',
                ext: '.js',
                options: {
                    bare: true,
                    preserve_dirs: true
                }
            },
            tests: {
                expand: true,
                cwd: 'tests/coffee/',
                src: ['*.coffee'],
                dest: 'tests/js/',
                ext: '.js',
                options: {
                    bare: true,
                    preserve_dirs: true
                }
            }
        },
        watch: {
            scripts: {
                files: ['coffee/**/*.coffee'],
                tasks: ['compile']
            }
        },
        concat: {
            dist: {
                src: [
                    'js/translatedFromCoffescript/coffee/globals/browsercontrols.js',
                    'js/translatedFromCoffescript/coffee/globals/numbertimes.js',
                    'js/translatedFromCoffescript/coffee/globals/requestAnimFrame.js',
                    'js/translatedFromCoffescript/coffee/globals/math.js',
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
                    'js/translatedFromCoffescript/coffee/background-painter.js',
                    'js/translatedFromCoffescript/coffee/editor/editor.js',
                    'js/translatedFromCoffescript/coffee/colour-functions.js',
                    'js/translatedFromCoffescript/coffee/matrix-commands.js',
                    'js/translatedFromCoffescript/coffee/graphics-commands.js',
                    'js/translatedFromCoffescript/coffee/program-runner.js',
                    'js/translatedFromCoffescript/coffee/code-transformer.js',
                    'js/translatedFromCoffescript/coffee/program-loader.js',
                    'js/translatedFromCoffescript/coffee/autocoder/autocoder.js',
                    'js/translatedFromCoffescript/coffee/text-dimming.js',
                    'js/translatedFromCoffescript/coffee/time-keeper.js',
                    'js/translatedFromCoffescript/coffee/blend-controls.js',
                    'js/translatedFromCoffescript/coffee/lights-commands.js',
                    'js/translatedFromCoffescript/coffee/ui.js',
                    'js/editor/mousewheel.js',
                    'js/editor/coffeescript-livecodelab-mode.js',
                    'js/browser-detection/bowser-2012-07-18.js',
                    'js/translatedFromCoffescript/coffee/init.js'
                ],
                dest: 'dist/built.js'
            }
        },
        coffeelint: {
            lcl: ['coffee/*.coffee']
        },
        clean: {
            docs: [
                'docs/docco/',
                'docs/codo/',
                'docs/coffeedoc/',
                'docs/crojsdoc/',
                'docs/deleteme/'
            ],
            build: [
                'dist/',
                'index-min.html',
                'js_compiled/Livecodelab-minified.js',
                'js/translatedFromCoffescript/',
                'css_compiled/'
            ],
            tests: [
                'tests/js/testLiveCodeLab.js'
            ]
        },
        targethtml: {
            min: {
                src: 'templts/index.html.templt',
                dest: 'index-min.html'
            },
            dev: {
                src: 'templts/index.html.templt',
                dest: 'index.html'
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
    grunt.registerTask('default', 'coffeelint');
    grunt.registerTask('lint', ['coffeelint', 'recess:lint']);

    // Doc generation task. We create the docs in two steps:
    // first from the js files and then from the coffee files.
    // This is because the js files compiled from the coffee files
    // don't preserve the comments of the coffee files. So we
    // re-write the docs generated from the (translated) js files
    // with the docs generated from the coffee files.
    grunt.registerTask('docs', [
        'clean:docs',
        'copySourcesForCreatingDocs',
        'replaceBlockComments',
        'docco:Js',
        'docco:Coffee',

        'coffeedoc',

        'beautifyCoffeedoc',
        'removeCopiedSourcesForDocs'
    ]);

    // Compilation task
    grunt.registerTask('compile', [
        'coffee:app',
    ]);

    grunt.registerTask('build', [
        'clean:build',
        'coffee:app',
        'coffee:tests',
        'concat',
        'closure-compiler',
        'copy',
        'recess:compile',
        'targethtml:min',
        'targethtml:dev'
    ]);


    // Load NPM Task modules
    grunt.loadNpmTasks('grunt-closure-compiler');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-recess');
    grunt.loadNpmTasks('grunt-targethtml');
    grunt.loadNpmTasks('grunt-contrib-coffee');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-coffeelint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-docco');
    process.stdout.write("\n\n\n\n");
    process.stdout.write("****************************************************************\n");
    process.stdout.write("* Note:\n");
    process.stdout.write("* You can use jitter to automatically translate\n");
    process.stdout.write("* the .coffee files - which is fine for testing\n");
    process.stdout.write("* changes using the non-minified version of livecodelab,\n");
    process.stdout.write("* (i.e. index.html, NOT index-min.html)\n");
    process.stdout.write("* just do:\n");
    process.stdout.write("*    npm install -g jitter \n");
    process.stdout.write("*    jitter --bare coffee/ js/translatedFromCoffescript/coffee/ \n");
    process.stdout.write("****************************************************************\n");
    process.stdout.write("\n\n\n\n");

};
