import { assert } from 'chai';
import { spy } from 'sinon';
import {Calculator, ICalculatorOptions} from 'Controls/_baseList/Controllers/ScrollController/Calculator';

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

function getController(options: Partial<ICalculatorOptions>): Calculator {
    return new Calculator({
        ...getDefaultControllerOptions(),
        ...options
    });
}

describe('Controls/_baseList/Controllers/Calculator', () => {
    describe('getEdgeVisibleItem', () => {
        it('viewport is not filled, items is not all rendered, edge item should be last rendered item', () => {
            const controller = getController({
                totalCount: 15,
                viewportSize: 500,
                contentSize: 400,
                itemsSizes: [
                    {size: 50, offset: 0},
                    {size: 50, offset: 50},
                    {size: 50, offset: 100},
                    {size: 50, offset: 150},
                    {size: 50, offset: 200},
                    {size: 50, offset: 250},
                    {size: 50, offset: 300},
                    {size: 50, offset: 350},
                    {size: 50, offset: 400},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0},
                    {size: 0, offset: 0}
                ]
            });

            const edgeItem = controller.getEdgeVisibleItem({
                range: {startIndex: 0, endIndex: 15},
                direction: 'forward',
                placeholders: {backward: 0, forward: 0}
            });
            assert.deepEqual(edgeItem, {
                index: 8,
                direction: 'forward',
                border: 'backward',
                borderDistance: 100
            });
        });
    });
});
