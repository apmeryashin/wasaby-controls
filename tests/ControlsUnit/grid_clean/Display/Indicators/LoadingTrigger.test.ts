import { assert } from 'chai';
import * as Display from 'Controls/display';
import * as sinon from 'sinon';
import LoadingTrigger from 'Controls/_grid/display/LoadingTrigger';

describe('Controls/grid/LoadingTrigger', () => {
    describe('getTemplate', () => {
        it('is full grid support', () => {
            const trigger = new LoadingTrigger({});
            assert.equal(trigger.getTemplate('', null), 'Controls/baseList:LoadingTriggerItemTemplate');
        });

        it('is not full grid support', () => {
            const sandbox = sinon.createSandbox();
            const stubIsFullGridSupport = sandbox.stub(Display, 'isFullGridSupport');
            stubIsFullGridSupport.returns(false);

            const trigger = new LoadingTrigger({});
            assert.equal(trigger.getTemplate('', null), 'Controls/grid:TableLoadingTriggerTemplate');

            sandbox.restore();
        });
    });
});
