###
## Extend the Number prototype
## This needs to stay globally defined
## @param func
## @param scope [optional]
###

Number::times = (func, scope) ->
  v = @valueOf()
  i = 0

  while i < v
    func.call scope or window, i
    i++

# handles the cases where user wants to
# bind a variable e.g.
# 3 times with i 
Number::timesWithVariable = (func, scope) ->
  v = @valueOf()
  i = 0

  f = func.call scope or window, i

  while i < v
    f.call scope or window, i
    i++