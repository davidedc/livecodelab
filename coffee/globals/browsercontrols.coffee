# I'm going to put these here, difficult to say where they belong.
# In Firefox there
# is a window.back() function that takes you back to the previous page.
# The effect is that when one types "background", in the middle of the
# sentence the browser changes page.
# Re-defining it so that it causes no harm. This can be probably
# fixed a bit better once we'll have a scope dedicated to livecodelab code
# execution.
# Same applies to other functions below,
# to avoid tripping on them in the future.

window.back = ->

window.forward = ->

window.close = ->
