//
describe('Controls/_baseList/Controllers/ScrollController/HandleCollectionChanges', () => {
/*    // https://docs.google.com/spreadsheets/d/1L7IHAIKBblk9nStYnT7q6a1LjyU3chqoDwTMA-wgpc0/edit#gid=0
    describe('addItems', () => {
        it('1. totalCount < pageSize => totalCount === pageSize', () => {
            const indexesChangedCallback = spy((result) => null);
            const environmentChangedCallback = spy((result) => null);
            const activeElementChangedCallback = spy((result) => null);

            const controller = initTest({
                virtualScrollConfig: {
                    pageSize: 5,
                    segmentSize: 2
                },
                indexesChangedCallback,
                environmentChangedCallback,
                activeElementChangedCallback
            });
            indexesChangedCallback.resetHistory();
            environmentChangedCallback.resetHistory();
            activeElementChangedCallback.resetHistory();

            const result = controller.addItems(0, 1, 5);
            assert.isUndefined(result); // чтобы не забыть удалить возврат результата

            assert.isTrue(indexesChangedCallback.calledOnce);
            assert.isTrue(
                indexesChangedCallback.withArgs({
                    startIndex: 0,
                    endIndex: 4
                }).calledOnce
            );
            assert.isFalse(environmentChangedCallback.called);
            // TODO assert.isFalse(activeElementChangedCallback.called);
        });

        it('2. totalCount < pageSize => totalCount < pageSize', () => {
            const indexesChangedCallback = spy((result) => null);
            const environmentChangedCallback = spy((result) => null);
            const activeElementChangedCallback = spy((result) => null);

            const controller = initTest({
                virtualScrollConfig: {
                    pageSize: 5,
                    segmentSize: 2
                },
                indexesChangedCallback,
                environmentChangedCallback,
                activeElementChangedCallback
            });
            indexesChangedCallback.resetHistory();
            environmentChangedCallback.resetHistory();
            activeElementChangedCallback.resetHistory();

            controller.addItems(0, 1, 4);
            assert.isTrue(indexesChangedCallback.calledOnce);
            assert.isTrue(
                indexesChangedCallback.withArgs({
                    startIndex: 0,
                    endIndex: 3
                }).calledOnce
            );
            assert.isFalse(environmentChangedCallback.called);
            // TODO assert.isFalse(activeElementChangedCallback.called);
        });

        it('3. totalCount < pageSize => totalCount > pageSize', () => {
            const indexesChangedCallback = spy((result) => null);
            const environmentChangedCallback = spy((result) => null);
            const activeElementChangedCallback = spy((result) => null);

            const controller = initTest({
                virtualScrollConfig: {
                    pageSize: 5,
                    segmentSize: 2
                },
                indexesChangedCallback,
                environmentChangedCallback,
                activeElementChangedCallback
            });
            indexesChangedCallback.resetHistory();
            environmentChangedCallback.resetHistory();
            activeElementChangedCallback.resetHistory();

            controller.addItems(0, 2, 6);
            assert.isTrue(indexesChangedCallback.calledOnce);
            assert.isTrue(
                indexesChangedCallback.withArgs({
                    startIndex: 0,
                    endIndex: 4
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
            // TODO assert.isFalse(activeElementChangedCallback.called);
        });

        it('4. totalCount === pageSize => totalCount > pageSize', () => {
            const indexesChangedCallback = spy((result) => null);
            const environmentChangedCallback = spy((result) => null);
            const activeElementChangedCallback = spy((result) => null);

            const controller = initTest({
                virtualScrollConfig: {
                    pageSize: 5,
                    segmentSize: 2
                },
                indexesChangedCallback,
                environmentChangedCallback,
                activeElementChangedCallback
            });
            indexesChangedCallback.resetHistory();
            environmentChangedCallback.resetHistory();
            activeElementChangedCallback.resetHistory();

            controller.addItems(0, 1, 5);

            assert.isFalse(indexesChangedCallback.called);
            assert.isTrue(environmentChangedCallback.calledOnce);
            assert.isTrue(
                environmentChangedCallback.withArgs({
                    hasItemsBackward: false,
                    hasItemsForward: true,
                    beforePlaceholderSize: 0,
                    afterPlaceholderSize: 0
                }).calledOnce
            );
            assert.isFalse(activeElementChangedCallback.called);
        });

        it('5. totalCount > pageSize => totalCount > pageSize', () => {
            const indexesChangedCallback = spy((result) => null);
            const environmentChangedCallback = spy((result) => null);
            const activeElementChangedCallback = spy((result) => null);

            const controller = initTest({
                virtualScrollConfig: {
                    pageSize: 5,
                    segmentSize: 2
                },
                indexesChangedCallback,
                environmentChangedCallback,
                activeElementChangedCallback
            });
            indexesChangedCallback.resetHistory();
            environmentChangedCallback.resetHistory();
            activeElementChangedCallback.resetHistory();

            controller.addItems(0, 1, 7);

            assert.isFalse(indexesChangedCallback.called);
            assert.isFalse(environmentChangedCallback.called);
            assert.isFalse(activeElementChangedCallback.called);
        });
    });

    // https://docs.google.com/spreadsheets/d/1L7IHAIKBblk9nStYnT7q6a1LjyU3chqoDwTMA-wgpc0/edit#gid=1433308660
    describe('removeItems', () => {
        it('1. totalCount < pageSize => totalCount < pageSize', () => {
            const indexesChangedCallback = spy((result) => null);
            const placeholdersChangedCallback = spy((result) => null);
            const hasItemsOutRangeChangedCallback = spy((result) => null);
            const activeElementChangedCallback = spy((result) => null);

            const controller = initTest({
                virtualScrollConfig: {
                    pageSize: 5,
                    segmentSize: 2
                },
                indexesChangedCallback,
                placeholdersChangedCallback,
                hasItemsOutRangeChangedCallback,
                activeElementChangedCallback
            });
            indexesChangedCallback.resetHistory();
            placeholdersChangedCallback.resetHistory();
            hasItemsOutRangeChangedCallback.resetHistory();
            activeElementChangedCallback.resetHistory();

            controller.removeItems(0, 1);

            assert.isTrue(indexesChangedCallback.calledOnce);
            assert.isTrue(
                indexesChangedCallback.withArgs({
                    startIndex: 0,
                    endIndex: 2
                }).calledOnce
            );
            assert.isFalse(placeholdersChangedCallback.called);
            assert.isFalse(hasItemsOutRangeChangedCallback.called);
            // TODO assert.isFalse(activeElementChangedCallback.called);
        });

        it('2. totalCount < pageSize => totalCount === 0', () => {
            const indexesChangedCallback = spy((result) => null);
            const environmentChangedCallback = spy((result) => null);
            const activeElementChangedCallback = spy((result) => null);

            const controller = initTest({
                virtualScrollConfig: {
                    pageSize: 5,
                    segmentSize: 2
                },
                indexesChangedCallback,
                environmentChangedCallback,
                activeElementChangedCallback
            });
            indexesChangedCallback.resetHistory();
            environmentChangedCallback.resetHistory();
            activeElementChangedCallback.resetHistory();

            controller.removeItems(0, 3, 0);

            assert.isTrue(indexesChangedCallback.calledOnce);
            assert.isTrue(
                indexesChangedCallback.withArgs({
                    startIndex: 0,
                    endIndex: 0
                }).calledOnce
            );
            assert.isFalse(environmentChangedCallback.called);
            assert.isTrue(activeElementChangedCallback.calledOnce);
            assert.isTrue(activeElementChangedCallback.withArgs(null).calledOnce);
        });

        it('3. totalCount === pageSize => totalCount < pageSize', () => {
            const indexesChangedCallback = spy((result) => null);
            const environmentChangedCallback = spy((result) => null);
            const activeElementChangedCallback = spy((result) => null);

            const controller = initTest({
                virtualScrollConfig: {
                    pageSize: 5,
                    segmentSize: 2
                },
                indexesChangedCallback,
                environmentChangedCallback,
                activeElementChangedCallback
            });
            indexesChangedCallback.resetHistory();
            environmentChangedCallback.resetHistory();
            activeElementChangedCallback.resetHistory();

            controller.removeItems(0, 1, 4);

            assert.isTrue(indexesChangedCallback.calledOnce);
            assert.isTrue(
                indexesChangedCallback.withArgs({
                    startIndex: 0,
                    endIndex: 3
                }).calledOnce
            );
            assert.isFalse(environmentChangedCallback.called);
            // TODO assert.isFalse(activeElementChangedCallback.called);
        });

        it('4. totalCount > pageSize => totalCount < pageSize', () => {
            const indexesChangedCallback = spy((result) => null);
            const environmentChangedCallback = spy((result) => null);
            const activeElementChangedCallback = spy((result) => null);

            const controller = initTest({
                virtualScrollConfig: {
                    pageSize: 5,
                    segmentSize: 2
                },
                indexesChangedCallback,
                environmentChangedCallback,
                activeElementChangedCallback
            });
            indexesChangedCallback.resetHistory();
            environmentChangedCallback.resetHistory();
            activeElementChangedCallback.resetHistory();

            controller.removeItems(0, 2, 4);

            assert.isTrue(indexesChangedCallback.calledOnce);
            assert.isTrue(
                indexesChangedCallback.withArgs({
                    startIndex: 0,
                    endIndex: 3
                }).calledOnce
            );
            assert.isTrue(environmentChangedCallback.calledOnce);
            assert.isTrue(
                environmentChangedCallback.withArgs({
                    hasItemsBackward: false,
                    hasItemsForward: false,
                    beforePlaceholderSize: 0,
                    afterPlaceholderSize: 0
                }).calledOnce
            );
            // TODO assert.isFalse(activeElementChangedCallback.called);
        });

        it('5. totalCount > pageSize => totalCount > pageSize', () => {
            const indexesChangedCallback = spy((result) => null);
            const environmentChangedCallback = spy((result) => null);
            const activeElementChangedCallback = spy((result) => null);

            const controller = initTest({
                virtualScrollConfig: {
                    pageSize: 5,
                    segmentSize: 2
                },
                indexesChangedCallback,
                environmentChangedCallback,
                activeElementChangedCallback
            });
            indexesChangedCallback.resetHistory();
            environmentChangedCallback.resetHistory();
            activeElementChangedCallback.resetHistory();

            controller.removeItems(0, 1, 6);

            assert.isFalse(indexesChangedCallback.called);
            assert.isFalse(environmentChangedCallback.called);
            assert.isFalse(activeElementChangedCallback.called);
        });
    });

    // https://docs.google.com/spreadsheets/d/1L7IHAIKBblk9nStYnT7q6a1LjyU3chqoDwTMA-wgpc0/edit#gid=1671414528
    describe('resetItems', () => {
        it('1. totalCount < pageSize => totalCount < pageSize && totalCount === oldTotalCount ', () => {
            const indexesChangedCallback = spy((result) => null);
            const environmentChangedCallback = spy((result) => null);
            const activeElementChangedCallback = spy((result) => null);

            const controller = initTest({
                virtualScrollConfig: {
                    pageSize: 5,
                    segmentSize: 2
                },
                indexesChangedCallback,
                environmentChangedCallback,
                activeElementChangedCallback
            });
            indexesChangedCallback.resetHistory();
            environmentChangedCallback.resetHistory();
            activeElementChangedCallback.resetHistory();

            const result = controller.resetItems(4);
            assert.isUndefined(result); // чтобы не забыть удалить возврат результата

            assert.isFalse(indexesChangedCallback.called);
            assert.isFalse(environmentChangedCallback.called);
            assert.isFalse(activeElementChangedCallback.called);
        });

        it('2. totalCount < pageSize => totalCount < pageSize && totalCount < oldTotalCount ', () => {
            const indexesChangedCallback = spy((result) => null);
            const environmentChangedCallback = spy((result) => null);
            const activeElementChangedCallback = spy((result) => null);

            const controller = initTest({
                virtualScrollConfig: {
                    pageSize: 5,
                    segmentSize: 2
                },
                indexesChangedCallback,
                environmentChangedCallback,
                activeElementChangedCallback
            });
            indexesChangedCallback.resetHistory();
            environmentChangedCallback.resetHistory();
            activeElementChangedCallback.resetHistory();

            controller.resetItems(3);

            assert.isTrue(indexesChangedCallback.calledOnce);
            assert.isTrue(indexesChangedCallback.withArgs({ startIndex: 0, endIndex: 2 }).calledOnce);
            assert.isFalse(environmentChangedCallback.called);
            // TODO assert.isFalse(activeElementChangedCallback.called);
        });

        it('3. totalCount < pageSize => totalCount === pageSize ', () => {
            const indexesChangedCallback = spy((result) => null);
            const environmentChangedCallback = spy((result) => null);
            const activeElementChangedCallback = spy((result) => null);

            const controller = initTest({
                virtualScrollConfig: {
                    pageSize: 5,
                    segmentSize: 2
                },
                indexesChangedCallback,
                environmentChangedCallback,
                activeElementChangedCallback
            });
            indexesChangedCallback.resetHistory();
            environmentChangedCallback.resetHistory();
            activeElementChangedCallback.resetHistory();

            controller.resetItems(5);

            assert.isTrue(indexesChangedCallback.calledOnce);
            assert.isTrue(indexesChangedCallback.withArgs({startIndex: 0, endIndex: 4}).calledOnce);
            assert.isFalse(environmentChangedCallback.called);
            // TODO assert.isFalse(activeElementChangedCallback.called);
        });

        it('4. totalCount < pageSize => totalCount > pageSize ', () => {
            const indexesChangedCallback = spy((result) => null);
            const environmentChangedCallback = spy((result) => null);
            const activeElementChangedCallback = spy((result) => null);

            const controller = initTest({
                virtualScrollConfig: {
                    pageSize: 5,
                    segmentSize: 2
                },
                indexesChangedCallback,
                environmentChangedCallback,
                activeElementChangedCallback
            });
            indexesChangedCallback.resetHistory();
            environmentChangedCallback.resetHistory();
            activeElementChangedCallback.resetHistory();

            controller.resetItems(6);

            assert.isTrue(indexesChangedCallback.calledOnce);
            assert.isTrue(indexesChangedCallback.withArgs({ startIndex: 0, endIndex: 4 }).calledOnce);
            assert.isTrue(environmentChangedCallback.calledOnce);
            assert.isTrue(
                environmentChangedCallback.withArgs({
                    hasItemsBackward: false,
                    hasItemsForward: true,
                    beforePlaceholderSize: 0,
                    afterPlaceholderSize: 0
                }).calledOnce
            );
            // TODO assert.isFalse(activeElementChangedCallback.called);
        });

        it('5. totalCount > pageSize => totalCount < pageSize ', () => {
            const indexesChangedCallback = spy((result) => null);
            const environmentChangedCallback = spy((result) => null);
            const activeElementChangedCallback = spy((result) => null);

            const controller = initTest({
                virtualScrollConfig: {
                    pageSize: 5,
                    segmentSize: 2
                },
                indexesChangedCallback,
                environmentChangedCallback,
                activeElementChangedCallback
            });
            indexesChangedCallback.resetHistory();
            environmentChangedCallback.resetHistory();
            activeElementChangedCallback.resetHistory();

            controller.resetItems(4);

            assert.isTrue(indexesChangedCallback.calledOnce);
            assert.isTrue(indexesChangedCallback.withArgs({ startIndex: 0, endIndex: 3 }).calledOnce);
            assert.isTrue(environmentChangedCallback.calledOnce);
            assert.isTrue(
                environmentChangedCallback.withArgs({
                    hasItemsBackward: false,
                    hasItemsForward: false,
                    beforePlaceholderSize: 0,
                    afterPlaceholderSize: 0
                }).calledOnce
            );
            // TODO assert.isFalse(activeElementChangedCallback.called);
        });

        it('6. totalCount > pageSize => totalCount === pageSize ', () => {
            const indexesChangedCallback = spy((result) => null);
            const environmentChangedCallback = spy((result) => null);
            const activeElementChangedCallback = spy((result) => null);

            const controller = initTest({
                virtualScrollConfig: {
                    pageSize: 5,
                    segmentSize: 2
                },
                indexesChangedCallback,
                environmentChangedCallback,
                activeElementChangedCallback
            });
            indexesChangedCallback.resetHistory();
            environmentChangedCallback.resetHistory();
            activeElementChangedCallback.resetHistory();

            controller.resetItems(5);

            assert.isFalse(indexesChangedCallback.called);
            assert.isTrue(environmentChangedCallback.calledOnce);
            assert.isTrue(
                environmentChangedCallback.withArgs({
                    hasItemsBackward: false,
                    hasItemsForward: false,
                    beforePlaceholderSize: 0,
                    afterPlaceholderSize: 0
                }).calledOnce
            );
            assert.isFalse(activeElementChangedCallback.called);
        });

        it('7. totalCount > pageSize => totalCount > pageSize ', () => {
            const indexesChangedCallback = spy((result) => null);
            const environmentChangedCallback = spy((result) => null);
            const activeElementChangedCallback = spy((result) => null);

            const controller = initTest({
                virtualScrollConfig: {
                    pageSize: 5,
                    segmentSize: 2
                },
                indexesChangedCallback,
                environmentChangedCallback,
                activeElementChangedCallback
            });
            indexesChangedCallback.resetHistory();
            environmentChangedCallback.resetHistory();
            activeElementChangedCallback.resetHistory();

            controller.resetItems(7);

            assert.isFalse(indexesChangedCallback.called);
            assert.isFalse(environmentChangedCallback.called);
            assert.isFalse(activeElementChangedCallback.called);
        });

        it('8. totalCount === pageSize => totalCount < pageSize ', () => {
            const indexesChangedCallback = spy((result) => null);
            const environmentChangedCallback = spy((result) => null);
            const activeElementChangedCallback = spy((result) => null);

            const controller = initTest({
                virtualScrollConfig: {
                    pageSize: 5,
                    segmentSize: 2
                },
                indexesChangedCallback,
                environmentChangedCallback,
                activeElementChangedCallback
            });
            indexesChangedCallback.resetHistory();
            environmentChangedCallback.resetHistory();
            activeElementChangedCallback.resetHistory();

            controller.resetItems(4);

            assert.isTrue(indexesChangedCallback.calledOnce);
            assert.isTrue(
                indexesChangedCallback.withArgs({
                    startIndex: 0,
                    endIndex: 3
                }).calledOnce
            );
            assert.isTrue(environmentChangedCallback.calledOnce);
            assert.isTrue(
                environmentChangedCallback.withArgs({
                    hasItemsBackward: false,
                    hasItemsForward: false,
                    beforePlaceholderSize: 0,
                    afterPlaceholderSize: 0
                }).calledOnce
            );
            // TODO assert.isFalse(activeElementChangedCallback.called);
        });

        it('9. totalCount === pageSize => totalCount > pageSize ', () => {
            const indexesChangedCallback = spy((result) => null);
            const environmentChangedCallback = spy((result) => null);
            const activeElementChangedCallback = spy((result) => null);

            const controller = initTest({
                virtualScrollConfig: {
                    pageSize: 5,
                    segmentSize: 2
                },
                indexesChangedCallback,
                environmentChangedCallback,
                activeElementChangedCallback
            });
            indexesChangedCallback.resetHistory();
            environmentChangedCallback.resetHistory();
            activeElementChangedCallback.resetHistory();

            controller.resetItems(6);

            assert.isFalse(indexesChangedCallback.called);
            assert.isTrue(environmentChangedCallback.calledOnce);
            assert.isTrue(
                environmentChangedCallback.withArgs({
                    hasItemsBackward: false,
                    hasItemsForward: true,
                    beforePlaceholderSize: 0,
                    afterPlaceholderSize: 0
                }).calledOnce
            );
            // TODO assert.isFalse(activeElementChangedCallback.called);
        });
    });*/
});
