
var funcs = {};

funcs.exists = function (val) {
    return ((val !== undefined) && (val !== null));
};

funcs.createChildScope = function (parentScope) {
    return Object.create(parentScope);
};

module.exports = funcs;

