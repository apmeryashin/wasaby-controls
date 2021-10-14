import SizeAndVisibilityObserver from 'Controls/_scroll/StickyBlock/Controller/SizeAndVisibilityObserver';
import {getNextStickyId} from 'Controls/scroll';
import * as sinon from 'sinon';

function getContainer() {
    return {
        offsetParent: {},
        getBoundingClientRect() {
            return {height: 500};
        }
    };
}

function getHeader() {
    return {
        getOffset: function () {
            return 0;
        },
        getHeaderContainer: function () {
            return this._container;
        },
        _id: getNextStickyId(),
        _container: getContainer(),
        height: 10,
        resetSticky: sinon.fake(),
        restoreSticky: sinon.fake(),
        updateShadowVisibility: sinon.fake(),
        offsetTop: 0,
        index: getNextStickyId()
    };
}

describe('SizeAndVisibilityObserver', () => {
    let component, container;

    beforeEach(function () {
        global.document = {
            body: {}
        };
        component = new SizeAndVisibilityObserver(() => undefined, () => undefined);
        container = {
            scrollTop: 0,
            scrollHeight: 100,
            clientHeight: 100,
            children: [{}]
        };
        component._canScroll = true;
        // sinon.stub(StickyHeaderUtils, 'isHidden').returns(false);
        // sinon.stub(scroll._stickyHeaderController, '_isVisible').returns(true);
    });

    afterEach(function () {
        sinon.restore();
        global.document = undefined;
    });

    describe('constructor', function () {
        it('should set _headers', function () {
            component = new SizeAndVisibilityObserver(() => undefined, () => undefined, {1: 'test'});
            assert.equal(component._headers[1], 'test');
        });
    });

    describe('_getStickyHeaderElements', function () {

        it('should returns [header.container]', function () {
            const header = getHeader();
            component._getStickyHeaderElements(header);
            assert.deepEqual(component._getStickyHeaderElements(header), [header.getHeaderContainer()]);
        });
        it('should returns array of all headers in group', function () {
            const header = getHeader();
            header.getChildrenHeaders = function () {
                return [{
                    inst: {
                        getHeaderContainer: function () {
                            return 'container1';
                        }
                    }
                }, {
                    inst: {
                        getHeaderContainer: function () {
                            return 'container2';
                        }
                    }
                }];
            };
            component._getStickyHeaderElements(header);
            assert.deepEqual(component._getStickyHeaderElements(header), ['container1', 'container2']);
        });
    });

    describe('_isHeaderOfGroup', () => {
        it('should return false if headers is empty', () => {
            component._headers = {};
            const res = component._isHeaderOfGroup(1);
            assert.isFalse(res);
        });

        it('should return false', () => {
            component._headers = {
                1: {field: '1'}
            };
            const res = component._isHeaderOfGroup(1);
            assert.isFalse(res);
        });

        it('should return true', () => {
            component._headers = {
                1: {field: '1'}
            };
            const res = component._isHeaderOfGroup(2);
            assert.isTrue(res);
        });
    });

    describe('_resizeObserverCallback', () => {
        beforeEach(() => {
            component._initialized = true;
        });

        it('should push new elements to array of heights', () => {
            const header = getHeader();
            const entries = [
                {
                    target: header.getHeaderContainer(),
                    contentRect: {
                        height: 200
                    }
                }
            ];
            sinon.stub(component, '_getHeaderFromNode').returns(header);
            sinon.stub(component, '_isHeaderOfGroup').returns(false);
            component._resizeObserverCallback(entries);

            assert.equal(component._elementsHeight.length, entries.length);
        });

        it('should call _getGroupByHeader and resizeHandler if header is group', function () {
            const header = {
                id: 1,
                getHeaderContainer: function() {
                    return this._container;
                }
            };
            const entries = [
                {
                    target: header.getHeaderContainer(),
                    contentRect: {
                        height: 200
                    }
                }
            ];
            const resizeHandlerStub = sinon.fake();
            const operation = 'add';
            sinon.stub(component, '_getHeaderFromNode').returns(header);
            sinon.stub(component, '_getElementHeightEntry').returns({value: 1});
            sinon.stub(component, '_getOperationForHeadersStack').returns(operation);
            sinon.stub(component, '_resizeHeadersCallback');
            const getGroupByHeaderStub = sinon.stub(component, '_getGroupByHeader').returns({
                id: 1,
                inst: {
                    resizeHandler: resizeHandlerStub
                }
            });

            component._headers = {1: header};
            component._resizeObserverCallback(entries);
            sinon.assert.calledOnce(getGroupByHeaderStub);
            sinon.assert.calledOnce(resizeHandlerStub);
        });

        it('should call _resizeHeadersCallback with correct operation', () => {
            const header = {
                index: 1,
                getHeaderContainer: function() {
                    return this._container;
                }
            };
            const entries = [
                {
                    target: header.getHeaderContainer(),
                    contentRect: {
                        height: 200
                    }
                }
            ];
            const operation = 'add';
            sinon.stub(component, '_getHeaderFromNode').returns(header);
            sinon.stub(component, '_getElementHeightEntry').returns({value: 1});
            sinon.stub(component, '_getOperationForHeadersStack').returns(operation);
            const resizeHeadersCallbackStub = sinon.stub(component, '_resizeHeadersCallback');

            const header = {};
            component._headers = {1: header};
            component._resizeObserverCallback(entries);
            const result = {
                1: {
                    header,
                    operation
                }
            };
            sinon.assert.calledWith(resizeHeadersCallbackStub, result);
        });

        it('should set height to element (100 to 200) and called changeHeadersStackByHeader', () => {
            const result = 200;
            const entries = [
                {
                    target: 0,
                    contentRect: {
                        height: result
                    }
                }
            ];
            component._elementsHeight = [
                {
                    key: 0,
                    value: 100
                }
            ];
            sinon.stub(component, '_getHeaderFromNode').returns(getHeader());
            sinon.stub(component, '_resizeHeadersCallback');
            sinon.stub(component, '_isHeaderOfGroup').returns(false);
            component._resizeObserverCallback(entries);
            sinon.assert.called(component._resizeHeadersCallback);

            assert.equal(component._elementsHeight[0].value, result);
        });

        it('should set height to element (100 to 0) and called changeHeadersStackByHeader', () => {
            const result = 0;
            const entries = [
                {
                    target: 0,
                    contentRect: {
                        height: result
                    }
                }
            ];
            component._elementsHeight = [
                {
                    key: 0,
                    value: 100
                }
            ];
            component._initialized = true;
            component._headers = [1];
            sinon.stub(component, '_getHeaderFromNode').returns(0);
            sinon.stub(component, '_resizeHeadersCallback');
            component._resizeObserverCallback(entries);
            sinon.assert.calledOnce(component._resizeHeadersCallback);

            assert.equal(component._elementsHeight[0].value, result);
        });

        it('should\' update headers if scroll container is hidden', () => {
            component._container = {
                closest: sinon.stub().returns(true)
            };
            sinon.stub(component, '_resizeHeadersCallback');
            sinon.stub(component, '_getHeaderFromNode');

            component._resizeObserverCallback([]);

            sinon.assert.notCalled(component._resizeHeadersCallback);
        });
    });
});
