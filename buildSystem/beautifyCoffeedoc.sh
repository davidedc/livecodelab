# remove the double hashes so only the normal comments and the block quotes remain.
perl -pi -w -e 's/>docs\/deleteme\/sourcesWithBlockComments\/coffee\//>/g;' docs/coffeedoc/index.html

