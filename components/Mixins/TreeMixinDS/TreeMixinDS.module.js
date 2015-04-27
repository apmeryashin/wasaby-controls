define('js!SBIS3.CONTROLS.TreeMixinDS', [], function () {

   var treeExpandMap = {
      'onlyFolders': 'Только узлы',
      'items': 'Только листья',
      'folders': 'С узлами и листьями'
   };

   /**
    * Позволяет контролу отображать данные имеющие иерархическую структуру и работать с ними.
    * @mixin SBIS3.CONTROLS.TreeMixinDS
    */
   var TreeMixinDS = /** @lends SBIS3.CONTROLS.TreeMixinDS.prototype */{
      $protected: {
         _curLvl : null,
         _ulClass: 'controls-TreeView__list',
         _options: {
            /**
             * @cfg {Boolean} При открытия узла закрывать другие
             * @noShow
             */
            singleExpand: '',

            /**
             * Опция задаёт режим разворота.
             * @variant '' Без разворота
             * @variant items Только листья
             * @variant onlyFolders Только узлы
             * @variant folders С узлами и листьями
             */
            expand: ''

         }
      },


      _redraw: function () {
         this._clearItems();
         var
            self = this,
            DataSet = this._dataSet;

         /*TODO вынести середину в переопределяемый метод*/

         this.hierIterate(DataSet, function (record, parent, lvl) {
            var
               parentKey = self.getParentKey(DataSet, record);

            this._curLvl = lvl;

            if ((parentKey == self._options.root)) {
               self._drawItem(record, undefined);
            }
         });

         self.reviveComponents().addCallback(function () {
            self._notify('onDrawItems');
            self._drawItemsCallback();
         });

      },

      /**
       * Закрыть определенный узел
       * @param {String} key Идентификатор раскрываемого узла
       */
      closeNode: function (key) {
         var itemCont = $('.controls-ListView__item[data-id="' + key + '"]', this.getContainer().get(0));
         $('.js-controls-TreeView__expand', itemCont).removeClass('controls-TreeView__expand__open');
         this._nodeClosed(key);
      },

      /**
       * Закрыть или открыть определенный узел
       * @param {String} key Идентификатор раскрываемого узла
       */

      toggleNode: function (key) {
         var itemCont = $('.controls-ListView__item[data-id="' + key + '"]', this.getContainer().get(0));
         if ($('.js-controls-TreeView__expand', itemCont).hasClass('controls-TreeView__expand__open')) {
            this.closeNode(key);
         }
         else {
            this.openNode(key);
         }
      },

      before: {
         openNode: function () {
            if (this._options.expand) {
               this._filter = this._filter || {};
               this._filter['Разворот'] = 'С разворотом';
               this._filter['ВидДерева'] = treeExpandMap[this._options.expand];
            }
         }
      },

      _nodeDataLoaded : function(key, dataSet) {
         console.log('_nodeDataLoaded TreeMixinDS');
         var
            self = this,
            itemCont = $('.controls-ListView__item[data-id="' + key + '"]', this.getContainer().get(0));
         $('.js-controls-TreeView__expand', itemCont).first().addClass('controls-TreeView__expand__open');

         dataSet.each(function (record) {
            var targetContainer = self._getTargetContainer(record);
            if (targetContainer) {
               self._drawItem(record, targetContainer);
            }
         });
      },

      _nodeClosed : function(key) {

      }
   };

   return TreeMixinDS;

});