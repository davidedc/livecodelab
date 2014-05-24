
require [
   'languages/livelangv1/compiler'
  ,'languages/livelangv1/runner'
], (
   compiler
  ,runner
) ->

  {compiler: compiler, runner: runner}

