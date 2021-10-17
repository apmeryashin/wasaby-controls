import {StateBar} from 'Controls/progress';
import {assert} from 'chai';
import * as sinon from 'sinon';
import {Logger} from 'UI/Utils';

describe.only('Controls/progress:StateBar', () => {
    let stateBar;
    // Создаём песочницу, для одновременной очистки моков и стабов
    const sandbox = sinon.createSandbox();
    afterEach(() => {
        // Очищаем песочницу
        sandbox.restore();
    });
    beforeEach(() => {
        stateBar = new StateBar({});
    });

    describe.only('_beforeMount', () => {
        it('Вызов метода _applyNewState', () => {
            const options = {
                data: [{value: 10}],
                align: 'right'
            };
            const applyNewStateMock = sandbox.mock(stateBar).expects('_applyNewState');
            stateBar._beforeMount({...options});
            assert.isTrue(applyNewStateMock.calledOnceWith(options), 'Не вызван метод _applyNewState')
        });
    });

    describe.only('_beforeUpdate', () => {
        it('Вызов метода _applyNewState при обновлении опций', () => {
            stateBar._options = {
                data: [{value: 20, style: 'success'}, {value: 30, style: 'danger'}],
            };
            const newOptions = {
                data: [{value: 10}],
                align: 'right'
            };
            const applyNewStateMock = sandbox.mock(stateBar).expects('_applyNewState').exactly(1);
            stateBar._beforeUpdate({...newOptions});
            applyNewStateMock.verify();
        });
        it('Если опции не изменены, _applyNewState не должен быть вызван', () => {
            const options = {
                data: [{value: 10}],
                align: 'right'
            };
            stateBar._options = {...options};
            const applyNewStateMock = sandbox.mock(stateBar).expects('_applyNewState').never();
            stateBar._beforeUpdate({...options});
            applyNewStateMock.verify();
        });
    });

    describe.only('_applyNewState', () => {
        let loggerMock;
        beforeEach(() => {
            stateBar = new StateBar({});
            loggerMock = sandbox.mock(Logger).expects('error');
        });

        it('Установка значений по умолчанию', () => {
            loggerMock.never();
            stateBar._applyNewState({
                data: [{value: 10}]
            });
            assert.deepEqual(stateBar._sectors, [{
                style: 'secondary',
                title: '',
                value: 10
            }], 'Массив секторов отличается от ожидаемого');
            loggerMock.verify();
        });

        it('Переданные сектора имеют весь набор опций', () => {
            loggerMock.never();
            stateBar._applyNewState({
                data: [{
                    value: 10,
                    style: 'success',
                    title: 'test1'
                }, {
                    value: 20,
                    style: 'danger',
                    title: 'test3'
                }],
                align: 'right',
                blankAreaStyle: 'secondary'
            });
            assert.deepEqual(stateBar._sectors, [{
                value: 10,
                style: 'success',
                title: 'test1'
            }, {
                value: 20,
                style: 'danger',
                title: 'test3'
            }], 'Массив секторов отличается от ожидаемого');
            loggerMock.verify();
        });

        it('Сумма секторов превышает 100', () => {
            loggerMock.exactly(2);
            stateBar._applyNewState({
                data: [{
                    value: 20,
                    style: 'success',
                    title: 'test1'
                }, {
                    value: 90,
                    style: 'danger',
                    title: 'test2'
                }, {
                    value: 30,
                    style: 'warning',
                    title: 'test3'
                }]
            });
            assert.deepEqual(stateBar._sectors, [{
                value: 20,
                style: 'success',
                title: 'test1'
            }, {
                value: 80,
                style: 'danger',
                title: 'test2'
            }, {
                value: 0,
                style: 'warning',
                title: 'test3'
            }], 'Массив секторов отличается от ожидаемого');
            loggerMock.verify();
        });

        it('Сектора содержат значения 0 и 100', () => {
            loggerMock.never();
            stateBar._applyNewState({
                data: [{
                    value: 0,
                    style: 'success',
                    title: 'test1'
                }, {
                    value: 100,
                    style: 'danger',
                    title: 'test2'
                }]
            });
            assert.deepEqual(stateBar._sectors, [{
                value: 0,
                style: 'success',
                title: 'test1'
            }, {
                value: 100,
                style: 'danger',
                title: 'test2'
            }], 'Массив секторов отличается от ожидаемого');
            loggerMock.verify();
        });

        it('Сектора содержат значения меньше нуля и больше 100', () => {
            loggerMock.exactly(3);
            stateBar._applyNewState({
                data: [{
                    value: -10,
                    style: 'success',
                    title: 'test1'
                }, {
                    value: 30,
                    style: 'danger',
                    title: 'test2'
                }, {
                    value: 120,
                    style: 'warning',
                    title: 'test3'
                }]
            });
            assert.deepEqual(stateBar._sectors, [{
                value: 0,
                style: 'success',
                title: 'test1'
            }, {
                value: 30,
                style: 'danger',
                title: 'test2'
            }, {
                value: 70,
                style: 'warning',
                title: 'test3'
            }], 'Массив секторов отличается от ожидаемого');
            loggerMock.verify();
        });

        it('Переданы нечисловые значения ширины секторов', () => {
            loggerMock.exactly(3);
            stateBar._applyNewState({
                data: [{
                    value: null,
                    style: 'success',
                    title: 'test1'
                }, {
                    value: undefined,
                    style: 'danger',
                    title: 'test2'
                }, {
                    value: '20',
                    style: 'warning',
                    title: 'test3'
                }, {
                    value: ['test'],
                    style: 'warning',
                    title: 'test4'
                }, {
                    value: {test: 'test'},
                    style: 'warning',
                    title: 'test5'
                }]
            });
            assert.deepEqual(stateBar._sectors, [{
                value: 0,
                style: 'success',
                title: 'test1'
            }, {
                value: 0,
                style: 'danger',
                title: 'test2'
            }, {
                value: 20,
                style: 'warning',
                title: 'test3'
            }, {
                value: 0,
                style: 'warning',
                title: 'test4'
            }, {
                value: 0,
                style: 'warning',
                title: 'test5'
            }], 'Массив секторов отличается от ожидаемого');
            loggerMock.verify();
        });
    });
});
