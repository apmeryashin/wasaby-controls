import {assert} from 'chai';
import {TreeGridNodeFooterRow} from 'Controls/treeGrid';

describe('Controls/treeGrid_clean/Display/NodeFooterRow', () => {
    const getMockedOwner = () => ({
        getRoot: () => null,
        hasMultiSelectColumn: () => false,
        hasColumnScroll: () => false,
        hasNewColumnScroll: () => false,
        isFullGridSupport: () => true,
        hasItemActionsSeparatedCell: () => false
    });

    it('override setGridColumnsConfig', () => {
        const oldGridColumnsConfig = [{}];
        const newGridColumnsConfig = [{}, {}];

        const owner = {
            ...getMockedOwner(),
            getGridColumnsConfig: () => oldGridColumnsConfig
        };

        const nodeFooter = new TreeGridNodeFooterRow({
            owner,
            rowTemplate: () => 'NODE_FOOTER_TEMPLATE',
            gridColumnsConfig: oldGridColumnsConfig,
            contents: ''
        });

        assert.equal(nodeFooter.getGridColumnsConfig(), oldGridColumnsConfig);
        nodeFooter.setGridColumnsConfig(newGridColumnsConfig);

        // TODO: Выправить, группировка написана тоже странно.
        //  При вызове collection.setColumns, getGridColumnsConfig на коллекции и элементе группы
        //  возвращают разные значения, т.к. метод лезет в owner.
        //  https://online.sbis.ru/opendoc.html?guid=5fc3c0e2-e5bf-4006-a67e-51a80c8bd8f1
        owner.getGridColumnsConfig = () => newGridColumnsConfig;
        assert.equal(nodeFooter.getGridColumnsConfig(), newGridColumnsConfig);
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
