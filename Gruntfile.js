/* grunt.js file */

module.exports = function (grunt) {

    'use strict';

    // Project configuration.
    grunt.initConfig({

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
                cwd: 'tests/coffee/',
                src: ['*.coffee'],
                dest: 'dist/tests/js/',
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
                tasks: ['coffee:app']
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
                    output: 'dist/docs/how-to',
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
        requirejs: {
            compile: {
                options: {
                    name: 'lcl-init',
                    baseUrl: 'dist/js/',
                    mainConfigFile: 'dist/js/rjs-init.js',
                    out: 'dist/js/lcl.min.js'
                }
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
        'copy:main',
        'recess:compile',
        'requirejs',
        'targethtml'
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

};
