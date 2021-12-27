import getFilterByFilterDescription from 'Controls/_filter/filterCalculator';
import {deepStrictEqual} from 'assert';

describe('filterCalculator', () => {
    it('filterDescription with value', () => {
        const filterDescription = [
            {
                name: 'test',
                value: []
            }
        ];
        deepStrictEqual(getFilterByFilterDescription({}, filterDescription), {test: []});
    });

    it('filterDescription with empty value', () => {
        const filterDescription = [
            {
                name: 'test',
                value: undefined
            }
        ];
        deepStrictEqual(getFilterByFilterDescription({}, filterDescription), {});
    });

    it('filterDescription with value and visibility: false', () => {
        const filterDescription = [
            {
                name: 'test',
                value: [],
                visibility: false
            }
        ];
        deepStrictEqual(getFilterByFilterDescription({}, filterDescription), {});
    });

    it('filterDescription with value and visibility: false', () => {
        const filterDescription = [
            {
                name: 'test',
                value: [],
                visibility: false
            }
        ];
        deepStrictEqual(getFilterByFilterDescription({}, filterDescription), {});
    });
});
