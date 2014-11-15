Buffers Sizing
===============

Modern setups have made it rather difficult for a web app to automatically pick a good resolution to show 3d graphics. As an example, in 2014 high dpi screens can't be driven with 3d graphics at full resolution (or often heve half or quarter resolution), the graphic cards aren't just sized to drive 3d on all those pixels. Graphics cards are sized to handle big "desktop-ui-style" 2d graphics on big displays, but not necessarily equivalently-sized 3d graphics: 3d graphics a) require a lot more per-pixel calculations b) re-draw much larger areas of the screen at any frame c) are often subject to more overdraw.

The best way to handle this 'sizing' challenge would be to guess or test the power of the gpu, then decide a buffer size that can be fluently handled by the GPU, then just scale that buffer to cover the window.

This could be done to some degree, probably it would involve special "benchmarking" routines, or special guessing of the performance of the machine by running some brief JS benchmarks.

Our current approach is to:
1) conservatively use a 880x720 "reference" dimension that is easily handled by all modern graphic cards.
2) we stretch such buffer to fill the window IF WITHIN some maximum scaling factor (2. Which means 2x2 phisical pixels for each buffer pixel on normal displays, 4x4 on retina displays ). We don't want to exceed that as the result would be too blurry.
3) if the maximum scaling factor is exceeded, then we are forced to use a suitably bigger buffer.

This allows us to have the crispest easily-handled buffer dimension for a variety of screens and window dimensions that we tried. This doesn't guarantee good performance on huge screens. Should the need arise, we can bake-in a mechanism for that.