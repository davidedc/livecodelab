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
while in LiveCodeLab, like in Ruby, there isn't. Any time a function name appears without arguments and parentheses, the function is implicitely called on the spot. Since all LiveCodeLab functions have a valid and interesting meaning when invoked without arguments, this is useful, as it means that one can write
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


";" can also be omitted between commands
-----------
Instead of writing...
```
box; move; line; move; peg; move
```
... one can just write:
```
box move line move peg move
```

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
If all functions are run as soon as they are mentioned, how can one use them without evaluating them? That's when LiveCodeLab *does* make things longer to type for you, and you'll have to use brackets, like in this example:
```
either = (a,b) -> if random > 0.5 then a() else b()
either <box>, <peg>
```
basically, instead of forcing you to parentheses to evaluate functions, LiveCodeLab forces you to use brackets to *avoid* the evaluation, so that the two functions "box" and "peg" can be passed to "either" as unevaluated functions as it's supposed to be.


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
rotate box # creates a spinning box
peg # not affected by rotate
```
basically, if a matrix transformation is followed by some primitives, LCL will interpret that as to mean that you want to apply the tranformation only to those primitives on the same line (up to the next semicolon).

Note that a transformation immediately followed by a semicolon indicates that the transformation is not chained to the ony primitives on the same line, but rather the transformation applies to the whole world as standard.
```
rotate; box # rotate is not chained to the box
peg # peg and anything following it are spinning
```


Some examples (scroll table to the right)
-----------


```
                                                     +                                                                       +
   LiveCodeLab                                       | Coffeescript                                                          | Javascript
+--------------------------------------------------------------------------------------------------------------------------------------------------------------+
                                                     |                                                                       |
 wave times rotate box                               |  wave().times -> rotate(); box()                                      | wave().times(function() {
                                                     |                                                                       | 		  rotate();
                                                     |                                                                       | 		  return box(); 
                                                     |                                                                       | 		});
+--------------------------------------------------------------------------------------------------------------------------------------------------------------+
                                                     |                                                                       |
 aCertainAmount = -> sin(random)                     | aCertainAmount = -> sin(random())                                     | var aCertainAmount;	
 move aCertainAmount box	                         | move aCertainAmount(); box()                                          | 	
                                                     |                                                                       | 		aCertainAmount = function() {
                                                     |                                                                       | 		  return sin(random());
                                                     |                                                                       | 		};
                                                     |                                                                       | 		
                                                     |                                                                       | 		move(aCertainAmount());
                                                     |                                                                       | 		
                                                     |                                                                       | 		box();
+--------------------------------------------------------------------------------------------------------------------------------------------------------------+
                                                     |                                                                       |
 2 times rotate box 2 times rotate line 2            |  (2+0).times -> rotate(); box(); (2+0).times -> rotate(); line 2      | 2.times(function() {
                                                     |                                                                       | 		  rotate();
                                                     |                                                                       | 		  box();
                                                     |                                                                       | 		  return 2.times(function() {
                                                     |                                                                       | 		    rotate();
                                                     |                                                                       | 		    return line(2);
                                                     |                                                                       | 		  }); 
                                                     |                                                                       | 		});
                                                     |                                                                       |
+--------------------------------------------------------------------------------------------------------------------------------------------------------------+
                                                     |                                                                       |
 either = (a,b) -> if random > 0.5 then a() else b() |  either = (a,b) -> if random()> 0.5 then a() else b() either box, peg |  var either;
 either <box>, <peg>		                         |  either(box, peg);                                                    |  		either = function(a, b) {
                                                     |                                                                       |  		  if (random() > 0.5) {
                                                     |                                                                       |  		    return a();
                                                     |                                                                       |  		  } else {
                                                     |                                                                       |  		    return b();
                                                     |                                                                       |  		  }
                                                     |                                                                       |  		};
 		                                             |                                                                       |
+--------------------------------------------------------------------------------------------------------------------------------------------------------------+
                                                     |                                                                       |
 20 times rotate box                                 | 20.times ->  rotate(); box()                                          |  20.times(function() {
                                                     |                                                                       |  		  rotate();
                                                     |                                                                       |  		  return box(); 
                                                     |                                                                       |  		});
                                                     |                                                                       |
+--------------------------------------------------------------------------------------------------------------------------------------------------------------+


		
```

Limitations and ambiguities
-----------
LiveCodeLab's "aggressive" euristics to shorten the typing are just that - euristics. They seem to work for us all the times, but if you run into trouble - just use short lines and use all the parentheses when needed. By doing so, LiveCodeLab won't have to do any guessing for you and will do exactly what you mean.

Also you might be under the impression that LiveCodeLab can guess any construct for you, for example
```
move box 2
```
as "move a box by 2", but really it's run as "move a box of size 2". You'll get to know how LiveCodeLab interprets things as you use it, but basically things are grouped to their left neighbours, starting from the right. So in the example above "2" would not tie up with the "move", but rather with the "box" to its left.
