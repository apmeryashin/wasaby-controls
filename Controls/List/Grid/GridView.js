define('Controls/List/Grid/GridView', [
   'Core/Deferred',
   'Core/IoC',
   'Controls/List/ListView',
   'wml!Controls/List/Grid/GridViewTemplateChooser',
   'wml!Controls/List/Grid/Item',
   'wml!Controls/List/Grid/Column',
   'wml!Controls/List/Grid/HeaderContent',
   'Core/detection',
   'wml!Controls/List/Grid/GroupTemplate',
   'wml!Controls/List/Grid/OldGridView',
   'wml!Controls/List/Grid/NewGridView',
   'wml!Controls/List/Grid/Header',
   'wml!Controls/List/Grid/Results',
   'wml!Controls/List/Grid/ColGroup',
   'css!theme?Controls/List/Grid/Grid',
   'css!theme?Controls/List/Grid/OldGrid',
   'Controls/List/BaseControl/Scroll/Emitter'
], function(cDeferred, IoC, ListView, GridViewTemplateChooser, DefaultItemTpl, ColumnTpl, HeaderContentTpl, cDetection,
   GroupTemplate, OldGridView, NewGridView) {

   'use strict';

   // todo: removed by task https://online.sbis.ru/opendoc.html?guid=728d200e-ff93-4701-832c-93aad5600ced
   function isEqualWithSkip(obj1, obj2, skipFields) {
      if ((!obj1 && obj2) || (obj1 && !obj2)) {
         return false;
      }
      if (!obj1 && !obj2) {
         return true;
      }
      if (obj1.length !== obj2.length) {
         return false;
      }
      for (var i = 0; i < obj1.length; i++) {
         for (var j in obj1[i]) {
            if (!skipFields[j] && obj1[i].hasOwnProperty(j)) {
               if (!obj2[i].hasOwnProperty(j) || obj1[i][j] !== obj2[i][j]) {
                  return false;
               }
            }
         }
      }
      return true;
   }

   var
      _private = {
         checkDeprecated: function(cfg) {
            // TODO: https://online.sbis.ru/opendoc.html?guid=837b45bc-b1f0-4bd2-96de-faedf56bc2f6
            if (cfg.showRowSeparator !== undefined) {
               IoC.resolve('ILogger').warn('IGridControl', 'Option "showRowSeparator" is deprecated and removed in 19.200. Use option "rowSeparatorVisibility".');
            }
            if (cfg.stickyColumn !== undefined) {
               IoC.resolve('ILogger').warn('IGridControl', 'Option "stickyColumn" is deprecated and removed in 19.200. Use "stickyProperty" option in the column configuration when setting up the columns.');
            }
         },
         prepareGridTemplateColumns: function(columns, multiselect) {
            var
               result = '';
            if (multiselect === 'visible' || multiselect === 'onhover') {
               result += 'auto ';
            }
            columns.forEach(function(column) {
               result += column.width ? column.width + ' ' : '1fr ';
            });
            return result;
         },
         prepareHeaderAndResultsIfFullGridSupport: function(resultsPosition, header, container) {
            var
               resultsPadding,
               cells;
   
            //FIXME remove container[0] after fix https://online.sbis.ru/opendoc.html?guid=d7b89438-00b0-404f-b3d9-cc7e02e61bb3
            container = container[0] || container;
            if (resultsPosition) {
               if (resultsPosition === 'top') {
                  if (header) {
                     resultsPadding = container.getElementsByClassName('controls-Grid__header-cell')[0].getBoundingClientRect().height + 'px';
                  } else {
                     resultsPadding = '0';
                  }
               } else {
                  resultsPadding = 'calc(100% - ' + container.getElementsByClassName('controls-Grid__results-cell')[0].getBoundingClientRect().height + 'px)';
               }
               cells = container.getElementsByClassName('controls-Grid__results-cell');
               Array.prototype.forEach.call(cells, function(elem) {
                  elem.style.top = resultsPadding;
               });
            }
         },
         calcFooterPaddingClass: function(params) {
            var
               paddingLeft,
               result = 'controls-GridView__footer controls-GridView__footer__paddingLeft_';
            if (params.multiSelectVisibility === 'onhover' || params.multiSelectVisibility === 'visible') {
               result += 'withCheckboxes';
            } else {
               if (params.itemPadding) {
                  paddingLeft = params.itemPadding.left;
               } else {
                  paddingLeft = params.leftSpacing || params.leftPadding;
               }
               result += (paddingLeft || 'default').toLowerCase();
            }
            return result;
         }
      },
      GridView = ListView.extend({
         _gridTemplate: null,
         isNotFullGridSupport: cDetection.isNotFullGridSupport,
         _template: GridViewTemplateChooser,
         _groupTemplate: GroupTemplate,
         _defaultItemTemplate: DefaultItemTpl,
         _headerContentTemplate: HeaderContentTpl,
         _prepareGridTemplateColumns: _private.prepareGridTemplateColumns,

         _beforeMount: function(cfg) {
            _private.checkDeprecated(cfg);
            this._gridTemplate = cDetection.isNotFullGridSupport ? OldGridView : NewGridView;
            GridView.superclass._beforeMount.apply(this, arguments);
            this._listModel.setColumnTemplate(ColumnTpl);
         },

         _beforeUpdate: function(newCfg) {
            GridView.superclass._beforeUpdate.apply(this, arguments);

            // todo removed by task https://online.sbis.ru/opendoc.html?guid=728d200e-ff93-4701-832c-93aad5600ced
            if (!isEqualWithSkip(this._options.columns, newCfg.columns, { template: true, resultTemplate: true })) {
               this._listModel.setColumns(newCfg.columns);
               if (!cDetection.isNotFullGridSupport) {
                  _private.prepareHeaderAndResultsIfFullGridSupport(this._listModel.getResultsPosition(), this._listModel.getHeader(), this._container);
               }
            }
            if (!isEqualWithSkip(this._options.header, newCfg.header, { template: true })) {
               this._listModel.setHeader(newCfg.header);
               if (!cDetection.isNotFullGridSupport) {
                  _private.prepareHeaderAndResultsIfFullGridSupport(this._listModel.getResultsPosition(), this._listModel.getHeader(), this._container);
               }
            }
            if (this._options.stickyColumn !== newCfg.stickyColumn) {
               this._listModel.setStickyColumn(newCfg.stickyColumn);
            }
            if (this._options.ladderProperties !== newCfg.ladderProperties) {
               this._listModel.setLadderProperties(newCfg.ladderProperties);
            }
            if (this._options.rowSeparatorVisibility !== newCfg.rowSeparatorVisibility) {
               this._listModel.setRowSeparatorVisibility(newCfg.rowSeparatorVisibility);
            }
            if (this._options.showRowSeparator !== newCfg.showRowSeparator) {
               this._listModel.setShowRowSeparator(newCfg.showRowSeparator);
            }
         },

         _calcFooterPaddingClass: function(params) {
            return _private.calcFooterPaddingClass(params);
         },

         _afterMount: function() {
            GridView.superclass._afterMount.apply(this, arguments);
            if (!cDetection.isNotFullGridSupport) {
               _private.prepareHeaderAndResultsIfFullGridSupport(this._listModel.getResultsPosition(), this._listModel.getHeader(), this._container);
            }
         }
      });

   GridView._private = _private;

   return GridView;
});
