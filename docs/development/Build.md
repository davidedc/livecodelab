# Livecodelab Development Setup

If you just want to use LiveCodeLab, you only need to browse to [livecodelab.net](http://livecodelab.net).
For modifying LiveCodeLab though one needs to set up the build system. The project uses webpack to build everything, and has a few npm scripts setup already to do it.

## Setup

To setup the build system:

 * Download LiveCodeLab by either downloading [the zip file from Github](https://github.com/davidedc/livecodelab/archive/master.zip) or by using a git client.
 * Make sure you have NodeJS installed and on your path - see [NodeJS download page](http://nodejs.org/download/).
 * Use npm to get all the dependencies.
   `npm install`
 * See below depending on what sort of build you want to do.

## Serving and running LCL

If you want to do development work on LCL with the aim of messing around or contributing back to the project, then really all you need to do is use the dev server to run it locally. This uses the *webpack-dev-server* and so has hot-reloading of code all setup.

 * Run `npm run serve`.
 * Browse to [localhost:8080](http://localhost:8080/) in your browser and you should have LiveCodeLab running.

## Building

If you actually want the bundled js, html and audio files, then you need to do a full build. Depending on wether this needs to be optimised, or still for development, there are two options.

 * Dev Build: This will build everything required to use LiveCodeLab, but will have various debugging settings turned on to make development easier.
   `npm run devbuild`
 * Full release build: Will be more optimised.
   `npm run build`

## Testing

Tests can be run with `npm test`. This will run a series of unit tests against the language parser and interpreter.

## Documentation

Documentation is available by first running the following:

 * `npm run docs`
 * `npm run docs:src`

Then just open the file `dist/docs/index.html` (which will link to all the other docs).

