###
## Handles connections to different servers.
## For now that is only the pulse.js server.
###

define ['pulse'], (pulse) ->

	class Connections

		constructor: ->
			# It's really ugly to define this here. But where do?
			@pulse = pulse
			window.connect = (a) => @connect(a)

		# The issue with this connect function is that
		# it always needs to be wrapped in a doOnce. 
		# The user might understand why, but there is NO 
		# situation where you would want to execute it every frame.
		# So there is probably a cleaner way to avoid repeated execution.
		connect: (address) ->
			console.log address
			pulse.connect address
			window.pulse = @pulse.pulse()
			window.beat = @pulse.beat()

	Connections
