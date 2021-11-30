/**
 * Created by am.gerasimov on 21.03.2018.
 */
import CoreExtend = require('Core/core-extend');
import collection = require('Types/collection');
import Deferred = require('Core/Deferred');
import sourceLib = require('Types/source');
import entity = require('Types/entity');
import {Serializer} from 'UI/State';
import {factory} from 'Types/chain';
import {isEqual} from 'Types/object';

const historyMetaFields = ['$_favorite', '$_pinned', '$_history', '$_addFromData'];
const DEFAULT_FILTER = '{}';

const _private = {
   isOldPinned(data) {
      return !JSON.parse(data, _private.getSerialize().desirialize)?.hasOwnProperty('linkText');
   },

   createRecordSet(data: object): collection.RecordSet {
       return new collection.RecordSet({
           rawData: data,
           keyProperty: 'ObjectId',
           adapter: 'adapter.sbis'
       });
   },

   deleteOldPinned(self, history, query) {
      const toDelete = [];
      const hSource = _private.getSourceByMeta(self, {$_pinned: true});
      factory(history.pinned).each((pinItem) => {
        if (!pinItem.get('ObjectData') || _private.isOldPinned(pinItem.get('ObjectData'))) {
           toDelete.push(new Promise((resolve) => {
              hSource.deleteItem(pinItem, {}).addCallback(() => {
                 resolve();
              });
           }));
        }
      });

      if (toDelete.length) {
         Promise.all(toDelete).then(() => {
            self.query(query);
         });
      }
      return !toDelete.length;
   },

   getSourceByMeta(self, meta) {
      for (const i in meta) {
         if (meta.hasOwnProperty(i)) {
            if (historyMetaFields.indexOf(i) !== -1) {
               return self.historySource;
            }
         }
      }
      return self.originSource;
   },

   deserialize(self, data) {
      return JSON.parse(data, this.getSerialize(self).deserialize);
   },

   initHistory(self, data) {
      if (data.getRow) {
         const rows = data.getRow();
         const pinned = rows.get('pinned');
         const recent = rows.get('recent');
         const frequent = rows.get('frequent');
         const client = rows.get('client');

         self._history = {
            pinned,
            recent
         };
         if (client) {
            self._history.client = client;
         } else if (frequent) {
            self._history.frequent = frequent;
         }
      } else {
         self._history = data;
      }
   },

   getItemsWithHistory(self, history) {
      const items = new collection.RecordSet({
         adapter: new entity.adapter.Sbis(),
         keyProperty: 'ObjectId'
      });

      this.addProperty(this, items, 'ObjectId', 'string', '');
      this.addProperty(this, items, 'ObjectData', 'string', '');
      this.addProperty(this, items, 'pinned', 'boolean', false);
      this.addProperty(this, items, 'client', 'boolean', false);

      if (self._history.client) {
         this.fillClient(self, history, items);
         this.fillFavoritePinned(self, history, items);
      }
      if (self.historySource._$pinned !== false) {
         this.fillPinned(self, history, items);
      }
      this.fillRecent(self, history, items);

      return items;
   },

   getRawItem(item, format) {
      const rawData = {
         d: [
            item.getId(),
            item.get('ObjectData'),
            item.get('HistoryId')
         ],
         s: [
            { n: 'ObjectId', t: 'Строка' },
            { n: 'ObjectData', t: 'Строка' },
            { n: 'HistoryId', t: 'Строка' }
         ]
      };
      return new entity.Model({
         rawData,
         adapter: item.getAdapter(),
         format
      });
   },

   fillItems(history, items, historyType, checkCallback) {
      let item;
      const filteredItems = factory(history).filter((element) => {
         return !items.getRecordById(element.getId()) && checkCallback(element);
      }).value();
      filteredItems.forEach((element) => {
         item = _private.getRawItem(element, items.getFormat());
         if (historyType === 'pinned') {
            item.set('pinned', true);
         } else if (historyType === 'client') {
            item.set('client', true);
         }
         items.add(item);
      });
   },

   fillFavoritePinned(self, history, items) {
      let isClient;
      _private.fillItems(history.pinned, items, 'pinned', (item) => {
         isClient = history.client.getRecordById(item.getId());

         // TODO Delete item, that pinned before new favorite.
         //  Remove after https://online.sbis.ru/opendoc.html?guid=68e3c08e-3064-422e-9d1a-93345171ac39
         const data = item.get('ObjectData');
         return !isClient && !_private.isOldPinned(data) && data !== DEFAULT_FILTER;
      });
   },

   fillPinned(self, history, items) {
      _private.fillItems(history.pinned, items, 'pinned', (item) => {
         return item.get('ObjectData') !== DEFAULT_FILTER;
      });
   },

   fillClient(self, history, items) {
      _private.fillItems(history.client, items, 'client', (item) => {
         return item.get('ObjectData') !== DEFAULT_FILTER;
      });
   },

   fillRecent(self, history, items) {
      const pinnedCount = self.historySource._$pinned !== false ? history.pinned.getCount() : 0;
      const maxLength = self.historySource._$recent - pinnedCount - 1;
      let currentCount = 0;
      let isPinned;

      _private.fillItems(history.recent, items, 'recent', (item) => {
         isPinned = history.pinned.getRecordById(item.getId());
         if (!isPinned && item.get('ObjectData') !== DEFAULT_FILTER) {
            currentCount++;
         }
         return !isPinned && currentCount <= maxLength && item.get('ObjectData') !== DEFAULT_FILTER;
      });
   },

   addProperty(self, record, name, type, defaultValue) {
      if (record.getFormat().getFieldIndex(name) === -1) {
         record.addField({
            name,
            type,
            defaultValue
         });
      }
   },

   updateFavorite(self, data, meta) {
      const hService = _private.getSourceByMeta(self, meta);
      const metaPin = {
         $_pinned: true,
         isClient: meta.isClient
      };

      if (self._history.client.getRecordById(data.getId()) && !meta.isClient) {
         // Update the local history data so as not to query to the history service
         _private.deleteClient(self, data);
         _private.updatePinned(self, data, metaPin);

         hService.deleteItem(data, { isClient: 1 });
      } else if (meta.isClient) {
         _private.addClient(self, data);
         hService.update(data, { $_pinned: false });
      } else if (!meta.isClient)  {
         _private.updatePinned(self, data, metaPin);
      }

      return hService.update(data, metaPin);
   },

   deleteClient(self, item) {
      const client = self._history.client;
      _private.deleteHistoryItem(client, item.getId());
      _private.deleteHistoryItem(self._history.recent, item.getId());
      _private.deleteHistoryItem(self._history.pinned, item.getId());

      self.historySource.saveHistory(self.historySource.getHistoryId(), self._history);
   },

   addClient(self, item) {
      const clientItem = self._history.client.getRecordById(item.getId());
      if (!clientItem) {
         self._history.client.add(_private.getRawHistoryItem(self, item.getId(), item.get('ObjectData'), item.get('HistoryId')));
      } else {
         _private.updateDataItem(clientItem, item.get('ObjectData'));
      }
   },

   updatePinned(self, item, meta) {
      const isPinned = !!meta.$_pinned;
      const pinned = self._history.pinned;
      item.set('pinned', isPinned);

      if (isPinned) {
         const pinItem = pinned.getRecordById(item.getId());
         if (pinItem) {
            _private.updateDataItem(pinItem, item.get('ObjectData'));
         } else {
            pinned.add(this.getRawHistoryItem(self, item.getId(), item.get('ObjectData'), item.get('HistoryId')));
         }
      } else if (!isPinned) {
         pinned.remove(pinned.getRecordById(item.getId()));
      }
      self.historySource.saveHistory(self.historySource.getHistoryId(), self._history);
   },

   updateDataItem(item, ObjectData) {
      item.set('ObjectData', ObjectData);
   },

    deleteHistoryItem(history, id) {
       const hItem = history.getRecordById(id);
       if (hItem) {
          history.remove(hItem);
       }
    },

   updateRecent(self, item) {
      const id = item.getId();
      const recent = self._history.recent;
      let records;

      _private.deleteHistoryItem(recent, id);

      records = [this.getRawHistoryItem(self, item.getId(), item.get('ObjectData'), item.get('HistoryId'))];
      recent.prepend(records);
      self.historySource.saveHistory(self.historySource.getHistoryId(), self._history);
   },

   getRawHistoryItem(self, id, objectData, hId?) {
      return new entity.Model({
         rawData: {
            d: [id, objectData, hId || self.historySource.getHistoryId()],
            s: [{
                  n: 'ObjectId',
                  t: 'Строка'
               },
               {
                  n: 'ObjectData',
                  t: 'Строка'
               },
               {
                  n: 'HistoryId',
                  t: 'Строка'
               }
            ]
         },
         adapter: self._history.recent.getAdapter()
      });
   },

   findHistoryItem(self, data) {
      const history = self._history;

      return this.findItem(self, history.pinned, data) || this.findItem(self, history.recent, data) || null;
   },

   findItem(self, items, data) {
      let item = null;
      let objectData;
      const deserialize = _private.getSerialize().deserialize;

      /* В значении фильтра могут быть сложные объекты (record, дата и т.д.)
       * При сериализации сложных объектов добавляется id инстанса и два одинаковых объекта сериализуются в разные строки,
       * поэтому сравниваем десериализованные объекты
       * */
      let itemData = JSON.parse(JSON.stringify(data, _private.getSerialize().serialize), deserialize);

      items.forEach((element) => {
         objectData = element.get('ObjectData');
         let deserializedData = objectData && JSON.parse(objectData, _private.getSerialize().deserialize);
         if (itemData && deserializedData) {
            /* В истории с отчетами есть prefetchParams, которые могут меняться, а структура - нет.
               сравниваем только ее. */
            itemData = itemData.items || itemData;
            deserializedData = deserializedData.items || deserializedData;
            if (isEqual(deserializedData, itemData)) {
               item = element;
            }
         }
      });
      return item;
   },

   // Serializer при сериализации кэширует инстансы по идентификаторам,
   // и при десериализации, если идентификатор есть в кэше, берёт инстанс оттуда
   // Поэтому, когда применяем фильтр из истории,
   // идентификатор в сериалайзере на клиенте может совпасть с идентификатором сохранённым в истории
   // и мы по итогу получим некорректный результат
   // Для этого всегда создаём новый инстанс Serializer'a
   getSerialize() {
      return new Serializer();
   },

   destroy(self, id: number|string): void {
      const recent = self._history && self._history.recent;

      if (recent) {
         _private.deleteHistoryItem(recent, id);
      }
   }
};

