L = require 'launchpad-webmidi'

ROWS = 9

class Launchpad

  constructor: () ->
    @pad = null
    @reset()

  reset: () ->
    if @pad?
      @pad.reset(2)
    @state = []
    for i in [0..ROWS]
      @state[i] = new Array(ROWS)

  setPad: (pad) ->
    @pad = pad
    @pad.reset(2)
    @pad.on('key', @onKey.bind(@))

  safeScope: (scope, name, funk) ->
    parent = @
    scope.addFunction(name, (...args) ->
      if parent.pad
        funk(...args)
      else
        0
    )

  addToScope: (scope) ->
    parent = @
    @safeScope(scope, 'asd', () ->
      255
    )
    @safeScope(scope, 'lpd', (y, x) ->
      return parent.pad.isPressed([x, y]);
    )
    @safeScope(scope, 'lps', (y, x) ->
      return parent.state[y][x]
    )

  onKey: (key) ->
    if key.y == 7 and key.x == 8
      @reset()
      return

    console.log('key ', key[0], key[1], key.pressed)

    if key.pressed
      new_state = if @state[key.y][key.x] then 0 else 1
      @state[key.y][key.x] = new_state

      if new_state
        color = @pad.green
      else
        color = @pad.red

      @pad.col(color, [[key.x, key.y]])


MkLaunchpad = () ->
  l = new Launchpad()

  pad = new L.default()
  pad.connect().then(() ->
    l.setPad(pad)
  )

  return l

module.exports = MkLaunchpad
