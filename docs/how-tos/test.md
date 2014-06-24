Testing Livecodelab and adding tests
===================

There are currently two suites of tests in LCL.

Code translator tests
---------------------

* Open Livecodelab
* Open Javascript console and type:
```testPreprocessor()```
or, to run a subset (useful for bisection in case something goes wrong):
```testPreprocessor(rangeMin, rangeMax)```
* Tests can be added in code-preprocessor-tests.coffee (run ```grunt watch``` to re-build the tests on the fly, after the on-the-fly build just reload LCL and repeat)

Visual tests
--------------

* Open the test page (depending on server configuration, this might be in http://localhost:8000/tests.html )
* Tests can be added in testsSource.coffee (run ```grunt watch``` to re-build the tests on the fly, after the on-the-fly build just reload LCL and repeat)
