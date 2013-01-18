# comments-out all "use strict" strings
perl -pi -w -e 's/"use strict"/#"use strict"/g;' coffee/**/*.coffee coffee/*.coffee
# generates coffedoc
coffeedoc --output=docs/coffeedoc --parser=requirejs --renderer=html coffee
# adds again the "use strict" strings
perl -pi -w -e 's/#"use strict"/"use strict"/g;' coffee/**/*.coffee coffee/*.coffee