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
        cell = new GridCell({ owner, column: { width: ''}, backgroundStyle: 'default', style: 'default' });
        assert.equal(cell.getStickyBackgroundStyle(), 'default');
    });
    it('style=default, backgroundstyle!=default', () => {
        cell = new GridCell({ owner, column: { width: ''}, backgroundStyle: 'red', style: 'default' });
        assert.equal(cell.getStickyBackgroundStyle(), 'red');
    });
    it('style!=default, backgroundstyle!=default', () => {
        cell = new GridCell({ owner, column: { width: ''}, backgroundStyle: 'red', style: 'blue' });
        assert.equal(cell.getStickyBackgroundStyle(), 'red');
    });
    it('style!=default, backgroundstyle=default', () => {
        cell = new GridCell({ owner, column: { width: ''}, backgroundStyle: 'default', style: 'blue' });
        assert.equal(cell.getStickyBackgroundStyle(), 'blue');
    });
});
