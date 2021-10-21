import {assert} from 'chai';
import * as sinon from 'sinon';
import {Logger} from 'UI/Utils';
import * as Utils from 'Controls/_progress/Utils';

describe('Controls/_progress/Utils', () => {
    // Создаём песочницу, для одновременной очистки моков и стабов
    const sandbox = sinon.createSandbox();
    afterEach(() => {
        // Очищаем песочницу
        sandbox.restore();
    });

    describe('isNumber', () => {
        it('Передано корректное значение', () => {
            assert.isTrue(Utils.isNumeric(10), 'Метод вернул false');
        });
        it('Передано корректное значение с данными для логирования', () => {
            const mock = sandbox.mock(Logger).expects('error').never();
            assert.isTrue(Utils.isNumeric(10, 'Bar', 'Data'), 'Метод вернул false');
            mock.verify();
        });
        it('Передано некорректное значение', () => {
            const mock = sandbox.mock(Logger).expects('error').never();
            assert.isFalse(Utils.isNumeric('test'), 'Метод вернул true');
            mock.verify();
        });
        it('Передано некорректное значение с данными для логирования', () => {
            // Проверяем, что был вызван метод логирования с ожидаемыми аргументами
            const mock = sandbox.mock(Logger).expects('error')
                .withArgs('Bar: Data [test] is incorrect, it contains non-numeric value').exactly(1);
            assert.isFalse(Utils.isNumeric('test', 'Bar', 'Data'), 'Метод вернул true');
            mock.verify();
        });
        it('Передано некорректное значение с данными для логирования без названия опции', () => {
            // Проверяем, что был вызван метод логирования с ожидаемыми аргументами
            const mock = sandbox.mock(Logger).expects('error')
                .withArgs('Bar: Value [test] is incorrect, it contains non-numeric value').exactly(1);
            assert.isFalse(Utils.isNumeric('test', 'Bar'), 'Метод вернул true');
            mock.verify();
        });
    });

    describe('isValueInRange', () => {
        it('Передано корректное значение', () => {
            assert.isTrue(Utils.isValueInRange(10), 'Метод вернул false');
        });
        it('Передано корректное значение с данными для логирования', () => {
            const mock = sandbox.mock(Logger).expects('error').never();
            assert.isTrue(Utils.isValueInRange(10, 5, 20, 'Bar', 'Data'),
                'Метод вернул false');
            mock.verify();
        });
        it('Передано некорректное значение', () => {
            const mock = sandbox.mock(Logger).expects('error').never();
            assert.isFalse(Utils.isValueInRange(30, 5, 20), 'Метод вернул true');
            mock.verify();
        });
        it('Передано некорректное значение с данными для логирования', () => {
            // Проверяем, что был вызван метод логирования с ожидаемыми аргументами
            const mock = sandbox.mock(Logger).expects('error')
                .withArgs('Bar: Data [30] must be in range of [5..20]').exactly(1);
            assert.isFalse(Utils.isValueInRange(30, 5, 20, 'Bar', 'Data'),
                'Метод вернул true');
            mock.verify();
        });
        it('Передано некорректное значение с данными для логирования без названия опции', () => {
            // Проверяем, что был вызван метод логирования с ожидаемыми аргументами
            const mock = sandbox.mock(Logger).expects('error')
                .withArgs('Bar: Value [30] must be in range of [5..20]').exactly(1);
            assert.isFalse(Utils.isValueInRange(30, 5, 20, 'Bar'),
                'Метод вернул true');
            mock.verify();
        });
    });
    describe('isSumInRange', () => {
        it('Передано корректное значение', () => {
            assert.isTrue(Utils.isSumInRange([
                {value: 10, style: 'test'},
                {value: 20, style: 'test'}
            ]), 'Метод вернул false');
        });
        it('Передано корректное значение с данными для логирования', () => {
            const mock = sandbox.mock(Logger).expects('error').never();
            assert.isTrue(Utils.isSumInRange([
                {value: 10, style: 'test'},
                {value: 20, style: 'test'}
            ], 30, 'Bar'), 'Метод вернул false');
            mock.verify();
        });
        it('Сумма значений превышает максимально допустимое', () => {
            const mock = sandbox.mock(Logger).expects('error').never();
            assert.isFalse(Utils.isSumInRange([
                {value: 100, style: 'test'},
                {value: 20, style: 'test'}
            ]), 'Метод вернул true');
            mock.verify();
        });
        it('Переданное значение имеет некорректный тип', () => {
            const mock = sandbox.mock(Logger).expects('error').never();
            assert.isFalse(Utils.isSumInRange([
                {value: 'testValue', style: 'test'},
                {value: 20, style: 'test'}
            ]), 'Метод вернул true');
            mock.verify();
        });
        it('Сумма значений превышает максимально допустимое и переданы данные для логирования', () => {
            // Проверяем, что был вызван метод логирования с ожидаемыми аргументами
            const mock = sandbox.mock(Logger).expects('error')
                .withArgs('Bar: Data is incorrect. Values total is greater than 80').exactly(1);
            assert.isFalse(Utils.isSumInRange([
                {value: 100, style: 'test'},
                {value: 20, style: 'test'}
            ], 80, 'Bar'), 'Метод вернул true');
            mock.verify();
        });
        it('Передано значение c некорректным типом и данные для логирования', () => {
            // Проверяем, что был вызван метод логирования с ожидаемыми аргументами
            const mock = sandbox.mock(Logger).expects('error')
                .withArgs('Bar: Value [testValue] is non-numeric').exactly(1);
            assert.isFalse(Utils.isSumInRange([
                {value: 20, style: 'test'},
                {value: 'testValue', style: 'test'}
            ], 80, 'Bar'), 'Метод вернул true');
            mock.verify();
        });
    });
});
