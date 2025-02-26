import Cell from 'Controls/_grid/display/Cell';
import { assert } from 'chai';

describe('Controls/_grid/display/Cell/getCellContentRender', () => {
    let searchValue;
    let contents;

    const owner = {
        getSearchValue: () => searchValue,
        getContents: () => contents,
        getDisplayValue: () => 'title'
    };

    beforeEach(() => {
        searchValue = '';
        contents = {};
    });

    it('exists display value', () => {
        contents.get = () => '1';

        const cell = new Cell({owner});
        assert.equal(cell.getCellContentRender(), 'Controls/grid:StringTypeRender');

        searchValue = '123';
        assert.equal(cell.getCellContentRender(), 'Controls/grid:StringSearchTypeRender');
    });

    it('not exists display value', () => {
        const cell = new Cell({owner});
        assert.equal(cell.getCellContentRender(), 'Controls/grid:StringTypeRender');

        searchValue = '123';
        assert.equal(cell.getCellContentRender(), 'Controls/grid:StringTypeRender');
    });
});
