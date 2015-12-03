Livecodelab Grunt Setup
=====================

If you just want to use LiveCodeLab, you only need to browse to [livecodelab.net](http://livecodelab.net).
For modifying LiveCodeLab though one needs to set up the build system.

Setup
-----

More in general, to setup the build system:

 * Download LiveCodeLab by either downloading [the zip file from Github](https://github.com/davidedc/livecodelab/archive/master.zip) or by using a git client.
 * Make sure you have NodeJS installed and on your path - see [NodeJS download page](http://nodejs.org/download/).
 * Use npm to get all the dependencies.
   `npm install`
 * You need to run a full-build at this point (first bullet point in the "Building" section below).

Building
--------

LiveCodeLab uses *npm* for running it's build operations. Have a look at the scripts section of the _package.json_ file to see all of them. The following are the most useful commands though.

 * Dev Build: This will build everything required to use LiveCodeLab, but will have various debugging settings turned on to make development easier.
   `npm run devbuild`
 * Full release build: Will be much the same as the Dev Build, but without the debugging.
   `npm run prodbuild`

Once the build process has been run once, it is possible to have automated builds run whenever the code is changed, using `npm run watch-js`.

Serving and running LCL
-----------------------

 * Once you have a build you can now use the serve task to serve the contents of the dist folder.
   `npm run serve`. (but you could use any webserver).
 * Browse to [localhost:8080](http://localhost:8080/) in your browser and you should have
   LiveCodeLab load up.

Documentation
-------------

Documentation is available by first running the following:

 * `npm run docs`
 * `npm run docs:src`

Then just open the file `dist/docs/index.html` (which will link to all the other docs).
If you have the `grunt connect` server running, then just browse to  [localhost:8000/docs](http://localhost:8000/docs).

