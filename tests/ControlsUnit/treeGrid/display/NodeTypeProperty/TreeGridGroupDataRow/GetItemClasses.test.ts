import {assert} from 'chai';
import {Model} from 'Types/entity';
import {TreeGridCollection, TreeGridGroupDataRow} from 'Controls/treeGrid';
import {CssClassesAssert} from 'ControlsUnit/CustomAsserts';

describe('Controls/treeGrid/display/NodeTypeProperty/TreeGridGroupDataRow/GetItemClasses', () => {
    let groupRow: TreeGridGroupDataRow<Model>;
    const owner = {
        getNavigation: () => {/* FIXME: sinon mock */},
        getItems: () => ([groupRow]),
        getCount: () => 1,
        getRootLevel: () => 0,
        getCollectionCount: () => 1,
        getSourceIndexByItem: () => 0
    } as undefined as TreeGridCollection<any>;

    groupRow = new TreeGridGroupDataRow({
        contents: new Model({
            rawData: {
                id: 1,
                nodeType: 'group',
                parent: null,
                node: true,
                hasChildren: true
            },
            keyProperty: 'id'
        }),
        columns: [
            { width: '100px' }
        ],
        owner
    });

    it('getItemClasses() should return classes for group item', () => {
        CssClassesAssert.isSame(groupRow.getItemClasses({ }), [
            'controls-ListView__itemV',
            'controls-Grid__row',
            'controls-Grid__row_default',
            'controls-ListView__itemV_cursor-pointer',
            'controls-ListView__item_showActions',
            'controls-Grid__row_highlightOnHover_default',
            'controls-ListView__group',
            'controls-TreeGrid__groupNode'].join(' '));
    });
});
