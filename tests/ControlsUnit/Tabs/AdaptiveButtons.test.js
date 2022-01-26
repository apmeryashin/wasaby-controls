define([
    'Controls/tabs',
    'Types/source',
    'Types/entity',
    'Types/collection',
    'Controls/Utils/getFontWidth'
], function(tabsMod, sourceLib, entity, collection, getFontWidthUtil) {
    describe('Controls/_tabs/AdaptiveButtons', function() {
        const data = [
            {
                id: 1,
                title: 'Первый'
            },
            {
                id: 2,
                title: 'Второй'
            },
            {
                id: 3,
                title: 'Третий'
            }
        ];
        const items = new collection.RecordSet({
            keyProperty: 'id', rawData: data
        });
        const adaptiveButtons = new tabsMod.AdaptiveButtons();
        it('_calcVisibleItems', function () {
            adaptiveButtons._getItemsWidth = () => {
                return [50, 50, 50];
            };
            adaptiveButtons._moreButtonWidth = 10;
            const options = {
                align: 'left',
                displayProperty: 'title',
                containerWidth: 120,
                selectedKey: 1
            };

            adaptiveButtons._calcVisibleItems(items, options, options.selectedKey);
            assert.deepEqual(adaptiveButtons._visibleItems.getRawData(), [{
                canShrink: false,
                id: 1,
                title: 'Первый'
            }, {
                canShrink: true,
                id: 2,
                title: 'Второй'
            }
            ]);

            options.selectedKey = 3;
            adaptiveButtons._calcVisibleItems(items, options, options.selectedKey);
            assert.deepEqual(adaptiveButtons._visibleItems.getRawData(), [{
                canShrink: false,
                id: 1,
                title: 'Первый'
            }, {
                canShrink: true,
                id: 3,
                title: 'Третий'
            }
            ]);
        });
        it('_menuItemClickHandler', function() {
            const buttons = new tabsMod.AdaptiveButtons();
            var notifyCorrectCalled = false;
            buttons._notify = function(eventName) {
                if (eventName === 'selectedKeyChanged') {
                    notifyCorrectCalled = true;
                }
            };
            let event1 = {
                nativeEvent: {
                    button: 1
                }
            };
            buttons._options = {
                keyProperty: 'id'
            };
            buttons._visibleItems = items;
            buttons._position = 0;
            buttons._updateFilter = () => {};
            buttons._items = items;
            buttons._getTextWidth = () => 30;


            buttons._menuItemClickHandler(event1, [1]);
            assert.equal(notifyCorrectCalled, true);

            buttons.destroy();
        });
        it('_getTextWidth', function() {
            let sandbox = sinon.createSandbox();
            sandbox.replace(getFontWidthUtil, 'getFontWidth', () => 31.2);
            let maxWidth = adaptiveButtons._getTextWidth('text');
            assert.equal(maxWidth, 32);
            sandbox.restore();

            sandbox.replace(getFontWidthUtil, 'getFontWidth', () => 31.8);
            maxWidth = adaptiveButtons._getTextWidth('text');
            assert.equal(maxWidth, 32);
            sandbox.restore();
        });
        it('_updateFilter', function() {
            const adaptiveBtn = new tabsMod.AdaptiveButtons();
            adaptiveBtn._position = 3;
            adaptiveBtn._visibleItems = new collection.RecordSet({
                keyProperty: 'id',
                rawData: [
                    {
                        id: 1,
                        title: 'Первый'
                    },
                    {
                        id: 2,
                        title: 'Второй'
                    },
                    {
                        id: 3,
                        title: 'Третий'
                    },
                    {
                        id: 4,
                        title: 'Четвертый'
                    }
                ]
            });
            adaptiveBtn._items = new collection.RecordSet({
                keyProperty: 'id',
                rawData: [
                    {
                        id: 1,
                        title: 'Первый'
                    },
                    {
                        id: 2,
                        title: 'Второй'
                    },
                    {
                        id: 3,
                        title: 'Третий'
                    },
                    {
                        id: 4,
                        title: 'Четвертый'
                    },
                    {
                        id: 5,
                        title: 'Пятый'
                    },
                    {
                        id: 6,
                        title: 'Шестой'
                    }
                ]
            });
            const options4 = {
                selectedKey: 1,
                keyProperty: 'id'
            };
            adaptiveBtn._updateFilter(options4);
            assert.deepEqual(adaptiveBtn._filter, { id: [5, 6] });
            options4.selectedKey = 4;
            adaptiveBtn._updateFilter(options4);
            assert.deepEqual(adaptiveBtn._filter, { id: [4, 5, 6] });
        });
    });
});
