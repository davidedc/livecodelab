// log() – A lightweight wrapper for console.log
// There are a few things that a console.log wrapper can and should do:
//  - Prevent errors if a console isn't around (i.e. IE)
//  - Maintain a history of logs, so you can look in the past if your console is added afterwards (e.g. firebug lite)
//  - Normalize the browser differences in console integration (e.g. when passing multiple arguments into console.log())
//  - For something you type regularly, make it quicker to type for the lazy among us.

// usage: log('inside coolFunc',this,arguments);
// http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function(){
  log.history = log.history || [];   // store logs to an array for reference
  log.history.push(arguments);
  if(this.console){
    console.log( Array.prototype.slice.call(arguments) );
  }
};
