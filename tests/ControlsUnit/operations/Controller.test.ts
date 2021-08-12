import {Controller} from 'Controls/operations';
import {assert} from 'chai';
import {stub} from 'sinon';

describe('Controls/operations:Controller', () => {

    let controller;
    beforeEach(() => {
        controller = new Controller({});
        controller.saveOptions({});
    });

    describe('_listMarkedKeyChangedHandler', () => {

        it('operationsPanel is closed', () => {
            controller._listMarkedKeyChangedHandler({}, 'testKey');
            assert.isNull(controller._listMarkedKey);
        });

        it('operationsPanel is opened', () => {
            controller._operationsPanelOpen();
            controller._listMarkedKeyChangedHandler({}, 'testKey');
            assert.equal(controller._listMarkedKey, 'testKey');
        });

    });

    describe('selectionViewModeChanged', () => {
        let notifyStub;
        beforeEach(() => {
            notifyStub = stub(controller, '_notify');
        });

        afterEach(() => {
            notifyStub.restore();
        });

        it('selectionViewModeChanged on itemOpenHandler', () => {
            controller._options.selectionViewMode = 'selected';
            controller._itemOpenHandler('root');
            assert.isTrue(notifyStub.withArgs('selectionViewModeChanged').calledOnce);
        });

        it('selectionViewModeChanged on selectionType changed', () => {
            controller._selectedTypeChangedHandler({}, 'selected');
            assert.isTrue(notifyStub.withArgs('selectionViewModeChanged').calledOnce);
        });
    });
});
