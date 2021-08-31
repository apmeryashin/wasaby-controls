import {assert} from 'chai';
import {Collection, EIndicatorState} from 'Controls/display';
import IndicatorsController, {IIndicatorsControllerOptions} from 'Controls/_baseList/Controllers/IndicatorsController';
import {RecordSet} from 'Types/collection';

function initTest(
    items: object[],
    options: Partial<IIndicatorsControllerOptions>
): {collection: Collection, controller: IndicatorsController} {
    const recordSet = new RecordSet({
        rawData: items,
        keyProperty: 'id'
    });
    const collection = new Collection({
        collection: recordSet,
        keyProperty: 'id'
    });
    const controller = new IndicatorsController({
        model: collection,
        items: recordSet,
        ...options
    } as IIndicatorsControllerOptions);
    return {collection, controller};
}

describe('Controls/list_clean/Indicators/Controller', () => {
    describe('updateOptions', () => {
        it('changed items', () => {
            const {collection, controller} = initTest([{id: 1}], {});

            // через контроллер нужно дожидаться таймера
            collection.displayIndicator('global', EIndicatorState.Loading, 100);
            assert.isTrue(collection.hasIndicator('global'));

            const newItems = new RecordSet({
                rawData: [{id: 1}, {id: 2}],
                keyProperty: 'id'
            });
            controller.updateOptions({
                items: newItems,
                model: collection
            } as IIndicatorsControllerOptions, false);
            assert.isFalse(collection.hasIndicator('global'));
        });

        it('changed navigation', () => {
            const options: IIndicatorsControllerOptions = {
                isInfinityNavigation: true,
                hasMoreDataToTop: true,
                hasMoreDataToBottom: true,
                attachLoadTopTriggerToNull: true,
                attachLoadDownTriggerToNull: true,
                hasHiddenItemsByVirtualScroll: () => false
            } as unknown as IIndicatorsControllerOptions;
            const {collection, controller} = initTest([{id: 1}], options);
            controller.displayTopIndicator(false, false); // верхний индикатор показывается по маусЭнтер
            assert.isTrue(collection.getTopIndicator().isDisplayed());
            assert.isTrue(collection.getBottomIndicator().isDisplayed());

            options.isInfinityNavigation = false;
            controller.updateOptions({
                items: collection.getCollection() as unknown as RecordSet,
                model: collection,
                ...options
            }, false);
            assert.isFalse(collection.getTopIndicator().isDisplayed());
            assert.isFalse(collection.getBottomIndicator().isDisplayed());
        });

        it('changed has more options', () => {
            const options = {
                isInfinityNavigation: true,
                hasMoreDataToTop: true,
                hasMoreDataToBottom: true,
                attachLoadTopTriggerToNull: true,
                attachLoadDownTriggerToNull: true,
                hasHiddenItemsByVirtualScroll: () => false
            } as unknown as IIndicatorsControllerOptions;
            const {collection, controller} = initTest([{id: 1}], options);
            controller.displayTopIndicator(false, false); // верхний индикатор показывается по маусЭнтер
            assert.isTrue(collection.getTopIndicator().isDisplayed());
            assert.isTrue(collection.getBottomIndicator().isDisplayed());

            options.hasMoreDataToTop = false;
            options.hasMoreDataToBottom = false;
            controller.updateOptions({
                items: collection.getCollection() as unknown as RecordSet,
                model: collection,
                ...options
            }, true);
            assert.isTrue(collection.getTopIndicator().isDisplayed());
            assert.isTrue(collection.getBottomIndicator().isDisplayed());

            controller.updateOptions({
                items: collection.getCollection() as unknown as RecordSet,
                model: collection,
                ...options
            }, false);
            assert.isFalse(collection.getTopIndicator().isDisplayed());
            assert.isFalse(collection.getBottomIndicator().isDisplayed());
        });
    });
});
