import isFilterItemChanged from 'Controls/_filter/Utils/isFilterItemChanged';
import {ok} from 'assert';

describe('filterCalculator', () => {
    it('filterDescription with value equal resetValue', () => {
        const filterDescriptionItem = {
            name: 'test',
            value: [],
            resetValue: []
        };
        ok(!isFilterItemChanged(filterDescriptionItem));
    });

    it('filterDescription with value', () => {
        const filterDescriptionItem = {
            name: 'test',
            value: ['test'],
            resetValue: []
        };
        ok(isFilterItemChanged(filterDescriptionItem));
    });
});
