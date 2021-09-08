import {assert} from 'chai';
import {spy, replace} from 'sinon';
import {getCorrectBaseControlConfig, getCorrectBaseControlConfigAsync} from '../BaseControl.test';
import {Memory} from 'Types/source';
import {BaseControl, IBaseControlOptions} from 'Controls/baseList';
import { detection } from 'Env/Env';

function initTest(data: object[], options: Partial<IBaseControlOptions> = {}): BaseControl {
    const baseControlOptions = getCorrectBaseControlConfig({
        source: new Memory({
            keyProperty: options.keyProperty || 'id',
            data
        }),
        ...options
    });
    const baseControl = new BaseControl(baseControlOptions, {});
    baseControl._beforeMount(baseControlOptions);
    baseControl.saveOptions(baseControlOptions);
    return baseControl;
}

describe('Controls/list_clean/Indicators/BaseControl', () => {
    describe('_afterMount', () => {
        it('is mobile platform', () => {
            const options = {
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
                attachLoadTopTriggerToNull: true
            };
            const items = [ { id: 1 }, { id: 2 }, { id: 3 } ];
            const baseControl = initTest(items, options);
            const model = baseControl.getViewModel();
            detection.isMobilePlatform = true;

            baseControl._afterMount();
            assert.isTrue(model.getTopIndicator().isDisplayed());
            assert.isFalse(model.getTopLoadingTrigger().isDisplayed());

            const scrollToFirstItemPromise = Promise.resolve();
            replace(
                baseControl,
                '_scrollToFirstItem',
                () => scrollToFirstItemPromise
            );
            baseControl._afterRender();
            // до скролла триггер не должен показаться
            assert.isFalse(model.getTopLoadingTrigger().isDisplayed());
            // проверяем что после скролла покажется верхний триггер
            return scrollToFirstItemPromise.then(() => {
                assert.isTrue(model.getTopLoadingTrigger().isDisplayed());
                detection.isMobilePlatform = false;
            });
        });

        describe('viewport is not filled by items', () => {
            it('has more to top', async () => {
                const baseControlOptions = await getCorrectBaseControlConfigAsync({
                    source: new Memory({
                        keyProperty: 'id',
                        data: [ { id: 1 }, { id: 2 } ]
                    }),
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
                    attachLoadTopTriggerToNull: true,
                    attachLoadDownTriggerToNull: true
                });
                const baseControl = new BaseControl(baseControlOptions, {});
                baseControl._beforeMount(baseControlOptions);
                baseControl.saveOptions(baseControlOptions);
                const model = baseControl.getViewModel();

                baseControl._viewSize = 100;
                baseControl._viewportSize = 500;

                baseControl._afterMount();
                assert.isTrue(model.getTopIndicator().isDisplayed());
                assert.isTrue(model.getTopLoadingTrigger().isDisplayed());
                assert.isFalse(model.getBottomIndicator().isDisplayed());
            });

            it('has more to bottom', async () => {
                const baseControlOptions = await getCorrectBaseControlConfigAsync({
                    source: new Memory({
                        keyProperty: 'id',
                        data: [ { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 } ]
                    }),
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
                    attachLoadTopTriggerToNull: true,
                    attachLoadDownTriggerToNull: true
                });
                const baseControl = new BaseControl(baseControlOptions, {});
                baseControl._beforeMount(baseControlOptions);
                baseControl.saveOptions(baseControlOptions);
                const model = baseControl.getViewModel();

                baseControl._viewSize = 100;
                baseControl._viewportSize = 500;

                baseControl._afterMount();
                assert.isFalse(model.getTopIndicator().isDisplayed());
                assert.isFalse(model.getTopLoadingTrigger().isDisplayed());
                assert.isTrue(model.getBottomIndicator().isDisplayed());
                assert.isTrue(model.getBottomLoadingTrigger().isDisplayed());
            });
        });
    });

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
