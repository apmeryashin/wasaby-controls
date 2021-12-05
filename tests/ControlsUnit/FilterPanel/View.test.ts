import {View} from 'Controls/filterPanel';
import {assert} from 'chai';

describe('Controls/filterPanel:View', () => {
    describe('resetFilterItem', () => {
        const config = {
            source: [
                {
                    name: 'owners',
                    value: 'Test owner',
                    textValue: 'Test owner',
                    resetValue: null
                }
            ],
            collapsedGroups: [],
            viewMode: 'default'
        };

        const displayItem = {
            getContents: () => 'owners'
        };

        it('viewMode is default', () => {
            const viewControl = new View({});
            viewControl._beforeMount(config);
            viewControl.saveOptions(config);
            let filterChanged = false;
            viewControl._notify = (eventName) => {
                if (eventName === 'filterChanged') {
                    filterChanged = true;
                }
            };

            viewControl._resetFilterItem(displayItem);
            assert.equal(viewControl._options.viewMode, 'default');
            assert.isTrue(filterChanged);
        });
    });
});