/**
 * Объект, который принимает данные из источника истории.
 * @class Controls/_history/FilterSource
 * @extends Core/core-extend
 * @mixes Types/_entity/OptionsToPropertyMixin
 *
 * @private
 * @author Герасимов А.М.
 * @example
 * <pre>
 *    var source = new filterSource({
 *           originSource: new Memory({
 *               keyProperty: 'id',
 *               data: []
 *           }),
 *           historySource: new historyService({
 *               historyId: 'TEST_FILTER_HISTORY_ID',
 *               dataLoaded: true
 *           })
 *       });
 * </pre>
 */

/*
 * A proxy that works only takes data from the history source
 * @class Controls/_history/FilterSource
 * @extends Core/core-extend
 * @mixes Types/_entity/OptionsToPropertyMixin
 *
 * @private
 * @author Герасимов А.М.
 * @example
 * <pre>
 *    var source = new filterSource({
 *           originSource: new Memory({
 *               keyProperty: 'id',
 *               data: []
 *           }),
 *           historySource: new historyService({
 *               historyId: 'TEST_FILTER_HISTORY_ID',
 *               dataLoaded: true
 *           })
 *       });
 * </pre>
 */

const Source = CoreExtend.extend([entity.OptionsToPropertyMixin], {
   _history: null,
   _serialize: false,
   '[Types/_source/ICrud]': true,

   constructor: function Memory(cfg) {
      this.originSource = cfg.originSource;
      this.historySource = cfg.historySource;
   },

   create(meta) {
      return _private.getSourceByMeta(this, meta).create(meta);
   },

   read(key, meta) {
      return _private.getSourceByMeta(this, meta).read(key, meta);
   },

   update(data, meta) {
      let serData;
      let item;

      if (meta.hasOwnProperty('$_pinned')) {
         _private.updatePinned(this, data, meta);
      }
      if (meta.hasOwnProperty('$_history')) {
         _private.updateRecent(this, data);
      }
      if (meta.hasOwnProperty('$_favorite')) {
         _private.updateFavorite(this, data, meta);
      }
      if (meta.hasOwnProperty('$_addFromData')) {
         item = _private.findHistoryItem(this, data);
         if (item) {
            meta = {
               $_history: true
            };
            _private.updateRecent(this, item);
            _private.getSourceByMeta(this, meta).update(item, meta);
            return Deferred.success(item.getId());
         }

         serData = JSON.stringify(data, _private.getSerialize(this).serialize);

         return _private.getSourceByMeta(this, meta).update(serData, meta).addCallback((dataSet) => {
            if (dataSet) {
                const hId = item ? item.get('HistoryId') : this.historySource.getHistoryId();
                _private.updateRecent(
                    this,
                    _private.getRawHistoryItem(this, dataSet.getRawData(), serData, hId)
                );
            }
            return dataSet?.getRawData() || '';
         });
      }
      return _private.getSourceByMeta(this, meta).update(data, meta);
   },

   remove(data, meta) {
      const hService = _private.getSourceByMeta(this, meta);
      if (meta.isClient) {
         _private.deleteClient(this, data);
         hService.deleteItem(data, { isClient: 0 });
      } else {
         _private.updatePinned(this, data, meta);
         _private.deleteHistoryItem(this._history.recent, data.getId());
      }
      hService.deleteItem(data, meta);
   },

   destroy(id: number|string, meta?: object): Deferred<null> {
      if (meta && meta.hasOwnProperty('$_history')) {
         _private.destroy(this, id);
      }

      return _private.getSourceByMeta(this, meta).destroy(id, meta);
   },

   query(query) {
      const where = query.getWhere();
      let newItems;

      if (where && where.$_history === true) {
         const prepareHistory = () => {
            newItems = _private.getItemsWithHistory(this, this._history);
            this.historySource.saveHistory(this.historySource.getHistoryId(), this._history);
            this._loadDef.callback(
                new sourceLib.DataSet({
                   rawData: newItems.getRawData(),
                   keyProperty: newItems.getKeyProperty()
                })
            );
         };

         if (!this._loadDef || this._loadDef.isReady()) {
            this._loadDef = new Deferred();

            this.historySource.query(query).addCallback((data) => {
               _private.initHistory(this, data);
               prepareHistory();
            }).addErrback((error): Promise<sourceLib.DataSet> => {
               _private.initHistory(this, new sourceLib.DataSet({
                  rawData: {
                      pinned: _private.createRecordSet({}),
                      frequent: _private.createRecordSet({}),
                      recent: _private.createRecordSet({})
                  }}));
               prepareHistory();
               error.processed = true;
               return error;
            });
         }
         return this._loadDef;
      }
      return this.originSource.query(query);
   },

   /**
    * Returns a set of items sorted by history
    * @returns {RecordSet}
    */
   getItems() {
      return _private.getItemsWithHistory(this, this._history);
   },

   /**
    * Returns a set of recent items
    * @returns {RecordSet}
    */
   getRecent() {
      return this._history.recent;
   },

   getPinned() {
      return this._history.pinned;
   },

   /**
    * Returns a deserialized history object
    * @returns {Object}
    */
   getDataObject(data) {
      return _private.deserialize(this, data.get('ObjectData'));
   },

   historyReady(): boolean {
      return !!this._history;
   }
});

Source._private = _private;

/**
 * @name Controls/_history/FilterSource#originSource
 * @cfg {Source} Источник данных.
 */

/*
 * @name Controls/_history/FilterSource#originSource
 * @cfg {Source} A data source
 */

/**
 * @name Controls/_history/FilterSource#historySource
 * @cfg {Source} Источник, который работает с историей.
 * @see {Controls/_history/Service} Источник, который работает с <a href="/doc/platform/developmentapl/middleware/input-history-service/">сервисом истории ввода</a>.
 */

/*
 * @name Controls/_history/FilterSource#historySource
 * @cfg {Source} A source which work with history
 * @see {Controls/_history/Service} Source working with the service of InputHistory
 */
export = Source;
