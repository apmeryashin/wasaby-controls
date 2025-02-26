import {Service as HistoryService, FilterSource as HistorySource, Constants} from 'Controls/history';
import {factory} from 'Types/chain';
import * as CoreClone from 'Core/core-clone';
import {factory as CollectionFactory} from 'Types/collection';
import entity = require('Types/entity');
import collection = require('Types/collection');
import sourceLib = require('Types/source');
import Di = require('Types/di');
import coreInstance = require('Core/core-instance');
import {TKey} from 'Controls/_filter/View/interface/IFilterItem';
import {getStore} from 'Application/Env';

const HISTORY_SOURCE_STORAGE_ID = 'CONTROLS_HISTORY_SOURCE_STORE';

function createHistorySource(cfg) {
   const historySourceData = {
      historyId: cfg.historyId,
      pinned: true,

      /* A record about resets filters is stored in the history, but it is not necessary to display it in the
         history list.We request one more record, so that the number of records remains equal to 10 */
      recent: (Constants[cfg.recent] || Constants.MAX_HISTORY) + 1,
      favorite: cfg.favorite,
      dataLoaded: true,
      historyIds: cfg.historyIds
   };
   return new HistorySource({
      originSource: new sourceLib.Memory({
         keyProperty: 'id',
         data: []
      }),
      historySource: Di.isRegistered('demoSourceHistory') ? Di.resolve('demoSourceHistory', historySourceData)
         : new HistoryService(historySourceData)
   });
}

function getHistorySource(cfg) {
   const store = getStore(HISTORY_SOURCE_STORAGE_ID);
   let source = store.get(cfg.historyId);
   if (!source) {
      source = createHistorySource(cfg);
      store.set(cfg.historyId, source);
   }
   return source;
}

function loadHistoryItems(historyConfig) {
   const source = getHistorySource(historyConfig);
   const query = new sourceLib.Query().where({
      $_history: true
   });
   return source.query(query).then((dataSet) => {
      return new collection.RecordSet({
         rawData: dataSet.getAll().getRawData(),
         adapter: new entity.adapter.Sbis()
      });
   });
}

function isHistorySource(source) {
   return coreInstance.instanceOfModule(source, 'Controls/history:Source');
}

function deleteHistorySourceFromConfig(initConfig, sourceField) {
   const configs = CoreClone(initConfig);
   factory(configs).each((config) => {
      if (isHistorySource(config[sourceField])) {
         delete config[sourceField];
      }
   });
   return configs;
}

function createRecordSet(items, sourceRecordSet) {
   return items.value(CollectionFactory.recordSet, {
      adapter: sourceRecordSet.getAdapter(),
      keyProperty: sourceRecordSet.getKeyProperty(),
      format: sourceRecordSet.getFormat(),
      model: sourceRecordSet.getModel(),
      metaData: sourceRecordSet.getMetaData()
   });
}

function getUniqItems(items1, items2, keyProperty) {
   const resultItems = items1.clone();
   resultItems.prepend(items2);

   const uniqItems = factory(resultItems).filter((item, index) => {
      if (resultItems.getIndexByValue(keyProperty, item.get(keyProperty)) === index) {
         return item;
      }
   });
   return createRecordSet(uniqItems, items1);
}

function prependNewItems(oldItems, newItems, sourceController, keyProperty, folderId: TKey) {
   const allCount = oldItems.getCount();
   let uniqItems = getUniqItems(oldItems, newItems, keyProperty);

   if (sourceController && sourceController.hasMoreData('down', folderId)) {
      uniqItems = factory(uniqItems).first(allCount);
      uniqItems = createRecordSet(uniqItems, oldItems);
   }
   return uniqItems;
}

function getItemsWithHistory(oldItems, newItems, sourceController, source, keyProperty, folderId?: TKey) {
   let itemsWithHistory;
   const resultItems = prependNewItems(oldItems, newItems, sourceController, keyProperty, folderId);
   if (isHistorySource(source)) {
      itemsWithHistory = source.prepareItems(resultItems);
   } else {
      itemsWithHistory = resultItems;
   }
   return itemsWithHistory;
}

export {
   loadHistoryItems,
   getHistorySource,
   isHistorySource,
   getItemsWithHistory,
   getUniqItems,
   deleteHistorySourceFromConfig
};
