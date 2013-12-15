###
## Handles connections to different servers.
## For now that is only the pulse.js server.
###

define ['pulse'], (PulseEmpty) ->

    class Connections

        constructor: ->

            @pulseClient = new Pulse();
            @connectTimeoutHandle = null

            window.connect = (a) => @connect(a)


        connect: (address) ->

            if !(@pulseClient.connecting || @pulseClient.currentConnection() == @pulseClient.cleanAddress(address))
                console.log(@pulseClient.currentConnection())
                console.log(@pulseClient.cleanAddress(address))
                console.log 'Connecting to ' + address
                @pulseClient.connect address
            # pulse.connect address
            window.pulse = () => @pulseClient.pulse()
            window.beat = () => @pulseClient.beat()

            return

    Connections
