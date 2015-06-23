/*global define */

var funcs = {};

// takes a nested tree structure of function
// args and turns it into a flat list
funcs.functionargs = function (argtree) {

    var arg, tree, output;

    output = [];
    tree = argtree;

    while (true) {
        arg = tree[0];
        if (arg === undefined) {
            break;
        }
        output.push(arg);
        if (tree[1] === undefined) {
            break;
        }
        tree = tree[1];
    }

    return output;

};

funcs.createChildScope = function (parentScope) {
    return Object.create(parentScope);
};

module.exports = funcs;

