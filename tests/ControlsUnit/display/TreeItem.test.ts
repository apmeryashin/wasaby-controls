import { assert } from 'chai';

import { TreeItem } from 'Controls/display';
import { CssClassesAssert } from 'ControlsUnit/CustomAsserts';

describe('Controls/_display/TreeItem', () => {
    const Owner = function(): void {
        this.lastChangedItem = undefined;
        this.lastChangedProperty = undefined;
        this.notifyItemChange = (item, property) => {
            this.lastChangedItem = item;
            this.lastChangedProperty = property;
        };
    };

    const getOwnerMock = () => {
        return new Owner();
    };

    describe('.getParent()', () => {
        it('should return undefined by default', () => {
            const item = new TreeItem();
            assert.isUndefined(item.getParent());
        });

        it('should return value passed to the constructor', () => {
            const parent = new TreeItem();
            const item = new TreeItem({parent});

            assert.strictEqual(item.getParent(), parent);
        });
    });

    describe('.getRoot()', () => {
        it('should return itself by default', () => {
            const item = new TreeItem();
            assert.strictEqual(item.getRoot(), item);
        });

        it('should return root of the parent', () => {
            const parent = new TreeItem();
            const item = new TreeItem({parent});

            assert.strictEqual(item.getRoot(), parent.getRoot());
        });
    });

    describe('.isRoot()', () => {
        it('should return true by default', () => {
            const item = new TreeItem();
            assert.isTrue(item.isRoot());
        });

        it('should return false if has parent', () => {
            const parent = new TreeItem();
            const item = new TreeItem({parent});

            assert.isFalse(item.isRoot());
        });
    });

    describe('.getLevel()', () => {
        it('should return 0 by default', () => {
            const item = new TreeItem();
            assert.strictEqual(item.getLevel(), 0);
        });

        it('should return value differs by +1 from the parent', () => {
            const root = new TreeItem();
            const level1 = new TreeItem({parent: root});
            const level2 = new TreeItem({parent: level1});

            assert.strictEqual(root.getLevel(), 0);
            assert.strictEqual(level1.getLevel(), root.getLevel() + 1);
            assert.strictEqual(level2.getLevel(), level1.getLevel() + 1);
        });

        it('should start counter with value given by getRootLevel() method', () => {
            const rootLevel = 3;
            const OwnerWithRoot = function(): void {
                this.getRoot = () => root;
                this.getRootLevel = () => rootLevel;
            };
            const owner = new OwnerWithRoot();
            const root = new TreeItem({owner});
            const level1 = new TreeItem({
                parent: root,
                owner
            });
            const level2 = new TreeItem({
                parent: level1,
                owner
            });

            assert.strictEqual(root.getLevel(), rootLevel);
            assert.strictEqual(level1.getLevel(), root.getLevel() + 1);
            assert.strictEqual(level2.getLevel(), level1.getLevel() + 1);
        });
    });

    describe('.isNode()', () => {
        it('should return null by default', () => {
            const item = new TreeItem();
            assert.isNull(item.isNode());
        });

        it('should return value passed to the constructor', () => {
            const item = new TreeItem({node: true});
            assert.isTrue(item.isNode());
        });
    });

    describe('.isExpanded()', () => {
        it('should return false by default', () => {
            const item = new TreeItem();
            assert.isFalse(item.isExpanded());
        });

        it('should return value passed to the constructor', () => {
            const item = new TreeItem({expanded: true});
            assert.isTrue(item.isExpanded());
        });
    });

    describe('.setExpanded()', () => {
        it('should set the new value', () => {
            const item = new TreeItem();

            item.setExpanded(true);
            assert.isTrue(item.isExpanded());

            item.setExpanded(false);
            assert.isFalse(item.isExpanded());
        });

        it('should notify owner if changed', () => {
            const owner = getOwnerMock();
            const item = new TreeItem({
                owner
            });

            item.setExpanded(true);

            assert.strictEqual(owner.lastChangedItem, item);
            assert.strictEqual(owner.lastChangedProperty, 'expanded');
        });

        it('should not notify owner if changed in silent mode', () => {
            const owner = getOwnerMock();
            const item = new TreeItem({
                owner
            });

            item.setExpanded(true, true);

            assert.isUndefined(owner.lastChangedItem);
            assert.isUndefined(owner.lastChangedProperty);
        });
    });

    describe('.toggleExpanded()', () => {
        it('should toggle the value', () => {
            const item = new TreeItem();

            item.toggleExpanded();
            assert.isTrue(item.isExpanded());

            item.toggleExpanded();
            assert.isFalse(item.isExpanded());
        });
    });

    describe('expander', () => {
        it('.shouldDisplayExpandedBlock()', () => {
            const owner = {
                getExpanderVisibility: () => 'hasChildren',
                hasNodeWithChildren: () => false,
                hasNode: () => false
            };
            const item = new TreeItem({ owner});

            assert.isFalse(item.shouldDisplayExpanderBlock());
            owner.hasNodeWithChildren = () => true;
            assert.isTrue(item.shouldDisplayExpanderBlock());

            owner.getExpanderVisibility = () => 'visible';
            assert.isFalse(item.shouldDisplayExpanderBlock());
            owner.hasNode = () => true;
            assert.isTrue(item.shouldDisplayExpanderBlock());
        });

        it('.shouldDisplayExpander()', () => {
            let expanderPosition = 'default';

            const owner = {
                getExpanderVisibility: () => 'visible',
                getExpanderIcon: () => undefined,
                getExpanderPosition: () => expanderPosition,
                getHasChildrenProperty: () => 'hasChildren'
            };
            const contents = {hasChildren: false};
            const item = new TreeItem({ owner, contents, node: true, hasChildrenProperty: 'hasChildren' });

            assert.isTrue(item.shouldDisplayExpander(null, 'default'));
            expanderPosition = 'right';
            assert.isFalse(item.shouldDisplayExpander(null, 'default'));
            assert.isTrue(item.shouldDisplayExpander(null, 'right'));
            expanderPosition = 'default';

            assert.isTrue(item.shouldDisplayExpander());
            assert.isFalse(item.shouldDisplayExpander('none'));

            item.setNode(null);
            assert.isFalse(item.shouldDisplayExpander());

            item.setNode(true);
            contents.hasChildren = true;
            assert.isTrue(item.shouldDisplayExpander());

            owner.getExpanderVisibility = () => 'hasChildren';
            assert.isTrue(item.shouldDisplayExpander());

            contents.hasChildren = false;
            assert.isFalse(item.shouldDisplayExpander());
        });

        it('.shouldDisplayLevelPadding()', () => {
            let level = 0;

            const owner = {
                getRootLevel: () => level
            };
            const item = new TreeItem({ owner });

            assert.isFalse(item.shouldDisplayLevelPadding());
            level = 1;
            assert.isFalse(item.shouldDisplayLevelPadding());
            level = 2;
            assert.isTrue(item.shouldDisplayLevelPadding());
            level = 3;
            assert.isTrue(item.shouldDisplayLevelPadding());
            assert.isFalse(item.shouldDisplayLevelPadding(true));
        });

        it('.shouldDisplayExpanderPadding()', () => {
            const owner = {
                getExpanderVisibility: () => 'visible',
                getExpanderIcon: () => undefined,
                getExpanderPosition: () => 'default',
                getExpanderSize: () => undefined,
                getHasChildrenProperty: () => 'hasChildren'
            };
            const contents = {hasChildren: false};
            const item = new TreeItem({ owner, contents, hasChildrenProperty: 'hasChildren' });

            assert.isTrue(item.shouldDisplayExpanderPadding());
            assert.isFalse(item.shouldDisplayExpanderPadding('none'));
            assert.isFalse(item.shouldDisplayExpanderPadding(undefined, 'xl'));
            owner.getExpanderPosition = () => 'custom';
            assert.isFalse(item.shouldDisplayExpanderPadding());

            owner.getExpanderVisibility = () => 'hasChildren';
            owner.getExpanderPosition = () => 'default';
            assert.isTrue(item.shouldDisplayExpanderPadding());
            assert.isFalse(item.shouldDisplayExpanderPadding('none'));
            assert.isTrue(item.shouldDisplayExpanderPadding(undefined, 'xl'));
            owner.getExpanderPosition = () => 'custom';
            assert.isFalse(item.shouldDisplayExpanderPadding());

            contents.hasChildren = true;
            owner.getExpanderPosition = () => 'default';
            assert.isFalse(item.shouldDisplayExpanderPadding());
        });

        it('.getExpanderPaddingClasses()', () => {
            const owner = {
                getExpanderSize: () => undefined
            };
            let item = new TreeItem({ owner });

            CssClassesAssert.isSame(item.getExpanderPaddingClasses(), 'controls-TreeGrid__row-expanderPadding controls-TreeGrid__row-expanderPadding_size_default js-controls-ListView__notEditable');

            owner.getExpanderSize = () => 's';
            CssClassesAssert.isSame(item.getExpanderPaddingClasses(), 'controls-TreeGrid__row-expanderPadding controls-TreeGrid__row-expanderPadding_size_s js-controls-ListView__notEditable');

            CssClassesAssert.isSame(item.getExpanderPaddingClasses('xl'), 'controls-TreeGrid__row-expanderPadding controls-TreeGrid__row-expanderPadding_size_xl js-controls-ListView__notEditable');

            item = new TreeItem({ owner, theme: 'custom' });
            CssClassesAssert.isSame(item.getExpanderPaddingClasses('xl'), 'controls-TreeGrid__row-expanderPadding controls-TreeGrid__row-expanderPadding_size_xl js-controls-ListView__notEditable');
        });

        it('.getLevelIndentClasses()', () => {
            const owner = {
                getExpanderSize: () => undefined,
                getExpanderPosition: () => 'default'
            };
            let item = new TreeItem({ owner });

            CssClassesAssert.isSame(item.getLevelIndentClasses(), 'controls-TreeGrid__row-levelPadding controls-TreeGrid__row-levelPadding_size_default');

            owner.getExpanderSize = () => 's';
            CssClassesAssert.isSame(item.getLevelIndentClasses(), 'controls-TreeGrid__row-levelPadding controls-TreeGrid__row-levelPadding_size_s');

            CssClassesAssert.isSame(item.getLevelIndentClasses('xl'), 'controls-TreeGrid__row-levelPadding controls-TreeGrid__row-levelPadding_size_xl');

            CssClassesAssert.isSame(item.getLevelIndentClasses(undefined, 'm'), 'controls-TreeGrid__row-levelPadding controls-TreeGrid__row-levelPadding_size_m');

            CssClassesAssert.isSame(item.getLevelIndentClasses('xl', 'm'), 'controls-TreeGrid__row-levelPadding controls-TreeGrid__row-levelPadding_size_xl');

            CssClassesAssert.isSame(item.getLevelIndentClasses('s', 'm'), 'controls-TreeGrid__row-levelPadding controls-TreeGrid__row-levelPadding_size_m');

            owner.getExpanderPosition = () => 'right';
            CssClassesAssert.isSame(item.getLevelIndentClasses('xl', 'm'), 'controls-TreeGrid__row-levelPadding controls-TreeGrid__row-levelPadding_size_m');

            item = new TreeItem({ owner, theme: 'custom' });
            CssClassesAssert.isSame(item.getLevelIndentClasses('xl', 'm'), 'controls-TreeGrid__row-levelPadding controls-TreeGrid__row-levelPadding_size_m');
        });

        describe('.getExpanderClasses()', () => {
            let owner;

            beforeEach(() => {
                owner = {
                    getExpanderIcon: () => undefined,
                    getExpanderPosition: () => 'default',
                    getExpanderSize: () => undefined,
                    getTopPadding: () => 'default',
                    getBottomPadding: () => 'default'
                };
            });

            it('default', () => {
                let item = new TreeItem({ owner });
                const classes = item.getExpanderClasses();
                CssClassesAssert.include(classes, 'js-controls-Tree__row-expander');
                CssClassesAssert.include(classes, 'js-controls-ListView__notEditable');
                CssClassesAssert.include(classes, 'controls-TreeGrid__row-expander');
                CssClassesAssert.include(classes, 'controls-TreeGrid__row_default-expander_size_default');
                CssClassesAssert.include(classes, 'controls-TreeGrid__row-expander__spacingTop_default');
                CssClassesAssert.include(classes, 'controls-TreeGrid__row-expander__spacingBottom_default');
            });

            it('expanderPosition is right', () => {
                owner.getExpanderPosition = () => 'right';
                let item = new TreeItem({ owner });
                const classes = item.getExpanderClasses();
                CssClassesAssert.include(classes, 'controls-TreeGrid__row_expander_position_right');
                CssClassesAssert.include(classes, 'controls-TreeGrid__row-expander_hiddenNode_default');
            });

            it('expanderPosition is right, style is master', () => {
                owner.getExpanderPosition = () => 'right';
                let item = new TreeItem({ owner, style: 'master' });
                const classes = item.getExpanderClasses();
                CssClassesAssert.include(classes, 'controls-TreeGrid__row_expander_position_right');
                CssClassesAssert.include(classes, 'controls-TreeGrid__row-expander_hiddenNode_default');
            });

            it('set style', () => {
                let item = new TreeItem({ owner, style: 'master' });
                const classes = item.getExpanderClasses();
                CssClassesAssert.include(classes, 'controls-TreeGrid__row_master-expander_size_default');
                CssClassesAssert.include(classes, 'controls-TreeGrid__row-expander_hiddenNode_master');
            });

            it('pass icon', () => {
                let item = new TreeItem({ owner });
                const classes = item.getExpanderClasses('node');
                CssClassesAssert.include(classes, 'controls-TreeGrid__row-expander_node_default');
            });

            it('pass custom icon', () => {
                let item = new TreeItem({ owner });
                const classes = item.getExpanderClasses('arbuz');
                CssClassesAssert.include(classes, 'controls-TreeGrid__row-expander_arbuz');
            });

            it('pass custom icon', () => {
                let item = new TreeItem({ owner });
                const classes = item.getExpanderClasses('arbuz');
                CssClassesAssert.include(classes, 'controls-TreeGrid__row-expander_arbuz');
            });

            it('pass size', () => {
                let item = new TreeItem({ owner });
                const classes = item.getExpanderClasses('node', 's');
                CssClassesAssert.include(classes, 'controls-TreeGrid__row_default-expander_size_s');
            });

            it('count icon by node property', () => {
                let item = new TreeItem({ owner, node: true });
                const classes = item.getExpanderClasses();
                CssClassesAssert.include(classes, 'controls-TreeGrid__row-expander_node_default');
            });
        });
    });

    describe('.hasChildren()', () => {
        it('should return false by default', () => {
            const item = new TreeItem();
            assert.isFalse(item.hasChildren());
        });

        it('should return value passed to the constructor', () => {
            const item = new TreeItem({hasChildren: false});
            assert.isFalse(item.hasChildren());
        });
    });

    describe('.getChildrenProperty()', () => {
        it('should return na empty string by default', () => {
            const item = new TreeItem();
            assert.strictEqual(item.getChildrenProperty(), '');
        });

        it('should return value passed to the constructor', () => {
            const name = 'test';
            const item = new TreeItem({childrenProperty: name});

            assert.strictEqual(item.getChildrenProperty(), name);
        });
    });

    describe('.toJSON()', () => {
        it('should serialize the tree item', () => {
            const item = new TreeItem();
            const json = item.toJSON();
            const options = (item as any)._getOptions();

            delete options.owner;

            assert.strictEqual(json.module, 'Controls/display:TreeItem');
            assert.deepEqual(json.state.$options, options);
        });
    });
});
