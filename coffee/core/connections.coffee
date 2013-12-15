###
## Handles connections to different servers.
## For now that is only the pulse.js server.
###

define ['pulse'], (PulseEmpty) ->

    class Connections

        constructor: ->

            @pulseClient = new Pulse();
            @connectTimeoutHandle = null

        addToScope: (scope) ->

          scope.add('connect', (a) => @connect(a))
          scope.add('pulse',   () => @pulse())
          scope.add('beat',    () => @beat())

        pulse: () ->
          0

        beat: () ->
          0

        connect: (address) ->

            if !(@pulseClient.connecting || @pulseClient.currentConnection() == @pulseClient.cleanAddress(address))
                console.log(@pulseClient.currentConnection())
                console.log(@pulseClient.cleanAddress(address))
                console.log 'Connecting to ' + address
                @pulseClient.connect address
            # pulse.connect address
            @pulse = @pulseClient.pulse()
            @beat = @pulseClient.beat()

            return

    Connections
