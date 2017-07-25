# Performance considerations i.e. how to get 60 fps.

If LiveCodeLab is not running at least at 40 fps there could be 3 limiting factors. Here is a description of those possible bottlenecks with solutions/workarounds.

1. **Low-power devices**. For example we've noticed that on Chrome on Macbook Air, requestAnimationFrame doesn't "serve" more than 30 fps even for very "light" scenes (e.g. one line). This is likely an explicit sw constraint, probably because of battery/heat management. Same on some tablets. This could be worked around by triggering the frames via timeouts rather than requestAnimationFrame (but this setting is not currently exposed to the user). Or maybe via some settings in the browser (unknown to us at the moment).
2. **CPU/memory**. It could be that the running program does a lot of calculations or creates/destroys a lot of memory. For example it might be creating and initialising long arrays 30 times per second. The solution in this case is to slim down the program, or to use a browser with a fast and efficient javascript implementation.
3. **Geometry**. This is the case where thousands of objects (even if of very small size) are placed in the scene. Objects with complex meshes (such as spheres drawn with high detail) can be expecially heavy. Possible solutions:
 - try to reduce the detail level using ballDetail
 - omit drawing objects that are too small to be visible, off-screen or occluded by other objects (i.e. inside them or behind them)
 - draw fewer objects
4. **Fill**. This is when there is a lot of "surface extent" being painted on the screen. This usually happens when objects are drawn on a "big surface" i.e. in case of a big browser window size. You can check whether this is the bottleneck by resizing the browser window (and restarting livecodelab) and noticing whether fps improves. If it does, then the "fill" is the bottleneck. 
There are three possible solutions to the fill bottleneck:
 - confirm that the browser supports WebGl. Firefox and Chrome can support WebGL on many HW configurations, but even mainstream HW can sometimes lack support in some browser/OS versions. WebGL support on Linux systems is somewhat spotty, because of the point below:
 - confirm that your OS has drivers that support OpenGL ES > 2.0 hardware acceleration for your graphic card. Updating to recent OS versions and checking the site of your graphic card vendor for recent drivers might do the trick.
 - reduce the number of pixels being drawn / surface extents in the scene. This can be achieved by either:
     - on Retina Display macs, go to System Preferences -> Displays -> Scaled Resolution and set to "Larger Text"
     - reducing the size of the models being painted on screen
     - reducing the size of the browser window (and restarting livecodelab)
     - reducing the size of the browser window and "zoom-in" - this can be done on macs by doing CTRL + mouse-scroll-up
     - reducing the resolution of the screen output
     - (note that on Chrome you can stretch the current browser tab to fill the screen. This will increase the area but keep the original resolution of your 3d context so the 3d context will have effectively less pixels density and the 3D graphics will appear somewhat blurry, but more fluid. Unfortunately though, contrarily to the 3d context, the text editor will bump-up its own size to match the extended area, so note that in this "stretched mode" the fps suffers when the text editor is visible)
We made our best to size the buffers so that they should give good performance on recent machines. If you have an estreme case (you are driving a multi-screen setup or a 5K monitor from a low-power GPU) then get it touch with us, we could make a special build for you.
