import {spy} from 'sinon';
import {initTest} from 'ControlsUnit/baseList/Controllers/ScrollController/InitTest';
import {assert} from 'chai';

describe('Controls/_baseList/Controllers/ScrollController/Scroll', () => {
    describe('scrollTo', () => {
        describe('nextPage', () => {

            // вьюпорт не заполнен, скроллить некуда, ничего не изменится и не вызовется
            it('1. viewport is not filled, nowhere to scroll', () => {
                const indexesChangedCallback = spy((result) => null);
                const environmentChangedCallback = spy((result) => null);
                const activeElementChangedCallback = spy((result) => null);

                const controller = initTest({
                    virtualScrollConfig: {
                        pageSize: 5,
                        segmentSize: 2
                    },
                    viewportSize: 300,
                    itemsSizes: [
                        {height: 100, offsetTop: 0},
                        {height: 100, offsetTop: 100},
                        {height: 100, offsetTop: 200}
                    ],
                    indexesChangedCallback,
                    environmentChangedCallback,
                    activeElementChangedCallback
                });
                indexesChangedCallback.resetHistory();
                environmentChangedCallback.resetHistory();
                activeElementChangedCallback.resetHistory();

                // TODO
                /*const result = controller.scrollToPage('forward');

                return result.then((indexes) => {
                    assert.deepEqual(indexes, {
                        firstVisibleItemIndex: 0,
                        lastVisibleItemIndex: 3
                    });

                    assert.isFalse(indexesChangedCallback.calledOnce);
                    assert.isFalse(environmentChangedCallback.called);
                    assert.isFalse(activeElementChangedCallback.called);
                })*/
            });

            // данные занимают весь вьюпорт, скроллим к след странице
            // => должно измениться: индексы крайних видимых элементов,
            // активный элемент, диапазон не сместился
            it('2.', () => {
                const indexesChangedCallback = spy((result) => null);
                const environmentChangedCallback = spy((result) => null);
                const activeElementChangedCallback = spy((result) => null);

                const controller = initTest({
                    virtualScrollConfig: {
                        pageSize: 6,
                        segmentSize: 2
                    },
                    viewportSize: 500,
                    itemsSizes: [
                        {height: 200, offsetTop: 0},
                        {height: 200, offsetTop: 200},
                        {height: 200, offsetTop: 400},
                        {height: 200, offsetTop: 600},
                        {height: 200, offsetTop: 800},
                        {height: 200, offsetTop: 1000}
                    ],
                    indexesChangedCallback,
                    environmentChangedCallback,
                    activeElementChangedCallback
                });
                indexesChangedCallback.resetHistory();
                environmentChangedCallback.resetHistory();
                activeElementChangedCallback.resetHistory();

                // TODO
                /*const result = controller.scrollToPage('forward');

                assert.deepEqual(result, {
                    firstVisibleItemIndex: 2,
                    lastVisibleItemIndex: 4
                });
                assert.isFalse(indexesChangedCallback.calledOnce);
                assert.isFalse(environmentChangedCallback.called);
                assert.isTrue(activeElementChangedCallback.calledOnce);
                assert.isTrue(activeElementChangedCallback.withArgs(3).calledOnce);*/
            });

            // 3. достигли конца, вызвался соответствующий колбэк, pageSize заполнился и индексы изменились
            it('3.', () => {
                const indexesChangedCallback = spy((result) => null);
                const environmentChangedCallback = spy((result) => null);
                const activeElementChangedCallback = spy((result) => null);
                const itemsEndedCallback = spy((result) => null);

                const controller = initTest({
                    virtualScrollConfig: {
                        pageSize: 7,
                        segmentSize: 2
                    },
                    viewportSize: 500,
                    itemsSizes: [
                        {height: 200, offsetTop: 0},
                        {height: 200, offsetTop: 200},
                        {height: 200, offsetTop: 400},
                        {height: 200, offsetTop: 600},
                        {height: 200, offsetTop: 800}
                    ],
                    indexesChangedCallback,
                    environmentChangedCallback,
                    activeElementChangedCallback,
                    itemsEndedCallback
                });
                indexesChangedCallback.resetHistory();
                environmentChangedCallback.resetHistory();
                activeElementChangedCallback.resetHistory();
                itemsEndedCallback.resetHistory();

                // TODO
                /*const result = controller.scrollTo('nextPage');

                assert.deepEqual(result, {
                    firstVisibleItemIndex: 2,
                    lastVisibleItemIndex: 4
                });
                assert.isTrue(indexesChangedCallback.calledOnce);
                assert.isTrue(
                    indexesChangedCallback.withArgs({
                        startIndex: 0,
                        endIndex: 7
                    }).calledOnce
                );
                assert.isTrue(environmentChangedCallback.calledOnce);
                assert.isTrue(
                    environmentChangedCallback.withArgs({
                        hasItemsBackward: false,
                        hasItemsForward: true,
                        beforePlaceholderSize: 0,
                        afterPlaceholderSize: 0
                    }).calledOnce
                );
                assert.isTrue(activeElementChangedCallback.calledOnce);
                assert.isTrue(activeElementChangedCallback.withArgs(3).calledOnce);
                assert.isTrue(itemsEndedCallback.calledOnce);*/
            });
        });
    });

    describe('scrollToItem', () => {
        // implement
    });

    describe('scrollToPosition', () => {
        // implement
    });
});
