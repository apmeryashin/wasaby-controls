import { assert } from 'chai';
import {getCalcMode, getScrollMode} from 'Controls/_baseList/Controllers/ScrollController/ScrollUtil';

describe('Controls/_baseList/Controllers/ScrollUtil', () => {
    describe('getCalcMode', () => {
        it('items loaded by trigger', () => {
            const params = {
                range: {
                    startIndex: 0,
                    endIndex: 5
                },
                virtualPageSize: 5,
                scrolledToBackwardEdge: true,
                scrolledToForwardEdge: false,
                newItemsIndex: 0,
                itemsLoadedByTrigger: true,
                portionedLoading: false
            };
            assert.equal(getCalcMode(params), 'shift');
        });

        it('portioned loading', () => {
            let params = {
                range: {
                    startIndex: 0,
                    endIndex: 5
                },
                virtualPageSize: 5,
                scrolledToBackwardEdge: true,
                scrolledToForwardEdge: false,
                newItemsIndex: 0,
                itemsLoadedByTrigger: true,
                portionedLoading: true
            };
            assert.equal(getCalcMode(params), 'nothing');

            params = {
                ...params,
                range: {
                    startIndex: 0,
                    endIndex: 3
                }
            };
            assert.equal(getCalcMode(params), 'shift');
        });

        it('scrolled to backward edge', () => {
            let params = {
                range: {
                    startIndex: 0,
                    endIndex: 5
                },
                virtualPageSize: 5,
                scrolledToBackwardEdge: true,
                scrolledToForwardEdge: false,
                newItemsIndex: 0,
                itemsLoadedByTrigger: false,
                portionedLoading: false
            };
            assert.equal(getCalcMode(params), 'nothing');

            params = {
                ...params,
                range: {
                    startIndex: 0,
                    endIndex: 3
                }
            };
            assert.equal(getCalcMode(params), 'extend');
        });

        it('scrolled to forward edge', () => {
            let params = {
                range: {
                    startIndex: 0,
                    endIndex: 5
                },
                virtualPageSize: 5,
                scrolledToBackwardEdge: false,
                scrolledToForwardEdge: true,
                newItemsIndex: 0,
                itemsLoadedByTrigger: false,
                portionedLoading: false
            };
            assert.equal(getCalcMode(params), 'nothing');

            params = {
                ...params,
                range: {
                    startIndex: 0,
                    endIndex: 3
                }
            };
            assert.equal(getCalcMode(params), 'extend');

            params = {
                ...params,
                range: {
                    startIndex: 0,
                    endIndex: 3
                },
                newItemsIndex: 6
            };
            assert.equal(getCalcMode(params), 'shift');
        });

        it('scrolled to middle', () => {
            let params = {
                range: {
                    startIndex: 0,
                    endIndex: 5
                },
                virtualPageSize: 5,
                scrolledToBackwardEdge: false,
                scrolledToForwardEdge: false,
                newItemsIndex: 0,
                itemsLoadedByTrigger: false,
                portionedLoading: false
            };
            assert.equal(getCalcMode(params), 'nothing');

            params = {
                ...params,
                range: {
                    startIndex: 0,
                    endIndex: 3
                }
            };
            assert.equal(getCalcMode(params), 'shift');
        });
    });

    describe('getScrollMode', () => {
        it('items loaded by trigger', () => {
            const params = {
                range: {
                    startIndex: 0,
                    endIndex: 5
                },
                virtualPageSize: 5,
                scrolledToBackwardEdge: false,
                scrolledToForwardEdge: false,
                newItemsIndex: 0,
                itemsLoadedByTrigger: true,
                portionedLoading: false
            };
            assert.equal(getScrollMode(params), 'fixed');
        });

        it('scrolled to backward edge', () => {
            const params = {
                range: {
                    startIndex: 0,
                    endIndex: 5
                },
                virtualPageSize: 5,
                scrolledToBackwardEdge: true,
                scrolledToForwardEdge: false,
                newItemsIndex: 0,
                itemsLoadedByTrigger: false,
                portionedLoading: false
            };
            assert.equal(getScrollMode(params), 'unfixed');
        });

        it('scrolled to forward edge', () => {
            let params = {
                range: {
                    startIndex: 0,
                    endIndex: 3
                },
                virtualPageSize: 5,
                scrolledToBackwardEdge: false,
                scrolledToForwardEdge: true,
                newItemsIndex: 0,
                itemsLoadedByTrigger: false,
                portionedLoading: false
            };
            assert.equal(getScrollMode(params), 'fixed');

            params = {
                ...params,
                newItemsIndex: 3
            };
            assert.equal(getScrollMode(params), 'fixed');

            params = {
                ...params,
                newItemsIndex: 0,
                range: {
                    startIndex: 0,
                    endIndex: 5
                }
            };
            assert.equal(getScrollMode(params), 'unfixed');

            params = {
                ...params,
                newItemsIndex: 5
            };
            assert.equal(getScrollMode(params), 'unfixed');
        });

        it('scrolled to middle', () => {
            let params = {
                range: {
                    startIndex: 0,
                    endIndex: 5
                },
                virtualPageSize: 5,
                scrolledToBackwardEdge: false,
                scrolledToForwardEdge: false,
                newItemsIndex: 0,
                itemsLoadedByTrigger: false,
                portionedLoading: false
            };
            assert.equal(getScrollMode(params), 'fixed');

            params = {
                ...params,
                newItemsIndex: 3
            };
            assert.equal(getScrollMode(params), 'fixed');

            params = {
                ...params,
                newItemsIndex: 6
            };
            assert.equal(getScrollMode(params), 'fixed');
        });
    });
});
