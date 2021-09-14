import {assert} from 'chai';
import {spy} from 'sinon';
import {Collection, EIndicatorState} from 'Controls/display';
import IndicatorsController, {IIndicatorsControllerOptions} from 'Controls/_baseList/Controllers/IndicatorsController';
import sinon = require('sinon');
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
    let fakeTimer;

    beforeEach(() => {
        fakeTimer = sinon.useFakeTimers();
    });

    afterEach(() => {
        fakeTimer.restore();
    });

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
            fakeTimer.tick(2001)
            assert.isOk(collection.getGlobalIndicator());

            controller.onCollectionReset();
            assert.isNotOk(collection.getGlobalIndicator());

            controller.destroy(); // уничтожаем все таймеры
        });

        it('end portioned search', async () => {
            const {collection, controller} = initTest([{id: 1}], {});
            controller.startDisplayPortionedSearch('bottom');
            // ждем пока отобразится индикатор порционного поиска
            fakeTimer.tick(2001)
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
            fakeTimer.tick(2001)
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
            fakeTimer.tick(2001)
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
            fakeTimer.tick(2001)
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
            fakeTimer.tick(2001)
            assert.isFalse(collection.getTopIndicator().isDisplayed());
            assert.isTrue(collection.getBottomIndicator().isDisplayed());

            controller.destroy(); // уничтожаем все таймеры
        });
    });

    describe('shouldDisplayGlobalIndicator', () => {
        it('not should display indicator if was started timer', () => {
            const {controller} = initTest([{id: 1}], {});
            // запустили таймер
            controller.displayGlobalIndicator(0);
            // олжно вернуть false, т.к. таймер уже запущен
            assert.isFalse(controller.shouldDisplayGlobalIndicator());

            controller.destroy(); // уничтожаем все таймеры
        });

        it('not should display indicator if portioned search', () => {
            const {controller} = initTest([{id: 1}], {}, {iterative: true});
            // олжно вернуть false, т.к. таймер уже запущен
            assert.isFalse(controller.shouldDisplayGlobalIndicator());
        });
    });

    describe('displayGlobalIndicator', () => {
        it('should display after 2s', async () => {
            const {collection, controller} = initTest([{id: 1}], {});
            assert.isNotOk(collection.getGlobalIndicator());

            controller.displayGlobalIndicator(0);

            assert.isNotOk(collection.getGlobalIndicator()); // индикатор покажется только через 2с

            // ждем пока отобразится индикатор
            fakeTimer.tick(2001)
            assert.isOk(collection.getGlobalIndicator());

            controller.destroy(); // уничтожаем все таймеры
        })
    });

    describe('shouldHideGlobalIndicator', () => {
        it('should hide indicator if was started timer', () => {
            const {controller} = initTest([{id: 1}], {});
            // запустили таймер
            controller.displayGlobalIndicator(0);
            // олжно вернуть false, т.к. таймер уже запущен
            assert.isTrue(controller.shouldHideGlobalIndicator());

            controller.destroy(); // уничтожаем все таймеры
        });

        it('should hide indicator if it was displayed',async () => {
            const {controller} = initTest([{id: 1}], {});
            // запустили таймер
            controller.displayGlobalIndicator(0);

            // ждем пока отобразится индикатор порционного поиска
            fakeTimer.tick(2001)

            // олжно вернуть false, т.к. индикатор отображен
            assert.isTrue(controller.shouldHideGlobalIndicator());

            controller.destroy(); // уничтожаем все таймеры
        });

        it('not should hide indicator if portioned search', () => {
            const {controller} = initTest([{id: 1}], {}, {iterative: true});
            // олжно вернуть false, т.к. таймер уже запущен
            assert.isFalse(controller.shouldHideGlobalIndicator());
        });

        it('not should hide indicator if timer not started and it not displayed', () => {
            const {controller} = initTest([{id: 1}], {}, {iterative: true});
            // олжно вернуть false, т.к. таймер уже запущен
            assert.isFalse(controller.shouldHideGlobalIndicator());
        });
    });

    describe('hideGlobalIndicator', () => {
        it('should hide indicator', async () => {
            const {collection, controller} = initTest([{id: 1}], {});
            assert.isNotOk(collection.getGlobalIndicator());

            controller.displayGlobalIndicator(0);
            // ждем пока отобразится индикатор
            fakeTimer.tick(2001)
            assert.isOk(collection.getGlobalIndicator());

            controller.hideGlobalIndicator();
            assert.isNotOk(collection.getGlobalIndicator());

            controller.destroy(); // уничтожаем все таймеры
        });

        it('should reset timer of display indicator', async() => {
            const {collection, controller} = initTest([{id: 1}], {});
            assert.isNotOk(collection.getGlobalIndicator());

            controller.displayGlobalIndicator(0);
            controller.hideGlobalIndicator(); // прерываем таймер

            // дожидается 2с и убеждаемся что индикатор так и не показался
            fakeTimer.tick(2001)
            assert.isNotOk(collection.getGlobalIndicator());

            controller.destroy(); // уничтожаем все таймеры
        });
    });
});
