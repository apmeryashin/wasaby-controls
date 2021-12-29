import { assert } from 'chai';
import {GridCollection, GridHeaderCell} from 'Controls/grid';
import {Model} from 'Types/entity';

describe('Controls/_display/GridMixin', () => {
    describe('ladder', () => {
        let grid;
        const collection = [
            {
                id: 1,
                title: '1'
            },
            {
                id: 2,
                title: '1'
            },
            {
                id: 2,
                title: '2'
            }
        ];
        const cfg = {
            collection,
            columns: [{displayProperty: 'title'}],
            ladderProperties: ['title']
        };
        beforeEach(() => {
            grid = new GridCollection(cfg);
        });
        it('init Ladder', () => {
            assert.isOk(grid.at(0).getLadder(), 'must init ladder on items');
        });
        afterEach(() => {
           grid.destroy();
        });
    });

    describe('hasMultiSelectColumn', () => {
        const grid = new GridCollection({
            collection: [{id: 1}],
            columns: [{}, {}]
        });

        it('hasMultiSelectColumn()', () => {
            grid.setMultiSelectVisibility('visible');
            grid.setMultiSelectPosition('default');
            assert.isTrue(grid.hasMultiSelectColumn());

            grid.setMultiSelectVisibility('onactivated');
            grid.setMultiSelectPosition('default');
            assert.isTrue(grid.hasMultiSelectColumn());

            grid.setMultiSelectVisibility('hidden');
            grid.setMultiSelectPosition('default');
            assert.isFalse(grid.hasMultiSelectColumn());

            grid.setMultiSelectVisibility('visible');
            grid.setMultiSelectPosition('custom');
            assert.isFalse(grid.hasMultiSelectColumn());

            grid.setMultiSelectVisibility('onactivated');
            grid.setMultiSelectPosition('custom');
            assert.isFalse(grid.hasMultiSelectColumn());

            grid.setMultiSelectVisibility('hidden');
            grid.setMultiSelectPosition('custom');
            assert.isFalse(grid.hasMultiSelectColumn());
        });
    });

    describe('sorting', () => {
        it('should set sorting to header cells', () => {
            const header = [{sortingProperty: 'count'}, {sortingProperty: 'price'}];
            const columns = [{width: '1px'}, {width: '1px'}];
            const grid = new GridCollection({
                collection: [{id: 1, price: '12', count: '40'}],
                header,
                columns
            });
            const headerColumns = grid.getHeader().getRow().getColumns() as Array<GridHeaderCell<Model>>;
            grid.setSorting([{price: 'DESC'}]);
            assert.equal(headerColumns[1].getSorting(), 'DESC');
            assert.notEqual(headerColumns[0].getSorting(), 'DESC');
        });
    });
});
