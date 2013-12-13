Overview
------

LiveCodeLab uses a similar syntax to Coffeescript, which fundamentally means that it's space-sensitive (i.e. indentation matters) and also that parentheses in function invocations can be avoided in many cases. A minimal example of both concepts is:

```
if true
  box 1, 2, 3
```

...the indentation under the if is important to tell which parts are affected by the condition, and the parentheses in the 'box' invocation can be omitted.

Most of the coffeescript syntax can be used, however LiveCodeLab uses some euristics to make many short constructs a lot quicker to express and to type. For example "()" can be omitted all the times, and sequences of commands will almost always be disambiguated and interpreted correctly. The specifics follow.


"()" can be omitted
-----
In coffeescript there is a difference between writing
```
box
```
and writing
```
box()
```
while in LiveCodeLab, like in Ruby, there isn't. Any time a "known" function name (e.g. any LiveCodeLab function and any user-defined function) appears without arguments and parentheses, the function is implicitely called on the spot. Since all LiveCodeLab functions have a valid and interesting meaning when invoked without arguments, this is useful, as it means that one can write
```
box
move
line
move
peg
```
and get a sketch going, without having to add any parentheses.

LiveCodeLab can do this "implicit invocation" for you for the LiveCodeLab commands and also for the names that you use directly in your function declarations, like in:
```
aCertainAmount = -> sin(random)
move aCertainAmount box
```

LiveCodeLab can't do this for functions that aren't "known" LiveCodeLab functions or user-defined.

For example, the following function takes a function and runs it.

```
runAFunction = (a) -> a()
```

In this case, ```a()``` needs to include the parentheses, as ```a``` could be a number, or a function, or a string, or anything, so LiveCodeLab needs to be explicitely told what to do with ```a```.



";" is not needed
-----------
Instead of writing...
```
box; move; line; move; peg; move
```
... one can just chain together the commands like so
```
box move line move peg move
```
Since semicolons are not needed (we used none outside of strings comments and regexes in the LiveCodeLab source) and they add significant complexity to the parser, semicolons are actually not allowed in LCL sketches.

"times"
------
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

What about functional programming?
-----------
If all functions are run as soon as they are mentioned, how can one use them without evaluating them?

Passing a function is done just like coffeescript, the following works:

```
runAFunction = (a) -> a()
runAFunction ->box
```

Note that if you want to pass multiple functions, then you need to wrap each one in parentheses, this is due to arrows (legitimally) taking priority over the comma (argument separator) in coffeescript.

```
either = (a,b) -> if random > 0.5 then a() else b()
either (->box), (->peg)
either (->box 2), (->peg 2)
```

There is also a shorthand for this, using brackets:


```
either = (a,b) -> if random > 0.5 then a() else b()
either <box>, <peg>
either <box 2>, <peg 2>
```

basically, instead of forcing you to parentheses to evaluate functions, LiveCodeLab forces you to use parentheses/brackets to *avoid* the evaluation, so that the two functions "box" and "peg" can be passed to "either" as unevaluated functions.


"Scoped" matrix transformations
-----------
In processing, is one wants to apply transformation(s) to only some primitive(s), one does
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


Limitations and ambiguities
-----------
LiveCodeLab's "aggressive" euristics to shorten the typing are just that - euristics. They seem to work for us all the times, but if you run into trouble - just use short lines and use all the parentheses when needed. By doing so, LiveCodeLab won't have to do any guessing for you and will do exactly what you mean.

Also you might be under the impression that LiveCodeLab can guess any construct for you, for example
```
move box 2
```
as "move a box by 2", but really it's run as "move a box of size 2". You'll get to know how LiveCodeLab interprets things as you use it, but basically things are grouped to their left neighbours, starting from the right. So in the example above "2" would not tie up with the "move", but rather with the "box" to its left.
