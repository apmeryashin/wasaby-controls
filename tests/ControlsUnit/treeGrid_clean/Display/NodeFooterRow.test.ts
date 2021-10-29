import {assert} from 'chai';
import {TreeGridNodeFooterRow} from 'Controls/treeGrid';

describe('Controls/treeGrid_clean/Display/NodeFooterRow', () => {
    const getMockedOwner = () => ({
        getRoot: () => null,
        hasMultiSelectColumn: () => false,
        hasColumnScroll: () => false,
        isFullGridSupport: () => true,
        hasItemActionsSeparatedCell: () => false
    });

    describe('.getColumnIndex()', () => {
        describe('node footer row in grid with ladder', () => {
            let nodeFooter;
            beforeEach(() => {
                const columnsConfig = [
                    {
                        displayProperty: 'first',
                        stickyProperty: ['prop1', 'prop2']
                    },
                    {
                        displayProperty: 'second'
                    }
                ];
                nodeFooter = new TreeGridNodeFooterRow({
                    owner: {
                        ...getMockedOwner(),
                        getGridColumnsConfig: () => columnsConfig
                    },
                    rowTemplate: () => 'NODE_FOOTER_TEMPLATE',
                    gridColumnsConfig: columnsConfig,
                    contents: ''
                });
                nodeFooter.needMoreButton = () => true;
            });

            it('count with ladder column', () => {
                const columns = nodeFooter.getColumns();
                assert.equal(nodeFooter.getColumnIndex(columns[1], false, true), 1);
            });
            it('count without ladder column', () => {
                const columns = nodeFooter.getColumns();
                assert.equal(nodeFooter.getColumnIndex(columns[1], false, false), 0);
            });
        });
    });
});
