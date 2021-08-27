import {assert} from 'chai';
import {numberToString} from 'Controls/decorator';

describe('Controls._decorator.numberToString', () => {
    it('should return 3450', () => {
        const result = numberToString(3.45e3);
        assert.equal(result, '3450');
    });

    it('should return -0.00345', () => {
        const result = numberToString(-3.45e-3);
        assert.equal(result, '-0.00345');
    });

    it('should exponential return 3450', () => {
        const exp = 3450;
        const result = numberToString(exp.toExponential(3));
        assert.equal(result, exp.toString());
    });

    it('should exponential return -0.00345', () => {
        const exp = -0.00345;
        const result = numberToString(exp.toExponential(3));
        assert.equal(result, exp);
    });

    it('should return 0', () => {
        const result = numberToString(0);
        assert.equal(result, '0');
    });
});
