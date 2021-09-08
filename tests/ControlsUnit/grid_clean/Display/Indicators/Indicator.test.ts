import { assert } from 'chai';
import Indicator from 'Controls/_grid/display/Indicator';
import * as Display from 'Controls/display';
import * as sinon from 'sinon';

describe('Controls/grid/Indicator', () => {
    describe('getTemplate', () => {
        it('is full grid support', () => {
            const indicator = new Indicator();
            assert.equal(indicator.getTemplate('', null), 'Controls/baseList:IndicatorTemplate');
        });

        it('is not full grid support', () => {
            const sandbox = sinon.createSandbox();
            const stubIsFullGridSupport = sandbox.stub(Display, 'isFullGridSupport');
            stubIsFullGridSupport.returns(false);

            const indicator = new Indicator();
            assert.equal(indicator.getTemplate('', null), 'Controls/grid:TableIndicatorTemplate');

            sandbox.restore();
        });
    });
});
