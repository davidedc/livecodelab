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

