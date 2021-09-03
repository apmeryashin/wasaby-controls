import {assert} from 'chai';
import {spy} from 'sinon';
import {getCorrectBaseControlConfig, getCorrectBaseControlConfigAsync} from '../BaseControl.test';
import {Memory} from 'Types/source';
import {BaseControl} from 'Controls/baseList';

describe('Controls/list_clean/Indicators/BaseControl', () => {
    describe('onCollectionChanged', () => {
        it('not throw errors', async () => {
            const options = getCorrectBaseControlConfig({
                source: new Memory({
                    keyProperty: 'id',
                    data: [ { id: 1 } ]
                })
            });
            const baseControl = new BaseControl(options, {});
            await baseControl._beforeMount(options);
            baseControl.saveOptions(options);

            const newOptions = getCorrectBaseControlConfig({
                source: new Memory({
                    keyProperty: 'id',
                    data: [ { id: 1 }, { id: 2 } ]
                }),
                viewModelConstructor: 'Controls/grid:GridCollection',
                columns: []
            });
            assert.doesNotThrow(baseControl._beforeUpdate.bind(baseControl, newOptions));
        });
    });

    describe('_onMouseEnter', () => {
        beforeEach(() => {
            global.window = {
                requestAnimationFrame: (callback) => {
                    callback();
                }
            };
        });
        afterEach(() => {
            global.window = undefined;
        });
        it('not display top indicator, display trigger', async () => {
            const source = new Memory({
                keyProperty: 'id',
                data: [ { id: 1 }, { id: 2 } ]
            });
            const options = await getCorrectBaseControlConfigAsync({
                navigation: {
                    source: 'page',
                    sourceConfig: {
                        pageSize: 1,
                        page: 2,
                        hasMore: false
                    }
                },
                source,
                attachLoadTopTriggerToNull: true
            });
            const baseControl = new BaseControl(options, {});
            await baseControl._beforeMount(options);
            baseControl.saveOptions(options);
            const model = baseControl.getViewModel();

            baseControl._mouseEnter({});

            assert.isFalse(model.getTopIndicator().isDisplayed());
            assert.isTrue(model.getTopLoadingTrigger().isDisplayed());
        });

        it('display top indicator, display trigger', async () => {
            const source = new Memory({
                keyProperty: 'id',
                data: [ { id: 1 }, { id: 2 }, { id: 3 } ]
            });
            const options = await getCorrectBaseControlConfigAsync({
                navigation: {
                    source: 'page',
                    view: 'infinity',
                    sourceConfig: {
                        direction: 'bothways',
                        pageSize: 1,
                        page: 2,
                        hasMore: false
                    }
                },
                source,
                attachLoadTopTriggerToNull: true
            });
            const baseControl = new BaseControl(options, {});
            await baseControl._beforeMount(options);
            baseControl.saveOptions(options);
            const model = baseControl.getViewModel();

            baseControl._mouseEnter({});

            assert.isTrue(model.getTopIndicator().isDisplayed());
            assert.isFalse(model.getTopLoadingTrigger().isDisplayed());

            const spyScrollToFirstItem = spy(baseControl, '_scrollToFirstItem');
            baseControl._afterRender();
            assert.isTrue(spyScrollToFirstItem.called);
        });
    });
});
