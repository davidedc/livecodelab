Livecodelab Grunt Setup
=====================

If you just want to use LiveCodeLab, you only need to browse to [livecodelab.net](http://livecodelab.net).
For modifying LiveCodeLab though one needs to set up the Grunt-based build system.

Setup
-----

For a sample installation *from scratch* (assuming a clean fresh new Ubuntu install) please
check the install.sh script in the ubuntuInstallScript directory.

More in general, to setup the build system:

 * Make sure you have NodeJS and NPM installed and on your path.
 * Install grunt globally with npm.
   `npm install -g grunt`
 * Use npm to get all the dependencies.
   `npm install`
 * Run the grunt build task to compile all the coffee script files and templates
   into the dist folder.
   `grunt build`
 * You can now use the grunt connect task to serve the contents of the dist folder.
   `grunt connect`
 * Browse to [localhost:8000](http://localhost:8000/) in your browser and you should have
   LiveCodeLab load up. Browsing to [localhost:8000/index-dev.html](http://localhost:8000/index-dev.html)
   will give you the un-minified version, which will be more useful for development.

Documentation
-------------

If you want to build the docs, then make sure that Pygments is installed.
Pygments is a python library used by the documentation system in order to
convert markdown-style comments to html.

With that done, just run `grunt docs` to build to *dist/docs*, use the `grunt connect`
command to start a server, then browse to  [localhost:8000/docs](http://localhost:8000/docs).

Other Commands
--------------

 * `grunt watch` will look for changes to the coffee script files and recompile them when they occour.

