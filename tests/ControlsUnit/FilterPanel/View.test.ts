import {View} from 'Controls/filterPanel';
import {assert} from 'chai';
import {createSandbox} from 'sinon';

describe('Controls/filterPanel:View', () => {
    describe('_beforeUnmount', () => {
        const options = {
            source: [
                {
                    group: 'owners',
                    name: 'owner',
                    value: 'Test owner',
                    textValue: 'Test owner',
                    resetValue: null
                }
            ],
            collapsedGroups: []
        };
        const view = new View(options);
        view._beforeMount(options);

        it('applyButtonSticky is closed', () => {
            let stackClosed = false;
            const sandBox = createSandbox();
            const stickyOpener = view._applyButtonSticky;
            sandBox.replace(stickyOpener, 'close', () => {
                stackClosed = true;
            });
            view._beforeUnmount();
            assert.isTrue(stackClosed);
        });
    });
});
