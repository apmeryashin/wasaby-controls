import {assert} from 'chai';
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

function getMockedIndicatorElement(): HTMLElement {
    return {
        style: {
            display: '',
            position: '',
            top: '',
            bottom: ''
        }
    } as HTMLElement;
}

describe('Controls/list_clean/Indicators/Controller', () => {
    let fakeTimer;

    beforeEach(() => {
        fakeTimer = sinon.useFakeTimers();
    });

    afterEach(() => {
        fakeTimer.restore();
    });

    describe('constructor', () => {
        it('should start portioned search', () => {
            const {collection, controller} = initTest([{id: 1}], {hasMoreDataToBottom: true}, {iterative: true});
            assert.isFalse(collection.getBottomIndicator().isDisplayed()); // индикатор покажется только через 2с

            // ждем пока отобразится индикатор порционного поиска
            fakeTimer.tick(2001);
            assert.isTrue(collection.getBottomIndicator().isDisplayed());

            controller.destroy(); // уничтожаем все таймеры
        });
    });

    describe('updateOptions', () => {
        it('changed model', () => {
            const {collection, controller} = initTest([{id: 1}], {});
            const newCollection = initTest([{id: 1}], {}).collection;

            // через контроллер нужно дожидаться таймера
            collection.displayIndicator('global', EIndicatorState.Loading, 100);
            assert.isTrue(collection.hasIndicator('global'));

            controller.updateOptions({
                model: newCollection
            } as IIndicatorsControllerOptions, false);
            assert.isFalse(newCollection.hasIndicator('global'));
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
            controller.setViewportFilled(true);
            controller.displayTopIndicator(false, false); // верхний индикатор показывается по маусЭнтер
            controller.displayBottomIndicator();
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
            controller.setViewportFilled(true);
            controller.displayTopIndicator(false, false); // верхний индикатор показывается по маусЭнтер
            controller.displayBottomIndicator();
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

        // Возможен след кейс: список пустой, зовется релоад с итеративной загрузкой.
        // Событие rs не сработает и items не пересоздастся. Единственное, что случится это поменяется опция loading
        // Из-за этого мы попадем в updateOptions, в котором по hasMoreData вызовем пересчет ромашки.
        // И именно здесь определим по флагу iterative, показывать порционный поиск или просто ромашку.
        it('display portioned search to bottom by change hasMoreData', () => {
            const options = {
                isInfinityNavigation: true,
                hasMoreDataToTop: false,
                hasMoreDataToBottom: false,
                attachLoadTopTriggerToNull: true,
                attachLoadDownTriggerToNull: true,
                hasHiddenItemsByVirtualScroll: () => false
            } as unknown as IIndicatorsControllerOptions;
            const {collection, controller} = initTest([{id: 1}], options);

            const items = collection.getCollection() as unknown as RecordSet;
            items.setMetaData({iterative: true});
            controller.updateOptions({
                ...options,
                items,
                model: collection,
                hasMoreDataToBottom: true
            }, false);
            assert.isFalse(collection.getTopIndicator().isDisplayed());
            assert.isFalse(collection.getBottomIndicator().isDisplayed());

            fakeTimer.tick(2001);
            assert.isFalse(collection.getTopIndicator().isDisplayed());
            assert.isTrue(collection.getBottomIndicator().isDisplayed());

            controller.destroy(); // уничтожаем все таймеры
        });

        it('display portioned search to top by change hasMoreData', () => {
            const options = {
                isInfinityNavigation: true,
                hasMoreDataToTop: false,
                hasMoreDataToBottom: false,
                attachLoadTopTriggerToNull: true,
                attachLoadDownTriggerToNull: true,
                hasHiddenItemsByVirtualScroll: () => false
            } as unknown as IIndicatorsControllerOptions;
            const {collection, controller} = initTest([{id: 1}], options);

            const items = collection.getCollection() as unknown as RecordSet;
            items.setMetaData({iterative: true});
            controller.updateOptions({
                ...options,
                items,
                model: collection,
                hasMoreDataToTop: true
            }, false);
            assert.isFalse(collection.getTopIndicator().isDisplayed());
            assert.isFalse(collection.getBottomIndicator().isDisplayed());

            fakeTimer.tick(2001);
            assert.isTrue(collection.getTopIndicator().isDisplayed());
            assert.isFalse(collection.getBottomIndicator().isDisplayed());

            controller.destroy(); // уничтожаем все таймеры
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
            controller.setViewportFilled(true);
            controller.onCollectionReset();
            assert.isTrue(collection.getTopIndicator().isDisplayed());
            assert.isTrue(collection.getBottomIndicator().isDisplayed());
        });

        it('hide global indicator', async () => {
            const {collection, controller} = initTest([{id: 1}], {});
            assert.isNotOk(collection.getGlobalIndicator());
            controller.displayGlobalIndicator(100);
            assert.isNotOk(collection.getGlobalIndicator()); // индикатор покажется только через 2с

            // ждем пока отобразится глобальный индикатор
            fakeTimer.tick(2001);
            assert.isOk(collection.getGlobalIndicator());

            controller.onCollectionReset();
            assert.isNotOk(collection.getGlobalIndicator());

            controller.destroy(); // уничтожаем все таймеры
        });

        it('end portioned search', async () => {
            const {collection, controller} = initTest([{id: 1}], {});
            controller.startDisplayPortionedSearch('bottom');
            // ждем пока отобразится индикатор порционного поиска
            fakeTimer.tick(2001);
            assert.isTrue(collection.getBottomIndicator().isDisplayed());

            controller.onCollectionReset();
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
            fakeTimer.tick(2001);
            assert.isTrue(collection.getBottomIndicator().isDisplayed());

            controller.destroy(); // уничтожаем все таймеры
        });

        it('hide portioned search indicator', () => {
            const {collection, controller} = initTest([{id: 1}], {});

            controller.setHasMoreData(true, false);
            collection.getCollection().setMetaData({iterative: true});
            controller.startDisplayPortionedSearch('top');
            assert.isFalse(collection.getTopIndicator().isDisplayed()); // индикатор покажется только через 2с
            // ждем пока отобразится индикатор порционного поиска
            fakeTimer.tick(2001);
            assert.isTrue(collection.getTopIndicator().isDisplayed());

            controller.setHasMoreData(false, false);
            collection.getCollection().setMetaData({iterative: true});
            controller.onCollectionReset();
            assert.isFalse(collection.getTopIndicator().isDisplayed());

            controller.destroy(); // уничтожаем все таймеры
        });
    });

    describe('onCollectionAdd', () => {
        it('hide global indicator', async () => {
            const {collection, controller} = initTest([{id: 1}], {});
            assert.isNotOk(collection.getGlobalIndicator());
            controller.displayGlobalIndicator(100);
            assert.isNotOk(collection.getGlobalIndicator()); // индикатор покажется только через 2с

            // ждем пока отобразится глобальный индикатор
            fakeTimer.tick(2001);
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
            fakeTimer.tick(2001);
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
            const {collection, controller} = initTest([{id: 1}], options);
            controller.setViewportFilled(true);
            controller.displayTopIndicator(false);
            controller.displayBottomIndicator();
            assert.isTrue(collection.getTopIndicator().isDisplayed());
            assert.isTrue(collection.getBottomIndicator().isDisplayed());

            collection.getCollection().setMetaData({iterative: true});
            controller.startDisplayPortionedSearch('bottom');

            assert.isFalse(collection.getTopIndicator().isDisplayed());
            assert.isFalse(collection.getBottomIndicator().isDisplayed());

            // ждем пока отобразится индикатор порционного поиска
            fakeTimer.tick(2001);
            assert.isFalse(collection.getTopIndicator().isDisplayed());
            assert.isTrue(collection.getBottomIndicator().isDisplayed());

            controller.destroy(); // уничтожаем все таймеры
        });

        it('recount indicators not stop display portioned search', async () => {
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
            controller.setViewportFilled(true);
            collection.getCollection().setMetaData({iterative: true});
            controller.startDisplayPortionedSearch('bottom');

            assert.isFalse(collection.getTopIndicator().isDisplayed());
            assert.isFalse(collection.getBottomIndicator().isDisplayed());

            controller.recountIndicators('all');

            // ждем пока отобразится индикатор порционного поиска
            fakeTimer.tick(2001);
            assert.isFalse(collection.getTopIndicator().isDisplayed());
            assert.isTrue(collection.getBottomIndicator().isDisplayed());

            controller.destroy(); // уничтожаем все таймеры
        });

        it('display portioned search in not infinity navigation', () => {
            const {collection, controller} = initTest([{id: 1}], {
                isInfinityNavigation: false,
                attachLoadDownTriggerToNull: true,
                hasMoreDataToBottom: true,
                hasHiddenItemsByVirtualScroll: () => false
            });

            collection.getCollection().setMetaData({iterative: true});
            controller.startDisplayPortionedSearch('bottom');

            // ждем пока отобразится индикатор порционного поиска
            fakeTimer.tick(2001);
            assert.isTrue(collection.getBottomIndicator().isDisplayed());

            // не должны скрыть индикатор порционного индикатора
            controller.recountIndicators('down');
            assert.isTrue(collection.getBottomIndicator().isDisplayed());

            controller.destroy(); // уничтожаем все таймеры
        });

        it('double start portioned search but stopCallback called once', async () => {
            const stopCallback = sinon.spy();
            const { controller } = initTest(
                [{id: 1}],
                { stopDisplayPortionedSearchCallback: stopCallback },
                {iterative: true }
            );

            controller.startDisplayPortionedSearch('bottom');
            fakeTimer.tick(1000);
            controller.startDisplayPortionedSearch('bottom');

            // ждем приостановки поиска
            fakeTimer.tick(30001);
            assert.isTrue(stopCallback.calledOnce);

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
            fakeTimer.tick(2001);
            assert.isOk(collection.getGlobalIndicator());

            controller.destroy(); // уничтожаем все таймеры
        });

        it('display global and display bottom indicator', async () => {
            const {collection, controller} = initTest([{id: 1}], {});
            assert.isNotOk(collection.getGlobalIndicator());

            controller.displayGlobalIndicator(0);

            assert.isNotOk(collection.getGlobalIndicator()); // индикатор покажется только через 2с

            // ждем пока отобразится индикатор
            fakeTimer.tick(1000);
            controller.displayBottomIndicator();
            assert.isFalse(collection.getBottomIndicator().isDisplayed());

            fakeTimer.tick(2001);

            assert.isTrue(collection.getBottomIndicator().isDisplayed());
            assert.isNotOk(collection.getGlobalIndicator());

            controller.destroy(); // уничтожаем все таймеры
        });
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

        it('should hide indicator if it was displayed', async () => {
            const {controller} = initTest([{id: 1}], {});
            // запустили таймер
            controller.displayGlobalIndicator(0);

            // ждем пока отобразится индикатор порционного поиска
            fakeTimer.tick(2001);

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
            fakeTimer.tick(2001);
            assert.isOk(collection.getGlobalIndicator());

            controller.hideGlobalIndicator();
            assert.isNotOk(collection.getGlobalIndicator());

            controller.destroy(); // уничтожаем все таймеры
        });

        it('should reset timer of display indicator', async () => {
            const {collection, controller} = initTest([{id: 1}], {});
            assert.isNotOk(collection.getGlobalIndicator());

            controller.displayGlobalIndicator(0);
            controller.hideGlobalIndicator(); // прерываем таймер

            // дожидается 2с и убеждаемся что индикатор так и не показался
            fakeTimer.tick(2001);
            assert.isNotOk(collection.getGlobalIndicator());

            controller.destroy(); // уничтожаем все таймеры
        });
    });

    describe('displayDrawingIndicator', () => {
        it('should display', () => {
            const {controller} = initTest([{id: 1}], {attachLoadTopTriggerToNull: true});
            const mockedIndicatorElement = getMockedIndicatorElement();
            controller.displayDrawingIndicator(mockedIndicatorElement, 'top');
            fakeTimer.tick(2001);
            assert.equal(mockedIndicatorElement.style.display, '');
            assert.equal(mockedIndicatorElement.style.position, 'sticky');
            assert.equal(mockedIndicatorElement.style.top, '0');
        });

        it('not should display by portioned search', () => {
            const {controller} = initTest([{id: 1}], {attachLoadTopTriggerToNull: true}, {iterative: true});
            const mockedIndicatorElement = getMockedIndicatorElement();
            controller.displayDrawingIndicator(mockedIndicatorElement, 'top');
            fakeTimer.tick(2001);
            assert.equal(mockedIndicatorElement.style.display, '');
            assert.equal(mockedIndicatorElement.style.position, '');
            assert.equal(mockedIndicatorElement.style.top, '');
        });

        it('not should display by options', () => {
            const {controller} = initTest([{id: 1}], {attachLoadTopTriggerToNull: false});
            const mockedIndicatorElement = getMockedIndicatorElement();
            controller.displayDrawingIndicator(mockedIndicatorElement, 'top');
            fakeTimer.tick(2001);
            assert.equal(mockedIndicatorElement.style.display, '');
            assert.equal(mockedIndicatorElement.style.position, '');
            assert.equal(mockedIndicatorElement.style.top, '');
        });
    });

    describe('hideDrawingIndicator', () => {
        it('should hide', () => {
            const {controller} = initTest([{id: 1}], {attachLoadTopTriggerToNull: true});
            const mockedIndicatorElement = getMockedIndicatorElement();
            controller.displayDrawingIndicator(mockedIndicatorElement, 'top');
            fakeTimer.tick(2001);
            controller.hideDrawingIndicator(mockedIndicatorElement, 'top');
            assert.equal(mockedIndicatorElement.style.display, 'none');
            assert.equal(mockedIndicatorElement.style.position, '');
            assert.equal(mockedIndicatorElement.style.top, '');
        });

        it('not should hide by portioned search', () => {
            const {controller} = initTest([{id: 1}], {attachLoadTopTriggerToNull: true}, {iterative: true});
            const mockedIndicatorElement = getMockedIndicatorElement();
            controller.hideDrawingIndicator(mockedIndicatorElement, 'top');
            assert.equal(mockedIndicatorElement.style.display, '');
            assert.equal(mockedIndicatorElement.style.position, '');
            assert.equal(mockedIndicatorElement.style.top, '');
        });

        it('not should hide by options', () => {
            const {controller} = initTest([{id: 1}], {attachLoadTopTriggerToNull: false});
            const mockedIndicatorElement = getMockedIndicatorElement();
            controller.hideDrawingIndicator(mockedIndicatorElement, 'top');
            assert.equal(mockedIndicatorElement.style.display, '');
            assert.equal(mockedIndicatorElement.style.position, '');
            assert.equal(mockedIndicatorElement.style.top, '');
        });
    });

    describe('shouldDisplayBottomIndicator', () => {
        it('not display if collection is empty', () => {
            const options: IIndicatorsControllerOptions = {
                isInfinityNavigation: true,
                hasMoreDataToBottom: true,
                attachLoadDownTriggerToNull: true,
                hasHiddenItemsByVirtualScroll: () => false
            } as unknown as IIndicatorsControllerOptions;
            const {controller} = initTest([], options);
            assert.isFalse(controller.shouldDisplayBottomIndicator());
        });
    });

    describe('shouldDisplayTopIndicator', () => {
        it('not display if collection is empty', () => {
            const options: IIndicatorsControllerOptions = {
                isInfinityNavigation: true,
                hasMoreDataToTop: true,
                attachLoadTopTriggerToNull: true,
                hasHiddenItemsByVirtualScroll: () => false
            } as unknown as IIndicatorsControllerOptions;
            const {controller} = initTest([], options);
            assert.isFalse(controller.shouldDisplayTopIndicator());
        });
    });
});
