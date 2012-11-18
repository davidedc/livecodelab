Performance considerations i.e. how to get 60 fps.
==============

If LiveCodeLab is not running at 60 fps there could be 3 limiting factors. Here is a description of those possible bottlenecks with solutions/workarounds.

1. **CPU/memory**. It could be that the running program does a lot of calculations or creates/destroys a lot of memory. For example it might be creating and initialising long arrays 30 times per second. The solution in this case is to slim down the program, or to use a browser with a fast and efficient javascript implementation.
2. **Geometry**. This is the case where complex meshes are frequently changed, or several thousands of objects (even if of very small size) are placed in the scene. LiveCodeLab gives only a handful of meshes and caches them, but one could still create scenes with several thousands object. Possible solutions:
 - try to reduce the detail levels e.g. using ballDetail
 - omit drawing models that are too small to be visible
 - omit drawing models that are occluded by other models (inside them or behind them)
 - draw fewer objects
3. **Fill**. This is when there is a lot of painting going on in the screen or lots of surfaces in the scene. This usually happens when there are too many objects, but note that one could hit this bottleneck before hitting the "geometry" bottleneck, especially when the objects have big surface areas such as in the case of big browser window size. As an example, one can bring fps down by drawing a few screen-wide balls on a big screen area (say, a 27 inches external monitor). You can check whether this is the bottleneck by resizing the browser window (and restarting livecodelab) and noticing whether fps improves. If it does, then the "fill" is the bottleneck.
There are three possible solutions to the fill bottleneck:

          * confirm that the browser supports WebGl. Firefox and Chrome can support WebGL on many HW configurations, but even mainstream HW can sometimes lack support in some browser versions (e.g. macbook Airs). WebGL support on Linux systems is somewhat spotty, because of the point below:
          * confirm that your OS has drivers that support OpenGL ES > 2.0 hardware acceleration for your graphic card. Updating to recent OS versions and checking the site of your graphic card vendor for recent drivers might do the trick.
          *  reduce the number of pixels being drawn / surface extents in the scene. This can be achieved by either:

               - reducing the size of the models being painted on screen
               - reducing the size of the browser window (and restarting livecodelab)
               - reducing the size of the browser window and "zoom-in" - this can be done on macs by doing CTRL + mouse-scroll-up
               - reducing the resolution of the screen output
               - (note that on Chrome you can stretch the current browser tab to fill the screen. This will increase the area but keep the original resolution of your 3d context so the 3d context will have effectively less pixels density and the 3D graphics will appear somewhat blurry, but more fluid. Unfortunately though, contrarily to the 3d context, the text editor will bump-up its own size to match the extended area, so note that in this "stretched mode" the fps suffers when the text editor is visible)
