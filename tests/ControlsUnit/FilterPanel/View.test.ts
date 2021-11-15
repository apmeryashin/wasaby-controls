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

        it('viewMode is filterPanelStack', () => {
            config.viewMode = 'filterPanelStack';
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
            assert.isFalse(filterChanged);
        });
    });

    describe('_getUpdatedSource', () => {
        it('params are changed', () => {
            const targetSource = [
                { name: 'testName', value: null, textValue: '', viewMode: 'extended'}
            ];
            const source = [
                { name: 'testName', value: 'testValue', textValue: 'testTextValue', viewMode: 'basic'}
            ];

            this._getUpdatedSource(targetSource, source);
            assert.equal(targetSource[0].value, 'testValue');
            assert.equal(targetSource[0].textValue, 'textValue');
            assert.equal(targetSource[0].viewMode, 'basic');
        });
    });
});
