###
## Extend the Number prototype
## This needs to stay globally defined
## @param func
## @param scope [optional]
###

# Note that this also handles the
# cases where user wants to
# bind a variable e.g.
#   3 times with i box
# which is transformed into
#
#   3.times (i) -> box
#
# which coffeescript then transforms in the
#
# valid program:
#  3..times(function(i) {
#    return box;
#  });

Number::timesWithVariable = (func, scope) ->
  v = @valueOf()
  i = 0

  while i < v
    func.call scope or window, i
    i++

Number::times = (func, scope) ->
  v = @valueOf()
  i = 0

  while i < v
    func()
    i++

