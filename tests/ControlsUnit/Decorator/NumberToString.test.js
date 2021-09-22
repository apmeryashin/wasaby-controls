define("ControlsUnit/Decorator/NumberToString.test", ["require", "exports", "chai", "Controls/decorator"], function (require, exports, chai_1, decorator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('Controls._decorator.numberToString', function () {
        it('should return 3450', function () {
            var result = decorator_1.numberToString(3.45e3);
            chai_1.assert.equal(result, '3450');
        });
        it('should return -0.00345', function () {
            var result = decorator_1.numberToString(-3.45e-3);
            chai_1.assert.equal(result, '-0.00345');
        });
        it('should exponential return 3450', function () {
            var exp = 3450;
            var result = decorator_1.numberToString(exp.toExponential(3));
            chai_1.assert.equal(result, exp.toString());
        });
        it('should exponential return -0.00345', function () {
            var exp = -0.00345;
            var result = decorator_1.numberToString(exp.toExponential(3));
            chai_1.assert.equal(result, exp);
        });
        it('should return 0', function () {
            var result = decorator_1.numberToString(0);
            chai_1.assert.equal(result, '0');
        });
    });
});
