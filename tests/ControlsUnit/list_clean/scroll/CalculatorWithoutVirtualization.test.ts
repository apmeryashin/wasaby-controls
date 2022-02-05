import { assert } from 'chai';
import {Calculator, ICalculatorOptions} from 'Controls/_baseList/Controllers/ScrollController/Calculator';
import CalculatorWithoutVirtualization from 'Controls/_baseList/Controllers/ScrollController/CalculatorWithoutVirtualization';

const EMPTY_SIZE = {size: 0, offset: 0};

function getDefaultControllerOptions(): ICalculatorOptions {
    return {
        scrollPosition: 0,
        contentSize: 0,
        viewportSize: 0,
        totalCount: 0,
        givenItemsSizes: undefined,
        itemsSizes: [],
        triggersOffsets: {backward: 0, forward: 0},
        virtualScrollConfig: {},
        feature1183225611: false
    };
}

function getCalculator(options: Partial<ICalculatorOptions>): CalculatorWithoutVirtualization {
    return new CalculatorWithoutVirtualization({
        ...getDefaultControllerOptions(),
        ...options
    });
}

describe('Controls/_baseList/Controllers/CalculatorWithoutVirtualization', () => {
    let calculator: Calculator;

    beforeEach(() => {
        calculator = getCalculator({
            totalCount: 10,
            viewportSize: 300,
            contentSize: 500,
            scrollPosition: 0,
            itemsSizes: [
                {size: 50, offset: 0, key: '1'},
                {size: 50, offset: 50, key: '2'},
                {size: 50, offset: 100, key: '3'},
                {size: 50, offset: 150, key: '4'},
                {size: 50, offset: 200, key: '5'},
                {size: 50, offset: 250, key: '6'},
                {size: 50, offset: 300, key: '7'},
                {size: 50, offset: 350, key: '8'},
                {size: 50, offset: 400, key: '9'},
                {size: 50, offset: 450, key: '10'}
            ],
            virtualScrollConfig: {
                pageSize: 10
            }
        });
        calculator.resetItems(10, 0);
    });

    afterEach(() => {
        calculator = null;
    });

    describe('shiftRangeToDirection', () => {
        it('not has items to forward', () => {
            const result = calculator.shiftRangeToDirection('forward');
            assert.deepEqual(result, {
                range: {startIndex: 0, endIndex: 10},
                shiftDirection: 'forward',
                indexesChanged: false,
                forwardPlaceholderSize: 0,
                backwardPlaceholderSize: 0,
                placeholdersChanged: false,
                hasItemsOutRangeForward: false,
                hasItemsOutRangeBackward: false,
                hasItemsOutRangeChanged: false,
                oldRange: {startIndex: 0, endIndex: 10},
                oldPlaceholders: {forward: 0, backward: 0},
                scrollMode: null
            });
        });

        it('not has items to backward', () => {
            const result = calculator.shiftRangeToDirection('backward');
            assert.deepEqual(result, {
                range: {startIndex: 0, endIndex: 10},
                shiftDirection: 'backward',
                indexesChanged: false,
                forwardPlaceholderSize: 0,
                backwardPlaceholderSize: 0,
                placeholdersChanged: false,
                hasItemsOutRangeForward: false,
                hasItemsOutRangeBackward: false,
                hasItemsOutRangeChanged: false,
                oldRange: {startIndex: 0, endIndex: 10},
                oldPlaceholders: {forward: 0, backward: 0},
                scrollMode: null
            });
        });
    });

    describe('shiftRangeToIndex', () => {
        it('item in range => indexes is not changed', () => {
            const result = calculator.shiftRangeToIndex(3);
            assert.deepEqual(result, {
                range: {startIndex: 0, endIndex: 10},
                shiftDirection: null,
                indexesChanged: false,
                backwardPlaceholderSize: 0,
                forwardPlaceholderSize: 0,
                placeholdersChanged: false,
                hasItemsOutRangeBackward: false,
                hasItemsOutRangeForward: false,
                hasItemsOutRangeChanged: false,
                oldRange: {startIndex: 0, endIndex: 10},
                oldPlaceholders: {backward: 0, forward: 0},
                scrollMode: null
            });
        });
    });

    describe('shiftRangeToVirtualScrollPosition', () => {
        it('not shift range', () => {
            calculator.scrollPositionChange(200, false);
            calculator.updateItemsSizes(
                [
                    {size: 50, offset: 0, key: '1'},
                    {size: 50, offset: 50, key: '2'},
                    {size: 50, offset: 100, key: '3'},
                    {size: 50, offset: 150, key: '4'},
                    {size: 50, offset: 200, key: '5'},
                    {size: 50, offset: 250, key: '6'},
                    {size: 50, offset: 300, key: '7'},
                    {size: 50, offset: 350, key: '8'},
                    {size: 50, offset: 400, key: '9'},
                    {size: 50, offset: 450, key: '10'},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0}
                ]
            );
            calculator.addItems(10, 5, 'shift');
            calculator.setContentSize(600);
            calculator.updateItemsSizes(
                [
                    {size: 50, offset: 0, key: '1'},
                    {size: 50, offset: 50, key: '2'},
                    {size: 50, offset: 100, key: '3'},
                    {size: 50, offset: 150, key: '4'},
                    {size: 50, offset: 200, key: '5'},
                    {size: 50, offset: 250, key: '6'},
                    {size: 50, offset: 300, key: '7'},
                    {size: 50, offset: 350, key: '8'},
                    {size: 50, offset: 400, key: '9'},
                    {size: 50, offset: 450, key: '10'},
                    {size: 50, offset: 500, key: '11'},
                    {size: 50, offset: 550, key: '12'},
                    {size: 50, offset: 600, key: '13'},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0}
                ]
            );

            calculator.scrollPositionChange(300, false);
            calculator.shiftRangeToDirection('forward');
            calculator.updateItemsSizes(
                [
                    {size: 50, offset: 0, key: '1'},
                    {size: 50, offset: 50, key: '2'},
                    {size: 50, offset: 100, key: '3'},
                    {size: 50, offset: 150, key: '4'},
                    {size: 50, offset: 200, key: '5'},
                    {size: 50, offset: 250, key: '6'},
                    {size: 50, offset: 300, key: '7'},
                    {size: 50, offset: 350, key: '8'},
                    {size: 50, offset: 400, key: '9'},
                    {size: 50, offset: 450, key: '10'},
                    {size: 50, offset: 500, key: '11'},
                    {size: 50, offset: 550, key: '12'},
                    {size: 50, offset: 600, key: '13'},
                    {size: 50, offset: 650, key: '14'},
                    {size: 50, offset: 700, key: '15'}
                ]
            );

            const result = calculator.shiftRangeToVirtualScrollPosition(0);
            assert.deepEqual(result, {
                range: {startIndex: 0, endIndex: 15},
                shiftDirection: null,
                indexesChanged: false,
                backwardPlaceholderSize: 0,
                forwardPlaceholderSize: 0,
                placeholdersChanged: false,
                hasItemsOutRangeBackward: false,
                hasItemsOutRangeForward: false,
                hasItemsOutRangeChanged: false,
                oldRange: {startIndex: 0, endIndex: 15},
                oldPlaceholders: {backward: 0, forward: 0},
                scrollMode: null
            });
        });
    });

    describe('addItems', () => {
        it('add to start', () => {
            calculator.updateItemsSizes(
                [
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 50, offset: 0, key: '1'},
                    {size: 50, offset: 50, key: '2'},
                    {size: 50, offset: 100, key: '3'},
                    {size: 50, offset: 150, key: '4'},
                    {size: 50, offset: 200, key: '5'},
                    {size: 50, offset: 250, key: '6'},
                    {size: 50, offset: 300, key: '7'},
                    {size: 50, offset: 350, key: '8'},
                    {size: 50, offset: 400, key: '9'},
                    {size: 50, offset: 450, key: '10'}
                ]
            );
            const result = calculator.addItems(0, 5, 'shift');
            assert.deepEqual(result, {
                range: {startIndex: 0, endIndex: 15},
                shiftDirection: 'backward',
                indexesChanged: true,
                backwardPlaceholderSize: 0,
                forwardPlaceholderSize: 0,
                placeholdersChanged: false,
                hasItemsOutRangeBackward: false,
                hasItemsOutRangeForward: false,
                hasItemsOutRangeChanged: false,
                oldRange: {startIndex: 0, endIndex: 10},
                oldPlaceholders: {backward: 0, forward: 0},
                scrollMode: null
            });
        });

        it('add to middle', () => {
            calculator.updateItemsSizes(
                [
                    {size: 50, offset: 0, key: '1'},
                    {size: 50, offset: 50, key: '2'},
                    {size: 50, offset: 100, key: '3'},
                    {size: 50, offset: 150, key: '4'},
                    {size: 50, offset: 200, key: '5'},
                    {size: 50, offset: 250, key: '6'},
                    {size: 0, offset: 0},
                    {size: 50, offset: 300, key: '7'},
                    {size: 50, offset: 350, key: '8'},
                    {size: 50, offset: 400, key: '9'},
                    {size: 50, offset: 450, key: '10'}
                ]
            );
            const result = calculator.addItems(5, 1, 'shift');
            assert.deepEqual(result, {
                range: {startIndex: 0, endIndex: 11},
                shiftDirection: 'forward',
                indexesChanged: true,
                backwardPlaceholderSize: 0,
                forwardPlaceholderSize: 0,
                placeholdersChanged: false,
                hasItemsOutRangeBackward: false,
                hasItemsOutRangeForward: false,
                hasItemsOutRangeChanged: false,
                oldRange: {startIndex: 0, endIndex: 10},
                oldPlaceholders: {backward: 0, forward: 0},
                scrollMode: null
            });
        });

        it('add to end', () => {
            calculator.updateItemsSizes(
                [
                    {size: 50, offset: 0, key: '1'},
                    {size: 50, offset: 50, key: '2'},
                    {size: 50, offset: 100, key: '3'},
                    {size: 50, offset: 150, key: '4'},
                    {size: 50, offset: 200, key: '5'},
                    {size: 50, offset: 250, key: '6'},
                    {size: 50, offset: 300, key: '7'},
                    {size: 50, offset: 350, key: '8'},
                    {size: 50, offset: 400, key: '9'},
                    {size: 50, offset: 450, key: '10'},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0}
                ]
            );
            const result = calculator.addItems(10, 5, 'shift');
            assert.deepEqual(result, {
                range: {startIndex: 0, endIndex: 15},
                shiftDirection: 'forward',
                indexesChanged: true,
                backwardPlaceholderSize: 0,
                forwardPlaceholderSize: 0,
                placeholdersChanged: false,
                hasItemsOutRangeBackward: false,
                hasItemsOutRangeForward: false,
                hasItemsOutRangeChanged: false,
                oldRange: {startIndex: 0, endIndex: 10},
                oldPlaceholders: {backward: 0, forward: 0},
                scrollMode: null
            });
        });
    });

    describe('removeItems', () => {
        it('remove from start', () => {
            const result = calculator.removeItems(0, 1);
            assert.deepEqual(result, {
                range: {startIndex: 0, endIndex: 9},
                shiftDirection: 'backward',
                indexesChanged: true,
                backwardPlaceholderSize: 0,
                forwardPlaceholderSize: 0,
                placeholdersChanged: false,
                hasItemsOutRangeBackward: false,
                hasItemsOutRangeForward: false,
                hasItemsOutRangeChanged: false,
                oldRange: {startIndex: 0, endIndex: 10},
                oldPlaceholders: {backward: 0, forward: 0},
                scrollMode: null
            });
        });

        it('remove from middle', () => {
            const result = calculator.removeItems(5, 1);
            assert.deepEqual(result, {
                range: {startIndex: 0, endIndex: 9},
                shiftDirection: 'forward',
                indexesChanged: true,
                backwardPlaceholderSize: 0,
                forwardPlaceholderSize: 0,
                placeholdersChanged: false,
                hasItemsOutRangeBackward: false,
                hasItemsOutRangeForward: false,
                hasItemsOutRangeChanged: false,
                oldRange: {startIndex: 0, endIndex: 10},
                oldPlaceholders: {backward: 0, forward: 0},
                scrollMode: null
            });
        });

        it('remove from end', () => {
            const result = calculator.removeItems(9, 1);
            assert.deepEqual(result, {
                range: {startIndex: 0, endIndex: 9},
                shiftDirection: 'forward',
                indexesChanged: true,
                backwardPlaceholderSize: 0,
                forwardPlaceholderSize: 0,
                placeholdersChanged: false,
                hasItemsOutRangeBackward: false,
                hasItemsOutRangeForward: false,
                hasItemsOutRangeChanged: false,
                oldRange: {startIndex: 0, endIndex: 10},
                oldPlaceholders: {backward: 0, forward: 0},
                scrollMode: null
            });
        });
    });

    describe('resetItems', () => {
        it('start with 0', () => {
            calculator.updateItemsSizes(Array(20).fill(EMPTY_SIZE));
            calculator.resetItems(20, 0);
            assert.deepEqual(calculator.getRange(), {startIndex: 0, endIndex: 20});
        });

        it('start with 5', () => {
            calculator.updateItemsSizes(Array(20).fill(EMPTY_SIZE));
            calculator.resetItems(20, 5);
            assert.deepEqual(calculator.getRange(), {startIndex: 0, endIndex: 20});
        });
    });
});
