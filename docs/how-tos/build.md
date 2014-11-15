Livecodelab Grunt Setup
=====================

If you just want to use LiveCodeLab, you only need to browse to [livecodelab.net](http://livecodelab.net).
For modifying LiveCodeLab though one needs to set up the Grunt-based build system.

Setup
-----

For a sample installation *from scratch* (assuming a clean fresh new Ubuntu install) please check the install.sh script in the ubuntuInstallScript directory.

More in general, to setup the build system:

 * Download LiveCodeLab by either downloading [the zip file from Github](https://github.com/davidedc/livecodelab/archive/master.zip) or by using a git client.
 * Make sure you have NodeJS installed and on your path - see [NodeJS download page](http://nodejs.org/download/).
 * Install grunt globally with npm (most probably requires admin rights - so some sort of sudo there).
   `npm install -g grunt`
 * Use npm to get all the dependencies.
   `npm install`
 * Check whether you have "grunt" installed by typing.
   `grunt`
   If you get an error, then do (again probably with admin rights):
   `npm install -g grunt-cli`
 * You need to run a full-build at this point (first bullet point in the "Building" section below).

Building
--------------

There are few options for building:

 * Full release build: run the grunt build task to compile all the coffee script files and templates into the dist folder. Does a whole lot of consolidation and minification of files.
   `grunt releasebuild`
 * Quicker: dev build (doesn't do as much consolidation and minification): run `grunt devbuild`.
 * Quickest: "on the fly" dev build (after you run the full-build once, this just recompiles the changes as soon as they are saved): run `grunt watch`.

Serving and running LCL
--------------

 * Once you have a build you can now use the grunt connect task to serve the contents of the dist folder.
   `grunt connect`. (but you could use any webserver).
 * Browse to [localhost:8000](http://localhost:8000/) in your browser and you should have
   LiveCodeLab load up.

Building for a particular language
--------------

In case the user wants to use a specific language implementation, she can specify so:
 * `grunt build --language=v1` builds with v1 language only
 * `grunt build --language=v2` builds with v2 language only
 * `grunt build --language=both` (same as `grunt build`) builds leaving the option for both languages selectable from menu.

Documentation
-------------

Documentation is available by first running the following:

 * `grunt docco:index`
 * `grunt docco:howtos`
 * `grunt docco:intros`
 * `grunt docco:source`

Then just open the file `dist/docs/index.html` (which will link to all the other docs).
If you have the `grunt connect` server running, then just browse to  [localhost:8000/docs](http://localhost:8000/docs).

