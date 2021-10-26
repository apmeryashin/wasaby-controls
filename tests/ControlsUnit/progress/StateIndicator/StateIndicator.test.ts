import {StateIndicator} from 'Controls/progress';
import {assert} from 'chai';

describe('Controls/progress:StateBar', () => {

    describe('_applyNewState', () => {
        let opt;
        let stateIndicator;
        beforeEach(() => {
            stateIndicator = new StateIndicator({});
            opt = {
                readOnly: false,
                scale: 8.333333333333334
            };
        });

        it('Шкала полностью заполнена', () => {
            opt.data = [
                {state: 0, value: 97, title: 'Положительно'},
                {state: 3, value: 1, title: 'В работе'},
                {state: 1, value: 2, title: 'Отрицательно'}
            ];
            stateIndicator._applyNewState(opt);
            assert.deepEqual(stateIndicator._colorState, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3], 'Массив секторов отличается от ожидаемого');
        });

        it('Шкала частично заполнена', () => {
            opt.data = [
                {state: 0, value: 50, title: 'Положительно'},
                {state: 3, value: 10, title: 'В работе'},
                {state: 1, value: 20, title: 'Отрицательно'}
            ];
            stateIndicator._applyNewState(opt);
            assert.deepEqual(stateIndicator._colorState, [1, 1, 1, 1, 1, 1, 2,  3, 3], 'Массив секторов отличается от ожидаемого');
        });

        it('Сумма секторов равна 100', () => {
            opt.data = [
                {state: 0, value: 97, title: 'Положительно'},
                {state: 3, value: 1, title: 'В работе'},
                {state: 1, value: 2, title: 'Отрицательно'}
            ];
            stateIndicator._applyNewState(opt);
            assert.deepEqual(stateIndicator._colorState, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3], 'Массив секторов отличается от ожидаемого');
        });

        it('Отображается незаполненная шкала', () => {
            opt.data = [
                {state: 0, value: 97, title: 'Положительно'},
                {state: 3, value: 1, title: 'В работе'},
                {state: 1, value: 1, title: 'Отрицательно'}
            ];
            stateIndicator._applyNewState(opt);
            assert.deepEqual(stateIndicator._colorState, [1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3], 'Массив секторов отличается от ожидаемого');
        });
    });
});
