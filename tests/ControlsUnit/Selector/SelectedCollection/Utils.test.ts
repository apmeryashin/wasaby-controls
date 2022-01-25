import {getItemMaxWidth, getVisibleItems} from 'Controls/_lookup/SelectedCollection/Utils';
import {equal} from 'assert';
import {RecordSet} from 'Types/collection';

describe('Controls/_lookup/SelectedCollection/Utils', () => {
   it('getItemMaxWidth', () => {
      equal(getItemMaxWidth(0, 4, 1, 'oneRow', 20), undefined);
      equal(getItemMaxWidth(0, 4, 2, 'oneRow', 20), undefined);
      equal(getItemMaxWidth(0, 4, 2, 'default', 30), 'calc(100% - 30px);');
      equal(getItemMaxWidth(1, 4, 2, 'default', 30), undefined);
   });
   it('getItemMaxWidth', () => {
      const rs = new RecordSet({
         rawData: [
            {
               id: 0
            },
            {
               id: 1
            },
            {
               id: 2
            },
            {
               id: 3
            }
         ],
         keyProperty: 'id'
      });
      equal(getVisibleItems({items: rs}).length, 4);
      equal(getVisibleItems({items: rs, maxVisibleItems: 2}).length, 2);
      equal(getVisibleItems({items: rs, maxVisibleItems: 2, multiLine: true}).length, 2);
      equal(getVisibleItems({items: rs, maxVisibleItems: 2, itemsLayout: 'twoColumns'}).length, 4);
   });
});
