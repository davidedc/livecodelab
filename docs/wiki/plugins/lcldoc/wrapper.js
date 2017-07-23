/*\
title: $:/plugins/livecodelab/lcldoc/wrapper.js
type: application/javascript
module-type: parser

Display lcldoc yaml files

\*/
(function() {
  'use strict';

  var jsyaml = require('$:/plugins/livecodelab/lcldoc/js-yaml.min.js');

  function formatDoc(docData) {
    return [{ type: 'text', text: docData.name }];
  }

  var LCLDocParser = function(type, text, options) {
    var docData = jsyaml.load(text);
    this.tree = formatDoc(docData);
  };

  exports['application/lcldoc'] = LCLDocParser;
})();
