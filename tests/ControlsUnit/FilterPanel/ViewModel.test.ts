import {ViewModel} from 'Controls/filterPanel';
import {assert} from 'chai';

describe('Controls/filterPanel:ViewModel', () => {
    describe('resetFilterItem', () => {
        const source = [
            {
                name: 'owners',
                value: 'Test owner',
                resetValue: null
            }
        ];
        const collapsedGroups = [];
        const viewModel = new ViewModel({
            source,
            collapsedGroups
        });

        it('editingObject is updated', () => {
            viewModel.resetFilterItem('owners');
            assert.isNull(viewModel._editingObject.owners);
        });
    });

    describe('resetFilter', () => {
        const source = [
            {
                name: 'owners',
                value: 'Test owner',
                resetValue: null,
                viewMode: 'basic',
                editorOptions: {
                    extendedCaption: 'Owner'
                }
            }
        ];
        const collapsedGroups = [];
        const viewModel = new ViewModel({
            source,
            collapsedGroups
        });

        it('view mode changed', () => {
            viewModel.resetFilter();
            assert.equal(viewModel._source[0].viewMode,  'extended');
        });
    });

    describe('setEditingObjectValue', () => {
        const source = [
            {
                name: 'owners',
                value: 'Test owner',
                resetValue: null
            }
        ];
        const collapsedGroups = [];
        const viewModel = new ViewModel({
            source,
            collapsedGroups
        });

        it('source value is not an object', () => {
            const editorValue = {
                value: 'New owner'
            };
            viewModel.setEditingObjectValue('owners', editorValue);

            const item = viewModel._source[0];
            assert.equal(item.value, 'New owner');
        });
    });

    describe('setEditingObject', () => {
        const source = [
            {
                name: 'owners',
                value: null,
                resetValue: null
            }
        ];
        const collapsedGroups = [];
        const viewModel = new ViewModel({
            source,
            collapsedGroups
        });

        it('collapsed groups reseted', () => {
            const editingObject = {
                owner: null
            };
            viewModel.collapseGroup('owners');
            viewModel.setEditingObject(editingObject);
            assert.deepEqual(viewModel._collapsedGroups, ['owners']);
        });
    });

    describe('handleGroupClick', () => {
        const source = [
            {
                name: 'owners',
                value: null,
                resetValue: null
            }
        ];
        const collapsedGroups = [];
        const viewModel = new ViewModel({
            source,
            collapsedGroups
        });

        it('value added to collapsed groups', () => {
            viewModel.handleGroupClick('owners', true);
            assert.deepEqual(viewModel._collapsedGroups, ['owners']);
        });

        it('value removed from collapsed groups', () => {
            viewModel.handleGroupClick('owners', true);
            assert.deepEqual(viewModel._collapsedGroups, []);
        });
    });
});
