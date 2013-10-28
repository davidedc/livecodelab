Livecodelab-website
===================

Just the website for LiveCodeLab (website at: http://livecodelab.net/ ). Nothing to follow or star in here, you probably want to take a look at the proper LiveCodeLab code here: https://github.com/davidedc/livecodelab

What's with that "play" directory?
==================================

That's a submodule, i.e. it's a directory that cotains a specific version of the livecodelab repo (where the actual livecodelab engine is). To update to the latest version:

```git submodule foreach git pull origin master```
