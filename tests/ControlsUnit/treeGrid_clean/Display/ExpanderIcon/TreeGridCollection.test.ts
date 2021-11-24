import {assert} from 'chai';
import {RecordSet} from 'Types/collection';
import {TreeGridCollection} from 'Controls/treeGrid';
import {CssClassesAssert} from 'ControlsUnit/CustomAsserts';

describe('treeGrid/Display/ExpanderIcon/TreeGridCollection', () => {
    const recordSet = new RecordSet({
        rawData: [ { key: 1, parent: null, node: null } ],
        keyProperty: 'key'
    });

    function getTreeGridCollection(options?: object): TreeGridCollection {
        return  new TreeGridCollection({
            collection: recordSet,
            keyProperty: 'key',
            parentProperty: 'parent',
            nodeProperty: 'node',
            root: null,
            columns: [{}],
            expandedItems: [1],
            ...options
        });
    }

    describe('expanderIconStyle', () => {

        it('should pass to row expanderIconStyle option', () => {
            const itemAt0 = getTreeGridCollection({ expanderIconStyle: 'unaccented' }).at(0);
            assert.equal(itemAt0.getExpanderIconStyle(), 'unaccented');
        });

        it('expander classes should contain expanderIconStyle classes', () => {
            const itemAt0 = getTreeGridCollection({ expanderIconStyle: 'unaccented' }).at(0);
            CssClassesAssert.include(itemAt0.getExpanderClasses('node'),
                'controls-TreeGrid__row-expander_node_iconStyle_unaccented');
            CssClassesAssert.include(itemAt0.getExpanderClasses('node', 'default', 'default', 'default'),
                'controls-TreeGrid__row-expander_node_iconStyle_default');
        });

        it('should also affect when style=master', () => {
            const itemAt0 = getTreeGridCollection({ style: 'master' }).at(0);
            CssClassesAssert.include(itemAt0.getExpanderClasses('node'),
                'controls-TreeGrid__row-expander_node_iconStyle_unaccented');
        });
    });

    describe('expanderIconSize', () => {
        it('should pass to row expanderIconSize option', () => {
            const itemAt0 = getTreeGridCollection({ expanderIconSize: '2xs' }).at(0);
            assert.equal(itemAt0.getExpanderIconSize(), '2xs');
        });

        it('expander classes should contain expanderIconStyle classes', () => {
            const itemAt0 = getTreeGridCollection({ expanderIconSize: '2xs' }).at(0);
            CssClassesAssert.include(itemAt0.getExpanderClasses('node'),
                'controls-TreeGrid__row-expander_node_iconSize_2xs');
            CssClassesAssert.include(itemAt0.getExpanderClasses('node', 'default', 'default', 'default'),
                'controls-TreeGrid__row-expander_node_iconSize_default');
        });

        it('should also affect when style=master', () => {
            const itemAt0 = getTreeGridCollection({ style: 'master', expanderIconSize: '2xs' }).at(0);
            CssClassesAssert.include(itemAt0.getExpanderClasses('node'),
                'controls-TreeGrid__row-expander_node_iconSize_2xs');
        });
    });
});
