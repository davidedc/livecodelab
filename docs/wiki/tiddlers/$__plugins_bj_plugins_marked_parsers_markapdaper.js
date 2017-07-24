/*\
title: $:/plugins/bj/plugins/marked/parsers/markapdaper.js
type: application/javascript
module-type: parser

to support inclusions
\*/

(function(){

var marked = require("$:/plugins/bj/plugins/marked/markdown.js");

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var PostMd = function(type,text,options) {
	var opts;
	if (!!options) {opts = options.parserrules;}
	this.tree = [{type: "raw", html: marked(text,opts)}];
};

exports["text/x-markdown"] = PostMd;

})();

