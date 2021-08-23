import Store from 'Controls/Store';
import {assert} from 'chai';

describe('Controls/Store', () => {
    it('without context', () => {
        Store.dispatch('myValue', 'myValue');
        assert.equal(Store.getState().myValue, 'myValue');
    });

    it('with context', () => {
        Store.updateStoreContext('contextName');
        Store.dispatch('myValue', 'myValue');
        assert.equal(Store.getState().myValue, 'myValue');
    });

    it('change context', () => {
        Store.updateStoreContext('firstContextName');
        Store.dispatch('myValue', 'myFirstValue');
        assert.equal(Store.getState().myValue as unknown as string, 'mySecondValue');

        Store.updateStoreContext('secondContextName');
        assert.equal(Store.getState().myValue, undefined);
    });

    it('should send params in command', () => {
        let declareParams;
        const sendParams = 'test';
        Store.declareCommand('testCommand', (params) => {
            declareParams = params;
        });
        Store.sendCommand('testCommand', sendParams);
        assert.equal(sendParams, declareParams);
    });
});
