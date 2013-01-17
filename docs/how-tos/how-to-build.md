Livecodelab Grunt Setup
=====================

#### Setup ####

To get setup with Grunt should be pretty easy.

 * Make sure you have NodeJS and NPM installed
 * Install Grunt globally ```npm install -g grunt```
 * use npm to get all the dependencies ```npm install```
 * install coffedoc module ```npm install coffeedoc```
 * install codo module ```npm install codo```

#### Use ####

 * From your livecodelab directory run ```grunt compile``` . A fresh new indexMinified.html is baked for you,
 * ...or run ```grunt docs``` for new docs,
 * ...or run ```grunt clean``` to clean the build files.
 * You can use jitter to automatically translate the .coffee files - which is fine for testing changes using the non-minified version of livecodelab, just do ```npm install -g jitter``` and then ```jitter --bare coffee/ js/translatedFromCoffescript/coffee/```
