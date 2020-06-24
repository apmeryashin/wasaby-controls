define(['Controls/grid'], function(gridMod) {
   var
      theme = 'default',
      gridColumns = [
         {
            displayProperty: 'title'
         },
         {
            displayProperty: 'price',
            width: 'auto'
         },
         {
            displayProperty: 'balance',
            width: '100px'
         },
         {
            displayProperty: 'rest',
            width: '1fr'
         }
      ],
      gridHeader = [
         {
            title: '',
            style: 'default',
            startRow: 1,
            endRow: 3,
            startColumn: 1,
            endColumn: 2
         },
         {
            title: 'Цена',
            align: 'right',
            style: 'default',
            sortingProperty: 'price',
            startRow: 1,
            endRow: 2,
            startColumn: 2,
            endColumn: 3
         },
         {
            title: 'Остаток',
            align: 'right',
            style: 'default',
            startRow: 1,
            endRow: 2,
            startColumn: 3,
            endColumn: 4
         },
         {
            title: 'Что-то',
            align: 'right',
            style: 'default',
            startRow: 2,
            endRow: 3,
            startColumn: 2,
            endColumn: 3
         },
         {
            title: 'еще',
            align: 'right',
            style: 'default',
            startRow: 2,
            endRow: 3,
            startColumn: 3,
            endColumn: 4
         }
      ],
      preparedColumnsWithMultiselect = 'grid-template-columns: max-content 1fr auto 100px 1fr;',
      preparedColumnsWithoutMiltiselect = 'grid-template-columns: 1fr auto 100px 1fr;',
      fakeSelf = {
         _options: {
            listModel: {
               getDragItemData: function() {
                  return null;
               }
            }
         }
      };

   describe('Controls.List.Grid.GridView', function() {
      it('GridView.prepareGridTemplateColumns', function() {
         assert.equal(preparedColumnsWithMultiselect, gridMod.GridView._private.getGridTemplateColumns(fakeSelf, gridColumns, true),
            'Incorrect result "prepareGridTemplateColumns with checkbox".');
         assert.equal(preparedColumnsWithoutMiltiselect, gridMod.GridView._private.getGridTemplateColumns(fakeSelf, gridColumns, false),
            'Incorrect result "prepareGridTemplateColumns without checkbox".');
      });
      it('Footer', function() {
         var
             cfg = {
                columns: [
                   { displayProperty: 'field1', template: 'column1' },
                   { displayProperty: 'field2', template: 'column2' }
                ],
                multiSelectVisibility: 'onhover',
                itemPadding: {
                   left: 'S'
                },
                theme
             },
             gridView = new gridMod.GridView(cfg);

         gridView.saveOptions(cfg);


         assert.equal(gridView._getFooterClasses(), 'controls-GridView__footer controls-GridView__footer__paddingLeft_withCheckboxes_theme-default');

         gridView._options.multiSelectVisibility = 'visible';
         assert.equal(gridView._getFooterClasses(), 'controls-GridView__footer controls-GridView__footer__paddingLeft_withCheckboxes_theme-default');

         gridView._options.multiSelectVisibility = 'hidden';
         assert.equal(gridView._getFooterClasses(), 'controls-GridView__footer controls-GridView__footer__paddingLeft_s_theme-default');

         gridView._options.itemPadding = undefined;
         assert.equal(gridView._getFooterClasses(), 'controls-GridView__footer controls-GridView__footer__paddingLeft_default_theme-default');
      });
      it('beforeUpdate', function() {
         var
            superclassBeforeUpdateCalled = false,
            cfg = {
               columns: [
                  { displayProperty: 'field1', template: 'column1' },
                  { displayProperty: 'field2', template: 'column2' }
               ]
            },
            gridView = new gridMod.GridView(cfg),
            superclassBeforeUpdate = gridMod.GridView.superclass._beforeUpdate;
         gridView.saveOptions(cfg);
         gridMod.GridView.superclass._beforeUpdate = function() {
            superclassBeforeUpdateCalled = true;
            superclassBeforeUpdate.apply(this, arguments);
         };
         gridView._beforeUpdate(cfg);
         gridMod.GridView.superclass._beforeUpdate = superclassBeforeUpdate;
         assert.isTrue(superclassBeforeUpdateCalled, 'Superclass method not called in "_beforeUpdate".');
         gridView._listModel = {
            _isMultiHeader: true,
            setHeader: () => null,
         };
         let isColumnScrollChanged = false;
         gridView._listModel.setColumnScroll = () => { isColumnScrollChanged = true; }
         gridView._beforeUpdate({ ...cfg, columnScroll: true });
         assert.isTrue(isColumnScrollChanged);

      });
      it('afterMount', function() {
         var
            cfg = {
               columns: [
                  { displayProperty: 'field1', template: 'column1' },
                  { displayProperty: 'field2', template: 'column2' }
               ]
            },
            gridView = new gridMod.GridView(cfg);

            gridView.saveOptions(cfg);
            gridView._options.header = [{}, {}, {}]
            let setHeightWasCalled = false
            gridView._isHeaderChanged = false;
            gridView._afterMount = () => {
               if (gridView._options.header && gridView._listModel._isMultiHeader && gridView._listModel.isStickyHeader()) {
                  gridView._listModel.setHeaderCellMinHeight(gridView._setHeaderWithHeight());
               }
               gridView._isHeaderChanged = true
            }

            gridView._listModel = {
               _isMultiHeader: true,
               isStickyHeader: () => true,
               setHeaderCellMinHeight: (header) => header.length,
               _isMultiHeader: true,
               isDrawHeaderWithEmptyList: () => true
            }
            gridView._setHeaderWithHeight = () => {
               setHeightWasCalled = true;
               return [{}, {}, {}, {}]
            }
            gridView._afterMount();
            assert.isTrue(gridView._isHeaderChanged);
      });

      it('update resultsVisibility', function() {
         const cfg = {
               columns: [
                  { displayProperty: 'field1', template: 'column1' },
                  { displayProperty: 'field2', template: 'column2' }
               ],
               resultsVisibility: 'visible'
            };
         const gridView = new gridMod.GridView(cfg);
         const listModel = {
            resultsVisibility: 'visible',
            setResultsVisibility(resultsVisibility) {
               this.resultsVisibility = resultsVisibility;
            }
         };
         gridView.saveOptions(cfg);
         gridView._listModel = listModel;
         gridView._beforeUpdate({...cfg, resultsVisibility: 'hidden'});
         assert.equal(gridView._listModel.resultsVisibility, 'hidden');
      });

      it('resultPosition update', function(){
         let gridView = new gridMod.GridView({resultsPosition: 'top'});
         let setResultPosinionCalled = false;
         gridView._listModel = {setResultsPosition: function() {
               setResultPosinionCalled = true;
            }};
         gridView._beforeUpdate({resultsPosition: 'bottom'});
         assert.isTrue(setResultPosinionCalled, 'setPesultPosinion');
      });

      it('getGridTemplateColumns', function () {
         var
             columns = [
                {displayProperty: 'field1', width: '1fr'},
                {displayProperty: 'field2', width: 'auto'},
                {displayProperty: 'field3'},
             ];

         assert.equal(gridMod.GridView._private.getGridTemplateColumns(fakeSelf, columns, true), 'grid-template-columns: max-content 1fr auto 1fr;');
         assert.equal(gridMod.GridView._private.getGridTemplateColumns(fakeSelf, columns, false), 'grid-template-columns: 1fr auto 1fr;');
      });

      describe('getHeaderHeight', () => {
         const cfg = {
            columns: [
               { displayProperty: 'field1', template: 'column1' },
               { displayProperty: 'field2', template: 'column2' }
            ],
            header: gridHeader,
            multiSelectVisibility: 'hidden',
         };
         let gridView;
         beforeEach(() => {
            gridView = new gridMod.GridView(cfg);
             gridView._children.header = {};
             gridView._listModel = {};
         });


         it('no headerContainer', function () {
             gridView._children.header = null;
            assert.equal(0, gridView.getHeaderHeight());
         });

         it('simple header', function () {
            const headerHeight = 30;
             gridView._children.header.getBoundingClientRect = () => ({ height: headerHeight });
            gridView._listModel._isMultiHeader = false;
            assert.equal(headerHeight, gridView.getHeaderHeight());
         });

         it('empty multi header', function () {
            gridView._listModel._isMultiHeader = true;
            // No header cells
            gridView._children.header.children = [];
            assert.equal(0, gridMod.GridView._private.getMultiHeaderHeight(gridView._children.header));
         });

         it('multi header', function () {
            gridView._listModel._isMultiHeader = true;
            gridView._children.header.children = [
               { top: 0, bottom: 10 },
               { top: 10, bottom: 20 },
               { top: 20, bottom: 30 },
               { top: 0, bottom: 30 },
               { top: 0, bottom: 15 },
               { top: 15, bottom: 30 }
            ];
            assert.equal(30, gridMod.GridView._private.getMultiHeaderHeight(gridView._children.header, (cell) => ({
               top: cell.top,
               bottom: cell.bottom
            })));
         });
      });

      it('getResultsHeight and getHeaderHeight', function() {
         const cfg = {
                columns: [
                   { displayProperty: 'field1', template: 'column1' },
                   { displayProperty: 'field2', template: 'column2' }
                ],
                header: gridHeader,
                resultsPosition: 'top',
                multiSelectVisibility: 'hidden',
             };
         const gridView = new gridMod.GridView(cfg);
         gridView._listModel = {
            isDrawHeaderWithEmptyList: function() {
               return true
            }
         };
         gridView._children.header = {
            getBoundingClientRect: () => ({ height: 40 })
         }
         gridView._children.results = {
            getBoundingClientRect: () => ({ height: 20 })
         }
         gridView.saveOptions(cfg);
         assert.equal(40, gridView.getHeaderHeight());
         assert.equal(20, gridView.getResultsHeight());

         gridView._listModel = {
            isDrawHeaderWithEmptyList: function() {
               return false
            }
         };
         gridView._children.header = undefined;
         gridView._children.results = undefined;

         assert.equal(0, gridView.getHeaderHeight());
         assert.equal(0, gridView.getResultsHeight());

      });
      it('resize on list changed with column scroll', function() {
         let cfg = {
               columns: [
                  { displayProperty: 'field1', template: 'column1' },
                  { displayProperty: 'field2', template: 'column2' }
               ]
            },
            gridView = new gridMod.GridView(cfg),
            columnScrollResizeHandlerCalled = false,
            updateShadowStyleCalled = false,
            controlResizeNotified = false;
         gridView._columnScrollController = {
            updateSizes(c) {
               columnScrollResizeHandlerCalled = true;
               c({
                  contentSizeForScrollBar: 100,
                  scrollWidth: 80
               });
            }
         };
         gridView._updateColumnScrollData = () => {
            updateShadowStyleCalled = true;
         };

         gridView.resizeNotifyOnListChanged();
         assert.isTrue(columnScrollResizeHandlerCalled);
         assert.isTrue(updateShadowStyleCalled);
      });

      it('itemClick sends right args', function() {
         const cfg = {
            multiSelectVisibility: 'visible',
            columns: [
               { displayProperty: 'field1', template: 'column1' },
               { displayProperty: 'field2', template: 'column2' }
            ]
         };
         const gridView = new gridMod.GridView(cfg);

         let isEventRaised = false;
         let isNativeStopped = false;
         const fakeEvent = {
            stopImmediatePropagation() {
               isNativeStopped = true;
            },
            target: {
               closest: (selector) => {
                  if (selector === '.controls-Grid__row') {
                     return {
                        querySelectorAll: () => ['multiselect', 0, 1]
                     };
                  }
                  if (selector === '.controls-Grid__row-cell') {
                     return 1;
                  }
               }
            }
         };
         const item = {};
         const fakeDispItem = {
            getContents: () => item
         };
         gridView._notify = function (e, args) {
            if (e === 'itemClick') {
               isEventRaised = true;
               assert.equal(args[0], item);
               assert.equal(args[1], fakeEvent);
               assert.equal(args[2], 1);
            }
         };
         gridView._onItemClick(fakeEvent, fakeDispItem);
         assert.isTrue(isEventRaised);
         assert.isTrue(isNativeStopped);
      });

      describe('editArrowClick', function() {
         it('click on editArrow stops click event', function() {
            let cfg = {
                   columns: [
                      { displayProperty: 'field1', template: 'column1' },
                      { displayProperty: 'field2', template: 'column2' }
                   ]
                };
            let gridView = new gridMod.GridView(cfg);
            let clickEvent = {
               stopped: false,
               stopPropagation: function() {
                  this.stopped = true;
               }
            };
            let editArrowClickNotified = false;
            gridView._notify = function (e) {
               if (e === 'editArrowClick') {
                  editArrowClickNotified = true;
               }
            }
            gridView._onEditArrowClick(clickEvent);
            assert.isTrue(clickEvent.stopped);
            assert.isTrue(editArrowClickNotified);
         });
      });

      it('set columns and header on mount', function () {
         const cfg = {
            multiSelectVisibility: 'hidden',
            columns: [
               { displayProperty: 'field1', template: 'column1' },
               { displayProperty: 'field2', template: 'column2' }
            ]
         };
         const gridView = new gridMod.GridView(cfg);
         const calledMethods = [];
         gridView.saveOptions(cfg);
         gridView._listModel = {
            setBaseItemTemplateResolver: () => {},
            setColumnTemplate: () => {},
            setColumns: (opts, silent) => {calledMethods.push(['setColumns', silent])},
            setHeader: (opts, silent) => {calledMethods.push(['setHeader', silent])}
         };
         gridView._beforeMount(cfg);

         assert.deepEqual(calledMethods, [['setColumns', true], ['setHeader', true]]);
      });

      it('createDragScroll if allowed (no dnd)', () => {
         const cfg = {
            multiSelectVisibility: 'visible',
            columnScroll: true,
            itemsDragNDrop: true,
            columns: [
               { displayProperty: 'field1', template: 'column1' },
               { displayProperty: 'field2', template: 'column2' }
            ]
         };
         const gridView = new gridMod.GridView(cfg);
         gridView.saveOptions(cfg);
         gridView._listModel = {
            setBaseItemTemplateResolver: () => {},
            setColumnTemplate: () => {},
            setColumns: () => {},
            setHeader: () => {}
         };
         gridView._beforeMount(cfg);
         assert.isDefined(gridView._columnScrollController);
         assert.isUndefined(gridView._dragScrollController);
      });

      it('should call dragscroll only if column scroll enabled', function () {
         const cfg = {
            multiSelectVisibility: 'visible',
            columns: [
               { displayProperty: 'field1', template: 'column1' },
               { displayProperty: 'field2', template: 'column2' }
            ]
         };
         const gridView = new gridMod.GridView(cfg);
         const calledMethods = [];
         gridView._dragScrollController = {};

         [
            'onViewMouseDown',
            'onViewTouchStart',
            'onViewMouseMove',
            'onViewTouchMove',
            'onViewMouseUp',
            'onViewTouchEnd',
            'onOverlayMouseMove',
            'onOverlayTouchMove',
            'onOverlayMouseUp',
            'onOverlayTouchEnd',
            'onOverlayMouseLeave'
         ].forEach((methodName) => {
            gridView._dragScrollController[methodName] = () => {
               calledMethods.push(methodName);
            };
         });

         gridView._startDragScrolling({}, 'mouse');
         gridView._startDragScrolling({}, 'touch');
         gridView._moveDragScroll({}, 'mouse');
         gridView._moveDragScroll({}, 'touch');
         gridView._stopDragScrolling({}, 'mouse');
         gridView._stopDragScrolling({}, 'touch');

         assert.deepEqual(calledMethods, []);
      });

      it('should update column scroll sizes if options has been changed (only once per lifecycle)', function () {
         const cfg = {
            multiSelectVisibility: 'hidden',
            stickyColumnsCount: 1,
            columns: [
               { displayProperty: 'field1', template: 'column1' },
               { displayProperty: 'field2', template: 'column2' }
            ]
         };
         const gridView = new gridMod.GridView(cfg);
         gridView.saveOptions(cfg);
         const calledMethods = [];
         gridView._columnScrollController = {
            setStickyColumnsCount: () => {calledMethods.push('setStickyColumnsCount')},
            setMultiSelectVisibility: () => {calledMethods.push('setMultiSelectVisibility')},
            updateSizes: () => {calledMethods.push('updateSizes')}
         };

         gridView._afterUpdate({...cfg, multiSelectVisibility: 'visible', stickyColumnsCount: 2});
         assert.deepEqual(calledMethods, ['setStickyColumnsCount', 'setMultiSelectVisibility', 'updateSizes']);
      });
   });

});
