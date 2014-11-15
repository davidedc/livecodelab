/* grunt.js file */

module.exports = function (grunt) {

    'use strict';

    // Project configuration.
    grunt.initConfig({

        clean: {
            docs: [
                'dist/docs/'
            ],
            tests: [
                'dist/tests/js/testLiveCodeLab.js'
            ],
            build: [
                'dist/*',
                'build/',
            ]
        },


        copy: {

            // js libs get put into build/ so they
            // can be pulled in and minified by r.js
            preBuild: {
                files: [{
                    src: ['**'],
                    expand: true,
                    cwd: 'js_lib/',
                    dest: 'build/js/lib'
                },{
                    src: ['**'],
                    expand: true,
                    cwd: 'coffee/',
                    dest: 'build/js'
                },{
                    src: ['**'],
                    expand: true,
                    cwd: 'css/',
                    dest: 'build/css'
                }]
            },

            // test files need to be copied into build dir
            // before coffee script is compiled
            tests: {
                files: [{
                    expand: true,
                    cwd: 'tests/lib/jasmine-1.3.1/',
                    src: ['**'],
                    dest: 'build/test-page-files/jasmine/'
                }, {
                    expand: true,
                    cwd: 'tests/css/',
                    src: ['**'],
                    dest: 'build/test-page-files/css/'
                }, {
                    expand: true,
                    cwd: 'tests/htmlsWithTests/images/',
                    src: ['**'],
                    dest: 'build/test-page-files/images/'
                }, {
                    expand: true,
                    cwd: 'tests/js/',
                    src: ['**'],
                    dest: 'build/test-page-files/js/'
                }]
            },

            // Apparently this needs to be on its own to work properlly
            buildTimeOptions: {
                src: 'build-time-options/languages-build-option.js',
                dest: 'build/js/globals/languages-build-option.js',
                options: {
                  process: function (content, srcpath) {
                    var setting = (grunt.option('language') || 'both');
                    return content.replace(
                        /language_setting/mgi,
                        setting
                    );
                  }
                }
            },
            // development build puts in dist :-
            // unminified js files
            // original coffeescript files
            // js -> coffee map files
            // all the css
            // all the tests
            development: {
                files: [{
                    src: ['**'],
                    expand: true,
                    cwd: 'build/css/',
                    dest: 'dist/css'
                }, {
                    src: ['**'],
                    expand: true,
                    cwd: 'build/js',
                    dest: 'dist/js'
                }, {
                    src: ['**'],
                    expand: true,
                    cwd: 'build/test-page-files',
                    dest: 'dist/test-page-files'
                }]
            },

            // release build only puts minified files into dist
            release: {
                files: [{
                    expand: true,
                    cwd: 'build/css/',
                    src: ['lcl.min.css'],
                    dest: 'dist/css'
                }, {
                    expand: true,
                    cwd: 'build/css/',
                    src: ['**', '**/!*.css'],
                    dest: 'dist/css'
                }, {
                    expand: true,
                    cwd: 'build/js/',
                    src: ['lcl.min.js'],
                    dest: 'dist/js'
                }, {
                    expand: true,
                    cwd: 'build/js/lib',
                    src: ['require.js'],
                    dest: 'dist/js/lib'
                }]
            },

            testHtml: {
                expand: false,
                src: ['templts/tests.html.templt'],
                dest: 'dist/tests.html'
            },

            sounds: {
                src: ['**'],
                expand: true,
                cwd: 'sound/',
                dest: 'dist/sound'
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
                dest: 'build/css/lcl.min.css',
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
                dest: 'build/js/',
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
                dest: 'build/test-page-files/testsSource/',
                ext: '.js',
                options: {
                    bare: true,
                    preserve_dirs: true
                }
            }
        },
        targethtml: {
            main: {
                src: 'templts/index.html.templt',
                dest: 'dist/index.html'
            },
            dev: {
                src: 'templts/index.html.templt',
                dest: 'dist/index.html'
            }
        },
        requirejs: {
            compile: {
                options: {
                    name: 'lcl-init',
                    baseUrl: 'build/js/',
                    mainConfigFile: 'build/js/rjs-init.js',
                    out: 'build/js/lcl.min.js'
                }
            }
        },
        jison: {
            main: {
                options: {
                    moduleType: 'amd'
                },
                src: 'grammar/lcl-grammar.jison',
                dest: 'build/js/lib/lcl/parser.js'
            }
        },

        // Testing tasks
        nodeunit: {
            files: ['langtests/**/*_test.js']
        },

        // Docs tasks
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

        // Misc useful tasks
        coffeelint: {
            lcl: ['coffee/*.coffee']
        },
        "git-describe": {
            "options": {
                template: "Current commit: {%=object%}{%=dirty%}"
            },
            "your_target": {
                // Target-specific file lists and/or options go here.
            },
        },
        watch: {
            scripts: {
                files: [
                    'coffee/**/*.coffee',
                    'tests/js/*.js',
                    'tests/testsSource/*.coffee',
                    'templts/tests.html.templt',
                    'tests/htmlsWithTests/images/*.png'
                ],
                tasks: ['coffee:app', 'coffee:tests', 'copy']
            },
            lcllang: {
                files: ['grammar/**/*.jison', 'langtests/**/*.js'],
                tasks: ['langtest']
            },
            interpreter: {
                files: ['js_lib/lcl/**/*.js', 'langtests/**/*.js'],
                tasks: ['copy:main', 'langtest']
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
        }
    });


    // Default task.
    grunt.registerTask('default', 'coffeelint');
    grunt.registerTask('lint', ['coffeelint', 'recess:lint']);

    grunt.registerTask('docs', [
        'clean:docs',
        'docco'
    ]);

    grunt.registerTask('gitinfo', function () {
        grunt.event.once('git-describe', function (rev) {

            grunt.file.write('dist/version.json', JSON.stringify({
                revision: [rev.object, rev.dirty].join(''),
                date: grunt.template.today()
            }));

        });
        try {
          grunt.task.run('git-describe');
        }
        // if user downloaded the release from github
        // using the shiny button instead of cloning,
        // like I often do, then git-describe would
        // fail, we catch that case here.
        catch (err) {
            grunt.file.write('dist/version.json', JSON.stringify({
                revision: 'no revision given',
                date: 'no date given'
            }));
        }
    });

    grunt.registerTask('releasebuild', [
        'clean:build',
        'copy:preBuild',
        'copy:buildTimeOptions',

        'jison',

        'coffee:app',

        'recess:compile',
        'requirejs',

        'targethtml:main',
        'copy:sounds',
        'copy:release',
        'gitinfo'
    ]);

    grunt.registerTask('devbuild', [
        'clean:build',
        'copy:preBuild',
        'copy:tests',
        'copy:buildTimeOptions',

        'jison',

        'coffee:app',
        'coffee:tests',

        'targethtml:dev',
        'copy:sounds',
        'copy:development',
        'copy:testHtml'
    ]);

    grunt.registerTask('langtest', [
        'copy:preBuild',
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
    grunt.loadNpmTasks('grunt-git-describe');

};
