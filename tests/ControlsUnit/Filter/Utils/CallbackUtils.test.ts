import {getChangedFilters, getItemOnFilterChangedCallback, getItemVisivbility} from 'Controls/_filter/Utils/CallbackUtils';
import {assert} from 'chai';

describe('Controls/_filter/Utils/CallbackUtils', () => {
    it('filters dont changed', () => {
        const currentFilter = {};
        const updatedFilter = {};
        assert.deepEqual(getChangedFilters(currentFilter, updatedFilter), {});
    });

    it('filters are changed', () => {
        const currentFilter = {test: 'firstValue'};
        const updatedFilter = {test: 'secondValue'};
        assert.deepEqual(getChangedFilters(currentFilter, updatedFilter), {test: 'secondValue'});
    });

    it('getItemOnFilterChangedCallback with needed value', () => {
        const updatedFilter = { value: 2 };
        const changedFilters = {
            testValue: 2
        };
        const item = {
            value: 1
        };
        const filterChangedCallback = (item, updatedFilter, changedFilters) => {
            if (changedFilters.testValue === 2) {
                return { value: 2 };
            }
            return { value: 3 };
        };
        const newItem = getItemOnFilterChangedCallback(item, updatedFilter, changedFilters, filterChangedCallback);
        assert.deepEqual(newItem, { value: 2 });
    });

    it('getItemOnFilterChangedCallback with new value', () => {
        const updatedFilter = { value: 2 };
        const changedFilters = {
            testValue: 1
        };
        const item = {
            value: 1
        };
        const filterChangedCallback = (item, updatedFilter, changedFilters) => {
            if (changedFilters.testValue === 2) {
                return { value: 2 };
            }
            return { value: 3 };
        };
        const newItem = getItemOnFilterChangedCallback(item, updatedFilter, changedFilters, filterChangedCallback);
        assert.deepEqual(newItem, { value: 3 });
    });

    it('getItemVisivbility false', () => {
        const updatedFilter = { value: 2 };
        const changedFilters = {
            testValue: 1
        };
        const item = {
            value: 1
        };
        const filterVisibilityCallback = (item, updatedFilter, changedFilters) => {
            if (changedFilters.testValue === 1) {
                return false;
            }
        };
        const visivbility = getItemVisivbility(item, updatedFilter, changedFilters, filterVisibilityCallback);
        assert.isFalse(visivbility);
    });
});
