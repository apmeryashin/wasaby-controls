import Colgroup from 'Controls/_grid/display/Colgroup';
import {assert} from 'chai';

const getMockedOwner = () => ({
    hasMultiSelectColumn: () => false,
    hasItemActionsSeparatedCell: () => false
});

describe('Controls/grid_clean/Display/columns/Colgroup', () => {

    it('reinitialize colgroup on columns changed', () => {
        const colgroup = new Colgroup({
            owner: getMockedOwner(),
            gridColumnsConfig: [{}, {}]
        });

        assert.lengthOf(colgroup.getCells(), 2);

        colgroup.setGridColumnsConfig([{}, {}, {}, {}]);
        assert.lengthOf(colgroup.getCells(), 4);
    });

});
