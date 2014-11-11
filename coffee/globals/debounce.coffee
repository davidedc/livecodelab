# Returns a function, that, as long as it continues to be invoked, will not
# be triggered. The function will be called after it stops being called for
# N milliseconds. If `immediate` is passed, trigger the function on the
# leading edge, instead of the trailing.

# this function taken from:
# http://coffeescriptcookbook.com/chapters/functions/debounce

# this is used for example when rebuilding/resizing the
# rendering pipeline when the window is resized.
# it's not healthy to just do that in realtime as the
# window is resized, it bothers the browser.
# So giving it some slack and doing it when "at rest"
# rather than multiple times consecutively during the
# resizing.

debounce = (func, threshold, execAsap) ->
  timeout = null
  (args...) ->
    obj = this
    delayed = ->
      func.apply(obj, args) unless execAsap
      timeout = null
    if timeout
      clearTimeout(timeout)
    else if (execAsap)
      func.apply(obj, args)
    timeout = setTimeout delayed, threshold || 100