Functional aspects
==============

LiveCodeLang itself supports higher-order functions. We show some examples straight from the familiar functional programming toolbox.

Higher-order-function support
----------
A simple example of higher-order-function support is:

```
either = (a,b) ->
    if random > 0.5 then a() else b()
either <box>, <peg>
```

which presents a flickering box/cylinder on screen. Note the compact “<>” notation for anonymous functions without bindings.

Also note how simply users can invent their own DSLs:

```
above  = <move 0,-0.5,0>
box above ball above peg
```

More complex examples
---------
LiveCodeLang accepts most CoffeeScript programs. Although not a purely functional language, CoffeeScript exposes the very same well-known JS functional constructs such as map, filter, reduce, (all three available in ECMAScript 5.1 standard). So all of the followings are valid programs.

Using map:

```
// multiple concentric boxes
noFill
[1..4].map (i) -> box i
```
Another map example:
```
// equivalent to “rotate box line peg”
[<box>, <line>, <peg>].map (i) -> rotate i
```
Example of filter:
```
// draws random combinations of primitives
primitives = [<box>,<line>,<peg>,<ball>]
selected = primitives.filter (x) ->
    random > 0.5
selected.map (i) -> i()
```
Example of reduce:
```
// equivalent to
// “rotate(->scale(->box(->undefined))”
commands = [<box>,<scale>,<rotate>]
drawThis = commands.reduce (acc,x) -> -> x(acc)
drawThis()
```
Also reduceRight is supported:
```
// either a ball moving around a box
// or a box moving around a ball
pieces = [<box>, <move>,<ball>]
if random > 0.5
    drawThis = pieces.reduce (acc,x) -> -> x(acc)
else
    drawThis = pieces.reduceRight (acc,x) -> -> x(acc)
drawThis()
```
Combining filter and reduce:
```
// draw a cube with a random mix of transformations
transforms = [<rotate>, <scale>, <fill blue>]
randomTran = transforms.filter (x) -> random > 0.5
drawThis = [<box>].concat randomTran
drawThisFunction = drawThis.reduce (acc,x) -> -> x(acc)
drawThisFunction()
```