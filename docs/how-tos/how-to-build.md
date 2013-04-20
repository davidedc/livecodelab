Livecodelab Grunt Setup
=====================

There isn't any need to install anything to just use LiveCodeLab.
For modifying LiveCodeLab though one needs to set up the
Grunt-based build system.

#### Setup ####

For a sample installation (assuming a fresh new Ubuntu install) please
check the install.sh script in the ubuntuInstallScript directory.

More in general, to setup the build system:

 * Make sure you have NodeJS and NPM installed
 * Install grunt locally and grunt-cli globally. Please check the Grunt
   website for great instructions on how to do so.
 * Install java if not installed. Please check the java website on
   how to do so.
 * use npm to get all the dependencies ```sudo npm install```
 * install coffee-contrib-copy module  ```npm install grunt-contrib-copy```
 * make sure that Pygments is installed. Pygments is a python
   library used by the documentation system in order to
   convert markdown-style comments to html.
 * make sure that coffeescript is installed. Please check the
   coffeescript website for information.
 * install coffedoc module ```npm install -g coffeedoc```

#### Use ####

 * From your livecodelab directory run ```grunt compile``` . A fresh new indexMinified.html is baked for you,
 * ...or run ```grunt docs``` for new docs,
 * ...or run ```grunt clean``` to clean the build files.
 * You can use jitter to automatically translate the .coffee files - which is fine for testing changes using the non-minified version of livecodelab, just do ```npm install -g jitter``` and then ```jitter --bare coffee/ js/translatedFromCoffescript/coffee/```
