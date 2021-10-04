import {View} from 'Controls/filterPanel';
import {assert} from 'chai';

describe('Controls/filterPanel:View', () => {
    describe('resetFilterItem', () => {
        const config = {
            source: [
                {
                    group: 'owners',
                    name: 'owner',
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
            let filterChanged = false;
            viewControl._notify = (eventName) => {
                filterChanged = eventName === 'filterChanged';
            };

            viewControl._resetFilterItem(displayItem);
            assert.isTrue(filterChanged);
        });

        it('viewMode is default', () => {
            config.viewMode = 'filterPanelStack';
            const viewControl = new View({});
            viewControl._beforeMount(config);
            let filterChanged = false;
            viewControl._notify = (eventName) => {
                filterChanged = eventName === 'filterChanged';
            };

            viewControl._resetFilterItem(displayItem);
            assert.isFalse(filterChanged);
        });
    });
});
