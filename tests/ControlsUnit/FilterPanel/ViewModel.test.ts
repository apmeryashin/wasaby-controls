import {ViewModel, IViewPanelOptions} from 'Controls/filterPanel';
import {assert} from 'chai';
import {IFilterItem} from 'Controls/filter';
import {Memory} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {NewSourceController} from 'Controls/dataSource';

function getSource(): IFilterItem[] {
    return [
        {
            name: 'owners',
            value: 'Test owner',
            textValue: 'Test owner',
            resetValue: null
        }
    ];
}

function getViewModel({source, collapsedGroups}: Partial<IViewPanelOptions>): ViewModel {
    return new ViewModel({
        source,
        collapsedGroups: collapsedGroups || []
    });
}

describe('Controls/filterPanel:ViewModel', () => {
    describe('resetFilterItem', () => {
        const source = getSource();
        source[0].textValue = 'Test owner';
        const viewModel = getViewModel({source});

        it('editingObject is updated', () => {
            viewModel.resetFilterItem('owners');
            assert.isNull(viewModel.getEditingObject().owners);
        });

        it('filterItem textValue is updated', () => {
            viewModel.resetFilterItem('owners');
            assert.equal(viewModel.getSource()[0].textValue, '');
        });
    });

    describe('resetFilter', () => {
        const source = getSource();
        source[0].viewMode = 'basic';
        source[0].editorOptions = {
            extendedCaption: 'Owner'
        };
        const viewModel = getViewModel({source});

        it('view mode changed', () => {
            viewModel.resetFilter();
            assert.equal(viewModel.getSource()[0].viewMode,  'extended');
        });
    });

    describe('setEditingObjectValue', () => {
        const source = getSource();
        const viewModel = getViewModel({source});

        it('source value is not an object', () => {
            const editorValue = {
                value: 'New owner',
                textValue: 'New text owner'
            };
            viewModel.setEditingObjectValue('owners', editorValue);

            const item = viewModel.getSource()[0];
            assert.equal(item.value, 'New owner');
            assert.equal(item.textValue, 'New text owner');
        });
    });

    describe('setEditingObject', () => {
        const source = getSource();
        const viewModel = getViewModel({source});

        it('collapsed groups reseted', () => {
            const editingObject = {
                owner: null
            };
            viewModel.collapseGroup('owners');
            viewModel.setEditingObject(editingObject);
            assert.deepEqual(viewModel.getCollapsedGroups(), ['owners']);
        });
    });

    describe('handleGroupClick', () => {
        const source = getSource();
        const viewModel = getViewModel({source});

        it('value added to collapsed groups', () => {
            viewModel.handleGroupClick('owners', true);
            assert.deepEqual(viewModel.getCollapsedGroups(), ['owners']);
        });

        it('value removed from collapsed groups', () => {
            viewModel.handleGroupClick('owners', true);
            assert.deepEqual(viewModel.getCollapsedGroups(), []);
        });
    });

    describe('getSource', () => {
        it('items (Types/collection:RecordSet) in editorOptions', () => {
            const source = getSource();
            source[0].editorOptions = {
                source: new Memory(),
                items: new RecordSet()
            };
            const viewModel = getViewModel({source});
            assert.ok(viewModel.getSource()[0].editorOptions.sourceController instanceof NewSourceController);
        });

        it('value removed from collapsed groups', () => {
            const source = getSource();
            source[0].editorOptions = {
                items: ['test']
            };
            const viewModel = getViewModel({source});
            assert.ok(!viewModel.getSource()[0].editorOptions.sourceController);
        });
    });
});
