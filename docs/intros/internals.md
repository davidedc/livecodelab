LiveCodeLab internals
==============

The four main states
-------------
As in all livecoding environments, there is a lot going on in LiveCodeLab (editing, graphics, sounds, housekeeping), apparently all at the same time. And yet LiveCodeLab is a single-threaded environment with four main states, where four groups of activities are independently performed at different intervals.

**Code editor update and translation/parsing.** LiveCodeLab is in this state every time (or soon afterwards) the program is edited, on keyboard/mouse events. Note that, although LiveCodeLab doesn’t pursue this solution at the moment, in theory code editor updates could trigger a separate Web Worker thread to do the translation/parsing rather than doing that immediately in the main thread. The details of the translation/parsing step are discussed in the next chapters.

**User-program running and graphics rendering.** This is done up to 60 times per second. Among other things, the user program builds the 3d scene and updates the data structures needed to playback the samples (more on this below). The running of the user program could, hypothetically speaking, be done at a different interval in a dedicated state separately from the actual 3d rendering. In practice though, it would be of little use to run the user program (which sets up the 3d scene) and then not rendering the scene right away.

**Samples playback.** All samples’ playbacks are triggered from a dedicated handler running at the interval specified by the bpm command (invoked in the last run of the user program). Starting the playback is a “fire and forget” asynchronous operation: once the playback is triggered the thread is free to move on and there is no follow-up.

**Autocoder.** Toggled by the user, it randomly changes the user code (live, in the editor) every second (see next section).

The Autocoder
---------
The Autocoder feature allows LiveCodeLab to programmatically rewrite/modify user programs while they are running, making live changes within the editor. The Autocoder is meant to be a tool to aid in exploration of the code, providing some degree of randomness, which may give rise to surprising results.

Currently the autocoding capability is fairly simple, confined largely to changing number values (separate changes for integers and floating point), colour names, primitive commands and matrix commands. The changes are random - they are not driven by any type of analysis of the program or its behaviour.

We are considering AST-based code analysis and edits that would allow for more interesting program changes, including perhaps code editing assistance and automatic composition.

Hot-swapping
--------
In LiveCodeLab the user program is updated while typed, there is no explicit “register” or “update” mode, no special trigger such as CTRL-enter or shift-enter, no "play button". This behaviour places LiveCodeLab at “level-4 liveness” in the Tanimoto liveness hierarchy.

At any moment, while being typed, the user program can either be statically correct or incorrect. In JavaScript and CoffeeScript static correctness roughly equals to correct syntax, as no type system checks are done for example. In some cases the program is statically correct but might perform “differently than expected” because of its transient state while being typed: we practically ignore this case as we consider such transient states as part of the “constructive” nature of the performance, and in our experience they don’t detract from its quality.

If the program is statically correct, it becomes a candidate for being run at animation speed (up to 60 times per second according to graphics/sound load and host system performance). If the program is not statically correct then it’s ignored and it’s not a candidate for running.

The second check is for runtime errors, for example an array boundary is exceeded or a non-existent function is called at some point - the sort of errors that in general can only be detected at runtime (note again that many checks that are normally performed at compile time in other languages can’t be done at compile time in JS/CoffeScript due to their dynamic nature).

Programs that fail at runtime need to be swapped-out with hopefully “sane” programs to avoid the performance from halting. To create this “safety net” against misbehaving user programs, these are kept in a "quarantine" state for the first few seconds of their runs. If the program runs without run-time errors during this quarantine period, then LiveCodeLab is going to judge it as stable and marks it as the “last stable program”. Whenever the subsequent program(s) fail (either at compile time or runtime), then this “last stable program” is brought up and run again, with the hope (but not the guarantee) that its good run-time behaviour in the past vouches for it to be a good stand-in.

Note that there is no guarantee that this fallback safety mechanism is going to work in general: scenarios can be easily constructed of user programs behaving well for the quarantine period and then failing afterwards. In practice though the hot-swapping mechanism adequately covers practically occurring cases. The most common case is when the user program invokes a function which name would be valid if it was typed-in in its entirety, but it’s actually invalid while being partially typed-in, as the prefix doesn’t match the name of any available function.

State(lessness) across frames and program edits
------------
The only state affecting the drawing and sound-playing in LiveCodeLab is a) the time in milliseconds since start of performance and b) the frame count. Note that the sources of randomness available to the user, i.e. the “random” and “noise” (Perlin noise) functions, can optionally be seeded based on a) and/or b) above.

The implication is that the previously described hot-swapping of programs can be done without worrying that there might be data structures to maintain or adapt when the user program changes. The user can obviously code her custom data-structures she might need, but all user-defined data structures are built afresh in each frame, which usually, for small/medium sized data structures, is not a problem. Alternatively the user can calculate only needed parts of data on-demand rather than larger sets of unneeded data.

An example of an inexpensive data structure that is built anew each frame is the “sample sequencer” patterns e.g.

```
play 'tranceKick', 'zxzx zzzx xzzz zzxx'
```

These patterns are expressed as strings, and the “play” command just stores them in an array (these are then used by the “sample playing” code that is run at an independent interval set by the “bpm” command). Although this storing of (often the same) patterns every frame is redundant, it constitutes no problem since the cost is negligible both in terms of time and memory.

A place where this “from scratch” approach is less than optimal is when building the 3d scene, as each frame discards the previous scene graph and creates a new one from zero - this is the same mechanism Processing uses in the “draw” loop for example. While it is true that the user could want to build an entirely different 3d scene each frame, that’s a worst-case scenario. Although some tree-matching techniques could be put in place to handle some recurrent cases (at least the cases where the tree doesn’t change or where only transformation nodes’ matrix need to be changed without altering the structure of the tree), it is not trivial in general to smartly update a scene graph when using the immediate mode paradigm, as there are no obvious handles to sub-trees that could in principle be referenced across frames for smart updates. (Note that in fact LiveCodeLab does not send the structured scene graph tree to the GPU, but this is beyond the scope of this paper).

To mitigate some cases where “from scratch” is too expensive of an approach, sometimes “backing” (behind-the-scenes) data structures are transparently handled so that costly operations are cached and only performed when needed. As an example, background painting is potentially an expensive operation (rendering of multiple semi-transparent gradients in a 2d Canvas context or via CSS is surprisingly expensive) and hence the background is repainted in its own separate layer only if its appearance actually needs updating rather than blindly being repainted with the same combination of colours over and over again in each frame. Redundant repainting is avoided by comparing new paint directives with the ones issued in the previous frame, stored in a dedicated data structure behind the scenes.

In summary: all graphics and sounds produced in/during each frame are a pure function of time and frame number, so much that LiveCodeLab could in principle expose a control to display the animation back in time, or backwards, or both.