import {assert} from 'chai';
import {spy} from 'sinon';
import {Collection, EIndicatorState} from 'Controls/display';
import IndicatorsController, {IIndicatorsControllerOptions} from 'Controls/_baseList/Controllers/IndicatorsController';
import {RecordSet} from 'Types/collection';

function initTest(
    items: object[],
    options: Partial<IIndicatorsControllerOptions> = {},
    metaData: object = {}
): {collection: Collection, controller: IndicatorsController} {
    const recordSet = new RecordSet({
        rawData: items,
        keyProperty: 'id',
        metaData
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

    describe('onCollectionReset', () => {
        it('display indicators by hasMore', () => {
            const options = {
                isInfinityNavigation: true,
                attachLoadTopTriggerToNull: true,
                attachLoadDownTriggerToNull: true,
                hasHiddenItemsByVirtualScroll: () => false,
                scrollToFirstItem: () => null
            } as unknown as IIndicatorsControllerOptions;
            const {collection, controller} = initTest([{id: 1}], options);
            assert.isFalse(collection.getTopIndicator().isDisplayed());
            assert.isFalse(collection.getBottomIndicator().isDisplayed());

            controller.setHasMoreData(true, true);
            const changedResetTrigger = controller.onCollectionReset();
            assert.isTrue(changedResetTrigger);
            assert.isTrue(collection.getTopIndicator().isDisplayed());
            assert.isTrue(collection.getBottomIndicator().isDisplayed());
        });

        it('display top trigger only after scroll to first item', async () => {
            let resolveScrollToFirstItemPromise;
            let scrollToFirstItemPromise;
            const scrollToFirstItem = (afterScrollCallback) => {
                scrollToFirstItemPromise = new Promise((resolve) => {
                    resolveScrollToFirstItemPromise = resolve;
                }).then(afterScrollCallback);
            };
            const options = {
                isInfinityNavigation: true,
                attachLoadTopTriggerToNull: true,
                hasHiddenItemsByVirtualScroll: () => false,
                scrollToFirstItem
            } as unknown as IIndicatorsControllerOptions;
            const {collection, controller} = initTest([{id: 1}], options);
            assert.isFalse(collection.getTopIndicator().isDisplayed());

            controller.setHasMoreData(true, true);
            const changedResetTrigger = controller.onCollectionReset();
            assert.isTrue(changedResetTrigger);
            assert.isTrue(collection.getTopIndicator().isDisplayed());
            assert.isFalse(collection.getTopLoadingTrigger().isDisplayed());

            resolveScrollToFirstItemPromise();
            await scrollToFirstItemPromise;
            assert.isTrue(collection.getTopLoadingTrigger().isDisplayed());
        });

        it('hide global indicator', async () => {
            const {collection, controller} = initTest([{id: 1}], {});
            assert.isNotOk(collection.getGlobalIndicator());
            controller.displayGlobalIndicator(100);
            assert.isNotOk(collection.getGlobalIndicator()); // индикатор покажется только через 2с

            // ждем пока отобразится глобальный индикатор
            await new Promise((resolve) => {
                setTimeout(() => resolve(null), 2001);
            });
            assert.isOk(collection.getGlobalIndicator());

            controller.onCollectionReset();
            assert.isNotOk(collection.getGlobalIndicator());

            controller.destroy(); // уничтожаем все таймеры
        });

        it('end portioned search', async () => {
            const {collection, controller} = initTest([{id: 1}], {});
            controller.startDisplayPortionedSearch('bottom');
            // ждем пока отобразится индикатор порционного поиска
            await new Promise((resolve) => {
                setTimeout(() => resolve(null), 2001);
            });
            assert.isTrue(collection.getBottomIndicator().isDisplayed());

            const changedResetTrigger = controller.onCollectionReset();
            assert.isFalse(changedResetTrigger);
            assert.isFalse(collection.getBottomIndicator().isDisplayed());

            controller.destroy(); // уничтожаем все таймеры
        });

        it('start portioned search', async () => {
            const {collection, controller} = initTest([{id: 1}], {}, {iterative: true});
            assert.isFalse(collection.getBottomIndicator().isDisplayed());

            controller.setHasMoreData(false, true);
            controller.onCollectionReset();
            assert.isFalse(collection.getBottomIndicator().isDisplayed()); // индикатор покажется только через 2с

            // ждем пока отобразится индикатор порционного поиска
            await new Promise((resolve) => {
                setTimeout(() => resolve(null), 2001);
            });
            assert.isTrue(collection.getBottomIndicator().isDisplayed());

            controller.destroy(); // уничтожаем все таймеры
        });

        it('reset trigger offsets', () => {
            const options = {
                isInfinityNavigation: true,
                attachLoadTopTriggerToNull: true,
                attachLoadDownTriggerToNull: true,
                hasMoreDataToTop: true,
                hasMoreDataToBottom: true,
                hasHiddenItemsByVirtualScroll: () => false,
                scrollToFirstItem: (afterScroll) => afterScroll()
            } as unknown as IIndicatorsControllerOptions;
            const {collection, controller} = initTest([{id: 1}], options);

            collection.setCollection(new RecordSet());
            const spySetOffsets = spy(collection, 'setLoadingTriggerOffset');
            controller.setHasMoreData(false, false);
            controller.onCollectionReset();
            assert.isTrue(spySetOffsets.withArgs({top: 0, bottom: 0}).called);
        });
    });

    describe('onCollectionAdd', () => {
        it('hide global indicator', async () => {
            const {collection, controller} = initTest([{id: 1}], {});
            assert.isNotOk(collection.getGlobalIndicator());
            controller.displayGlobalIndicator(100);
            assert.isNotOk(collection.getGlobalIndicator()); // индикатор покажется только через 2с

            // ждем пока отобразится глобальный индикатор
            await new Promise((resolve) => {
                setTimeout(() => resolve(null), 2001);
            });
            assert.isOk(collection.getGlobalIndicator());

            controller.onCollectionAdd();
            assert.isNotOk(collection.getGlobalIndicator());

            controller.destroy(); // уничтожаем все таймеры
        });
    });

    describe('startDisplayPortionedSearch', () => {
        it('display portioned search after 2s', async () => {
            const {collection, controller} = initTest([{id: 1}], {}, {iterative: true});
            assert.isFalse(collection.getBottomIndicator().isDisplayed());

            controller.startDisplayPortionedSearch('bottom');

            assert.isFalse(collection.getBottomIndicator().isDisplayed()); // индикатор покажется только через 2с

            // ждем пока отобразится индикатор порционного поиска
            await new Promise((resolve) => {
                setTimeout(() => resolve(null), 2001);
            });
            assert.isTrue(collection.getBottomIndicator().isDisplayed());

            controller.destroy(); // уничтожаем все таймеры
        });

        it('should hide all indicators and show needed indicator after 2s', async () => {
            const options = {
                isInfinityNavigation: true,
                attachLoadTopTriggerToNull: true,
                attachLoadDownTriggerToNull: true,
                hasMoreDataToTop: true,
                hasMoreDataToBottom: true,
                hasHiddenItemsByVirtualScroll: () => false,
                scrollToFirstItem: (afterScroll) => afterScroll()
            } as unknown as IIndicatorsControllerOptions;
            const {collection, controller} = initTest([{id: 1}], options, {iterative: true});
            controller.displayTopIndicator(false);
            assert.isTrue(collection.getTopIndicator().isDisplayed());
            assert.isTrue(collection.getBottomIndicator().isDisplayed());

            controller.startDisplayPortionedSearch('bottom');

            assert.isFalse(collection.getTopIndicator().isDisplayed());
            assert.isFalse(collection.getBottomIndicator().isDisplayed());

            // ждем пока отобразится индикатор порционного поиска
            await new Promise((resolve) => {
                setTimeout(() => resolve(null), 2001);
            });
            assert.isFalse(collection.getTopIndicator().isDisplayed());
            assert.isTrue(collection.getBottomIndicator().isDisplayed());

            controller.destroy(); // уничтожаем все таймеры
        });
    });
});
