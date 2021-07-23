import {GridCell, GridRow} from 'Controls/grid';
import {Model} from 'Types/entity';
import {assert} from 'chai';

describe('Controls/grid/Display/Cell/stickyBackgroundStyle', () => {
    let cell: GridCell<Model, GridRow<Model>>;
    const owner = {} as undefined as GridRow<Model>;

    beforeEach(() => {
        cell = null;
    });

    it('style=default, backgroundstyle=default', () => {
        cell = new GridCell({ owner, column: { width: ''}, backgroundStyle: 'default' });
        assert.equal(cell.getStickyBackgroundStyle('default'), 'default');
    });
    it('style=default, backgroundstyle!=default', () => {
        cell = new GridCell({ owner, column: { width: ''}, backgroundStyle: 'red' });
        assert.equal(cell.getStickyBackgroundStyle('default'), 'red');
    });
    it('style!=default, backgroundstyle!=default', () => {
        cell = new GridCell({ owner, column: { width: ''}, backgroundStyle: 'red' });
        assert.equal(cell.getStickyBackgroundStyle('blue'), 'red');
    });
    it('style!=default, backgroundstyle=default', () => {
        cell = new GridCell({ owner, column: { width: ''}, backgroundStyle: 'default' });
        assert.equal(cell.getStickyBackgroundStyle('blue'), 'blue');
    });
});
