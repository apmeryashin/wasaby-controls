define('js!SBIS3.CONTROLS.TreeViewMixin', ['js!SBIS3.CORE.Control', 'js!SBIS3.CONTROLS.Utils.TemplateUtil'], function (Control, TemplateUtil) {
   /**
    * Позволяет контролу отображать данные имеющие иерархическую структуру и работать с ними.
    * @mixin SBIS3.CONTROLS.TreeViewMixin
    * @public
    * @author Крайнов Дмитрий Олегович
    * @cssModifier controls-ListView__item-without-child Класс добавляется к визуальному представлению папки, у которой отсутствуют дочерние элементы.
    */

   var TreeViewMixin = /** @lends SBIS3.CONTROLS.TreeViewMixin.prototype */{
      $protected: {
         _options: {
            /**
             * @cfg {String} Устанавливает шаблон футера, который отображается в конце каждого узла иерархии.
             * @remark
             * Опция используется только в иерархических представлениях данных для того, чтобы создать футер в каждом узле иерархии.
             * В качестве значения опции можно передавать следующее:
             * <ul>
             *    <li>Вёрстку. Этот способ применяется редко, когда шаблон небольшой по содержимому.</li>
             *    <li>Шаблон. Этот способ применяется значительно чаще, чем передача вёрстки напрямую в опцию. Шаблон представляет собой XHTML-файл, в котором создана вёрстка футера.
             *    Создание отдельного шаблона позволяет использовать его в дальнейшем и в других компонентах. Шаблон должен быть создан внутри компонента в подпапке resources.
             *    Чтобы шаблон можно было использовать в опции, его нужно подключить в массив зависимостей компонента.</li>
             * </ul>
             * @example
             * В частном случае шаблон футера узла иерархии используют для размещения кнопок создания нового листа или папки.
             * ![](/folderFooterTpl.png)
             * Подробный пример использования футера для решения этой прикладной задачи вы можете найти в разделе {@link /doc/platform/developmentapl/interfacedev/components/list/list-settings/records-editing/edit-in-place/users/add-in-place-hierarchy/ Добавление по месту в иерархическом списке}.
             * @see SBIS3.CONTROLS.List#footerTpl
             */
            folderFooterTpl: undefined,
            /**
             * @cfg {String} Разрешено или нет перемещение элементов "Drag-and-Drop"
             * @variant "" Запрещено
             * @variant allow Разрешено
             * @variant onlyChangeOrder Разрешено только изменение порядка
             * @variant onlyChangeParent Разрешено только перемещение в папку
             * @example
             * <pre>
             *     <option name="itemsDragNDrop">onlyChangeParent</option>
             * </pre>
             */
            itemsDragNDrop: 'allow'
         }
      },
      /**
       * Разворачиваем элемент
       * @param expandedItem
       * @private
       */
      _onExpandItem: function(expandedItem) {
         this._createFolderFooter(expandedItem.getContents().getId());
         this._drawExpandedItem(expandedItem);
      },
      _drawExpandedItem: function(expandedItem) {
         //todo При переходе на Virtual DOM удалить работу с expandedItemContainer
         var expandedItemContainer = this._getItemsContainer().find('[data-hash="'+ expandedItem.getHash() + '"]');
         expandedItemContainer.find('.js-controls-TreeView__expand').addClass('controls-TreeView__expand__open');
         this._notify('onNodeExpand', expandedItem.getContents().getId(), expandedItemContainer);
      },
      /**
       * Сворачиваем элемент, а также всю его структуру
       * @param collapsedItem
       * @private
       */
      _onCollapseItem: function(collapsedItem) {
         var
            itemId = collapsedItem.getContents().getId(),
            collapsedItemContainer = this._getItemsContainer().find('[data-hash="'+ collapsedItem.getHash() + '"]');
         collapsedItemContainer.find('.js-controls-TreeView__expand').removeClass('controls-TreeView__expand__open');
         delete this._options.openedPath[itemId];
         //Уничтожим все дочерние footer'ы и footer узла
         this._destroyItemsFolderFooter([itemId]);
         this._notify('onNodeCollapse', itemId, collapsedItemContainer);
      },
      /**
       * Обработка смены у item'a состояния "развернутости"
       * @param item
       * @private
       */
      _onChangeItemExpanded: function(item) {
         this['_' + (item.isExpanded() ? 'onExpandItem' : 'onCollapseItem')](item);
      },
      /**
       * Найти $-элемент, который отвечает за переключение веток (ищет через closest класс js-controls-TreeView__expand). Используется при клике для определения необходимости переключения веток.
       * @param elem
       * @returns {*}
       * @private
       */
      _findExpandByElement: function(elem) {
         var
            closest;
         if (elem.hasClass('js-controls-TreeView__expand')) {
            return elem;
         } else {
            closest = elem.closest('.js-controls-TreeView__expand');
            return closest.length ? closest : elem;
         }
      },
      /**
       * Создает постраничную навигацию в ветках
       * @param key
       * @param container
       * @param more
       * @private
       */
      _createFolderPager: function(key, container, more) {
         var
            self = this,
            nextPage = this._hasNextPageInFolder(more, key);

         if (this._options.pageSize) {
            this._treePagers[key] = new TreePagingLoader({
               pageSize: this._options.pageSize,
               opener: this,
               parent: this,
               hasMore: nextPage,
               element: container,
               id: key,
               handlers: {
                  'onClick': function () {
                     self._folderLoad(this._options.id);
                  }
               }
            });
         }
      },
      /**
       * Проверяет наличие следующей страницы в ветке
       * @param more
       * @param id
       * @returns {boolean}
       * @private
       */
      _hasNextPageInFolder: function(more, id) {
         if (!id) {
            return typeof (more) !== 'boolean' ? more > (this._folderOffsets['null'] + this._options.pageSize) : !!more;
         }
         else {
            return typeof (more) !== 'boolean' ? more > (this._folderOffsets[id] + this._options.pageSize) : !!more;
         }
      },
      //********************************//
      //       FolderFooter_Start       //
      //********************************//
      /**
       * Создать футер для веток
       * @param key
       * @private
       */
      _createFolderFooter: function(key) {
         var template = this._getFolderFooterWrapper();
         this._destroyItemsFolderFooter([key]);
         if (typeof template === "function") {
            this._foldersFooters[key] = $(template(this._getFolderFooterOptions(key)));
         }
      },
      /**
       * Получить опции футера для ветки
       * @param key {String|int} идентификатор ветки для котрой будет построен футер
       * @returns options {Object} опции которые будут переданы в folderFooterTpl
       * @private
       */
      _getFolderFooterOptions: function(key) {
         /*Must be implemented!*/
      },
      _getFolderFooterWrapper: function() {
         /*Must be implemented!*/
      },
      /**
       * Удалить футер для веток
       * @param items
       * @private
       */
      _destroyItemsFolderFooter: function(keys) {
         var
            key,
            controls;
         for (var i = 0; i < keys.length; i++) {
            key = keys[i];
            if (this._foldersFooters[key]) {
               controls = this._foldersFooters[key].find('.ws-component');
               for (var j = 0; j < controls.length; j++) {
                  controls[j].wsControl.destroy();
               }
               this._foldersFooters[key].remove();
               delete this._foldersFooters[key];
            }
         }
      },
      _createAllFolderFooters: function() {
         $ws.helpers.forEach(this._options.openedPath, function(val, key) {
            //Рисуем футер, только если узел есть в проекции, иначе он скрыт и футер рисовать не нужно
            if (this._getItemProjectionByItemId(key)) {
               this._createFolderFooter(key);
            }
         },this);
      },
      //********************************//
      //        FolderFooter_End        //
      //********************************//
      _getLastChildByParent: function(itemsContainer, parent) {
         var
             lastContainer,
             currentContainer;
         currentContainer = $('.controls-ListView__item[data-hash="' + parent.getHash() + '"]', itemsContainer.get(0));
         while (currentContainer.length) {
            lastContainer = currentContainer;
            currentContainer =  $('.controls-ListView__item[data-parent-hash="' + currentContainer.attr('data-hash') + '"]', itemsContainer.get(0)).last();
         }
         return lastContainer;
      },
      instead: {
         _notifyOnDragMove: function(target, insertAfter) {
            //Если происходит изменение порядкового номера и оно разрешено или если происходит смена родителся и она разрешена, стрельнём событием
            if (typeof insertAfter === 'boolean' && this._options.itemsDragNDrop !== 'onlyChangeParent' || insertAfter === undefined && this._options.itemsDragNDrop !== 'onlyChangeOrder') {
               return this._notify('onDragMove', this.getCurrentElement().keys, target.data('id'), insertAfter) !== false;
            }
         }
      },
      around: {
         _onCollectionRemove: function(parentFunc, items, notCollapsed) {
            var i, item, itemId;
            for (i = 0; i < items.length; i++) {
               item = items[i];
               itemId = item.getContents().getId();
               if (!notCollapsed && item.isExpanded()) {
                  delete this._options.openedPath[itemId];
                  item.setExpanded(false);
                  this._destroyItemsFolderFooter([itemId]);
               }
            }
            return parentFunc.call(this, items);
         },
         /**
          * Проверяет, является ли $-элемент визуальным отображением элемента коллекции
          * @param parentFunc
          * @param elem
          * @returns {*|boolean}
          * @private
          */
         _isViewElement: function(parentFunc, elem) {
            return  parentFunc.call(this, elem) && !elem.hasClass('controls-HierarchyDataGridView__path') && !($ws.helpers.instanceOfModule(elem.wsControl(), 'SBIS3.CONTROLS.BreadCrumbs'));
         },
         /**
          * Обработка изменения item property
          * @param item
          * @param property
          * @private
          */
         _onUpdateItemProperty: function(parentFunc, item, property) {
            var ladderDecorator = this._options._decorators.getByName('ladder'),
                isIgnoreEnabled;
            if (ladderDecorator){
               isIgnoreEnabled = ladderDecorator.getIgnoreEnabled();
               ladderDecorator.setIgnoreEnabled(false);
            }
            if (property === 'expanded') {
               this._onChangeItemExpanded(item);
            }
            parentFunc.call(this, item, property);
            ladderDecorator && ladderDecorator.setIgnoreEnabled(isIgnoreEnabled);
         },
         _getDirectionOrderChange: function(parentFunc, e, target) {
            if (this._options.itemsDragNDrop !== 'onlyChangeParent') {
               return parentFunc.call(this, e, target);
            }
         }
      },

      before: {
         _keyboardHover: function (e) {
            switch (e.which) {
               case $ws._const.key.m:
                  e.ctrlKey && this.moveRecordsWithDialog();
                  break;
            }
         },
         _clearItems: function(container) {
            if (this._getItemsContainer().get(0) == $(container).get(0) || !container) {
               var self = this;
               this._lastParent = this._options._curRoot;
               this._lastDrawn = undefined;
               this._lastPath = [];
               this._destroySearchBreadCrumbs();
               $ws.helpers.forEach(this._foldersFooters, function(val, key) {
                  self._destroyItemsFolderFooter([key]);
               });
            }
         }
      },
      after : {
         _modifyOptions: function (opts) {
            opts.folderFooterTpl = TemplateUtil.prepareTemplate(opts.folderFooterTpl);
            return opts;
         }
      },
      _elemClickHandlerInternal: function (data, id, target) {
         var $target = $(target),
             nodeID = $target.closest('.js-controls-ListView__item').data('id'),
             closestExpand = this._findExpandByElement($(target));

         if (closestExpand.hasClass('js-controls-TreeView__expand')) {
            this.toggleNode(nodeID);
            /* Не вызываем активацию item'a при клике на чекбокс */
         } else if(!$target.hasClass('js-controls-ListView__itemCheckBox')) {
            if ((this._options.allowEnterToFolder) && ((data.get(this._options.hierField + '@')))){
               this.setCurrentRoot(nodeID);
               this.reload();
            }
            else {
               this._activateItem(id);
            }
         }
      },

      //Переопределяем метод, чтоб передать тип записи
      _activateItem : function(id) {
         var
            item = this._options._items.getRecordByKey(id),
            meta = {
               id: id,
               item: item,
               hierField : this._options.hierField
            };

         this._notify('onItemActivate', meta);
      }
   };

   var TreePagingLoader = Control.Control.extend({
      $protected :{
         _options : {
            id: null,
            pageSize : 20,
            hasMore : false
         }
      },
      $constructor : function(){
         this._container.addClass('controls-TreePager');
         this.setHasMore(this._options.hasMore);
      },
      setHasMore: function(more) {
         this._options.hasMore = more;
         if (this._options.hasMore) {
            this._container.html('Еще');
         }
         else {
            this._container.empty();
         }
      }
   });

   return TreeViewMixin;
});