/*\
title: $:/plugins/livecodelab/lcldoc/wrapper.js
type: application/javascript
module-type: parser

Display lcldoc yaml files

\*/
(function() {
  'use strict';

  var jsyaml = require('$:/plugins/livecodelab/lcldoc/js-yaml.min.js');
  var lcldoc = require('$:/plugins/livecodelab/lcldoc/lcldoc.js');

  var LCLDocParser = function(type, text, options) {
    var docData = jsyaml.load(text);
    this.tree = lcldoc.format(docData);
  };

  exports['application/lcldoc'] = LCLDocParser;
})();
