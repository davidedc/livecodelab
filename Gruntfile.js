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
            },
            jslibs: {
                files: [{
                    expand: true,
                    cwd: 'js_lib/',
                    src: ['**'],
                    dest: 'js/lib'
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
                cwd: 'coffee/',
                src: ['**/*.coffee'],
                dest: 'js/',
                ext: '.js',
                options: {
                    sourceMap: true,
                    bare: true
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
            tests: [
                'tests/js/testLiveCodeLab.js'
            ],
            require: [
                'index.html',
                'index-min.html',
                'js',
                'js_compiled',
                'css_compiled'
            ]
        },
        targethtml: {
            main: {
                src: 'templts/index.html.templt',
                dest: 'index.html'
            },
            dev: {
                src: 'templts/index.html.templt',
                dest: 'index-dev.html'
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
        },
        requirejs: {
            compile: {
                options: {
                    name: 'lcl-init',
                    baseUrl: 'js/',
                    mainConfigFile: 'js/rjs-init.js',
                    out: 'js_compiled/lcl-min.js'
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


    grunt.registerTask('build', [
        'clean:require',
        'coffee:app',
        'copy',
        'recess:compile',
        'requirejs',
        'targethtml'
    ]);


    // Load NPM Task modules
    grunt.loadNpmTasks('grunt-closure-compiler');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-recess');
    grunt.loadNpmTasks('grunt-targethtml');
    grunt.loadNpmTasks('grunt-contrib-coffee');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-coffeelint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-docco');
    grunt.loadNpmTasks('grunt-contrib-requirejs');

};
