# comments-out all "use strict" strings
perl -pi -w -e 's/#>/###/g;' coffee/**/*.coffee coffee/*.coffee
