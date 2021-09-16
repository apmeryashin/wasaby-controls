import {assert} from 'chai';

import {Collection} from 'Controls/display';
import {RecordSet} from 'Types/collection';
import ObserversController, {IObserversControllerOptions} from 'Controls/_baseList/Controllers/ObserversController';

function initTest(
    items: object[],
    options: Partial<IObserversControllerOptions> = {}
): {collection: Collection, controller: ObserversController} {
    const recordSet = new RecordSet({
        rawData: items,
        keyProperty: 'id'
    });
    const collection = new Collection({
        collection: recordSet,
        keyProperty: 'id'
    });
    const controller = new ObserversController({
        model: collection,
        topTriggerOffsetCoefficient: 0.3,
        bottomTriggerOffsetCoefficient: 0.3,
        ...options
    } as IObserversControllerOptions);
    return {collection, controller};
}

describe('Controls/_baseList/ObserversController', () => {
    describe('getTriggerOffset', () => {
        it('default test', () => {
            const {controller} = initTest([{id: 1}], {scrollTop: 100, viewHeight: 1000, viewportHeight: 500});
            assert.deepEqual(controller.getTriggerOffsets(), {top: 150, bottom: 150});
        });

        it('empty model', () => {
            const {controller} = initTest([], {scrollTop: 100, viewHeight: 1000, viewportHeight: 500});
            assert.deepEqual(controller.getTriggerOffsets(), {top: 0, bottom: 0});
        });
    });
});
