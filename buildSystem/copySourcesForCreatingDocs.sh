# comments-out all "use strict" strings
rm -R docs/deleteme/
mkdir docs/deleteme/
mkdir docs/deleteme/sourcesWithBlockComments
mkdir docs/deleteme/sourcesForDocco
cp -R coffee docs/deleteme/sourcesWithBlockComments
cp -R coffee docs/deleteme/sourcesForDocco
chmod -R 777 docs/deleteme/