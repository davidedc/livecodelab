# remove the double hashes so only the normal comments and the block quotes remain.
perl -pi -w -e 's/## //g;' docs/deleteme/sourcesWithBlockComments/coffee/*.coffee docs/deleteme/sourcesWithBlockComments/coffee/**/*.coffee
#
# remove the block comments and turn them into single comments.
perl -pi -w -e 's/###//g;' docs/deleteme/sourcesForDocco/coffee/*.coffee docs/deleteme/sourcesForDocco/coffee/**/*.coffee
perl -pi -w -e 's/## /#/g;' docs/deleteme/sourcesForDocco/coffee/*.coffee docs/deleteme/sourcesForDocco/coffee/**/*.coffee