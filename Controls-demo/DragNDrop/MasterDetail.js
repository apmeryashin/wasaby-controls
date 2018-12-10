define('Controls-demo/DragNDrop/MasterDetail', [
   'Core/Control',
   'WS.Data/Entity/Model',
   'wml!Controls-demo/DragNDrop/MasterDetail/MasterDetail',
   'Controls-demo/DragNDrop/MasterDetail/Data',
   'WS.Data/Source/Memory',
   'Core/core-instance',
   'Controls/DragNDrop/Entity/List/Items',
   'Controls-demo/DragNDrop/MasterDetail/TasksEntity',
   'wml!Controls-demo/DragNDrop/MasterDetail/itemTemplates/masterItemTemplate',
   'css!Controls-demo/DragNDrop/MasterDetail/MasterDetail'
], function(Control, Model, template, data, Memory, cInstance, ListEntity, TasksEntity, itemTemplate) {
   return Control.extend({
      _template: template,
      gridColumns: [{
         displayProperty: 'name',
         width: '1fr',
         template: itemTemplate
      }],

      _initSource: function() {
         this._detailSource = new Memory({
            idProperty: 'id',
            data: data.detail
         });

         this._masterSource = new Memory({
            idProperty: 'id',
            data: data.master
         });
      },

      _beforeMount: function() {
         this._initSource();
         this._itemsReadyCallbackMaster = this._itemsReadyMaster.bind(this);
         this._itemsReadyCallbackDetail = this._itemsReadyDetail.bind(this);
      },

      _afterMount: function() {
         this._initSource();
      },

      _itemsReadyMaster: function(items) {
         this._itemsMaster = items;
      },

      _itemsReadyDetail: function(items) {
         this._itemsDetail = items;
      },

      _dragEnterMaster: function(event, entity) {
         return cInstance.instanceOfModule(entity, 'Controls-demo/DragNDrop/MasterDetail/TasksEntity');
      },

      _dragStartMaster: function(event, items) {
         var firstItem = this._itemsMaster.getRecordById(items[0]);

         return new ListEntity({
            items: items,
            mainText: firstItem.get('name')
         });
      },

      _dragStartDetail: function(event, items) {
         var firstItem = this._itemsDetail.getRecordById(items[0]);

         return new TasksEntity({
            items: items,
            mainText: firstItem.get('name'),
            image: firstItem.get('img'),
            additionalText: firstItem.get('shortMsg')
         });
      },

      _dragEndMaster: function(event, entity, target, position) {
         var
            item,
            targetId,
            items = entity.getItems();

         if (cInstance.instanceOfModule(entity, 'Controls-demo/DragNDrop/MasterDetail/TasksEntity')) {
            targetId = target.get('id');
            items.forEach(function(id) {
               item = this._itemsDetail.getRecordById(id);
               item.set('parent', targetId);
               this._detailSource.update(item);
            }, this);
            this._children.detailList.reload();
         } else {
            this._children.masterMover.moveItems(items, target, position);
         }
      },

      _dragEndDetail: function(event, entity, target, position) {
         this._children.detailMover.moveItems(entity.getItems(), target, position);
      }
   });
});
