/*global define */

var ProgramData = function (data) {
    this.program = data;
    this.pos = 0;
};

ProgramData.prototype.pop = function () {
    var c;
    if (this.pos >= this.program.length) {
        c = null;
    } else {
        c = this.program[this.pos];
        this.pos += 1;
    }
    return c;
};

ProgramData.prototype.unpop = function () {
    this.pos -= 1;
    if (this.pos < 0) {
        this.pos = 0;
    }
};

ProgramData.prototype.peek = function () {
    var c;
    if (this.pos >= this.program.length) {
        c = null;
    } else {
        c = this.program[this.pos];
    }
    return c;
};

module.exports = ProgramData;

