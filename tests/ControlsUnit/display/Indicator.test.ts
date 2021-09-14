import { assert } from 'chai';
import {EIndicatorState, Indicator} from 'Controls/display';

describe('Controls/display/Indicator', () => {
    describe('setMetaData', () => {
        it('not displayed', () => {
            const indicator = new Indicator();
            assert.isFalse(indicator.setMetaData({}));
        });

        it('is not portioned search', () => {
            const indicator = new Indicator();
            indicator.display(EIndicatorState.Loading);
            assert.isFalse(indicator.setMetaData({}));
        });

        it('portioned search', () => {
            const indicator = new Indicator();
            indicator.display(EIndicatorState.PortionedSearch);
            assert.isTrue(indicator.setMetaData({}));
            // если метаДанные не изменились, то не перерисовываемся
            assert.isFalse(indicator.setMetaData({}));
        });

        it('continue search', () => {
            const indicator = new Indicator();
            indicator.display(EIndicatorState.ContinueSearch);
            assert.isTrue(indicator.setMetaData({}));
            // если метаДанные не изменились, то не перерисовываемся
            assert.isFalse(indicator.setMetaData({}));
        });
    });
});
