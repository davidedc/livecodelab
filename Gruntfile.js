/* grunt.js file */

module.exports = function (grunt) {

    'use strict';

    // Project configuration.
    grunt.initConfig({

        nodeunit: {
            files: ['langtests/**/*_test.js']
        },


        copy: {
            main: {
                files: [{
                    expand: true,
                    cwd: 'css/',
                    src: ['**'],
                    dest: 'dist/css'
                }, {
                    expand: true,
                    cwd: 'sound/',
                    src: ['**'],
                    dest: 'dist/sound'
                }, {
                    expand: false,
                    src: ['templts/tests.html.templt'],
                    dest: 'dist/tests.html'
                }, {
                    expand: true,
                    cwd: 'tests/lib/jasmine-1.3.1/',
                    src: ['**'],
                    dest: 'dist/test-page-files/jasmine/'
                }, {
                    expand: true,
                    cwd: 'tests/css/',
                    src: ['**'],
                    dest: 'dist/test-page-files/css/'
                }, {
                    expand: true,
                    cwd: 'tests/htmlsWithTests/images/',
                    src: ['**'],
                    dest: 'dist/test-page-files/images/'
                }, {
                    expand: true,
                    cwd: 'tests/js/',
                    src: ['**'],
                    dest: 'dist/test-page-files/js/'
                }, {
                    expand: true,
                    cwd: 'js_lib/',
                    src: ['**'],
                    dest: 'dist/js/lib'
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
                dest: 'dist/css/lcl.min.css',
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
                dest: 'dist/js/',
                ext: '.js',
                options: {
                    sourceMap: true,
                    bare: true
                }
            },
            tests: {
                expand: true,
                cwd: 'tests/testsSource/',
                src: ['*.coffee'],
                dest: 'dist/test-page-files/testsSource/',
                ext: '.js',
                options: {
                    bare: true,
                    preserve_dirs: true
                }
            }
        },
        watch: {
            scripts: {
                files: ['coffee/**/*.coffee', 'tests/js/*.js', 'tests/testsSource/*.coffee', 'templts/tests.html.templt', 'tests/htmlsWithTests/images/*.png'],
                tasks: ['coffee:app', 'coffee:tests', 'copy']
            },
            grammar: {
                files: ['grammar/**/*.jison'],
                tasks: ['jison', 'langtest']
            },
            interpreter: {
                files: ['js_lib/lcl/**/*.js'],
                tasks: ['copy:main', 'langtest']
            }
        },
        coffeelint: {
            lcl: ['coffee/*.coffee']
        },
        clean: {
            docs: [
                'dist/docs/'
            ],
            tests: [
                'dist/tests/js/testLiveCodeLab.js'
            ],
            build: [
                'dist/*'
            ]
        },
        targethtml: {
            main: {
                src: 'templts/index.html.templt',
                dest: 'dist/index.html'
            },
            dev: {
                src: 'templts/index.html.templt',
                dest: 'dist/index-dev.html'
            }
        },
        docco: {
            index: {
                src: [
                    'docs/index.md'
                ],
                options: {
                    output: 'dist/docs',
                    layout: 'linear'
                }
            },
            howtos: {
                src: [
                    'docs/how-tos/**/*.md'
                ],
                options: {
                    output: 'dist/docs/how-tos',
                    layout: 'linear'
                }
            },
            intros: {
                src: [
                    'docs/intros/**/*.md'
                ],
                options: {
                    output: 'dist/docs/intros',
                    layout: 'linear'
                }
            },
            source: {
                src: [
                    'coffee/**/*.coffee'
                ],
                options: {
                    output: 'dist/docs/source'
                }
            }
        },
        connect: {
            server: {
                options: {
                    port: 8000,
                    base: 'dist',
                    keepalive: true,
                    hostname: '*'
                }
            }
        },
        requirejs: {
            compile: {
                options: {
                    name: 'lcl-init',
                    baseUrl: 'dist/js/',
                    mainConfigFile: 'dist/js/rjs-init.js',
                    out: 'dist/js/lcl.min.js'
                }
            }
        },
        jison: {
            main: {
                options: {
                    moduleType: 'amd'
                },
                src: 'grammar/lcl-grammar.jison',
                dest: 'dist/js/lib/lcl/parser.js'
            }
        }
    });

    // Default task.
    grunt.registerTask('default', 'coffeelint');
    grunt.registerTask('lint', ['coffeelint', 'recess:lint']);

    grunt.registerTask('docs', [
        'clean:docs',
        'docco'
    ]);


    grunt.registerTask('build', [
        'clean:build',
        'coffee:app',
        'coffee:tests',
        'copy:main',
        'jison',
        'recess:compile',
        'requirejs',
        'targethtml'
    ]);

    grunt.registerTask('langtest', [
        'copy:main',
        'jison',
        'nodeunit'
    ]);

    // Load NPM Task modules
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-recess');
    grunt.loadNpmTasks('grunt-targethtml');
    grunt.loadNpmTasks('grunt-contrib-coffee');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-coffeelint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-docco');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-jison');

};
