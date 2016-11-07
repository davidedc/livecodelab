Dive-in examples
================

The simplest program a user can write in LiveCodeLab is:

```
box
```
This will create a cube of unit size in the middle of the screen. Note how LiveCodeLab follows the Fluxus way of default drawing primitives in the middle of the screen (as opposed to Processing, where the world coordinates and camera arrangement cause the equivalent command to draw a cube at the top-left corner).  A slightly more interesting scene can be created by using the *rotate* command.
```
rotate
box
```
Here the cube will rotate freely, still centred on screen.

There are two things to note about these programs. First, both *box* and *rotate* are functions that optionally take parameters, but the "no parameters" default gives an interesting behaviour already. In the example above, *rotate* without parameters animates a continuous rotation (as opposed to rotating the world of a specific amount when parameters are passed). Secondly, these programs will run as soon as they are typed in. LiveCodeLab uses an "aggressive" execution model: whenever there is a change to the program, the environment will immediately attempt to read and interpret it. If the program is valid, then LCL will run it until it further edits are made.

LiveCodeLab has borrowed ideas liberally from Processing, many of the keywords and constructs are immediately recognizable:
```
background red
rotate
stroke green
noFill
box
fill white
ball
```
Just like in Processing, the colour and matrix commands immediately affect the graphic state, so the above program will result in a white ball with green strokes, positioned in the centre of the green vertices of a cube, all rotating in front of a red background.

It is also possible to use all matrix and colour commands with block scoping (note how indentation is significant).
```
fill green
rotate // only affects indented parts
    box
    fill red // only affects ball
        ball
box // unaffected by “rotate” and red fill
```
This program will display a green rotating box, a red rotating sphere and a fixed green box. The user is also free to inline graphic state commands and primitives, and in-lining implies "nested scoping down the line", so the above snippet works exactly the same:
```
fill green
rotate box fill red ball
box // unaffected by “rotate” and red fill
```
Finally, LiveCodeLab allows the use of loops to iterate over a block of commands:
```
5 times
    rotate
    box
```
or the similar version that supports binding of a variable:
```
5 times with i
    rotate
    box i // nested boxes, i is the scale
```
This will create five cubes, all rotating at different speeds (the rotation is compounded at each loop iteration, just like it would in Processing). Note that in this latter case only the biggest “encasing” box is visible (they are opaque by default), and one of inner boxes isn’t even drawn since its scale is zero ("times" index starts at zero).


Principles
----------

LiveCodeLab does not require parentheses for calling functions. Arguments to a function need to be separated by commas, and a function will consume all arguments to the right.

```
box 1, 2, 3
```

Parentheses do need to be used when arguments to a function could be considered ambiguous. For example if we have a function called *addOne*, which takes a single number argument and adds 1 to it, and we call the following:
```
box addOne 1, 1, 1
```
then the *box* function would actually be called with a single argument, which would be the result of *addOne being called with three arguments. To disambiguate this, parentheses can be used to make it clear that `addOne 1` is a single expression.
```
box (addOne 1), 1, 1
```

Indentation
-----------

LiveCodeLab uses a similar syntax to Coffeescript, which means that indentation matters. A minimal example of this concept is:

```
if true
    box 1, 2, 3
```

...the indentation under the if is important to tell which parts are affected by the condition.

End of line symbols are not needed
----------------------------------
Instead of writing...
```
box; move; line; move; peg; move
```
... one can just chain together the commands like so
```
box move line move peg move
```

Since End of line symbols are not needed and they add significant complexity to the parser, semicolons are actually not allowed in LCL sketches.

*times*
-------
instead of writing
```
for i in [1..5]
  do something
```
one can write:
```
5 times
  do something
```
or also
```
5 times do something
```

If a loop variable is needed, then this can be added after the times.
```
5 times with i
    box i
```

Lazy expression evaluation
--------------------------

If all functions are run as soon as they are mentioned, how can one use them without evaluating them? LiveCodeLab uses angle brackets to denote an expression that should not be immediately evaluated.

For example:
```
either = (a,b) -> if random > 0.5 then run a else run b
either <box>, <peg>
either <box 2>, <peg 2>
```

In this case, the *box* and *peg* functions 


"Scoped" matrix transformations
-------------------------------
In processing, if one wants to apply transformation(s) to only some primitive(s), one does:
```
pushMatrix();
[transformation(s) here]
[primitive(s) here]
popMatrix();
```
indeed this also works in LiveCodeLab, but LiveCodeLab adds another coincise notation to scope the transformations, by simplt indenting the block one wants to be affected, e.g.
```
rotate 1,2 # this rotate only applies to the indented block below
  box
  [more primitives here]
```
or also
```
scale 1 # has no effect other than creating the "scope" below
  [any series of transformations here]
  box
  [more primitives here]
```
These "scoped" matrix transformations can also be nested.

Super-short "Scoped" matrix transformations
-----------
If one wants to apply a transformation to only a primitive or two, just inline it all like so:
```
rotate box line # creates a box and a line, both spinning
peg # not spinning
```
basically, if a matrix transformation is followed by some primitives, LCL will interpret that as to mean that you want to apply the tranformation only to those primitives on the same line (up to the end of the line).

Omitting some color commands
-----------
Often time LiveCodeLab can infer variations of color commands invokations. For example instead of writing

```
rotate fill red box
```

one can write

```
rotate red fill box
```

or, more simply:

```
rotate red box
```


Limitations and ambiguities
===========
LiveCodeLab's "aggressive" euristics to shorten the typing are just that - euristics. They seem to work for us all the times, but if you run into trouble - just use short lines and use all the parentheses when needed. By doing so, LiveCodeLab won't have to do any guessing for you and will do exactly what you mean.

Also you might be under the impression that LiveCodeLab can guess any construct for you, for example
```
move box 2
```
as "move a box by 2", but really it's run as "move a box of size 2". You'll get to know how LiveCodeLab interprets things as you use it, but basically things are grouped to their left neighbours, starting from the right. So in the example above "2" would not tie up with the "move", but rather with the "box" to its left.


Implementation
==============
LiveCodeLab programs go through a process of source-to-source translation to CoffeScript, with subsequent translation to JS, and evaluation via “native” JS runtime.

The source translation is obtained by applying rewriting rules.
The matching of the rewriting rules is done via regexes.
The obtained CoffeeScript source is then passed to the CoffeeScript compiler for transformation to JS, and then evaluated via the JS runtime.
