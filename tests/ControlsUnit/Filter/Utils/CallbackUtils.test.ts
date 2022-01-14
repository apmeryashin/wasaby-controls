import {
    getChangedFilters,
    getItemOnFilterChangedCallback,
    getItemVisivbility,
    loadCallbacks,
    callCallbacksOnFilterDescriptionItems
} from 'Controls/_filter/Utils/CallbackUtils';
import {assert} from 'chai';

describe('Controls/_filter/Utils/CallbackUtils', () => {
    const filterChangedCallback = 'ControlsUnit/Filter/Utils/filterChangedCallback';
    const filterVisibilityCallback = 'ControlsUnit/Filter/Utils/FilterVisibilityCallback';
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
        const items = [{
            name: 'testName',
            value: 1,
            filterChangedCallback
        }];
        loadCallbacks(items);
        const newItem = getItemOnFilterChangedCallback(items[0], updatedFilter, changedFilters, filterChangedCallback);
        assert.deepEqual(newItem, { name: 'testName', value: 2 });
    });

    it('getItemOnFilterChangedCallback with new value', () => {
        const updatedFilter = { value: 2 };
        const changedFilters = {
            testValue: 1
        };
        const items = [{
            name: 'testName',
            value: 1,
            filterChangedCallback
        }];
        loadCallbacks(items);
        const newItem = getItemOnFilterChangedCallback(items[0], updatedFilter, changedFilters, filterChangedCallback);
        assert.deepEqual(newItem, { name: 'testName', value: 3 });
    });

    it('getItemVisivbility false', () => {
        const updatedFilter = { value: 2 };
        const changedFilters = {
            testValue: 1
        };
        const items = [{
            name: 'testName',
            value: 1,
            filterVisibilityCallback
        }];
        loadCallbacks(items);
        const visivbility = getItemVisivbility(items[0], updatedFilter, changedFilters, filterVisibilityCallback);
        assert.isFalse(visivbility);
    });

    it('callCallbacksOnFilterDescriptionItems without filterVisibilityCallback', () => {
        const updatedFilter = { value: 2 };
        const changedFilters = {
            testValue: 1
        };
        const items = [{
            name: 'testName',
            value: 1,
            visibility: true
        }];
        const updateCallback = (newFilterDescription) => {
            assert.isTrue(newFilterDescription[0].visibility);
        };
        loadCallbacks(items);
        callCallbacksOnFilterDescriptionItems(changedFilters, updatedFilter, items, updateCallback);
    });
});
