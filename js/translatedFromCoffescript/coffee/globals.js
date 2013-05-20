/*
## Extend the Number prototype
## This needs to stay globally defined
## @param func
## @param scope [optional]
*/
Number.prototype.times = function(func, scope) {
  var i, v, _results;

  v = this.valueOf();
  i = 0;
  _results = [];
  while (i < v) {
    func.call(scope || window, i);
    _results.push(i++);
  }
  return _results;
};

window.back = function() {};

window.forward = function() {};

window.close = function() {};
