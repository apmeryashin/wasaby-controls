import {Memory} from 'Types/source';
import {RecordSet} from 'Types/collection';

function includes(collection, item) {
   if (typeof item === 'number') {
      item = String(item);
   }

   return collection.includes(item);
}

function getById(items, id) {
   for (let index = 0; index < items.length; index++) {
      if (items[index].id === id) {
         return items[index];
      }
   }
}

function getChildren(items, parent) {
   return items.filter(function(item) {
      return isChildByNode(item, items, parent);
   });
}

function isChildByNode(item, items, nodeId) {
   let isChild = nodeId === null || nodeId === undefined;

   if (!isChild) {
      for (let currentItem = item; currentItem.Раздел !== null; currentItem = getById(items, currentItem.Раздел)) {
         if (nodeId === currentItem.Раздел) {
            isChild = true;
            break;
         }
      }
   }

   return isChild;
}

function isSelected(item, items, selection) {
   const selected = selection.get('marked');

   return includes(selected, item.id) || getChildren(items, item.id).filter(function(item) {
         return includes(selected, item.id);
      }).length;
}

function getFullPath(items, currentRoot) {
   const path = [];

   for (let currentNode = getById(items, currentRoot); currentNode; currentNode = getById(items, currentNode.Раздел)) {
      path.push(currentNode);
   }

   return new RecordSet({
      rawData: path.reverse(),
      keyProperty: 'id'
   });
}

export default class extends Memory {
   query(query) {
      const items = this._$data;
      const filter = query.getWhere();
      const selection = filter.SelectionWithPath;
      const parent = filter.Раздел instanceof Array ? filter.Раздел[0] : filter.Раздел;

      if (selection) {
         const isAllSelected = selection.get('marked').includes(null) && selection.get('excluded').includes(null);

         query.where(function(item) {
            item = getById(items, item.get('id'));
            if (isSelected(item, items, selection) && isChildByNode(item, items, parent) ||
               isAllSelected && item.Раздел === null && !includes(selection.get('excluded'), item.id)) {

               return true;
            }
         });
      } else {
         query.where(function(item) {
            if (parent !== undefined) {
               return item.get('Раздел') === parent;
            } else {
               return item.get('Раздел') === null;
            }
         });
      }

      return super.query(...arguments).addCallback((data) => {
         const originalGetAll = data.getAll;

         data.getAll = function() {
            const result = originalGetAll.apply(this, arguments);
            const meta = result.getMetaData();

            if (parent !== undefined && parent !== null) {
               meta.path = getFullPath(items, parent);
               result.setMetaData(meta);
            }

            return result;
         };

         return data;
      });
   }
}
