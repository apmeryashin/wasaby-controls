import {default as Lookup} from 'Controls/_lookup/MultipleInput';
import {Model} from 'Types/entity';
import {List} from 'Types/collection';
import {strictEqual, ok} from 'assert';
import * as getWidthUtil from 'Controls/sizeUtils';

function getItems(countItems: number): List<Model> {
   const items = [];
   for (; countItems; countItems--) {
      items.push(new Model({
         rawData: {id: countItems},
         keyProperty: 'id'
      }));
   }

   return new List({
      items
   });
}

describe('Controls/_lookup/MultipleInput/LookupView', () => {
   it('getAvailableWidthCollection', () => {
      const placeholderWidth = 35;
      const fieldWrapperWidth = 145;
      const lookupView = new Lookup();
      const originGetWidth = getWidthUtil.getWidth;
      const placeholder = 'testPlaceholder';
      // Избавимся от работы с версткой
      delete getWidthUtil.getWidth;
      getWidthUtil.getWidth = () => {
         return placeholderWidth;
      };
      delete lookupView._getFieldWrapperWidth;
      lookupView._getFieldWrapperWidth = () => {
         return  fieldWrapperWidth;
      };
      delete lookupView._initializeConstants;
      lookupView._initializeConstants = () => {/* FIXME: sinon mock */};

      lookupView._items =  getItems(3);
      strictEqual(lookupView._getAvailableWidthCollection({
         maxVisibleItems: 3,
         placeholder
      }), fieldWrapperWidth);

      lookupView._items =  getItems(2);
      strictEqual(lookupView._getAvailableWidthCollection({
         maxVisibleItems: 3,
         placeholder
      }), fieldWrapperWidth - placeholderWidth);
      getWidthUtil.getWidth = originGetWidth;
   });

   it('_calculateSizes', () => {
      const availableWidthCollection = 200;
      const lookupView = new Lookup({});

      lookupView._getAvailableWidthCollection = () => {
         return availableWidthCollection;
      };
      lookupView._items = getItems(2);
      lookupView._calculateSizes({
         maxVisibleItems: 5
      });
      strictEqual(lookupView._maxVisibleItems, 2);
      strictEqual(lookupView._availableWidthCollection, availableWidthCollection);
   });

   it('_isInputVisible', () => {
      const lookupView = new Lookup();

      lookupView._items = getItems(5);
      lookupView._options.maxVisibleItems = 5;
      ok(!lookupView._isInputVisible(lookupView._options));

      lookupView._options.maxVisibleItems = 6;
      ok(lookupView._isInputVisible(lookupView._options));

      lookupView._options.readOnly = true;
      ok(!!!lookupView._isInputVisible(lookupView._options));
   });

   it('_isNeedCalculatingSizes', () => {
      const lookupView = new Lookup();

      lookupView._items = getItems(0);
      ok(!lookupView._isNeedCalculatingSizes({}));

      lookupView._items = getItems(5);
      ok(lookupView._isNeedCalculatingSizes({}));

      lookupView._items = getItems(5);
      ok(!lookupView._isNeedCalculatingSizes({
         readOnly: true
      }));
   });

   it('showSelector retunrs boolean result', () => {
      const lookupView = new Lookup();
      let suggestClosed = false;
      lookupView.saveOptions({
         selectorTempalte: null
      });
      lookupView._children = {
         layout: {
            closeSuggest: () => {
               suggestClosed = true;
            }
         }
      };
      lookupView._suggestState = true;
      ok(lookupView.showSelector() === true);
      ok(!lookupView._suggestState);
      ok(suggestClosed);
   });
});
